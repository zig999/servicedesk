---
contract_version: siegard-reconcile/1
title: Backend remaining drift, post diagnose-input-schema-contract
summary: The human asked to reconcile the 20 backend files /siegard-status reported as `code` drift (the
  remainder after the diagnose-input-schema-contract initiative's own 17-file reconciliation). None of
  these 20 files were touched by that initiative's own deliveries; they are older drift, mostly from before
  this session. Six of the 20 (case-query.service.ts, connector-request-resolver.ts, evidence-collection-stage.ts,
  http-declarative-observation-source.adapter.ts, judgment-stage.ts, run-diagnosis.ts) were already independently
  judged in the prior reconciliation over an identical node set — those judgments are reused verbatim
  rather than re-litigated, since nothing about the files or the specification moved since. The remaining
  14 were freshly judged, one specification-conformance-reviewer per file, over every node the trace currently
  binds to it (not only the subset `--check` flagged as drifted).
target: backend
files:
- path: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  change: unchanged in behavior across this window; drift was a digest mismatch
- path: src/case/case-query.service.ts
  change: already reconciled in the prior run over the same node set; included here per the human's own
    20-file list
- path: src/case/case-resolution.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/factories/diagnose.factory.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/http-connector/connector-request-resolver.ts
  change: already reconciled in the prior run over the same node set; included here per the human's own
    20-file list
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/assessment-consolidator.port.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/draft-assessment-text.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/evaluation.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/evidence-collection-stage.ts
  change: already reconciled in the prior run over the same node set; included here per the human's own
    20-file list
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/fake-hypothesis-evaluator.adapter.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: already reconciled in the prior run over the same node set; included here per the human's own
    20-file list
- path: src/investigation/hypothesis-evaluator.port.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/investigation-factory.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/investigation-pipeline.ts
  change: unchanged in behavior; drift was a digest mismatch
- path: src/investigation/judgment-stage.ts
  change: already reconciled in the prior run over the same node set; included here per the human's own
    20-file list
- path: src/investigation/run-diagnosis.ts
  change: already reconciled in the prior run over the same node set; included here per the human's own
    20-file list
- path: src/persistence/relational-investigation-store.repository.ts
  change: unchanged in behavior; drift was a digest mismatch
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since.'
  encoded_at:
  - src/case/case-query.service.ts
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: '[investigation/anthropic-assessment-consolidator.adapter.ts: OK] anthropic-assessment-consolidator.adapter.ts
    matches the node. [investigation/assessment-consolidator.port.ts: OK] assessment-consolidator.port.ts
    matches the node. [investigation/draft-assessment-text.ts: OK] draft-assessment-text.ts matches the
    node. [investigation/fake-assessment-consolidator.adapter.ts: OK] fake-assessment-consolidator.adapter.ts
    matches the node.'
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: '[investigation/run-diagnosis.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: '[investigation/http-declarative-observation-source.adapter.ts: OK] reused from the prior reconciliation''s
    judgment — unchanged since.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: '[investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since. [investigation/run-diagnosis.ts: OK] reused: no longer performs this itself (the stage moved
    out); states nothing that contradicts the node.'
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: '[investigation/anthropic-hypothesis-evaluator.adapter.ts: OK] anthropic-hypothesis-evaluator.adapter.ts
    matches the node. [investigation/fake-hypothesis-evaluator.adapter.ts: OK] fake-hypothesis-evaluator.adapter.ts
    matches the node. [investigation/hypothesis-evaluator.port.ts: OK] hypothesis-evaluator.port.ts matches
    the node. [investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment —
    unchanged since.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-consolidation-prompt-is-closed
  conforms: true
  how: '[investigation/anthropic-assessment-consolidator.adapter.ts: OK] anthropic-assessment-consolidator.adapter.ts
    matches the node.'
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: false
  how: '[investigation/evidence-collection-stage.ts: OK] reused: this file''s own stageCeilingMs computation
    matches the node (the sibling contradiction is at run-diagnosis.ts). [investigation/judgment-stage.ts:
    OK] reused: this file''s own now/deadline parameters match the node (the sibling contradiction is
    at run-diagnosis.ts). [investigation/run-diagnosis.ts: FINDING] reused finding: computes persistence''s
    own bound from the original request-entry now without subtracting time already spent by prior stages.'
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: '[__tests__/unit/domain-depends-on-no-infrastructure.spec.ts: OK] the four audited directories
    plus the two-adapter exception for judgment-runs-behind-a-port both still match the node. [http-connector/connector-request-resolver.ts:
    OK] reused from the prior reconciliation''s judgment — unchanged since. [investigation/anthropic-assessment-consolidator.adapter.ts:
    OK] anthropic-assessment-consolidator.adapter.ts matches the node. [investigation/assessment-consolidator.port.ts:
    OK] assessment-consolidator.port.ts matches the node. [investigation/fake-assessment-consolidator.adapter.ts:
    OK] fake-assessment-consolidator.adapter.ts matches the node. [investigation/fake-hypothesis-evaluator.adapter.ts:
    OK] fake-hypothesis-evaluator.adapter.ts matches the node. [investigation/http-declarative-observation-source.adapter.ts:
    OK] reused from the prior reconciliation''s judgment — unchanged since. [investigation/investigation-factory.ts:
    OK] investigation-factory.ts matches the node.'
  encoded_at:
  - src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/investigation-factory.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: '[investigation/anthropic-hypothesis-evaluator.adapter.ts: OK] anthropic-hypothesis-evaluator.adapter.ts
    matches the node. [investigation/hypothesis-evaluator.port.ts: OK] hypothesis-evaluator.port.ts matches
    the node. [investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment —
    unchanged since.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: '[persistence/relational-investigation-store.repository.ts: OK] relational-investigation-store.repository.ts
    matches the node.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: '[factories/diagnose.factory.ts: OK] every store this factory builds is built from the one given
    connection; matches the node. [persistence/relational-investigation-store.repository.ts: OK] relational-investigation-store.repository.ts
    matches the node.'
  encoded_at:
  - src/factories/diagnose.factory.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: '[investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: '[http-connector/connector-request-resolver.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: '[http-connector/connector-request-resolver.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/case-source
  conforms: true
  how: '[investigation/run-diagnosis.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: '[investigation/run-diagnosis.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/glossary-source
  conforms: true
  how: '[investigation/investigation-factory.ts: OK] investigation-factory.ts matches the node.'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since.'
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/system/case-authoring
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since.'
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/system/corporate-records
  conforms: true
  how: '[http-connector/connector-request-resolver.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: '[investigation/investigation-factory.ts: OK] investigation-factory.ts matches the node.'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/integration/capability
  conforms: true
  how: '[investigation/http-declarative-observation-source.adapter.ts: OK] reused from the prior reconciliation''s
    judgment — unchanged since.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/assessment
  conforms: false
  how: '[investigation/anthropic-assessment-consolidator.adapter.ts: OK] consolidate() answers usage/elapsed_ms/prompt
    always present on every ConsolidationOutcome, matching the node''s own ''never absent'' requirement
    for a call that always runs exactly once. [investigation/assessment-consolidator.port.ts: FINDING]
    ConsolidationOutcome carries usage/elapsed_ms/prompt but no register field, even though domain/investigation/assessment
    requires register as the call''s own record too, and domain/knowledge/case-version assigns its defaulting
    to this very adapter — nothing this call answers with can ever say which register it used when the
    version declared none. [investigation/draft-assessment-text.ts: FINDING] draftAssessment reads register,
    usage, elapsed_ms and prompt off the consolidate() answer but the object it returns carries only outcome/referral/determining_hypothesis/text
    — all four required, ''never absent'' fields the node states are dropped by the one function that
    itself cites the node as authority for the shape it returns. [investigation/fake-assessment-consolidator.adapter.ts:
    OK] the fake''s own return still carries usage/elapsed_ms/prompt (deterministic zero-valued) alongside
    text — all present, matching the node''s ''never absent'' requirement even without a real model call.
    [investigation/investigation-pipeline.ts: FINDING] usage/elapsed_ms/prompt reach the pipeline''s result
    as separate cost/durations.writing/prompts.writing fields rather than as attributes of the returned
    assessment itself, and register is held nowhere at all — the node''s own declared shape (register/usage/elapsed_ms/prompt
    as Assessment''s own attributes) doesn''t match where these facts actually live in this delivered
    record. [persistence/relational-investigation-store.repository.ts: FINDING] the row''s five assessment_*
    columns cover outcome/referral/determining_hypothesis/text but no register, usage, elapsed_ms or prompt
    column exists at all — the node''s own ''audit can replay it'' Responsibility is unmet for the consolidation
    call, whose record is silently lost between write() and read().'
  observed_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/assessment-consolidator
  conforms: false
  how: '[investigation/anthropic-assessment-consolidator.adapter.ts: OK] matches the node''s Description
    of a live-model implementation; this file''s own Responsibility reading was not itself challenged
    (the challenge is at the port/fake files). [investigation/assessment-consolidator.port.ts: FINDING]
    the node''s own Responsibility still says consolidate() ''returns the assessment''s text alone,''
    but the interface''s own ConsolidationOutcome requires usage, elapsed_ms and prompt as well — the
    Responsibility line is stale. [investigation/draft-assessment-text.ts: OK] text is exactly what the
    consolidator port answers, matching the node''s own Description (the challenge here is at domain/investigation/assessment,
    not this node). [investigation/fake-assessment-consolidator.adapter.ts: FINDING] the same stale-Responsibility
    issue as the port: ''returns the assessment''s text alone'' does not match the interface''s own required
    usage/elapsed_ms/prompt.'
  observed_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: domain/investigation/citation
  conforms: true
  how: '[persistence/relational-investigation-store.repository.ts: OK] relational-investigation-store.repository.ts
    matches the node.'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/cost
  conforms: true
  how: '[investigation/investigation-pipeline.ts: OK] investigation-pipeline.ts matches the node. [investigation/run-diagnosis.ts:
    OK] reused from the prior reconciliation''s judgment — unchanged since. [persistence/relational-investigation-store.repository.ts:
    OK] costParams/cost columns match the node.'
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: false
  how: '[investigation/investigation-pipeline.ts: OK] investigation-pipeline.ts matches the node. [investigation/run-diagnosis.ts:
    OK] reused from the prior reconciliation''s judgment — unchanged since. [persistence/relational-investigation-store.repository.ts:
    FINDING] durations_writing is typed as a plain non-nullable number and always included on read, unlike
    assessment_determining_hypothesis''s own nullable handling — a run that never reached consolidation
    reads back indistinguishably from one that measured a real writing duration.'
  observed_at:
  - src/investigation/investigation-pipeline.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: false
  how: '[investigation/anthropic-hypothesis-evaluator.adapter.ts: OK] usage/elapsed_ms/prompt travel together
    via callRecord on every path where a response actually came back; the one path usage is absent (a
    call that throws before answering) has no response to read it from at all, which is a technical impossibility
    rather than a decided departure — the opposite of the sibling finding (a completed call whose data
    is dropped). [investigation/assessment-consolidator.port.ts: OK] Evaluation is used only as an opaque
    input type; the file states no fact about its shape. [investigation/evaluation.ts: OK] the Evaluation
    union''s three branches match the node''s attributes exactly. [investigation/fake-assessment-consolidator.adapter.ts:
    OK] used only as an opaque input type; states no fact about its shape. [investigation/fake-hypothesis-evaluator.adapter.ts:
    FINDING] zeros usage/elapsed_ms unconditionally, including for a seeded no-data outcome — the one
    case the node reserves both fields'' absence for; a reader inspecting a no-data record through this
    fake sees the call marked as having happened for the exact reason it did not. [investigation/investigation-pipeline.ts:
    OK] costOf/durationsOf''s filters over evaluation.usage/elapsed_ms match the node. [investigation/judgment-stage.ts:
    FINDING] reused finding: judgmentFailureEvaluation drops a completed call''s own usage/elapsed_ms/prompt
    on the two paths where a call did complete. [persistence/relational-investigation-store.repository.ts:
    FINDING] the evaluations row/INSERT carries only hypothesis/verdict/reason — usage, elapsed_ms and
    prompt have no column and are lost on write for every verdict.'
  observed_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/evaluation.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: '[investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since. [persistence/relational-investigation-store.repository.ts: OK] relational-investigation-store.repository.ts
    matches the node.'
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: false
  how: '[investigation/assessment-consolidator.port.ts: OK] Evidence is used only as an opaque input type;
    the file states no fact about its shape. [investigation/evidence-collection-stage.ts: FINDING] reused
    finding: settles, by a convention no node states, that observation/origin/capability fields read the
    empty string when an ending carries no data. [investigation/fake-assessment-consolidator.adapter.ts:
    OK] used only as an opaque input type; states no fact about its shape. [investigation/investigation-pipeline.ts:
    OK] durationsOf''s evidence.map and evidenceByHypothesisOf''s item.concept match the node.'
  observed_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since. [persistence/relational-investigation-store.repository.ts:
    OK] relational-investigation-store.repository.ts matches the node.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: '[investigation/anthropic-hypothesis-evaluator.adapter.ts: OK] anthropic-hypothesis-evaluator.adapter.ts
    matches the node. [investigation/hypothesis-evaluator.port.ts: OK] hypothesis-evaluator.port.ts matches
    the node. [investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment —
    unchanged since.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: false
  how: '[investigation/investigation-factory.ts: OK] buildInvestigation()''s returned object matches the
    node''s declared shape. [investigation/run-diagnosis.ts: FINDING] reused finding: written_at is stamped
    from the request''s entry instant rather than the write''s own instant. [persistence/relational-investigation-store.repository.ts:
    OK] investigationOf assembles every field the node declares.'
  observed_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/investigation-factory.ts: OK] investigation-factory.ts matches the
    node. [investigation/investigation-pipeline.ts: OK] investigation-pipeline.ts matches the node. [persistence/relational-investigation-store.repository.ts:
    OK] relational-investigation-store.repository.ts matches the node.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: '[investigation/investigation-factory.ts: OK] investigation-factory.ts matches the node. [persistence/relational-investigation-store.repository.ts:
    OK] relational-investigation-store.repository.ts matches the node.'
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/usage
  conforms: true
  how: '[investigation/anthropic-assessment-consolidator.adapter.ts: OK] anthropic-assessment-consolidator.adapter.ts
    matches the node. [investigation/anthropic-hypothesis-evaluator.adapter.ts: OK] anthropic-hypothesis-evaluator.adapter.ts
    matches the node. [investigation/fake-assessment-consolidator.adapter.ts: OK] fake-assessment-consolidator.adapter.ts
    matches the node. [investigation/fake-hypothesis-evaluator.adapter.ts: OK] fake-hypothesis-evaluator.adapter.ts
    matches the node.'
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
- node: domain/investigation/verdict
  conforms: false
  how: '[case/case-resolution.ts: FINDING] the local Verdict type restates the node''s three-value enumeration
    with no citation back to it, unlike this file''s own CASE_VERSION_STATES sibling which does cite its
    node — a silent, driftable duplication rather than a value mismatch. [investigation/evaluation.ts:
    OK] the three verdict literals cover exactly the enumeration''s three values. [investigation/hypothesis-evaluator.port.ts:
    OK] referenced through the imported Verdict type consistently with the node. [investigation/judgment-stage.ts:
    OK] reused from the prior reconciliation''s judgment — unchanged since. [persistence/relational-investigation-store.repository.ts:
    OK] relational-investigation-store.repository.ts matches the node.'
  observed_at:
  - src/case/case-resolution.ts
  - src/investigation/evaluation.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/case
  conforms: false
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since. [case/case-resolution.ts: FINDING] three doc comments cite this node for resolve-outcome''s
    own behavior, but domain/knowledge/case now holds only slug and next_version — the fact belongs to
    domain/knowledge/case-version, per the decision log''s own case/case-version split.'
  observed_at:
  - src/case/case-query.service.ts
  - src/case/case-resolution.ts
- node: domain/knowledge/case-version
  conforms: false
  how: '[case/case-resolution.ts: FINDING] the same three-comment citation error as domain/knowledge/case
    above: the module header correctly cites case-version, but three inner comments still say domain/knowledge/case.
    [investigation/draft-assessment-text.ts: OK] correctly cites case-version for where consolidationRegister
    comes from. [investigation/investigation-pipeline.ts: FINDING] defaultConsolidationRegister''s own
    comment cites domain/knowledge/case for the register-defaulting fact, but that fact now lives in domain/knowledge/case-version
    per the case/case-version split. [investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s
    judgment — unchanged since.'
  observed_at:
  - src/case/case-resolution.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: '[investigation/draft-assessment-text.ts: OK] draft-assessment-text.ts matches the node.'
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since. [case/case-resolution.ts: OK] case-resolution.ts''s use of hypothesis names still
    matches the node.'
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/case-resolution.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: '[case/case-resolution.ts: OK] case-resolution.ts still matches the node''s own shape/behavior.'
  encoded_at:
  - src/case/case-resolution.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: '[case/case-resolution.ts: OK] case-resolution.ts still matches the node''s own shape/behavior.'
  encoded_at:
  - src/case/case-resolution.ts
- node: domain/knowledge/referral
  conforms: true
  how: '[case/case-resolution.ts: OK] case-resolution.ts still matches the node''s own shape/behavior.'
  encoded_at:
  - src/case/case-resolution.ts
- node: domain/knowledge/resolution
  conforms: true
  how: '[case/case-resolution.ts: OK] case-resolution.ts still matches the node''s own shape/behavior.
    [investigation/investigation-pipeline.ts: OK] investigation-pipeline.ts matches the node.'
  encoded_at:
  - src/case/case-resolution.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: false
  how: '[http-connector/connector-request-resolver.ts: FINDING] this file''s own reading is clean (subjectAttributePlaceholderNamesIn
    matches the rule''s subject-attribute-only scope), but the node overall carries an unresolved finding
    from the sibling reconciliation (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md):
    the rule never states how the check resolves once more than one capability shares a connector, surfaced
    through connector-configuration-registry.service.ts, a file outside this reconciliation''s own set.
    Carried forward rather than silently re-cleared through a narrower view.'
  observed_at:
  - src/http-connector/connector-request-resolver.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: '[investigation/http-declarative-observation-source.adapter.ts: OK] reused from the prior reconciliation''s
    judgment — unchanged since.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: '[investigation/http-declarative-observation-source.adapter.ts: OK] reused from the prior reconciliation''s
    judgment — unchanged since.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: '[investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: '[investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: '[investigation/anthropic-hypothesis-evaluator.adapter.ts: OK] anthropic-hypothesis-evaluator.adapter.ts
    matches the node. [investigation/evaluation.ts: OK] the confirmed/refuted branches both type citations
    as a non-empty tuple, matching the invariant. [investigation/hypothesis-evaluator.port.ts: OK] hypothesis-evaluator.port.ts
    matches the node. [investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/evaluation.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: '[case/case-resolution.ts: OK] case-resolution.ts still matches the node''s own shape/behavior.'
  encoded_at:
  - src/case/case-resolution.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: '[investigation/investigation-factory.ts: OK] investigation-factory.ts matches the node.'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: '[investigation/investigation-factory.ts: OK] delegated to subject.ts''s buildSubject, per the
    module''s own comment; states nothing that departs. [investigation/investigation-pipeline.ts: OK]
    delegated to subject.ts, referenced only in comment; states nothing that departs.'
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: '[investigation/run-diagnosis.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: '[investigation/anthropic-hypothesis-evaluator.adapter.ts: OK] anthropic-hypothesis-evaluator.adapter.ts
    matches the node. [investigation/hypothesis-evaluator.port.ts: OK] hypothesis-evaluator.port.ts matches
    the node. [investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment —
    unchanged since.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: '[investigation/run-diagnosis.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since. [persistence/relational-investigation-store.repository.ts: OK] relational-investigation-store.repository.ts
    matches the node.'
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: '[http-connector/connector-request-resolver.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s
    judgment — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused
    from the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/judgment-does-not-infer
  conforms: true
  how: '[investigation/anthropic-hypothesis-evaluator.adapter.ts: OK] anthropic-hypothesis-evaluator.adapter.ts
    matches the node.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: false
  how: '[investigation/evidence-collection-stage.ts: FINDING] reused finding: invents specific result_detail
    wording for a timeout that no node states content for. [investigation/http-declarative-observation-source.adapter.ts:
    OK] reused: this file''s own TIMED_OUT handling matches the node (the sibling contradiction is at
    run-diagnosis.ts and evidence-collection-stage.ts). [investigation/judgment-stage.ts: OK] reused:
    this file''s own synthesized-Evaluation-on-every-deadline-path matches the node (the sibling contradiction
    is at evidence-collection-stage.ts and run-diagnosis.ts). [investigation/run-diagnosis.ts: FINDING]
    reused finding: attempts exactly one write despite the node''s own ''retries within what remains.'''
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: false
  how: '[investigation/investigation-factory.ts: FINDING] evaluationTotalityViolations() likewise refuses
    an evaluation naming a hypothesis the case does not require — the rule states only the required-hypothesis
    side, not this one. [investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s
    judgment — unchanged since.'
  observed_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: false
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/investigation-factory.ts: FINDING] evidenceTotalityViolations()
    refuses evidence naming a concept outside the collection plan — a stricter condition the rule itself
    is silent about (it states only that the plan''s own concepts each need exactly one entry).'
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since. [investigation/investigation-factory.ts: OK] investigation-factory.ts matches the
    node. [investigation/run-diagnosis.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/case/case-query.service.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: '[investigation/assessment-consolidator.port.ts: OK] assessment-consolidator.port.ts matches the
    node. [investigation/draft-assessment-text.ts: OK] draft-assessment-text.ts matches the node. [investigation/fake-assessment-consolidator.adapter.ts:
    OK] fake-assessment-consolidator.adapter.ts matches the node.'
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: '[investigation/run-diagnosis.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: '[investigation/assessment-consolidator.port.ts: OK] assessment-consolidator.port.ts matches the
    node. [investigation/draft-assessment-text.ts: OK] draft-assessment-text.ts matches the node.'
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since.'
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since.'
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: false
  how: '[case/case-query.service.ts: FINDING] reused finding: cites this retention-only node for an immutability
    fact that belongs to rules/knowledge/a-case-version-is-written-once.'
  observed_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: '[case/case-resolution.ts: OK] case-resolution.ts still matches the node''s own shape/behavior.'
  encoded_at:
  - src/case/case-resolution.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since.'
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: '[case/case-query.service.ts: OK] reused from the prior reconciliation''s judgment (siegard-reconcile/diagnose-input-schema-contract-post-delivery-drift.md)
    — unchanged since.'
  encoded_at:
  - src/case/case-query.service.ts
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  conforms: true
  how: '[investigation/http-declarative-observation-source.adapter.ts: OK] reused from the prior reconciliation''s
    judgment — unchanged since.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since. [investigation/judgment-stage.ts: OK] reused
    from the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: '[investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: '[investigation/judgment-stage.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  conforms: true
  how: '[case/case-resolution.ts: OK] delegated to simulate-hypothesis''s own narrowing, mentioned only
    in a comment; states nothing that departs from the scenario.'
  encoded_at:
  - src/case/case-resolution.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: '[investigation/evidence-collection-stage.ts: OK] reused from the prior reconciliation''s judgment
    — unchanged since. [investigation/http-declarative-observation-source.adapter.ts: OK] reused from
    the prior reconciliation''s judgment — unchanged since.'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: '[investigation/run-diagnosis.ts: OK] reused from the prior reconciliation''s judgment — unchanged
    since.'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: '[case/case-resolution.ts: OK] case-resolution.ts still matches the node''s own shape/behavior.'
  encoded_at:
  - src/case/case-resolution.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: '[case/case-resolution.ts: OK] case-resolution.ts still matches the node''s own shape/behavior.'
  encoded_at:
  - src/case/case-resolution.ts
notes: 'This reconciliation surfaced a cluster of related, previously-undiscovered findings around the
  investigation/judgment write-telemetry: domain/investigation/assessment, domain/investigation/assessment-consolidator,
  domain/investigation/evaluation, and domain/investigation/durations each have gaps between what the
  node requires (register/usage/elapsed_ms/prompt, always present) and what several producers (draft-assessment-text.ts,
  the fake adapters) and the one consumer (relational-investigation-store.repository.ts) actually carry
  or persist — the same shape of gap recurring at the writing side, the fake-adapter side, and the persistence
  side independently. rules/integration/a-connector-placeholder-is-declared-by-its-capability''s finding
  is carried forward from the sibling reconciliation rather than re-derived, since the ambiguity surfaces
  through a file (connector-configuration-registry.service.ts) outside this reconciliation''s own 20-file
  set.'
---
