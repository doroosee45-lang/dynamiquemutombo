# 🇨🇩 Dynamique Israël Mutombo — Plateforme Citoyenne Numérique v2.0

> **Informer · Dénoncer · Mobiliser · Protéger**  
> *Unité · Résistance · Discipline · Loyauté · Engagement*

Application Web MERN complète — Couverture 26 Provinces RDC + 4 Districts Kinshasa

---

## 🏗️ Architecture

```
dynamique-rdc/
├── backend/                          # Node.js + Express + MongoDB
│   ├── config/
│   │   ├── db.js                     # Connexion MongoDB
│   │   └── constants.js              # Provinces, rôles, gamification
│   ├── models/
│   │   ├── User.js                   # Utilisateur + réputation + badges
│   │   ├── Signalement.js            # Signalements + IA + votes
│   │   ├── Publication.js            # Articles & enquêtes
│   │   └── index.js                  # Comment, Petition, Campaign, Notification, ChatMessage, Innovation
│   ├── controllers/
│   │   ├── authController.js         # Auth JWT + refresh
│   │   ├── signalementController.js  # CRUD + vote + modération + heatmap
│   │   ├── contentController.js      # Publications, pétitions, campagnes, innovations
│   │   └── adminController.js        # Dashboard + users + alertes + leaderboard
│   ├── middleware/
│   │   ├── auth.js                   # JWT protect + RBAC + province scope
│   │   └── error.js                  # Handler global + rate limiters
│   ├── routes/
│   │   ├── auth.js
│   │   ├── signalements.js
│   │   └── index.js                  # Toutes les autres routes
│   ├── services/
│   │   ├── aiService.js              # Détection faux, sentiment, doublons, résumé
│   │   └── socketService.js          # Chat temps réel + notifications + alertes
│   ├── uploads/                      # Fichiers uploadés (créé automatiquement)
│   └── server.js                     # Point d'entrée
│
└── frontend/                         # React 18 + Vite + Tailwind CSS 3
    └── src/
        ├── App.jsx                   # Routing complet (public + protégé + admin)
        ├── main.jsx                  # Entry point React
        ├── store.js                  # Zustand (auth + socket + notifs + UI)
        ├── index.css                 # Design system RDC dark complet
        ├── services/api.js           # Axios + auto-refresh token
        ├── pages/
        │   ├── Home.jsx              # Accueil + KPIs + fil récent
        │   ├── Signalements.jsx      # Liste + filtres + création
        │   ├── SignalementDetail.jsx # Détail + vote + IA + commentaires
        │   ├── MapPage.jsx           # Carte Leaflet + heatmap + filtres
        │   ├── Chat.jsx              # Chat temps réel + salons
        │   ├── Profile.jsx           # Profil + signalements + notifications
        │   ├── Auth.jsx              # Login + Register
        │   ├── Content.jsx           # Publications, Pétitions, Campagnes, Innovations, Leaderboard
        │   └── admin/
        │       ├── AdminDashboard.jsx    # Charts + KPIs + alertes
        │       ├── AdminSignalements.jsx # Modération 1 clic + IA
        │       └── AdminPages.jsx        # AdminUsers + AdminProvinces
        └── components/
            └── layout/Layout.jsx     # Sidebar + topbar + notifications
```

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js ≥ 18
- MongoDB ≥ 6 (local ou Atlas)
- npm ou yarn

### Backend

```bash
cd backend
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec votre MongoDB URI et secrets JWT

# Créer le dossier uploads
mkdir uploads

# Démarrer en développement
npm run dev

# ✅ API: http://localhost:5000/api
# ✅ Health: GET http://localhost:5000/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev

# ✅ App: http://localhost:5173
```

---

## ⚙️ Variables d'environnement

| Variable             | Description              | Exemple                                    |
|----------------------|--------------------------|--------------------------------------------|
| `PORT`               | Port serveur             | `5000`                                     |
| `MONGO_URI`          | URI MongoDB              | `mongodb://localhost:27017/dynamique_rdc`  |
| `JWT_SECRET`         | Secret access token      | `secret_fort_aleatoire`                    |
| `JWT_REFRESH_SECRET` | Secret refresh token     | `autre_secret_fort`                        |
| `JWT_EXPIRE`         | Durée access token       | `15m`                                      |
| `JWT_REFRESH_EXPIRE` | Durée refresh token      | `7d`                                       |
| `CLIENT_URL`         | URL frontend             | `http://localhost:5173`                    |
| `NODE_ENV`           | Environnement            | `development`                              |

---

## 📡 API Endpoints

### Auth
| Méthode | Route                  | Description         | Auth |
|---------|------------------------|---------------------|------|
| POST    | `/api/auth/register`   | Inscription         | ✗    |
| POST    | `/api/auth/login`      | Connexion           | ✗    |
| POST    | `/api/auth/refresh`    | Rafraîchir token    | ✗    |
| GET     | `/api/auth/me`         | Profil courant      | ✓    |
| PUT     | `/api/auth/me`         | Modifier profil     | ✓    |
| POST    | `/api/auth/logout`     | Déconnexion         | ✓    |

### Signalements
| Méthode | Route                              | Description                  | Auth      |
|---------|------------------------------------|------------------------------|-----------|
| GET     | `/api/signalements`                | Liste + filtres + pagination | Optionnel |
| POST    | `/api/signalements`                | Créer + upload médias        | ✓         |
| GET     | `/api/signalements/:id`            | Détail + commentaires        | Optionnel |
| POST    | `/api/signalements/:id/vote`       | Voter                        | ✓         |
| PUT     | `/api/signalements/:id/moderate`   | Modérer (statut)             | Mod+      |
| GET     | `/api/signalements/heatmap`        | Points GPS pour carte        | ✗         |
| GET     | `/api/signalements/province-stats` | Stats par province           | ✗         |
| GET     | `/api/signalements/mine`           | Mes signalements             | ✓         |

### Contenu
| Méthode | Route                          | Description              | Auth  |
|---------|--------------------------------|--------------------------|-------|
| GET     | `/api/publications`            | Liste publications       | ✗     |
| POST    | `/api/publications`            | Créer publication        | Édit+ |
| POST    | `/api/comments`                | Ajouter commentaire      | ✓     |
| GET     | `/api/petitions`               | Liste pétitions          | ✗     |
| POST    | `/api/petitions`               | Créer pétition           | ✓     |
| POST    | `/api/petitions/:id/signer`    | Signer pétition          | ✓     |
| GET     | `/api/campaigns`               | Liste campagnes          | ✗     |
| POST    | `/api/campaigns`               | Créer campagne           | Édit+ |
| POST    | `/api/campaigns/:id/rejoindre` | Rejoindre campagne       | ✓     |
| GET     | `/api/innovations`             | Liste innovations        | ✗     |
| POST    | `/api/innovations`             | Soumettre innovation     | ✓     |
| POST    | `/api/innovations/:id/vote`    | Voter innovation         | ✓     |

### Admin
| Méthode | Route                        | Description            | Auth  |
|---------|------------------------------|------------------------|-------|
| GET     | `/api/admin/dashboard`       | KPIs nationaux         | Mod+  |
| GET     | `/api/admin/users`           | Liste utilisateurs     | Admin |
| PUT     | `/api/admin/users/:id`       | Modifier rôle/province | Admin |
| PUT     | `/api/admin/users/:id/ban`   | Bannir utilisateur     | Admin |
| POST    | `/api/admin/alert`           | Envoyer alerte         | Mod+  |
| GET     | `/api/admin/leaderboard`     | Classement             | ✗     |

---

## 🔌 WebSocket Events

### Client → Serveur
| Event        | Payload                           | Description          |
|--------------|-----------------------------------|----------------------|
| `joinRoom`   | `{ room, userId, nom }`           | Rejoindre salon      |
| `leaveRoom`  | `{ room }`                        | Quitter salon        |
| `sendMessage`| `{ room, content, auteurId, nom }`| Envoyer message      |
| `typing`     | `{ room, nom, isTyping }`         | Indicateur frappe    |
| `react`      | `{ messageId, emoji, room }`      | Réaction             |

### Serveur → Client
| Event           | Description                     |
|-----------------|---------------------------------|
| `chatMessage`   | Nouveau message dans salon      |
| `roomUsers`     | Utilisateurs en ligne           |
| `userTyping`    | Indicateur de frappe            |
| `alert`         | Alerte provinciale/nationale    |
| `reactionUpdated`| Mise à jour réactions          |

---

## 🎨 Design System

- **Dark mode exclusif** — Fond `#0a0a0f`
- **Couleurs RDC** : Rouge `#CE1126` · Bleu `#007FFF` · Vert `#009A44` · Jaune `#F7D618`
- **Typographie** : Inter (texte) + JetBrains Mono (chiffres/code)
- **Composants** : Cards, badges, boutons, inputs — tous en custom CSS variables

---

## 👥 Rôles & Accès

| Rôle        | Accès                                                   |
|-------------|---------------------------------------------------------|
| `citizen`   | Signaler, voter, commenter, pétitions, chat, innovations|
| `moderator` | + Modérer signalements (province assignée)              |
| `editor`    | + Publier articles, créer campagnes                     |
| `admin`     | + Gérer utilisateurs, envoyer alertes                   |
| `superadmin`| Accès total                                             |

---

## 🏆 Gamification

| Action              | Points |
|---------------------|--------|
| Signalement validé  | +50    |
| Commentaire approuvé| +10    |
| Vote                | +5     |
| Signalement résolu  | +100   |
| Innovation validée  | +200   |
| Pétition signée     | +15    |
| Campagne rejointe   | +20    |

**Badges** : 👁️ Observateur (500 pts) · ✊ Activiste (2000 pts) · ⭐ Leader Citoyen (5000 pts) · 💡 Innovateur (spécial)

---

## 🤖 Intelligence Artificielle

1. **Détection faux signalements** — Heuristiques comportementales → score 0–1
2. **Analyse de sentiment** — `positif` · `neutre` · `négatif` · `alarmant`
3. **Détection doublons** — Similarité Jaccard sur textes récents (même province + type)
4. **Résumé automatique** — 2 premières phrases informatives
5. **Priorisation auto** — `alarmant` → `critical`, `négatif` → `high`

---

## 📦 Stack Technique

| Couche     | Technologie                       |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS 3  |
| State      | Zustand + TanStack Query          |
| Carte      | React Leaflet + CartoDB dark      |
| Charts     | Recharts                          |
| Backend    | Node.js 18 + Express 4            |
| DB         | MongoDB + Mongoose + Paginate     |
| Temps réel | Socket.io 4                       |
| Auth       | JWT (access 15min + refresh 7j)   |
| Upload     | Multer (local)                    |

---

## 📄 Licence

Propriété exclusive de la **Dynamique Israël Mutombo** · RDC · 2025  
Document confidentiel — Tous droits réservés

---

*Vive Israël Mutombo · Vive la Dynamique · Vive le Comité National*  
**🇨🇩 Unité · Résistance · Discipline · Loyauté · Engagement**
