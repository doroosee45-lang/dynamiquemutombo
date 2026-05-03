const ROLES = {
  CITIZEN: 'citizen',
  MODERATOR: 'moderator',
  EDITOR: 'editor',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
};

const PROVINCES = [
  { nom: 'Kinshasa', risque: 'eleve', districts: ['Lukunga', 'Funa', 'Mont-Amba', 'Tshangu'] },
  { nom: 'Nord-Kivu', risque: 'critique' },
  { nom: 'Sud-Kivu', risque: 'critique' },
  { nom: 'Ituri', risque: 'critique' },
  { nom: 'Haut-Uélé', risque: 'eleve' },
  { nom: 'Nord-Ubangi', risque: 'eleve' },
  { nom: 'Lualaba', risque: 'eleve' },
  { nom: 'Bas-Uélé', risque: 'moyen' },
  { nom: 'Équateur', risque: 'moyen' },
  { nom: 'Kasaï', risque: 'moyen' },
  { nom: 'Kasaï-Central', risque: 'moyen' },
  { nom: 'Kasaï-Oriental', risque: 'moyen' },
  { nom: 'Kongo Central', risque: 'moyen' },
  { nom: 'Kwango', risque: 'moyen' },
  { nom: 'Kwilu', risque: 'moyen' },
  { nom: 'Lomami', risque: 'faible' },
  { nom: 'Lualaba', risque: 'moyen' },
  { nom: 'Mai-Ndombe', risque: 'moyen' },
  { nom: 'Maniema', risque: 'moyen' },
  { nom: 'Mongala', risque: 'moyen' },
  { nom: 'Sankuru', risque: 'moyen' },
  { nom: 'Sud-Ubangi', risque: 'moyen' },
  { nom: 'Tanganyika', risque: 'moyen' },
  { nom: 'Tshopo', risque: 'moyen' },
  { nom: 'Tshuapa', risque: 'moyen' },
  { nom: 'Haut-Lomami', risque: 'moyen' },
  { nom: 'Haut-Katanga', risque: 'moyen' }
];

const TYPES_INCIDENT = [
  'insecurite',
  'banditisme',
  'transport',
  'corruption',
  'tribalisme',
  'infrastructure',
  'sante',
  'education',
  'environnement',
  'autre'
];

const SIGNALEMENT_STATUS = {
  PENDING: 'en_attente',
  VERIFIED: 'verifie',
  IN_PROGRESS: 'en_cours',
  RESOLVED: 'resolu',
  REJECTED: 'rejete'
};

const GAMIFICATION = {
  signalement_valide: 50,
  commentaire_approuve: 10,
  vote: 5,
  signalement_resolu: 100,
  innovation_validee: 200,
  petition_signee: 15,
  campagne_rejointe: 20
};

const BADGES = [
  { nom: 'Observateur', points: 500, icone: '👁️' },
  { nom: 'Activiste', points: 2000, icone: '✊' },
  { nom: 'Leader Citoyen', points: 5000, icone: '⭐' },
  { nom: 'Innovateur', points: 0, icone: '💡', special: true }
];

module.exports = { ROLES, PROVINCES, TYPES_INCIDENT, SIGNALEMENT_STATUS, GAMIFICATION, BADGES };
