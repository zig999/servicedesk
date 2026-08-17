---
title: Wire the six case-lifecycle operations and retire author-case-version
summary: Adds the case-lifecycle composition root, rewires case-query.service.ts and seed.ts off the retired
  ICaseStore.readVersion/writeVersion shape and the retired author-case-version command, and deletes the
  three retired files. This is the task whose landing brings the whole project's own typecheck/lint/secret-scan
  green across every sibling task in this delivery.
task: sha256:6099ea98dbb1819ea515e22e38deb43ed8ed5e30e3d488a7c6a1dc321df9d976
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-epic-final-build
files:
- path: src/factories/case-lifecycle.factory.ts
  effect: new composition root; createCaseLifecycle(connection) builds the case store, glossary-query
    and capability-query from one shared connection and returns CaseLifecycleOperations — createDraft,
    reviseHypothesis, placeHypothesis, removeHypothesis, release and discard — each a plain callable function,
    the way author-case-version.factory.ts once exposed the one retired command.
- path: src/case/case-query.service.ts
  effect: 'readCase and replayCase now call ICaseStore.assembleVersion instead of the retired readVersion;
    readCase projects the assembled version into the raw flat document shape parseCaseDocument accepts
    and still runs full structural+coherence validation on every read; replayCase reshapes the assembled
    version directly into Case''s nested ManifestEntry/HypothesisRevision/HypothesisIdentity shape, trusting
    it without revalidation. The public ReadCaseResult{case: Case} shape run-diagnosis.ts and diagnose.controller.ts
    consume is unchanged.'
- path: src/seed.ts
  effect: seedCase now builds the curated case through createCaseLifecycle's createDraft, then placeFixtureHypotheses
    (revising and placing each fixture-declared hypothesis at its own manifest position), then release
    — instead of the retired authorCaseVersion(document) call; alreadySeeded now calls assembleVersion
    instead of readVersion; the defensive CaseVersionAlreadyStoredError catch is dropped since the new
    path never raises it. CaseFixtureHypothesis/CaseFixture were adapted to the manifest document shape
    (position/hypothesis_name/criterion/collects/resolution) once the committed fixture JSON itself was
    updated to that shape.
- path: src/case/author-case-version.service.ts
  effect: deleted — AuthorCaseVersionService no longer exists; replaced in full by the six case-lifecycle
    operations.
- path: src/case/author-case-version.port.ts
  effect: deleted — IAuthorCaseVersion no longer exists.
- path: src/factories/author-case-version.factory.ts
  effect: deleted — createAuthorCaseVersion no longer exists, replaced by case-lifecycle.factory.ts's
    own createCaseLifecycle.
criteria:
- criterion: create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, release and discard
    are each reachable as one callable operation from a single composition root, the way author-case-version.factory.ts
    once exposed the one retired command.
  met: true
  how: createCaseLifecycle(connection) in factories/case-lifecycle.factory.ts returns one CaseLifecycleOperations
    object exposing all six operations, each a plain (input) => Promise<...> function backed by CreateDraftOperation,
    ReviseHypothesisOperation, the placeHypothesis/removeHypothesis functions, ReleaseOperation and discardCaseVersion
    — composed from the same three leaf factories (case-store, glossary-query, capability-query) author-case-version.factory.ts
    used to compose. No HTTP route is wired, matching the task's own scope exclusion.
- criterion: No file still constructs AuthorCaseVersionService, references IAuthorCaseVersion, or imports
    author-case-version.factory.ts.
  met: true
  how: 'AuthorCaseVersionService, IAuthorCaseVersion and createAuthorCaseVersion no longer exist as live
    code anywhere: the three files that declared them were deleted from disk. A tree-wide grep confirms
    no remaining production file constructs, references or imports any of the three; every pre-existing
    test file that referenced them by path was also fixed (case-query.service.spec.ts and others) or,
    for the two spec files that tested only the retired classes directly (author-case-version.service.spec.ts,
    author-case-version.factory.spec.ts), deleted alongside them, since they test a command that no longer
    exists and are not migrated to anything.'
nodes:
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/factories/case-lifecycle.factory.ts
  how: This contract's six operations were each already implemented by the five sibling tasks this task
    depends on; this task's own contribution is making them reachable together — createCaseLifecycle wires
    all six into the one callable surface the contract's own 'published api' direction requires, replacing
    the single author-case-version entrance this contract's context used to expose through a different,
    now-retired contract.
inferences:
- inferred: seed.ts reads the curated case fixture as CaseFixture — its own committed manifest array,
    each entry naming its own position — rather than reshaping the fixture file itself into a different
    shape.
  from: the fixture file's own committed document shape now mirrors parse-case-document.ts's own ManifestEntryDocument
    exactly (position, hypothesis_name, revision, criterion, collects, resolution), once the fixture JSON
    was itself brought into sync with the new document shape as part of this same continuous delivery.
- inferred: seedCase's defensive catch of CaseVersionAlreadyStoredError, present in the retired author-case-version
    path, is dropped entirely rather than replaced by an equivalent catch of some other error.
  from: RelationalCaseStore's own createDraft never raises CaseVersionAlreadyStoredError — its only unique-violation
    mapping for the at-most-one-draft rule is CaseAlreadyHasDraftError, and no sibling task's criteria
    state a replacement race-safety behavior for the new path, so alreadySeeded() remains this script's
    sole idempotency guard exactly as before.
- inferred: revise-hypothesis's required subject input is supplied in seed.ts as the fixture's own declared
    case-level subject.
  from: revise-hypothesis.operation.ts's own header comment states the caller is responsible for anchoring
    subject to the case's own current draft; seed.ts is that caller, and the draft it just created carries
    exactly that subject.
divergences:
- from: "MNT-03 (reuse rather than duplicate), in case/case-query.service.ts"
  departure: assembledAsRawDocument duplicates release.operation.ts's own private assembledAsDocument
    projection (the same AssembledCaseVersion-to-flat-document reshaping) rather than sharing one implementation.
  why: release.operation.ts's own assembledAsDocument is a private, non-exported function in a sibling
    task's already-delivered file; sharing it would require editing that file to export it, which reaches
    past this task's own touched-file set. Never widening the task took precedence over sharing five lines
    of projection logic.
preserved:
- 'ICaseQuery.readCase''s answer shape (ReadCaseResult{case: Case}, with hypotheses/criterion/collects/resolution)
  exactly as run-diagnosis.ts''s evidenceByHypothesisOf and diagnose.controller.ts''s handleDiagnoseRequest
  already consume it.'
- replayCase's public signature and its 'no revalidation' contract for pinned investigation reproduction
  (rules/investigation/replay-is-pinned).
- diagnose.factory.ts, diagnose-server.factory.ts, case-store.factory.ts and case-query.factory.ts's own
  existing wiring — none referenced the case store's retired shape or the retired command, so none needed
  a change.
- seed.ts's own write-once idempotency gate (alreadySeeded(), skipping the whole vocabulary/concept/capability/case
  sequence on a rerun) and its self-check read (verifySeededCase).
deferred:
- what: src/errors/case-version-already-stored.error.ts (CaseVersionAlreadyStoredError) is no longer constructed
    anywhere in production source after this rewiring, but was left in place rather than removed.
  why: several pre-existing test files still import it directly by path; removing the file would break
    them further than fixing them did.
- what: Whether the case identity 'intermittent-connection-outage'/1, once genuinely released for real
    against the shared, persistent test database, can ever again be wiped back to a clean starting state
    for a test whose own premise assumes an empty database (seed.spec.ts's own 'genuinely empty' precondition).
  why: this is a cross-cutting test-infrastructure finding spanning several pre-existing test files (seed.spec.ts,
    diagnose-server.factory.spec.ts, diagnose-e2e.spec.ts, case-fixture-reads-clean.spec.ts, relational-glossary-store.repository.spec.ts's
    own writeTerms() whole-table-replace), all independently seeding and releasing the identical fixture
    case identity against one persistent database. The human explicitly reviewed this finding and chose
    to close this delivery's own implementation records without redesigning the shared test-fixture strategy;
    disclosed here rather than silently worked around.
---

## What it is

The composition root that makes the five operation tasks a reachable surface rather than five unconnected classes.
No HTTP route is required of it — the scope explicitly excludes one.

## Notes

This is the task whose own landing brought the whole project's typecheck/lint/secret-scan green (case-lifecycle-epic-final-build, all four steps passed). No proof record is composed yet: the whole-project test suite still fails, but only over two structural, out-of-scope findings this record's own `deferred` discloses — neither is a defect of this task's own criteria, and the human explicitly chose to close every implementation record now and settle the suite separately.
