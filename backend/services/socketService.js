const { ChatMessage } = require('../models/index');

const initSocket = (io) => {
  const usersEnLigne = new Map(); // socketId → { userId, nom, salon }

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connecté: ${socket.id}`);

    // Rejoindre un salon
    socket.on('joinRoom', ({ room, userId, nom }) => {
      socket.join(room);
      usersEnLigne.set(socket.id, { userId, nom, salon: room });

      const usersRoom = [...usersEnLigne.values()].filter(u => u.salon === room);
      io.to(room).emit('roomUsers', usersRoom);

      socket.to(room).emit('chatMessage', {
        type: 'systeme',
        contenu: `${nom} a rejoint le salon`,
        createdAt: new Date()
      });
    });

    // Quitter un salon
    socket.on('leaveRoom', ({ room }) => {
      socket.leave(room);
    });

    // Envoyer un message
    socket.on('sendMessage', async ({ room, content, type = 'texte', auteurId, auteurNom }) => {
      try {
        const msg = await ChatMessage.create({
          auteur: auteurId,
          salon: room,
          contenu: content,
          type
        });

        const msgPopule = await msg.populate('auteur', 'nom avatar');

        io.to(room).emit('chatMessage', {
          _id: msg._id,
          contenu: msg.contenu,
          type: msg.type,
          auteur: { _id: auteurId, nom: auteurNom },
          createdAt: msg.createdAt
        });
      } catch (err) {
        console.error('Erreur envoi message:', err);
      }
    });

    // Indicateur de frappe
    socket.on('typing', ({ room, nom, isTyping }) => {
      socket.to(room).emit('userTyping', { nom, isTyping });
    });

    // Réaction à un message
    socket.on('react', async ({ messageId, emoji, room, userId }) => {
      const msg = await ChatMessage.findById(messageId);
      if (msg) {
        const reaction = msg.reactions.find(r => r.emoji === emoji);
        if (reaction) {
          if (!reaction.utilisateurs.includes(userId)) reaction.utilisateurs.push(userId);
        } else {
          msg.reactions.push({ emoji, utilisateurs: [userId] });
        }
        await msg.save();
        io.to(room).emit('reactionUpdated', { messageId, reactions: msg.reactions });
      }
    });

    // Rejoindre canal province
    socket.on('joinProvince', ({ province, userId }) => {
      socket.join(`province:${province}`);
    });

    // Déconnexion
    socket.on('disconnect', () => {
      const user = usersEnLigne.get(socket.id);
      if (user) {
        usersEnLigne.delete(socket.id);
        io.to(user.salon).emit('roomUsers', [...usersEnLigne.values()].filter(u => u.salon === user.salon));
      }
    });
  });

  // Fonctions utilitaires exportées
  return {
    emitToProvince: (province, event, data) => io.to(`province:${province}`).emit(event, data),
    emitToAll: (event, data) => io.emit(event, data),
    emitToUser: (userId, event, data) => io.to(`user:${userId}`).emit(event, data)
  };
};

module.exports = { initSocket };
