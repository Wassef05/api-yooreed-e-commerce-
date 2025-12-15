# 🔧 Configuration MongoDB pour Vercel

## Problème : Données vides malgré la connexion MongoDB

Si votre API retourne des tableaux vides (`products: []`) sur Vercel alors que cela fonctionne en local, voici les étapes pour résoudre le problème.

## ✅ Vérifications à faire

### 1. Variables d'environnement dans Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Vérifiez que `MONGODB_URI` est bien configuré :
   - **Name**: `MONGODB_URI`
   - **Value**: Votre URI MongoDB complète (ex: `mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)
   - **Environments**: Cochez **Production**, **Preview**, et **Development**

### 2. Format de l'URI MongoDB

Assurez-vous que votre URI MongoDB est au format correct :
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Important** :
- Remplacez `username` et `password` par vos identifiants MongoDB Atlas
- Remplacez `cluster.mongodb.net` par l'adresse de votre cluster
- Remplacez `database` par le nom de votre base de données

### 3. MongoDB Atlas Network Access

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com)
2. Allez dans **Network Access**
3. Assurez-vous qu'il y a une règle permettant l'accès depuis **0.0.0.0/0** (toutes les IPs)
   - Si ce n'est pas le cas, cliquez sur **Add IP Address**
   - Sélectionnez **Allow Access from Anywhere**
   - Ou ajoutez manuellement `0.0.0.0/0`

### 4. MongoDB Atlas Database Access

1. Dans MongoDB Atlas, allez dans **Database Access**
2. Vérifiez que votre utilisateur a les permissions **Read and write to any database**

### 5. Redéployer après modification des variables

Après avoir ajouté/modifié des variables d'environnement :
1. Allez dans **Deployments** dans Vercel
2. Cliquez sur les **3 points** du dernier déploiement
3. Sélectionnez **Redeploy**
4. Ou faites un nouveau commit pour déclencher un redéploiement

## 🔍 Vérification des logs Vercel

1. Allez dans **Deployments** → Sélectionnez votre déploiement
2. Cliquez sur **Functions** → `api/index`
3. Regardez les logs pour voir :
   - `🔄 Attempting MongoDB connection to: ...`
   - `✅ MongoDB Connected: ...`
   - Ou des erreurs de connexion

### Logs attendus (succès)

```
🔄 Attempting MongoDB connection to: mongodb+srv://***@...
📊 Current connection state: 0 (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Connection state after connect: 1
🗄️  Database name: yooreedevent
```

### Logs d'erreur courants

#### Erreur d'authentification
```
MongoServerError: Authentication failed
```
**Solution**: Vérifiez le username et password dans votre URI

#### Erreur de réseau
```
MongoNetworkError: failed to connect
```
**Solution**: Vérifiez Network Access dans MongoDB Atlas (doit accepter 0.0.0.0/0)

#### Timeout
```
MongoServerSelectionError: connection timeout
```
**Solution**: Vérifiez votre connexion internet et les paramètres du firewall

## 🧪 Tester la connexion

### Endpoint de test

Testez cet endpoint pour vérifier la connexion :
```
GET https://votre-projet.vercel.app/api/health
```

### Tester les produits

```
GET https://votre-projet.vercel.app/api/products
```

Si vous voyez `products: []` mais pas d'erreur, cela signifie :
- ✅ La connexion MongoDB fonctionne
- ❌ Mais la collection est vide OU vous vous connectez à la mauvaise base de données

## 🔄 Vérifier la base de données utilisée

Dans les logs Vercel, vous devriez voir :
```
🗄️  Database name: yooreedevent
```

Vérifiez que c'est bien la bonne base de données qui contient vos produits.

## 📝 Checklist de vérification

- [ ] Variable `MONGODB_URI` configurée dans Vercel
- [ ] URI MongoDB au format correct (avec nom de base de données)
- [ ] Network Access MongoDB Atlas configuré pour 0.0.0.0/0
- [ ] Utilisateur MongoDB a les permissions Read/Write
- [ ] Redéploiement effectué après modification des variables
- [ ] Logs Vercel montrent une connexion réussie
- [ ] La bonne base de données est utilisée

## 🆘 Si le problème persiste

1. **Vérifiez les logs Vercel** pour voir les erreurs exactes
2. **Testez l'URI localement** avec la même variable d'environnement
3. **Vérifiez que les données existent** dans MongoDB Atlas directement
4. **Contactez le support** si nécessaire avec les logs d'erreur
