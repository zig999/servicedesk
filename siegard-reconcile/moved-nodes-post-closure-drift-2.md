---
contract_version: siegard-reconcile/1
title: Re-reconciliation of 8 investigation/case files after the stale-citation corrective delivery
summary: These 8 files' current behavior and comments are correct as they stand. delivery/fix-post-case-lifecycle-stale-citations
  corrected 4 stale citations across 4 of these files; this reconciliation re-reads all 43 nodes the trace
  binds across the 8-file set fresh, since 4 files' digests moved and their other node-bindings went stale
  as a receipt of that bind.
target: backend
files:
- path: src/investigation/citation-validation.ts
  change: Checks a hypothesis's citations against its own collects array and each cited capability's output
    schema, refusing a citation outside collects or naming a field the schema does not declare. Doc comment
    now cites domain/knowledge/hypothesis-revision for collects (fixed by delivery/fix-post-case-lifecycle-stale-citations).
- path: src/investigation/judgment-stage.ts
  change: Runs isolated parallel evaluate() calls per hypothesis behind HypothesisEvaluator, enforcing
    the collection and judgment deadlines, refusing foreign or schema-absent citations, and building one
    verdict per hypothesis from a decided or inconclusive evaluation. Doc comments now attribute title/when_to_use/the
    pinned lookup to the case version (fixed by delivery/fix-post-case-lifecycle-stale-citations).
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the AssessmentConsolidator port and its narrowed input type, running behind an adapter
    boundary. Unchanged since the prior pass.
- path: src/investigation/draft-assessment-text.ts
  change: Drafts the case's outcome assessment text from the confirmed hypothesis, or the fallback when
    none is confirmed. Doc comment still cites domain/knowledge/case for consolidation_register, which
    belongs to domain/knowledge/case-version.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A test fake of the assessment-consolidator port. Unchanged since the prior pass.
- path: src/investigation/resolve-and-narrow-input.ts
  change: Resolves the case's confirmed hypothesis, or its fallback, and narrows the investigation's input.
    Doc comment now cites domain/knowledge/hypothesis-revision and domain/knowledge/case-version (fixed
    by delivery/fix-post-case-lifecycle-stale-citations).
- path: src/case/validate-case-coherence.ts
  change: Runs the case's full structural coherence check, collecting every violation and refusing once.
    Doc comments now cite domain/knowledge/case-version and domain/knowledge/hypothesis-revision (fixed
    by delivery/fix-post-case-lifecycle-stale-citations).
- path: src/fixtures/capability/capability.json
  change: A fixture capability declaration. Unchanged since the prior pass.
nodes:
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: which concrete adapter answers consolidate() is the caller's own choice, matching the constraint.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: one otherwise judged in its own isolated evaluate() call, under a configured pool bound.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: invoked only via evaluator.evaluate(...), no LLM/provider import.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: now and deadline arrive as explicit parameters, never a system clock read internally.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: none of the 8 files import a framework, driver, or provider client.
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
  how: caseContext passed alongside hypothesis.criterion and evidenceItems alone — nothing else crosses
    into evaluate().
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: calls only capabilities.readCapability(concept), consistent with the published read-capability
    operation.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/capability-check
  conforms: true
  how: each distinct concept resolved through the port's read-capability inside this very call.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/vocabulary-terms
  conforms: true
  how: resolved through the port's read-vocabulary-term on every call.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/system/case-authoring
  conforms: true
  how: every violation named in the one typed error, collected before one throw.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/integration/capability
  conforms: true
  how: the node's own Responsibility already states timeout in milliseconds; re-checked and confirmed
    no drift.
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
  - src/investigation/judgment-stage.ts
- node: domain/integration/capability-nature
  conforms: true
  how: 'capability.nature checked against READ_ONLY_NATURE; fixture declares nature: read-only.'
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/fixtures/capability/capability.json
- node: domain/investigation/assessment
  conforms: true
  how: determining_hypothesis present exactly where resolved.determining is defined and absent otherwise;
    the Assessment answered carries only outcome, referral, determining_hypothesis and text.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/assessment-consolidator
  conforms: true
  how: consolidate(evaluations, evidence, consolidationRegister) matches the node's Responsibility exactly.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/citation
  conforms: true
  how: citesADeclaredField checks the field exists in the output schema of the capability that produced
    that evidence.
  encoded_at:
  - src/investigation/citation-validation.ts
- node: domain/investigation/evaluation
  conforms: true
  how: the evaluation object built matches the node's attribute shape and Responsibility exactly.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: the three literal reason values (no-data, deadline-exceeded, judgment-failure) only, no others.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evidence
  conforms: true
  how: consumed correctly; no misstatement of its shape in these 8 files' own prose.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext) matches the node's now-settled
    Responsibility exactly.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/verdict
  conforms: true
  how: the three enumerated verdict values only (confirmed, refuted, inconclusive).
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: consumed correctly as a passthrough type; values not restated.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: identity-by-name lookup only (requiresEvaluationOf/theCase.hypotheses); no revision content asserted
    as belonging to this node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/referral
  conforms: true
  how: resolution.referral.action and resolution.referral.recipient match the node's two attributes exactly.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/resolution
  conforms: true
  how: declaredResolutions pairs outcome+referral per resolution, matching the node.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/case-version
  conforms: true
  how: the three citations the corrective delivery fixed (CaseContext's title/when_to_use, the case version's
    when_to_use, the collection plan) all hold on re-reading.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: the citations the corrective delivery fixed (collects, a hypothesis's own criterion, each hypothesis's
    own resolution) all hold on re-reading.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/case/validate-case-coherence.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: collects.includes(citation.concept) gates acceptance.
  encoded_at:
  - src/investigation/citation-validation.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: declaredFieldsOf(context.outputSchemas[key]).includes(citation.field) gates acceptance.
  encoded_at:
  - src/investigation/citation-validation.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: citations.length === 0 refuses confirmed/refuted acceptance.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: every inconclusive branch returns a reason literal.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: every deadline-elapsed branch returns deadlineExceededEvaluation(name), never a throw.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: requiredNames.map(...) inside Promise.all produces exactly one Evaluation per required name.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: resolveOutcome(theCase, verdicts)'s return value is used as-is, computed nowhere else.
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: consolidator.consolidate() receives no criterion and no when_to_use, only evaluations/evidence/consolidationRegister.
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/assessment-consolidator.port.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: '!resolution.concept.accepts.includes(theCase.subject) refuses a mismatch.'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: every vocabulary role and concept is checked for existence in the glossary.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  how: declaresText/declaresTimeout gate every collected concept's resolved capability.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: each concept resolved through read-capability inside this very call, never remembered between calls.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: nonOkEvidence.length > 0 returns noDataEvaluation(name, nonOkEvidence).
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: no retry once the deadline has elapsed, falling to judgment-failure, matching the scenario.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: acquireSlotOrDeadline failing returns deadlineExceededEvaluation(name).
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: true
  how: the concept/subject-type mismatch message matches the scenario's worked example.
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: resolved.determining === undefined falls back to base without determining_hypothesis.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: consumes resolveOutcome's precedence-ordered result as-is.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/knowledge/case
  conforms: false
  how: 'Lines 26-27''s doc comment reads "consolidationRegister reaches this function as an explicit field
    of its options, read from the pinned case''s own consolidation_register (domain/knowledge/case) by
    whoever calls draftAssessment" — but domain/knowledge/case.md declares only slug and next_version
    as its own attributes (explicitly: "Almost everything a curator once wrote directly onto ''the case''...
    now belongs to a specific case version... The one exception is next_version"), while domain/knowledge/case-version.md
    declares consolidation_register as its own attribute. This is the same stale-citation class delivery/fix-post-case-lifecycle-stale-citations
    fixed in four other files, left unfixed here because this file was not in that delivery''s four named
    files.'
  observed_at:
  - src/investigation/draft-assessment-text.ts
notes: '42 of 43 nodes conform. One does not: domain/knowledge/case in draft-assessment-text.ts, the same
  stale-citation class as the delivery just fixed, in a fifth file the corrective task did not name. Per
  the all-or-nothing rule, nothing binds this pass either. Next: a second corrective task (same initiative,
  same epic — draft-assessment-text.ts''s fix needs only domain/knowledge/case and domain/knowledge/case-version,
  both already in this epic''s covers), then reconcile this file set a third time.'
---
