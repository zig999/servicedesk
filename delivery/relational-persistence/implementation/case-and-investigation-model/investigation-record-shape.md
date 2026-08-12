---
title: Investigation carries written_at and pins its case by slug and version alone
summary: The investigation aggregate and its one factory now declare a required written_at attribute,
  enforced at runtime, and materialize the pinned-case relationship as exactly slug and version, reading
  no digest over the case's content.
task: sha256:496bd555a1e4c81512b602007772b45168ca131cdf4e74faee4365ae619ec7dd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-investigation-record-shape-build-2
files:
- path: src/investigation/investigation.ts
  effect: PinnedCase is now exactly { slug, version } (hash removed); Investigation gains a required written_at
    (ISO-8601 datetime) attribute, documented as distinct from the four replay pins
- path: src/investigation/investigation-factory.ts
  effect: BuildInvestigationOptions gains a required written_at, copied straight through into the built
    value unchanged; pinnedCaseOf now returns only { slug, version } and no longer reads theCase.hash;
    a new refuseMissingWrittenAt guard throws WrittenAtRequiredError synchronously, before subject assembly
    and the glossary/totality refusals, whenever written_at is absent at runtime — so criterion 4 holds
    regardless of what the caller's own type-checking enforced
- path: src/investigation/run-diagnosis.ts
  effect: buildInvestigationOptions() now supplies written_at, derived from this run's own already-propagated
    now (new Date(options.now).toISOString()) rather than a fresh clock read; module comment discloses
    the derivation
- path: src/errors/written-at-required.error.ts
  effect: new typed error WrittenAtRequiredError, following the same name-message-context shape as RequesterRequiredError
    and SubjectCarriesNoAttributeError, carrying context.given (the value actually seen, if any)
criteria:
- criterion: The pinned case carries the slug and the version of the case that ran and nothing else.
  met: true
  how: 'PinnedCase (investigation.ts) is declared as exactly { slug: string; version: number }, and pinnedCaseOf
    (investigation-factory.ts) builds only those two fields from the given case'
- criterion: No module derives or reads a digest over a case's content when building an investigation.
  met: true
  how: pinnedCaseOf no longer reads theCase.hash — the one place in the build path that ever touched it;
    no other function reachable from buildInvestigation (case-resolution.ts's collectionPlan/requiresEvaluationOf,
    subject.ts's buildSubject) reads a hash or digest either
- criterion: A built investigation carries written_at as a datetime recording when its one write happened.
  met: true
  how: Investigation.written_at (string, ISO-8601) is a required attribute, populated by buildInvestigation
    from BuildInvestigationOptions.written_at unchanged; run-diagnosis.ts supplies that value from the
    run's own propagated now, converted to an ISO string the same way evidence-collection-stage.ts already
    converts now into observed_at
- criterion: The factory refuses to build an investigation without written_at.
  met: true
  how: refuseMissingWrittenAt throws WrittenAtRequiredError synchronously, before subject assembly and
    the glossary/totality refusals run, whenever options.written_at is undefined — a real runtime behavior,
    not only the compile-time constraint the field's required type already gives, following the same throw-before-constructing-anything
    convention refuseAttributesNotInGlossary and refuseTotalityViolations already keep in this file
- criterion: A built investigation carries the model, the prompt version and its evidence beside the pinned
    slug and version.
  met: true
  how: model, prompt_version and evidence remain unchanged attributes of Investigation, copied straight
    through by buildInvestigation exactly as before, sitting beside the now-reduced pinned_case
nodes:
- node: domain/investigation/investigation
  encoded_at:
  - src/investigation/investigation.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/run-diagnosis.ts
  how: the aggregate's written_at attribute (required, ISO-8601 datetime, enforced at runtime) is declared
    on Investigation and BuildInvestigationOptions, copied straight through by buildInvestigation and
    supplied by run-diagnosis.ts from the run's own propagated instant; the pinned-case relationship the
    node's relationships section names is materialized as PinnedCase, carrying exactly slug and version
- node: rules/investigation/replay-is-pinned
  encoded_at:
  - src/investigation/investigation.ts
  - src/investigation/investigation-factory.ts
  how: PinnedCase and pinnedCaseOf now pin the case by exactly slug and version, never a digest over its
    content, matching the rule's own "slug and version name one content without a digest over it"; the
    rule's other three pins — model, prompt_version and evidence — remain the unchanged attributes buildInvestigation
    already copied straight through
inferences:
- inferred: written_at's value, when produced through the diagnose pipeline, is derived from RunDiagnosisOptions'
    own already-propagated now (new Date(now).toISOString()) rather than a fresh clock read taken nearer
    the actual write
  from: run-diagnosis.ts's own established discipline of never reading the system clock internally and
    taking (now, deadline) as explicit parameters (constraints/the-deadline-is-an-absolute-propagated-instant),
    evidence-collection-stage.ts's own now-to-observed_at conversion convention, and investigation-factory.ts's
    own "computes nothing about the world" convention, which forbids the factory itself from calling Date.now();
    no node states which instant "when the write happened" must be measured from, and now — stamped at
    request entry in production-diagnose.factory.ts, shortly before the one write that follows — is the
    one clock instant this whole run already carries
- inferred: criterion 4's refusal is enforced as a real runtime guard (refuseMissingWrittenAt throwing
    WrittenAtRequiredError) rather than relying only on written_at being a required TypeScript field
  from: the criterion's own wording ("refuses to build") mirrors the phrasing already used in this same
    factory for behavior that does throw (the subject-attribute and totality refusals); a first pass had
    left this to the type system alone, matching how every other required field in this factory is enforced,
    but the test-author's proof read the criterion literally and disagreed — recorded as contested — and
    this correction resolves it by adding the guard rather than weakening the test
- inferred: the new refusal follows refuseTotalityViolations' shape (a small, synchronous, single-purpose
    guard throwing one dedicated typed error) rather than being folded into InvestigationNotBuildableError
  from: InvestigationNotBuildableError's own doc comment ties its meaning specifically to the two totality
    rules; stretching it to also mean "written_at absent" would misstate what it means, where a new, narrowly-scoped
    error class matches this codebase's own one-error-per-business-fact convention (RequesterRequiredError,
    SubjectCarriesNoAttributeError)
preserved:
- Every other required attribute of Investigation/BuildInvestigationOptions (id, requester, ticket_ref,
  narrative, subject, model, prompt_version, evidence, evaluations, assessment, cost, durations) keeps
  flowing unchanged through buildInvestigation, copied straight from the given options exactly as before.
- ticket_ref's existing required-string shape is left exactly as it stood; this task does not touch it,
  per its own UNDERDETERMINED note.
- The subject-assembly/glossary refusal and both totality refusals (evidence-collection-plan coverage,
  evaluation-required-hypothesis coverage) keep running exactly as before, now preceded by the new written_at
  guard, unaffected in their own behavior by either change.
- run-diagnosis.ts's deadline propagation (the now/deadline pair, JUDGMENT_STAGE_BUDGET_MS and PERSISTENCE_STAGE_BUDGET_MS
  intersections) and its write-once-and-race-against-deadline behavior are unchanged.
- diagnose.factory.ts, production-diagnose.factory.ts and diagnose.controller.ts keep compiling and running
  unchanged, since RunDiagnosisOptions' own field set was not touched beyond written_at.
divergences:
- from: the ordinary route of re-delivering the proof over the task that owns the test — task/investigation-lifecycle/investigation-factory
    and task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject (owning
    investigation-factory.spec.ts), whichever task owns file-investigation-store.repository.spec.ts, and
    task/diagnose-entry-point/diagnose-pipeline-composition (owning run-diagnosis.spec.ts, per that file's
    own header comment) — all under now-closed initiatives (investigation-engine, investigation-engine-v2,
    live-engine-mvp)
  departure: Three pre-existing test files were edited directly inside this delivery rather than through
    their owning tasks, all explicitly authorized by the human. (1) src/__tests__/integration/persistence/file-investigation-store.repository.spec.ts
    — anInvestigation()'s pinned_case literal dropped hash and the fixture gained a required written_at;
    no new assertion was added, since every test here already round-trips the whole document through toEqual/toMatchObject
    checks that already exercise written_at. (2) src/__tests__/unit/investigation/investigation-factory.spec.ts
    — validOptions() gained a required written_at, and the pre-existing "pins the case by exactly slug,
    version and hash" test was narrowed to {slug, version} with an added not.toHaveProperty('hash') check,
    since that assertion is the exact fact this task's criterion 1 changes. (3) src/__tests__/unit/investigation/run-diagnosis.spec.ts
    — the "pins the case by slug, version and hash..." test's toMatchObject expectation was narrowed the
    same way; and "runs and pins exactly the case object given to each call, never a case any other source
    might have published" was rewritten, because its two calls differ only in the case's own hash and
    share the same slug/version, so nothing observable through the narrowed pinned_case can any longer
    distinguish one call's case from the other's — no substitute difference was invented, the test was
    renamed and weakened to what remains true, and the lost cross-call-isolation guarantee is recorded
    under the proof's untested list instead of asserted.
  why: All three owning initiatives carry closure.md and are history; the ordinary route (re-deliver the
    proof over the task that owns the test) does not exist for any of them, and the human explicitly authorized
    folding all three fixes into this delivery instead of cutting a corrective task through /plan-work.
deferred:
- what: The eight other required attributes of Investigation (id, requester, narrative, subject, evaluations,
    assessment, cost, durations) and ticket_ref's optionality, both named in this task's own UNDERDETERMINED
    notes.
  why: No criterion of this task reaches them; the notes explicitly say a factory refusing to build without
    them, or requiring ticket_ref, would pass every stated criterion and a test must exclude that reading
    — so they are left exactly as the codebase already declares them.
- what: Case's own hash field, and removing it from the Case aggregate.
  why: This task's own ADVISORY note names this as the seam of the task that models the case aggregate
    (domain/knowledge/case), not this one — the field types for slug and version are read here but governed
    there.
- what: The seven case/hypothesis Rules and the two resolve-outcome/hypothesis nodes named in this task's
    own REMAINDER and ADVISORY notes.
  why: This task builds an investigation and neither authors nor validates a case, per its own notes;
    they belong to the tasks implementing domain/knowledge/case and domain/knowledge/hypothesis.
- what: Cross-call isolation of pinned_case in run-diagnosis.spec.ts's own second rewritten test — that
    one call's given case can never leak into another call's investigation.
  why: The fixture's two cases differed only by hash, which pinned_case no longer carries; re-establishing
    this guarantee needs either a fixture differing by slug/version or a different seam (e.g. spying on
    which Case object reaches pinnedCaseOf), neither of which this task's own criteria ask for — recorded
    as untested in the proof instead of invented here.
---

## What it is

The investigation aggregate and its one factory, brought to the attributes the specification
declares: a required written_at recording when the one write happened, enforced at runtime and
not only by the type system, and a pinned case narrowed to exactly slug and version, with no
digest over the case's content read anywhere in the build path.

## Notes

Three pre-existing test files, all belonging to now-closed initiatives, broke against this task's
own legitimate shape change and were fixed directly inside this delivery rather than through a
re-delivery their owning work roots can no longer receive — see the divergence entry below for
the full account, and the proof's own divergences for what each fix changed.
Criterion 4 was first delivered relying on written_at being a required TypeScript field alone,
matching how every other required field in this factory is enforced; the proof's own author read
the criterion's "refuses to build" literally, disagreed, and that disagreement (recorded in the
proof as contested) is what led to adding an explicit runtime guard rather than settling it by
weakening the test.
