ALTER TABLE investigations
  ADD COLUMN assessment_register TEXT NOT NULL DEFAULT 'plain';

ALTER TABLE investigations
  ADD CONSTRAINT investigations_assessment_register_check
  CHECK (assessment_register IN ('formal', 'plain'));

ALTER TABLE investigations
  ADD COLUMN assessment_usage_input_tokens INTEGER NOT NULL DEFAULT 0;

ALTER TABLE investigations
  ADD COLUMN assessment_usage_output_tokens INTEGER NOT NULL DEFAULT 0;

ALTER TABLE investigations
  ADD COLUMN assessment_elapsed_ms INTEGER NOT NULL DEFAULT 0;

ALTER TABLE investigations
  ADD COLUMN assessment_prompt TEXT NOT NULL DEFAULT '';
