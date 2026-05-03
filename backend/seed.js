require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const User = require('./models/User');
const Signalement = require('./models/Signalement');
const Publication = require('./models/Publication');
const { Petition, Campaign, Innovation, ChatMessage } = require('./models/index');

const seed = async () => {
  await connectDB();
  console.log('🌱 Démarrage du seeding...\n');

  // Nettoyer
  await Promise.all([
    User.deleteMany(),
    Signalement.deleteMany(),
    Publication.deleteMany(),
    Petition.deleteMany(),
    Campaign.deleteMany(),
    Innovation.deleteMany(),
    ChatMessage.deleteMany()
  ]);
  console.log('🗑️  Collections nettoyées');

  // ── UTILISATEURS ──────────────────────────────────────────
  const motDePasse = await bcrypt.hash('password123', 12);

  const users = await User.insertMany([
    {
      nom: 'Super Admin RDC',
      email: 'superadmin@dynamique.cd',
      motDePasse,
      role: 'superadmin',
      province: 'Kinshasa',
      emailVerifie: true,
      reputation: 9999,
      badges: [
        { nom: 'Leader Citoyen', icone: '⭐' },
        { nom: 'Innovateur', icone: '💡' }
      ]
    },
    {
      nom: 'Administrateur Kinshasa',
      email: 'admin@dynamique.cd',
      motDePasse,
      role: 'admin',
      province: 'Kinshasa',
      emailVerifie: true,
      reputation: 5200,
      badges: [{ nom: 'Leader Citoyen', icone: '⭐' }]
    },
    {
      nom: 'Modérateur Nord-Kivu',
      email: 'mod.nordkivu@dynamique.cd',
      motDePasse,
      role: 'moderator',
      province: 'Nord-Kivu',
      emailVerifie: true,
      reputation: 2100,
      badges: [{ nom: 'Activiste', icone: '✊' }]
    },
    {
      nom: 'Éditeur Publications',
      email: 'editeur@dynamique.cd',
      motDePasse,
      role: 'editor',
      province: 'Kinshasa',
      emailVerifie: true,
      reputation: 1800
    },
    {
      nom: 'Jean-Baptiste Kabila',
      email: 'citoyen1@example.cd',
      motDePasse,
      role: 'citizen',
      province: 'Kinshasa',
      emailVerifie: true,
      reputation: 620,
      badges: [{ nom: 'Observateur', icone: '👁️' }]
    },
    {
      nom: 'Marie-Claire Mukeba',
      email: 'citoyen2@example.cd',
      motDePasse,
      role: 'citizen',
      province: 'Sud-Kivu',
      emailVerifie: true,
      reputation: 340
    },
    {
      nom: 'Patrick Nzinga',
      email: 'citoyen3@example.cd',
      motDePasse,
      role: 'citizen',
      province: 'Ituri',
      emailVerifie: true,
      reputation: 2300,
      badges: [{ nom: 'Activiste', icone: '✊' }]
    },
    {
      nom: 'Ange Mwamba',
      email: 'citoyen4@example.cd',
      motDePasse,
      role: 'citizen',
      province: 'Haut-Katanga',
      emailVerifie: true,
      reputation: 150
    },
    {
      nom: 'Grace Tshilomba',
      email: 'citoyen5@example.cd',
      motDePasse,
      role: 'citizen',
      province: 'Kasaï',
      emailVerifie: true,
      reputation: 880,
      badges: [{ nom: 'Observateur', icone: '👁️' }]
    },
    {
      nom: 'Docteur Lumumba',
      email: 'citoyen6@example.cd',
      motDePasse,
      role: 'citizen',
      province: 'Maniema',
      emailVerifie: true,
      reputation: 5100,
      badges: [{ nom: 'Leader Citoyen', icone: '⭐' }]
    }
  ]);
  console.log(`✅ ${users.length} utilisateurs créés`);

  // ── SIGNALEMENTS ──────────────────────────────────────────
  const signalements = await Signalement.insertMany([
    {
      auteur: users[4]._id,
      type: 'insecurite',
      titre: 'Attaque armée à Goma — quartier Ndosho',
      description: 'Des hommes armés ont attaqué plusieurs maisons dans le quartier Ndosho ce matin vers 3h. Trois personnes ont été blessées dont une grièvement. Les forces de l\'ordre ont été alertées mais tardent à intervenir.',
      province: 'Nord-Kivu',
      localisation: { adresse: 'Quartier Ndosho, Goma', lat: -1.6797, lng: 29.2277 },
      statut: 'en_cours',
      priorite: 'critical',
      ia: { scoreFaux: 0.05, sentiment: 'alarmant', estDoublon: false, resume: 'Attaque armée dans le quartier Ndosho à Goma. Trois blessés dont un grave.', analyseEffectuee: true },
      scoreVotes: 47,
      vues: 234,
      nbCommentaires: 8
    },
    {
      auteur: users[5]._id,
      type: 'corruption',
      titre: 'Extorsion de fonds à la douane de Bukavu',
      description: 'Des agents de douane demandent systématiquement des pots-de-vin aux commerçants au poste frontalier de Bukavu-Ruzizi. Les montants varient entre 20 et 100 dollars. Cette pratique dure depuis plusieurs mois sans aucune sanction.',
      province: 'Sud-Kivu',
      localisation: { adresse: 'Poste frontalier Ruzizi, Bukavu', lat: -2.4908, lng: 28.8497 },
      statut: 'verifie',
      priorite: 'high',
      ia: { scoreFaux: 0.1, sentiment: 'negatif', estDoublon: false, resume: 'Extorsion systématique à la douane de Bukavu. Montants entre 20 et 100$.', analyseEffectuee: true },
      scoreVotes: 32,
      vues: 189,
      nbCommentaires: 5
    },
    {
      auteur: users[6]._id,
      type: 'transport',
      titre: 'Route nationale 4 impraticable — tronçon Bunia-Beni',
      description: 'Le tronçon de la RN4 entre Bunia et Beni est totalement détruit après les pluies. Des dizaines de véhicules sont bloqués depuis 3 jours. Aucune action des autorités locales. Les populations sont isolées.',
      province: 'Ituri',
      localisation: { adresse: 'RN4 tronçon Bunia-Beni', lat: 1.5645, lng: 30.2444 },
      statut: 'en_attente',
      priorite: 'high',
      ia: { scoreFaux: 0.08, sentiment: 'negatif', estDoublon: false, resume: 'Tronçon RN4 Bunia-Beni détruit après les pluies. Populations isolées depuis 3 jours.', analyseEffectuee: true },
      scoreVotes: 28,
      vues: 145
    },
    {
      auteur: users[4]._id,
      type: 'infrastructure',
      titre: 'Coupure d\'eau prolongée à Kasa-Vubu depuis 2 semaines',
      description: 'La commune de Kasa-Vubu est sans eau courante depuis 14 jours. La REGIDESO n\'a fourni aucune explication officielle. Les habitants achètent l\'eau à des prix exorbitants aux vendeurs ambulants. Les hôpitaux et écoles sont particulièrement touchés.',
      province: 'Kinshasa',
      localisation: { adresse: 'Commune Kasa-Vubu, Kinshasa', lat: -4.3317, lng: 15.3136 },
      statut: 'resolu',
      priorite: 'medium',
      ia: { scoreFaux: 0.03, sentiment: 'negatif', estDoublon: false, resume: 'Coupure d\'eau de 14 jours à Kasa-Vubu. REGIDESO sans explication. Hôpitaux touchés.', analyseEffectuee: true },
      scoreVotes: 65,
      vues: 412,
      nbCommentaires: 12
    },
    {
      auteur: users[7]._id,
      type: 'sante',
      titre: 'Pénurie de médicaments à l\'Hôpital Général de Lubumbashi',
      description: 'L\'Hôpital Général de Lubumbashi est en rupture de stock de médicaments essentiels depuis 3 semaines : antibiotiques, antipaludéens, sérum physiologique. Des patients meurent faute de soins. Le directeur de l\'hôpital reste introuvable.',
      province: 'Haut-Katanga',
      localisation: { adresse: 'HGP Lubumbashi', lat: -11.6609, lng: 27.4794 },
      statut: 'verifie',
      priorite: 'critical',
      ia: { scoreFaux: 0.02, sentiment: 'alarmant', estDoublon: false, resume: 'Pénurie médicaments essentiels à HGP Lubumbashi depuis 3 semaines. Patients en danger.', analyseEffectuee: true },
      scoreVotes: 89,
      vues: 567,
      nbCommentaires: 19
    },
    {
      auteur: users[8]._id,
      type: 'education',
      titre: 'École primaire effondrée à Tshikapa — 200 élèves sans classe',
      description: 'Le bâtiment principal de l\'École Primaire Kizito à Tshikapa s\'est partiellement effondré suite aux pluies diluviennes. Heureusement aucun blessé. 200 élèves se retrouvent sans salle de classe à 2 mois des examens nationaux.',
      province: 'Kasaï',
      localisation: { adresse: 'EP Kizito, Tshikapa', lat: -5.0309, lng: 20.8000 },
      statut: 'en_cours',
      priorite: 'high',
      ia: { scoreFaux: 0.06, sentiment: 'negatif', estDoublon: false, resume: 'École primaire partiellement effondrée à Tshikapa. 200 élèves sans classe.', analyseEffectuee: true },
      scoreVotes: 41,
      vues: 198
    },
    {
      auteur: users[9]._id,
      type: 'banditisme',
      titre: 'Bande de coupeurs de route actifs sur la RN7 — Kasaï',
      description: 'Une bande armée sévit sur la route nationale 7 entre Kananga et Mbuji-Mayi. Plusieurs véhicules ont été attaqués et dépouillés cette semaine. Les voyageurs signalent au moins 4 incidents depuis lundi.',
      province: 'Kasaï-Central',
      localisation: { adresse: 'RN7 Kananga-Mbuji-Mayi', lat: -5.8957, lng: 22.4166 },
      statut: 'en_attente',
      priorite: 'critical',
      ia: { scoreFaux: 0.07, sentiment: 'alarmant', estDoublon: false, resume: 'Coupeurs de route actifs sur RN7 Kananga-Mbuji-Mayi. 4 incidents cette semaine.', analyseEffectuee: true },
      scoreVotes: 56,
      vues: 321
    },
    {
      auteur: users[5]._id,
      type: 'environnement',
      titre: 'Déversement de déchets chimiques dans le lac Tanganyika',
      description: 'Des camions-citernes déversent des déchets industriels non traités directement dans le lac Tanganyika près de Kalemie. Les poissons meurent en masse. Les pêcheurs signalent ce phénomène depuis 2 semaines. L\'eau a pris une couleur brunâtre.',
      province: 'Tanganyika',
      localisation: { adresse: 'Rive lac Tanganyika, Kalemie', lat: -5.9270, lng: 29.1975 },
      statut: 'verifie',
      priorite: 'high',
      ia: { scoreFaux: 0.04, sentiment: 'alarmant', estDoublon: false, resume: 'Déchets industriels déversés dans lac Tanganyika à Kalemie. Poissons morts. Eau colorée.', analyseEffectuee: true },
      scoreVotes: 73,
      vues: 445
    }
  ]);
  console.log(`✅ ${signalements.length} signalements créés`);

  // ── PUBLICATIONS ──────────────────────────────────────────
  const publications = await Publication.insertMany([
    {
      auteur: users[3]._id,
      titre: '🚨 ALERTE NATIONALE : Recrudescence des violences dans l\'Est',
      contenu: 'La Dynamique Israël Mutombo alerte sur la recrudescence des violences armées dans les provinces du Nord-Kivu, Sud-Kivu et de l\'Ituri. Nos équipes sur le terrain documentent les incidents et appellent à la mobilisation citoyenne...',
      type: 'alerte',
      urgent: true,
      statut: 'publie',
      vues: 1245,
      tags: ['securite', 'est-rdc', 'urgent']
    },
    {
      auteur: users[3]._id,
      titre: 'Enquête : La corruption dans les services douaniers congolais',
      contenu: 'Notre équipe d\'investigation a mené une enquête de trois mois sur les pratiques de corruption dans les postes douaniers de la RDC. Résultats alarmants : 78% des commerçants interrogés admettent payer des pots-de-vin régulièrement...',
      type: 'enquete',
      statut: 'publie',
      vues: 892,
      tags: ['corruption', 'douane', 'economie']
    },
    {
      auteur: users[1]._id,
      titre: 'Rapport mensuel : Bilan des signalements — Avril 2025',
      contenu: 'La Dynamique Israël Mutombo publie son rapport mensuel des signalements citoyens. Ce mois d\'avril, nous avons enregistré 234 signalements dont 67% ont reçu une réponse des autorités compétentes...',
      type: 'officiel',
      statut: 'publie',
      vues: 634,
      tags: ['rapport', 'bilan', 'statistiques']
    },
    {
      auteur: users[3]._id,
      titre: 'Comment signaler efficacement un incident en moins de 2 minutes',
      contenu: 'Guide pratique pour les citoyens souhaitant utiliser la plateforme Dynamique pour signaler un incident. Étape 1 : Connectez-vous ou inscrivez-vous. Étape 2 : Cliquez sur "Nouveau signalement"...',
      type: 'article',
      statut: 'publie',
      vues: 478,
      tags: ['guide', 'tutoriel', 'signalement']
    },
    {
      auteur: users[1]._id,
      titre: 'Succès de la campagne "Kinshasa Propre" : 500 tonnes de déchets collectés',
      contenu: 'La campagne "Kinshasa Propre" lancée par la Dynamique Israël Mutombo a atteint ses objectifs. En 30 jours, plus de 2000 volontaires ont participé et 500 tonnes de déchets ont été collectés dans les 4 districts de Kinshasa...',
      type: 'officiel',
      statut: 'publie',
      vues: 756,
      tags: ['succes', 'kinshasa', 'environnement', 'campagne']
    }
  ]);
  console.log(`✅ ${publications.length} publications créées`);

  // ── PÉTITIONS ─────────────────────────────────────────────
  const petitions = await Petition.insertMany([
    {
      auteur: users[6]._id,
      titre: 'Réhabilitation urgente de la RN4 tronçon Bunia-Beni',
      description: 'Nous, citoyens de l\'Ituri et du Nord-Kivu, demandons la réhabilitation immédiate de la Route Nationale 4 entre Bunia et Beni. Cette route est vitale pour l\'approvisionnement humanitaire et le commerce régional. Son état désastreux coûte des vies.',
      objectif: 5000,
      nbSignatures: 3241,
      statut: 'active',
      province: 'Ituri',
      signataires: users.slice(0, 5).map(u => ({ utilisateur: u._id }))
    },
    {
      auteur: users[4]._id,
      titre: 'Stop à la corruption douanière — Application de la loi',
      description: 'Nous demandons au gouvernement congolais de prendre des mesures urgentes contre la corruption systématique dans les services douaniers. Il faut des sanctions exemplaires et la mise en place de mécanismes de contrôle indépendants.',
      objectif: 10000,
      nbSignatures: 7823,
      statut: 'active',
      signataires: users.slice(0, 8).map(u => ({ utilisateur: u._id }))
    },
    {
      auteur: users[8]._id,
      titre: 'Reconstruction de l\'EP Kizito de Tshikapa',
      description: 'Suite à l\'effondrement partiel de l\'École Primaire Kizito, nous demandons la reconstruction immédiate du bâtiment pour permettre aux 200 élèves de reprendre les cours avant les examens nationaux.',
      objectif: 2000,
      nbSignatures: 2000,
      statut: 'atteinte',
      province: 'Kasaï',
      signataires: users.map(u => ({ utilisateur: u._id }))
    }
  ]);
  console.log(`✅ ${petitions.length} pétitions créées`);

  // ── CAMPAGNES ─────────────────────────────────────────────
  const campaigns = await Campaign.insertMany([
    {
      auteur: users[1]._id,
      titre: 'Kinshasa Propre 2025 — Nettoyage des 4 districts',
      description: 'Grande campagne de nettoyage des rues de Kinshasa. Rejoignez-nous chaque samedi matin dans votre quartier. Matériel fourni. Ensemble pour une Kinshasa plus propre !',
      type: 'humain',
      objectif: 'Nettoyer les 4 districts de Kinshasa',
      nbParticipants: 2340,
      statut: 'active',
      province: 'Kinshasa',
      participants: users.slice(0, 6).map(u => u._id)
    },
    {
      auteur: users[3]._id,
      titre: 'Aide humanitaire Est-RDC — Collecte de médicaments',
      description: 'Face à la crise sanitaire dans l\'Est, la Dynamique lance une collecte de médicaments et de matériel médical. Points de collecte disponibles dans toutes les communes de Kinshasa.',
      type: 'materiel',
      objectif: 'Collecter 10 tonnes de médicaments',
      nbParticipants: 876,
      statut: 'active',
      participants: users.slice(0, 4).map(u => u._id)
    },
    {
      auteur: users[6]._id,
      titre: 'Sensibilisation contre le tribalisme — Tour de 26 provinces',
      description: 'La Dynamique organise une tournée nationale de sensibilisation contre le tribalisme et pour l\'unité nationale. Rejoignez la caravane dans votre province !',
      type: 'sensibilisation',
      objectif: 'Toucher 100 000 citoyens dans 26 provinces',
      nbParticipants: 1567,
      statut: 'active',
      participants: users.slice(0, 7).map(u => u._id)
    }
  ]);
  console.log(`✅ ${campaigns.length} campagnes créées`);

  // ── INNOVATIONS ───────────────────────────────────────────
  const innovations = await Innovation.insertMany([
    {
      auteur: users[4]._id,
      titre: 'Application mobile de signalement hors-ligne',
      description: 'Développer une version mobile de la plateforme qui fonctionne sans connexion internet. Les signalements seraient synchronisés dès qu\'une connexion est disponible. Essentiel pour les zones rurales de la RDC.',
      categorie: 'technologie',
      statut: 'valide',
      scoreVotes: 234,
      province: 'Kinshasa',
      votes: users.slice(0, 5).map(u => ({ utilisateur: u._id, valeur: 1 }))
    },
    {
      auteur: users[7]._id,
      titre: 'Réseau d\'observateurs citoyens dans chaque cellule',
      description: 'Mettre en place un réseau d\'un observateur citoyen formé par cellule administrative dans chaque province. Ces observateurs seraient les relais de terrain pour documenter les incidents en temps réel.',
      categorie: 'social',
      statut: 'en_cours',
      scoreVotes: 187,
      votes: users.slice(0, 4).map(u => ({ utilisateur: u._id, valeur: 1 }))
    },
    {
      auteur: users[9]._id,
      titre: 'Tableau de bord cartographique pour les autorités provinciales',
      description: 'Créer un accès spécifique pour les gouverneurs provinciaux avec un tableau de bord cartographique en temps réel des incidents de leur territoire pour faciliter la prise de décision.',
      categorie: 'technologie',
      statut: 'en_attente',
      scoreVotes: 145,
      province: 'Maniema',
      votes: users.slice(0, 3).map(u => ({ utilisateur: u._id, valeur: 1 }))
    },
    {
      auteur: users[5]._id,
      titre: 'Programme de formation aux droits civiques dans les écoles',
      description: 'Intégrer des modules de formation aux droits civiques et à l\'utilisation des outils de signalement citoyen dans les programmes scolaires du secondaire dans toute la RDC.',
      categorie: 'social',
      statut: 'en_attente',
      scoreVotes: 312,
      province: 'Sud-Kivu',
      votes: users.map(u => ({ utilisateur: u._id, valeur: 1 }))
    },
    {
      auteur: users[8]._id,
      titre: 'Énergie solaire pour les centres communautaires ruraux',
      description: 'Installer des panneaux solaires dans les centres communautaires ruraux pour permettre la charge des téléphones et l\'accès à internet, facilitant ainsi la participation citoyenne dans les zones éloignées.',
      categorie: 'environnemental',
      statut: 'valide',
      scoreVotes: 198,
      province: 'Kasaï',
      votes: users.slice(0, 6).map(u => ({ utilisateur: u._id, valeur: 1 }))
    }
  ]);
  console.log(`✅ ${innovations.length} innovations créées`);

  // ── MESSAGES CHAT ─────────────────────────────────────────
  const chatMessages = await ChatMessage.insertMany([
    { auteur: users[0]._id, salon: 'global', contenu: '🇨🇩 Bienvenue sur la plateforme Dynamique Israël Mutombo !', type: 'systeme' },
    { auteur: users[4]._id, salon: 'global', contenu: 'Bonjour à tous ! Qui peut confirmer la situation à Goma ce matin ?' },
    { auteur: users[6]._id, salon: 'global', contenu: 'La situation à Bunia reste tendue. Les forces armées sont en position.' },
    { auteur: users[5]._id, salon: 'global', contenu: 'J\'ai signalé l\'incident de Bukavu. Merci à l\'équipe de modération pour la validation rapide !' },
    { auteur: users[9]._id, salon: 'global', contenu: 'Unité · Résistance · Discipline · Loyauté · Engagement 🇨🇩' },
    { auteur: users[4]._id, salon: 'securite', contenu: 'Situation dans mon quartier : retour au calme depuis ce matin. Merci aux forces de l\'ordre.' },
    { auteur: users[6]._id, salon: 'securite', contenu: 'À Bunia nous avons besoin de renforts. La situation reste préoccupante.' },
    { auteur: users[7]._id, salon: 'transport', contenu: 'La RN4 est vraiment dans un état catastrophique. Quelqu\'un a des nouvelles des travaux ?' },
    { auteur: users[8]._id, salon: 'transport', contenu: 'Même situation sur la route Tshikapa-Kananga. Aucun investissement depuis des années.' },
    { auteur: users[5]._id, salon: 'corruption', contenu: 'Nouveau cas documenté à la douane de Bukavu. Signalement en attente de validation.' },
  ]);
  console.log(`✅ ${chatMessages.length} messages chat créés`);

  console.log('\n🎉 Seeding terminé avec succès !\n');
  console.log('═══════════════════════════════════════');
  console.log('📋 COMPTES DE TEST');
  console.log('───────────────────────────────────────');
  console.log('👑 Super Admin   : superadmin@dynamique.cd');
  console.log('🛡️  Admin         : admin@dynamique.cd');
  console.log('⚙️  Modérateur    : mod.nordkivu@dynamique.cd');
  console.log('✏️  Éditeur       : editeur@dynamique.cd');
  console.log('🏳️  Citoyen 1     : citoyen1@example.cd');
  console.log('🏳️  Citoyen 2     : citoyen2@example.cd');
  console.log('🔑 Mot de passe  : password123');
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Erreur seeding:', err);
  process.exit(1);
});
