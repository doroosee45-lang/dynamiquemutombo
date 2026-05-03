const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getSignalements, creerSignalement, getSignalement,
  voter, moderer, getHeatmap, getProvinceStats, getMesSignalements
} = require('../controllers/signalementController');
const { protect, optionalAuth, authorize, provinceScope } = require('../middleware/auth');

// Upload config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/heatmap', getHeatmap);
router.get('/province-stats', getProvinceStats);
router.get('/mine', protect, getMesSignalements);

router.get('/', optionalAuth, getSignalements);
router.post('/', protect, upload.array('medias', 5), creerSignalement);
router.get('/:id', optionalAuth, getSignalement);
router.post('/:id/vote', protect, voter);
router.put('/:id/moderate', protect, authorize('moderator', 'admin', 'superadmin'), provinceScope, moderer);

module.exports = router;
