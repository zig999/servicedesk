---
title: Wire the production diagnose runner from the real Anthropic adapters — proof
summary: Two spec files prove createProductionDiagnoseRunner's own composition — pass-through wiring,
  the absolute deadline it stamps, requester passthrough, no caching across calls, and that it reaches
  the real, Anthropic-backed adapters rather than a swappable fake.
implementation: sha256:caaaf57c5fe936e8cf8b4413ef5fb2b118de7a1a5ba7b6ac9acea37e8038a5b7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/diagnose-composition-root-wire-diagnose-runner-suite
tests:
- file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  name: passes the caller-given observation source, pool size, data directories and default consolidation
    register through to the wired dependencies, unchanged
  proves: One factory function assembles createDiagnoseRunner's own DiagnoseDependencies with the real
    Anthropic-backed judgment and consolidation adapters always wired, and the caller's own observation
    source, pool size, data directories and default consolidation register passed through unchanged.
  fails_when: any of those six fields reaches the wired createDiagnoseRunner call as something other than
    the exact value the caller gave
- file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  name: always wires a real AnthropicHypothesisEvaluator and AnthropicAssessmentConsolidator, never a
    caller-substituted implementation
  proves: the real Anthropic-backed judgment and consolidation adapters always wired
  fails_when: the object passed as evaluator or consolidator is not an instance of the real adapter classes
- file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  name: computes the deadline as its own start instant plus the specification-declared twenty-second budget,
    and propagates that exact pair to the wired runner
  proves: The factory computes the request's absolute deadline as its own start instant plus the specification's
    declared total budget, and propagates that same (now, deadline) pair to the wired runner.
  fails_when: the now the runner receives is outside the real-time window the call spans, or the deadline
    is not exactly now + 20000
- file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  name: stamps a fresh (now, deadline) pair on a second call, never the first call's own pair
  proves: the deadline pair is recomputed per call rather than captured once and reused
  fails_when: the second call's now/deadline equals the first call's own pair
- file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  name: constructs the Anthropic client once when the runner is created, never again on either of two
    later calls
  proves: the two Anthropic adapters are constructed once, never reconstructed on each call
  fails_when: a call to the returned runner constructs a new Anthropic client instead of reusing the one
    built at creation time
- file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  name: constructs both Anthropic-backed adapters with the credential resolved from the environment alone
  proves: neither adapter exposes an apiKey parameter of its own; both fall back to the environment default
  fails_when: the Anthropic constructor is called with an apiKey other than exactly process.env.ANTHROPIC_API_KEY
- file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  name: imports nothing from diagnose.ts, idempotency-key.ts, idempotency-lease-store.ts, idempotency-resolution.ts,
    diagnosis-run-registry.ts or diagnose-entry-point.factory.ts
  proves: it imports nothing from the six withdrawn dedup files
  fails_when: production-diagnose.factory.ts's own source text names any of those six modules as an import
    specifier
- file: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  name: imports no database client or driver
  proves: the factory module imports no database client or driver
  fails_when: production-diagnose.factory.ts's own source text imports a common database driver package
- file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  name: writes two independent investigation records for two calls sharing the same case, subject, narrative
    and requester
  proves: Two calls given the same case, subject, narrative and requester each run the whole pipeline
    again and are each written as their own investigation; neither call returns, reuses or joins the other's
    result.
  fails_when: the second call's own investigation id is never written to the real file-backed store
- file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  name: collects evidence again for the second of two calls with identical inputs, rather than reusing
    the first call's own result
  proves: the no-caching criterion, from the collection side
  fails_when: the observation source is invoked fewer than twice after two calls with identical inputs
- file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  name: passes the given requester straight through to the observation source, substituting none of its
    own
  proves: The factory passes the caller-given requester straight through to the wired observation source
    on every call it makes, substituting none of its own.
  fails_when: the observation source receives a requester other than exactly the one given to the call
- file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  name: reaches the mocked Anthropic client when a call runs, confirming the real adapters are wired rather
    than a swappable fake
  proves: the pipeline genuinely reaches the Anthropic-backed adapters' own provider call during a real
    run
  fails_when: running a call through the produced runner never invokes the mocked messages.create
- file: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  name: sends the caller-configured evaluator and consolidator models to the provider, never a value fixed
    in source
  proves: model configuration is surfaced as the factory's own caller-supplied parameters rather than
    a value fixed in source
  fails_when: the provider request never carries the caller's own evaluatorModel or consolidatorModel
    string
not_applicable:
- edge_case: absent or empty caller input (empty subjectAttributes, empty narrative, etc.)
  why: this factory performs no validation of its own — every such refusal already belongs to buildSubject/buildInvestigation/runDiagnosis,
    already proven by their own existing specs
- edge_case: two concurrent runs racing for the same investigation id
  why: already proven by run-diagnosis.spec.ts's own concurrent-run refusal test; this factory adds no
    dedup or locking of its own
- edge_case: a slow or failing Anthropic provider call
  why: already proven at the adapter level and at the pipeline level; this factory only constructs and
    wires the adapter
- edge_case: a boundary at either end of a stated range
  why: this task states no numeric range beyond the single fixed twenty-second budget, already exercised
    directly
untested:
- the transitive claim that everything this factory wires imports no database client or driver, beyond
  this file's own direct imports — the wired stores are file-backed by construction of already-delivered,
  unmodified modules, but no test here re-scans their own import lists
- whether a caller-given evaluatorMaxTokens is forwarded to the evaluator's own request — only the model
  was asserted at the provider boundary
---

## What it is

Unit tests over the factory's own wiring logic, plus an integration test running the pipeline against a mocked Anthropic client, prove pass-through, the deadline, requester propagation, and no caching across calls.

## Notes

None.
