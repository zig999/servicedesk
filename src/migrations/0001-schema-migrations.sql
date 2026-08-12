-- The one relation constraints/the-stored-schema-mirrors-the-declared-model
-- exempts from pairing with a Domain Model element: it is not a record of
-- the domain, only the bookkeeping that lets the step
-- task/relational-substrate/migration-step applies
-- (constraints/the-schema-replays-from-its-scripts) know which of the
-- numbered scripts beside this one it has already run against a given
-- database. Every column below is part of that exemption.

CREATE TABLE schema_migrations (
  filename    TEXT NOT NULL,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (filename)
);
