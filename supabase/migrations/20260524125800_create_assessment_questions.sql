CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Test type data (JSONB), each optional so they can be omitted if not needed in a specific set
    number_comparison JSONB,
    dot_matching JSONB,
    number_series JSONB,
    single_addition JSONB,
    single_subtraction JSONB,
    complex_arithmetic JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);