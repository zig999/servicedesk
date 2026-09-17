-- domain/integration/capability gains an optional payload_notes attribute
-- (required: false) -- an operator's own free-text account of what the
-- observation actually returns beneath its declared output schema, never
-- enforced and never read by anything that resolves a call or admits a
-- citation. Added after migrations/0003-capability-registry.sql shipped
-- without it, the same additive-after-a-shipped-table convention
-- migrations/0007-capability-concept.sql already used to add
-- capabilities.concept: migrations/0003-capability-registry.sql is not
-- edited, and this script depends only on it already having run.
--
-- Nullable, with no DEFAULT: the attribute is declared optional and absent
-- (required: false), not required-and-possibly-empty the way
-- concepts.description (migrations/0012-glossary-concept-description.sql)
-- is for its own required string attribute, so this column takes no
-- DEFAULT '' TEXT NOT NULL -- SQL NULL, not the empty string, is what a
-- registration that declares no payload notes and a row stored before this
-- column existed both read back as.
--
-- Implements, from the specification:
--   domain/integration/capability                            -- capabilities.payload_notes
--   constraints/the-stored-schema-mirrors-the-declared-model  -- pairs the
--     newly-declared optional attribute with its own column
--   constraints/the-schema-replays-from-its-scripts           -- a plain
--     numbered .sql file beside its siblings, applied once in filename order

ALTER TABLE capabilities
  ADD COLUMN payload_notes TEXT;
