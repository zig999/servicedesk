---
title: The schema is applied by a step the tree records
summary: A runnable step that applies every migration in order against the configured connection, and the suite setup that runs it so no test creates a table.
rationale: The scope observes that none of the five commands the standard declares applies a migration; cutting the step and the suite's use of it as one task is the planning's, because applying the schema is one act whether a person or the suite triggers it.
sources:
  - intake/scope.md
depends_on:
  - task/relational-substrate/schema-migrations
objective: Every environment, including the one the suite runs against, gets its schema by running one recorded step that applies the migrations in order.
criteria:
  - The tree holds a runnable step that applies every script under migrations/ in numbered order against the connection the environment names.
  - Running that step against an empty database leaves it holding the schema the scripts describe.
  - Running that step against a database that already holds the schema applies no script twice and fails nothing.
  - The suite's setup runs that step before any test runs, and no test in the tree creates or alters a table.
implements:
  - constraints/the-schema-replays-from-its-scripts
  - constraints/the-database-is-externally-provisioned
  - constraints/the-stored-schema-mirrors-the-declared-model
---

## What it is

The one way a database gets this schema.
A fresh environment, a test database and a restored one all arrive the same way, and nothing is left to a person to remember.

## Notes

The inventory reports there is no vitest configuration file today, so the suite has nowhere to hang a setup until one exists.
The standard's five declared commands are the project's registry to state, and this task adds a step to the project rather than a rule to that registry.
UNDERDETERMINED, from the specification — criterion 1 requires the step to run "against the connection the environment names", but nothing forbids a built-in default connection URL used whenever the environment names none; constraints/the-database-is-externally-provisioned admits no URL read from anywhere but environment configuration, and a test must exclude a default.
REMAINDER, from the specification — the second clause of constraints/the-database-is-externally-provisioned, that the deployment provisions no database service, reaches no criterion of this task; it belongs to the act that writes the deployment configuration.
REMAINDER, from the specification — the governing clause of constraints/the-stored-schema-mirrors-the-declared-model, that every column pairs with a declared attribute, reaches no criterion of this task, which authors no migration; it belongs to task/relational-substrate/schema-migrations, and this node is named here only for the exemption it states over the migration-bookkeeping relation, which criterion 3 turns on.
ADVISORY, from the specification — criterion 1 names the directory migrations/, and constraints/the-schema-replays-from-its-scripts explicitly hands that arrangement to the project's own standard rather than stating it; a reviewer holds that half of the criterion to the standard, not to a specification node.
ADVISORY, from the specification — criteria 2 and 3 presuppose a database the step runs against, and no candidate states how the one the suite runs against comes to exist; the criteria stay demonstrable against an external database whose URL the environment names, so this is a seam rather than a stop.
