# LSCustom's - Site Web

## À propos

Site web officiel de LSCustom's, le garage de référence à Los Santos. Réparations, customisation et performances depuis 1987.

## Technologies utilisées

Ce projet est construit avec :

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (optionnel)

## Installation et développement

### Prérequis

- Node.js & npm installés - [installer avec nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Étapes d'installation

```sh
# Étape 1 : Cloner le dépôt
git clone <YOUR_GIT_URL>

# Étape 2 : Naviguer vers le répertoire du projet
cd ls-customs-hub-24

# Étape 3 : Installer les dépendances
npm i

# Étape 4 : Démarrer le serveur de développement
npm run dev
```

## Déploiement

Le projet est configuré pour être déployé sur GitHub Pages. Les modifications sont automatiquement déployées via GitHub Actions.

### Configuration GitHub Pages

1. Allez dans les paramètres du dépôt GitHub
2. Activez GitHub Pages dans la section "Pages"
3. Configurez la source sur "GitHub Actions"

## Configuration Supabase (optionnel)

Pour utiliser Supabase comme backend, suivez les instructions dans `SUPABASE_SETUP.md`.

## Structure du projet

- `/src/components` - Composants React réutilisables
- `/src/pages` - Pages de l'application
- `/src/contexts` - Contextes React pour la gestion d'état
- `/src/lib` - Utilitaires et configurations
- `/public` - Fichiers statiques

## Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser le build de production
- `npm run lint` - Lancer le linter
