---
title: Proof for the hypothesis-evaluator port and its fake adapter
summary: Drives FakeHypothesisEvaluator, the only concrete IHypothesisEvaluator this task ships, through each of the three verdicts and its one throwing fault, exercises the task's own UNDERDETERMINED no-data/empty-citations fixture, and audits this task's own five modules for import purity and for shipping exactly one adapter.
implementation: sha256:8f1969937716f71e02fdca7a4d78b54e195842437ab909ce57f9655d484aeceb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-hypothesis-evaluator-port-suite
tests:
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers the confirmed verdict with exactly the citations seeded for it
  proves: criterion 3 ("A unit test exercises the fake adapter for each of the three verdicts and asserts the shape of the Evaluation it answers.") for the confirmed verdict, and criterion 1's clause that a decided Evaluation carries citations
  fails_when: 'evaluate() answers anything other than exactly { verdict: ''confirmed'', citations } for the seeded criterion, a different verdict, a missing, extra or reordered citation, or a thrown error'
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers the refuted verdict with exactly the citations seeded for it
  proves: criterion 3 for the refuted verdict, and criterion 1's clause that a decided Evaluation carries citations
  fails_when: 'evaluate() answers anything other than exactly { verdict: ''refuted'', citations } for the seeded criterion'
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers the inconclusive verdict with exactly the reason seeded for it, judgment-failure carrying no citations
  proves: criterion 3 for the inconclusive verdict, and criterion 1's clause that an inconclusive Evaluation carries a reason
  fails_when: 'evaluate() answers anything other than exactly { verdict: ''inconclusive'', reason: ''judgment-failure'', citations: [] } for the seeded criterion'
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: accepts a fixture reasoned no-data with an empty citations list, answering only that the verdict is inconclusive and a reason is present
  proves: the task's own UNDERDETERMINED note, that criteria 1 and 3 as written admit a fake-adapter fixture reasoned no-data with zero citations, which rules/investigation/an-inconclusive-evaluation-declares-its-reason's own stricter clause (a no-data reason cites the evidence whose result is not ok) refuses; this test exercises exactly that fixture and, per the note's own instruction, asserts only that the answered verdict is inconclusive and that a reason is present, deliberately asserting nothing about citations
  fails_when: the fake refuses a no-data fixture with an empty citations array (by throwing or otherwise), or the answered outcome's verdict is not inconclusive, or no reason property is present on it
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: throws naming the criterion rather than answering a default for a criterion nothing seeded
  proves: the edge case of asking evaluate() for a criterion nothing seeded, and FakeHypothesisEvaluator's own documented behavior that this is a test-setup fault rather than a fourth verdict
  fails_when: evaluate() resolves to some default outcome instead of rejecting for an unseeded criterion, or rejects with a message that does not name the criterion asked about
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers by criterion alone, ignoring the evidence a call carries, even when the evidence array is empty
  proves: the inference the implementation recorded, that FakeHypothesisEvaluator keys its seeded fixtures by criterion alone, computing nothing from the evidence a call carries; also covers the edge case of an empty evidence array
  fails_when: evaluate() answers differently, throws, or otherwise fails to answer the criterion's seeded fixture when called with an empty evidence array instead of the evidence accompanying the seed
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers the outcome seeded for this criterion, not the one seeded for a different criterion
  proves: the inference that fixtures are keyed by criterion alone, a second criterion, seeded independently, does not affect what the first answers
  fails_when: evaluate() for 'criterion-one' answers the outcome seeded for 'criterion-two', or any outcome other than the one seeded for 'criterion-one'
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: a later seed for the same criterion replaces the earlier one
  proves: FakeHypothesisEvaluator.seed()'s own documented behavior, that reseeding a criterion replaces what it answers, the edge case of a duplicate seed for the same key
  fails_when: evaluate() answers the earlier-seeded outcome (refuted) instead of the later one (confirmed) after the criterion is reseeded
- file: src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
  name: the hypothesis-evaluator modules import no LLM or provider client, and no framework or driver beside them
  proves: criterion 2's "importing no LLM or provider client", and how the implementation record answers constraints/the-domain-depends-on-no-infrastructure for verdict.ts, evaluation-reason.ts, citation.ts, hypothesis-evaluator.port.ts and fake-hypothesis-evaluator.adapter.ts
  fails_when: any of this task's own five files imports one of the listed frameworks, database drivers or provider-client packages
- file: src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
  name: the hypothesis-evaluator modules import nothing from the standard library, so infrastructure cannot be reached from them directly
  proves: the same constraint and criterion, catching a Node builtin rather than only a third-party package
  fails_when: 'any of this task''s own five files imports anything prefixed node: or named among Node''s builtin modules'
- file: src/__tests__/unit/investigation/hypothesis-evaluator-modules.spec.ts
  name: ships exactly one concrete class implementing IHypothesisEvaluator
  proves: constraints/judgment-runs-behind-a-port's own claim that FakeHypothesisEvaluator is the one concrete class this task ships implementing the interface, and criterion 2's reference to "the fake adapter" as singular
  fails_when: a second .ts file directly under src/investigation contains the literal text "implements IHypothesisEvaluator", or fake-hypothesis-evaluator.adapter.ts is renamed or removed without this assertion changing to match
not_applicable:
- edge_case: absent criterion or absent evidence argument
  why: evaluate(criterion, evidence) is a two-parameter TypeScript signature with no optional parameter; an absent argument is a compile error, not a runtime path this proof could exercise
- edge_case: a boundary at each end of a stated numeric or ordered range
  why: neither the port nor the fake declares any numeric or ordered range for criterion, evidence, verdict or reason, each is an opaque string, a discriminated tag, or a plain array with no bound to sit at the edge of
- edge_case: exercising evaluation-reason's deadline-exceeded value specifically
  why: the port and the fake thread every EvaluationReason value through unchanged as opaque data, so the judgment-failure and no-data tests already exercise the only code path a reason value could take; a third reason-specific test would repeat the same assertion under a different string, and no criterion requires the full enumeration to be exercised
- edge_case: an operation attempted against state that forbids it
  why: the port models no state machine; evaluate() answers unconditionally for a seeded criterion regardless of how many times or in what order it or seed() were previously called, and no node bound to this task describes a refusal by prior state
- edge_case: a dependency that is unavailable, slow to answer, or answers in an unexpected shape
  why: this task ships no real dependency, the fake is a synchronous in-memory Map read wrapped in an already-resolved promise, and the real judgment adapter that would actually reach a slow or misbehaving model is this epic's declared remainder, not this task's
- edge_case: two operations reaching the fake for one criterion at once
  why: the fake performs a synchronous Map read with no I/O boundary or shared mutable state a second concurrent call could observe mid-write, and no node bound to this task describes concurrent-call behavior for this port
- edge_case: a duplicate citation (same concept and field) within one seeded citations array
  why: Citation is an opaque two-field value the fake never inspects, compares or deduplicates, it stores and returns whatever array a test seeded, so a duplicate entry would exercise the identical pass-through path the confirmed/refuted tests already cover and prove nothing new
untested:
- that a confirmed or refuted EvaluationOutcome can never carry zero citations (rules/investigation/a-decided-evaluation-cites-evidence) is enforced by the TypeScript compiler through the non-empty-tuple type of EvaluationOutcome's citations field, not by anything this proof exercises at runtime — no test here constructs or observes the rejected value, because authoring it as a literal fails to compile rather than fails at a call. The strict typecheck this depends on is decided by the typecheck tool rather than by a reading, and this proof cannot substitute for that tool running.
---

## What it is

Unit tests proving the hypothesis-evaluator port's three criteria against its fake adapter, plus an import-purity and single-adapter sweep scoped to this task's own five modules.

## Notes

Writing this proof's own module-purity sweep surfaced that the sibling proof's equivalent check (task/evidence-collection/observation-source-port's "ships exactly one concrete adapter") counted every `.adapter.ts` file in the shared `src/investigation` directory, which this task's own legitimate fake adapter now falsifies. That sibling proof has been corrected in the same delivery, rescoped to check by interface implementation rather than by directory-wide file count, mirroring this proof's own equivalent check; the full suite (`run/hypothesis-judgment-hypothesis-evaluator-port-suite`) is green with both fakes present.
