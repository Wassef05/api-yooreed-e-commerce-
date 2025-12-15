# 🚀 Guide de Déploiement Backend sur Vercel

## ✅ Correction du problème : API retourne des données vides

Ce guide vous explique comment configurer correctement votre backend sur Vercel pour que l'API retourne les données de MongoDB.

## 📋 Étapes de configuration

### 1. Variables d'environnement dans Vercel

**CRUCIAL** : Vous devez configurer la variable `MONGODB_URI` dans Vercel.

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous et sélectionnez votre projet : `api-yooreed-e-commerce-`
3. Allez dans **Settings** → **Environment Variables**
4. Cliquez sur **Add New**
5. Configurez comme suit :
   - **Key**: `MONGODB_URI`
   - **Value**: Votre URI MongoDB complète
     ```
     mongodb+srv://username:password@cluster.mongodb.net/yooreedevent?retryWrites=true&w=majority
     ```
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
6. Cliquez sur **Save**

### 2. Format de l'URI MongoDB

Votre URI doit être au format suivant :
```
mongodb+srv://VOTRE_USERNAME:VOTRE_PASSWORD@yooreedevent.l3mmgqh.mongodb.net/yooreedevent?retryWrites=true&w=majority&appName=yooreedevent
```

**Points importants** :
- Remplacez `VOTRE_USERNAME` et `VOTRE_PASSWORD` par vos identifiants MongoDB Atlas
- Le nom de la base de données (`yooreedevent`) doit être inclus dans l'URI après le `/`
- Si vous utilisez l'URI par défaut du code, vérifiez qu'elle correspond bien à votre cluster

### 3. MongoDB Atlas - Network Access

1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre cluster
4. Allez dans **Network Access** (menu de gauche)
5. Cliquez sur **Add IP Address**
6. Cliquez sur **Allow Access from Anywhere** (cela ajoute `0.0.0.0/0`)
7. Ou ajoutez manuellement : `0.0.0.0/0`
8. Cliquez sur **Confirm**

### 4. MongoDB Atlas - Database Access

1. Dans MongoDB Atlas, allez dans **Database Access** (menu de gauche)
2. Vérifiez que votre utilisateur a les permissions :
   - **Read and write to any database** ✅
   - Ou au minimum : **Read and write** sur la base `yooreedevent`

### 5. Redéployer après configuration

Après avoir ajouté/modifié la variable `MONGODB_URI` :

**Option 1 : Redéploiement manuel**
1. Allez dans **Deployments** dans Vercel
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Cliquez sur **Redeploy**
4. Confirmez le redéploiement

**Option 2 : Nouveau commit**
1. Faites un petit changement dans le code (ex: ajout d'un commentaire)
2. Commit et push vers GitHub
3. Vercel redéploiera automatiquement

## 🔍 Vérification des logs

### Comment voir les logs Vercel

1. Allez dans **Deployments** → Sélectionnez votre déploiement
2. Cliquez sur **Functions** → `api/index`
3. Regardez les **Logs** ou **Real-time Logs**

### Logs attendus (succès)

Quand tout fonctionne, vous devriez voir :
```
🔄 Starting MongoDB connection...
🔄 Attempting MongoDB connection to: mongodb+srv://***@...
📊 Current connection state: 0 (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Connection state after connect: 1
🗄️  Database name: yooreedevent
✅ MongoDB Connected for Vercel
```

### Logs d'erreur courants

#### Erreur : Variable d'environnement manquante
```
❌ MongoDB connection error: ...
❌ MONGODB_URI present: false
```
**Solution** : Vérifiez que `MONGODB_URI` est bien configuré dans Vercel

#### Erreur : Authentification échouée
```
MongoServerError: Authentication failed
```
**Solution** : Vérifiez le username et password dans votre URI MongoDB

#### Erreur : Accès réseau refusé
```
MongoNetworkError: failed to connect
MongoServerSelectionError: connection timeout
```
**Solution** : Vérifiez Network Access dans MongoDB Atlas (doit accepter `0.0.0.0/0`)

## 🧪 Tester l'API

### Test 1 : Health Check
```bash
curl https://api-yooreed-e-commerce-wassefs-projects.vercel.app/api/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "Yooreed Event API is running"
}
```

### Test 2 : Récupérer les produits
```bash
curl https://api-yooreed-e-commerce-wassefs-projects.vercel.app/api/products
```

Réponse attendue :
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "nom": "...",
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### Si vous voyez `products: []`

Cela signifie que :
- ✅ La connexion MongoDB fonctionne
- ❌ Mais la collection est vide OU vous vous connectez à la mauvaise base de données

**Vérifications** :
1. Dans les logs Vercel, notez le nom de la base de données : `🗄️  Database name: ...`
2. Connectez-vous à MongoDB Atlas
3. Vérifiez que vos produits sont bien dans cette base de données
4. Si non, ajustez l'URI pour pointer vers la bonne base

## 📝 Checklist de vérification

Avant de considérer que c'est résolu, vérifiez :

- [ ] Variable `MONGODB_URI` configurée dans Vercel (Settings → Environment Variables)
- [ ] URI MongoDB au format correct avec le nom de la base de données
- [ ] Network Access MongoDB Atlas configuré pour `0.0.0.0/0`
- [ ] Utilisateur MongoDB a les permissions Read/Write
- [ ] Redéploiement effectué après modification des variables
- [ ] Logs Vercel montrent `✅ MongoDB Connected`
- [ ] Le nom de la base de données dans les logs correspond à celle qui contient vos produits
- [ ] Test `/api/products` retourne vos produits (pas un tableau vide)

## 🔄 Structure du projet

```
backend/
├── api/
│   └── index.ts          # Point d'entrée Vercel (assure la connexion MongoDB)
├── src/
│   ├── server.ts         # Application Express (avec middleware de connexion)
│   ├── config/
│   │   └── database.ts   # Configuration MongoDB
│   └── ...
├── vercel.json           # Configuration Vercel (route vers /api)
└── package.json
```

## 🆘 Si le problème persiste

1. **Vérifiez les logs Vercel en temps réel** pendant que vous testez l'API
2. **Testez l'URI MongoDB localement** :
   ```bash
   # Dans backend/.env
   MONGODB_URI=votre_uri_complete
   npm run dev
   ```
3. **Vérifiez directement dans MongoDB Atlas** que les produits existent
4. **Comparez l'URI locale et celle de Vercel** pour vous assurer qu'elles sont identiques

## 💡 Note importante

Le code a été modifié pour garantir que la connexion MongoDB est établie **avant** de traiter chaque requête. Cela signifie que :
- La première requête peut être plus lente (cold start + connexion)
- Les requêtes suivantes seront plus rapides (connexion réutilisée)
- Si la connexion échoue, vous recevrez une erreur 503 avec un message clair

## ✅ Résultat attendu

Une fois configuré correctement, vous devriez pouvoir accéder à :
```
https://api-yooreed-e-commerce-wassefs-projects.vercel.app/api/products
```

Et recevoir vos produits avec leurs données complètes, exactement comme en local.
