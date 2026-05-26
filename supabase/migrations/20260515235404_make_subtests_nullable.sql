-- Make subtest JSON columns nullable so rows can be created incrementally
ALTER TABLE test_results ALTER COLUMN complex_arithmetic DROP NOT NULL;
ALTER TABLE test_results ALTER COLUMN dot_matching DROP NOT NULL;
ALTER TABLE test_results ALTER COLUMN number_comparison DROP NOT NULL;
ALTER TABLE test_results ALTER COLUMN number_series DROP NOT NULL;
ALTER TABLE test_results ALTER COLUMN single_addition DROP NOT NULL;
ALTER TABLE test_results ALTER COLUMN single_subtraction DROP NOT NULL;
