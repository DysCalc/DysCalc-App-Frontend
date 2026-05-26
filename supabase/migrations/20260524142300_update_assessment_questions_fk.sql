ALTER TABLE public.assessment_questions RENAME COLUMN id TO test_result_id;

ALTER TABLE public.assessment_questions 
    ADD CONSTRAINT assessment_questions_test_result_id_fkey 
    FOREIGN KEY (test_result_id) 
    REFERENCES public.test_results(id) 
    ON DELETE CASCADE;
