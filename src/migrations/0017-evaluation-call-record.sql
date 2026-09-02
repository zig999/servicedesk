ALTER TABLE investigation_evaluations
  ADD COLUMN input_tokens INTEGER;

ALTER TABLE investigation_evaluations
  ADD COLUMN output_tokens INTEGER;

ALTER TABLE investigation_evaluations
  ADD COLUMN elapsed_ms INTEGER;

ALTER TABLE investigation_evaluations
  ADD COLUMN prompt TEXT;
