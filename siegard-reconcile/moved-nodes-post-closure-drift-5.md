---
contract_version: siegard-reconcile/1
title: 'Fifth reconciliation of 8 investigation/case files: prior fix itself introduced a misattribution'
summary: 'These 8 files'' current behavior and comments are correct as they stand, except for one regression:
  the fourth corrective delivery (fix-prompt-ordinal-and-scenario-misattribution) fixed a real misattribution
  but introduced a different, wrong one in the same edit.'
target: backend
files:
- path: src/investigation/citation-validation.ts
  change: Checks a hypothesis's citations. Unchanged since the prior pass.
- path: src/investigation/judgment-stage.ts
  change: Runs isolated parallel evaluate() calls per hypothesis. All citations now correct, including
    the prompt-entry ordinal (third, not fifth).
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the AssessmentConsolidator port. Unchanged since the prior pass.
- path: src/investigation/draft-assessment-text.ts
  change: Drafts the case's outcome assessment text. Unchanged since the prior pass.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A test fake of the assessment-consolidator port. Unchanged since the prior pass.
- path: src/investigation/resolve-and-narrow-input.ts
  change: 'Resolves the case''s confirmed hypothesis, or its fallback. The prior task''s own fix mis-corrected
    a historical citation: it now names rules/investigation/the-outcome-comes-from-the-case where the
    decision log itself files this exact historical replacement under rules/investigation/the-writing-input-is-narrowed.'
- path: src/case/validate-case-coherence.ts
  change: Runs the case's full structural coherence check. Unchanged since the prior pass.
- path: src/fixtures/capability/capability.json
  change: A fixture capability declaration. Unchanged since the prior pass.
nodes:
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  how: only the port is called; the fake is the only adapter shipped here.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: one isolated evaluate() call per hypothesis under a bounded pool, quoting the node's fitness clause
    verbatim.
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: only evaluator.evaluate() is called through the published IHypothesisEvaluator type, never an LLM
    client.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: now/deadline arrive as explicit parameters, never a system clock read internally.
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: each file imports only sibling plain-data types and ports, no framework/driver/provider client.
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: caseContext computed once and passed unchanged; field names correctly cited as the node's third
    permitted entry.
- node: contracts/integration/capability-registry
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: judgment-stage.ts calls only capabilities.readCapability(concept), consistent with the published
    operation.
- node: contracts/knowledge/capability-check
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: capabilityViolations() resolves through the port's read-capability inside this very call.
- node: contracts/knowledge/vocabulary-terms
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: vocabularyViolations() resolves through the port's read-vocabulary-term and read-concept.
- node: contracts/system/case-authoring
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: caseCoherenceViolations/validateCaseCoherence collect every violation before refusing once.
- node: domain/integration/capability
  conforms: true
  encoded_at:
  - src/fixtures/capability/capability.json
  how: the fixture instantiates exactly the node's eight declared attributes.
- node: domain/integration/capability-nature
  conforms: true
  encoded_at:
  - src/fixtures/capability/capability.json
  how: 'fixture declares nature: read-only, one of exactly the two enumerated values.'
- node: domain/investigation/assessment
  conforms: true
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: draftAssessment assembles outcome, referral, determining_hypothesis and text only, matching the
    node's four attributes.
- node: domain/investigation/assessment-consolidator
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  how: consolidate()'s signature matches the node's Responsibility exactly.
- node: domain/investigation/citation
  conforms: true
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: Citation {concept, field} matches the node's own Description.
- node: domain/investigation/evaluation
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: Evaluation type usage matches the node's attribute list (hypothesis, verdict, reason, citations).
- node: domain/investigation/evaluation-reason
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the three reasons used are exactly the node's three enumerated values.
- node: domain/investigation/evidence
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: usage is consistent with the node's attributes and its capability reference.
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: evaluator.evaluate(criterion, evidenceItems, caseContext) matches the port's now-settled Responsibility.
- node: domain/investigation/verdict
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: asEvaluation()'s branches use exactly the node's three enumerated values.
- node: domain/knowledge/case
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: resolve-and-narrow-input.ts and validate-case-coherence.ts reference only the case's stable slug/identity,
    never a fact this node does not hold.
- node: domain/knowledge/case-version
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: title/when_to_use, consolidation_register, subject/fallback/collection-plan all correctly attributed
    here.
- node: domain/knowledge/consolidation-register
  conforms: true
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  how: ConsolidationRegister passed through opaquely, consistent with the node's closed enumeration.
- node: domain/knowledge/hypothesis
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: identity-by-name lookup only; no revision content asserted as belonging to this node.
- node: domain/knowledge/hypothesis-revision
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/citation-validation.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: collects/criterion/resolution correctly attributed here, matching the node's attributes.
- node: domain/knowledge/referral
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: resolution.referral.action/recipient read for vocabulary checks, matching the node's two attributes.
- node: domain/knowledge/resolution
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: declaredResolutions() reads each hypothesis's and the fallback's resolution.
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  how: citesACollectedConcept()/isStructurallyValid() gate acceptance.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  how: citesADeclaredField() gates acceptance.
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: isStructurallyValid() refuses zero citations for a decided answer.
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: each inconclusive branch names a distinct, evidence-backed reason.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: deadline overrun degrades to deadline-exceeded, never aborts, cited explicitly.
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: Promise.all over requiresEvaluationOf(theCase) produces exactly one Evaluation per name, cited
    explicitly.
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: false
  observed_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: draft-assessment-text.ts and assessment-consolidator.port.ts correctly encode this rule (outcome/referral
    copied verbatim from resolve-outcome's answer). But the prior corrective delivery (fix-prompt-ordinal-and-scenario-misattribution)
    changed resolve-and-narrow-input.ts's module header to read that the removed confirmed/fallback split
    'implemented an earlier version of rules/investigation/the-outcome-comes-from-the-case' — this is
    the wrong node. This node's own statement and Description concern only who computes outcome/referral/determining
    hypothesis (resolve-outcome); they say nothing about consolidation's input breadth, which is what
    the removed branching actually concerned. The decision-log entry documenting this exact historical
    replacement ('this rule is replaced, not relaxed — the outcome-based branching disappears') is filed
    under rules/investigation/the-writing-input-is-narrowed.md, not this node.
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: false
  observed_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: assessment-consolidator.port.ts and draft-assessment-text.ts correctly encode this rule's current,
    unconditional-breadth statement. But resolve-and-narrow-input.ts's module header no longer credits
    this node for the historical replacement its own decision-log entry documents — the prior delivery
    moved that historical citation onto rules/investigation/the-outcome-comes-from-the-case instead, which
    the decision log does not name.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: conceptViolations() checks accepts.includes(theCase.subject).
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: vocabularyViolations()/conceptViolations() check every named term and concept.
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
  how: answerGaps() gates held + read-only + output_schema + timeout.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: capabilityViolations() resolves fresh per call, nothing memoized.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the no-data-evaluation-on-timeout branch matches the scenario.
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: retryOrFail's retry-then-judgment-failure logic matches the scenario, correctly cited.
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: acquireSlotOrDeadline's deadline-vs-slot race matches the scenario, correctly cited.
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: the subject-type mismatch violation message matches the scenario, correctly cited.
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: cited in resolve-and-narrow-input.ts's historical comment as one of the two scenarios the removed
    branching once handled; the scenario's own behavior is correctly described, only the rule it's paired
    with in that historical claim was wrong (see the two findings above).
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: same as above.
notes: '43 of 45 nodes conform. Two do not, both from the same sentence in resolve-and-narrow-input.ts''s
  module header: the prior delivery''s fix moved a historical citation from rules/investigation/the-writing-input-is-narrowed
  (correct, per the decision log) to rules/investigation/the-outcome-comes-from-the-case (incorrect).
  The original text, before any of this initiative''s deliveries touched it, already cited the right node
  — this needs reverting to it, not a fresh correction. Per the all-or-nothing rule, nothing binds this
  pass. Next: a fifth corrective task reverting this specific citation, then reconcile once more.'
---
