---
contract_version: siegard-reconcile/1
title: env.ts and vitest-global-setup.ts, the two files the migration-step proof re-delivery
  depends on
summary: >-
  Both files changed through this framework's own routes — env.ts gained the connector-configuration
  variables in the http-connector-adapter's production-wiring delivery, and vitest-global-setup.ts
  was adjusted by task/service-on-the-database/store-wiring — and the human states the source is
  correct as it stands; the drift exists because a bind restamps only the delivering task's own
  nodes, leaving the bindings task/relational-substrate/migration-step and database-connection held
  on these shared files stale.
target: backend
files:
- path: src/config/env.ts
  change: >-
    The single environment schema gains the connector-configuration variables the HTTP adapter's
    production wiring reads, beside the one DATABASE_URL every store answers from.
- path: src/vitest-global-setup.ts
  change: >-
    The suite's global setup applies every pending migration through the shared runner against the
    DATABASE_URL the environment names, and seeds the two non-conclusion outcomes after migrating,
    before any test runs.
nodes:
- node: constraints/the-database-is-externally-provisioned
  conforms: false
  how: >-
    The node's own fact holds in both files — env.ts reads the URL as environment configuration
    ("DATABASE_URL: z.string().min(1)") and vitest-global-setup.ts reads it from process.env and
    refuses to run without it, nothing provisioned, nothing hardcoded — but env.ts's header states
    the node's rule differently from the node: "this schema is the one place that URL is read, so no
    host, port, endpoint or credential for a database is written anywhere else in source". The node's
    fitness is that the URL is read from environment configuration and from nowhere else — a rule
    about where the value comes from, not a single-read-site rule — and the stronger claim is false
    within this very file set, since vitest-global-setup.ts reads process.env.DATABASE_URL directly.
    A reader auditing the constraint from this comment either stops at env.ts believing every read is
    found, or treats the setup file's conforming read as a violation.
  observed_at:
  - src/config/env.ts
  - src/vitest-global-setup.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: >-
    vitest-global-setup.ts carries it in setup() — "await applyPendingMigrations(connection,
    MIGRATIONS_DIRECTORY)" over "fileURLToPath(new URL('../migrations', import.meta.url))" — the
    suite's schema arrives only by replaying the scripts under migrations/, before any test, with no
    step performed by hand; the seeding added after the migration call writes rows, not schema.
  encoded_at:
  - src/vitest-global-setup.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: >-
    env.ts's "DATABASE_URL: z.string().min(1)" is the schema's only store variable — no
    data-directory or file-path variable exists for any of the four stores, and the header records
    that deliberately: "each of the four now answers from the one DATABASE_URL connection below ...
    no data path for any of those four is written in source or read from this schema".
  encoded_at:
  - src/config/env.ts
notes: >-
  The judgment also observed that vitest-global-setup.ts now enforces, for the suite, the fact held
  by rules/glossary/the-non-conclusion-outcomes-precede-the-first-case — a node the trace does not
  bind to this file, so that claim stays unrecorded until a route that carries a record binds it; the
  outcome names are read from ./glossary/terms.js rather than copied, so no second home was opened.
  An earlier, wider judgment over 18 files
  (siegard-reconcile/post-relational-and-http-deliveries-drift.md) answered CONFORMS for
  constraints/the-database-is-externally-provisioned over these same files; this pass read the
  env.ts header against the node's own text more closely and returned the misattribution above, and
  the two records stand together as that disagreement, unsettled here. Because one node carries a
  finding, this record binds nothing — not even the two that cleared.
---
