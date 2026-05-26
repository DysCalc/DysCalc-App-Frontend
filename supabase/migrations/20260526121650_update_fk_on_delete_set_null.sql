-- Drop the existing constraints for test_results
ALTER TABLE public.test_results
  DROP CONSTRAINT IF EXISTS initial_test_results_student_id_fkey;

-- Re-add the constraint with ON DELETE SET NULL
ALTER TABLE public.test_results
  ADD CONSTRAINT initial_test_results_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- Drop the existing constraint for classrooms
ALTER TABLE public.classrooms
  DROP CONSTRAINT IF EXISTS educator_id_fkey;

-- Ensure educator_id is nullable
ALTER TABLE public.classrooms
  ALTER COLUMN educator_id DROP NOT NULL;

-- Re-add the constraint with ON DELETE SET NULL
ALTER TABLE public.classrooms
  ADD CONSTRAINT educator_id_fkey
  FOREIGN KEY (educator_id)
  REFERENCES public.educator(id)
  ON DELETE SET NULL;
