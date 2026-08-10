---
title: Judgment stage proof — one evaluation per required hypothesis under a pooled, deadline-bounded retry policy
summary: Tests judgeHypotheses against all six task criteria and the requested concurrency/retry/keying/throw edge cases.
implementation: sha256:0706efa6259389348fafd5327bafa016585cecd0d5fcbdd0591b91abafbabdcd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-judgment-stage-suite
tests:
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: answers exactly one evaluation per required hypothesis, in the case's declared order, none omitted or duplicated
  proves: Every hypothesis the pinned case requires receives exactly one evaluation, and no hypothesis is silently omitted.
  fails_when: any required hypothesis is left out of the result, appears more than once, or the result's order does not match the case's own declared hypothesis order.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: calls evaluate() with only the judged hypothesis's own criterion and its own matched evidence, never another hypothesis's
  proves: Each hypothesis is judged in its own call, isolated from every other hypothesis's prompt, under a configured pool bound.
  fails_when: evaluate() is called with a criterion or evidence belonging to a different hypothesis than the one it was invoked for, or two hypotheses are merged into one call.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: never starts more evaluate() calls at once than the configured pool size, granting a queued hypothesis its call only once an earlier one frees a slot
  proves: Each hypothesis is judged in its own call... under a configured pool bound — plus the pool bound actually limits concurrency.
  fails_when: a third hypothesis's evaluate() is called before either of the two already in flight has resolved and freed a pool slot.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: retries once on a decided answer whose citations fail structural validation, and returns the retry's valid decided answer
  proves: A response whose citations fail structural validation triggers one retry when the remaining deadline admits it... (retry-succeeds branch)
  fails_when: no second evaluate() call is made after a structurally invalid citation set, or the retry's own valid answer is not what the stage finally returns.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: falls back to inconclusive judgment-failure when the retry's citations are also structurally invalid
  proves: '...otherwise the evaluation falls back to inconclusive with reason judgment-failure (retry-fails branch)'
  fails_when: the stage accepts the retry's own structurally invalid citations as-is, or answers a reason other than judgment-failure.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: records deadline-exceeded, never judgment-failure, for a call that has not returned by the stage's deadline
  proves: A hypothesis... whose call has not returned by then, is recorded inconclusive with reason deadline-exceeded, never no-data or judgment-failure (unsettled-call clause)
  fails_when: a call that never returns is recorded with a reason other than deadline-exceeded, or the stage never settles at all.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: records deadline-exceeded for a hypothesis denied a pool slot before the deadline, and never calls evaluate() for it at all
  proves: A hypothesis that never receives a call slot before the stage's deadline... is recorded inconclusive with reason deadline-exceeded, never no-data or judgment-failure — plus the denied-slot edge case.
  fails_when: the denied hypothesis's evaluation carries any reason other than deadline-exceeded, or evaluate() is ever invoked for it.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: records inconclusive no-data citing every non-ok evidence item, and never enters the pool for that hypothesis
  proves: A hypothesis whose evidence result is not ok is recorded inconclusive with reason no-data, citing that evidence.
  fails_when: the evaluation for a hypothesis with any non-ok evidence item is not inconclusive/no-data, its citations omit a non-ok item or include the ok one, or evaluate() is called for it.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: passes through a confirmed answer with at least one citation unchanged
  proves: A confirmed or refuted evaluation carries at least one citation... (positive direction)
  fails_when: a confirmed answer with a valid, non-empty citation set is altered, rejected, or retried instead of being returned as-is.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: never returns confirmed or refuted for a decided answer carrying zero citations, even across a retry that also carries none
  proves: '...an evaluation with none is never confirmed or refuted (negative direction, exercised by forcing a non-conforming outcome past the type)'
  fails_when: a decided answer whose citations array is empty is returned as confirmed or refuted instead of being retried and then degraded to judgment-failure.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: keeps a hypothesis's retry under the same pool slot it already holds, never granting a queued sibling a slot while the retry is in flight
  proves: the implementation's own inference that a retry runs under the same pool slot the first call already held, rather than releasing it and re-competing for a fresh acquisition.
  fails_when: a queued sibling hypothesis is granted a pool slot (and calls evaluate()) before the retry it was queued behind has itself resolved.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: passes an inconclusive first answer through unchanged, with no retry attempted
  proves: the implementation's own convention that an already-inconclusive answer is passed through unchanged, never retried or re-validated.
  fails_when: an inconclusive first answer is altered before being returned, or triggers a second evaluate() call.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: passes an inconclusive retry answer through unchanged
  proves: the implementation's own inference that an inconclusive retry answer is passed through unchanged, exactly like the first call's own inconclusive answer.
  fails_when: an inconclusive retry answer is altered, re-validated, or retried again instead of being returned as-is.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: refuses a citation whose field is declared only under a capability output-schema key that does not match the cited evidence's own capability_name/capability_version
  proves: outputSchemasFor's own keying, by the capability's own current name and version, never by concept alone, so a citation is checked against the schema of the capability that actually produced the evidence.
  fails_when: outputSchemasFor keys its map by concept alone (or otherwise lets the registry's current capability stand in for the evidence's own producing capability), causing the mismatched citation to be wrongly accepted.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: throws naming the missing hypothesis when evidenceByHypothesis carries no entry for a required hypothesis
  proves: the implementation's own inference that a required hypothesis missing from evidenceByHypothesis is a thrown caller-contract fault, never a manufactured domain outcome or a silently substituted empty array.
  fails_when: judgeHypotheses resolves instead of rejecting for a case whose evidenceByHypothesis omits a required hypothesis, or rejects with an error that does not name the missing hypothesis.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: throws naming the hypothesis when a required name is not found among the case's own hypotheses
  proves: the implementation's own inference that a hypothesis name requiresEvaluationOf answers but theCase.hypotheses does not actually contain is a thrown caller-contract fault.
  fails_when: judgeHypotheses resolves instead of rejecting, or rejects with an error that does not name the missing hypothesis.
not_applicable:
- edge_case: two concurrent invocations of judgeHypotheses over the same case
  why: each call constructs its own CallPool and deadlineGuard from its own options; no state is shared across calls, and no bound node states anything about concurrent stage invocations.
- edge_case: a Case with zero hypotheses, or two hypotheses sharing one name
  why: rules/knowledge/a-case-has-at-least-one-hypothesis and the case's own name-uniqueness already exclude these upstream, at case-coherence-validation; judgeHypotheses is never reachable with either, so a test constructing one would assert behavior over a state the base already forbids before this stage runs.
- edge_case: poolSize of zero or a negative number
  why: no bound node states what a non-positive pool bound means, and the criteria describe a configured pool bound as a fact the caller supplies; a test here would assert a guessed guarantee rather than one any node states.
untested:
- a confirmed or refuted verdict that carries a structurally valid citation (concept in the hypothesis's own collects, field declared in the citing evidence's own capability output schema) but is not actually grounded in what the evidence observed, this stage cannot exclude it. Distinguishing a genuinely-deduced verdict from an invented one with a merely-valid citation (rules/investigation/judgment-does-not-infer) requires semantic judgment over the observation's content, which no node this task implements grants to this orchestration layer; the task's own criteria 3 and 6 ask only for structural citation validity and at least one citation. That discrimination is left entirely to the evaluator adapter's own closed-prompt discipline (constraints/the-judgment-prompt-is-closed, task/hypothesis-judgment/hypothesis-evaluator-port) or a future human decision extending the specification, exactly what the task's own non-blocking UNDERDETERMINED note anticipates.
- no retry is attempted at all because the deadline had already elapsed by the time citation validation ran (retryOrFail's own deadlineGuard.elapsed() check reading true before the second evaluate() call is even issued), distinct from the retry-attempted-and-failed branch this proof does cover (evaluate() called twice); constructing it deterministically needs an artificial delay inside outputSchemasFor's own capability-registry read to let the deadline elapse between the first call settling and the retry check, which no test here builds.
- a genuine rejection from evaluate() (a thrown fault, not one of the three verdicts) propagating out of judgeHypotheses unmodified, mirroring evidence-collection-stage's own equivalent behavior for observe-concept, nothing in judgment-stage.ts appears to catch such a rejection, but no test here exercises it.
- the inference that toEvidenceItems always types the reshaped item's result as the literal 'ok', a type-level detail with no independently observable runtime behavior beyond what the isolation test already exercises.
- the inference that no separate nominal per-stage judgment budget is layered on top of the propagated remaining time (unlike collection's own seven-second budget), implied by every deadline test here using deadline-minus-now directly, but never asserted as its own distinct claim.
divergences:
- cites: TYP-02
  file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  departure: 'the zero-citation-defense test casts a deliberately non-conforming literal ({ verdict: ''confirmed'', citations: [] }) through `as unknown as EvaluationOutcome` with no narrowing guard following the assertion.'
  why: the whole point of that literal is to construct, at runtime, an EvaluationOutcome the type itself forbids at compile time (confirmed/refuted require a non-empty citations tuple), the only way to prove the stage's own runtime defense (isStructurallyValid's citations.length === 0 check) actually fires against a non-conforming adapter, rather than relying solely on the compiler. A guard narrowing the value afterward would contradict the test's own purpose, which is to hand the stage exactly the shape its type says cannot occur.
---

## What it is

Unit tests proving the judgment stage's six criteria across the pool, the deadline race, the retry-on-invalid-citation policy and totality, plus the concurrency, keying and caller-contract edge cases they raise.

## Notes

A test excluding the task's own UNDERDETERMINED implementation (judgment-does-not-infer) was drafted, found to be structurally unwinnable by any legitimate implementation of this task's actual scope (it would require semantic grounding-detection this orchestration has no node granting it), and withdrawn in favor of an honest `untested` disclosure — recorded there rather than left as a permanently red assertion.
