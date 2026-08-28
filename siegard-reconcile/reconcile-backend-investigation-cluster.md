---
contract_version: siegard-reconcile/1
title: Backend investigation/evaluation cluster rebind, post relational-persistence and diagnose-input-schema-contract
summary: 14 backend files (the investigation pipeline's consolidation, judgment and persistence path,
  plus case-query.service.ts) report code drift against 76 unique bound specification nodes -- pre-existing,
  unrelated to this session's own two deliveries. The human asked to reconcile this file set as it now
  stands, holding each file to every node the trace currently binds it to.
target: backend
files:
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  change: unchanged in behavior across this reconciliation window; drift was a digest mismatch from prior
    deliveries rewriting sibling files, not an edit this reconciliation observed as a behavior change
- path: src/investigation/assessment-consolidator.port.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/draft-assessment-text.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/evaluation.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/evidence-collection-stage.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/hypothesis-evaluator.port.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/investigation-factory.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/investigation-pipeline.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/judgment-stage.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/run-diagnosis.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/persistence/relational-investigation-store.repository.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/case/case-query.service.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
nodes:
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: 'Every one of the four files calls only the published IAssessmentConsolidator interface (or implements
    it), importing no LLM/provider client directly except the one adapter file whose whole job is that
    adapter -- e.g. draft-assessment-text.ts: ''This module calls only the published IAssessmentConsolidator
    interface, never an LLM or provider client directly''.'
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: constraints/the-consolidation-prompt-is-closed
  conforms: true
  how: buildSystemPrompt/buildDataBlock and the client.messages.create call carry no `tools` field, matching
    the closed-prompt constraint.
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'Each file''s own imports are local types only, or (for the one adapter that must reach a provider/HTTP
    client) is the one file in its directory explicitly carved out to do so, e.g. anthropic-assessment-consolidator.adapter.ts:
    ''the one file in the investigation directory that imports @anthropic-ai/sdk; no domain file beside
    it does''.'
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/investigation-factory.ts
- node: domain/investigation/assessment
  conforms: false
  how: domain/investigation/assessment requires register, usage, elapsed_ms and prompt as required attributes
    of every Assessment. Two of the six files that touch this node (the two consolidator adapters, anthropic
    and fake) return all four fields from their own consolidate() call correctly. But assessment-consolidator.port.ts's
    own ConsolidationOutcome type carries text/usage/elapsed_ms/prompt and no register field, with no
    other place named for register to reach the final Assessment; draft-assessment-text.ts's own draftAssessment
    builds only {outcome, referral, determining_hypothesis, text} despite consolidationRegister being
    in scope; investigation-pipeline.ts's own assembled result keeps register/usage/elapsed_ms/prompt
    scattered across separate cost/durations/prompts.writing fields rather than on the assessment object
    itself; and relational-investigation-store.repository.ts's IInvestigationRow declares only five assessment_*
    columns (outcome, action, recipient, determining_hypothesis, text), so a stored investigation permanently
    loses register, usage, elapsed_ms and prompt with no column to hold them. The node's four required
    attributes have no consistent, complete path from a consolidate() call to a stored/returned Assessment
    across this whole chain.
  observed_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/assessment-consolidator
  conforms: false
  how: 'The node''s own Responsibility line reads (quoted verbatim by one delegation): ''Given every required
    hypothesis''s evaluation, the evidence any of their citations name, and the pinned case''s own consolidation
    register, return the assessment''s text alone.'' All four files that implement or declare this port''s
    consolidate() operation return (or declare a return type of) a four-field object -- text together
    with usage, elapsed_ms and prompt -- not the text alone the node''s Responsibility line states.'
  observed_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/investigation/usage
  conforms: true
  how: 'Both consolidator adapters'' returned/constructed usage objects match the node''s two required
    attributes exactly, e.g. fake-assessment-consolidator.adapter.ts''s ZEROED_USAGE: { input_tokens:
    0, output_tokens: 0 }.'
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/investigation/evaluation
  conforms: false
  how: 'Four of six files (assessment-consolidator.port.ts, evaluation.ts, fake-assessment-consolidator.adapter.ts,
    investigation-pipeline.ts) state or read this node''s shape correctly, including its optional usage/elapsed_ms/prompt
    fields. But judgment-stage.ts''s judgmentFailureEvaluation() drops the call record for a retry that
    did happen and was billed by the provider but whose citations failed structural validation -- it returns
    { hypothesis, verdict: ''inconclusive'', reason: ''judgment-failure'', citations: [] } with none of
    usage/elapsed_ms/prompt, even though the node conditions their presence on whether a call happened,
    not on whether its verdict was kept. And relational-investigation-store.repository.ts''s IEvaluationRow
    declares only hypothesis/verdict/reason, with no columns for usage/elapsed_ms/prompt, so every stored
    evaluation loses what its judgment call cost, took and was prompted with even though the domain Evaluation
    type itself carries those three fields.'
  observed_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/evaluation.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: true
  how: 'Each file threads Evidence through unchanged, e.g. fake-assessment-consolidator.adapter.ts: ''accepted
    and passed through unread, consistent with the fake computing nothing from it''.'
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: 'None of these three files decides or returns outcome/referral/determining_hypothesis themselves;
    each states this explicitly, e.g. assessment-consolidator.port.ts: ''Outcome, referral and the determining
    hypothesis are never decided or returned here; they are exactly what the pinned case''s own resolve-outcome
    already answered, unchanged by this call''.'
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: Both files state the same unconditional breadth in every outcome that the narrowed writing input
    itself already carries, matching the rule.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: domain/knowledge/case-version
  conforms: true
  how: draft-assessment-text.ts reads consolidationRegister from the pinned case's own consolidation_register
    via its caller; judgment-stage.ts's caseContext is built from title/when_to_use read off the Case
    (typed as a case-version's own content).
  encoded_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: draft-assessment-text.ts imports and threads the ConsolidationRegister type unchanged as an explicit
    option field.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/verdict
  conforms: true
  how: 'Each file''s own three-way verdict handling (confirmed/refuted/the third computed by Exclude<Verdict,
    ...>) matches the node''s three enumerated values without hardcoding the third, e.g. evaluation.ts:
    ''readonly verdict: Exclude<Verdict, "confirmed" | "refuted">;''.'
  encoded_at:
  - src/investigation/evaluation.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: Each file's confirmed/refuted branches require a non-empty citations tuple (readonly [Citation,
    ...Citation[]]), matching the rule exactly.
  encoded_at:
  - src/investigation/evaluation.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'Each file takes now/deadline as explicit parameters and never reads the system clock internally,
    e.g. evidence-collection-stage.ts: ''const stageCeilingMs = Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS,
    deadline - now));''.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: evidence-collection-stage.ts calls only the published observationSource.observeConcept interface;
    http-declarative-observation-source.adapter.ts is the one production adapter behind it, both consistent
    with the contract.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: evidence-collection-stage.ts and relational-investigation-store.repository.ts both state and persist
    this node's four-value enumeration correctly. But http-declarative-observation-source.adapter.ts's
    own statusMap-shape refusal message re-types the same four ending values ('ok, unavailable, denied,
    timeout') as a private string literal, even though the actual gate (isStatusEndingMap) already reads
    them from the imported EVIDENCE_RESULTS constant -- so an ending added to or removed from the node's
    own enumeration is accepted or refused correctly by the check while the operator-facing refusal text
    keeps naming the old four.
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: Each file threads Subject through unchanged, or builds it once via buildSubject and reuses the
    same object, matching the node.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: evidence-collection-stage.ts only carries an attribution comment naming this rule for the HTTP
    connector adapter's own content, with no restatement of its own. But http-declarative-observation-source.adapter.ts's
    own method-shape refusal message ('method is not one of GET, POST, PUT, PATCH, DELETE') re-types the
    rule's own accepted vocabulary as a private literal, even though the actual gate (isHttpMethod) already
    reads it from the imported HTTP_METHODS constant -- the same class of drift as the evidence-result
    finding above, in the same file.
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: Both files' unavailable-ending construction (unavailableEvidence in evidence-collection-stage.ts;
    the resolveCapability/resolveConnectorConfiguration/resolveAssembledRequest branches in http-declarative-observation-source.adapter.ts)
    match the rule.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: 'Both files compute the bound as the smaller of the capability''s own declared timeout and the
    stage''s own remaining budget, matching the rule, e.g. ''function effectiveTimeoutMsFor(capability,
    remainingBudgetMs) { return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout,
    remainingBudgetMs); }''.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: Both files pass the requester straight through to every observe-concept call, never substituting
    it, matching the rule.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: Each file answers a timeout/deadline ending rather than throwing or aborting the whole run, matching
    the rule -- e.g. judgment-stage.ts's acquireSlotOrDeadline returning a deadline-exceeded evaluation
    rather than throwing.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: Both files' totality checks (one evidence entry per concept in the collection plan) match the rule's
    invariant.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/investigation-factory.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: Each file's own timeout-ending construction matches the scenario's degrade-to-no-data outcome without
    aborting the whole collection.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: Both files' bound-computation (the smaller of capability timeout and remaining stage budget) matches
    the scenario exactly.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: http-declarative-observation-source.adapter.ts's observeConcept resolves the concept's capability
    and connector call configuration and issues exactly one HTTP call within the bound, matching the contract.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: The file's header comment cites this contract for the production HTTP adapter it implements, consistent
    with the contract's own scope.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/system/corporate-records
  conforms: true
  how: Same header citation, consistent with the contract's own scope.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability
  conforms: true
  how: effectiveTimeoutMsFor reads capability.timeout directly, matching the node's own attribute.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: outcomeFromResponse/observationOf extract and key the ok observation by the capability's own output_schema
    property names, never a field name taken from the response's own structure, matching the constraint.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: endingForStatus falls back to the 'unavailable' default ending for any status the statusMap does
    not name, matching the rule.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: outcomeFromResponse's own docstring states observation is keyed by the capability's own output_schema
    property names, matching the rule.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  conforms: true
  how: resolveAssembledRequest degrades to an unavailable outcome for a placeholder that cannot resolve,
    matching the scenario.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: Both files call/type only the published IHypothesisEvaluator interface, never a concrete evaluator
    directly.
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: false
  how: 'judgment-stage.ts''s own construction (caseContext computed once and threaded unchanged) matches
    the constraint. But hypothesis-evaluator.port.ts''s own EvidenceItem doc comment mis-numbers the closed
    prompt''s permitted content: it calls declaredFields ''the fifth permitted entry'' the constraint
    admits, but the constraint''s own statement lists the permitted content in the order criterion, evidence,
    field names, title, when_to_use -- placing field names third, not fifth. A reader counting the node''s
    own list to verify the file''s claim lands on when_to_use, not declaredFields.'
  observed_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: false
  how: 'judgment-stage.ts calls evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext) consistent
    with the node. But hypothesis-evaluator.port.ts''s own CaseContext doc comment paraphrases the node''s
    Responsibility sentence -- "given one hypothesis''s criterion and its evidence only" -- as if it excluded
    the case''s own title and when_to_use, then argues around a tension the node''s actual sentence does
    not create: the node''s own Responsibility text already states "Given one hypothesis''s criterion,
    its own evidence, and the pinned case''s title and when_to_use, return an evaluation that is cited
    and complete, never inferred," granting title/when_to_use directly rather than needing the file''s
    own narrow reading to admit them.'
  observed_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: Both files' inconclusive-branch construction always carries a reason value, matching the rule.
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: contracts/investigation/glossary-source
  conforms: true
  how: 'investigation-factory.ts''s glossary: IGlossaryQuery option and its one call (glossary.readVocabularyTerm)
    match the contract.'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: The same call passes 'subject-attribute' as the vocabulary category name, matching the node.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/investigation/investigation
  conforms: true
  how: Each file's own construction/read-back of the Investigation object's fields matches the node's
    declared shape.
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: Both files' attribute-name/value handling matches the node.
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: refuseAttributesNotInGlossary refuses any subject attribute the glossary does not hold, matching
    the rule.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: Both files state this invariant is enforced once, elsewhere, and reused rather than re-decided
    -- consistent with the rule, not a restatement that could drift from it.
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: Both files' totality checks (one evaluation per required hypothesis) match the rule's invariant.
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/replay-is-pinned
  conforms: false
  how: investigation-factory.ts and run-diagnosis.ts both state and honor this node correctly (a pinned
    case, model, prompt version and evidence, reused rather than recomputed). But case-query.service.ts's
    own replayCase and trustedCaseOf doc comments cite this node for an immutability claim -- "a version
    is written once and never altered" -- that is not what this node states (it is about what an investigation
    pins, not about a version's own immutability). The correct node for that claim is rules/knowledge/a-case-version-is-written-once,
    which is itself scoped to "A case version in released state" -- a qualifier case-query.service.ts's
    comment drops entirely, stating the guarantee unconditionally for any version passed in, which neither
    node supports and which replayCase/trustedCaseOf perform no state check to make true.
  observed_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/run-diagnosis.ts
  - src/case/case-query.service.ts
- node: domain/investigation/cost
  conforms: true
  how: Each file's own cost accumulation/read-back (calls, input_tokens, output_tokens) matches the node's
    declared attributes.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: Each file's own durations accumulation/read-back (collection, judgment, writing, total) matches
    the node's declared attributes.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/resolution
  conforms: true
  how: investigation-pipeline.ts's own resolved field carries resolveAndNarrow's own resolved outcome
    verbatim, matching the node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: judgment-stage.ts's outputSchemasFor resolves each cited concept through capabilities.readCapability,
    matching the contract.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: Both files' reason literals (no-data, deadline-exceeded, judgment-failure, and the pass-through
    of a kept outcome's own reason) match the node's enumeration.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: isStructurallyValid's own HypothesisCitationContext (built from hypothesis.collects) matches the
    rule.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: The same context's outputSchemas and toEvidenceItems' declaredFields match the rule.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: retryOrFail's retry-then-fallback-to-judgment-failure logic matches the scenario.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: judgeOneHypothesis's deadline-exceeded return when a pool slot is never granted matches the scenario.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: judgment-stage.ts's poolSize/CallPool/isolated-call structure matches the constraint directly;
    run-diagnosis.ts no longer performs this stage itself (extracted into investigation-pipeline.ts) and
    states nothing that contradicts it.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: run-diagnosis.ts never fetches or re-resolves the case itself, consistent with the constraint.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/case-source
  conforms: true
  how: The file's own header comment matches the contract's own scope (the case is already read and pinned
    by the caller).
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: The file's own header comment (correlation via ticket reference, never a matching key) matches
    the contract.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: The file's own PERSISTENCE_STAGE_BUDGET_MS (a two-second slice inside the declared total deadline)
    matches the rule.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: Both files' write-once handling (the persistence stage's own bounded write; the store's own unique-violation
    handling) match the rule.
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: run-diagnosis.ts writes the investigation before returning investigation.assessment, matching the
    rule's own ordering.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: The file raises InvestigationWriteDeadlineExceededError rather than ever answering an assessment
    with no record behind it, matching the scenario.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: The table split (investigations, investigation_evidence, investigation_evaluations, investigation_evaluation_citations,
    investigation_subject_attribute_values) mirrors the declared model's own structure, though see the
    domain/investigation/assessment and domain/investigation/evaluation findings above for the two places
    its column set falls short of the model it mirrors.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: write()/read() are both routed through runInTransaction over the injected DatabaseConnection, matching
    the constraint; the file's own header states it names no import of 'pg' directly.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/citation
  conforms: true
  how: citationStatement/citationsByHypothesis's own INSERT/read match the node's declared shape.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/a-case-is-read-whole
  conforms: true
  how: case-query.service.ts's structuralCase/assembledAsRawDocument project the whole assembled manifest,
    matching the constraint.
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: CaseQueryService implements ICaseQuery/ICaseInputRequirementsQuery with one method per declared
    operation, matching the contract.
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/system/case-authoring
  conforms: true
  how: readCase's own refusal discipline (naming every violated rule together) matches the contract.
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/case
  conforms: true
  how: Every method uses slug as the sole case-identifying parameter, consistent with the node (this read-only
    service never touches next_version/create-draft).
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: trustedManifestEntryOf keeps the hypothesis's identity separate from its revision's own content,
    matching the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: true
  how: readCaseInputRequirements derives input requirements fresh on every call over every capability
    currently registered, matching the rule.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: Every method uses slug uniformly as the sole case-identifying parameter, consistent with the rule.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: heldVersion/readCase resolve whatever version number is asked for, not only the latest, matching
    the rule.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: readCaseInputRequirements calls everyRegisteredCapability fresh on every invocation rather than
    caching it, matching the rule.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: readCase runs structural and coherence validation on every call; replayCase's own doc comment names
    the declared exception (pinned reproducibility), matching the rule.
  encoded_at:
  - src/case/case-query.service.ts
notes: '14 delegations ran, one per file. Beyond isolated comment-drift findings (rules/integration/an-http-connector-configuration-declares-its-call
  and domain/investigation/evidence-result re-typing their own accepted vocabularies as private literals
  in http-declarative-observation-source.adapter.ts; constraints/the-judgment-prompt-is-closed and domain/investigation/hypothesis-evaluator
  over a mis-numbered/narrowed paraphrase in hypothesis-evaluator.port.ts; rules/investigation/replay-is-pinned
  over a misattributed, unqualified immutability citation in case-query.service.ts), one substantive,
  recurring finding spans multiple files: domain/investigation/assessment-consolidator''s own Responsibility
  line (''return the assessment''s text alone'') is contradicted identically by all four files that implement
  or declare its consolidate() operation, each of which returns/declares a richer four-field ConsolidationOutcome
  (text, usage, elapsed_ms, prompt). That same widening does not fully reach domain/investigation/assessment,
  which requires register, usage, elapsed_ms and prompt on every Assessment: register has no path from
  consolidate()''s own input (consolidationRegister) to a final Assessment anywhere in this chain, and
  the built/stored Assessment objects (draft-assessment-text.ts, investigation-pipeline.ts, relational-investigation-store.repository.ts''s
  own DB columns) carry none of the four required fields at all. domain/investigation/evaluation shows
  the same shape narrower: judgment-stage.ts drops a real, billed retry''s own call record when its citations
  fail validation, and the persistence layer''s own table has no columns for usage/elapsed_ms/prompt on
  any evaluation. Several files'' own comments cite in-progress task identifiers (task/investigation-telemetry/widen-judgment-and-consolidation-ports,
  task/investigation-telemetry/diagnose-reports-real-cost-and-durations) as the reason these fields are
  not yet carried further -- this may be a deliberate, already-tracked mid-migration state rather than
  an undiscovered defect, and that reading is the human''s to confirm.'
---
