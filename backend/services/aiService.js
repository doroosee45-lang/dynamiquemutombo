const Signalement = require('../models/Signalement');

// Détection faux signalements (heuristiques)
const detecterFaux = async (texte, auteurId) => {
  let score = 0;
  const mots = texte.toLowerCase().split(/\s+/);

  // Trop court
  if (mots.length < 10) score += 0.3;

  // Mots de spam
  const spamMots = ['test', 'aaaa', 'asdf', 'lorem', 'blabla', '1234'];
  if (spamMots.some(m => texte.toLowerCase().includes(m))) score += 0.4;

  // Signalements récents du même auteur (dernières 10 minutes)
  const recent = await Signalement.countDocuments({
    auteur: auteurId,
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
  });
  if (recent > 3) score += 0.5;

  return Math.min(score, 1);
};

// Analyse de sentiment
const analyserSentiment = (texte) => {
  const txt = texte.toLowerCase();
  const motsAlarmants = ['mort', 'tué', 'massacre', 'urgent', 'danger', 'attaque', 'explosif', 'violence', 'brûlé'];
  const motsNegatifs = ['problème', 'mauvais', 'corruption', 'vol', 'blessé', 'peur', 'insécurité', 'abus'];
  const motsPositifs = ['résolu', 'amélioration', 'bien', 'calme', 'sécurisé'];

  if (motsAlarmants.some(m => txt.includes(m))) return 'alarmant';
  if (motsNegatifs.filter(m => txt.includes(m)).length >= 2) return 'negatif';
  if (motsPositifs.some(m => txt.includes(m))) return 'positif';
  return 'neutre';
};

// Détection doublons (similarité Jaccard)
const detecterDoublon = async (texte, province, type) => {
  const recents = await Signalement.find({
    province,
    type,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }).select('description').limit(20);

  const motsA = new Set(texte.toLowerCase().split(/\s+/).filter(m => m.length > 3));

  for (const sig of recents) {
    const motsB = new Set(sig.description.toLowerCase().split(/\s+/).filter(m => m.length > 3));
    const intersection = new Set([...motsA].filter(m => motsB.has(m)));
    const union = new Set([...motsA, ...motsB]);
    const jaccard = union.size > 0 ? intersection.size / union.size : 0;
    if (jaccard > 0.6) return { estDoublon: true, doublonDe: sig._id };
  }
  return { estDoublon: false, doublonDe: null };
};

// Résumé automatique
const genererResume = (texte) => {
  const phrases = texte.split(/[.!?]+/).map(p => p.trim()).filter(p => p.length > 20);
  return phrases.slice(0, 2).join('. ') + '.';
};

// Priorisation
const determinerPriorite = (sentiment) => {
  if (sentiment === 'alarmant') return 'critical';
  if (sentiment === 'negatif') return 'high';
  return 'medium';
};

// Analyse complète
const analyserSignalement = async (signalement) => {
  const [scoreFaux, doublonInfo] = await Promise.all([
    detecterFaux(signalement.description, signalement.auteur),
    detecterDoublon(signalement.description, signalement.province, signalement.type)
  ]);

  const sentiment = analyserSentiment(signalement.description);
  const resume = genererResume(signalement.description);
  const priorite = determinerPriorite(sentiment);

  return {
    ia: {
      scoreFaux,
      sentiment,
      estDoublon: doublonInfo.estDoublon,
      doublonDe: doublonInfo.doublonDe,
      resume,
      analyseEffectuee: true
    },
    priorite
  };
};

module.exports = { analyserSignalement };
