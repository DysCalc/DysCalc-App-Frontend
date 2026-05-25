ALTER TABLE public.learning_modules ADD COLUMN IF NOT EXISTS is_generating boolean DEFAULT false;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS is_generating boolean DEFAULT false;
