-- Script SQL pour créer la table partenaires dans Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

CREATE TABLE IF NOT EXISTS partenaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_partenaires_nom ON partenaires(nom);
CREATE INDEX IF NOT EXISTS idx_partenaires_created_at ON partenaires(created_at);

-- RLS (Row Level Security)
-- Note: L'authentification est gérée par l'application, donc on permet les opérations publiques
-- La sécurité est assurée par l'authentification de l'application (Panel uniquement accessible aux admins)
ALTER TABLE partenaires ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read access on partenaires" ON partenaires;
DROP POLICY IF EXISTS "Allow admin insert on partenaires" ON partenaires;
DROP POLICY IF EXISTS "Allow admin update on partenaires" ON partenaires;
DROP POLICY IF EXISTS "Allow admin delete on partenaires" ON partenaires;
DROP POLICY IF EXISTS "Allow public insert on partenaires" ON partenaires;
DROP POLICY IF EXISTS "Allow public update on partenaires" ON partenaires;
DROP POLICY IF EXISTS "Allow public delete on partenaires" ON partenaires;

-- Politiques d'accès
CREATE POLICY "Allow public read access on partenaires" ON partenaires
  FOR SELECT USING (true);

-- Permettre toutes les opérations (insert, update, delete) publiquement
-- La sécurité est gérée par l'authentification de l'application
CREATE POLICY "Allow public insert on partenaires" ON partenaires
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on partenaires" ON partenaires
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on partenaires" ON partenaires
  FOR DELETE USING (true);
