// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, refresh, getMe, updateMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/error');

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/logout', protect, logout);

module.exports = router;
