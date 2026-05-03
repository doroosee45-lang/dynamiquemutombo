const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const publicationSchema = new mongoose.Schema({
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: { type: String, required: true },
  contenu: { type: String, required: true },
  type: { type: String, enum: ['article', 'enquete', 'alerte', 'officiel'], default: 'article' },
  categorie: String,
  image: String,
  statut: { type: String, enum: ['brouillon', 'publie', 'archive'], default: 'publie' },
  urgent: { type: Boolean, default: false },
  vues: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

publicationSchema.plugin(paginate);
module.exports = mongoose.model('Publication', publicationSchema);
