const User = require('../models/User');
const Signalement = require('../models/Signalement');
const Publication = require('../models/Publication');
const { Petition, Campaign, Notification, Innovation } = require('../models/index');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const province = req.params.province;
    const query = province ? { province } : {};
    const sigQuery = { ...query };

    const [
      totalUsers, totalSignalements, enAttente, resolus,
      parType, parStatut, parProvince, recents
    ] = await Promise.all([
      User.countDocuments(province ? { province } : {}),
      Signalement.countDocuments(sigQuery),
      Signalement.countDocuments({ ...sigQuery, statut: 'en_attente' }),
      Signalement.countDocuments({ ...sigQuery, statut: 'resolu' }),
      Signalement.aggregate([
        { $match: sigQuery },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Signalement.aggregate([
        { $match: sigQuery },
        { $group: { _id: '$statut', count: { $sum: 1 } } }
      ]),
      !province ? Signalement.aggregate([
        { $group: { _id: '$province', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 }
      ]) : [],
      Signalement.find(sigQuery).sort({ createdAt: -1 }).limit(5).populate('auteur', 'nom')
    ]);

    const [totalPetitions, totalCampaigns] = await Promise.all([
      Petition.countDocuments(),
      Campaign.countDocuments({ statut: 'active' })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalSignalements, enAttente, resolus,
        tauxResolution: totalSignalements > 0 ? Math.round((resolus / totalSignalements) * 100) : 0,
        totalPetitions, totalCampaigns,
        parType, parStatut, parProvince, recents
      }
    });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, statut, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (statut) query.statut = statut;
    if (search) query.$or = [
      { nom: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, statut, province } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, statut, province },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/ban
exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { statut: 'banni' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, message: `${user.nom} a été banni`, user });
  } catch (err) { next(err); }
};

// POST /api/admin/alert
exports.envoyerAlerte = async (req, res, next) => {
  try {
    const { titre, message, province, type = 'alerte' } = req.body;

    // Créer notifications pour tous les utilisateurs de la province
    const userQuery = province ? { province, statut: 'actif' } : { statut: 'actif' };
    const users = await User.find(userQuery).select('_id');

    const notifications = users.map(u => ({
      destinataire: u._id,
      titre,
      message,
      type
    }));

    await Notification.insertMany(notifications);

    // Émettre via socket (géré côté server.js avec io global)
    if (global.socketEmitter) {
      if (province) {
        global.socketEmitter.emitToProvince(province, 'alert', { titre, message, type });
      } else {
        global.socketEmitter.emitToAll('alert', { titre, message, type });
      }
    }

    res.json({ success: true, message: `Alerte envoyée à ${users.length} utilisateurs` });
  } catch (err) { next(err); }
};

// GET /api/admin/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ statut: 'actif' })
      .select('nom avatar province reputation badges role')
      .sort({ reputation: -1 })
      .limit(50);
    res.json({ success: true, users });
  } catch (err) { next(err); }
};
