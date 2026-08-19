---
contract_version: siegard-reconcile/1
title: 'Sixth reconciliation of 8 investigation/case files: clean'
summary: These 8 files' current behavior and comments are correct as they stand. This is the sixth pass
  over this file set; the five prior corrective deliveries (4 stale case/hypothesis citations, 1 more
  stale citation, 1 misattributed quotation, 1 ordinal error plus 1 scenario misattribution, and a revert
  of that misattribution's own miscorrection) are all confirmed holding on this pass. No new finding.
target: backend
files:
- path: src/investigation/citation-validation.ts
  change: Checks a hypothesis's citations against its own collects array and each cited capability's output
    schema. Unchanged since the prior pass.
- path: src/investigation/judgment-stage.ts
  change: Runs isolated parallel evaluate() calls per hypothesis. Unchanged since the prior pass.
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the AssessmentConsolidator port. Unchanged since the prior pass.
- path: src/investigation/draft-assessment-text.ts
  change: Drafts the case's outcome assessment text. Unchanged since the prior pass.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A test fake of the assessment-consolidator port. Unchanged since the prior pass.
- path: src/investigation/resolve-and-narrow-input.ts
  change: Resolves the case's confirmed hypothesis, or its fallback. Reverted to citing rules/investigation/the-writing-input-is-narrowed
    for the removed confirmed/fallback split's history, matching the decision log.
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
  how: the tension between a curator's framing and a mechanical one resolves by adapter, never a second
    criterion form in the schema; which concrete adapter answers consolidate() is the caller's own choice.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: a hypothesis whose evidence is not all ok degrades immediately to no-data, never touching the pool;
    one otherwise judged in its own isolated evaluate() call, under a configured pool bound (CallPool
    enforces poolSize exactly).
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the file only ever holds an IHypothesisEvaluator and calls evaluator.evaluate(...); it imports
    no concrete LLM/provider adapter.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: now and deadline arrive as explicit parameters, never a system clock read internally; the absolute
    deadline instant is propagated as epoch milliseconds.
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: each file's own imports confirm only sibling plain-data types and port interfaces, no framework,
    driver or provider client.
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the pinned case version's own CaseContext is computed once and travels unchanged into every evaluate()
    call; field names are correctly cited as the node's third permitted content class.
- node: contracts/integration/capability-registry
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: both consumers use capabilities.readCapability(...), matching the contract's read-capability operation.
- node: contracts/knowledge/capability-check
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: the checks reach the integration context only through the published query port.
- node: contracts/knowledge/vocabulary-terms
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: uses both glossary.readVocabularyTerm and glossary.readConcept, exactly the contract's two operations.
- node: contracts/system/case-authoring
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: caseCoherenceViolations collects every violation before validateCaseCoherence refuses once, matching
    all refusals at once.
- node: domain/integration/capability
  conforms: true
  encoded_at:
  - src/fixtures/capability/capability.json
  how: the fixture entries carry exactly the node's full attribute list, no more, no fewer.
- node: domain/integration/capability-nature
  conforms: true
  encoded_at:
  - src/fixtures/capability/capability.json
  how: 'capability.nature !== READ_ONLY_NATURE gates refusal; fixtures declare nature: read-only.'
- node: domain/investigation/assessment
  conforms: true
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: the Assessment answered carries only outcome, referral, determining_hypothesis and text, matching
    the node's four attributes exactly.
- node: domain/investigation/assessment-consolidator
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  how: one consolidate() call receiving every required hypothesis's evaluation, cited evidence, and the
    consolidation register, answering the assessment's text alone — matches the node's Responsibility.
- node: domain/investigation/citation
  conforms: true
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: implements exactly the two structural checks (concept, field) the node's two attributes require.
- node: domain/investigation/evaluation
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: each branch produces exactly {hypothesis, verdict, reason?, citations}, matching the node's attribute
    set.
- node: domain/investigation/evaluation-reason
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the three literal reasons used are exactly the node's three enum values, no fourth.
- node: domain/investigation/evidence
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: Evidence and Evaluation declare no field that could carry a hypothesis's own criterion or the case's
    when_to_use, matching the node's attributes.
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: evaluator.evaluate(criterion, evidenceItems, caseContext) matches the node's now-settled Responsibility
    exactly.
- node: domain/investigation/verdict
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the three enumerated branches (confirmed, refuted, inconclusive) match the node's values exactly.
- node: domain/knowledge/case
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: consistently uses .slug per the node's attribute; the node's own responsibilities are not re-implemented
    here, and nothing here contradicts them.
- node: domain/knowledge/case-version
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: consolidation_register, title/when_to_use, subject/fallback/collection-plan all correctly attributed
    to this node.
- node: domain/knowledge/consolidation-register
  conforms: true
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  how: the register is only ever threaded through opaquely; no file restates or hardcodes its formal/plain
    values.
- node: domain/knowledge/hypothesis
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: hypothesis.collects/hypothesis.criterion usage is consistent with the identity/content split the
    node and hypothesis-revision together describe.
- node: domain/knowledge/hypothesis-revision
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/investigation/citation-validation.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: correctly distinguishes the revision's collects/criterion/resolution from the aggregate types.
- node: domain/knowledge/referral
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: termsOf('action', ...)/termsOf('recipient', ...) match exactly the node's two attributes.
- node: domain/knowledge/resolution
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: declaredResolutions reads outcome and referral from both a hypothesis's and the fallback's resolution,
    matching the node's two attributes.
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  how: citesACollectedConcept()/isStructurallyValid() directly encode the rule.
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  how: citesADeclaredField() directly encodes the rule.
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: isStructurallyValid() refuses zero citations for a decided answer.
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the no-data/deadline-exceeded distinction matches the rule exactly.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: every deadline-elapsed branch degrades to inconclusive, never aborts, cited explicitly.
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: answers exactly one Evaluation per required name, cited explicitly.
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: resolveOutcome's answer is copied unchanged into outcome/referral/determining_hypothesis, cited
    explicitly.
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
  how: matches the current unconditional-breadth statement exactly; the historical note about the removed
    confirmed/fallback split is now correctly framed as past code implementing an earlier version of this
    same node, consistent with the decision log.
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: the subject-mismatch check directly encodes the rule.
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: vocabularyViolations/conceptViolations together cover the node's full five-vocabulary list.
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
  how: answerGaps checks exactly nature, output_schema and timeout, correctly scoped to what the rule
    states.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: each concept resolved fresh per call, never remembered between calls, cited explicitly.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the evaluation-side consequence (immediate no-data for non-ok evidence) is consistent with the
    scenario's then.
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the retry-or-fallback policy matches the scenario exactly, cited explicitly.
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: the pool-saturation-to-deadline-exceeded path matches the scenario, cited explicitly.
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: true
  encoded_at:
  - src/case/validate-case-coherence.ts
  how: the concept/subject-type mismatch message matches the scenario, cited explicitly.
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: cited only as history of removed code, framed in the past tense, consistent with the decision log's
    account of the rule's evolution; the scenario's own behavior lives in case-resolution.ts, outside
    this file set.
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: same as above.
notes: All 45 nodes conform. Nothing left to fix in this file set — bind everything this pass clears.
---
