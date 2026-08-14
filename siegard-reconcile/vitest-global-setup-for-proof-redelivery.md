---
contract_version: siegard-reconcile/1
title: vitest-global-setup.ts alone, so the migration-step proof re-delivery finds its one stale
  implementation-file binding healed
summary: >-
  The file was rewritten by task/service-on-the-database/store-wiring's delivery, whose bind
  restamped only its own nodes, leaving task/relational-substrate/migration-step's bindings on this
  shared file stale; the human states the source is correct as it stands — the suite's global setup
  applies every pending migration through the shared runner against the DATABASE_URL the environment
  names, and seeds the two non-conclusion outcomes after migrating, before any test runs.
target: backend
files:
- path: src/vitest-global-setup.ts
  change: >-
    The suite's global setup applies every pending migration through the shared runner against the
    DATABASE_URL the environment names, and seeds the two non-conclusion outcomes after migrating,
    before any test runs.
nodes:
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: >-
    "const connectionUrl = process.env.DATABASE_URL; if (!connectionUrl) { throw new
    MigrationStepError(...) }" followed by "createDatabaseConnection(connectionUrl)" — the connection
    URL is read from environment configuration and from nowhere else, the setup refuses rather than
    defaults when it is absent, and nothing in the file provisions a database service or hardcodes an
    endpoint.
  encoded_at:
  - src/vitest-global-setup.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: >-
    "await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY)" — the schema the suite runs
    against arrives only by applying the scripts under migrations/ through the runner, with no schema
    step performed by hand and no schema SQL of this file's own; the seed writes rows, not schema.
  encoded_at:
  - src/vitest-global-setup.ts
notes: >-
  The judgment observed that the file enacts a fact held by
  rules/glossary/the-non-conclusion-outcomes-precede-the-first-case — a node the trace does not bind
  to this file — so that rule's precedence guarantee now runs in two mechanisms, the service's bound
  read-time top-up and this pre-seed the trace cannot see; the outcome names are read from
  ./glossary/terms.js rather than copied, so no second home was opened, and which route records that
  claim is a later delivery's or analysis's to decide, not this record's. Two earlier records over
  wider sets (post-relational-and-http-deliveries-drift.md,
  migration-substrate-pair-env-and-vitest-setup.md) judged this same file and cleared these same two
  nodes over it; each stopped whole on findings in other files of its set, which is what narrowed
  this set to the one file.
---
