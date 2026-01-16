-- Script SQL pour créer les tables dans Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Table des candidatures
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_rp TEXT NOT NULL,
  prenom_rp TEXT NOT NULL,
  id_joueur TEXT NOT NULL,
  motivation TEXT NOT NULL,
  experience TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  session_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des sessions de recrutement
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Table des membres de l'équipe
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  role TEXT NOT NULL,
  photo TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des paramètres
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_personnel TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  telephone TEXT NOT NULL,
  prenom TEXT,
  nom TEXT,
  grade TEXT NOT NULL CHECK (grade IN ('direction', 'client')) DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_applications_session_id ON applications(session_id);
CREATE INDEX IF NOT EXISTS idx_applications_id_joueur ON applications(id_joueur);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_users_id_personnel ON users(id_personnel);

-- RLS (Row Level Security) - Activer l'accès public en lecture/écriture pour ce projet
-- ATTENTION: Pour la production, configurez des politiques de sécurité appropriées

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre l'accès public (à adapter selon vos besoins de sécurité)
CREATE POLICY "Allow public read access on applications" ON applications
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on applications" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on applications" ON applications
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on sessions" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on sessions" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on sessions" ON sessions
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on team_members" ON team_members
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on team_members" ON team_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on team_members" ON team_members
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on team_members" ON team_members
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Allow public update access on settings" ON settings
  FOR UPDATE USING (true);

CREATE POLICY "Allow public insert access on settings" ON settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on users" ON users
  FOR UPDATE USING (true);

-- Pour créer le premier utilisateur "direction", exécutez cette commande :
-- INSERT INTO users (id_personnel, password, telephone, grade) 
-- VALUES ('votre-id-direction', 'votre-mot-de-passe', 'votre-telephone', 'direction');
