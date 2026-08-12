-- The glossary's published language (domain/glossary/_context.md): the
-- discovered and global vocabularies every case, investigation and
-- capability names from, and the concepts a case may collect.
--
-- Implements, from the specification:
--   domain/glossary/subject-type      -- subject_types
--   domain/glossary/subject-attribute -- subject_attributes
--   domain/glossary/action            -- actions
--   domain/glossary/outcome           -- outcomes
--   domain/glossary/recipient         -- recipients
--   domain/glossary/concept           -- concepts, concept_accepts
--
-- Every one of these elements declares only "name" (plus, for concept,
-- "accepts" and "ttl") as required, so every column below is required
-- (constraints/the-stored-schema-mirrors-the-declared-model).

CREATE TABLE subject_types (
  name TEXT NOT NULL,
  CONSTRAINT subject_types_pkey PRIMARY KEY (name)
);

CREATE TABLE subject_attributes (
  name TEXT NOT NULL,
  CONSTRAINT subject_attributes_pkey PRIMARY KEY (name)
);

CREATE TABLE actions (
  name TEXT NOT NULL,
  CONSTRAINT actions_pkey PRIMARY KEY (name)
);

CREATE TABLE outcomes (
  name TEXT NOT NULL,
  CONSTRAINT outcomes_pkey PRIMARY KEY (name)
);

CREATE TABLE recipients (
  name TEXT NOT NULL,
  CONSTRAINT recipients_pkey PRIMARY KEY (name)
);

CREATE TABLE concepts (
  name TEXT NOT NULL,
  ttl  INTEGER NOT NULL,
  CONSTRAINT concepts_pkey PRIMARY KEY (name)
);

-- concept.accepts (many domain/glossary/subject-type): one row per subject
-- type one concept accepts.
CREATE TABLE concept_accepts (
  concept_name      TEXT NOT NULL REFERENCES concepts (name),
  subject_type_name TEXT NOT NULL REFERENCES subject_types (name),
  CONSTRAINT concept_accepts_pkey PRIMARY KEY (concept_name, subject_type_name)
);
