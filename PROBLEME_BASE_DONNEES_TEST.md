# ⚠️ PROBLÈME CRITIQUE : Base de données "test" au lieu de "yooreedevent"

## 🔍 Diagnostic

Dans les logs Vercel, vous voyez :
```
🗄️  Database name: test
📦 getProducts - Database name: test
📦 getProducts - Total documents found: 0
```

**Le problème :** Votre API se connecte à la base de données `test` au lieu de `yooreedevent`, c'est pourquoi il n'y a pas de produits !

## ✅ Solution

### Étape 1 : Vérifier votre variable MONGODB_URI dans Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet : `api-yooreed-e-commerce-`
3. Allez dans **Settings** → **Environment Variables**
4. Cherchez `MONGODB_URI`
5. Vérifiez que l'URI contient bien le nom de la base de données :

**❌ MAUVAIS (sans nom de base) :**
```
mongodb+srv://username:password@cluster.mongodb.net?retryWrites=true&w=majority
```

**✅ BON (avec nom de base) :**
```
mongodb+srv://username:password@cluster.mongodb.net/yooreedevent?retryWrites=true&w=majority
```

### Étape 2 : Corriger l'URI

**Format correct de l'URI :**
```
mongodb+srv://VOTRE_USERNAME:VOTRE_PASSWORD@yooreedevent.l3mmgqh.mongodb.net/yooreedevent?retryWrites=true&w=majority&appName=yooreedevent
```

**Points importants :**
- Le nom de la base de données (`yooreedevent`) doit être **après le `/`** et **avant le `?`**
- Format : `mongodb+srv://.../NOM_DE_LA_BASE?paramètres`

### Étape 3 : Si MONGODB_URI n'existe pas dans Vercel

1. Cliquez sur **Add New**
2. **Key**: `MONGODB_URI`
3. **Value**: Votre URI complète avec `/yooreedevent`
4. **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. Cliquez sur **Save**

### Étape 4 : Redéployer

Après avoir modifié la variable :
1. Allez dans **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Cliquez sur **Redeploy**
4. Confirmez

### Étape 5 : Vérifier les logs

Après redéploiement, testez l'endpoint `/api/products` et vérifiez les logs :

**✅ Succès attendu :**
```
🗄️  Database name: yooreedevent  <-- Doit être "yooreedevent", pas "test"
📦 getProducts - Database name: yooreedevent
📦 getProducts - Total documents found: 10  <-- Doit être > 0
```

## 🔍 Comment MongoDB détermine le nom de la base de données

MongoDB utilise le nom de la base spécifié dans l'URI :
- Si l'URI est : `mongodb+srv://.../yooreedevent?retryWrites=true`
  → Se connecte à la base `yooreedevent` ✅

- Si l'URI est : `mongodb+srv://.../?retryWrites=true` (pas de nom)
  → Se connecte à la base par défaut `test` ❌

## 📝 Checklist

- [ ] Variable `MONGODB_URI` existe dans Vercel
- [ ] L'URI contient `/yooreedevent` avant le `?`
- [ ] Format : `mongodb+srv://.../yooreedevent?retryWrites=true&w=majority`
- [ ] Redéploiement effectué
- [ ] Logs montrent `🗄️ Database name: yooreedevent`
- [ ] `/api/products` retourne des produits

## 🆘 Si le problème persiste

1. **Vérifiez l'URI exacte** dans Vercel (copiez-collez pour vérifier)
2. **Comparez avec votre URI locale** (dans `.env` local)
3. **Vérifiez dans MongoDB Atlas** :
   - Allez dans **Collections**
   - Vérifiez que les produits existent dans la base `yooreedevent`
   - Si les produits sont dans une autre base, ajustez l'URI

## 🎯 Résultat attendu

Après correction, les logs doivent montrer :
```
🗄️  Database name: yooreedevent
📦 getProducts - Total documents found: 10
```

Et `/api/products` doit retourner vos produits !
