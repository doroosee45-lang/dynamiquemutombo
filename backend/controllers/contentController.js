const Publication = require('../models/Publication');
const { Comment, Petition, Campaign, Innovation, Notification } = require('../models/index');
const User = require('../models/User');
const { GAMIFICATION } = require('../config/constants');

// ── PUBLICATIONS ──────────────────────────────────────────────

exports.getPublications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const query = { statut: 'publie' };
    if (type) query.type = type;
    if (search) query.$or = [{ titre: { $regex: search, $options: 'i' } }];

    const options = { page: parseInt(page), limit: parseInt(limit), sort: { urgent: -1, createdAt: -1 }, populate: { path: 'auteur', select: 'nom avatar' } };
    const result = await Publication.paginate(query, options);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.creerPublication = async (req, res, next) => {
  try {
    const pub = await Publication.create({ ...req.body, auteur: req.user._id });
    res.status(201).json({ success: true, publication: pub });
  } catch (err) { next(err); }
};

// ── COMMENTAIRES ──────────────────────────────────────────────

exports.ajouterCommentaire = async (req, res, next) => {
  try {
    const { cibleId, cibleType, contenu } = req.body;
    const comment = await Comment.create({ auteur: req.user._id, cible: cibleId, cibleType, contenu });
    await comment.populate('auteur', 'nom avatar');

    // Incrémenter compteur si signalement
    if (cibleType === 'signalement') {
      const Signalement = require('../models/Signalement');
      await Signalement.findByIdAndUpdate(cibleId, { $inc: { nbCommentaires: 1 } });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: GAMIFICATION.commentaire_approuve } });
    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

// ── PÉTITIONS ─────────────────────────────────────────────────

exports.getPetitions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, statut } = req.query;
    const query = statut ? { statut } : {};
    const options = { page: parseInt(page), limit: parseInt(limit), sort: { createdAt: -1 }, populate: { path: 'auteur', select: 'nom' } };
    const result = await Petition.paginate(query, options);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.creerPetition = async (req, res, next) => {
  try {
    const petition = await Petition.create({ ...req.body, auteur: req.user._id });
    res.status(201).json({ success: true, petition });
  } catch (err) { next(err); }
};

exports.signerPetition = async (req, res, next) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ success: false, message: 'Pétition introuvable' });

    const dejaSignee = petition.signataires.some(s => s.utilisateur.toString() === req.user._id.toString());
    if (dejaSignee) return res.status(400).json({ success: false, message: 'Déjà signé' });

    petition.signataires.push({ utilisateur: req.user._id });
    petition.nbSignatures += 1;
    if (petition.nbSignatures >= petition.objectif) petition.statut = 'atteinte';
    await petition.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: GAMIFICATION.petition_signee } });
    res.json({ success: true, nbSignatures: petition.nbSignatures, statut: petition.statut });
  } catch (err) { next(err); }
};

// ── CAMPAGNES ─────────────────────────────────────────────────

exports.getCampaigns = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const options = { page: parseInt(page), limit: parseInt(limit), sort: { createdAt: -1 }, populate: { path: 'auteur', select: 'nom' } };
    const result = await Campaign.paginate({ statut: 'active' }, options);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.creerCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.create({ ...req.body, auteur: req.user._id });
    res.status(201).json({ success: true, campaign });
  } catch (err) { next(err); }
};

exports.rejoindreCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campagne introuvable' });
    if (!campaign.participants.includes(req.user._id)) {
      campaign.participants.push(req.user._id);
      campaign.nbParticipants += 1;
      await campaign.save();
      await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: GAMIFICATION.campagne_rejointe } });
    }
    res.json({ success: true, nbParticipants: campaign.nbParticipants });
  } catch (err) { next(err); }
};

// ── INNOVATIONS ───────────────────────────────────────────────

exports.getInnovations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, statut } = req.query;
    const query = statut ? { statut } : {};
    const options = { page: parseInt(page), limit: parseInt(limit), sort: { scoreVotes: -1, createdAt: -1 }, populate: { path: 'auteur', select: 'nom avatar' } };
    const result = await Innovation.paginate(query, options);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.soumettreInnovation = async (req, res, next) => {
  try {
    const innovation = await Innovation.create({ ...req.body, auteur: req.user._id });
    res.status(201).json({ success: true, innovation });
  } catch (err) { next(err); }
};

exports.voterInnovation = async (req, res, next) => {
  try {
    const innovation = await Innovation.findById(req.params.id);
    if (!innovation) return res.status(404).json({ success: false, message: 'Introuvable' });
    if (!innovation.votes.some(v => v.utilisateur.toString() === req.user._id.toString())) {
      innovation.votes.push({ utilisateur: req.user._id, valeur: 1 });
      innovation.scoreVotes += 1;
      await innovation.save();
    }
    res.json({ success: true, scoreVotes: innovation.scoreVotes });
  } catch (err) { next(err); }
};
