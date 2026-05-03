const rateLimit = require('express-rate-limit');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur serveur interne';

  if (err.name === 'CastError') { statusCode = 400; message = 'ID invalide'; }
  if (err.code === 11000) { statusCode = 400; message = 'Cette valeur existe déjà'; }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  console.error(`[${new Date().toISOString()}] ${statusCode} — ${message}`);
  res.status(statusCode).json({ success: false, message });
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Trop de requêtes. Ralentissez.' }
});

module.exports = { errorHandler, loginLimiter, apiLimiter };
