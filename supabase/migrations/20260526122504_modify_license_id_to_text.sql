-- Alter the license_id column in the educator table to be of type TEXT
ALTER TABLE public.educator
  ALTER COLUMN license_id TYPE TEXT USING license_id::TEXT;
