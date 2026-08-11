---
title: Proof that judgeHypotheses threads one unchanged CaseContext through every evaluate() call
summary: Extends judgment-stage.spec.ts's existing ScriptedHypothesisEvaluator to record the caseContext
  each evaluate() call received, and adds two tests proving the pinned case's own title/when_to_use reach
  both a hypothesis's first call and its retry unchanged, and reach every hypothesis judged in one call
  identically.
implementation: sha256:e5f7d718ee364fc08207234af1f9e0c9ed0bc60eb2422ee6b51a419dad630265
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-adapter-widen-evaluator-port-with-case-context-suite
tests:
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: passes the pinned case's own title and when_to_use, unchanged, to both the first evaluate() call
    and the retry it forces
  proves: judgment-stage.ts's first evaluate() call and its retry both pass the same case's title and
    when_to_use the judgeHypotheses() call itself was given, unchanged.
  fails_when: judgeHypotheses stops passing a caseContext to either the first or the retried evaluate()
    call, passes a different value on the retry than on the first call, passes a value that does not match
    theCase.title/theCase.when_to_use, or leaks any field beyond title/whenToUse
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: passes the same pinned case's own title and when_to_use, grouped as CaseContext, to every hypothesis
    judged in one judgeHypotheses() call — never a different context per hypothesis
  proves: judgment-stage.ts's first evaluate() call and its retry both pass the same case's title and
    when_to_use the judgeHypotheses() call itself was given, unchanged — extended to two hypotheses judged
    concurrently in the same call
  fails_when: two hypotheses judged in the same judgeHypotheses() call receive different caseContext values,
    or either receives a value not matching theCase.title/theCase.when_to_use
not_applicable:
- edge_case: an absent or empty title/when_to_use reaching evaluate()
  why: Case's own required string fields already guarantee non-empty values before judgeHypotheses() ever
    runs; this task adds no new validation of either field
- edge_case: a boundary at either end of a numeric range
  why: this task introduces no numeric range — CaseContext carries two plain strings, copied through unchanged
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion or bound node claims uniqueness over CaseContext or its fields
- edge_case: an operation attempted against state that forbids it
  why: CaseContext is inert, read-only data with no state machine of its own
- edge_case: a dependency that fails, times out or answers slowly
  why: this task adds no new dependency and changes no failure/timeout path — evaluate()'s deadline-exceeded
    and judgment-failure paths are pre-existing behavior already exercised by judgment-stage.spec.ts's
    own deadline and retry tests
untested:
- IHypothesisEvaluator.evaluate()'s declared three-parameter signature (criterion, evidence, caseContext)
  — criterion 1 — is a compile-time fact enforced by the project's strict typecheck (STK-01/TYP-01/TYP-03),
  exercised at runtime by hypothesis-evaluator.port.spec.ts's 8 pre-existing evaluate() calls and this
  proof's two new tests, all calling through the same 3-parameter signature; nothing independently re-demonstrates
  the bare fact of the third parameter's existence beyond that usage.
- the inference that title/when_to_use are grouped into one CaseContext object rather than two positional
  strings is a signature-shape decision the type system enforces at compile time (MNT-01); no runtime
  assertion distinguishes this choice from the alternative once the declared type fixes the call shape
  everywhere.
- the inference that FakeHypothesisEvaluator's unused third parameter is named _caseContext is a naming
  convention decided by the lint tool's argsIgnorePattern, not by a reading, so no behavioral test asserts
  the name.
---

## What it is

Two tests over an extended scripted evaluator prove the pinned case's title/when_to_use reach every evaluate() call unchanged, across a retry and across sibling hypotheses.

## Notes

None.
