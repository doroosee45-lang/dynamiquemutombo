// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   nom: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   motDePasse: { type: String, required: true, minlength: 6, select: false },
//   role: {
//     type: String,
//     enum: ['citizen', 'moderator', 'editor', 'admin', 'superadmin'],
//     default: 'citizen'
//   },
//   province: { type: String, default: 'Kinshasa' },
//   statut: { type: String, enum: ['actif', 'inactif', 'banni'], default: 'actif' },
//   emailVerifie: { type: Boolean, default: false },
//   tokenVerification: String,
//   refreshToken: String,
//   avatar: { type: String, default: '' },
//   // Gamification
//   reputation: { type: Number, default: 0 },
//   badges: [{ nom: String, icone: String, obtenuLe: { type: Date, default: Date.now } }],
//   // Préférences
//   preferences: {
//     notifEmail: { type: Boolean, default: true },
//     notifPush: { type: Boolean, default: true },
//     langue: { type: String, default: 'fr' }
//   },
//   derniereConnexion: Date
// }, { timestamps: true });

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('motDePasse')) return next();
//   this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
//   next();
// });

// userSchema.methods.verifierMotDePasse = async function (mdp) {
//   return await bcrypt.compare(mdp, this.motDePasse);
// };

// module.exports = mongoose.model('User', userSchema);



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  motDePasse: { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ['citizen', 'moderator', 'editor', 'admin', 'superadmin'],
    default: 'citizen'
  },
  province: { type: String, default: 'Kinshasa' },
  statut: { type: String, enum: ['actif', 'inactif', 'banni'], default: 'actif' },
  emailVerifie: { type: Boolean, default: false },
  tokenVerification: String,
  refreshToken: String,
  avatar: { type: String, default: '' },
  // Gamification
  reputation: { type: Number, default: 0 },
  badges: [{ nom: String, icone: String, obtenuLe: { type: Date, default: Date.now } }],
  // Préférences
  preferences: {
    notifEmail: { type: Boolean, default: true },
    notifPush: { type: Boolean, default: true },
    langue: { type: String, default: 'fr' }
  },
  derniereConnexion: Date
}, { timestamps: true });

// ✅ CORRECTION : fonction async sans next
userSchema.pre('save', async function() {
  if (this.isModified('motDePasse')) {
    this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  }
});

userSchema.methods.verifierMotDePasse = async function (mdp) {
  return await bcrypt.compare(mdp, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);