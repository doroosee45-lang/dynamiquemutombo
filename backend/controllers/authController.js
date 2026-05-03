const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const genTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { nom, email, motDePasse, province } = req.body;
    if (!nom || !email || !motDePasse) return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });

    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ success: false, message: 'Email déjà utilisé' });

    const tokenVerif = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ nom, email, motDePasse, province: province || 'Kinshasa', tokenVerification: tokenVerif });

    const { accessToken, refreshToken } = genTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      accessToken,
      refreshToken,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role, province: user.province, reputation: user.reputation, badges: user.badges }
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;
    if (!email || !motDePasse) return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const user = await User.findOne({ email }).select('+motDePasse');
    if (!user || !(await user.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
    if (user.statut === 'banni') return res.status(403).json({ success: false, message: 'Compte banni' });

    const { accessToken, refreshToken } = genTokens(user._id);
    user.refreshToken = refreshToken;
    user.derniereConnexion = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role, province: user.province, reputation: user.reputation, badges: user.badges, avatar: user.avatar }
    });
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token manquant' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Token invalide' });
    }

    const tokens = genTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, ...tokens });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Refresh token expiré ou invalide' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

// PUT /api/auth/me
exports.updateMe = async (req, res, next) => {
  try {
    const { nom, province, avatar, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nom, province, avatar, preferences },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) { user.refreshToken = null; await user.save({ validateBeforeSave: false }); }
  res.json({ success: true, message: 'Déconnecté' });
};
