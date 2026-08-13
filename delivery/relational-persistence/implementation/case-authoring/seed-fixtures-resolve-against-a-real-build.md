---
title: Seed resolves its fixtures against the source tree instead of the compiled output
summary: seed.ts's FIXTURES_ROOT now steps up from its own module URL into the package's src/fixtures
  directory, so a compiled dist/seed.js finds the fixtures a real npm run build never copies there.
task: sha256:1e1f7bca5018ff56415df6bbe8077651948c040a86be86fc0063c971a815fc0b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-authoring-seed-fixtures-resolve-against-a-real-build-build
files:
- path: src/seed.ts
  effect: FIXTURES_ROOT is now computed as fileURLToPath(new URL('../src/fixtures', import.meta.url))
    instead of new URL('./fixtures', import.meta.url). From dist/seed.js this resolves to <package-root>/src/fixtures
    (the fixtures directory a real npm run build leaves untouched but present, rather than the nonexistent
    dist/fixtures the ENOENT in the intake reported); from the uncompiled src/seed.ts it resolves to the
    identical directory, because dist/ and src/ sit exactly one level below the package root. No function,
    no read, no write sequence and no idempotency check in the file was touched — only this one constant
    and the comment immediately above it, which now states why the relative segment is '../src/fixtures'
    rather than './fixtures'.
criteria:
- criterion: From a clean checkout with no dist/ directory at all, npm run build followed by npm run seed
    exits 0.
  met: true
  how: npm run build (tsc -p tsconfig.build.json) compiles seed.ts unchanged in every respect except this
    one constant. Once run as dist/seed.js, FIXTURES_ROOT resolves via '../src/fixtures' from the compiled
    file's own import.meta.url to <package-root>/src/fixtures — the real, already-committed fixtures directory
    — so every readFile call in fixtureTerms, seedConcepts, seedCapabilities and seedCase succeeds instead
    of throwing the ENOENT the intake captured against dist/fixtures/..., which never exists because tsconfig.build.json
    only emits .ts files.
- criterion: The seed step reads every fixture it needs — the five glossary vocabularies, the concept
    and capability registrations, and the curated case at case/intermittent-connection-outage/1.json —
    because the project's own build step placed them where the compiled seed script looks, not because
    dist/ was populated by any other means.
  met: true
  how: A real npm run build always produces dist/seed.js at the same fixed offset from the package root
    (one level below it, the sibling of src/). FIXTURES_ROOT's own relative URL is resolved purely from
    that offset — no separate copy, no environment variable, no manual population of dist/ — so the compiled
    script locates outcome.json, subject-type.json, subject-attribute.json, action.json, recipient.json,
    concept.json, capability.json and case/intermittent-connection-outage/1.json as a direct consequence
    of the build having produced dist/seed.js at all. The task's own Notes name this construct, alongside
    a build step that copies src/fixtures/** into dist/, as either satisfying this criterion; this delivery
    took the first because it extends an existing, already-documented convention (seed.ts's own header
    already claimed it "locates the fixtures the same way migrate.ts locates the migrations directory")
    with a one-line fix rather than adding a new build step, a new npm script, or a copy utility outside
    the authorized dependency list.
- criterion: Running npm run seed a second time against a database that already holds the curated case
    still exits 0, unchanged from the idempotency alreadySeeded already provides.
  met: true
  how: alreadySeeded() and seedCase's own catch of CaseVersionAlreadyStoredError are untouched by this
    delivery. The only change is where FIXTURES_ROOT points, which has no bearing on whether the curated
    case already stands; a second run still checks alreadySeeded() before any write and still skips the
    whole seeding sequence when it answers true, exactly as task/case-authoring/curated-data-seeded's
    own delivery established.
inferences:
- inferred: Fixtures are resolved directly against the source tree ('../src/fixtures' from seed.ts's own
    module URL) rather than adding a build step that copies src/fixtures/** into dist/fixtures.
  from: the task's own ADVISORY Notes name both as constructs that satisfy every criterion without contradicting
    the specification, and the codebase already carries the identical technique in migrate.ts ('../migrations',
    a relative URL resolved from import.meta.url with no environment variable) — seed.ts's own header
    comment already claimed to follow that exact convention before this fix, so extending it to genuinely
    reach outside the compiled rootDir keeps one existing idiom rather than introducing a new build step,
    a new npm script, or a copy dependency outside the authorized set (none of which offers a cross-platform
    file-copy utility in any case).
preserved:
- 'The seeding order and content task/case-authoring/curated-data-seeded already delivered: seedOutcomes
  before seedRemainingVocabularies, seedConcepts, seedCapabilities and seedCase, then verifySeededCase''s
  uncaught self-check read.'
- alreadySeeded()'s write-once gate over the whole seeding sequence, and seedCase's own catch of CaseVersionAlreadyStoredError,
  which together make a rerun of npm run seed idempotent.
- src/__tests__/integration/seed.spec.ts's own technique of dynamically importing seed.ts directly as
  uncompiled TypeScript (its own SEED_MODULE_URL) — the new relative segment resolves to the same real
  fixtures directory whether import.meta.url is the compiled dist/seed.js or the uncompiled src/seed.ts,
  so that test's own execution path keeps working unmodified.
- migrate.ts's own '../migrations' resolution and MIGRATIONS_DIRECTORY constant, left untouched.
deferred:
- what: src/__tests__/unit/seed.spec.ts and src/__tests__/unit/migrate.spec.ts each assert that package.json's
    "seed"/"migrate" scripts equal exactly 'node dist/seed.js' / 'node dist/migrate.js', but the manifest's
    actual scripts are 'node --env-file=.env dist/seed.js' and 'node --env-file=.env dist/migrate.js'
    — a mismatch that predates this delivery and is unrelated to the fixture-path bug this task corrects.
  why: This task's objective is exclusively the ENOENT against a real build, not the exact text of the
    "seed"/"migrate" script strings or their own tests; touching package.json's scripts or those two spec
    files would widen this task past what the intake and the criteria describe.
---

## What it is

The one-line fix to task/case-authoring/curated-data-seeded's own delivered seed.ts, so that a real npm run build followed by npm run seed completes instead of failing with ENOENT on the first fixture it tries to read.
FIXTURES_ROOT now resolves against the source tree (src/fixtures, one level up and back down from seed.ts's own compiled or uncompiled location) rather than against the compiled output directory tsc never populates with JSON.

## Notes

ADVISORY, from the specification — this task carries no implements: the execution-contract-binder found that none of the twelve candidates inside epic/case-authoring's covers governs a script's own asset-resolution mechanism, which is the project's own source arrangement rather than a domain fact.
An inference is recorded above: fixtures are resolved directly against the source tree rather than through a new build step that copies src/fixtures/** into dist/, extending the same relative-URL, no-environment-variable technique migrate.ts already uses for ../migrations.
A deferral is recorded above: src/__tests__/unit/seed.spec.ts and migrate.spec.ts assert the exact pre-existing script text of package.json's "seed"/"migrate" entries, which already reads 'node --env-file=.env dist/seed.js' on this tree from an earlier, out-of-band edit unrelated to this task's own objective — expect the suite to fail on those two assertions for a reason this delivery did not introduce and does not correct.
