---
contract_version: siegard-reconcile/1
title: Backend investigation/judgment/persistence and glossary/connector-registry cluster, code-drift reconciliation
summary: |-
  19 backend files reported code drift by `trace.py --check` (surfaced by a `/siegard-status`
  reading) against 85 unique bound specification nodes, pre-existing and unrelated to any edit
  made in this session -- the working tree was clean before this reconciliation began. The human
  asked to reconcile exactly this file set, holding each file to every node the trace currently
  binds it to, as its content now stands.
target: backend
files:
- path: src/connector-registry/connector-configuration-store.port.ts
  change: |-
    unchanged in this session; reported as code drift against its own two bindings, reconciled at
    its current content
- path: src/errors/status-map.ts
  change: |-
    unchanged in this session; the map's current entries were reconciled against the eighteen
    rule/scenario/contract nodes the trace binds it to
- path: src/factories/production-simulate-hypothesis.factory.ts
  change: |-
    unchanged in this session; wires the production simulate-hypothesis operation with a
    twenty-second `TOTAL_DEADLINE_BUDGET_MS` constant of its own
- path: src/factories/simulate.factory.ts
  change: |-
    unchanged in this session; wires the production case-simulation operation reusing the full
    investigation pipeline
- path: src/http/dto/register-concept.dto.ts
  change: |-
    unchanged in this session; the concept-registration body schema carries a `.positive()` bound
    on `ttl`
- path: src/http/read-concept.controller.ts
  change: |-
    unchanged in this session; reconciled at its current content
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: |-
    unchanged in this session; the provider adapter's call-record and no-data/judgment-failure
    construction were reconciled at their current content
- path: src/investigation/assessment-consolidator.port.ts
  change: |-
    unchanged in this session; the port's `ConsolidationOutcome` return type was reconciled at its
    current four-field shape
- path: src/investigation/citation-validation.ts
  change: |-
    unchanged in this session; `acceptedCitations` exports a filtered-subset outcome alongside the
    membership predicate
- path: src/investigation/draft-assessment-text.ts
  change: |-
    unchanged in this session; `draftAssessment` reads the consolidation call's answer for its text
    alone and constructs a four-field Assessment
- path: src/investigation/evidence-collection-stage.ts
  change: |-
    unchanged in this session; the collection stage's rejection handling, ttl default and
    unresolved/timeout ending construction were reconciled at their current content
- path: src/investigation/field-semantics.ts
  change: |-
    unchanged in this session; reconciled at its current content
- path: src/investigation/hypothesis-evaluator.port.ts
  change: |-
    unchanged in this session; reconciled at its current content
- path: src/investigation/investigation-pipeline.ts
  change: |-
    unchanged in this session; the assembled result carries a separate `prompts.writing` field and
    a `durations.total` computed as the sum of two stage figures
- path: src/investigation/judgment-stage.ts
  change: |-
    unchanged in this session; the per-hypothesis judgment path's inconclusive short-circuit,
    unreachable-name/evidence guards, no-data citation construction and judgment-failure
    construction were reconciled at their current content
- path: src/investigation/run-diagnosis.ts
  change: |-
    unchanged in this session; `written_at`, the persistence stage's elapsed-time reconstruction and
    the write-once retry handling were reconciled at their current content -- this is the file the
    two most recent decision-log entries (persistence-stage-bound-at-zero-or-below, and a duplicate
    write counting as settled) bear most directly on
- path: src/investigation/simulate-hypothesis-pipeline.ts
  change: |-
    unchanged in this session; the judgment stage's deadline clamp and `durations.total` were
    reconciled at their current content
- path: src/persistence/relational-connector-configuration-store.repository.ts
  change: |-
    unchanged in this session; reconciled at its current content, including its own
    store-failure-raising helpers
- path: src/persistence/relational-investigation-store.repository.ts
  change: |-
    unchanged in this session; the assessment/duration/evaluation column sets, the legacy-evidence
    read, the write-once unique-violation handling and the `ticket_ref` read were reconciled at
    their current content -- the other file the two most recent decision-log entries bear on
    directly
nodes:
- node: constraints/consolidation-runs-behind-a-port
  conforms: true
  how: |-
    Both files call only the published IAssessmentConsolidator interface: assessment-consolidator.port.ts
    (the interface declaration itself, lines 13-19) and draft-assessment-text.ts (the sole
    consolidate() call, line 21).
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: |-
    run-diagnosis.ts's runDiagnosis awaits the pipeline, the build and the write within one call and
    returns the assessment as its own return value; no job, queue or handle is produced.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: |-
    judgment-stage.ts's CallPool and per-hypothesis fan-out (lines 29-44, 158-184) match the
    constraint directly; run-diagnosis.ts states nothing that contradicts it.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: |-
    All three files call or type only the published IHypothesisEvaluator interface -- the adapter
    class declaration (anthropic-hypothesis-evaluator.adapter.ts, line 34), the port's own type-only
    import (hypothesis-evaluator.port.ts, lines 1-6), and the one evaluate() call site
    (judgment-stage.ts, line 85).
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: |-
    status-map.ts's [CapabilityIdentityNotFoundError, 404] entry (line 42) matches the constraint.
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: false
  how: |-
    evidence-collection-stage.ts (line 33) and judgment-stage.ts (lines 21-23, 28, 143-156) both
    take now/deadline as explicit inputs and clamp correctly. But run-diagnosis.ts's
    persistenceStageBoundMs (line 89) does not read the remaining time against the clock at all --
    it reconstructs "what should be left" by subtracting the three recorded stage durations
    (collection + judgment + writing) from the entry instant, which excludes every gap between
    stages and the pipeline's own setup and build; the constraint's own Description names exactly
    this failure mode ("Summing stage budgets and calling the sum a deadline leaves nothing for the
    overhead between stages"). And simulate-hypothesis-pipeline.ts's judgment clamp (line 66,
    `Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS)`) anchors judgment's window
    to the run's entry instant rather than to the instant judgment actually begins, so whatever
    collection spent is subtracted from judgment's own nominal slice instead of being weighed
    against the time genuinely left -- the collection stage returns no balance to judgment, which
    the constraint's own description names as the reason it is written as a propagated instant
    rather than a set of independent budgets.
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: false
  how: |-
    connector-configuration-store.port.ts (its one import, a sibling domain type) and
    assessment-consolidator.port.ts (lines 1-4, type-only domain imports) both hold this
    constraint cleanly. relational-connector-configuration-store.repository.ts also holds it on
    its own imports (lines 1-15, dependency inward only, driver calls confined to
    database-access.js) -- but that same file carries an unattributed finding (see
    contracts/integration/connector-configuration-registry below, and this reconciliation's own
    notes): its judge reported that the file's own store-failure error identity and its
    'read'/'write' operation vocabulary are stated nowhere in the specification, and named no
    single node it belongs to. Per this reconciliation's own transcription rule, a finding naming
    no node lands on every node the file was judged against, which is why this node -- whose own
    reading in that file was otherwise clean -- is not bound here. The substance of the finding is
    unrelated to dependency direction; see the notes field.
  observed_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: |-
    All three files' prompt construction admits only the criterion, the evidence and the case
    context, and no `tools` field reaches the provider call -- anthropic-hypothesis-evaluator.adapter.ts
    (lines 133-150, 66-71), hypothesis-evaluator.port.ts (lines 45-49), judgment-stage.ts (line 31,
    lines 201-209).
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: |-
    Every column in relational-investigation-store.repository.ts's own INSERT/read set pairs with a
    declared attribute, drawing from more than one element where the constraint permits it
    (assessment_action/assessment_recipient from domain/knowledge/referral, subject_type from
    domain/investigation/subject). The costlier direction the constraint also states -- a required
    attribute no column holds -- does not hold for four of domain/investigation/assessment's own
    attributes; that shortfall is filed once, against the node that declares them, rather than
    against this constraint as well.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: false
  how: |-
    relational-investigation-store.repository.ts's two entry points both answer from the one
    injected connection inside a transaction (lines 104, 108), and relational-connector-configuration-store.repository.ts's
    reads and writes are both SQL statements over the same injected connection (lines 18-31) -- both
    readings were clean on this node specifically. It is unbound here for the same reason
    constraints/the-domain-depends-on-no-infrastructure is: the connector-configuration store's
    judge filed an unattributed finding (its store-failure error identity and vocabulary), which
    this reconciliation's own transcription rule lands on every node that file was judged against.
  observed_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: |-
    register-concept.dto.ts's two schemas (lines 3-5, 9-13) are the wire shape of the contract's one
    declared operation, register-concept, and state no operation the contract does not declare.
  encoded_at:
  - src/http/dto/register-concept.dto.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: |-
    read-concept.controller.ts's handler (lines 13-16) is the synchronous port read of one concept
    by name, with the unheld name turned into a refusal.
  encoded_at:
  - src/http/read-concept.controller.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: |-
    judgment-stage.ts states no operation of the registry's own surface; the field vocabulary
    reaching the evaluator comes off the evidence item, and the module's imports name no registry.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: contracts/integration/connector-configuration-registry
  conforms: false
  how: |-
    connector-configuration-store.port.ts's two store methods (lines 5, 7) serve the contract's
    operations without stating any of the surface facts (name lookup, paging, registration)
    themselves, and status-map.ts's own map declares one status lookup and no operation -- both
    readings were clean. relational-connector-configuration-store.repository.ts's own three
    operations were likewise read cleanly against this node, but that file's judge filed an
    unattributed store-failure finding that this reconciliation's transcription rule lands on
    every node the file was judged against, including this one; see the notes field for the
    finding's own substance.
  observed_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/errors/status-map.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: |-
    All three files wire the same collection/judgment/(consolidation where applicable) engine reuse
    and state no operation's own shape, no case-version state condition and no refusal --
    production-simulate-hypothesis.factory.ts (lines 29-52), simulate.factory.ts (lines 34-51),
    simulate-hypothesis-pipeline.ts (lines 38-42, 48-49).
  encoded_at:
  - src/factories/production-simulate-hypothesis.factory.ts
  - src/factories/simulate.factory.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: contracts/investigation/case-source
  conforms: true
  how: |-
    run-diagnosis.ts's own header/shape states the case arrives already read and pinned, matching
    the contract's own scope.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: |-
    status-map.ts declares one status lookup and no operation (a clean absence). run-diagnosis.ts's
    RunDiagnosisOptions and return type (lines 17-34) are the one synchronous operation the contract
    declares.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: |-
    evidence-collection-stage.ts's parallel fan-out (lines 35-39) and its single consumed call per
    concept (line 69) match the contract.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: domain/glossary/concept
  conforms: false
  how: |-
    read-concept.controller.ts's four-attribute response (lines 17-22) matches the node exactly.
    register-concept.dto.ts's schema matches on name, accepts and description, but its ttl field
    (line 11, `z.number().int().positive().optional()`) adds a lower bound the node does not state
    -- the node declares ttl only `type: integer`, `required: true`, with no floor, and no sibling
    node states one either (rules/knowledge/a-collected-concept-declares-a-ttl states only the
    default for an absent ttl). What a registration stating `ttl: 0` or a negative ttl answers is
    therefore decided by this schema alone, becoming a validation-error refusal no glossary node
    chose.
  observed_at:
  - src/http/dto/register-concept.dto.ts
  - src/http/read-concept.controller.ts
- node: domain/integration/connector-configuration
  conforms: false
  how: |-
    relational-connector-configuration-store.repository.ts's row and value-object shape (lines 7-10,
    35-37) match the node's two attributes exactly, with the configuration column's text
    representation matching the decision-log's own entry. Unbound here only because the same
    file's unattributed store-failure finding lands on every node it was judged against; see notes.
  observed_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: domain/integration/connector-configuration-registry
  conforms: false
  how: |-
    relational-connector-configuration-store.repository.ts's register-connector write (lines 39-46)
    is a clean replace-whole-on-edit keyed on the connector name, stating no fact the node does not
    hold. Unbound here only because the same file's unattributed store-failure finding lands on
    every node it was judged against; see notes.
  observed_at:
  - src/persistence/relational-connector-configuration-store.repository.ts
- node: domain/investigation/assessment
  conforms: false
  how: |-
    Four separate files diverge from this node's four required call-record attributes (register,
    usage, elapsed_ms, prompt) in four different ways. assessment-consolidator.port.ts's own
    ConsolidationOutcome return type (lines 6-11) carries text/usage/elapsed_ms/prompt but no
    register, and its non-optional register parameter (line 18) forecloses the adapter-default path
    the node and domain/knowledge/case-version both permit. draft-assessment-text.ts reads only
    `text` off the consolidation call (line 21) and constructs a four-field value (outcome,
    referral, text, conditional determining_hypothesis) with none of the four call-record
    attributes. investigation-pipeline.ts (lines 48-50, 79) returns the writing prompt on a
    sibling `prompts.writing` field instead of on the assessment itself, so which of two places is
    authoritative for the assessment's required `prompt` is undecided. relational-investigation-store.repository.ts
    writes and reads five of the node's nine attributes (lines 36-40, 156, 423-430) and holds no
    column at all for register, usage, elapsed_ms or prompt, so a stored investigation cannot answer
    which register produced its text, what the writing call cost, how long it took, or what it was
    prompted with.
  observed_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/assessment-consolidator
  conforms: false
  how: |-
    assessment-consolidator.port.ts's own operation (lines 15-19) matches the node's inputs and
    Responsibility exactly. draft-assessment-text.ts's single call (line 21) narrows the answer it
    reads to `text` alone, discarding the usage, elapsed_ms and prompt the node's Responsibility
    line says the same call also produces -- so those three facts are computed by the port and
    dropped at this call site.
  observed_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: domain/investigation/citation
  conforms: true
  how: |-
    citation-validation.ts's two predicates read exactly the node's two attributes (concept, field)
    and nothing else (lines 22-32); relational-investigation-store.repository.ts's citationStatement/citationsByHypothesis
    (lines 213-218, 337) write and read the same pair and nothing more.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/cost
  conforms: true
  how: |-
    investigation-pipeline.ts's costOf (lines 101-109), run-diagnosis.ts (threaded unchanged) and
    relational-investigation-store.repository.ts's cost columns (line 160, 412) all match the
    node's three required attributes.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: false
  how: |-
    Four files diverge from this node in four related ways. investigation-pipeline.ts's `total`
    (line 114) is the sum of the three measured stage figures, which the node's own rationale
    ("who is exceeding the declared total budget") cannot support once overhead between stages is
    excluded. run-diagnosis.ts's persistenceStageBoundMs (line 88) sums `durations.writing`
    unconditionally even though the node makes `writing` present only when a consolidation call
    happened, so a run that never reaches consolidation can sum `NaN` into its remaining-time
    arithmetic. simulate-hypothesis-pipeline.ts's own `total` (line 83) is the same two-stage-sum
    undercount as investigation-pipeline.ts's. relational-investigation-store.repository.ts's
    `durations_writing` column (line 46) is declared non-nullable and always written and read, so a
    run that never reached consolidation is stored, and read back, carrying an invented writing
    duration for a call that never happened -- the exact case the node's own text refuses.
  observed_at:
  - src/investigation/investigation-pipeline.ts
  - src/investigation/run-diagnosis.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: false
  how: |-
    anthropic-hypothesis-evaluator.adapter.ts (lines 78-82), assessment-consolidator.port.ts (line
    16) and investigation-pipeline.ts (lines 102, 113) all read/construct this node's shape
    correctly, including its optional usage/elapsed_ms/prompt. But judgment-stage.ts's
    judgmentFailureEvaluation (lines 240-242) drops the call record for a retry that did happen and
    was billed by the provider but whose citations failed structural validation, even though the
    node conditions those three fields' presence on whether a call happened, not on whether its
    verdict survived validation. And relational-investigation-store.repository.ts's IEvaluationRow
    (lines 67-71) declares only hypothesis/verdict/reason, with no columns for usage, elapsed_ms or
    prompt, so every stored evaluation loses the per-hypothesis call cost the domain type itself
    carries.
  observed_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: |-
    judgment-stage.ts's three inconclusive constructors (lines 227-242) and relational-investigation-store.repository.ts's
    closed-set read (line 83, 206, 365-377) both hold the node's three-value enumeration from its one
    imported home, refusing rather than widening a value outside it.
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: false
  how: |-
    assessment-consolidator.port.ts (line 17) and investigation-pipeline.ts (lines 112, 151) both
    thread this node's shape through unchanged. evidence-collection-stage.ts diverges in three
    places: a rejected observation call (lines 123-126) propagates as a thrown exception rather than
    a recorded evidence result, the one outcome the node says collection never produces; an item
    whose capability never resolved (line 173) records an empty origin and an empty capability
    name/version, a reading the node states for fields and concept_description but not for origin
    or the capability reference; and a timed-out item's result_detail (line 194) is a free-text
    string composed in code rather than a named condition the way every other result_detail in this
    file is. relational-investigation-store.repository.ts also diverges: its row type (lines 62-64)
    declares elapsed_ms, fields and concept_description non-nullable and reads each straight through,
    where the node states a legacy item (collected before these attributes existed) reads elapsed_ms
    as 0 and the other two as honest-empty rather than as a read failure or an invented value; this
    file's own type makes that reading impossible to express.
  observed_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/investigation-pipeline.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: |-
    evidence-collection-stage.ts's settledEvidence (lines 193-202) and relational-investigation-store.repository.ts's
    closed-set read (line 79, 299-308) both hold the node's four-value enumeration from its one
    imported home.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: |-
    field-semantics.ts's own type and structural read (lines 3-27) match the node exactly;
    evidence-collection-stage.ts (line 90) and relational-investigation-store.repository.ts (lines
    192, 294) both thread the result through unchanged.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/field-semantics.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: |-
    All three files declare or call exactly the node's one operation over one hypothesis's criterion
    and its own evidence -- anthropic-hypothesis-evaluator.adapter.ts (lines 45-49),
    hypothesis-evaluator.port.ts (lines 43-50), judgment-stage.ts (lines 85, 114).
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: false
  how: |-
    run-diagnosis.ts's buildInvestigationOptions (lines 49-66) assembles every declared attribute
    once with no later mutation, but its `written_at` (line 64) is stamped from `options.now` -- the
    instant the request was admitted -- rather than from the instant the write actually settles,
    contradicting the node's own "written_at records when the one write happened" and the
    decision-log entry that added it ("the one fact an audit cannot recover from any other
    attribute"). relational-investigation-store.repository.ts holds every other attribute correctly
    but converts an absent `ticket_ref` to an empty string on read (line 403,
    `row.ticket_ref ?? ''`), destroying the optional/absent distinction the node declares --
    unlike `result_detail` and `determining_hypothesis` two attribute-slots away in the same file,
    which are both spread conditionally to preserve absence.
  observed_at:
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: |-
    All three files pass the whole assembled subject through with no per-concept filtering --
    evidence-collection-stage.ts (line 69), investigation-pipeline.ts (line 64, 121-131),
    simulate-hypothesis-pipeline.ts (line 47, 52).
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: |-
    relational-investigation-store.repository.ts writes and reads one governed attribute name paired
    with one free value (lines 167-172, 256-266), enumerating no attribute name of its own.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/usage
  conforms: false
  how: |-
    anthropic-hypothesis-evaluator.adapter.ts's call record (line 61,
    `outcomeFromModelText(textOf(message), { usage: message.usage, ... })`) hands the provider
    SDK's own usage object through structurally instead of projecting it onto the node's two
    declared attributes (input_tokens, output_tokens), so whatever else the SDK's usage type carries
    travels into the domain value unfiltered.
  observed_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: domain/investigation/verdict
  conforms: true
  how: |-
    All three files' three-way handling (confirmed/refuted/the computed third) matches the node's
    enumeration without hardcoding the third value -- hypothesis-evaluator.port.ts (lines 16, 23,
    30), judgment-stage.ts (lines 246-252, 89, 118), relational-investigation-store.repository.ts
    (line 81, 354-363).
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/case-version
  conforms: false
  how: |-
    draft-assessment-text.ts states nothing of the version's own facts, correctly (the resolve
    outcome and the register both arrive already settled). But judgment-stage.ts's hypothesisNamed
    (line 214) throws a bare, hand-written Error when a required name resolves to no hypothesis in
    the case -- a condition the node's own requires-evaluation-of derivation should make
    unreachable, but one no node states an answer for if it is ever reached; every other refusal
    this specification decided names its response and its error value, and this one names neither.
  observed_at:
  - src/investigation/draft-assessment-text.ts
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: |-
    draft-assessment-text.ts imports and threads the ConsolidationRegister type unchanged (lines 4,
    13), restating none of its enumerated values.
  encoded_at:
  - src/investigation/draft-assessment-text.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: |-
    citation-validation.ts reads only the node's `collects` attribute (line 5, 23), and
    simulate-hypothesis-pipeline.ts narrows the case to the one named revision's manifest entry
    (lines 48-49) without restating its collects or criterion.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: domain/knowledge/resolution
  conforms: true
  how: |-
    investigation-pipeline.ts's resolveAndNarrow call (line 68) pairs one outcome with one referral
    from the case's own resolution and never re-decides it.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: |-
    status-map.ts's [ConceptDescriptionRequiredError, 422] entry (line 65) holds the rule's refusal;
    register-concept.dto.ts's optional description (line 11) states neither the refusal nor its
    status and does not contradict either.
  encoded_at:
  - src/errors/status-map.ts
  - src/http/dto/register-concept.dto.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: |-
    status-map.ts's [MalformedCapabilityInputSchemaError, 422] entry (line 58) matches the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: |-
    status-map.ts's two 422 entries (lines 59-60) match the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: |-
    status-map.ts's [IncompleteConnectorConfigurationError, 422] entry (line 60) matches the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: |-
    status-map.ts's [ConnectorConfigurationNotFoundError, 404] entry (line 40) matches the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: |-
    status-map.ts's [ConnectorPlaceholderOutsideInputSchemaError, 422] entry (line 62) matches the
    rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: |-
    evidence-collection-stage.ts issues no HTTP call and authors no call descriptor; it records the
    unavailable ending and result detail the observation source returns unchanged (line 200), which
    is where this rule's own facts sit rather than here.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: |-
    evidence-collection-stage.ts answers the no-registered-capability condition by ending
    unavailable with the named error (lines 62-64, 175-176) and carries the connector-side
    conditions through from the source unchanged (line 200).
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: false
  how: |-
    Both files that read this rule diverge from it, in different ways. citation-validation.ts's
    membership predicate (lines 22-24) matches the rule's condition exactly, but the same file
    additionally exports `acceptedCitations` (lines 17-20), a filtered-subset outcome the
    specification holds no node for -- the only stated outcome for a foreign citation is response-
    level refusal, never a kept partial set. judgment-stage.ts's own citation check (lines 92-95,
    121) runs only after a verdict is known not to be inconclusive, so an inconclusive answer
    carrying citations is recorded with its concepts never held to the judged hypothesis's collects
    at all -- the rule's containment is enforced over decided verdicts only, narrower than what the
    rule states for "every evaluation's citations."
  observed_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: false
  how: |-
    citation-validation.ts's field check (lines 26-32) matches the rule -- the field is held to its
    own cited evidence item's snapshotted fields, never a wider union. But judgment-stage.ts's
    no-data citation construction (line 232, `field: ''`) uses the empty string as a "no field"
    sentinel no node states; the rule requires that every cited field exist among its own item's
    snapshotted names, and `''` is among no item's names -- least of all a timed-out item, which
    domain/investigation/evidence says snapshots no fields at all.
  observed_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: |-
    All three files require a non-empty citations tuple for a confirmed or refuted outcome --
    anthropic-hypothesis-evaluator.adapter.ts (line 116), hypothesis-evaluator.port.ts (lines 17,
    24), judgment-stage.ts (lines 194-196).
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: |-
    status-map.ts's [SubjectDoesNotCoverCaseInputsError, 422] entry (line 61) matches the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: |-
    status-map.ts's [HypothesisNotInManifestError, 404] entry (line 43) matches the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulation-writes-no-investigation
  conforms: true
  how: |-
    All three files' dependency sets admit no investigation store, no event emitter and no cache --
    production-simulate-hypothesis.factory.ts (lines 15-22), simulate.factory.ts (lines 15-21),
    simulate-hypothesis-pipeline.ts (lines 15-30, 69).
  encoded_at:
  - src/factories/production-simulate-hypothesis.factory.ts
  - src/factories/simulate.factory.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: |-
    investigation-pipeline.ts states no attribute-count condition of its own; the invariant sits at
    buildSubject, outside this file set, and nothing here contradicts it.
  encoded_at:
  - src/investigation/investigation-pipeline.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: false
  how: |-
    run-diagnosis.ts's own two-second persistence slice (line 13) holds the rule's own twenty-second
    total correctly. But production-simulate-hypothesis.factory.ts's own `TOTAL_DEADLINE_BUDGET_MS`
    (line 13, `20_000`, consumed at line 50) reuses the same twenty-second figure for the
    `simulate-hypothesis` operation, which this rule states only of a diagnosis
    (domain/investigation/investigation, the record a simulation never writes) -- no node pairs a
    total deadline with either simulation operation, and the run this factory wires skips
    resolution and consolidation entirely, so whether twenty seconds is the right total for a run
    with no on-screen caller timeout behind it was never decided anywhere a reader would look; a
    later change to the diagnosis total also has no way to find this copy.
  observed_at:
  - src/factories/production-simulate-hypothesis.factory.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: false
  how: |-
    hypothesis-evaluator.port.ts's non-decided branch (lines 30-32) requires a reason, and
    judgment-stage.ts's three constructors (lines 227-242) each state one. But
    anthropic-hypothesis-evaluator.adapter.ts diverges twice: its no-data citation construction
    (line 88, `field: ''`) uses a sentinel no node states for a citation whose evidence item never
    observed a field, and its classification of a well-formed model answer of "inconclusive" (lines
    105-107) reuses the same `judgment-failure` reason as an unparseable response or a thrown
    provider call, though no node distinguishes a correct judgment over evidence that grounds
    neither verdict from an actual provider failure -- collapsing the two under one reason
    contradicts domain/investigation/evaluation-reason's own "the three are distinct causes and none
    is the umbrella of the others."
  observed_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: false
  how: |-
    run-diagnosis.ts's raceWriteAttempt (line 111) explicitly treats a rejection carrying
    InvestigationAlreadyStoredError as `'settled'` rather than `'failed'`, matching the rule's own
    "counts as a write that settled" from the caller's perspective. relational-investigation-store.repository.ts's
    root INSERT (lines 93-98, 112-117) correctly holds the write-once half -- insert-only, no ON
    CONFLICT, no UPDATE, root row first inside the transaction, so a duplicate id aborts before any
    child row -- but read in isolation, its raiseRootInsertFailure (line 225) turns a unique
    violation into a thrown InvestigationAlreadyStoredError, which is the store's own only signal
    for the settled case; whether that reads as conforming depends entirely on run-diagnosis.ts's
    own wrapper converting the throw back into "settled," which is a fact about how the two files
    compose rather than one either file alone states. Filed as a divergence because the store file
    read alone states a duplicate as a failure, and InvestigationAlreadyStoredError itself is a
    refusal identity no node names (the specification names exactly one persistence error,
    InvestigationWriteDeadlineExceededError).
  observed_at:
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: |-
    evidence-collection-stage.ts's stage ceiling and per-capability bound (lines 12, 33, 108-110)
    match the rule.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: |-
    evidence-collection-stage.ts carries the requester unchanged into every observation call (line
    69), with no alternative scope anywhere in the file.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/judgment-does-not-infer
  conforms: true
  how: |-
    anthropic-hypothesis-evaluator.adapter.ts's fixed system instruction (line 16) states the rule
    verbatim as the call's own `system` parameter.
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  conforms: true
  how: |-
    All four files read only the evidence item's own snapshotted semantics, with no glossary or
    capability-registry client anywhere -- anthropic-hypothesis-evaluator.adapter.ts (lines
    156-178), citation-validation.ts (lines 27, 31), hypothesis-evaluator.port.ts (lines 8-12,
    45-49), judgment-stage.ts (lines 201-209).
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/citation-validation.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: |-
    status-map.ts's [InvestigationWriteDeadlineExceededError, 500] entry (line 66),
    judgment-stage.ts's deadline branches (lines 86-88, 111-113, 115-117, 63-65) and run-diagnosis.ts's
    zero-bound short-circuit and single retry (lines 80-84, 92-104) all return a recorded ending
    rather than aborting. evidence-collection-stage.ts holds the timeout half (line 117, lines
    193-194) cleanly; a rejected observation call escaping as a thrown exception in the same file
    is filed against domain/investigation/evidence instead, since that is the node whose recorded-
    outcome guarantee the escape actually breaks.
  encoded_at:
  - src/errors/status-map.ts
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: false
  how: |-
    judgment-stage.ts's Promise.all over every required name (lines 32-44) holds totality per name,
    except through evidenceFor's throw (line 222) when the evidence map holds no entry for a
    required hypothesis -- aborting the entire judgment stage rather than degrading that one
    hypothesis to an inconclusive evaluation, which is the posture every other data-absence
    condition in this same file takes and which domain/investigation/evidence's own text states
    ("the absence of data is a recorded fact ... never as an exception").
  observed_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: |-
    evidence-collection-stage.ts constructs exactly one Evidence per concept of the case's
    collection plan (lines 34-39), with no other path in the file constructing or dropping one.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: |-
    run-diagnosis.ts's buildInvestigationOptions (lines 56-59) threads the pinned case, model,
    prompt version and evidence into the record unchanged.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-outcome-comes-from-the-case
  conforms: true
  how: |-
    Both files copy outcome, referral and determining_hypothesis from the case's own resolved
    outcome unchanged, with no comparison or fallback logic of their own --
    assessment-consolidator.port.ts (lines 6-11, stating none of the three), draft-assessment-text.ts
    (lines 22-23).
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: |-
    run-diagnosis.ts awaits the write to completion before returning the assessment (lines 32-33),
    returning it whole and unaltered.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-writing-input-is-narrowed
  conforms: true
  how: |-
    Both files' consolidation call receives only the evaluations and the evidence, unconditionally
    in every outcome, with no case, hypothesis or criterion reaching the signature --
    assessment-consolidator.port.ts (lines 15-19), draft-assessment-text.ts (line 21).
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: |-
    status-map.ts's [ConceptRefusesSubjectTypeError, 422] entry (line 64) matches the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: |-
    status-map.ts's [HypothesisRevisionCollectsNoConceptError, 422] entry (line 63) matches the
    rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: |-
    status-map.ts's [CaseHoldsNoDraftError, 409] entry (line 52) matches the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: |-
    status-map.ts's [ConceptNotInGlossaryError, 404] entry (line 44) matches the rule.
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: |-
    status-map.ts's [ConceptDescriptionRequiredError, 422] entry (line 65) holds this scenario's
    refusal-identity step; its other two steps sit in files outside this set.
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: |-
    evidence-collection-stage.ts's timeout branch (lines 193-194) and judgment-stage.ts's non-ok
    short-circuit (lines 59-62) together hold the scenario's collection and evaluation halves.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: |-
    status-map.ts's [SubjectDoesNotCoverCaseInputsError, 422] entry (line 61) holds the scenario's
    refusal-identity step.
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: |-
    judgment-stage.ts's retryOrFail (line 96, lines 109-122) matches the scenario's one-retry-then-
    judgment-failure path.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  conforms: true
  how: |-
    read-concept.controller.ts states neither of the scenario's own steps, correctly (it holds no
    evidence item or prompt); anthropic-hypothesis-evaluator.adapter.ts's conceptDescriptionLines
    (lines 166-168) emits no element for an empty snapshot, naming the item by concept alone.
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: |-
    judgment-stage.ts's acquireSlotOrDeadline (lines 63-65, 124-134) matches the scenario.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  conforms: true
  how: |-
    citation-validation.ts's field check (line 31) and judgment-stage.ts's evidence-item-sourced
    prompt and citation context (lines 201-209, 193-199) both hold the scenario: nothing in either
    file consults a live registration.
  encoded_at:
  - src/investigation/citation-validation.ts
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  conforms: true
  how: |-
    Both files construct their observation source with exactly two collaborators and no cache --
    production-simulate-hypothesis.factory.ts (line 35), simulate.factory.ts (line 40).
  encoded_at:
  - src/factories/production-simulate-hypothesis.factory.ts
  - src/factories/simulate.factory.ts
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  conforms: true
  how: |-
    simulate-hypothesis-pipeline.ts narrows the case to one manifest entry and returns exactly one
    evaluation (lines 49, 68, 72-78), with no outcome or assessment to resolve.
  encoded_at:
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: |-
    evidence-collection-stage.ts's effectiveBoundMsFor (lines 108-110, 33) races against the minimum
    of the capability's declared timeout and the stage ceiling, matching the scenario.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: |-
    run-diagnosis.ts throws before reaching the return whenever no write settled (lines 82-84),
    matching the scenario.
  encoded_at:
  - src/investigation/run-diagnosis.ts
notes: |-
  19 delegations ran, one per file, spawned together. Every finding above cites the node it was
  transcribed against; three items surfaced by the judges do not appear in the table because they
  name no node this reconciliation's node set or candidate list holds, and forcing them into it
  would misrepresent what the trace actually binds:

  1. status-map.ts's judge found that [CaseVersionNotReleasedError, 409] (line 51) answers a
     refusal rules/investigation/only-a-released-case-version-is-diagnosed states without naming a
     status or an error identity, unlike every sibling refusal in the same map, each of which has a
     decision-log entry. This is an unstated fact, not a code divergence, and its route is
     /analyse over that node's statement, disclosed in decision-log.md the way every sibling
     refusal already was.
  2. evidence-collection-stage.ts's judge found that evidenceOf (line 158) always writes the module
     constant DEFAULT_EVIDENCE_TTL_SECONDS rather than the collected concept's own ttl (read one
     line earlier from the same glossary resolution and then discarded), attributing the fact to a
     node named constraints/the-evidence-cache-admits-only-ok-results, which is outside both this
     batch's bound-node set and its candidate list. Worth a person's attention regardless of which
     node it actually belongs to: a curator tightening a concept's ttl in the glossary today changes
     nothing about what gets collected.
  3. relational-connector-configuration-store.repository.ts's judge found that its
     raiseReadFailure/raiseWriteFailure helpers (lines 48-62) raise a ConnectorConfigurationStoreError
     carrying a 'read'/'write' operation vocabulary that no node or candidate names, and reported no
     single node it belongs to. Per this reconciliation's own transcription rule, a finding naming
     no node lands on every node the file was judged against -- constraints/the-domain-depends-on-no-infrastructure,
     constraints/the-system-persists-to-one-relational-database, contracts/integration/connector-configuration-registry,
     domain/integration/connector-configuration and domain/integration/connector-configuration-registry
     -- which is why all five show conforms: false above despite every one of them reading cleanly
     on its own substance. The actual defect is narrow (an unstated error identity and vocabulary,
     the same class as item 1) and its route is likewise /analyse, or a decision that this error
     never reaches a caller and needs no node at all.

  One node's judgment rests on how two files compose rather than on either alone:
  rules/investigation/an-investigation-is-written-once's own conforms: false records that
  run-diagnosis.ts's raceWriteAttempt correctly reads a rejection carrying InvestigationAlreadyStoredError
  as settled, while relational-investigation-store.repository.ts's own raiseRootInsertFailure, read
  in isolation, states a duplicate id as a thrown failure. The system-level behavior these two files
  produce together may already be correct; what is unstated is InvestigationAlreadyStoredError's own
  identity, which the specification does not name (it names exactly one persistence error,
  InvestigationWriteDeadlineExceededError).

  The store-failure-vocabulary finding, the CaseVersionNotReleasedError finding and the
  InvestigationAlreadyStoredError finding are the same shape: an error identity a status map or a
  store raises without the specification stating it, discovered independently by three different
  judges reading three different files. That recurrence, more than any single instance, is worth a
  person's attention.
---
