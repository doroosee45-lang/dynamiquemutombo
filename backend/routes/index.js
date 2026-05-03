const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPublications, creerPublication, ajouterCommentaire,
  getPetitions, creerPetition, signerPetition,
  getCampaigns, creerCampaign, rejoindreCampaign,
  getInnovations, soumettreInnovation, voterInnovation
} = require('../controllers/contentController');
const {
  getDashboard, getUsers, updateUser, banUser, envoyerAlerte, getLeaderboard
} = require('../controllers/adminController');
const { Notification, ChatMessage } = require('../models/index');

// ── PUBLICATIONS ──────────────────────────────────────────────
router.get('/publications', getPublications);
router.post('/publications', protect, authorize('editor', 'admin', 'superadmin'), creerPublication);

// ── COMMENTAIRES ──────────────────────────────────────────────
router.post('/comments', protect, ajouterCommentaire);

// ── PÉTITIONS ─────────────────────────────────────────────────
router.get('/petitions', getPetitions);
router.post('/petitions', protect, creerPetition);
router.post('/petitions/:id/signer', protect, signerPetition);

// ── CAMPAGNES ─────────────────────────────────────────────────
router.get('/campaigns', getCampaigns);
router.post('/campaigns', protect, authorize('editor', 'admin', 'superadmin'), creerCampaign);
router.post('/campaigns/:id/rejoindre', protect, rejoindreCampaign);

// ── INNOVATIONS ───────────────────────────────────────────────
router.get('/innovations', getInnovations);
router.post('/innovations', protect, soumettreInnovation);
router.post('/innovations/:id/vote', protect, voterInnovation);

// ── NOTIFICATIONS ─────────────────────────────────────────────
router.get('/notifications', protect, async (req, res) => {
  const notifs = await Notification.find({ destinataire: req.user._id })
    .sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, notifications: notifs });
});
router.put('/notifications/:id/lire', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { lue: true });
  res.json({ success: true });
});
router.put('/notifications/lire-tout', protect, async (req, res) => {
  await Notification.updateMany({ destinataire: req.user._id }, { lue: true });
  res.json({ success: true });
});

// ── CHAT ──────────────────────────────────────────────────────
router.get('/chat/:salon', protect, async (req, res) => {
  const messages = await ChatMessage.find({ salon: req.params.salon, supprime: false })
    .populate('auteur', 'nom avatar')
    .sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, messages: messages.reverse() });
});

// ── ADMIN ─────────────────────────────────────────────────────
router.get('/admin/dashboard', protect, authorize('moderator', 'admin', 'superadmin'), getDashboard);
router.get('/admin/dashboard/:province', protect, authorize('moderator', 'admin', 'superadmin'), getDashboard);
router.get('/admin/users', protect, authorize('admin', 'superadmin'), getUsers);
router.put('/admin/users/:id', protect, authorize('admin', 'superadmin'), updateUser);
router.put('/admin/users/:id/ban', protect, authorize('admin', 'superadmin'), banUser);
router.post('/admin/alert', protect, authorize('moderator', 'admin', 'superadmin'), envoyerAlerte);
router.get('/admin/leaderboard', getLeaderboard);

module.exports = router;
