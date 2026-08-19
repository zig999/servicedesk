---
contract_version: siegard-reconcile/1
title: 'Third reconciliation of 8 investigation/case files: all stale citations resolved, one misquotation
  found'
summary: 'These 8 files'' current behavior and comments are correct as they stand. Both stale-citation
  corrective deliveries (case/hypothesis -> case-version/hypothesis-revision, across 5 files total) are
  confirmed complete: every citation of these four nodes across all 8 files is now correctly paired. This
  pass instead surfaced a different, unrelated issue: one doc comment misattributes invented text to a
  constraint node as if quoting it verbatim.'
target: backend
files:
- path: src/investigation/citation-validation.ts
  change: Checks a hypothesis's citations against its own collects array and each cited capability's output
    schema. All citations now correctly attributed (hypothesis-revision for collects).
- path: src/investigation/judgment-stage.ts
  change: Runs isolated parallel evaluate() calls per hypothesis. All case/case-version citations now
    correct; one comment misquotes constraints/hypotheses-are-judged-in-isolated-parallel-calls.
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the AssessmentConsolidator port. Unchanged since the prior pass.
- path: src/investigation/draft-assessment-text.ts
  change: Drafts the case's outcome assessment text. consolidation_register citation now correctly points
    to domain/knowledge/case-version (fixed by delivery/fix-post-case-lifecycle-stale-citations/fix-draft-assessment-citation).
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A test fake of the assessment-consolidator port. Unchanged since the prior pass.
- path: src/investigation/resolve-and-narrow-input.ts
  change: Resolves the case's confirmed hypothesis, or its fallback. All citations now correct.
- path: src/case/validate-case-coherence.ts
  change: Runs the case's full structural coherence check. All citations now correct.
- path: src/fixtures/capability/capability.json
  change: A fixture capability declaration. Unchanged since the prior pass.
nodes:
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: only the port is called; the fake is the only adapter shipped here.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: only IHypothesisEvaluator.evaluate() is called; no LLM/provider import.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: now/deadline are explicit parameters; one shared deadlineGuard timed once.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: all import only sibling plain-data types and ports.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: caseContext computed once and passed unchanged; toEvidenceItems carries only concept, result, observation,
    declaredFields.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: contracts/knowledge/capability-check
  conforms: true
  how: capabilities.readCapability(concept/name) called directly.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/vocabulary-terms
  conforms: true
  how: glossary.readVocabularyTerm, glossary.readConcept called.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/system/case-authoring
  conforms: true
  how: caseCoherenceViolations collects every violation before validateCaseCoherence refuses once, all
    at once.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/integration/capability
  conforms: true
  how: all 8 attributes present in the fixture; nature/output_schema/timeout read.
  encoded_at:
  - src/fixtures/capability/capability.json
  - src/case/validate-case-coherence.ts
  - src/investigation/judgment-stage.ts
- node: domain/integration/capability-nature
  conforms: true
  how: 'READ_ONLY_NATURE check; fixture declares nature: read-only.'
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
- node: domain/investigation/assessment
  conforms: true
  how: assembles outcome, referral, determining_hypothesis, text and nothing else.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/assessment-consolidator
  conforms: true
  how: matches the node's Responsibility.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/investigation/citation
  conforms: true
  how: concept/field checked structurally.
  encoded_at:
  - src/investigation/citation-validation.ts
- node: domain/investigation/evaluation
  conforms: true
  how: Evaluation records assembled and consumed matching the node's shape.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: no-data, deadline-exceeded, judgment-failure produced, each from its own branch.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evidence
  conforms: true
  how: consumed and checked matching the node's shape.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: evaluator.evaluate(criterion, evidenceItems, caseContext) matches the port's now-settled Responsibility.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/verdict
  conforms: true
  how: branches on confirmed/refuted/inconclusive only.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: ConsolidationRegister passed through, never inspected.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: hypothesisNamed looks a hypothesis up by name within the case, identity-only.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/referral
  conforms: true
  how: resolution.referral.action/recipient read for vocabulary checks.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/resolution
  conforms: true
  how: declaredResolutions reads each hypothesis's and the fallback's resolution.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/case-version
  conforms: true
  how: title/when_to_use, consolidation_register, when_to_use, subject/fallback/collection-plan all correctly
    cited here now.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: collects, criterion, resolution/collects all correctly cited here now.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: citesACollectedConcept / isStructurallyValid gate acceptance.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: citesADeclaredField gates acceptance.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: isStructurallyValid refuses zero citations on a decided answer.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: each inconclusive branch names a distinct reason.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: deadline overrun degrades to deadline-exceeded, never aborts.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: Promise.all over requiredNames, one Evaluation per name on every path.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: resolveOutcome's answer returned verbatim, copied unchanged.
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: NarrowedInput carries no criterion or when_to_use.
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: accepts.includes(theCase.subject) check.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: vocabularyViolations/conceptViolations check existence.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  how: answerGaps gates every collected concept's capability.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: capabilityViolations resolves fresh per call, nothing memoized.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: the no-data-evaluation-on-timeout half, matching the scenario.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: retryOrFail / isCitationValid match the scenario's worked example.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/citation-validation.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: acquireSlotOrDeadline failing returns deadlineExceededEvaluation.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: true
  how: the subject-type mismatch violation message matches the scenario.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: consumes resolveOutcome's fallback answer unchanged.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: consumes resolveOutcome's precedence-ordered answer unchanged.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: false
  how: judgeOneHypothesis's doc comment (lines ~103-109) presents "a hypothesis denied a slot makes no
    call, so it costs nothing" as if it were verbatim text of this node, in the same 'X's own "..."' convention
    the same file uses elsewhere for genuine verbatim quotes (e.g. its own fitness sentence quoted word-for-word
    two lines later). But the node's actual text is only "Each hypothesis is judged in its own call, in
    parallel, under a bounded pool." (statement) and "One provider call per hypothesis appears in the
    recorded cost, and the pool bound is configuration." (fitness) — no such sentence exists in the node.
    A reader who opens the node to verify this quotation finds nothing matching it.
  observed_at:
  - src/investigation/judgment-stage.ts
notes: '44 of 45 nodes conform. One does not: constraints/hypotheses-are-judged-in-isolated-parallel-calls,
  misquoted in judgment-stage.ts''s judgeOneHypothesis doc comment. Per the all-or-nothing rule, nothing
  binds this pass. Next: a third corrective task (same initiative/epic), then reconcile this file set
  once more.'
---
