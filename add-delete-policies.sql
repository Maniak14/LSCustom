-- Migration pour ajouter les politiques DELETE pour applications et users
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la politique DELETE pour applications si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'applications' 
    AND policyname = 'Allow public delete access on applications'
  ) THEN
    CREATE POLICY "Allow public delete access on applications" ON applications
      FOR DELETE USING (true);
  END IF;
END $$;

-- Ajouter la politique DELETE pour users si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Allow public delete access on users'
  ) THEN
    CREATE POLICY "Allow public delete access on users" ON users
      FOR DELETE USING (true);
  END IF;
END $$;

-- Vérifier les politiques ajoutées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('applications', 'users')
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;
