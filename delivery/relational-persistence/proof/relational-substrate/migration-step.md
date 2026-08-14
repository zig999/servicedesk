---
title: Proof for the recorded migration step, re-authored against the tree as it stands
summary: Holds task/relational-substrate/migration-step's four criteria and its UNDERDETERMINED note against
  a migrations/ directory that other tasks legitimately extend, deriving every totality from the directory
  itself instead of a closed enumeration a sibling's correctly numbered script falsifies.
implementation: sha256:2f9484161905bf780d44bb88c331bc3d67d5d2b17cf51433e3c3099cc8fe888b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/relational-substrate-migration-step-suite-8
tests:
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: has already recorded every script migrations/ holds as applied, exactly once each, and left the
    database holding the schema those scripts describe by the time this spec's own first test runs, proving
    the suite's own setup ran before any test
  proves: criterion 2, 'Running that step against an empty database leaves it holding the schema the scripts
    describe' — observed through the one real empty-database transition a shared-database suite produces,
    the global setup's own single run — and the first half of criterion 4, 'The suite's setup runs that
    step before any test runs'. The expected set is read from migrations/ itself, sorted the way MIG-01's
    numbering fixes, anchored on 0001-schema-migrations.sql so an empty or misdirected directory read
    cannot agree vacuously with an empty table; a sibling task's correctly numbered future script extends
    the expectation instead of falsifying it.
  fails_when: the global setup stops running before the tests, skips a script the directory holds, records
    one twice or records a filename the directory does not hold, the applied scripts stop producing the
    schema (the public.cases sentinel), or migrations/ stops holding the bookkeeping script MIG-02 forbids
    removing
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: resolves without error when called the same way vitest itself calls it, against the real configured
    connection
  proves: 'criterion 3 on the setup path: the setup''s own re-run against a database already holding the
    schema fails nothing'
  fails_when: a second invocation of the setup raises against an already-migrated database — the state
    every re-run of the suite meets
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: refuses with a typed error naming DATABASE_URL, never substituting a default, when the environment
    names no connection
  proves: 'the task''s UNDERDETERMINED entry: an implementation carrying a built-in default connection
    URL used whenever the environment names none satisfies every criterion as written, and constraints/the-database-is-externally-provisioned
    refuses it'
  fails_when: an absent DATABASE_URL is answered by connecting to a substituted default URL instead of
    by MigrationStepError carrying context {variable DATABASE_URL}
- file: src/__tests__/integration/vitest-global-setup.spec.ts
  name: keeps naming DATABASE_URL rather than substituting a default even when it is set to an empty string,
    one more shape 'names none' could take
  proves: the same UNDERDETERMINED entry over the second shape an unnamed connection takes, and the implementation's
    recorded inference that both entry points throw rather than substitute
  fails_when: an empty-string DATABASE_URL falls through to a default or reaches the driver instead of
    raising the typed refusal
- file: src/__tests__/integration/persistence/migration-runner.spec.ts
  name: applies no script twice and fails nothing when run again against a database that already holds
    the schema
  proves: criterion 3, 'Running that step against a database that already holds the schema applies no
    script twice and fails nothing' — after two explicit runs, the bookkeeping holds exactly the filenames
    migrations/ holds on disk (anchored on 0001-schema-migrations.sql against a vacuous empty-against-empty
    match), each with a row count of one
  fails_when: a re-run raises, applies or records any script a second time, or leaves the recorded set
    diverging in either direction from what migrations/ holds
- file: src/__tests__/integration/persistence/migration-runner.spec.ts
  name: leaves a disposable schema without the domain tables when an explicit call finds every file already
    recorded as applied elsewhere, since bookkeeping is global rather than scoped to the caller's own
    search_path
  proves: 'the implementation''s recorded inference that every bookkeeping reference is schema-qualified
    as public.schema_migrations, by its observable consequence: an already-populated global bookkeeping
    makes a later call apply nothing even against a schema that never received the DDL'
  fails_when: bookkeeping reads stop being schema-qualified and start resolving against the caller's ambient
    search_path, making the call re-apply scripts into the disposable schema
- file: src/__tests__/integration/persistence/migration-runner.spec.ts
  name: raises MigrationStepError naming the file and wrapping the original error as its cause, when a
    script cannot be applied
  proves: 'the edge case of a dependency that fails mid-step: a script the database refuses surfaces as
    this module''s typed error naming the filename, with the driver''s error as its cause, rather than
    as a bare driver error or a silent skip'
  fails_when: a failing script is skipped, or surfaces as anything but MigrationStepError carrying the
    filename and the original cause
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: applies migration files in ascending filename order, regardless of the order the filesystem lists
    them
  proves: criterion 1's ordering clause, 'applies every script under migrations/ in numbered order', over
    stand-ins for the filesystem and the driver — the two boundaries TST-03 permits — because a database's
    final state cannot show the order it was reached in
  fails_when: applyPendingMigrations executes scripts in the order the filesystem happened to list them
    rather than in ascending filename order
- file: src/__tests__/unit/persistence/migration-runner.spec.ts
  name: sends no further statement once every migration file is already recorded as applied
  proves: 'criterion 3''s ''applies no script twice'' at the mechanism: the pending-file filter leaves
    nothing to run, and no file is even read, when the bookkeeping already names every script'
  fails_when: a fully-recorded set still triggers a file read or any statement beyond the bookkeeping
    existence check and the applied-filenames read
- file: src/__tests__/unit/migrate.spec.ts
  name: the manifest declares a "migrate" script that node-runs the built migrate entry point from dist/,
    mirroring "start"'s own precedent of never running a source file
  proves: criterion 1's wiring, 'The tree holds a runnable step', and the implementation's recorded inference
    that 'migrate' runs the built output rather than a source file — asserting the invocation shape (node,
    ending at dist/migrate.js) rather than the exact command line, whose flags are ground every manifest
    script shares and a sibling task may legitimately move
  fails_when: the manifest loses the migrate script, runs it through something other than node, or points
    it at a source file instead of the built dist/migrate.js
- file: src/__tests__/unit/no-test-creates-or-alters-a-table.spec.ts
  name: no test in the tree writes a table-creating or table-altering statement of its own
  proves: the second half of criterion 4, 'no test in the tree creates or alters a table' — a totality
    the criterion itself states over the whole test tree, so the tree-wide scan is the criterion's own
    claim rather than this proof's; kept as delivered, since the tree as it now stands (including the
    sibling initiative's specs) passes it and it still fails over exactly what the criterion forbids
  fails_when: any spec file under src/__tests__/ comes to hold a literal table-creating or table-altering
    DDL statement of its own
not_applicable:
- edge_case: an empty migrations/ directory, or one holding no .sql file
  why: the tree cannot reach that state while the plan's own ground stands — this task's dependency shipped
    0001-schema-migrations.sql and MIG-02 forbids editing an applied script away — and the anchor assertion
    in both integration specs turns that impossibility into a stated failure rather than a vacuous pass,
    which is all a dedicated test could add
- edge_case: two migration files sharing one sequence number
  why: MIG-01 states uniqueness as a rule over the scripts' authors, decided by reading migrations/ itself;
    the step's behavior over a state the standard forbids is a guarantee nobody made, and the runner's
    ordering over well-formed names is already proven
- edge_case: two concurrent runs of the step against one database
  why: no criterion or bound node states concurrent behavior, and connection-level isolation against this
    project's pooled endpoint is task/relational-substrate/integration-test-isolation's own objective,
    disclosed as such in the implementation record's divergences
- edge_case: a crash between applying one script's DDL and recording it as applied
  why: none of the task's criteria state crash-mid-migration behavior, and the implementation records
    the two statements as deliberately un-wrapped in its own inferences and deferred entries; a test would
    assert a guarantee the implementation explicitly does not make
- edge_case: a DATABASE_URL naming an unreachable or slow instance
  why: no criterion or bound node states what the step answers then — the constraint governs where the
    URL is read from, not what happens when the instance it names is down — and EDG-08's scope reaches
    repositories and clients, not this one-shot step
- edge_case: boundary values of a stated range
  why: no criterion of this task states a numeric range
untested:
- migrate.ts's own top-level composition — loadEnv into createDatabaseConnection into applyPendingMigrations,
  then end() — is executed by no test, following the precedent index.ts's own untested top-level composition
  already sets; the CLI path's refusal of an absent DATABASE_URL therefore rests on config/env.ts's loadEnv
  and its own spec, and the no-default property is proven by a test only on the vitest-global-setup path,
  the one this task's own new code could have defaulted in
- the applied order is unobservable in a real database's final state, so "in numbered order" is proven
  only over filesystem and driver stand-ins in the unit spec, never against the externally provisioned
  database
- 'the empty-database transition of criterion 2 is observed through its outcome — the bookkeeping rows
  and the schema sentinel the global setup left — not by this proof running the step against a database
  it first observed empty: schema-qualified global bookkeeping means the suite''s own setup consumed the
  only empty moment this shared database ever had, as both integration specs'' headers state'
- '"the schema the scripts describe" is asserted through one sentinel relation (public.cases) plus the
  bookkeeping totality, not by comparing every relation against every script; the full schema-per-script
  correspondence is task/relational-substrate/schema-migrations'' own already-delivered proof'
divergences:
- cites: STK-08
  file: src/__tests__/integration/vitest-global-setup.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than parsed through config/env.ts's
    loadEnv schema.
  why: loadEnv refuses unless every other application variable is also configured, and the module under
    test reads process.env directly for the identical disclosed reason — proving the no-default property
    against the real path the code takes rather than against a second, schema-parsed one
- cites: STK-08
  file: src/__tests__/integration/persistence/migration-runner.spec.ts
  departure: DATABASE_URL is read directly from process.env rather than parsed through config/env.ts's
    loadEnv schema.
  why: the same reason schema-migrations.spec.ts already discloses — loadEnv couples the file to application
    variables this spec never reads
- cites: MNT-03
  file: src/__tests__/integration/vitest-global-setup.spec.ts
  departure: the three-line read-filter-sort of migrations/'s own listing duplicates the logic migration-runner.ts
    holds privately in orderedMigrationFiles, rather than calling it.
  why: the expectation must come from a source independent of the unit under proof — exporting orderedMigrationFiles
    for the test would let the code under test author its own oracle, and a shared test helper file would
    sit where TST-04's mirror layout has no unit for it to mirror
- cites: MNT-03
  file: src/__tests__/integration/persistence/migration-runner.spec.ts
  departure: the same three-line on-disk listing is duplicated here as well, rather than called from migration-runner.ts
    or shared between the two specs.
  why: the same independence reason, applied to the spec that exercises applyPendingMigrations directly
    — an oracle imported from the module whose ordering and totality are under proof proves the module
    against itself
---

## What it is

The proof of the one way a database gets this schema, re-authored whole against the tree as it stands.
Every totality assertion now derives its expected set from the files under migrations/ read in numbered order, so a correctly numbered migration a later task legitimately adds extends the expectation instead of falsifying it.
The UNDERDETERMINED note travels as two refusal tests: an absent and an empty DATABASE_URL each raise the typed error rather than fall to a default.

## Notes

This is the proof-only re-delivery the re-delivery rule names: the implementation stands untouched, and only the proof answered a tree that moved.
The task whose delivery falsified the old proof is task/connector-registration/connector-configuration-persistence of the http-connector-adapter initiative, whose legitimate migrations/0008-connector-configuration.sql exceeded the closed EXPECTED_MIGRATION_FILENAMES enumeration the old specs hardcoded — totality over ground the two tasks share, claiming more than this task's criteria establish.
The rewritten oracle reads migrations/ itself, anchored on 0001-schema-migrations.sql so an empty or misdirected directory read cannot agree vacuously with an empty bookkeeping table.
Two runs preceded the one this record cites and are kept by name: run/relational-substrate-migration-step-suite-6 and run/relational-substrate-migration-step-suite-7 failed before any test ran because the invoking session had not exported DATABASE_URL — the setup's own typed refusal, which is the behavior two of these tests prove — and no test changed between them and the cited run.
