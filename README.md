# Yooreed Event - Backend

API REST backend pour la plateforme e-commerce Yooreed Event.

## 🚀 Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Typage statique
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **Express Validator** - Validation des données

## 📦 Installation

```bash
npm install
```

## 🏃 Démarrage

### Mode développement

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

### Mode production

```bash
npm run build
npm start
```

## 🔧 Configuration

Copier `.env.example` vers `.env` et configurer les variables d'environnement :

```bash
cp .env.example .env
```

Variables disponibles :
- `PORT` - Port du serveur (défaut: 5000)
- `NODE_ENV` - Environnement (development/production)
- `FRONTEND_URL` - URL du frontend pour CORS
- `MONGODB_URI` - URI de connexion MongoDB
- `JWT_SECRET` - Secret pour JWT
- `JWT_EXPIRE` - Durée d'expiration JWT
- `EMAIL_*` - Configuration email (Nodemailer)

## 🏗️ Structure

```
src/
├── controllers/    # Contrôleurs des routes
├── models/         # Modèles MongoDB/Mongoose
├── routes/         # Définition des routes
├── middleware/     # Middlewares (auth, validation)
├── services/       # Logique métier
├── utils/          # Utilitaires
├── types/          # Types TypeScript
└── config/         # Configuration (DB, email, etc.)
```

## 📝 Scripts

- `npm run dev` - Démarrer avec hot-reload (tsx watch)
- `npm run build` - Compiler TypeScript
- `npm start` - Démarrer en production
- `npm run lint` - Linter le code
- `npm run type-check` - Vérifier les types TypeScript

## 🔌 API Endpoints

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit (admin)
- `PUT /api/products/:id` - Modifier un produit (admin)
- `DELETE /api/products/:id` - Supprimer un produit (admin)

### Catégories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie (admin)
- `PUT /api/categories/:id` - Modifier une catégorie (admin)
- `DELETE /api/categories/:id` - Supprimer une catégorie (admin)

### Commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Liste des commandes (admin)
- `GET /api/orders/:id` - Détails d'une commande (admin)
- `PUT /api/orders/:id/status` - Changer le statut (admin)

### Devis
- `POST /api/quotes` - Demander un devis
- `GET /api/quotes` - Liste des devis (admin)
- `GET /api/quotes/:id` - Détails d'un devis (admin)
- `PUT /api/quotes/:id/status` - Changer le statut (admin)

### Contact
- `POST /api/contact` - Envoyer un message de contact

### Authentification
- `POST /api/auth/login` - Connexion admin
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Vérifier la session

## 🔒 Sécurité

- Authentification JWT
- Validation des inputs avec Express Validator
- Rate limiting
- Headers de sécurité (Helmet)
- CORS configuré
- Protection contre les injections MongoDB

