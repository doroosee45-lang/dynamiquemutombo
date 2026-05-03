const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const signalementSchema = new mongoose.Schema({
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['insecurite', 'banditisme', 'transport', 'corruption', 'tribalisme', 'infrastructure', 'sante', 'education', 'environnement', 'autre'],
    required: true
  },
  titre: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, maxlength: 2000 },
  province: { type: String, required: true },
  localisation: {
    adresse: String,
    lat: Number,
    lng: Number
  },
  medias: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  statut: {
    type: String,
    enum: ['en_attente', 'verifie', 'en_cours', 'resolu', 'rejete'],
    default: 'en_attente'
  },
  priorite: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  // Votes citoyens
  votes: [{ utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, valeur: { type: Number, enum: [-1, 1] } }],
  scoreVotes: { type: Number, default: 0 },
  // IA
  ia: {
    scoreFaux: { type: Number, default: 0 },
    sentiment: { type: String, enum: ['positif', 'neutre', 'negatif', 'alarmant'], default: 'neutre' },
    estDoublon: { type: Boolean, default: false },
    doublonDe: { type: mongoose.Schema.Types.ObjectId, ref: 'Signalement' },
    resume: String,
    analyseEffectuee: { type: Boolean, default: false }
  },
  // Modération
  moderePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  noteModeration: String,
  vues: { type: Number, default: 0 },
  // Commentaires embarqués (références)
  nbCommentaires: { type: Number, default: 0 }
}, { timestamps: true });

signalementSchema.plugin(paginate);

// Index géospatial
signalementSchema.index({ 'localisation.lat': 1, 'localisation.lng': 1 });
signalementSchema.index({ province: 1, statut: 1, createdAt: -1 });

module.exports = mongoose.model('Signalement', signalementSchema);
