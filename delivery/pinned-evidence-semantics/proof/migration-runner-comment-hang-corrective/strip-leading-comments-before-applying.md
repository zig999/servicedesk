---
title: applyMigrationFile strips comments before applying, and vitest's testTimeout
  raise — proof
summary: Six new unit tests over migration-runner.ts prove the comment-stripping behavior
  across four criteria (plus two pre-existing, unmodified integration tests cited
  as the replay-fitness proof); two new meta-tests over vitest.config.ts's own source
  text prove the testTimeout raise and the corrected fileParallelism comment.
implementation: sha256:f65e9062e9c52fbfa142684733e71a04fcf196ffc4b2c172f3f917faa49533f3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/pinned-evidence-semantics-full-suite-post-evidence-snapshot-4
tests:
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: executes the real statement in a file whose text is entirely comment lines
    and blank lines above it, never sending any comment line to the connection
  proves: Applying a migration file whose text is entirely comments and blank lines
    above one real statement executes that statement, never sending the comment lines
    to the connection.
  fails_when: stripCommentsAndBlankLines stops removing a leading comment/blank line,
    so connection.query is called with text still containing a comment line, or the
    real statement is never sent at all
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: sends a migration file holding no comment line and no blank line to the connection
    completely unchanged
  proves: Applying a migration file with no comments at all behaves exactly as it
    did before this change.
  fails_when: connection.query is ever called with anything other than the original
    file text byte-for-byte
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: drops only the whole comment line inside a multi-line statement, leaving every
    other line of that statement exactly as the file wrote it
  proves: Replaying every migration script in order against an empty schema still
    produces the schema the current tree expects, with no script skipped and no statement
    altered — the fine-grained half, that a statement's own surviving lines are never
    rewritten, only whole comment/blank lines removed
  fails_when: the statement sent to connection.query differs at all from the original
    — e.g. the interior comment line is only blanked rather than removed, or a real
    line is dropped or altered along with it
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: strips a comment block sitting between two statements, not only a comment
    block leading the whole file
  proves: the implementation's recorded inference — that stripping reaches every comment/blank
    line in the file, not only a leading block
  fails_when: an implementation stripping only the file's leading comment block is
    run instead
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: still records the bookkeeping row naming this file's own filename, after its
    comment lines are stripped from the SQL that ran
  proves: The bookkeeping row applyPendingMigrations records after a file applies
    still names that file's own filename, unchanged.
  fails_when: the INSERT INTO ... schema_migrations call is ever missing, sent with
    different SQL text, or sent with a filename parameter other than the exact name
    of the file that was just applied
- file: src/__tests__/integration/persistence/migration-runner.spec.ts
  name: creates its own bookkeeping and its own domain tables in the schema an explicit
    call names, independent of whatever this project's real "test" schema already
    has recorded
  proves: Replaying every migration script in order against an empty schema still
    produces the schema the current tree expects (constraints/the-schema-replays-from-its-scripts's
    own fitness) — pre-existing, unmodified by this task; it replays this project's
    actual migrations/ directory against a real, disposable, empty schema
  fails_when: any migration script's comment lines reach the connection and the query
    hangs or fails, or the expected sentinel table never appears
- file: src/__tests__/integration/persistence/migration-runner.spec.ts
  name: applies no script twice and fails nothing when run again against a database
    that already holds the schema
  proves: '...with no script skipped... — pre-existing, unmodified by this task'
  fails_when: a script is skipped, reapplied, or a script's own failure to apply leaves
    the second applyPendingMigrations call rejecting instead of resolving
- file: src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts
  name: declares a testTimeout raised above the prior 40000ms value
  proves: vitest.config.ts's testTimeout is raised from its current 40000ms to a value
    that tolerates a full, sequential, from-scratch replay of every migration script
    in migrations/ against the real database this suite's DATABASE_URL names.
  fails_when: the testTimeout property in vitest.config.ts's own source is lowered
    back to 40000 or below, or removed entirely
- file: src/__tests__/unit/vitest-config-migration-replay-headroom.spec.ts
  name: explains why fileParallelism is disabled without naming any database provider
    ("Neon")
  proves: vitest.config.ts's own code comment describing why fileParallelism is disabled
    no longer names a database provider ("Neon") that is not the database this project
    currently uses.
  fails_when: the fileParallelism paragraph is reworded to mention "Neon" again, or
    is deleted outright so no transaction-pooling-endpoint explanation remains
not_applicable:
- edge_case: a migration file whose text holds no real statement at all — comment
    lines and blank lines only, nothing surviving the strip
  why: all four comment-stripping criteria describe a file with 'one real statement'
    present; no migration file under this project's migrations/ directory is ever
    comment-only
- edge_case: two concurrent applyPendingMigrations calls against the same file
  why: no criterion or bound node states concurrent-apply behavior, and this change
    does not touch the ordering, filtering or locking applyPendingMigrations already
    does
- edge_case: a script that fails to apply (a syntactically invalid statement)
  why: the error path (MigrationStepError wrapping the original error) is untouched
    by this change, and it is already proven by the pre-existing, unmodified integration
    test 'raises MigrationStepError naming the file and wrapping the original error
    as its cause, when a script cannot be applied'
- edge_case: the two later, historical testTimeout paragraphs (5000ms-default and
    40000ms-raise) that still say "Neon"
  why: the task's own criterion names only the fileParallelism paragraph specifically,
    and the implementation record discloses leaving those two untouched as outside
    this task's scope
untested:
- A line whose trimmed text begins with '--' as part of a genuine string literal spanning
  multiple lines, rather than a real SQL comment, would still be dropped by stripCommentsAndBlankLines's
  line-based check — no migration file under this project's migrations/ directory
  contains such a literal today, so nothing exercises this boundary.
- Whether the raised testTimeout value actually suffices for a full, sequential, from-scratch
  replay of every migration script against the real database was, at the time this
  task's criteria were written, an empirical, timing-dependent fact only a real suite
  run could demonstrate; the run this proof cites is exactly that demonstration —
  the whole suite, including every integration spec that replays migrations/ from
  scratch, completed in 137.8 seconds with zero timeouts. What was diagnosed only
  after several earlier, hanging attempts is that those hangs were never timing
  variance — they traced to a Path MTU Discovery black hole on a developer host's
  own network path, now corrected at the network layer, and the cited run's own
  clean, fast completion is consistent with that.
- The implementation's own inference that the exact wording 'externally-provisioned
  transaction-pooling endpoint' is the right generic replacement — the written test
  checks the paragraph mentions 'transaction-pooling endpoint' and does not mention
  'Neon', but does not pin the specific replacement phrase, since the criterion states
  only that no vendor name may appear.
---

## What it is
Tests prove migration-runner.ts's comment-stripping across its four criteria, and vitest.config.ts's testTimeout raise and corrected fileParallelism comment across its two.
Two pre-existing, unmodified integration tests are cited as proof for the replay-fitness half, since the fix changes nothing about what they assert — only whether they hang or time out.

## Notes
The cited run is a genuinely clean whole-suite run (142 files, 1628 tests, zero failures, zero timeouts, 137.8s total) captured after every other task of this same plan landed, consistent with the network-layer diagnosis this task's own implementation record now discloses.
