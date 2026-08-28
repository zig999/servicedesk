---
contract_version: siegard-reconcile/1
title: Backend investigation/connector-status drift, final sweep
summary: '6 backend files reported as code drift by trace.py --check: src/errors/status-map.ts, src/investigation/assessment-consolidator.port.ts,
  src/investigation/draft-assessment-text.ts, src/investigation/investigation-pipeline.ts, src/persistence/relational-capability-store.repository.ts,
  src/persistence/relational-investigation-store.repository.ts. The human asked to reconcile this whole
  set against every node the trace binds each of them to.'
target: backend
files:
- path: src/errors/status-map.ts
  change: unchanged; read fresh
- path: src/investigation/assessment-consolidator.port.ts
  change: unchanged; read fresh
- path: src/investigation/draft-assessment-text.ts
  change: unchanged; read fresh
- path: src/investigation/investigation-pipeline.ts
  change: unchanged; read fresh
- path: src/persistence/relational-capability-store.repository.ts
  change: unchanged; read fresh
- path: src/persistence/relational-investigation-store.repository.ts
  change: unchanged; read fresh
nodes:
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: CapabilityIdentityNotFoundError's HTTP 404 mapping matches this node's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: the comment's references to read-connector-configuration and register-connector routes match this
    contract.
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: the comment's references to diagnose-request refusals match this contract.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: MalformedCapabilityInputSchemaError's HTTP 422 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: ConnectorConfigurationNotWellFormedError/IncompleteConnectorConfigurationError's HTTP 422 mapping
    matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: IncompleteConnectorConfigurationError's HTTP 422 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: ConnectorConfigurationNotFoundError's HTTP 404 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: ConnectorPlaceholderOutsideInputSchemaError's HTTP 422 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: SubjectDoesNotCoverCaseInputsError's HTTP 422 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: HypothesisNotInManifestError's HTTP 404 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: ConceptRefusesSubjectTypeError's HTTP 422 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: HypothesisRevisionCollectsNoConceptError's HTTP 422 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: CaseHoldsNoDraftError's HTTP 409 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: ConceptNotInGlossaryError's HTTP 404 mapping matches this rule's own statement.
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: the shared SubjectDoesNotCoverCaseInputsError mapping matches this scenario's own concrete case.
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: both files call only the published IAssessmentConsolidator interface, never an LLM or provider
    client directly.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: assessment-consolidator.port.ts imports no LLM or provider client.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
- node: domain/investigation/assessment-consolidator
  conforms: true
  how: both files' own handling of consolidate() matches this node's own Responsibility (the assessment's
    text, produced once every required hypothesis's judgment is closed).
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/evidence
  conforms: true
  how: each file threads Evidence through unread or unchanged, consistent with this node.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-capability-store.repository.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: neither file decides or recomputes outcome/referral/determining_hypothesis; both copy them unchanged
    from the case's own resolve-outcome.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: both files forward evaluations/evidence unchanged, adding nothing the case's hypotheses/criteria/when_to_use
    could reach through.
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: domain/knowledge/case-version
  conforms: true
  how: the consolidation register reaches draft-assessment-text.ts as an explicit option field, read from
    the pinned case's own consolidation_register by the caller, never by this module importing the case
    document module itself.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: the ConsolidationRegister type is threaded unchanged as an explicit option field.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/cost
  conforms: true
  how: costOf's own calls-count formula (N hypotheses + 1 writing call) matches this node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: durationsOf's own writing-present-exactly-when-consolidation-happened logic matches this node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: the subject is assembled and validated once up front (buildSubject), matching this node.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/resolution
  conforms: true
  how: resolveAndNarrow's own resolved outcome is read verbatim, never recomputed.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: enforced by buildSubject (subject.ts), reused rather than re-decided here.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: both stores run entirely through the relational connection/transaction, with no file access anywhere
    in either module.
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: this file is the store beneath the published registry service, consistent with the contract.
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability
  conforms: true
  how: ICapabilityRow/toCapability() match this node's own attribute list.
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability-nature
  conforms: true
  how: CAPABILITY_NATURE_VALUES/isCapabilityNature() match this node's own closed vocabulary.
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability-registry
  conforms: true
  how: readCapabilities() reads fresh on every call, never a cached value, matching this node's own criterion
    2.
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: a capability rewritten since the last read answers with the new value at the very next call, matching
    this rule.
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: the four row interfaces each carry exactly the columns their table declares.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/citation
  conforms: true
  how: citationStatement()/ICitationRow match this node's own attributes.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: EVALUATION_REASON_VALUES/reasonOf() match this node's own closed vocabulary.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: EVIDENCE_RESULT_VALUES/resultOf() match this node's own closed vocabulary.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/investigation
  conforms: true
  how: investigationStatement()/investigationParams()/investigationOf() assemble the whole root row consistent
    with this node.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: subjectAttributeValueStatement()/readSubjectAttributeValues() match this node.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/verdict
  conforms: true
  how: VERDICT_VALUES/verdictOf() match this node's own closed vocabulary.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: write-once is decided by the root insert's own primary key, never a read-first; no statement is
    ever an UPDATE.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/assessment
  conforms: false
  how: 'Conforms in assessment-consolidator.port.ts (the ConsolidationOutcome type/doc correctly requires
    register, usage, elapsed_ms and prompt). Does not conform in the other three files: draft-assessment-text.ts''s
    own returned Assessment ({outcome, referral, text, determining_hypothesis?}) carries none of the four
    required fields, though the consolidate() call it awaits already returns usage/elapsed_ms/prompt and
    discards them; investigation-pipeline.ts computes register/usage/elapsed_ms/prompt (via capturingConsolidator
    and its own local consolidationRegister) but routes them only into Cost/Durations/prompts.writing,
    never onto `assessment` itself; relational-investigation-store.repository.ts''s own assessmentParams()/assessmentOf()
    persist and read back only outcome/referral/determining_hypothesis/text, so the four fields are lost
    at the moment of storage even where the pipeline held them in memory. This is the same code gap a
    prior reconciliation (siegard-reconcile/reconcile-assessment-consolidator-widening.md) already found
    and left unbound over draft-assessment-text.ts alone; this reconciliation confirms it also reaches
    investigation-pipeline.ts and the persistence layer, and remains a code fix owed across all three,
    not a specification-text problem.'
  observed_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: false
  how: 'Conforms in investigation-pipeline.ts (usage/elapsed_ms presence correctly conditioned on whether
    a call happened). Does not conform in two other files: assessment-consolidator.port.ts''s own header
    comment cites domain/investigation/hypothesis-evaluator as the authority for a hypothesis''s judgment
    carrying optional usage/elapsed_ms/prompt, but that fact belongs to domain/investigation/evaluation
    -- a wrong node citation for a fact this same file cites correctly (against domain/investigation/evaluation)
    a few lines later for the identical analogy; relational-investigation-store.repository.ts''s own evaluationStatement()/evaluationOf()
    persist and read back only hypothesis/verdict/reason/citations, discarding usage, elapsed_ms and prompt
    even where a judgment call plainly happened (confirmed, refuted, judgment-failure, deadline-exceeded),
    so the one per-call record of what the provider charged and how long that hypothesis''s call took
    is lost at the moment of storage. The first is a citation fix; the second is the same class of persistence
    gap domain/investigation/assessment carries above, extended to per-hypothesis evaluations.'
  observed_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/persistence/relational-investigation-store.repository.ts
notes: 'Six delegations ran, one per file, together. 42 of the 44 unique nodes across the whole file set
  cleared. domain/investigation/assessment does not conform, confirming and widening the already-known,
  already-deferred code gap (register/usage/elapsed_ms/prompt never reaching the final Assessment) across
  draft-assessment-text.ts, investigation-pipeline.ts and relational-investigation-store.repository.ts.
  domain/investigation/evaluation also does not conform: a wrong node citation in assessment-consolidator.port.ts''s
  own comment (fixable as a small comment correction), and the same class of persistence-layer gap extended
  to per-hypothesis evaluations in relational-investigation-store.repository.ts (usage/elapsed_ms/prompt
  discarded on write). Both nodes are handed back rather than resolved here -- a corrective increment
  is the route for the persistence gaps; a comment-citation fix is the route for the misattribution.'
---

## What it is

A reconciliation of the 6 backend files trace.py --check reported as code drift, against every
node the trace binds each of them to.

## Notes

See the record's own `notes` field above for the two findings this act surfaced and did not
resolve.
