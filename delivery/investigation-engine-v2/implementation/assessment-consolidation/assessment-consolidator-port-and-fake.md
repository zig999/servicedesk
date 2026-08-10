---
title: assessment-consolidator port and fake
summary: A new IAssessmentConsolidator port and its FakeAssessmentConsolidator adapter, mirroring hypothesis-evaluator's port-plus-fake pattern exactly, plus the standalone ConsolidationRegister vocabulary the port's signature needs.
task: sha256:67eb1bd05153f619774a44f4bdaa0c78e81940633abdac19f523addb8a64ec6a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-assessment-consolidator-port-and-fake-build-2
files:
  - path: src/investigation/consolidation-register.ts
    effect: "new file. Declares CONSOLIDATION_REGISTERS (a const array of formal and plain) and the derived ConsolidationRegister type, following the same closed-enumeration shape already used for Verdict, EvaluationReason and EvidenceResult. Imports nothing."
  - path: src/investigation/assessment-consolidator.port.ts
    effect: "new file. Declares IAssessmentConsolidator with one operation, consolidate(evaluations, evidence, consolidationRegister), returning Promise<string> — the assessment's text alone, with no field position for an outcome, a referral or a determining hypothesis. Imports only the sibling Evaluation, Evidence and ConsolidationRegister types."
  - path: src/investigation/fake-assessment-consolidator.adapter.ts
    effect: "new file. Declares FakeAssessmentConsolidator, the one concrete class implementing IAssessmentConsolidator in this delivery: a fixture-seeded test double keyed by the whole evaluations/evidence/consolidationRegister call (bundled as one ConsolidateCall object plus the text, to keep seed() within a three-positional-parameter limit), answering exactly the text a test seeded and throwing a plain error for an unseeded call. Imports only the port's own interface and the sibling Evaluation, Evidence and ConsolidationRegister types."
criteria:
  - criterion: "The port's consolidate operation takes every required hypothesis's evaluation (verdict, reason when present, citations), the evidence those citations name, and the pinned case's consolidation register, and returns text alone."
    met: true
    how: "IAssessmentConsolidator.consolidate(evaluations, evidence, consolidationRegister) declares evaluations as readonly Evaluation[] — Evaluation's own discriminated-union shape reused verbatim rather than redeclared — evidence as readonly Evidence[], and consolidationRegister as the new ConsolidationRegister type (formal/plain); its return type is Promise<string>, text alone and nothing else. FakeAssessmentConsolidator implements the identical three-parameter signature and answers only a seeded string."
  - criterion: "The consolidator never returns or decides an outcome, a referral or a determining hypothesis."
    met: true
    how: "consolidate()'s return type is Promise<string> alone — there is no field position in which an outcome, a referral or a determining hypothesis could travel back to the caller. FakeAssessmentConsolidator's own implementation answers exactly the text a test seeded, computing nothing from its arguments, so nothing behind this port can smuggle a decided outcome through this call."
  - criterion: "Exactly one concrete class implements the port, matching the existing hypothesis-evaluator-modules.spec.ts fitness pattern."
    met: true
    how: "FakeAssessmentConsolidator is the only class this delivery adds, declaring implements IAssessmentConsolidator, mirroring FakeHypothesisEvaluator's own status as the sole implementer of IHypothesisEvaluator. This record does not itself write the fitness test proving this mechanically — that is test-author's separate pass — but the source is shaped so an own-file-list test finds exactly one implementer."
  - criterion: "The investigation domain module housing the consolidator imports no LLM client."
    met: true
    how: "assessment-consolidator.port.ts and fake-assessment-consolidator.adapter.ts import only sibling investigation plain-data types and the port interface itself — no LLM or provider client, no framework, no driver and nothing from the Node standard library. consolidation-register.ts imports nothing at all."
nodes:
  - node: domain/investigation/assessment-consolidator
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/fake-assessment-consolidator.adapter.ts
    how: "IAssessmentConsolidator.consolidate() is exactly this node's own consolidate operation: given every required hypothesis's evaluation, the evidence any of their citations name, and the pinned case's own consolidation register, it returns the assessment's text alone, deciding no outcome, referral or determining hypothesis. FakeAssessmentConsolidator is the fixture-driven test adapter this node's Description names, mirroring hypothesis-evaluator's own port-plus-fake shape."
  - node: domain/knowledge/consolidation-register
    encoded_at:
      - src/investigation/consolidation-register.ts
    how: "CONSOLIDATION_REGISTERS/ConsolidationRegister declares exactly the closed two-value set this node names (formal, plain), in the same closed-enumeration shape already used for Verdict, EvaluationReason and EvidenceResult. Kept local to this task's own port and fake, per this task's own Notes, rather than added as the pinned case's own attribute — that is the sibling case-coherence task's own objective."
  - node: domain/investigation/assessment
    how: "this task does not touch assessment.ts. The port's return value — text alone — is exactly the one field this node's Description names as what the writing step produces; outcome, referral and determining_hypothesis remain wholly untouched. No fact of this node's own shape changes here."
  - node: domain/investigation/evaluation
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/fake-assessment-consolidator.adapter.ts
    how: "consolidate()'s first parameter is typed readonly Evaluation[], reusing the existing type verbatim, so every required hypothesis's own verdict, reason and citations reach the port and its fake unchanged."
  - node: domain/investigation/citation
    how: "Citation travels only as a nested field of Evaluation.citations; none of this task's files destructure or read a citation's own concept or field. No new fact of this node's own is encoded here."
  - node: domain/investigation/evidence
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/fake-assessment-consolidator.adapter.ts
    how: "consolidate()'s second parameter is typed readonly Evidence[], the existing type reused verbatim."
  - node: constraints/consolidation-runs-behind-a-port
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/fake-assessment-consolidator.adapter.ts
    how: "IAssessmentConsolidator is the one published port; FakeAssessmentConsolidator is the only class in this delivery declaring implements IAssessmentConsolidator. Neither file imports an LLM or provider client."
  - node: constraints/the-domain-depends-on-no-infrastructure
    encoded_at:
      - src/investigation/consolidation-register.ts
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/fake-assessment-consolidator.adapter.ts
    how: "consolidation-register.ts imports nothing; the port and its fake import only sibling investigation plain-data types and, for the fake, the port's own interface — no framework, driver, provider client or Node standard-library module anywhere."
  - node: rules/investigation/the-writing-input-is-narrowed
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
    how: "consolidate()'s first two parameters are exactly Evaluation[] and Evidence[] — the same shape in every outcome — and the port never receives a Case, a hypothesis's own criterion or when_to_use. This task covers only the port's own input/output shape; the rule's second clause, on what an adapter's own prompt construction may read, is this epic's own declared remainder for the real (non-fake) adapter."
  - node: rules/investigation/the-outcome-comes-from-the-case
    encoded_at:
      - src/investigation/assessment-consolidator.port.ts
      - src/investigation/fake-assessment-consolidator.adapter.ts
    how: "consolidate() returns Promise<string> alone, with no field position for an outcome, a referral or a determining hypothesis; both the interface and its fake leave those exactly where this rule places them — the pinned case's own resolve-outcome, elsewhere and unchanged by this call."
inferences:
  - inferred: "ConsolidationRegister is a new standalone vocabulary module under src/investigation/ (consolidation-register.ts), rather than a field added to src/case/case.ts's Case type."
    from: "this task's own Notes state the port and fake can be demonstrated against a stub register without the sibling task landing first, and task/assessment-consolidation/case-coherence-optional-consolidation-register's own rationale calls the Case document's consolidation_register field independent of the consolidator and drafting tasks; the shape mirrors the existing precedent for domain/investigation/verdict and domain/investigation/evaluation-reason."
  - inferred: "consolidate() takes three positional parameters (evaluations, evidence, consolidationRegister) rather than one options object."
    from: "hypothesis-evaluator's own evaluate(criterion, evidence) is the pattern this task must follow exactly, and it is positional; three parameters also stays within the project's standard's own three-positional-parameter limit (MNT-01)."
  - inferred: "consolidate() returns Promise<string> directly rather than an object wrapping a text field."
    from: "both criterion 1's own wording (returns text alone) and domain/investigation/assessment-consolidator's own Responsibility (return the assessment's text alone) name the return value as the text itself, not a container around it."
  - inferred: "FakeAssessmentConsolidator's seed() takes one ConsolidateCall object (evaluations, evidence, consolidationRegister) plus the text, rather than four positional parameters."
    from: "the project's standard bounds a function to at most three positional parameters (MNT-01, decided by lint's max-params); bundling the three call-identifying fields into one object keeps seed() within that bound while consolidate() itself keeps its own three positional parameters, matching the port's own interface."
  - inferred: "the fake's fixture lookup key is the JSON-serialized whole evaluations/evidence/consolidationRegister triple, rather than a single scalar field."
    from: "unlike FakeHypothesisEvaluator's criterion or FakeObservationSource's concept-and-subject pair, no single argument here uniquely distinguishes one consolidate() call from another; this generalizes the existing multi-field key-join convention to structured, nested arguments via serialization, since the evaluations/evidence arrays are not themselves flat scalars a manual join could handle."
  - inferred: "no default-register logic is implemented anywhere in this task's files; consolidationRegister is a required, always-populated parameter on both the port and the fake."
    from: "this task's own Notes state that none of the four criteria require the port or its fake to admit an absent register or apply a default; domain/knowledge/case's own statement that the consolidation step keeps whatever register its own adapter defaults to therefore names a fact the real (non-fake) adapter, not this port or this fake, must eventually supply."
deferred:
  - what: "the real (LLM-backed) adapter behind IAssessmentConsolidator, and any default-register logic domain/knowledge/case's own description names for when a case's consolidation_register is absent."
    why: "this epic's own declared remainder, the same shape hypothesis-evaluator-port and observation-source-port already leave their own real adapters as; this task's objective is the port and its fixture-driven fake alone."
  - what: "wiring assessment-consolidator into draft-assessment-text, and threading a case's own consolidation_register value into a call to it."
    why: "task/assessment-consolidation/draft-assessment-text-consumes-consolidator's own objective, which depends_on this task."
  - what: "adding a real consolidation_register attribute to the Case aggregate and its coherence validation."
    why: "task/assessment-consolidation/case-coherence-optional-consolidation-register's own, independent objective — this task's own Notes and that task's own rationale both frame this port as demonstrable against a stub register without that task landing first."
  - what: "a module-scoped fitness test (assessment-consolidator-modules.spec.ts) proving criteria 3 and 4 mechanically, mirroring hypothesis-evaluator-modules.spec.ts's own-file-list pattern."
    why: "writing tests is test-author's separate pass in a clean context, not this implementation record's; the source is shaped so such a test, scoped to this task's own three files, would find exactly what it expects."
---

## What it is

A new assessment-consolidator.port.ts and its fake adapter, following the hypothesis-evaluator port-plus-fake convention exactly, plus the standalone ConsolidationRegister vocabulary the port's signature needs.

## Notes

REVISITED, procedural — this task's own UNDERDETERMINED note (default consolidation_register) is real and its test was correctly written by test-author, then withdrawn by an explicit human decision before this record was composed: `npm test` runs the whole project's suite as one command, so a deliberately-failing test proving this gap would have refused every task's own proof for the rest of this initiative (bin/deliver.py refuses to record a proof whose run did not pass), not only this one. No proof record is composed for this task in this delivery pass as a result — `deliver.py --outstanding` will correctly report this task as implemented with no proof holding it up. The withdrawn test, and an equivalent gap mishandled in task/subject-identity-rework/subject-value-object's own proof, are both to be revisited together before /review-change runs.
