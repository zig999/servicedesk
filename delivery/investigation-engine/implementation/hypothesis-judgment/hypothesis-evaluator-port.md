---
title: Hypothesis-evaluator port and its fake adapter
summary: The IHypothesisEvaluator port and a fixture-driven FakeHypothesisEvaluator that judges one hypothesis's criterion against its own evidence, plus the verdict, evaluation-reason and citation vocabulary the port's answer is built from.
task: sha256:4538988e80203f9a3631c196378d00bdff3aef16074175748cc0d2f9608f4130
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/hypothesis-judgment-hypothesis-evaluator-port-build
files:
- path: src/investigation/verdict.ts
  effect: declares the verdict vocabulary as plain data (domain/investigation/verdict) — the VERDICTS tuple and the Verdict type it derives, the three values a judgment call may reach.
- path: src/investigation/evaluation-reason.ts
  effect: declares the evaluation-reason vocabulary as plain data (domain/investigation/evaluation-reason) — the EVALUATION_REASONS tuple and the EvaluationReason type it derives, the three causes an evaluation may be inconclusive for.
- path: src/investigation/citation.ts
  effect: declares Citation (domain/investigation/citation), the two-field pointer, concept and field, that grounds a decided verdict or a no-data reason.
- path: src/investigation/hypothesis-evaluator.port.ts
  effect: declares IHypothesisEvaluator (domain/investigation/hypothesis-evaluator) with its one evaluate(criterion, evidence) operation; EvidenceItem, the per-concept input shape reused from IObservationSource's own ObservationOutcome; and EvaluationOutcome, the discriminated return type whose confirmed and refuted branches require a non-empty citations tuple and whose inconclusive branch requires a declared reason.
- path: src/investigation/fake-hypothesis-evaluator.adapter.ts
  effect: declares FakeHypothesisEvaluator, the one adapter this task ships — seed(criterion, outcome) registers a fixture, and evaluate() answers exactly the fixture seeded for the given criterion, throwing only when nothing was seeded for it.
criteria:
- criterion: The port's evaluate operation takes exactly one hypothesis's criterion and its own evidence, and answers an Evaluation carrying a verdict, citations when decided and a reason when inconclusive.
  met: true
  how: IHypothesisEvaluator.evaluate(criterion, evidence) in hypothesis-evaluator.port.ts takes exactly those two values and no others. EvaluationOutcome's confirmed and refuted branches each require citations as a non-empty tuple, enforced by the type itself, and its inconclusive branch requires a reason field, so an inconclusive value with no reason cannot type-check.
- criterion: The fake adapter is driven by test-supplied fixtures and returns confirmed, refuted and inconclusive evaluations on demand, importing no LLM or provider client.
  met: true
  how: FakeHypothesisEvaluator holds only a Map populated by seed(criterion, outcome); evaluate() answers exactly the seeded EvaluationOutcome for that criterion, whichever of the three verdicts it was seeded with, and throws only when no fixture was seeded for the criterion asked, a test setup fault, never one of the three verdicts. The file imports only its own port's types; no LLM or provider client is imported anywhere in this delivery.
- criterion: A unit test exercises the fake adapter for each of the three verdicts and asserts the shape of the Evaluation it answers.
  met: true
  how: 'This record writes source only, the test itself is the proof record''s, written in its own context by this framework''s split between implementer and test-author. What is built here makes such a test direct to write: seed() followed by evaluate() answers exactly the seeded confirmed, refuted or inconclusive EvaluationOutcome, deterministically and without a real adapter of any kind.'
nodes:
- node: domain/investigation/hypothesis-evaluator
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  how: IHypothesisEvaluator's one evaluate() operation is exactly this domain-service's one operation — given a hypothesis's criterion and its evidence only, it answers an evaluation, and the prose-versus-mechanical tension the node describes resolves entirely by which class implements the interface, never by a second criterion form or a second port.
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  how: Encoded partially, as EvaluationOutcome — verdict, citations (present when the verdict is decided) and reason (present when it is inconclusive) are exactly the fields this port's own evaluate() call can supply from a criterion and evidence alone. The node's hypothesis attribute is deliberately not encoded here, since evaluate() receives no hypothesis identity to name it with, the same way IObservationSource's ObservationOutcome carries no concept field either. The full per-hypothesis record, naming the hypothesis, is assembled by task/hypothesis-judgment/judgment-stage, which lists this same node among its own implements for exactly that reason.
- node: domain/investigation/evaluation-reason
  encoded_at:
  - src/investigation/evaluation-reason.ts
  how: EVALUATION_REASONS and the EvaluationReason type it derives enumerate exactly the node's three declared values, reused as the required reason field of EvaluationOutcome's inconclusive branch.
- node: domain/investigation/citation
  encoded_at:
  - src/investigation/citation.ts
  - src/investigation/hypothesis-evaluator.port.ts
  how: Citation as { concept, field } mirrors the node's two attributes exactly, and EvaluationOutcome's citations fields are arrays of exactly this type.
- node: domain/investigation/verdict
  encoded_at:
  - src/investigation/verdict.ts
  - src/investigation/hypothesis-evaluator.port.ts
  how: VERDICTS and the Verdict type it derives enumerate exactly the node's three declared values. EvaluationOutcome's three branches discriminate on this same vocabulary, 'confirmed' and 'refuted' as literals, and the inconclusive branch's verdict typed as Exclude<Verdict, 'confirmed' | 'refuted'> rather than a second, untied literal, so a fourth verdict added to this vocabulary would need this type to account for it.
- node: rules/investigation/a-decided-evaluation-cites-evidence
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  how: The confirmed and refuted branches of EvaluationOutcome type citations as a non-empty tuple, readonly [Citation, ...Citation[]] — a decided EvaluationOutcome value with zero citations cannot type-check, so the rule is a compiler-enforced fact of this port's own return type rather than a convention documented and hoped for.
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  how: The inconclusive branch of EvaluationOutcome requires a reason field of type EvaluationReason — an inconclusive value declaring no reason cannot type-check, so every inconclusive evaluation declaring its reason is compiler-enforced. The rule's further clause, that a no-data reason cites the evidence whose result is not ok, is left exactly as the task's own UNDERDETERMINED note directs — citations on the inconclusive branch is a plain, possibly empty, array, so a no-data-reasoned value with zero citations still type-checks and the fake can be seeded with one; this gap is the task's declared, non-blocking disposition and not something this delivery decided to leave open on its own.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  how: This constrains the pool and the parallel invocation over many hypotheses, which is orchestration this task does not build, so no fact of it is placed in these files. The port honors it structurally — evaluate() takes one hypothesis's criterion and evidence per call, with no shared state, no batching parameter and no reference to any other call, so an orchestrator invoking it once per hypothesis under a bounded parallel pool is exactly what this interface admits and nothing more. The pool itself, its bound and the parallel invocation belong to task/hypothesis-judgment/judgment-stage.
- node: constraints/judgment-runs-behind-a-port
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  how: IHypothesisEvaluator is the one declared entry through which judgment is invoked, and FakeHypothesisEvaluator is the one concrete class this task ships implementing it; neither file imports an LLM or provider client. A future production adapter is a second, interchangeable class behind the same interface, never a second entry point or a second criterion form.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/investigation/verdict.ts
  - src/investigation/evaluation-reason.ts
  - src/investigation/citation.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  how: Every file this delivery wrote imports only sibling module types under src/investigation, or nothing at all — none imports a framework, a driver or a provider client, keeping this module importable as a plain unit under test.
inferences:
- inferred: evaluate() carries no hypothesis-identity parameter, and EvaluationOutcome carries no hypothesis field — the full per-hypothesis domain/investigation/evaluation record is assembled outside this port.
  from: the task's own criterion 1 names exactly criterion and evidence as evaluate()'s inputs and exactly verdict, citations and reason as what the answer carries, naming no hypothesis identity anywhere; task/hypothesis-judgment/judgment-stage's own implements already lists domain/investigation/evaluation, which is where that assembly belongs; and the sibling IObservationSource/ObservationOutcome pair already delivered in this same module establishes exactly this convention, where the port answers what one call can determine, and the caller who already knows the identifier it called for attaches it afterwards.
- inferred: the evidence a hypothesis's evaluate() call receives is modeled as EvidenceItem, a concept paired with an ObservationOutcome, one already-collected concept's outcome exactly as IObservationSource answers it, rather than the full Evidence record domain/investigation/evidence declares.
  from: domain/investigation/evidence is not among this task's implements, it belongs to task/evidence-collection/observation-source-port and task/evidence-collection/evidence-collection-stage, per the inventory, which found no Evidence type anywhere in the tree yet, so this task reuses the one already-specified, already-built shape it can reach, the same way observation-source.port.ts itself reused domain/investigation/subject's shape without that node being among its own implements.
- inferred: IHypothesisEvaluator.evaluate() never throws for any of the three verdicts.
  from: IObservationSource's own sibling port already keeps this convention for evidence-result's endings, and evaluation-reason's own judgment-failure value exists precisely so a failed judgment call is a recorded reason rather than a propagated exception; applying the same convention here keeps the two sibling ports symmetric.
- inferred: FakeHypothesisEvaluator keys its seeded fixtures by criterion alone, throwing only when a call's criterion was never seeded.
  from: the port's evaluate() signature deliberately carries no hypothesis identity (the first inference above), so criterion is the only value distinguishing one call from another at this port, unlike FakeObservationSource, which keys by concept and subject together because IObservationSource's observeConcept() receives both.
- inferred: EvaluationOutcome models citations as an always-present, possibly empty array on the inconclusive branch, rather than as an optional field.
  from: domain/investigation/evaluation marks citations many without required true, so an inconclusive evaluation may hold zero; an always-present array matches the confirmed and refuted branches' own array shape and is exactly the value the task's own UNDERDETERMINED note describes testing, a fixture whose reason is no-data and whose citations list is empty.
deferred:
- what: the real (LLM) adapter behind IHypothesisEvaluator, and its closed prompt assembly (constraints/the-judgment-prompt-is-closed).
  why: the task's own rationale and the epic's own uncovered note reserve this for a distinct remainder this plan does not build.
- what: the judgment pool, its parallel invocation over every hypothesis a case requires, and the deadline slot that turns a missed one into deadline-exceeded.
  why: belongs to task/hypothesis-judgment/judgment-stage, per constraints/hypotheses-are-judged-in-isolated-parallel-calls and scenarios/investigation/a-queued-judgment-is-deadline-exceeded.
- what: citation structural validation (a-citation-stays-within-the-hypothesis-collects, a-cited-field-exists-in-the-capability-output-schema) and retry/fallback on a foreign citation.
  why: belongs to task/hypothesis-judgment/citation-validation and, for retry/fallback, task/hypothesis-judgment/judgment-stage, per the task's own REMAINDER notes.
- what: assembling the full per-hypothesis domain/investigation/evaluation record, naming the hypothesis, and enforcing one-evaluation-per-required-hypothesis.
  why: belongs to task/hypothesis-judgment/judgment-stage and task/investigation-lifecycle/investigation-factory respectively, per the task's own REMAINDER notes.
- what: wiring any IHypothesisEvaluator implementation into a factory or a production consumer.
  why: no consumer exists anywhere in this tree yet — the judgment stage that will call evaluate() is a later task's to build.
---

## What it is

The interface between the judgment stage and one hypothesis's judgment call, and a fake adapter that answers controlled fixtures so isolation and degradation logic is testable without a real model.

## Notes

The UNDERDETERMINED note the task carries — whether a no-data-reasoned inconclusive evaluation must cite the not-ok evidence — is left open exactly as the task's own note directs: citations on the inconclusive branch is a plain, possibly empty, array, so a fixture with reason no-data and zero citations still type-checks. The proof is expected to exercise that fixture, asserting only that verdict is inconclusive and a reason is present, per the task's own note.
No production consumer of `IHypothesisEvaluator` exists yet, and none is wired here — that is a later task's (`judgment-stage`).
