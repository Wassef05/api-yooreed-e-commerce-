# Déploiement sur Vercel

Ce guide explique comment déployer le backend Yooreed Event sur Vercel.

## 📋 Prérequis

1. Compte GitHub avec le repository du backend
2. Compte Vercel
3. Variables d'environnement configurées

## 🚀 Étapes de déploiement

### 1. Connecter le repository sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre repository GitHub `api-yooreed-e-commerce-`
4. Configurez le projet :
   - **Framework Preset**: Other
   - **Root Directory**: `./` (racine du repository)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Configurer les variables d'environnement

Dans les paramètres du projet Vercel, ajoutez les variables d'environnement suivantes :

#### Obligatoires
- `NODE_ENV`: `production`
- `MONGODB_URI`: Votre URI MongoDB (Atlas recommandé)
- `JWT_SECRET`: Une clé secrète forte pour JWT
- `FRONTEND_URL`: L'URL de votre frontend déployé (ex: `https://votre-frontend.vercel.app`)

#### Optionnelles mais recommandées
- `PORT`: (géré automatiquement par Vercel)
- `JWT_EXPIRE`: `7d` (par défaut)
- `CLOUDINARY_CLOUD_NAME`: Pour l'upload d'images
- `CLOUDINARY_API_KEY`: Clé API Cloudinary
- `CLOUDINARY_API_SECRET`: Secret API Cloudinary
- `EMAIL_HOST`: `smtp.gmail.com` ou votre serveur SMTP
- `EMAIL_PORT`: `587`
- `EMAIL_USER`: Votre email SMTP
- `EMAIL_PASS`: Mot de passe SMTP
- `EMAIL_FROM`: `noreply@yooreed-event.com`
- `ADMIN_EMAIL`: Email de l'administrateur

### 3. Configuration Vercel

Le fichier `vercel.json` est déjà configuré pour :
- Utiliser `@vercel/node` pour les fonctions serverless
- Router toutes les requêtes vers `api/index.ts`
- Gérer les routes API correctement

### 4. Déploiement

Une fois configuré, Vercel va :
1. Détecter automatiquement le projet Node.js
2. Installer les dépendances (`npm install`)
3. Build le projet (`npm run build`)
4. Déployer l'API

### 5. Test de l'API

Une fois déployé, testez l'endpoint de health check :
```
GET https://votre-projet.vercel.app/api/health
```

Vous devriez recevoir :
```json
{
  "status": "OK",
  "message": "Yooreed Event API is running"
}
```

## 🔧 Structure du projet pour Vercel

```
backend/
├── api/
│   └── index.ts          # Point d'entrée pour Vercel
├── src/
│   └── server.ts         # Application Express
├── vercel.json           # Configuration Vercel
├── package.json
└── tsconfig.json
```

## ⚠️ Notes importantes

1. **Base de données**: Assurez-vous que votre MongoDB Atlas accepte les connexions depuis n'importe quelle IP (0.0.0.0/0) dans les Network Access settings.

2. **CORS**: Configurez `FRONTEND_URL` avec l'URL exacte de votre frontend pour éviter les erreurs CORS.

3. **Variables d'environnement**: Ne commitez JAMAIS vos variables d'environnement dans le code. Utilisez toujours les variables d'environnement Vercel.

4. **Limites Vercel**: 
   - Free tier: 100GB bandwidth/mois
   - Fonctions serverless: 10s timeout (gratuit), 60s (Pro)
   - Si votre API prend plus de 10s, envisagez d'optimiser ou d'upgrader

5. **Cold starts**: La première requête après inactivité peut être plus lente (cold start). C'est normal avec les fonctions serverless.

## 📝 Scripts disponibles

- `npm run build`: Compile TypeScript vers JavaScript
- `npm start`: Démarre le serveur en production (non utilisé sur Vercel)
- `npm run dev`: Développement local avec hot-reload

## 🐛 Dépannage

### Erreur de connexion MongoDB
- Vérifiez que `MONGODB_URI` est correctement configuré
- Vérifiez les Network Access dans MongoDB Atlas
- Vérifiez les logs Vercel pour plus de détails

### Erreur CORS
- Vérifiez que `FRONTEND_URL` correspond exactement à l'URL du frontend
- Incluez le protocole (`https://`)

### Timeout
- Optimisez vos requêtes
- Considérez un upgrade vers Vercel Pro pour 60s timeout

## 🔗 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Node.js](https://vercel.com/docs/runtimes/official-runtimes/node-js)

