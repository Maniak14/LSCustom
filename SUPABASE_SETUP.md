# Configuration Supabase pour LS Custom's Hub

Ce guide vous explique comment configurer Supabase pour stocker les données de votre application (candidatures, sessions, équipe) de manière persistante.

## 📋 Prérequis

1. Un compte GitHub (pour GitHub Pages)
2. Un compte Supabase (gratuit) : [https://supabase.com](https://supabase.com)

## 🚀 Étapes de configuration

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project" ou "New Project"
3. Connectez-vous avec GitHub
4. Créez un nouveau projet :
   - **Nom du projet** : `ls-customs-hub` (ou autre)
   - **Mot de passe de la base de données** : Choisissez un mot de passe fort (notez-le)
   - **Région** : Choisissez la région la plus proche
   - Cliquez sur "Create new project"

### 2. Créer les tables dans Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor** (dans le menu de gauche)
2. Cliquez sur **New query**
3. Copiez tout le contenu du fichier `supabase-setup.sql` dans ce projet
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

Les tables suivantes seront créées :
- `applications` : Stocke les candidatures
- `sessions` : Stocke les sessions de recrutement
- `team_members` : Stocke les membres de l'équipe
- `settings` : Stocke les paramètres (état du recrutement)

### 3. Récupérer les clés API

1. Dans votre projet Supabase, allez dans **Settings** (⚙️) > **API Keys**
2. Vous verrez deux types de clés :

   **🔑 Publishable Key (clé publique)** - **C'est celle dont vous avez besoin !**
   - Cette clé commence par `sb_publishable_...`
   - Elle est **sûre à utiliser dans le navigateur** (côté client)
   - C'est cette clé que vous devez utiliser pour `VITE_SUPABASE_ANON_KEY`
   - Elle est visible dans le code JavaScript, c'est normal et sécurisé grâce aux politiques RLS

   **🔒 Secret Key (clé secrète)** - **NE JAMAIS utiliser celle-ci !**
   - Cette clé commence par `sb_secret_...`
   - Elle donne un accès complet à votre base de données
   - **NE JAMAIS** l'exposer dans le code client (navigateur)
   - Réservée uniquement pour les serveurs backend

3. Copiez les valeurs suivantes :
   - **Project URL** : C'est votre `VITE_SUPABASE_URL` (visible en haut de la page)
   - **Publishable Key** : C'est votre `VITE_SUPABASE_ANON_KEY` (la clé publique, pas la secrète !)

⚠️ **Important** : Si vous voyez encore l'ancienne interface avec "anon" et "service_role", utilisez la clé **"anon"** (c'est l'équivalent de la nouvelle "Publishable key").

### 4. Configurer les variables d'environnement

#### Pour le développement local :

1. Créez un fichier `.env` à la racine du projet (à côté de `package.json`)
2. Ajoutez les variables suivantes :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_votre-clé-publique-ici
```

💡 **Note** : Utilisez la **Publishable Key** (clé publique), pas la Secret Key !

⚠️ **Important** : Ne commitez JAMAIS le fichier `.env` dans Git ! Il est déjà dans `.gitignore`.

#### Pour GitHub Pages :

GitHub Pages ne supporte pas directement les variables d'environnement. Vous avez deux options :

**Option A : Utiliser GitHub Secrets (recommandé pour la sécurité)**

1. Dans votre dépôt GitHub, allez dans **Settings** > **Secrets and variables** > **Actions**
2. Créez deux secrets :
   - `VITE_SUPABASE_URL` : Votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY` : Votre clé anon publique
3. Modifiez votre workflow GitHub Actions pour utiliser ces secrets lors du build

**Option B : Variables publiques (moins sécurisé mais plus simple)**

1. Dans votre dépôt GitHub, allez dans **Settings** > **Secrets and variables** > **Actions**
2. Créez deux variables :
   - `VITE_SUPABASE_URL` : Votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY` : Votre clé anon publique

⚠️ **Note** : La clé "Publishable" est publique par design (elle est visible dans le code JavaScript), mais Supabase utilise RLS (Row Level Security) pour protéger vos données. Les politiques définies dans `supabase-setup.sql` permettent l'accès public pour ce projet.

**🔐 Sécurité des clés :**
- ✅ **Publishable Key** : Peut être utilisée publiquement dans le navigateur (c'est celle qu'on utilise)
- ❌ **Secret Key** : Ne JAMAIS l'utiliser côté client, elle donne un accès complet à votre base de données

### 5. Workflow GitHub Actions (pour GitHub Pages)

✅ **Le workflow est déjà créé !** Le fichier `.github/workflows/deploy.yml` existe déjà dans votre projet.

Le workflow est configuré pour :
- Se déclencher automatiquement à chaque push sur `main` ou `master`
- Utiliser les secrets `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` que vous avez configurés
- Builder votre application et la déployer sur GitHub Pages

**Contenu du workflow** (déjà en place) :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
          
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 6. Activer GitHub Pages (À FAIRE)

Maintenant que le workflow est configuré, vous devez activer GitHub Pages :

1. Dans votre dépôt GitHub, allez dans **Settings** > **Pages**
2. Sous **Source**, sélectionnez **GitHub Actions** (au lieu de "Deploy from a branch")
3. Votre site sera déployé automatiquement à chaque push sur `main` ou `master`

💡 **Note** : Après avoir activé GitHub Actions comme source, le premier push déclenchera automatiquement le workflow de déploiement.

## 🔒 Sécurité

Les politiques RLS (Row Level Security) définies dans `supabase-setup.sql` permettent l'accès public. Pour un environnement de production, vous devriez :

1. Créer des utilisateurs authentifiés dans Supabase
2. Modifier les politiques RLS pour restreindre l'accès
3. Utiliser l'authentification Supabase pour protéger les opérations d'écriture

Pour l'instant, le système utilise un mot de passe simple pour le dashboard. Vous pouvez améliorer cela en utilisant l'authentification Supabase.

## 🧪 Tester la configuration

1. Démarrez l'application en local : `npm run dev`
2. Vérifiez la console du navigateur pour voir si Supabase se connecte correctement
3. Testez en ajoutant une candidature, une session, ou un membre de l'équipe
4. Vérifiez dans Supabase > **Table Editor** que les données sont bien enregistrées

## 📝 Notes importantes

- **Fallback vers localStorage** : Si Supabase n'est pas configuré, l'application utilisera automatiquement localStorage (données locales au navigateur)
- **Gratuit jusqu'à 500MB** : Le plan gratuit de Supabase offre 500MB de base de données, ce qui est largement suffisant pour commencer
- **Backup automatique** : Supabase fait des sauvegardes automatiques quotidiennes

## 🆘 Dépannage

### L'application n'utilise pas Supabase

- Vérifiez que les variables d'environnement sont bien définies
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que les tables existent dans Supabase

### Erreurs de permissions

- Vérifiez que les politiques RLS sont bien créées
- Vérifiez que RLS est activé sur toutes les tables

### Les données ne s'affichent pas

- Vérifiez dans Supabase > **Table Editor** que les données sont bien présentes
- Vérifiez la console du navigateur pour les erreurs de requête

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide GitHub Pages](https://docs.github.com/en/pages)
- [GitHub Actions](https://docs.github.com/en/actions)
