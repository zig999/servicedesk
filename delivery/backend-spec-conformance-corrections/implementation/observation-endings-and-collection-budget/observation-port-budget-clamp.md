---
title: The observation port accepts a remaining-budget bound and the production adapter clamps its call
  to it
summary: IObservationSource.observeConcept now takes a caller-given remaining-budget bound, and HttpDeclarativeObservationSource
  bounds its one outbound HTTP call by the lesser of the capability's own declared timeout and that bound,
  for task/observation-endings-and-collection-budget/observation-port-budget-clamp.
task: sha256:74802b2dfe0637e8e6fb182ea9bfe59e4138ea2e911b947371abfcca4e4e8f81
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/observation-endings-and-collection-budget-observation-port-budget-clamp-build-2
files:
- path: src/investigation/observation-source.port.ts
  effect: declares the new ObserveConceptOptions type (concept, subject, requester, and an optional remainingBudgetMs
    in milliseconds) and widens IObservationSource.observeConcept to take it as its one parameter, bundled
    into one object rather than a fourth positional argument, per this project's own MNT-01 (a function
    takes at most three positional parameters; beyond that, pass an object), tool-enforced by eslint max-params.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: observeConcept now takes ObserveConceptOptions; a new module-level effectiveTimeoutMsFor(capability,
    remainingBudgetMs) answers Math.min(capability.timeout, remainingBudgetMs) where a bound was given
    and capability.timeout alone otherwise, and that value bounds the one outbound HTTP call, so a client-side
    abort fires at the smaller of the two.
- path: src/investigation/fake-observation-source.adapter.ts
  effect: FakeObservationSource.observeConcept now takes ObserveConceptOptions, destructuring concept
    and subject; requester and remainingBudgetMs are accepted as the port now requires but stay unused
    by this fixture-driven fake, the same posture it already held for requester.
- path: src/investigation/evidence-collection-stage.ts
  effect: its one call to observationSource.observeConcept is updated to the { concept, subject, requester
    } options-object shape the widened port now requires; its own already-computed effectiveBoundMs is
    not yet threaded into the new remainingBudgetMs field — that propagation is task/observation-endings-and-collection-budget/collection-stage-propagates-remaining-budget's
    own objective.
- path: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  effect: RecordingObservationSource.observeConcept, a hand-written IObservationSource test double, now
    destructures { concept, subject, requester } from one ObserveConceptOptions parameter instead of three
    positional ones — a mechanical signature update to restore compilation against the widened port interface;
    no assertion, fixture value or test behavior changed.
- path: src/__tests__/unit/fixtures/case-fixture-observations.spec.ts
  effect: its one direct observeConcept call site now passes { concept, subject, requester } instead of
    three positional arguments — the same mechanical update, no behavior changed.
- path: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  effect: ScriptedObservationSource.observeConcept and RecordingObservationSource.observeConcept, both
    hand-written IObservationSource test doubles, now destructure their needed fields from one ObserveConceptOptions
    parameter — the same mechanical update, no assertion or scripted value changed.
- path: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  effect: every one of its pre-existing adapter.observeConcept(...) positional call sites converted to
    the object-argument form — the same mechanical update, no assertion changed.
- path: src/__tests__/unit/investigation/observation-source.port.spec.ts
  effect: every one of its pre-existing source.observeConcept(...) positional call sites converted to
    the object-argument form — the same mechanical update, no assertion changed.
criteria:
- criterion: Given a remaining-budget bound smaller than the capability's own declared timeout, the HTTP
    call the adapter issues is bounded by the remaining-budget value, not the capability's own timeout.
  met: true
  how: effectiveTimeoutMsFor returns Math.min(capability.timeout, remainingBudgetMs); when remainingBudgetMs
    is the smaller of the two, that is the value observeConcept passes to issueRequest, which passes it
    as timeoutMs to issueConnectorHttpCall — the same setTimeout(() => controller.abort(), timeoutMs)
    that already aborts the fetch once its bound elapses, now firing at the caller's given bound rather
    than at the capability's own longer declared timeout.
- criterion: Given a remaining-budget bound at or above the capability's own declared timeout, the HTTP
    call remains bounded by the capability's own timeout.
  met: true
  how: Math.min(capability.timeout, remainingBudgetMs) answers capability.timeout whenever remainingBudgetMs
    is equal to or greater than it, so the applied timeoutMs is unchanged from the capability's own declared
    value; the same holds, unmodified, when a caller gives no bound at all — effectiveTimeoutMsFor answers
    capability.timeout directly.
nodes:
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  encoded_at:
  - src/investigation/observation-source.port.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: This task implements only the rule's second clause — a capability's own declared timeout never
    governs a call past whatever of the collection stage's own budget the caller's given remaining time
    still allows — encoded as ObserveConceptOptions.remainingBudgetMs reaching the adapter and effectiveTimeoutMsFor
    clamping capability.timeout by it. The rule's first clause, the collection stage's own seven-second
    nominal budget itself, is computed and propagated by task/observation-endings-and-collection-budget/collection-stage-propagates-remaining-budget,
    this task's own REMAINDER.
- node: contracts/integration/concept-observation
  encoded_at:
  - src/investigation/observation-source.port.ts
  how: This published operation's own call surface is exactly IObservationSource.observeConcept; this
    task widens the fields ObserveConceptOptions carries so a caller may hand it a remaining-budget bound,
    while the operation still answers read-only, for one subject, within the capability's timeout — now
    read as whichever of the capability's own timeout or the given bound is smaller.
- node: contracts/investigation/observation-source
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: The collection stage's own consumption of observe-concept — one call per concept, in parallel,
    within the requester's own scope — is unchanged in substance; only its call-site syntax was updated
    to the widened port's ObserveConceptOptions shape so it keeps compiling. It does not yet pass its
    own effectiveBoundMs as remainingBudgetMs, left to the sibling task.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  how: 'The scenario''s own observable outcome already holds today through evidence-collection-stage.ts''s
    pre-existing race, unchanged by this task. This task supplies the underlying mechanism the scenario''s
    full realization still needs: once a caller hands the adapter a remaining-budget bound, the adapter''s
    own outbound HTTP call is itself clamped to it. This task''s own criteria demonstrate that clamp by
    invoking the port directly with an explicit bound; wiring the stage''s own seven-second-derived bound
    into that call is the sibling task''s own objective.'
inferences:
- inferred: ObserveConceptOptions.remainingBudgetMs is optional, and an implementer falls back to the
    capability's own declared timeout alone when it is absent, rather than every caller being required
    to supply one.
  from: the task's own rationale, which splits this port change from the collection stage's own propagation
    of its computed remaining time, and the Notes' REMAINDER paragraph naming the sibling task as the
    one that computes and threads the actual bound through; making the field required would have forced
    this delivery to also carry out that sibling task's own propagation.
- inferred: observe-concept's four call-time facts are bundled into one ObserveConceptOptions object rather
    than added as a fourth positional parameter.
  from: the project's own standard MNT-01 (a function takes at most three positional parameters; beyond
    that, pass an object), tool-enforced by eslint max-params set to 3 — observeConcept already used its
    full budget of three, and this codebase's own established convention for exactly this situation (HttpDeclarativeObservationSourceOptions,
    IssueConnectorHttpCallOptions, CollectEvidenceOptions) is the same single-options-object shape.
- inferred: every existing test double implementing IObservationSource, and every existing direct call
    site of observeConcept, needed a mechanical signature/call-shape update to keep compiling against
    the widened interface, and that update is this delivery's own to make rather than left for the proof
    pass.
  from: the first build attempt (run/observation-endings-and-collection-budget-observation-port-budget-clamp-build)
    failed typecheck across five test files for exactly this reason; the fix touches only call shapes
    and method signatures, never an assertion, a fixture value or a test's behavior, so it stays a build-compilation
    concern rather than the proof this task's test-author still owes.
preserved:
- ObserveConceptOptions.concept, .subject and .requester carry the same types and the same meaning observeConcept's
  three positional parameters carried before this task.
- evidence-collection-stage.ts's own COLLECTION_STAGE_BUDGET_MS, effectiveBoundMsFor and raceObservation
  are unchanged — the stage's own race against its own seven-second ceiling still governs when evidence
  is recorded as timed-out, independent of this task's own change.
- FakeObservationSource's fixture-driven behavior and its fixtureKey composition are unchanged.
- HttpDeclarativeObservationSource's four presently-unresolvable-condition unavailable endings (from the
  sibling task observation-port-unavailable-endings) are still answered, with no HTTP call issued, before
  timeoutMs is ever computed.
- 'The adapter''s own behavior when a caller gives no remaining-budget bound is unchanged from before
  this task: it bounds its call by the capability''s own declared timeout alone.'
- Every existing assertion, expected value, fixture and scripted response across the nine test-double
  and call-site files touched for compilation stays exactly as it was; only method signatures and call-argument
  shapes changed.
deferred:
- what: observation-source.port.ts's own pre-existing ObservationOutcome JSDoc (added by the sibling task
    observation-port-unavailable-endings) cites rules/integration/an-http-connector-configuration-declares-its-call,
    whose spelled-out identifier contains the literal substring "http-connector" — the same substring
    domain-depends-on-no-infrastructure.spec.ts's ninth test scans every domain module for outside the
    one legitimate HTTP adapter.
  why: this sits in a paragraph unrelated to the remaining-budget change and predates this task; fixing
    it would reach past this task's own objective. Every new citation this task added instead names rules/investigation/collection-has-its-own-budget-within-the-total
    or the scenario node, neither of which carries that substring.
- what: evidence-collection-stage.ts does not pass its own already-computed effectiveBoundMs into observeConcept's
    new remainingBudgetMs field.
  why: task/observation-endings-and-collection-budget/collection-stage-propagates-remaining-budget's own
    objective, explicitly named by this task's own Notes as the REMAINDER outside this task's reach.
---

## What it is

The observation port accepts an optional remaining-budget bound, and the production HTTP adapter never lets a capability's own declared timeout govern its call past that bound.

## Notes

The first build attempt failed typecheck in five pre-existing test/fixture files implementing or calling the widened port interface with its old three-positional-argument shape (run/observation-endings-and-collection-budget-observation-port-budget-clamp-build). Fixed mechanically in a second pass — signatures and call shapes only, no assertion or fixture value changed — and the build passed on run/observation-endings-and-collection-budget-observation-port-budget-clamp-build-2.
