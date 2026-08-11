---
title: Wire the production diagnose runner from the real Anthropic adapters
summary: One new factory always wires AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator
  behind createDiagnoseRunner, stamps the twenty-second absolute deadline once per call, and calls the
  existing pipeline directly with no caching layer of its own.
task: sha256:c618ea9a1a88d9218b67b6a3c15ca4706df123a6b95744e8ef3762c2a73f74cb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/diagnose-composition-root-wire-diagnose-runner-build
files:
- path: src/factories/production-diagnose.factory.ts
  effect: exports createProductionDiagnoseRunner, which constructs one AnthropicHypothesisEvaluator and
    one AnthropicAssessmentConsolidator, wires them into createDiagnoseRunner alongside the caller-given
    observation source, pool size, data directories and default consolidation register, and returns a
    callable that stamps now/now+20_000ms fresh on every invocation and calls the wired runner directly
criteria:
- criterion: One factory function assembles createDiagnoseRunner's own DiagnoseDependencies with the real
    Anthropic-backed judgment and consolidation adapters always wired, and the caller's own observation
    source, pool size, data directories and default consolidation register passed through unchanged.
  met: true
  how: createProductionDiagnoseRunner builds DiagnoseDependencies with evaluator/consolidator always set
    to new adapter instances — no branch lets a caller substitute either — while the other fields are
    copied straight through unchanged
- criterion: Calling the assembled runner runs collection, judgment, consolidation and writing directly
    through createDiagnoseRunner/runDiagnosis; it imports nothing from diagnose.ts, idempotency-key.ts,
    idempotency-lease-store.ts, idempotency-resolution.ts, diagnosis-run-registry.ts or diagnose-entry-point.factory.ts.
  met: true
  how: the returned callable's whole body is `return runner({ ...call, now, deadline })`; the file's only
    imports are the two adapters, three investigation types and diagnose.factory.js — a directory listing
    confirms the six named files are absent from the tree
- criterion: Two calls given the same case, subject, narrative and requester each run the whole pipeline
    again and are each written as their own investigation; neither call returns, reuses or joins the other's
    result.
  met: true
  how: the returned closure holds no map, cache or memo of any prior call — every invocation calls runner(...)
    fresh
- criterion: The factory computes the request's absolute deadline as its own start instant plus the specification's
    declared total budget, and propagates that same (now, deadline) pair to the wired runner, never leaving
    a stage to read the system clock itself.
  met: true
  how: 'the returned callable computes now = Date.now() once per call and passes deadline: now + TOTAL_DEADLINE_BUDGET_MS
    (20_000) alongside that same now into runner(...)'
- criterion: The factory passes the caller-given requester straight through to the wired observation source
    on every call it makes, substituting none of its own.
  met: true
  how: requester is carried unchanged by the ...call spread into runner(...); nothing in this file reads,
    writes or defaults a requester of its own
- criterion: The factory module, and everything it wires, imports no database client or driver — every
    store behind it is the existing file-backed one.
  met: true
  how: this file imports only the two Anthropic adapters, three investigation types and createDiagnoseRunner;
    createDiagnoseRunner itself wires only the file-backed stores
nodes:
- node: contracts/investigation/diagnosis
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  how: the returned callable is this contract's synchronous entry made concrete for production, with no
    caching layer added so every call reruns the whole pipeline fresh
- node: constraints/diagnosis-answers-synchronously
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  how: the returned function is (call) => Promise<Assessment>, awaited and answered directly, introducing
    no job, queue or polling
- node: constraints/the-domain-depends-on-no-infrastructure
  how: 'honored: this factory sits under src/factories/, the composition root, and is exactly the boundary
    this constraint expects to hold the infrastructure import; no domain module is touched by this task'
- node: constraints/the-mvp-persists-to-no-database
  how: 'honored: everything this file wires resolves to file-backed stores only; no database driver is
    imported and no dependency added'
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  how: one absolute deadline is recorded per request, at entry, as now + TOTAL_DEADLINE_BUDGET_MS, propagated
    as the (now, deadline) pair; the per-stage intersection already lives, unmodified, in run-diagnosis.ts
    and evidence-collection-stage.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  how: 'honored: the caller-given requester is carried unchanged through to observeConcept, never substituted'
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  how: TOTAL_DEADLINE_BUDGET_MS = 20_000 is this rule's own declared total, instantiated as a concrete
    deadline computation once per call
inferences:
- inferred: the two Anthropic adapters' own construction-time model configuration are surfaced as this
    factory's own caller-supplied parameters rather than a value fixed in this file's source
  from: both adapters' own module comments state the model is the caller's own choice, never a value fixed
    in source, since no specification node names a version
- inferred: neither adapter's apiKey is exposed as a parameter of this factory at all; both are constructed
    with no apiKey field, letting each fall back to its own already-implemented environment default
  from: STK-11's own credential-from-environment requirement, already implemented in both adapters' own
    constructors
- inferred: both Anthropic adapters are constructed once, inside createProductionDiagnoseRunner, before
    the returned per-call closure — never reconstructed on each call
  from: diagnose.factory.ts's own convention of building its per-deployment dependencies once and reusing
    them across every call
deferred:
- what: contracts/investigation/diagnosis's own optional ticket_ref and where an absent one is resolved
    from a raw HTTP payload
  why: belongs to task/http-surface/diagnose-http-endpoint, per this task's own Notes
- what: constraints/the-deadline-is-an-absolute-propagated-instant's own per-stage minimum-of-nominal-budget-and-remaining-time
    intersection
  why: already performed, unmodified, inside run-diagnosis.ts and evidence-collection-stage.ts from a
    prior initiative
- what: relating the twenty-second deadline to an HTTP caller's own timeout
  why: no HTTP timeout exists yet; belongs to task/http-surface/diagnose-http-endpoint, per this task's
    own Notes
---

## What it is

One factory decides which two concrete adapters answer judgment and consolidation for a real run.
It stamps the deadline once, at the start, and hands the rest to the pipeline that already exists.

## Notes

ticket_ref resolution and relating the deadline to an HTTP caller's own timeout are both deferred to task/http-surface/diagnose-http-endpoint.
