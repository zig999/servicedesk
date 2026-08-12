-- domain/integration/capability: one registered read-only observation the
-- system can perform, identified by name and version
-- (domain/integration/capability-nature enumerates what it may do to the
-- world, restricted below to exactly its two declared values).
--
-- Every attribute of capability is required, so every column below is
-- NOT NULL (constraints/the-stored-schema-mirrors-the-declared-model).

CREATE TABLE capabilities (
  name          TEXT NOT NULL,
  version       TEXT NOT NULL,
  nature        TEXT NOT NULL,
  input_schema  TEXT NOT NULL,
  output_schema TEXT NOT NULL,
  timeout       INTEGER NOT NULL,
  connector     TEXT NOT NULL,
  CONSTRAINT capabilities_pkey PRIMARY KEY (name, version),
  CONSTRAINT capabilities_nature_check CHECK (nature IN ('read-only', 'mutating'))
);
