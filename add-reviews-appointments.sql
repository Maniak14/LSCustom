-- Script SQL pour ajouter les tables avis clients et rendez-vous
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Table des avis clients
CREATE TABLE IF NOT EXISTS client_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  id_personnel TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  id_personnel TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT NOT NULL,
  direction_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date_time TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_client_reviews_user_id ON client_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_client_reviews_status ON client_reviews(status);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_direction_user_id ON appointments(direction_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date_time);

-- RLS (Row Level Security)
ALTER TABLE client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre l'accès public
CREATE POLICY "Allow public read access on client_reviews" ON client_reviews
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on client_reviews" ON client_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on client_reviews" ON client_reviews
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on client_reviews" ON client_reviews
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on appointments" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on appointments" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on appointments" ON appointments
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on appointments" ON appointments
  FOR DELETE USING (true);
