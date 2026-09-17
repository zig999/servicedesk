-- Retires domain/glossary/subject-attribute's own storage: the vocabulary
-- table 0002-glossary-vocabulary.sql created for it, and the foreign key
-- 0005-investigation.sql declared inline from
-- investigation_subject_attribute_values.attribute to it.
-- domain/investigation/subject-attribute-value's own attribute is "free
-- text rather than a governed vocabulary term" per its own description, so
-- no replacement constraint takes the dropped one's place.
--
-- Implements, from the specification:
--   domain/investigation/subject-attribute-value -- attribute, held to no
--     vocabulary once the table it named is gone
--   constraints/the-schema-replays-from-its-scripts -- a plain numbered
--     .sql file beside its siblings, applied once in filename order
--   constraints/the-stored-schema-mirrors-the-declared-model -- a table
--     paired with no Domain Model element, now that
--     domain/glossary/subject-attribute has left the specification, is a
--     departure this migration removes rather than commits
--
-- Mirrors 0022-case-version-authored-at-default.sql's own
-- destructive-but-preserving shape: investigation_subject_attribute_values'
-- own primary key (investigation_id, attribute, value) and its foreign key
-- to investigations (id) are both left standing, and every row already
-- stored under it survives untouched -- only the constraint that held
-- attribute to the retired vocabulary, and the vocabulary table itself,
-- are dropped. The dropped constraint carries no CONSTRAINT name of its
-- own in 0005-investigation.sql's inline REFERENCES subject_attributes
-- (name), so Postgres named it by its own default rule for an unnamed
-- column-level foreign key: <table>_<column>_fkey.
ALTER TABLE investigation_subject_attribute_values
  DROP CONSTRAINT investigation_subject_attribute_values_attribute_fkey;

DROP TABLE subject_attributes;
