-- Migration pour ajouter les contraintes UNIQUE sur id_personnel et telephone
-- À exécuter dans l'éditeur SQL de Supabase
-- Ce script gère d'abord les doublons existants avant d'ajouter les contraintes

-- 1. Identifier et résoudre les doublons de telephone
-- Afficher les doublons de téléphone
SELECT telephone, COUNT(*) as count
FROM users
GROUP BY telephone
HAVING COUNT(*) > 1;

-- Pour chaque téléphone en double, on va garder le premier utilisateur (le plus ancien)
-- et mettre à jour les autres avec un numéro unique (ajout d'un suffixe)
DO $$ 
DECLARE
    dup_record RECORD;
    counter INTEGER;
    new_telephone TEXT;
BEGIN
    FOR dup_record IN 
        SELECT telephone, array_agg(id ORDER BY created_at) as user_ids
        FROM users
        GROUP BY telephone
        HAVING COUNT(*) > 1
    LOOP
        counter := 0;
        -- Garder le premier utilisateur (déjà dans l'array en premier)
        -- Mettre à jour les autres
        FOR i IN 2..array_length(dup_record.user_ids, 1) LOOP
            counter := counter + 1;
            new_telephone := dup_record.telephone || '_duplicate_' || counter;
            
            UPDATE users
            SET telephone = new_telephone
            WHERE id = dup_record.user_ids[i];
            
            RAISE NOTICE 'Téléphone % mis à jour vers % pour l''utilisateur %', 
                dup_record.telephone, new_telephone, dup_record.user_ids[i];
        END LOOP;
    END LOOP;
END $$;

-- 2. Identifier et résoudre les doublons de id_personnel (ne devrait pas arriver, mais au cas où)
-- Afficher les doublons d'ID personnel
SELECT id_personnel, COUNT(*) as count
FROM users
GROUP BY id_personnel
HAVING COUNT(*) > 1;

-- Pour chaque id_personnel en double, on va garder le premier utilisateur
-- et mettre à jour les autres avec un ID unique (ajout d'un suffixe)
DO $$ 
DECLARE
    dup_record RECORD;
    counter INTEGER;
    new_id_personnel TEXT;
BEGIN
    FOR dup_record IN 
        SELECT id_personnel, array_agg(id ORDER BY created_at) as user_ids
        FROM users
        GROUP BY id_personnel
        HAVING COUNT(*) > 1
    LOOP
        counter := 0;
        -- Garder le premier utilisateur (déjà dans l'array en premier)
        -- Mettre à jour les autres
        FOR i IN 2..array_length(dup_record.user_ids, 1) LOOP
            counter := counter + 1;
            new_id_personnel := dup_record.id_personnel || '_duplicate_' || counter;
            
            UPDATE users
            SET id_personnel = new_id_personnel
            WHERE id = dup_record.user_ids[i];
            
            RAISE NOTICE 'ID personnel % mis à jour vers % pour l''utilisateur %', 
                dup_record.id_personnel, new_id_personnel, dup_record.user_ids[i];
        END LOOP;
    END LOOP;
END $$;

-- 3. Vérifier qu'il n'y a plus de doublons
SELECT 'Doublons de telephone restants:' as check_type;
SELECT telephone, COUNT(*) as count
FROM users
GROUP BY telephone
HAVING COUNT(*) > 1;

SELECT 'Doublons de id_personnel restants:' as check_type;
SELECT id_personnel, COUNT(*) as count
FROM users
GROUP BY id_personnel
HAVING COUNT(*) > 1;

-- 4. Ajouter une contrainte UNIQUE sur id_personnel si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_id_personnel_unique'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_id_personnel_unique UNIQUE (id_personnel);
    RAISE NOTICE 'Contrainte UNIQUE ajoutée sur id_personnel';
  ELSE
    RAISE NOTICE 'Contrainte UNIQUE sur id_personnel existe déjà';
  END IF;
END $$;

-- 5. Ajouter une contrainte UNIQUE sur telephone si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_telephone_unique'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_telephone_unique UNIQUE (telephone);
    RAISE NOTICE 'Contrainte UNIQUE ajoutée sur telephone';
  ELSE
    RAISE NOTICE 'Contrainte UNIQUE sur telephone existe déjà';
  END IF;
END $$;

-- 6. Vérifier les contraintes ajoutées
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE conrelid = 'users'::regclass
  AND contype = 'u'
  AND (conname = 'users_id_personnel_unique' OR conname = 'users_telephone_unique')
ORDER BY conname;
