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
ALTER TABLE partenaires ENABLE ROW LEVEL SECURITY;

-- Politiques d'accès
CREATE POLICY "Allow public read access on partenaires" ON partenaires
  FOR SELECT USING (true);
CREATE POLICY "Allow admin insert on partenaires" ON partenaires
  FOR INSERT WITH CHECK ((SELECT grade FROM users WHERE id = auth.uid()) = 'direction');
CREATE POLICY "Allow admin update on partenaires" ON partenaires
  FOR UPDATE USING ((SELECT grade FROM users WHERE id = auth.uid()) = 'direction');
CREATE POLICY "Allow admin delete on partenaires" ON partenaires
  FOR DELETE USING ((SELECT grade FROM users WHERE id = auth.uid()) = 'direction');
