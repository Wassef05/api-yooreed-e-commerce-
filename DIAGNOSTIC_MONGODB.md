# 🔍 Diagnostic MongoDB - Problème de données vides

## Problème

L'API retourne `products: []` alors qu'en local les données sont présentes.

## ✅ Corrections apportées

1. **Correction de `trust proxy`** pour express-rate-limit sur Vercel
2. **Ajout de logs de débogage** dans `productController.ts`
3. **Ajout d'endpoint de diagnostic** `/api/debug/db`

## 🧪 Étapes de diagnostic

### 1. Vérifier les logs Vercel en temps réel

1. Allez dans **Vercel Dashboard** → **Deployments** → Votre dernier déploiement
2. Cliquez sur **Functions** → `api/index`
3. Ouvrez **Real-time Logs**
4. Testez l'endpoint : `GET https://api-yooreed-e-commerce-wassefs-projects.vercel.app/api/products`

**Logs attendus :**
```
📥 Incoming request: GET /api/products
🔄 Starting MongoDB connection...
🔄 Attempting MongoDB connection to: mongodb+srv://***@...
✅ MongoDB Connected: ...
🗄️  Database name: yooreedevent
✅ MongoDB Connected for Vercel
✅ DB connection verified - DB: yooreedevent, State: 1
🔍 API request to /products, DB state: 1
📦 getProducts - Query: {}
📦 getProducts - MongoDB connection state: 1
📦 getProducts - Database name: yooreedevent
📦 getProducts - Total documents found: 0  <-- ICI EST LE PROBLÈME
📦 getProducts - Products returned: 0
```

### 2. Utiliser l'endpoint de diagnostic

Testez cet endpoint :
```
GET https://api-yooreed-e-commerce-wassefs-projects.vercel.app/api/debug/db
```

Cet endpoint vous donnera :
- L'état de la connexion MongoDB
- Le nom de la base de données utilisée
- Le nombre de produits dans la collection
- Un échantillon de produits (5 premiers)

**Réponse attendue :**
```json
{
  "success": true,
  "mongodb": {
    "state": 1,
    "stateText": "connected",
    "database": "yooreedevent",
    "host": "cluster0-shard-00-00.xxxxx.mongodb.net"
  },
  "collections": {
    "products": {
      "total": 10,  // <-- Si c'est 0, la collection est vide
      "sample": [...]
    },
    "categories": {
      "total": 5
    }
  }
}
```

### 3. Vérifier la variable d'environnement MONGODB_URI

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Vérifiez que `MONGODB_URI` est bien configuré
3. Vérifiez le format :
   ```
   mongodb+srv://username:password@cluster.mongodb.net/yooreedevent?retryWrites=true&w=majority
   ```
   ⚠️ **Important** : Le nom de la base de données (`yooreedevent`) doit être dans l'URI après le `/`

### 4. Comparer l'URI locale et Vercel

**Localement :**
```bash
# Dans backend/.env
cat .env | grep MONGODB_URI
```

**Sur Vercel :**
- Vérifiez dans Settings → Environment Variables

Les deux doivent pointer vers **la même base de données**.

### 5. Vérifier directement dans MongoDB Atlas

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com)
2. Allez dans **Collections**
3. Sélectionnez la base de données `yooreedevent`
4. Vérifiez la collection `products`
5. **Comptez les documents**

**Si la collection est vide :**
- Les données sont peut-être dans une autre base de données
- Vérifiez dans quelle base de données vous avez créé les produits en local

### 6. Vérifier le nom de la base de données dans les logs

Dans les logs Vercel, cherchez :
```
🗄️  Database name: ...
```

Ce nom doit correspondre à la base de données qui contient vos produits dans MongoDB Atlas.

## 🔧 Solutions possibles

### Solution 1 : La collection est vide dans la bonne base

Si `/api/debug/db` montre `total: 0` :
- La connexion fonctionne ✅
- Mais la collection est vide ❌

**Actions :**
1. Vérifiez dans MongoDB Atlas que les produits existent
2. Si non, importez les données depuis votre environnement local
3. Ou vérifiez que vous utilisez la bonne base de données

### Solution 2 : Connexion à la mauvaise base de données

Si les logs montrent une base de données différente :
```
🗄️  Database name: yooreedevent-dev  // Mais vos produits sont dans "yooreedevent"
```

**Actions :**
1. Modifiez `MONGODB_URI` dans Vercel pour pointer vers la bonne base
2. Format : `mongodb+srv://.../NOM_DE_LA_BONNE_BASE?retryWrites=true&w=majority`
3. Redéployez

### Solution 3 : Variable d'environnement non configurée

Si les logs montrent :
```
🔄 Attempting MongoDB connection to: default URI
❌ MONGODB_URI present: false
```

**Actions :**
1. Ajoutez `MONGODB_URI` dans Vercel (Settings → Environment Variables)
2. Redéployez

### Solution 4 : Problème de réseau/permissions

Si vous voyez des erreurs de connexion :
```
MongoNetworkError: failed to connect
MongoServerSelectionError: connection timeout
```

**Actions :**
1. MongoDB Atlas → **Network Access**
2. Ajoutez `0.0.0.0/0` (Allow Access from Anywhere)
3. Vérifiez **Database Access** que l'utilisateur a les permissions Read/Write

## 📝 Checklist de vérification

- [ ] Variable `MONGODB_URI` configurée dans Vercel
- [ ] L'URI contient le nom de la base de données (`/yooreedevent`)
- [ ] Le nom de la base dans les logs correspond à celle qui contient vos produits
- [ ] `/api/debug/db` montre `total > 0` pour les produits
- [ ] Les produits existent dans MongoDB Atlas dans la collection `products`
- [ ] Network Access MongoDB Atlas accepte `0.0.0.0/0`
- [ ] L'utilisateur MongoDB a les permissions Read/Write

## 🆘 Si rien ne fonctionne

1. **Comparez l'URI locale et Vercel** - elles doivent être identiques
2. **Vérifiez les logs en temps réel** pendant que vous testez l'API
3. **Testez `/api/debug/db`** pour voir exactement ce qui se passe
4. **Vérifiez dans MongoDB Atlas** directement que les produits existent

## 🎯 Résultat attendu

Après correction, `/api/debug/db` doit retourner :
```json
{
  "collections": {
    "products": {
      "total": 10,  // > 0
      "sample": [
        { "_id": "...", "nom": "Produit 1", "categorie": "..." },
        ...
      ]
    }
  }
}
```

Et `/api/products` doit retourner vos produits :
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
      "total": 10,  // > 0
      ...
    }
  }
}
```
