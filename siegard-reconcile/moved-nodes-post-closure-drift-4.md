---
contract_version: siegard-reconcile/1
title: 'Fourth reconciliation of 8 investigation/case files: prior fixes hold, two new precision issues
  found'
summary: 'These 8 files'' current behavior and comments are correct as they stand. All three prior corrective
  deliveries are confirmed complete on re-reading: no stale case/hypothesis identity citation and no misattributed
  constraint quotation remain. This pass instead found two new, unrelated precision issues: an ordinal-position
  error citing constraints/the-judgment-prompt-is-closed, and a historical comment misattributing two
  scenarios to the wrong rule.'
target: backend
files:
- path: src/investigation/citation-validation.ts
  change: Checks a hypothesis's citations against its own collects array and each cited capability's output
    schema. Unchanged since the prior pass.
- path: src/investigation/judgment-stage.ts
  change: Runs isolated parallel evaluate() calls per hypothesis. All prior citation issues fixed; one
    comment misstates the ordinal position of a permitted prompt entry.
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the AssessmentConsolidator port. Unchanged since the prior pass.
- path: src/investigation/draft-assessment-text.ts
  change: Drafts the case's outcome assessment text. Unchanged since the prior pass.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A test fake of the assessment-consolidator port. Unchanged since the prior pass.
- path: src/investigation/resolve-and-narrow-input.ts
  change: Resolves the case's confirmed hypothesis, or its fallback. A historical comment misattributes
    two scenarios to the wrong rule as what they once implemented.
- path: src/case/validate-case-coherence.ts
  change: Runs the case's full structural coherence check. Unchanged since the prior pass.
- path: src/fixtures/capability/capability.json
  change: A fixture capability declaration. Unchanged since the prior pass.
nodes:
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: both files match the constraint's statement; draft-assessment-text.ts states the module calls only
    the published interface, never an LLM or provider client directly.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: quotes the fitness clause verbatim ("the pool bound is configuration"); CallPool/judgeOneHypothesis
    implement one isolated call per hypothesis under a bounded pool.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: judgeHypotheses/runIsolatedCall call only evaluator.evaluate(...) through IHypothesisEvaluator,
    never an LLM client.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: now/deadline arrive as explicit parameters; one shared deadline signal is raced by every pool wait
    and evaluate() call.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: each module documents and keeps to importing no framework, driver or provider client.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/capability-check
  conforms: true
  how: capabilityViolations() resolves through the port's read-capability inside this very call.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/vocabulary-terms
  conforms: true
  how: vocabularyViolations() resolves through the port's read-vocabulary-term on every call.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/system/case-authoring
  conforms: true
  how: caseCoherenceViolations/validateCaseCoherence collect every violation once, all at once.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/integration/capability
  conforms: true
  how: declaresTimeout's comment matches the node's own Responsibility (timeout in milliseconds); the
    fixture instantiates exactly the node's eight attributes.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
- node: domain/integration/capability-nature
  conforms: true
  how: checks capability.nature !== READ_ONLY_NATURE; fixture uses read-only, one of exactly the two enumerated
    values.
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
- node: domain/investigation/assessment
  conforms: true
  how: the Assessment answered carries only outcome, referral, determining_hypothesis and text, matching
    the node's four attributes.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/assessment-consolidator
  conforms: true
  how: consolidate()'s signature matches the node's Responsibility exactly.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/citation
  conforms: true
  how: Citation {concept, field} matches the node's own Description.
  encoded_at:
  - src/investigation/citation-validation.ts
- node: domain/investigation/evaluation
  conforms: true
  how: matches the node's attribute list (hypothesis, verdict, reason, citations).
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: the three reasons used are exactly the node's three enumerated values.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evidence
  conforms: true
  how: usage is consistent with the node's attributes and its capability reference.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/resolve-and-narrow-input.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: matches the node's Description of the prose-vs-mechanical adapter resolution and its now-settled
    Responsibility.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/verdict
  conforms: true
  how: asEvaluation()'s branches use exactly the node's three enumerated values.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: flows through these modules opaquely, consistent with the node's closed enumeration.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/knowledge/referral
  conforms: true
  how: termsOf checks over resolution.referral match the node's two attributes.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/resolution
  conforms: true
  how: declaredResolutions() matches the node's outcome/referral pairing.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/case-version
  conforms: true
  how: consolidation_register, requiresEvaluationOf, collection-plan, subject and fallback references
    match the node's attributes and operations.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: collects/resolution correctly attributed, matching the node's attributes.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: citesACollectedConcept()/isStructurallyValid() match the statement exactly.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: citesADeclaredField() matches the statement exactly.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: isStructurallyValid() refuses zero citations for decided answers.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: noDataEvaluation() cites exactly the non-ok evidence.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: every path degrades to an inconclusive reason rather than aborting, cited explicitly.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: Promise.all over requiresEvaluationOf(theCase) produces exactly one Evaluation per name, cited
    explicitly.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: outcome/referral/determining_hypothesis copied verbatim from resolved.*, never recomputed.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: narrowedInput carries every required hypothesis's evaluation and only its cited evidence, unconditionally.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: conceptViolations() checks resolution.concept.accepts.includes(theCase.subject).
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: vocabularyViolations()/conceptViolations() check every named term and concept against the glossary.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  how: answerGaps() checks held + read-only + output_schema + timeout.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: capabilityViolations() resolves inside this very call and never remembered between calls.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: judgeOneHypothesis's immediate no-data branch for non-ok evidence generalizes the scenario.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: retryOrFail's retry-then-judgment-failure logic matches the scenario, correctly cited.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: acquireSlotOrDeadline's deadline-vs-slot race matches the scenario exactly, correctly cited.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: true
  how: conceptViolations()'s subject-mismatch branch names both the concept and the subject type, correctly
    cited.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: false
  how: 'runIsolatedCall''s doc comment (lines ~145-147) reads "constraints/the-judgment-prompt-is-closed''s
    own fifth permitted entry puts each evidence item''s declared field names inside the very prompt this
    call sends." The node''s own statement lists the permitted content in this order: one hypothesis''s
    criterion, its own evidence, the field names declared in the output schema of each evidence item''s
    own producing capability, and the pinned case''s title and when_to_use — field names is the third
    item, not the fifth (title is fourth, when_to_use fifth). The node''s own Description confirms field
    names was part of the original, pre-growth content, never the fifth addition.'
  observed_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: false
  how: The module header (lines ~12-17) states the confirmed/fallback split this module once carried "implemented
    an earlier version of the-writing-input-is-narrowed and is removed," citing this scenario as part
    of that claim. But this scenario's own given/then govern resolve-outcome producing the fallback's
    outcome and referral with no determining hypothesis named — rules/investigation/the-outcome-comes-from-the-case's
    territory, correctly cited two lines later in the same file — not the narrowed-input shape the-writing-input-is-narrowed
    governs.
  observed_at:
  - src/investigation/resolve-and-narrow-input.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: false
  how: 'Same passage, same misattribution: this scenario''s own then-clause is resolve-outcome''s precedence
    behavior (regional-incident determining, onu-offline unmarked) — again the-outcome-comes-from-the-case''s
    territory, not what the-writing-input-is-narrowed governs.'
  observed_at:
  - src/investigation/resolve-and-narrow-input.ts
notes: '40 of 43 nodes conform. Three do not: constraints/the-judgment-prompt-is-closed (ordinal position
  error) and two scenario nodes both misattributed by the same historical comment in resolve-and-narrow-input.ts.
  Per the all-or-nothing rule, nothing binds this pass. Next: a fourth corrective task (same initiative/epic,
  growing covers to include these three nodes), then reconcile this file set once more.'
---
