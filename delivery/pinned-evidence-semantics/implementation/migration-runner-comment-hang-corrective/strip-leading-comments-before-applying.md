---
title: applyMigrationFile strips comments before sending SQL, and vitest's testTimeout
  is raised for a full replay
summary: migration-runner.ts's applyMigrationFile strips every -- comment line and
  blank line from a migration file's text before sending it to the connection (via
  stripCommentsAndBlankLines), shrinking a migration query's own wire size — a real,
  independently worthwhile improvement, though this task's own suite-run history
  later traced the actual hang this correction was cut to address to a developer
  host's own Path MTU Discovery black hole (a query large enough to exceed the
  network path's real MTU was silently dropped, with no ICMP fragmentation-needed
  reply, so it hung rather than failing) rather than to the connection endpoint
  itself. vitest.config.ts's testTimeout is raised from 40000ms to 120000ms to
  tolerate a full sequential replay of every migration script against the real
  database, and its stale comment naming a database provider ('Neon') this project
  no longer uses is corrected to a generic, no-vendor description.
task: sha256:f25f7c521da02513dd4911b408a2ba7be7eee30e016aee8e7cfa6e669823804e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/migration-runner-comment-hang-corrective-strip-leading-comments-before-applying-build-2
files:
- path: src/persistence/migration-runner.ts
  effect: 'Added a new pure helper function stripCommentsAndBlankLines(sql: string):
    string that splits a migration file''s text into lines, drops every blank (after
    trim) or `--`-prefixed line, and rejoins the rest. applyMigrationFile now reads
    the file''s text into rawSql and calls connection.query(stripCommentsAndBlankLines(rawSql))
    instead of sending the raw file text verbatim. The bookkeeping INSERT and every
    other function in the file are unchanged.'
- path: vitest.config.ts
  effect: testTimeout raised from 40000 to 120000, with a new trailing comment paragraph
    explaining that a full sequential replay of every migration script against the
    real database was observed timing out at 40000ms. The fileParallelism paragraph's
    'Neon transaction-pooling endpoint' wording is corrected to 'externally-provisioned
    transaction-pooling endpoint', removing the vendor name; the two later, historical
    testTimeout paragraphs' own 'Neon' mentions were left as-is, outside this task's
    own criterion.
criteria:
- criterion: Applying a migration file whose text is entirely comments and blank lines
    above one real statement executes that statement, never sending the comment lines
    to the connection.
  met: true
  how: stripCommentsAndBlankLines removes every whole comment line and every whole
    blank line from the file's text before applyMigrationFile ever calls connection.query.
- criterion: Applying a migration file with no comments at all behaves exactly as
    it did before this change.
  met: true
  how: For text holding no blank lines and no -- line, the filter predicate keeps
    every line, so the function returns the original text unchanged byte-for-byte.
- criterion: Replaying every migration script in order against an empty schema still
    produces the schema the current tree expects (constraints/the-schema-replays-from-its-scripts's
    own fitness), with no script skipped and no statement altered.
  met: true
  how: stripCommentsAndBlankLines never touches a statement's own text; the code path
    (applyPendingMigrations, orderedMigrationFiles, applyMigrationFile) is otherwise
    unchanged, and testTimeout's raise to 120000ms gives the full replay real headroom
    to be observed completing rather than being cut off.
- criterion: The bookkeeping row applyPendingMigrations records after a file applies
    still names that file's own filename, unchanged.
  met: true
  how: The bookkeeping INSERT INTO ... (filename) VALUES ($1) call is untouched.
- criterion: vitest.config.ts's testTimeout is raised from its current 40000ms to
    a value that tolerates a full, sequential, from-scratch replay of every migration
    script in migrations/ against the real database this suite's DATABASE_URL names.
  met: true
  how: testTimeout raised from 40000 to 120000, a threefold increase over the value
    observed timing out during such a replay against the real database.
- criterion: vitest.config.ts's own code comment describing why fileParallelism is
    disabled no longer names a database provider ("Neon") that is not the database
    this project currently uses.
  met: true
  how: The fileParallelism paragraph's wording is now 'the same externally-provisioned
    transaction-pooling endpoint', matching how migration-runner.ts's own header comment
    already describes the same database with no vendor name.
nodes:
- node: constraints/the-schema-replays-from-its-scripts
  encoded_at:
  - src/persistence/migration-runner.ts
  - vitest.config.ts
  how: This constraint's fitness — replaying every script in order against an empty
    database reproduces the expected schema — depends on every script's own DDL actually
    reaching the connection unaltered (migration-runner.ts's own fix) and on that
    full replay being given real headroom to be observed completing rather than cut
    off by an undersized test timeout (vitest.config.ts's own raise).
inferences:
- inferred: Whether stripping is scoped to only the file's leading comment block or
    to every comment/blank line anywhere in the file, including between statements.
  from: The task file's own body states the rule without a 'leading' qualifier, and
    the existing migration scripts place -- comment blocks ahead of nearly every individual
    statement, not only at the top of the file.
- inferred: 120000ms is a large enough increase (3x the prior 40000ms) to give real
    headroom for a full, sequential, from-scratch replay of all twelve scripts against
    the real database.
  from: the task's own suggestion of a generous, concrete value (e.g. 90000 or 120000ms),
    and the file's own prior pattern of doubling or more than doubling the value each
    time it was raised for a stated reason.
- inferred: '''externally-provisioned transaction-pooling endpoint'' is the right
    generic replacement wording for the removed ''Neon'' name.'
  from: migration-runner.ts's own header comment, which already describes the same
    database this way with no vendor name.
preserved:
- applyPendingMigrations' file-ordering and pending-file filtering, the bookkeeping-existence
  check, resolvedSchema, and the bookkeeping table name helper — none touched.
- vitest.config.ts's globalSetup wiring and the two earlier, historical testTimeout
  comment paragraphs — untouched.
deferred:
- what: The two later testTimeout paragraphs in vitest.config.ts (the 5000ms-default
    and 40000ms-raise explanations) still say 'Neon' in describing the reasoning that
    was true when each was written.
  why: This task's own criterion names only the fileParallelism paragraph specifically,
    and explicitly said not to touch anything else in the file.
- what: Both files' own trailing comment paragraphs, added by this task, originally
    attributed the hang this task addresses to the connection endpoint's own
    intolerance of a comment-prefixed query.
  why: This task's own later suite-run history (four consecutive attempts, each
    diagnosed as infrastructure/setup rather than code, followed by a direct
    network-layer trace) found the real cause to be a Path MTU Discovery black hole
    on one developer host's own network path — a query's wire size exceeding that
    path's real MTU was silently dropped with no ICMP fragmentation-needed reply, so
    the query hung rather than failing, independent of anything about the endpoint
    itself or about comments specifically. Both paragraphs are corrected to state
    that, and stripCommentsAndBlankLines is kept on its own independent merit — a
    real, harmless reduction in a migration query's own wire size, true whatever a
    given network path turns out to tolerate.
---

## What it is
applyMigrationFile strips -- comment lines and blank lines from a migration file's text before sending it to the connection, shrinking a migration query's own wire size.
vitest.config.ts's testTimeout is raised to 120000ms to tolerate a full migration replay against the real database, and its stale "Neon" comment is corrected to a generic, no-vendor description.

## Notes
The strip is applied to the whole file's text, not only a leading block, since this project's own migrations place comment blocks ahead of interior statements too — disclosed as an inference since the task's own wording did not distinguish the two cases.
Two later, historical testTimeout comment paragraphs still mention "Neon" — deferred, since this task's own criterion names only the fileParallelism paragraph.
This task's own suite-run history later traced the hang to a Path MTU Discovery black hole on a developer host's own network path, not to the connection endpoint — both files' own trailing comment paragraphs are corrected to state that; stripCommentsAndBlankLines itself is unaffected and stands on its own merit.
