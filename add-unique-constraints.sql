-- Migration pour ajouter les contraintes UNIQUE sur id_personnel et telephone
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter une contrainte UNIQUE sur id_personnel si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_id_personnel_unique'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_id_personnel_unique UNIQUE (id_personnel);
  END IF;
END $$;

-- Ajouter une contrainte UNIQUE sur telephone si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_telephone_unique'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_telephone_unique UNIQUE (telephone);
  END IF;
END $$;

-- Vérifier les contraintes ajoutées
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE conrelid = 'users'::regclass
  AND contype = 'u'
  AND (conname = 'users_id_personnel_unique' OR conname = 'users_telephone_unique');
