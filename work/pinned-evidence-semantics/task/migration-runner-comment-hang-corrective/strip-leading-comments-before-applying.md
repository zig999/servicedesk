---
title: applyMigrationFile strips leading comments before sending a migration's SQL
  to the connection
summary: A migration file's own -- comment lines and blank lines are removed before
  its text reaches the connection, so applying it never depends on the endpoint tolerating
  a comment-prefixed query; the same SQL statement(s) still run, in the same order.
  vitest's own testTimeout is raised enough to tolerate a full sequential replay of
  every migration script against the real database, and a stale code comment naming
  the wrong database provider is corrected.
sources:
- intake/migration-runner-comment-hang-corrective.md
objective: Every migration file's real SQL statement(s) apply exactly as before, with
  no leading comment content ever reaching the connection, and the test suite's own
  timeout budget is sized for what a full migration replay against the real database
  actually takes.
criteria:
- Applying a migration file whose text is entirely comments and blank lines above
  one real statement executes that statement, never sending the comment lines to the
  connection.
- Applying a migration file with no comments at all behaves exactly as it did before
  this change.
- Replaying every migration script in order against an empty schema still produces
  the schema the current tree expects (constraints/the-schema-replays-from-its-scripts's
  own fitness), with no script skipped and no statement altered.
- The bookkeeping row applyPendingMigrations records after a file applies still names
  that file's own filename, unchanged.
- vitest.config.ts's testTimeout is raised from its current 40000ms to a value that
  tolerates a full, sequential, from-scratch replay of every migration script in migrations/
  against the real database this suite's DATABASE_URL names.
- vitest.config.ts's own code comment describing why fileParallelism is disabled no
  longer names a database provider ("Neon") that is not the database this project
  currently uses.
implements:
- constraints/the-schema-replays-from-its-scripts
---

## What it is
migration-runner.ts's applyMigrationFile strips -- comment lines and blank lines from a migration file's text before sending it to the connection, so the transport-pooling endpoint's own intolerance of a comment-prefixed query never affects which statement runs. vitest.config.ts's testTimeout is raised to tolerate a full migration replay against the real database, and its stale "Neon" comment is corrected.

## Notes
None.
