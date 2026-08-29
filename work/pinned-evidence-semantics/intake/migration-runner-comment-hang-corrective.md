# Corrective: applyMigrationFile must not depend on the connection tolerating leading SQL comments

One wrong behavior, observed by running the delivered system, in code an earlier, closed initiative
(task/relational-substrate/migration-step) already delivered — answering to no criterion any task
holds.

## What was observed

`src/src/persistence/migration-runner.ts`'s `applyMigrationFile` reads one migration file's full
text — including its own leading `--` comment lines — and sends it verbatim to the connection via
`connection.query(sql)`.

Reproduced directly against this project's own Postgres endpoint (a transaction-pooling endpoint at
`10.252.4.205:30671`, per this file's own header comment):

- A query whose content is entirely SQL comments and blank lines (no real statement) hangs
  indefinitely — no response ever arrives, no error, no timeout from the driver (it has none
  configured).
- The exact same statement, sent alone with no comment lines, always runs instantly.
- The same statement prefixed by the migration file's own real header comments hangs the same way.
- Reproduced against two different migration files (0010, 0011) — not peculiar to one file's
  content.

This makes every test that creates an isolated schema and replays the migration set from scratch —
`migration-runner.spec.ts`, `case-version-lifecycle-schema.spec.ts`,
`protect-released-hypothesis-revision-collects-schema.spec.ts`, `schema-migrations.spec.ts`,
`manifest-collects-survive-release.spec.ts`, and any new schema-only integration spec written the
same way — hang or time out, because every migration file this project has ever written carries a
leading comment block explaining its own intent.

## What should happen instead

`applyMigrationFile` (or the read that feeds it) strips `--`-prefixed comment lines and blank lines
from a migration file's text before sending it to the connection, so exactly the same SQL statement
executes, unaffected by whether the connection endpoint tolerates a query beginning with comments.
This is a transport-mechanism fix, not a change to which statement runs or what the schema ends up
holding: `constraints/the-schema-replays-from-its-scripts`'s own fitness property (an empty database
replayed through the numbered scripts produces the same schema) is unchanged by removing comments
before sending — the same DDL runs, applied in the same order.

## Human authorization

The human, informed of this finding mid-session while delivering `pinned-evidence-semantics`,
explicitly chose to correct it now via this corrective increment, rather than working around it
test-by-test or deferring it.
