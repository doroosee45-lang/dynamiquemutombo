import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore, useSocketStore } from '../store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SALONS = [
  { id: 'global', label: '🌍 Global', desc: 'Discussion générale' },
  { id: 'securite', label: '🔒 Sécurité', desc: 'Sécurité & ordre' },
  { id: 'transport', label: '🚌 Transport', desc: 'Transports publics' },
  { id: 'corruption', label: '💰 Corruption', desc: 'Dénoncer la corruption' },
  { id: 'innovations', label: '💡 Innovations', desc: 'Idées & projets' },
];

export default function Chat() {
  const { user, isAuthenticated } = useAuthStore();
  const { socket, connect, connected } = useSocketStore();
  const [salon, setSalon] = useState('global');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [usersOnline, setUsersOnline] = useState([]);
  const [typing, setTyping] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Charger historique
  const { data: history } = useQuery({
    queryKey: ['chat', salon],
    queryFn: () => api.get(`/chat/${salon}`).then(r => r.data),
    onSuccess: (d) => setMessages(d.messages || [])
  });

  useEffect(() => {
    if (history?.messages) setMessages(history.messages);
  }, [history]);

  // Socket connection
  useEffect(() => {
    if (isAuthenticated && !connected) {
      connect(user?._id, user?.nom);
    }
  }, [isAuthenticated]);

  // Rejoindre salon
  useEffect(() => {
    if (socket && connected && user) {
      socket.emit('joinRoom', { room: salon, userId: user._id || user.id, nom: user.nom });

      socket.on('chatMessage', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socket.on('roomUsers', (users) => setUsersOnline(users));

      socket.on('userTyping', ({ nom, isTyping }) => {
        setTyping(isTyping ? nom : null);
      });

      return () => {
        socket.off('chatMessage');
        socket.off('roomUsers');
        socket.off('userTyping');
      };
    }
  }, [socket, connected, salon]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const changerSalon = (newSalon) => {
    if (socket && connected) {
      socket.emit('leaveRoom', { room: salon });
      socket.emit('joinRoom', { room: newSalon, userId: user?._id || user?.id, nom: user?.nom });
    }
    setSalon(newSalon);
    setMessages([]);
  };

  const envoyerMessage = () => {
    if (!message.trim() || !socket || !connected || !isAuthenticated) return;
    socket.emit('sendMessage', {
      room: salon,
      content: message.trim(),
      auteurId: user?._id || user?.id,
      auteurNom: user?.nom
    });
    setMessage('');
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (socket && connected) {
      socket.emit('typing', { room: salon, nom: user?.nom, isTyping: true });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('typing', { room: salon, nom: user?.nom, isTyping: false });
      }, 1500);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-xl font-bold text-white mb-2">Connectez-vous pour chatter</h2>
          <p className="text-slate-400">Le chat est réservé aux membres de la Dynamique</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Salons sidebar */}
      <div className="w-52 flex-shrink-0">
        <div className="card h-full p-3">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Hash size={14} style={{ color: 'var(--rdc-rouge)' }} />
            <span className="text-xs font-bold text-white uppercase tracking-wide">Salons</span>
          </div>
          <div className="space-y-0.5">
            {SALONS.map(s => (
              <button key={s.id} onClick={() => changerSalon(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm ${salon === s.id ? 'text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                style={salon === s.id ? { background: 'rgba(206,17,38,0.15)', borderLeft: '3px solid var(--rdc-rouge)' } : {}}>
                <div>{s.label}</div>
                <div className="text-xs text-slate-600 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>

          {/* Online users */}
          <div className="mt-4 px-1">
            <div className="flex items-center gap-1 mb-2">
              <Users size={12} className="text-green-400" />
              <span className="text-xs font-bold text-slate-400 uppercase">En ligne ({usersOnline.length})</span>
            </div>
            <div className="space-y-1">
              {usersOnline.slice(0, 8).map((u, i) => (
                <div key={i} className="flex items-center gap-2 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  <span className="text-xs text-slate-400 truncate">{u.nom}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat zone */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="card p-3 mb-3 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="font-bold text-white">{SALONS.find(s => s.id === salon)?.label}</div>
            <div className="text-xs text-slate-500">{SALONS.find(s => s.id === salon)?.desc}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-slate-400">{connected ? 'Connecté' : 'Déconnecté'}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 card p-4 overflow-y-auto mb-3 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-slate-600 text-sm">
              Aucun message. Soyez le premier !
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = (msg.auteur?._id || msg.auteur) === (user?._id || user?.id);
            const isSystem = msg.type === 'systeme';
            if (isSystem) {
              return (
                <div key={i} className="text-center text-xs text-slate-600 py-1">
                  {msg.contenu}
                </div>
              );
            }
            return (
              <div key={i} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: isMe ? 'var(--rdc-rouge)' : 'var(--dark-500)' }}>
                  {(msg.auteur?.nom || msg.auteurNom || '?').charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isMe && <span className="text-xs font-semibold text-white">{msg.auteur?.nom || 'Anonyme'}</span>}
                    <span className="text-[10px] text-slate-600">
                      {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                    </span>
                  </div>
                  <div className={`px-3 py-2 rounded-xl text-sm ${isMe ? 'text-white rounded-tr-none' : 'text-slate-200 rounded-tl-none'}`}
                    style={{ background: isMe ? 'var(--rdc-rouge)' : 'var(--dark-600)' }}>
                    {msg.contenu}
                  </div>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="text-xs text-slate-500 italic">{typing} est en train d'écrire...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 flex-shrink-0">
          <input
            className="input flex-1"
            placeholder={`Message dans ${SALONS.find(s => s.id === salon)?.label}...`}
            value={message}
            onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && envoyerMessage()}
          />
          <button onClick={envoyerMessage} disabled={!message.trim() || !connected}
            className="btn-primary px-4 disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
