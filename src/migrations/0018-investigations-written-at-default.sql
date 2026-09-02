ALTER TABLE investigations
  ALTER COLUMN written_at SET DEFAULT clock_timestamp();
