---
title: Postgres pool options are mandatory at construction
summary: createDatabaseConnection can no longer build a Pool without an explicit max, idleTimeoutMillis
  and statement_timeout.
rationale: A /review-change conformance finding over src/persistence/database-connection.ts observed that
  calling createDatabaseConnection with no poolOptions leaves the Pool built with none of the three bounds,
  so they fall to pg's own implicit defaults rather than to any declared one — contradicting constraints/the-connection-pool-is-bounded-by-configuration,
  which the code already implements for every caller that does supply poolOptions.
sources:
- work/backend-load-resilience-hardening/intake/corrective-pool-options-required.md
objective: createDatabaseConnection cannot be called, and no Pool can be constructed, without explicit
  max, idleTimeoutMillis and statement_timeout values.
criteria:
- 'createDatabaseConnection''s poolOptions parameter is required, not optional: a call naming only a connection
  URL fails to typecheck.'
- The Pool construction in database-connection.ts reads max, idleTimeoutMillis and statement_timeout unconditionally
  from the supplied poolOptions — no branch constructs a Pool without them.
- No numeric literal for any of the three bounds is written inside database-connection.ts itself.
- Every existing caller of createDatabaseConnection (the production factory, migration and seed scripts,
  the test harness, and every test that constructs a connection) supplies poolOptions, and the tree still
  builds and its full suite passes.
implements:
- constraints/the-connection-pool-is-bounded-by-configuration
---
## What it is
createDatabaseConnection's second parameter stops being optional, and every call site is updated to supply it.

## Notes
UNDERDETERMINED, from the specification — constraints/the-connection-pool-is-bounded-by-configuration states the three bounds are "supplied as deployment configuration", but no criterion of this task reaches that clause: criterion 3 bans numeric literals only inside database-connection.ts itself, and criterion 4 asks only that every caller supplies poolOptions, never that the values it supplies come from deployment configuration.
Passes: the production factory (and the migration, seed and test callers) construct poolOptions from numeric literals written in the caller file, reading nothing from the environment — poolOptions is required, database-connection.ts reads the three unconditionally and holds no literal, every caller supplies poolOptions, and the tree builds and the suite passes; the constraint nevertheless refuses bounds that are not supplied as deployment configuration.
UNDERDETERMINED, from the specification — constraints/the-connection-pool-is-bounded-by-configuration states each bound falls "back to a declared default where the deployment states none", and its Description states "A deployment that states none of the three still starts." No criterion of this task preserves that: the objective demands only that explicit values reach the constructor, and criteria 1-4 are all satisfied whether or not a fallback exists anywhere.
Passes: the caller resolving poolOptions treats the three environment values as mandatory and throws at startup when the deployment states none of them, so nothing ever calls createDatabaseConnection without explicit values. Every criterion as written passes; the constraint refuses it, because a deployment stating none of the three must still start, on the declared defaults.
