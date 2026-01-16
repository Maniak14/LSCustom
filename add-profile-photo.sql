-- Script SQL pour ajouter le champ photo_url à la table users
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

ALTER TABLE users
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Index pour améliorer les performances si nécessaire
-- CREATE INDEX IF NOT EXISTS idx_users_photo_url ON users(photo_url) WHERE photo_url IS NOT NULL;
