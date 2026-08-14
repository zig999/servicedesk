-- The connector-configuration persistence boundary
-- (task/connector-registration/connector-configuration-persistence):
-- wherever a connector's own call configuration is kept, so it is written
-- to and read from the system's one relational store rather than a file
-- (constraints/the-system-persists-to-one-relational-database) and reached
-- by nothing under the domain layer except through a port
-- (constraints/the-domain-depends-on-no-infrastructure).
--
-- No Domain Model element describes a connector's own call configuration:
-- domain/integration/capability's own "connector" attribute
-- (migrations/0003-capability-registry.sql) is a deliberately opaque
-- string the decision log records as chosen "to keep vendors out of the
-- model," and domain/investigation/subject states that a connector
-- "resolves internally ... which of the attributes it needs and how to
-- derive its call from them." So this table pairs its own "connector"
-- column with that same opaque identifying value and holds the rest as one
-- untyped JSON payload, rather than declaring named columns for a shape
-- nothing in the specification states — a column named for a field the
-- business never decided would be exactly the fact
-- constraints/the-stored-schema-mirrors-the-declared-model exists to keep
-- out of the schema.
--
-- connector is the primary key: one connector identifies exactly one row,
-- and re-registering under an already-held connector replaces its
-- configuration whole
-- (connector-configuration-registry.service.ts's own registerConnector).

CREATE TABLE connector_configurations (
  connector     TEXT NOT NULL,
  configuration JSONB NOT NULL,
  CONSTRAINT connector_configurations_pkey PRIMARY KEY (connector)
);
