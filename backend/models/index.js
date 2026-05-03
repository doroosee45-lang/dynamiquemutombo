const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

// ── COMMENTAIRE ──────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cible: { type: mongoose.Schema.Types.ObjectId, required: true },
  cibleType: { type: String, enum: ['signalement', 'publication', 'innovation'] },
  contenu: { type: String, required: true, maxlength: 1000 },
  statut: { type: String, enum: ['en_attente', 'approuve', 'rejete'], default: 'approuve' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// ── PÉTITION ─────────────────────────────────────────────────
const petitionSchema = new mongoose.Schema({
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  objectif: { type: Number, default: 1000 },
  signataires: [{ utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, signeLe: { type: Date, default: Date.now } }],
  nbSignatures: { type: Number, default: 0 },
  statut: { type: String, enum: ['active', 'atteinte', 'fermee'], default: 'active' },
  dateExpiration: Date,
  province: String
}, { timestamps: true });
petitionSchema.plugin(paginate);

// ── CAMPAGNE ──────────────────────────────────────────────────
const campaignSchema = new mongoose.Schema({
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['materiel', 'humain', 'financier', 'sensibilisation'], default: 'sensibilisation' },
  objectif: String,
  image: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  nbParticipants: { type: Number, default: 0 },
  statut: { type: String, enum: ['active', 'terminee', 'annulee'], default: 'active' },
  dateDebut: Date,
  dateFin: Date,
  province: String
}, { timestamps: true });
campaignSchema.plugin(paginate);

// ── NOTIFICATION ──────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'alerte', 'succes', 'badge', 'moderation'], default: 'info' },
  lue: { type: Boolean, default: false },
  lien: String
}, { timestamps: true });

// ── CHAT MESSAGE ──────────────────────────────────────────────
const chatMessageSchema = new mongoose.Schema({
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  salon: { type: String, required: true }, // 'global', 'securite', 'transport', province...
  contenu: { type: String, required: true, maxlength: 500 },
  type: { type: String, enum: ['texte', 'image', 'systeme'], default: 'texte' },
  reactions: [{ emoji: String, utilisateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }],
  supprime: { type: Boolean, default: false }
}, { timestamps: true });

// ── INNOVATION ────────────────────────────────────────────────
const innovationSchema = new mongoose.Schema({
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  categorie: { type: String, enum: ['technologie', 'social', 'economique', 'environnemental', 'autre'], default: 'autre' },
  image: String,
  statut: { type: String, enum: ['en_attente', 'valide', 'rejete', 'en_cours'], default: 'en_attente' },
  votes: [{ utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, valeur: { type: Number, enum: [1] } }],
  scoreVotes: { type: Number, default: 0 },
  province: String
}, { timestamps: true });
innovationSchema.plugin(paginate);

module.exports = {
  Comment: mongoose.model('Comment', commentSchema),
  Petition: mongoose.model('Petition', petitionSchema),
  Campaign: mongoose.model('Campaign', campaignSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  ChatMessage: mongoose.model('ChatMessage', chatMessageSchema),
  Innovation: mongoose.model('Innovation', innovationSchema)
};
