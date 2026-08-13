---
title: Seed fixture resolution and its manifest reconciliation, reviewed
summary: Four passes over the two corrective deliveries that took npm run seed from ENOENT to a real,
  working run against the configured database -- coverage, specification conformance, standard conformance,
  and why the review's own fresh suite capture came back red.
reviewed:
- src/seed.ts
- src/__tests__/unit/seed.spec.ts
- src/__tests__/unit/migrate.spec.ts
tasks:
- task/case-authoring/seed-fixtures-resolve-against-a-real-build
- task/relational-substrate/manifest-env-file-scripts-vs-their-tests
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
coverage:
- criterion: From a clean checkout with no dist/ directory at all, npm run build followed by npm run seed
    exits 0.
  state: uncovered
  why: Nothing in the test set invokes npm run build, tsc, or npm run seed as a subprocess, and nothing
    deletes or checks the absence of dist/ beforehand. src/__tests__/unit/seed.spec.ts computes what a
    build would place at dist/seed.js by string arithmetic on a hardcoded package-root/dist/seed.js path
    -- it never runs tsc and never spawns node -- and src/__tests__/integration/seed.spec.ts explicitly
    bypasses compilation altogether, running seed.ts through a dynamic import of the uncompiled source.
    No test would fail if the real build-then-seed pipeline stopped exiting 0.
- criterion: The seed step reads every fixture it needs — the five glossary vocabularies, the concept
    and capability registrations, and the curated case at case/intermittent-connection-outage/1.json —
    because the project's own build step placed them where the compiled seed script looks, not because
    dist/ was populated by any other means.
  state: covered
  tests:
  - file: src/__tests__/unit/seed.spec.ts
    name: FIXTURES_ROOT resolves, from the fixed path a real build places seed.js at, to the exact directory
      the fixtures are actually committed in
  - file: src/__tests__/unit/seed.spec.ts
    name: reads every fixture the seed step needs -- the five glossary vocabularies, the concept and capability
      registrations, and the curated case -- through that same built-location resolution, matching the
      real committed content exactly
  why: 'Both tests extract seed.ts''s own currently-declared FIXTURES_ROOT segment from source and resolve
    it against the fixed build output location tsconfig.build.json''s outDir/rootDir actually produce.
    The one thing left unexercised: the hardcoded ''dist'' assumption is never checked against tsconfig.build.json
    itself -- if outDir moved, these tests would keep passing on a now-wrong assumption -- a narrower
    gap than the criterion states.'
- criterion: Running npm run seed a second time against a database that already holds the curated case
    still exits 0, unchanged from the idempotency alreadySeeded already provides.
  state: partial
  tests:
  - file: src/__tests__/integration/seed.spec.ts
    name: resolves without rejecting when seed.ts is run a second time against a database it has already
      seeded
  why: 'This test runs seed.ts''s real, unedited top-level sequence a second time against an already-seeded
    database and asserts the promise resolves. What it does not exercise is "npm run seed" as a literal
    command: it never spawns the package.json script or a node subprocess, so a break confined to the
    script''s own wiring (a wrong path, a missing --env-file flag) would leave this test green while the
    stated criterion -- the command exiting 0 -- no longer held.'
- criterion: package.json's `migrate` script is exactly `node --env-file=.env dist/migrate.js`, and its
    `seed` script is exactly `node --env-file=.env dist/seed.js`.
  state: covered
  tests:
  - file: src/__tests__/unit/migrate.spec.ts
    name: the manifest declares a "migrate" script that runs the built migrate.js from dist/, mirroring
      "start"'s own precedent
  - file: src/__tests__/unit/seed.spec.ts
    name: the manifest declares a "seed" script that runs the built seed.js from dist/, mirroring "migrate"'s
      own precedent
- criterion: src/__tests__/unit/migrate.spec.ts's own assertion on the `migrate` script, and src/__tests__/unit/seed.spec.ts's
    own assertion on the `seed` script, each match package.json's actual current text exactly, asserting
    the whole script string rather than a substring or a pattern.
  state: uncovered
  why: 'This criterion is a property of the two spec files'' own source code -- whether their assertions
    use toBe on the whole string rather than toContain or a regex -- and nothing in the given test set
    can exercise it as a runtime behavior: no test in the set inspects migrate.spec.ts or seed.spec.ts
    as data. Direct reading confirms both files currently use expect(...).toBe(<whole literal string>),
    matching package.json''s current text exactly, so the criterion holds today by inspection -- but if
    either assertion were loosened to a substring or pattern check tomorrow, no test in this set would
    fail.'
- criterion: '`npm test`, run with `DATABASE_URL` and the rest of what `config/env.ts` requires present
    in the process environment, exits 0.'
  state: uncovered
  why: This names the exit status of the whole npm test invocation itself. No test in the given set spawns
    npm test as a subprocess or inspects its exit code -- and a test running as part of that suite cannot
    meaningfully assert on the exit code of the run it is itself a part of. This can only be established
    by an actual captured run outside the suite.
failures_counted: 3
run: run/review-seed-fixtures-and-manifest-scripts
findings:
- pass: conformance
  file: src/seed.ts
  where: the seedCapabilities function's docstring, lines 128-134
  evidence: a re-registration under an already-held name and version replaces its own record rather than
    refusing (CapabilityRegistryService's own sameIdentity holding), so rerunning this script is safe
    without an ON CONFLICT clause of its own.
  cost: domain/integration/capability-registry.md's own Responsibility states only what the registry refuses
    on registration -- a nature that is not read-only, or a registration lacking its declared contract.
    None of the candidate nodes says whether registering the same name and version a second time is refused
    or silently replaces the existing record. That choice is asserted here as an established fact of the
    system, so a reader who checks the specification for what a duplicate registration does will not find
    it there -- only in this comment and the service it describes.
  correction: domain/integration/capability-registry.md (or a rule constraining it) would have to state
    whether re-registering an already-held name and version replaces the record or is refused, so the
    comment could cite that node instead of asserting the behavior on its own authority.
- pass: standard
  file: src/__tests__/unit/seed.spec.ts
  where: lines 68-77, the manifestScripts schema and readManifestScripts function
  cites: MNT-03
  evidence: "const manifestScripts = z.object({\n  scripts: z.record(z.string(), z.string()).optional(),\n\
    });\n\nasync function readManifestScripts(): Promise<Record<string, string>> {\n  const text = await\
    \ readFile(MANIFEST_PATH, 'utf8');\n  const parsed: unknown = JSON.parse(text);\n  return manifestScripts.parse(parsed).scripts\
    \ ?? {};\n}"
  cost: This block is byte-for-byte the same block already declared in src/__tests__/unit/migrate.spec.ts
    -- the file's own header even says it is mirroring that sibling script's pattern exactly. A change
    to how the manifest's scripts section is validated has to be made in both files, and the copy nobody
    remembered to touch keeps passing against the old shape.
  correction: Extract the schema and readManifestScripts into one shared test helper both spec files import,
    instead of each file declaring its own copy.
- pass: standard
  file: src/seed.ts
  where: lines 111-126, seedConcepts
  cites: MNT-03
  evidence: this mirrors the exact parameterized SQL __tests__/integration/fixtures/case-fixture-reads-clean.spec.ts's
    own insertConcepts helper already runs against the same two tables
  cost: seedConcepts reproduces the same two parameterized INSERT statements that already exist, under
    the same shape, in three test files (case-fixture-reads-clean.spec.ts, diagnose-server.factory.spec.ts,
    diagnose-e2e.spec.ts). A change to the concepts/concept_accepts write shape now has to land in four
    places, and any one left behind diverges silently from the others the next time a column is added
    or a conflict target changes.
  correction: Extract the concepts/concept_accepts insert logic into one function seed.ts and the test
    helpers all call, rather than each declaring its own copy of the same SQL.
- pass: failures
  file: src/__tests__/integration/seed.spec.ts
  where: wipeFixtureOwnedRows, beforeAll hook, line 159 (DELETE FROM public.outcomes)
  evidence: 'error: update or delete on table "outcomes" violates foreign key constraint "case_versions_fallback_outcome_fkey"
    on table "case_versions"'
  cause: setup
  cost: all 13 tests in this file were skipped, so criterion 1 (non-conclusion outcomes present after
    a from-empty seed run) and every other criterion this file proves about seed.ts's idempotent re-run
    went unproven this run
  correction: the shared, externally-provisioned database must not hold a case_versions row referencing
    the fixture's outcome names before this suite runs; the row this hook could not delete around was
    written by a run outside this captured suite (a manual npm run seed against the same real database),
    and this file's own wipe only ever targeted rows scoped to its own slug -- nothing in this file's
    own routines is meant to, or can, absorb state a command run outside the captured suite left in a
    shared instance
- pass: failures
  file: src/__tests__/integration/factories/glossary.factory.spec.ts
  where: beforeAll hook, line 45 (pool.query('DELETE FROM public.outcomes'))
  evidence: 'error: update or delete on table "outcomes" violates foreign key constraint "hypotheses_resolution_outcome_fkey"
    on table "hypotheses"'
  cause: setup
  cost: both tests in this file were skipped, so nothing about seeding the two non-conclusion outcomes
    into an empty outcomes table was proven this run
  correction: same root cause as the sibling finding above -- this beforeAll's own unconditional DELETE
    FROM public.outcomes assumes no hypotheses row anywhere references an outcome yet; a case authored
    outside the captured suite, against the same shared database, left exactly such a row
- pass: failures
  file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  where: wipeGlossaryTables, beforeEach/afterEach hook, line 54 (DELETE FROM public.concepts)
  evidence: 'error: update or delete on table "concepts" violates foreign key constraint "hypothesis_collects_concept_name_fkey"
    on table "hypothesis_collects"'
  cause: setup
  cost: all 9 tests in this file were skipped, so nothing about RelationalGlossaryStore's read/write behavior
    over concepts and vocabularies was proven this run
  correction: same root cause -- a hypothesis_collects row from a case authored outside this captured
    run, against the same shared database, still references a concept this hook tries to delete; this
    file's own wipe has no way to distinguish that row from one its own tests wrote
---

## What it is

The independent review of the two corrective deliveries that took npm run seed from ENOENT to a real run: whether the tests prove the criteria, whether the source states only what the specification holds, whether it follows the project's own standard, and why this review's own fresh suite capture came back red.
The three failing test files are outside the file set either delivery touched; their own captured run is included because the failures pass runs over the whole change's own fresh capture, not only the files under review.

## Notes

The three failing spec files' own root cause is one shared fact, not three independent defects: a real case authored earlier in this session by npm run seed against the same shared, externally-provisioned database now leaves rows in outcomes/concepts that each file's own cleanup hook cannot delete around. The failures pass recorded one finding per reported failure, as the contract requires, even though the root is shared.
The specification and standard passes both looked past items disclosed in this session's own conversation but not asserted here as findings: the specification pass left seedConcepts's own bypass of IGlossaryStore's port for the standard pass, since it is an architecture question rather than a domain fact; the standard pass left seed.ts's unguarded JSON.parse type assertions and its lack of a wrapping transaction across its several writes, since TYP-02 is tool-decided and EDG-05's scope does not reach a top-level script.
