const Signalement = require('../models/Signalement');
const User = require('../models/User');
const { Comment, Notification } = require('../models/index');
const { analyserSignalement } = require('../services/aiService');
const { GAMIFICATION } = require('../config/constants');

// GET /api/signalements
exports.getSignalements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, statut, province, priorite, search } = req.query;
    const query = {};

    if (type) query.type = type;
    if (statut) query.statut = statut;
    if (province) query.province = province;
    if (priorite) query.priorite = priorite;
    if (search) query.$or = [
      { titre: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: 'auteur', select: 'nom avatar province' }
    };

    const result = await Signalement.paginate(query, options);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// POST /api/signalements
exports.creerSignalement = async (req, res, next) => {
  try {
    const { type, titre, description, province, localisation } = req.body;

    const signalement = new Signalement({
      auteur: req.user._id,
      type, titre, description, province,
      localisation: localisation ? JSON.parse(localisation) : {}
    });

    // Médias uploadés
    if (req.files && req.files.length > 0) {
      signalement.medias = req.files.map(f => ({
        url: `/uploads/${f.filename}`,
        type: f.mimetype.startsWith('image') ? 'image' : 'video'
      }));
    }

    // Analyse IA
    const analyse = await analyserSignalement(signalement);
    signalement.ia = analyse.ia;
    signalement.priorite = analyse.priorite;

    await signalement.save();
    await signalement.populate('auteur', 'nom avatar');

    res.status(201).json({ success: true, signalement });
  } catch (err) { next(err); }
};

// GET /api/signalements/:id
exports.getSignalement = async (req, res, next) => {
  try {
    const signalement = await Signalement.findById(req.params.id).populate('auteur', 'nom avatar province');
    if (!signalement) return res.status(404).json({ success: false, message: 'Signalement introuvable' });

    signalement.vues += 1;
    await signalement.save({ validateBeforeSave: false });

    const commentaires = await Comment.find({ cible: signalement._id, statut: 'approuve' })
      .populate('auteur', 'nom avatar')
      .sort({ createdAt: -1 }).limit(20);

    res.json({ success: true, signalement, commentaires });
  } catch (err) { next(err); }
};

// POST /api/signalements/:id/vote
exports.voter = async (req, res, next) => {
  try {
    const { valeur } = req.body; // 1 ou -1
    if (![1, -1].includes(valeur)) return res.status(400).json({ success: false, message: 'Valeur de vote invalide' });

    const signalement = await Signalement.findById(req.params.id);
    if (!signalement) return res.status(404).json({ success: false, message: 'Introuvable' });

    const voteExistant = signalement.votes.find(v => v.utilisateur.toString() === req.user._id.toString());
    if (voteExistant) {
      voteExistant.valeur = valeur;
    } else {
      signalement.votes.push({ utilisateur: req.user._id, valeur });
    }

    signalement.scoreVotes = signalement.votes.reduce((acc, v) => acc + v.valeur, 0);
    await signalement.save({ validateBeforeSave: false });

    // Gamification
    await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: GAMIFICATION.vote } });

    res.json({ success: true, scoreVotes: signalement.scoreVotes });
  } catch (err) { next(err); }
};

// PUT /api/signalements/:id/moderate
exports.moderer = async (req, res, next) => {
  try {
    const { statut, noteModeration } = req.body;
    const signalement = await Signalement.findByIdAndUpdate(
      req.params.id,
      { statut, noteModeration, moderePar: req.user._id },
      { new: true }
    ).populate('auteur', 'nom email');

    if (!signalement) return res.status(404).json({ success: false, message: 'Introuvable' });

    // Gamification si validé
    if (statut === 'verifie') {
      await User.findByIdAndUpdate(signalement.auteur._id, { $inc: { reputation: GAMIFICATION.signalement_valide } });
      await Notification.create({
        destinataire: signalement.auteur._id,
        titre: '✅ Signalement validé',
        message: `Votre signalement "${signalement.titre}" a été validé.`,
        type: 'succes',
        lien: `/signalements/${signalement._id}`
      });
    }

    if (statut === 'resolu') {
      await User.findByIdAndUpdate(signalement.auteur._id, { $inc: { reputation: GAMIFICATION.signalement_resolu } });
    }

    res.json({ success: true, signalement });
  } catch (err) { next(err); }
};

// GET /api/signalements/heatmap
exports.getHeatmap = async (req, res, next) => {
  try {
    const { province } = req.query;
    const query = { 'localisation.lat': { $exists: true, $ne: null } };
    if (province) query.province = province;

    const points = await Signalement.find(query)
      .select('localisation.lat localisation.lng type priorite statut')
      .limit(500);

    res.json({ success: true, points });
  } catch (err) { next(err); }
};

// GET /api/signalements/province-stats
exports.getProvinceStats = async (req, res, next) => {
  try {
    const stats = await Signalement.aggregate([
      { $group: { _id: '$province', total: { $sum: 1 }, resolus: { $sum: { $cond: [{ $eq: ['$statut', 'resolu'] }, 1, 0] } } } },
      { $sort: { total: -1 } }
    ]);
    res.json({ success: true, stats });
  } catch (err) { next(err); }
};

// GET /api/signalements/mine
exports.getMesSignalements = async (req, res, next) => {
  try {
    const signalements = await Signalement.find({ auteur: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, signalements });
  } catch (err) { next(err); }
};
