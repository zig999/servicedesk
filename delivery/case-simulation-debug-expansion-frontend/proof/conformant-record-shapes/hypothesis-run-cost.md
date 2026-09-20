---
target: frontend
title: SimulateHypothesisResult carries the narrowed run's own cost -- proof
summary: Tests demonstrate the cost and durations shapes SimulateHypothesisResult now declares, prove
  the unaltered pass-through of a response's cost through useSimulateHypothesis's onSimulate, prove the
  shared cockpit fixture returns a cost, and repair the one pre-existing totality assertion this task's
  required field legitimately falsifies.
implementation: sha256:fb46404c1e9e940884f57cbb517abf91b420cf97bddba9ece119cf7bcba7f8ec
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/conformant-record-shapes-hypothesis-run-cost-suite-2
tests:
- file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
  name: SimulateHypothesisResult's cost is required and admits exactly SimulateCost's three members (criterion
    1; demonstrates domain/investigation/cost) > requires calls, input_tokens and output_tokens on cost,
    admits no other member, and the shared fixture's own cost carries exactly those three
  proves: criterion 1 (cost is a required field on SimulateHypothesisResult carrying calls, input_tokens
    and output_tokens)
  fails_when: cost becomes optional or is removed from SimulateHypothesisResult, any of calls/input_tokens/output_tokens
    becomes optional or is removed, an extra member becomes accepted without a compile error, or the shared
    hypothesisCost() fixture stops returning exactly those three keys at runtime
  demonstrates: domain/investigation/cost
- file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
  name: SimulateHypothesisResult declares durations beside cost, with writing absent rather than present
    as a figure (criteria 3 and 4; demonstrates domain/investigation/durations) > requires collection,
    judgment and total on durations, admits writing only optionally, admits no other member, and the shared
    fixture's own durations carries no writing key by default
  proves: criterion 3 (durations is declared beside cost on SimulateHypothesisResult) and criterion 4
    (durations' writing is typed as conditionally absent rather than as a figure)
  fails_when: durations or cost is removed from SimulateHypothesisResult, any of collection/judgment/total
    becomes optional or is removed, writing becomes required, an extra member becomes accepted without
    a compile error, or the shared hypothesisDurations() fixture starts returning a writing key by default
  demonstrates: domain/investigation/durations
- file: src/hooks/use-simulate-hypothesis-run-cost.spec.ts
  name: useSimulateHypothesis -- onSimulate's result carries the response's cost unaltered, including
    a cost totalling exactly one judgment call and no consolidation call (criteria 5 and 6) > returns
    exactly the cost the response sent, unmodified, for a cost whose calls total the one judgment call
    a hypothesis run makes
  proves: criterion 5 (onSimulate's result carries the cost the response returned, unaltered) and criterion
    6 (a response whose cost totals one judgment call and no consolidation call reaches the caller with
    those totals intact)
  fails_when: the cost value onSimulate's result exposes stops deep-equaling the exact cost object the
    mocked response returned
- file: src/hooks/use-case-simulation-cockpit-hypothesis-run-cost.spec.ts
  name: simulateHypothesisResult (use-case-simulation-cockpit.test-support.ts) returns a SimulateHypothesisResult
    carrying a cost (criterion 7) > returns a cost carrying exactly calls, input_tokens and output_tokens,
    alongside evidence, evaluation and durations
  proves: criterion 7 (simulateHypothesisResult in use-case-simulation-cockpit.test-support.ts returns
    a SimulateHypothesisResult carrying a cost)
  fails_when: the fixture stops returning a cost field, the cost it returns carries a key other than or
    fewer than calls/input_tokens/output_tokens, or the built result stops carrying cost alongside evidence,
    evaluation and durations
- file: src/hooks/use-simulate-hypothesis-request.spec.ts
  name: carries exactly evidence, evaluation and durations at runtime, never an outcome or an assessment
    key
  proves: 'criterion 1 and criterion 3, restated as a totality claim over the whole result envelope: SimulateHypothesisResult''s
    runtime result carries exactly evidence, evaluation, durations and (after this task) cost, and nothing
    else'
  fails_when: the result carries any key other than evidence, evaluation, durations and cost, or is missing
    any of those four
not_applicable:
- edge_case: A failed simulate-hypothesis dispatch (network or API error)
  why: cost is a member of the successful result only; onSimulate's error path is untouched by this task
    and already proven by use-simulate-hypothesis-dispatch-safety.spec.ts
- edge_case: Two concurrent onSimulate dispatches
  why: the dispatch-gating behavior is untouched by this task and already proven by use-simulate-hypothesis-dispatch-safety.spec.ts
- edge_case: A cost or durations value at a numeric boundary (zero calls, zero tokens, zero elapsed milliseconds)
  why: no criterion or node states a boundary behavior for these integers -- onSimulate passes whatever
    value the response sent through unaltered regardless of magnitude
untested:
- 'Criterion 2 (that field reuses the SimulateCost already declared rather than a second declaration):
  TypeScript''s structural typing makes a duplicate three-member declaration indistinguishable from the
  reused import at compile time and runtime -- decided by reading the import statement, which the implementation
  record''s own ''how'' field already states.'
- 'Criterion 8 (no call site declares a hypothesis-result literal of its own): deciding this requires
  a whole-repository search, which the implementation record''s own ''how'' field already performed and
  disclosed; a finite test cannot re-implement that same full-tree scan as observable runtime behavior.'
- 'Criterion 9 (the frontend type-checks with no error arising from SimulateHypothesisResult in any file):
  decided in full by the project''s own typecheck step (TYP-01), not by a finite test that could enumerate
  every file in the tree.'
- 'rules/investigation/a-simulated-hypothesis-returns-the-runs-cost-and-durations: this rule''s fact spans
  the backend response that must actually carry the cost and this frontend''s typing/threading of it;
  the task''s own REMAINDER note records that no criterion here makes the response emit a cost at all,
  so no test of this frontend-only delivery can decide the rule''s fact whole.'
divergences:
- from: this initiative's established precedent for a sibling task's legitimate delivery falsifying a
    prior test's totality assertion over a shared record type
  departure: extended the pre-existing totality assertion expect(Object.keys(returned).sort()).toEqual(...)
    in src/hooks/use-simulate-hypothesis-request.spec.ts's "SimulateHypothesisResult carries exactly evidence,
    evaluation and durations" describe block to read ["cost", "durations", "evaluation", "evidence"],
    rather than leaving it failing, deleting it, or narrowing what it checks
  why: SimulateHypothesisResult's required cost field means every fixture the pre-existing test consumes
    now legitimately returns a fourth key; the implementation record's own Notes flag this exact assertion
    and defer its correction to the proof step, following the precedent already established for this pattern
---

## What it is
Three new tests across two files pin the cost/durations shapes and the unaltered pass-through through useSimulateHypothesis and the shared cockpit fixture; one pre-existing totality assertion was extended in place.

## Notes
One suite attempt preceded this one (run/conformant-record-shapes-hypothesis-run-cost-suite) and failed at typecheck: a new @ts-expect-error directive preceded a multi-line object literal, so TypeScript's excess-property error landed on the property line rather than the very next line (cause: test, on a test this delivery's own proof wrote -- fixed by collapsing the literal to one line).
