const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protéger les routes avec JWT
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Non autorisé — token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    if (req.user.statut === 'banni') return res.status(403).json({ success: false, message: 'Compte banni' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

// Optionnel — ne bloque pas si pas de token
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (_) {}
  }
  next();
};

// RBAC — vérification des rôles
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Non authentifié' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Rôle '${req.user.role}' non autorisé` });
  }
  next();
};

// Scope province pour modérateurs
const provinceScope = (req, res, next) => {
  if (['admin', 'superadmin'].includes(req.user.role)) return next();
  if (req.user.role === 'moderator' && req.user.province) {
    req.provinceFilter = req.user.province;
  }
  next();
};

module.exports = { protect, optionalAuth, authorize, provinceScope };
