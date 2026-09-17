---
contract_version: siegard-reconcile/5
title: 'capability-payload-notes: an operator-authored payload_notes field flows from capability registration
  through evidence collection into a hypothesis judgment prompt'
summary: A capability may declare an optional, free-text payload_notes attribute describing the technical
  shape of the payload its collection returns, at the operator's discretion and kept shallow (no tie to
  output_schema). The identity read presents it when declared; evidence collection snapshots it onto each
  collected Evidence item as capability_payload_notes (an honest empty string when the producing capability
  declared none, mirroring how concept_description is already snapshotted); the judgment stage carries
  that snapshot unchanged into the evidence item a hypothesis evaluator reads; and the Anthropic adapter
  renders it into the judgment prompt as an optional &lt;capability_payload_notes&gt; element, alongside
  the existing field/description context. All five tasks were delivered through /analyse -> /plan-work
  -> /implement-task, each with a two-producer (implementation/test) split; this record reconciles the
  change as an initiative-wide /review-change over all five deliveries.
target: backend
files:
- path: migrations/0024-capability-payload-notes.sql
  change: New additive migration -- ALTER TABLE capabilities ADD COLUMN payload_notes TEXT, nullable and
    without a DEFAULT -- pairing the newly-declared optional attribute with its own column without altering
    any migration already applied, and without backfilling any value into rows that predate the column.
- path: migrations/0025-investigation-evidence-capability-payload-notes.sql
  change: New additive migration -- ALTER TABLE investigation_evidence ADD COLUMN capability_payload_notes
    TEXT NOT NULL DEFAULT '' -- giving investigation_evidence the one column pairing with the new attribute,
    backfilling every pre-existing row with the honest-empty reading, following the identical shape 0013's
    concept_description column already established.
- path: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  change: 'Criterion: a register-capability submission carrying payload_notes is accepted and the capability
    standing at that name and version holds the same payload_notes text -- the storage round-trip half,
    against the real store. Criterion: a capability row stored before that column existed reads back as
    a capability holding no payload notes, never as a read failure. Criterion: a capability re-registered
    whole at the same name and version without payload_notes holds none afterwards, never the text an
    earlier registration carried. rules/integration/a-capability-declares-its-contract''s clause that
    an attribute absent or an empty string is undeclared, applied to a read of a row whose stored payload_notes
    is literally the empty string -- originally recorded as demonstrating an UNDERDETERMINED gap, and
    now passing once a failure-diagnostician''s finding against that same clause was applied to toCapability()''s
    guard.'
- path: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  change: 'Added capability_payload_notes: '''' to the anIntegrationEvidence fixture literal, and adjusted
    the exact-params toEqual assertion and the "thirteenth and fourteenth params" slice window, all downstream
    of Evidence''s new required attribute.'
- path: src/__tests__/integration/persistence/schema-migrations.spec.ts
  change: 'Criteria: the relation holding a registered capability has one column pairing with payload_notes
    and no column pairing with no declared attribute; and applying the numbered migration scripts in order
    to an empty database produces that column with no step performed by hand. The relation holding a collected
    evidence item has one column pairing with capability_payload_notes and no column pairing with no declared
    attribute; and applying the numbered migration scripts in order to an empty database produces that
    column with no step performed by hand. An evidence row stored before that column existed reads capability_payload_notes
    as the empty string, never as a read failure.'
- path: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  change: 'Criterion: a register-capability submission carrying no payload_notes is not refused for that
    absence by the contract-completeness check; and, whole, domain/integration/capability''s own Responsibility
    that payload notes are declared where the operator supplies them and that an absent declaration is
    a capability that simply has none, never an incomplete one. Criterion: a registration whose payload_notes
    is an empty string yields a capability holding no payload notes, the same as one stating none at all
    -- the service-level normalization. The payload_notes the identity read answers is drawn from the
    registration standing at that name and version, never from the content a register-capability submission
    carried.'
- path: src/__tests__/unit/http/dto/evidence.dto.spec.ts
  change: 'Added capability_payload_notes: '''' to aValidEvidenceItem(), now required by evidenceSchema.
    The evidence representation''s own validation does not refuse an evidence item carrying capability_payload_notes.'
- path: src/__tests__/unit/http/dto/read-capability-by-identity.dto.spec.ts
  change: The answer's own validation does not refuse an answer in which payload_notes stands absent and
    every other declared attribute stands present. The answer's own validation refuses an answer in which
    nature, input_schema, output_schema, timeout, connector or concept stands absent, so payload_notes
    is the only attribute admitted absent.
- path: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  change: 'Added capability_payload_notes: '''' to aValidEvidenceItem().'
- path: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  change: 'Added capability_payload_notes: '''' to aValidEvidenceItem().'
- path: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  change: Added payload_notes to the shared heldCapability() test fixture, so the pre-existing test asserting
    the response carries every one of the schema's declared keys once again gets a fixture that actually
    declares all of them, payload_notes included. The identity read of a capability registered with payload
    notes answers that same text. The identity read of a capability registered without payload notes answers
    no payload_notes value, rather than an empty or substituted one.
- path: src/__tests__/unit/http/register-capability.routes.spec.ts
  change: 'Criterion: a register-capability submission carrying payload_notes is accepted -- its HTTP/DTO
    half, that the body schema admits the field and forwards it into the registration object rather than
    stripping it. Criterion: a registration whose payload_notes is an empty string yields a capability
    holding no payload notes -- its DTO-boundary half, that an empty string is accepted (not refused with
    400) so it can reach the service''s own undeclared-normalization.'
- path: src/__tests__/unit/http/simulate-case.controller.spec.ts
  change: 'Added capability_payload_notes: '''' to the inline evidence literal, now required by Evidence.'
- path: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  change: 'Added capability_payload_notes: '''' to the inline evidence literal.'
- path: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  change: 'Added capability_payload_notes: '''' to the SOME_EVIDENCE fixture.'
- path: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  change: Added capability_payload_notes to every EvidenceItem literal in the file, now required by EvidenceItem;
    no assertion, prompt or rendering behavior was changed. One test's two identical evidence/case-context
    literals were also factored into shared builder functions to stay under the project's max-lines-per-function
    lint rule after the new field was added. Criterion 1 -- the prompt block for an evidence item whose
    capability_payload_notes holds content states that text inside that item's own block. Criterion 2
    -- the prompt block for an evidence item whose capability_payload_notes is empty states no payload-notes
    tag at all, the same omission concept_description already takes when empty. Criterion 3 -- the payload
    notes stated in an item's block are that item's own, never another item's in the same prompt.
- path: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
  change: 'Added capability_payload_notes: '''' to the SOME_EVIDENCE fixture.'
- path: src/__tests__/unit/investigation/citation-validation.spec.ts
  change: 'Added capability_payload_notes: '''' to the anEvidence() helper default. Criterion 4 -- an
    evaluation citing a field named only in a capability''s payload notes and in no output schema is still
    refused, so the notes reaching the prompt widen no citation vocabulary.'
- path: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  change: 'Added capability_payload_notes: '''' to the anEvidence() helper default.'
- path: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  change: 'Added capability_payload_notes: '''' to expectedOkEvidence(), expectedNonOkEvidence() and expectedUnavailableEvidence()
    (untyped-return helpers compared via toEqual against real Evidence objects). An evidence item collected
    from a capability declaring payload notes carries capability_payload_notes holding that same text.
    An evidence item collected from a capability declaring no payload notes carries capability_payload_notes
    as the empty string. An evidence item recorded for an observation whose capability never resolved
    carries capability_payload_notes as the empty string rather than ending the collection differently
    than it already ends. Re-registering the producing capability after collection leaves an already-collected
    evidence item''s capability_payload_notes unchanged.'
- path: src/__tests__/unit/investigation/evidence.spec.ts
  change: domain/investigation/evidence's whole declared attribute shape, including the newly required
    capability_payload_notes
- path: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  change: Added capability_payload_notes to the SOME_EVIDENCE fixture, now required by EvidenceItem.
- path: src/__tests__/unit/investigation/investigation-factory.spec.ts
  change: 'Added capability_payload_notes: '''' to the anEvidence() helper default.'
- path: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  change: 'Added capability_payload_notes: '''' to expectedOkEvidence().'
- path: src/__tests__/unit/investigation/judgment-stage.spec.ts
  change: 'Added capability_payload_notes: '''' to the anEvidence() helper default. Added capability_payload_notes
    to the two exact-equality assertions on evaluator.calls[].evidence, which the widened EvidenceItem
    shape would otherwise fail. Criterion 1 (the evidence item the evaluator receives carries capability_payload_notes
    holding exactly the value that item''s stored snapshot holds) and criterion 4 (a capability re-registered
    between collection and judgment does not change the capability_payload_notes the evaluator receives
    for an already-collected item) -- toEvidenceItems() has no channel to a live registry, so the only
    value it can hand the evaluator is the one the Evidence item already carried at collection. Criterion
    2 -- an evidence item whose snapshot holds an empty capability_payload_notes reaches the evaluator
    carrying that empty value, never omitting the attribute from the item. Criterion 3 -- assembling the
    judgment call issues no capability-registry read, so the value handed to the evaluator comes from
    the evidence snapshot alone.'
- path: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  change: 'Added capability_payload_notes: '''' to the anEvidence() helper default.'
- path: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  change: 'Added capability_payload_notes: '''' to expectedOkEvidence().'
- path: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  change: Updated the pre-existing upsert test's two hardcoded params-array assertions to include the
    new trailing payload_notes parameter (null), so the assertion still verifies identity-keyed upsert,
    single transaction and no DELETE without staying stale against this legitimate new column.
- path: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  change: 'Added capability_payload_notes: '''' to both evidenceRow() (raw DB row fixture) and anEvidence()
    helper.'
- path: src/capability-registry/capability-registry.service.ts
  change: heldCapability() now includes payload_notes in the returned Capability only when it is declared
    -- reusing the module's own isUndeclared() (undefined or empty string) to omit the key entirely otherwise,
    rather than persisting an empty-string value. A whole re-registration without payload_notes yields
    a Capability carrying none, never a value merged in from what was previously stored.
- path: src/capability-registry/capability.ts
  change: 'Declares payload_notes as an optional (?:) readonly attribute on both Capability and CapabilityRegistration,
    matching the zod .optional()/TypeScript ?: pairing every other currently-optional registration field
    already uses. REQUIRED_REGISTRATION_ATTRIBUTES is left unchanged, so payload_notes is never treated
    as required by the contract-completeness check.'
- path: src/http/dto/evidence.dto.ts
  change: 'evidenceSchema gained capability_payload_notes: z.string(), mirroring the required-but-possibly-empty
    shape already used for concept_description, so a real Evidence item validated at this boundary is
    not silently stripped of the attribute.'
- path: src/http/dto/read-capability-by-identity.dto.ts
  change: readCapabilityByIdentityResponseSchema gains payload_notes as z.string().optional(), placed
    after concept; every other field (name, version, nature, input_schema, output_schema, timeout, connector,
    concept) is unchanged and still required, so payload_notes is the schema's one attribute admitted
    absent.
- path: src/http/dto/register-capability.dto.ts
  change: registerCapabilityBodySchema gains payload_notes as z.string().optional() (no .min(1), since
    an empty string must be accepted rather than rejected at the boundary), following the file's own existing
    optional-field convention.
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: itemBlock() now emits a per-item capabilityPayloadNotesLines(item.capability_payload_notes)
    segment after the item's <fields> block and before its <observation>, mirroring conceptDescriptionLines()'s
    omit-tag-when-empty rendering; SYSTEM_PROMPT's own description of what one <item> carries was extended
    to name the new <capability_payload_notes> element and state it is context grounding the observation,
    never a fact to verify and never a citable field name.
- path: src/investigation/evidence-collection-stage.ts
  change: EvidenceBase gained a capabilityPayloadNotes field; resolvedBaseOf() snapshots it from capability.payload_notes
    ?? '' at the same resolution moment fields/conceptDescription are already snapshotted; unavailableEvidence()'s
    base literal supplies '' when the capability never resolved; evidenceOf() carries the snapshot onto
    every produced Evidence item as capability_payload_notes.
- path: src/investigation/evidence.ts
  change: 'Added the required capability_payload_notes: string attribute to the Evidence type, alongside
    concept_description, matching domain/investigation/evidence''s declared shape.'
- path: src/investigation/hypothesis-evaluator.port.ts
  change: 'EvidenceItem gained a required capability_payload_notes: string attribute, alongside concept
    and fields, matching domain/investigation/hypothesis-evaluator''s stated shape for what judgment receives
    per item.'
- path: src/investigation/judgment-stage.ts
  change: 'toEvidenceItems() now carries capability_payload_notes: item.capability_payload_notes onto
    every EvidenceItem it builds from a stored Evidence item, alongside the existing concept_description
    carry-through.'
- path: src/persistence/relational-capability-store.repository.ts
  change: 'ICapabilityRow gains payload_notes as string | null; the SELECT, INSERT/ON CONFLICT column
    lists and params array all name it; toCapability() spreads it in only when the row''s own payload_notes
    is not null (the same conditional-spread shape relational-investigation-store.repository.ts''s evidenceOf()
    already uses for result_detail), so a legacy row with SQL NULL reads back as a Capability with no
    payload_notes property, not a read failure and not an empty string. toCapability''s payload_notes
    guard now reads row.payload_notes !== null && row.payload_notes !== '''' instead of row.payload_notes
    !== null, so a stored empty string reads back as no payload_notes property at all rather than as payload_notes:
    '''' -- matching the domain''s absent-or-empty-is-undeclared convention. One-line correction to a
    file this task''s criteria depend on but did not itself modify, made from a failure-diagnostician''s
    finding against this task''s own suite run.'
- path: src/persistence/relational-investigation-store.repository.ts
  change: IEvidenceRow gained capability_payload_notes; evidenceStatement()'s INSERT text and params list
    it as a fifteenth column/value; the evidence SELECT names it; evidenceOf() maps row.capability_payload_notes
    onto the reconstructed Evidence.
nodes:
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  conforms: true
  how: "src/http/dto/register-capability.dto.ts: held at the two exported zod schemas, which declare the\
    \ route's shape for the params and body of register-capability — export const registerCapabilityParamsSchema\
    \ = z.object({\n  name: z.string().min(1),\n  version: z.string().min(1),\n});"
  encoded_at:
  - src/http/dto/register-capability.dto.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses, the Promise.all over one judgeOneHypothesis\
    \ call per required hypothesis, guarded by a CallPool sized from options.poolSize — const pool = new\
    \ CallPool(poolSize);\n...\nreturn Promise.all(\n  requiredNames.map((name) =>\n    judgeOneHypothesis({\n\
    \      name,\n      hypothesis: hypothesisNamed(theCase, name),\n      evidence: evidenceFor(name,\
    \ evidenceByHypothesis),\n      evaluator,\n      pool,\n      deadlineGuard,\n      caseContext,\n\
    \    }),\n  ),\n);\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the class declaration implementing\
    \ the port, and the fact the Anthropic SDK is imported only in this adapter file — import Anthropic\
    \ from '@anthropic-ai/sdk';\n...\nexport class AnthropicHypothesisEvaluator implements IHypothesisEvaluator\
    \ {\nsrc/investigation/hypothesis-evaluator.port.ts: held at the file itself, as the port interface\
    \ — imports only local type modules, and the interface it declares is the single point evaluate()\
    \ is invoked through — import type { ObservationOutcome } from './observation-source.port.js';\nimport\
    \ type { Citation } from './citation.js';\nimport type { EvaluationReason } from './evaluation-reason.js';\n\
    import type { FieldSemantics } from './field-semantics.js';\nimport type { Usage } from './usage.js';\n\
    import type { Verdict } from './verdict.js';\n...\nexport interface IHypothesisEvaluator {\n\n  evaluate(\n\
    \    criterion: string,\n    evidence: readonly EvidenceItem[],\n    caseContext: CaseContext,\n \
    \ ): Promise<EvaluationOutcome>;\n}\nsrc/investigation/judgment-stage.ts: held at runIsolatedCall\
    \ and retryOrFail, both calling evaluator.evaluate(...) where evaluator is typed IHypothesisEvaluator\
    \ — import type { CaseContext, EvaluationOutcome, EvidenceItem, IHypothesisEvaluator } from './hypothesis-evaluator.port.js';\n\
    ...\nconst first = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion, evidenceItems,\
    \ caseContext), deadlineGuard);\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/listings-are-paged
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at listCapabilities(), the object\
    \ literal it returns — const data = held.slice(pagination.offset, pagination.offset + pagination.limit);\n\
    return {\n  data,\n  total,\n  limit: pagination.limit,\n  offset: pagination.offset,\n  pageCount:\
    \ pageCountOf(total, pagination.limit),\n};\n"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at readCapabilityByIdentityOrThrow()\
    \ — if (!resolution.held) {\n  throw new CapabilityIdentityNotFoundError(resolution.name, resolution.version);\n\
    }\n"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'src/investigation/evidence-collection-stage.ts: held at collectEvidence(), the stage-ceiling computation
    — const stageCeilingMs = Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS, deadline - now));

    src/investigation/judgment-stage.ts: held at judgeHypotheses, line 28 — const deadlineGuard = createDeadlineGuard(Math.max(0,
    deadline - now));'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at buildUserPrompt() and the\
    \ client.messages.create call, lines 66-71 and 133-150 — return await this.client.messages.create({\n\
    \      model: this.model,\n      max_tokens: this.maxTokens,\n      system: SYSTEM_PROMPT,\n     \
    \ messages: [{ role: 'user', content: prompt }],\n    });\nsrc/investigation/hypothesis-evaluator.port.ts:\
    \ held at the evaluate() signature, which admits only criterion, evidence and caseContext — nothing\
    \ that could be a live glossary or registry lookup — evaluate(\n    criterion: string,\n    evidence:\
    \ readonly EvidenceItem[],\n    caseContext: CaseContext,\n  ): Promise<EvaluationOutcome>;\nsrc/investigation/judgment-stage.ts:\
    \ held at toEvidenceItems, lines 203-212 — function toEvidenceItems(evidence: readonly Evidence[]):\
    \ readonly EvidenceItem[] {\n  return evidence.map((item): EvidenceItem => ({\n    concept: item.concept,\n\
    \    result: 'ok',\n    observation: item.observation,\n    fields: item.fields,\n    concept_description:\
    \ item.concept_description,\n    capability_payload_notes: item.capability_payload_notes,\n  }));\n\
    }\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: "migrations/0024-capability-payload-notes.sql: held at the file itself -- a single plain numbered\
    \ script applying one additive change. — ALTER TABLE capabilities\n  ADD COLUMN payload_notes TEXT;\n\
    migrations/0025-investigation-evidence-capability-payload-notes.sql: held at the file itself, as the\
    \ next numbered script in the migrations directory, containing a single statement applied wholesale\
    \ rather than any hand-performed step — ALTER TABLE investigation_evidence\n  ADD COLUMN capability_payload_notes\
    \ TEXT NOT NULL DEFAULT '';\n"
  encoded_at:
  - migrations/0024-capability-payload-notes.sql
  - migrations/0025-investigation-evidence-capability-payload-notes.sql
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: "migrations/0024-capability-payload-notes.sql: held at the ALTER TABLE statement. — ALTER TABLE\
    \ capabilities\n  ADD COLUMN payload_notes TEXT;\nmigrations/0025-investigation-evidence-capability-payload-notes.sql:\
    \ held at the ALTER TABLE statement, which adds exactly one column pairing with the one domain-model\
    \ attribute this task adds — ADD COLUMN capability_payload_notes TEXT NOT NULL DEFAULT '';\n\nsrc/persistence/relational-capability-store.repository.ts:\
    \ held at readCapabilities()'s SELECT column list and upsertStatementFor()'s INSERT/ON CONFLICT column\
    \ list, both naming exactly the nine attributes domain/integration/capability declares. — SELECT name,\
    \ version, nature, input_schema, output_schema, timeout, connector, concept, payload_notes\n     \
    \          FROM ${CAPABILITIES_TABLE}\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at the column lists of INVESTIGATION_INSERT_TEXT, investigationSelect, evidenceStatement and\
    \ the evidence SELECT, each column pairing to a declared attribute of the aggregate or one of its\
    \ value-objects, or to the capability/case reference columns (capability_name, capability_version,\
    \ pinned_case_slug, pinned_case_version) — INSERT INTO investigations (id, requester, ticket_ref,\
    \ narrative, subject_type, prompt_version, model, pinned_case_slug, pinned_case_version, assessment_outcome,\
    \ assessment_action, assessment_recipient, assessment_determining_hypothesis, assessment_text, assessment_register,\
    \ assessment_usage_input_tokens, assessment_usage_output_tokens, assessment_elapsed_ms, assessment_prompt,\
    \ cost_calls, cost_input_tokens, cost_output_tokens, durations_collection, durations_judgment, durations_writing,\
    \ durations_total)"
  encoded_at:
  - migrations/0024-capability-payload-notes.sql
  - migrations/0025-investigation-evidence-capability-payload-notes.sql
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: "src/persistence/relational-capability-store.repository.ts: held at the constructor's single DatabaseConnection\
    \ dependency and every read/write routed through runStatement/runInTransaction against it. — public\
    \ constructor(private readonly connection: DatabaseConnection) {}\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at the write() and read() methods, both running their whole body inside one transaction — public\
    \ async write(investigation: Investigation): Promise<void> {\n  await runInTransaction(this.connection,\
    \ raiseWriteFailure, (tx) => writeWholeInvestigation(tx, investigation));\n}"
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/integration/capability-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/capability-registry/capability-registry.service.ts,
    src/http/dto/register-capability.dto.ts, and src/persistence/relational-capability-store.repository.ts
    read `nowhere` — the class exposes only readCapabilities(): Promise<readonly Capability[]> and writeCapabilities(capabilities:
    readonly Capability[]): Promise<void> — no read-capability, read-capability-by-identity, list-capabilities
    or register-capability operation appears here; those are composed elsewhere from these two. — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/http/dto/register-capability.dto.ts
  - src/persistence/relational-capability-store.repository.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at collectEvidence(), the per-concept parallel\
    \ dispatch — return Promise.all(\n    concepts.map((concept) =>\n      collectOneEvidence({ concept,\
    \ subject, requester, capabilities, glossary, observationSource, stageCeilingMs, now }),\n    ),\n\
    \  );"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: domain/integration/capability
  conforms: false
  how: 'migrations/0024-capability-payload-notes.sql, opening comment block, lines 1-5: an operator''s
    own free-text account of what the observation actually returns beneath its declared output schema,
    never enforced and never read by anything that resolves a call or admits a citation. — This restates
    domain/integration/capability''s own account of what payload_notes is and guarantees ("never enforced
    and never read by anything that resolves a call or admits a citation") as the migration''s own prose
    rather than pointing to the node. If that node''s description of payload_notes is ever revised, this
    comment keeps stating the old account verbatim, and a reader of the migration would take it as current
    without opening the node it silently duplicates.'
  observed_at:
  - migrations/0024-capability-payload-notes.sql
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
  - src/http/dto/read-capability-by-identity.dto.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/evidence-collection-stage.ts
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability-nature
  conforms: true
  how: 'src/capability-registry/capability.ts: held at the `CAPABILITY_NATURES` constant and `CapabilityNature`
    type, lines 1-3 — export const CAPABILITY_NATURES = [''read-only'', ''mutating''] as const;

    src/persistence/relational-capability-store.repository.ts: held at CAPABILITY_NATURE_VALUES, built
    from the imported CAPABILITY_NATURES, and isCapabilityNature(), which checks a row''s nature string
    against that set rather than redeclaring the values. — const CAPABILITY_NATURE_VALUES: ReadonlySet<string>
    = new Set<string>(CAPABILITY_NATURES);'
  encoded_at:
  - src/capability-registry/capability.ts
  - src/persistence/relational-capability-store.repository.ts
- node: domain/integration/capability-registry
  conforms: false
  how: 'the fact left part of its ground: still held in src/capability-registry/capability-registry.service.ts,
    and src/persistence/relational-capability-store.repository.ts read `nowhere` — the file implements
    only readCapabilities() and writeCapabilities(); register-capability and resolve-concept are not implemented
    here. — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/persistence/relational-capability-store.repository.ts
- node: domain/investigation/assessment
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at assessmentParams (write)
    and assessmentOf (read) — return [assessment.outcome, assessment.referral.action, assessment.referral.recipient,
    assessment.determining_hypothesis ?? null, assessment.text, assessment.register, assessment.usage.input_tokens,
    assessment.usage.output_tokens, assessment.elapsed_ms, assessment.prompt];'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/citation
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at noDataOutcome(), line 88,
    and isCitation(), lines 215-217 — citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept
    })),

    src/investigation/judgment-stage.ts: held at noDataEvaluation, line 227 — citations: nonOkEvidence.map((item):
    Citation => ({ concept: item.concept })),

    src/persistence/relational-investigation-store.repository.ts: held at citationStatement (write) and
    citationOf (read) — params: [investigationId, hypothesis, citation.concept, citation.field ?? null]
    ... function citationOf(row) { return { concept: row.concept, ...(row.field !== null ? { field: row.field
    } : {}) }; }'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/cost
  conforms: false
  how: "src/__tests__/unit/http/dto/simulate-case.dto.spec.ts, the it(\"validates a response whose cost.calls\
    \ is fractional, since domain/investigation/cost stays outside this task's scope\", ...) block, lines\
    \ 329-335: it(\"validates a response whose cost.calls is fractional, since domain/investigation/cost\
    \ stays outside this task's scope\", () => {\n  const response = { ...aValidResponse(), cost: { calls:\
    \ 1.5, input_tokens: 1, output_tokens: 1 } };\n\n  const result = simulateCaseResponseSchema.safeParse(response);\n\
    \n  expect(result.success).toBe(true);\n}); — A reader of domain/investigation/cost sees calls declared\
    \ as an integer -- a whole count of judgment calls made. This test locks the response schema's acceptance\
    \ of a fractional value (1.5) into the suite as correct behavior, so the next person touching this\
    \ schema sees a passing green test confirming that a non-integer call count is valid, and has no reason\
    \ to treat calls as anything but permissive -- the domain model's own typing is the one place that\
    \ still says otherwise."
  observed_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at durationsParams (write)
    and the durations object built in investigationOf (read) — durations: { collection: row.durations_collection,
    judgment: row.durations_judgment, ...(row.durations_writing !== null ? { writing: row.durations_writing
    } : {}), total: row.durations_total }'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: true
  how: "src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts: held at the shape\
    \ asserted on the value evaluate() returns, throughout the file — expect(outcome.usage).toBeUndefined();\
    \ expect(outcome.elapsed_ms).toEqual(expect.any(Number)); expect(outcome.prompt).toBe(createMock.mock.calls[0]?.[0]?.messages[0]?.content);\n\
    src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at outcomeFromModelText()/judgmentFailureOutcome(),\
    \ lines 92-112 — return outcomeFromModelText(textOf(message), { usage: message.usage, elapsed_ms:\
    \ elapsedMs, prompt });\nsrc/investigation/judgment-stage.ts: held at asEvaluation and callRecordOf,\
    \ lines 240-263 — function asEvaluation(name: string, outcome: EvaluationOutcome): Evaluation {\n\
    \  const callRecord = callRecordOf(outcome);\n  if (outcome.verdict === 'confirmed') {\n    return\
    \ { hypothesis: name, verdict: 'confirmed', citations: outcome.citations, ...callRecord };\n  }\n\n\
    src/persistence/relational-investigation-store.repository.ts: held at evaluationStatement (write)\
    \ and evaluationOf/callRecordOf (read) — if (verdict === 'confirmed') { return { hypothesis: row.hypothesis,\
    \ verdict, citations: nonEmptyCitations(citations, row.hypothesis), ...callRecord }; }"
  encoded_at:
  - src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at noDataEvaluation, deadlineExceededEvaluation and\
    \ judgmentFailureEvaluation, lines 222-238 — return { hypothesis: name, verdict: 'inconclusive', reason:\
    \ 'no-data', ... };\nfunction deadlineExceededEvaluation(name: string): Evaluation {\n  return { hypothesis:\
    \ name, verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] };\n}\nfunction judgmentFailureEvaluation(name:\
    \ string, outcome: EvaluationOutcome): Evaluation {\n  ...\n  return { hypothesis: name, verdict:\
    \ 'inconclusive', reason: 'judgment-failure', citations: [], ...callRecord };\n}\n\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at the reason column write and reasonOf (read) — const reason = evaluation.verdict === 'inconclusive'\
    \ ? evaluation.reason : null;"
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: false
  how: 'the fact left part of its ground: still held in migrations/0025-investigation-evidence-capability-payload-notes.sql,
    src/http/dto/evidence.dto.ts, src/investigation/anthropic-hypothesis-evaluator.adapter.ts, src/investigation/evidence-collection-stage.ts,
    src/investigation/evidence.ts, src/investigation/judgment-stage.ts, src/persistence/relational-investigation-store.repository.ts,
    and src/persistence/relational-capability-store.repository.ts read `nowhere` — export class RelationalCapabilityStore
    implements ICapabilityStore { — the class''s only two methods operate on ICapabilityRow/Capability;
    no evidence record is read or written. — a binding asserts the file answers for the node, so the pair
    that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - migrations/0025-investigation-evidence-capability-payload-notes.sql
  - src/http/dto/evidence.dto.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/evidence.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-capability-store.repository.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at settledEvidence() and unavailableEvidence(),\
    \ choosing the ending — if (outcome === TIMED_OUT) {\n    return evidenceOf(base, { result: 'timeout',\
    \ resultDetail: `no observation within ${effectiveBoundMs}ms`, elapsedMs });\n  }\n  if (outcome.result\
    \ === 'ok') {\n    return evidenceOf(base, { result: 'ok', observation: outcome.observation, elapsedMs\
    \ });\n  }\n  if (outcome.result === 'unavailable') {\n    return evidenceOf(base, { result: 'unavailable',\
    \ resultDetail: outcome.result_detail, elapsedMs });\n  }\n  return evidenceOf(base, { result: outcome.result,\
    \ elapsedMs });\nsrc/persistence/relational-investigation-store.repository.ts: held at resultOf/isEvidenceResult,\
    \ validated against the imported EVIDENCE_RESULTS vocabulary — const EVIDENCE_RESULT_VALUES: ReadonlySet<string>\
    \ = new Set<string>(EVIDENCE_RESULTS); ... function isEvidenceResult(value: string): value is EvidenceResult\
    \ { return EVIDENCE_RESULT_VALUES.has(value); }"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/investigation/evidence-collection-stage.ts: held at resolvedBaseOf(), the fields snapshot
    — fields: fieldSemanticsOf(capability.output_schema),

    src/persistence/relational-investigation-store.repository.ts: held at the fields column, written as
    JSON.stringify(evidence.fields) and read back as row.fields — JSON.stringify(evidence.fields),'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at the evaluate() method, line\
    \ 45 — public async evaluate(\n    criterion: string,\n    evidence: readonly EvidenceItem[],\n  \
    \  caseContext: CaseContext,\n  ): Promise<EvaluationOutcome> {\nsrc/investigation/hypothesis-evaluator.port.ts:\
    \ held at the IHypothesisEvaluator interface, whose one operation is evaluate — export interface IHypothesisEvaluator\
    \ {\n\n  evaluate(\n    criterion: string,\n    evidence: readonly EvidenceItem[],\n    caseContext:\
    \ CaseContext,\n  ): Promise<EvaluationOutcome>;\n}\nsrc/investigation/judgment-stage.ts: held at\
    \ runIsolatedCall, line 85 and retryOrFail, line 112 — const first = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion,\
    \ evidenceItems, caseContext), deadlineGuard);"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: false
  how: "src/__tests__/unit/investigation/investigation-factory.spec.ts, lines 284-289, the test 'builds\
    \ an Investigation carrying no written_at, rather than refusing...': it('builds an Investigation carrying\
    \ no written_at, rather than refusing, when written_at is missing entirely from the given options\
    \ — the store decides that value later, at settle', async () => {\n  const options = validOptionsWithout('written_at');\n\
    \n  const investigation = await buildInvestigation(options);\n\n  expect(investigation.written_at).toBeUndefined();\n\
    }); — domain/investigation/investigation.md declares written_at `required: true`, and rules/investigation/written-at-records-when-the-write-settled.md\
    \ states \"the domain model declares no second element for an investigation assembled but not yet\
    \ settled\" and \"an investigation assembled but not yet settled is therefore no element of the domain\
    \ model\" — what persistence receives is \"the investigation's own content less written_at\", never\
    \ an Investigation with written_at left empty. This test instead asserts that the value `buildInvestigation`\
    \ itself returns — the thing the type test two nodes over locks to the literal `Investigation` type\
    \ — can carry `written_at` as `undefined`. A reader trusting the node's attribute list would build\
    \ downstream logic assuming an `Investigation` always carries a settled written_at; this test instead\
    \ proves the pre-settle, no-second-element case is represented as an `Investigation` value with that\
    \ attribute missing, which is exactly the representation the rule refuses to let the domain model\
    \ call by that name."
  observed_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: 'src/investigation/evidence-collection-stage.ts: held at collectOneEvidence(), passing the whole
    subject through unfiltered — observationSource.observeConcept({ concept, subject, requester, remainingBudgetMs:
    stageCeilingMs }),

    src/persistence/relational-investigation-store.repository.ts: held at subject_type column plus the
    joined subject-attribute-value rows, assembled in investigationOf — subject: { type: row.subject_type,
    attributes },'
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: 'src/__tests__/integration/persistence/schema-migrations.spec.ts: held at insertSubjectAttributeValue''s
    INSERT into investigation_subject_attribute_values, and the test asserting no foreign key still ties
    its attribute column to a vocabulary table. — ''INSERT INTO investigation_subject_attribute_values
    (investigation_id, attribute, value) VALUES ($1,$2,$3)'',

    [options.investigationId, options.attribute, value],

    src/persistence/relational-investigation-store.repository.ts: held at subjectAttributeValueStatement
    (write) and readSubjectAttributeValues (read) — text: `INSERT INTO investigation_subject_attribute_values
    (investigation_id, attribute, value) VALUES ($1, $2, $3)`, params: [investigationId, attribute.attribute,
    attribute.value],'
  encoded_at:
  - src/__tests__/integration/persistence/schema-migrations.spec.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/usage
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at outcomeFromModelText call
    site, line 61 — return outcomeFromModelText(textOf(message), { usage: message.usage, elapsed_ms: elapsedMs,
    prompt });

    src/persistence/relational-investigation-store.repository.ts: held at assessment.usage in assessmentParams/assessmentOf,
    and evaluation.usage in evaluationStatement/callRecordOf — if (row.input_tokens !== null && row.output_tokens
    !== null) { record.usage = { input_tokens: row.input_tokens, output_tokens: row.output_tokens }; }'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/verdict
  conforms: true
  how: "src/investigation/hypothesis-evaluator.port.ts: held at the verdict discriminant of EvaluationOutcome\
    \ — literal 'confirmed' and 'refuted' branches plus Exclude<Verdict, 'confirmed' | 'refuted'> for\
    \ the remaining value — readonly verdict: 'confirmed';\n...\nreadonly verdict: 'refuted';\n...\nreadonly\
    \ verdict: Exclude<Verdict, 'confirmed' | 'refuted'>;\nsrc/investigation/judgment-stage.ts: held at\
    \ asEvaluation, lines 242-248 — if (outcome.verdict === 'confirmed') {\n  return { hypothesis: name,\
    \ verdict: 'confirmed', citations: outcome.citations, ...callRecord };\n}\nif (outcome.verdict ===\
    \ 'refuted') {\n  return { hypothesis: name, verdict: 'refuted', citations: outcome.citations, ...callRecord\
    \ };\n}\n\nsrc/persistence/relational-investigation-store.repository.ts: held at verdictOf/isVerdict,\
    \ validated against the imported VERDICTS vocabulary — const VERDICT_VALUES: ReadonlySet<string> =\
    \ new Set<string>(VERDICTS); ... function isVerdict(value: string): value is Verdict { return VERDICT_VALUES.has(value);\
    \ }"
  encoded_at:
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses line 31 and hypothesisNamed, lines\
    \ 214-216 — const caseContext: CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use\
    \ };\n...\nfunction hypothesisNamed(theCase: Case, name: string): Hypothesis {\n  return theCase.hypotheses.find((candidate)\
    \ => candidate.name === name)!;\n}\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at registerOf/isConsolidationRegister,
    validated against the imported CONSOLIDATION_REGISTERS vocabulary — function registerOf(value: string):
    ConsolidationRegister { if (!isConsolidationRegister(value)) { throw raiseReadFailure(new Error(`investigations
    holds an unrecognized assessment_register "${value}"`)); } return value; }'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: false
  how: "src/http/dto/register-capability.dto.ts, registerCapabilityParamsSchema (name, version) and registerCapabilityBodySchema\
    \ (nature, input_schema, output_schema, connector, concept) — all declared as required, non-optional\
    \ zod fields, four of them additionally with `.min(1)`: export const registerCapabilityParamsSchema\
    \ = z.object({\n  name: z.string().min(1),\n  version: z.string().min(1),\n});\n...\nexport const\
    \ registerCapabilityBodySchema = z.object({\n  nature: z.enum(CAPABILITY_NATURES),\n  input_schema:\
    \ z.string().min(1),\n  output_schema: z.string().min(1),\n  timeout: z.number().int().positive().optional(),\n\
    \  connector: z.string().min(1),\n  concept: z.string().min(1),\n  payload_notes: z.string().optional(),\n\
    }); — An empty or missing name, version, nature, input_schema, output_schema, connector or concept\
    \ fails Zod parsing at the boundary and is answered as a generic HTTP 400 VALIDATION_ERROR (the route's\
    \ declared-shape refusal) before the request ever reaches the capability registry's own completeness\
    \ check. The specification names a distinct refusal for exactly this condition — a registration leaving\
    \ a required attribute absent or empty is undeclared and is refused with HTTP 422 IncompleteCapabilityContractError\
    \ — and that refusal can never be produced through this route: a reader tracing IncompleteCapabilityContractError\
    \ to find where it fires will not find it reachable from register-capability, because the DTO already\
    \ intercepts every one of those cases as a shape violation first."
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
  - src/http/dto/read-capability-by-identity.dto.ts
  - src/http/dto/register-capability.dto.ts
  - src/persistence/relational-capability-store.repository.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at refuseMalformedSchemas()/isWellFormedJson()\
    \ — function refuseMalformedSchemas(registration: DeclaredRegistration): void {\n  const malformed\
    \ = SCHEMA_ATTRIBUTES.filter((attribute) => !isWellFormedJson(registration[attribute]));\n  if (malformed.length\
    \ > 0) {\n    throw new CapabilitySchemaNotWellFormedError(malformed);\n  }\n}\n"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at refuseMalformedInputSchemaShape()\
    \ — function refuseMalformedInputSchemaShape(registration: DeclaredRegistration): void {\n  const\
    \ parsed: unknown = JSON.parse(registration.input_schema);\n  const problems = inputSchemaShapeProblems(parsed);\n\
    \  if (problems.length > 0) {\n    throw new MalformedCapabilityInputSchemaError(problems);\n  }\n\
    }\n"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at heldCapability(), the nature check\
    \ — if (registration.nature !== READ_ONLY_NATURE) {\n  throw new CapabilityNotReadOnlyError(registration.nature);\n\
    }\n"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at refuseOrphanedPlaceholders() and\
    \ orphanedAcrossEveryConfiguration() — const configurations = (await this.connectorConfigurationsReader.readConnectorConfigurations()).filter(\n\
    \  (configuration) => configuration.connector === capability.connector,\n);\nconst orphaned = orphanedAcrossEveryConfiguration(capability,\
    \ configurations);\nif (orphaned.length > 0) {\n  throw new ConnectorPlaceholderOutsideInputSchemaError(orphaned);\n\
    }\n"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
  conforms: true
  how: "src/http/dto/read-capability-by-identity.dto.ts: held at the response schema, lines 11-21 — states\
    \ exactly the nine attributes the policy names (name, version, nature, input_schema, output_schema,\
    \ timeout, connector, concept, payload_notes), with payload_notes the sole optional one — export const\
    \ readCapabilityByIdentityResponseSchema = z.object({\n  name: z.string().min(1),\n  version: z.string().min(1),\n\
    \  nature: z.enum(CAPABILITY_NATURES),\n  input_schema: z.string().min(1),\n  output_schema: z.string().min(1),\n\
    \  timeout: z.int().positive(),\n  connector: z.string().min(1),\n  concept: z.string().min(1),\n\
    \  payload_notes: z.string().optional(),\n});\n"
  encoded_at:
  - src/http/dto/read-capability-by-identity.dto.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: 'no named file holds this fact now: src/investigation/evidence-collection-stage.ts read `nowhere`
    — The file never reads or assembles an address, query, headers or body, and carries no placeholder
    logic; its only outward call is `observationSource.observeConcept({ concept, subject, requester, remainingBudgetMs:
    stageCeilingMs })`, which hands the whole concern to the observation source.'
  observed_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at collectOneEvidence()'s unresolved-capability\
    \ branch, and settledEvidence()'s pass-through of an 'unavailable' outcome — if (!resolution.held)\
    \ {\n    return unavailableEvidence({ concept, inputs, observedAt, attemptStartedAt, conceptDescription\
    \ });\n  }\n...\nresultDetail: new CapabilityNotResolvedForObservationError(concept).name,"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: "src/capability-registry/capability-registry.service.ts: held at readCapability() and refuseAnsweredConcept()\
    \ — function refuseAnsweredConcept(kept: readonly Capability[], registering: Capability): void {\n\
    \  const answering = kept.find((candidate) => candidate.concept === registering.concept);\n  if (answering\
    \ !== undefined) {\n    throw new ConceptAlreadyAnsweredError(registering.concept, answering, registering);\n\
    \  }\n}\n"
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at runIsolatedCall line 89 and isStructurallyValid,
    lines 195-201 — const context: HypothesisCitationContext = { collects: hypothesis.collects, evidence
    };

    ...

    const accepted = acceptedCitations({ ...context, citations });

    return accepted.length === citations.length;

    '
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at fieldElement()/fieldsBlock(),\
    \ lines 177-185, and the SYSTEM_PROMPT instruction, line 24 — function fieldElement(field: FieldSemantics):\
    \ string {\n  const typeAttribute = field.type !== undefined ? ` type=\"${escapeForXmlAttribute(field.type)}\"\
    ` : '';\n  const description = field.description !== undefined ? escapeForXmlText(field.description)\
    \ : '';\n  return `<field name=\"${escapeForXmlAttribute(field.name)}\"${typeAttribute}>${description}</field>`;\n\
    }\nsrc/investigation/judgment-stage.ts: held at isStructurallyValid, line 199, delegating to acceptedCitations\
    \ — const accepted = acceptedCitations({ ...context, citations });"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at parseJudgment(), lines 126-130\
    \ — if (!isCitationArray(citations) || !isNonEmpty(citations)) {\n    return undefined;\n  }\nsrc/investigation/hypothesis-evaluator.port.ts:\
    \ held at the citations field of the confirmed and refuted branches of EvaluationOutcome, typed as\
    \ a non-empty tuple — readonly citations: readonly [Citation, ...Citation[]];\nsrc/investigation/judgment-stage.ts:\
    \ held at isStructurallyValid, lines 195-198 — function isStructurallyValid(context: HypothesisCitationContext,\
    \ citations: readonly Citation[]): boolean {\n  if (citations.length === 0) {\n    return false;\n\
    \  }\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at retryOrFail, lines 107-117 — if (deadlineGuard.elapsed())\
    \ {\n  return judgmentFailureEvaluation(name, first);\n}\nconst retry = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion,\
    \ evidenceItems, caseContext), deadlineGuard);\nif (retry === DEADLINE_ELAPSED) {\n  return deadlineExceededEvaluation(name);\n\
    }\nreturn citationsAreAcceptable(context, retry) ? asEvaluation(name, retry) : judgmentFailureEvaluation(name,\
    \ retry);\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: false
  how: 'no named file holds this fact now: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    read `nowhere` — the one elapsed_ms test in this file only checks expect(outcome.elapsed_ms).toBeGreaterThanOrEqual(20)
    after an artificial 20ms delay; no assertion exercises a sub-millisecond span settling at 0'
  observed_at:
  - src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
- node: rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at ticketRefForWrite/holdsNoTicketReference
    (write) and the ticket_ref spread in investigationOf (read) — function ticketRefForWrite(ticketRef)
    { return holdsNoTicketReference(ticketRef) ? undefined : ticketRef; } function holdsNoTicketReference(value)
    { return value === undefined || value === ''''; }'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at noDataOutcome(), lines 84-90,\
    \ and judgmentFailureOutcome(), lines 92-94 — function noDataOutcome(nonOkEvidence: readonly EvidenceItem[]):\
    \ EvaluationOutcome {\n  return {\n    verdict: 'inconclusive',\n    reason: 'no-data',\n    citations:\
    \ nonOkEvidence.map((item): Citation => ({ concept: item.concept })),\n  };\n}\nsrc/investigation/hypothesis-evaluator.port.ts:\
    \ held at the third branch of EvaluationOutcome, which requires reason — {\n      readonly verdict:\
    \ Exclude<Verdict, 'confirmed' | 'refuted'>;\n      readonly reason: EvaluationReason;\n      readonly\
    \ citations: readonly Citation[];\n      ...\n    }\nsrc/investigation/judgment-stage.ts: held at\
    \ noDataEvaluation, deadlineExceededEvaluation, judgmentFailureEvaluation — return { hypothesis: name,\
    \ verdict: 'inconclusive', reason: 'no-data', citations: nonOkEvidence.map(...) };\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: false
  how: 'src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts, the test "refuses
    a second write of an id already stored through InvestigationAlreadyStoredError, mapped from the root
    insert''s own unique-violation, without any SELECT ever run before it" (lines 276-292): const rejection
    = store.write(anInvestigation({ id: ''an-already-stored-id'' }));


    await expect(rejection).rejects.toBeInstanceOf(InvestigationAlreadyStoredError);

    await expect(rejection).rejects.toMatchObject({ context: { id: ''an-already-stored-id'' } });

    expect(recorded.some((entry) => entry.text.includes(''SELECT''))).toBe(false); — This is the store''s
    own pinned contract for the one case rules/investigation/an-investigation-is-written-once names directly:
    a write against an id already holding a record. The node states that outcome "counts as a write that
    settled," but this file pins `write()` to reject with a distinct typed error instead — so anyone building
    against this repository''s own tested contract sees a duplicate write as a failure requiring special
    handling to reach the settled outcome the specification already decided, rather than finding that
    outcome built into the store itself. The decision log entry for this same rule (rules/investigation/an-investigation-is-written-once.md)
    reasons explicitly that reading this case as unsettled "would answer an HTTP 500 ... to a requester
    whose investigation is durably written," which is exactly the shape a rejected promise pushes a caller
    toward unless every caller remembers to special-case this one error.'
  observed_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at the module-level budget constant and effectiveBoundMsFor()\
    \ — export const COLLECTION_STAGE_BUDGET_MS = 7_000;\n...\nfunction effectiveBoundMsFor(capability:\
    \ Capability, stageCeilingMs: number): number {\n  return Math.max(0, Math.min(capability.timeout,\
    \ stageCeilingMs));\n}"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at requester threaded through collectOneEvidence()\
    \ into serializeInputs() and observeConcept() — function serializeInputs(concept: string, subject:\
    \ Subject, requester: string): string {\n  return JSON.stringify({ concept, subject, requester });\n\
    }"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/judgment-does-not-infer
  conforms: true
  how: 'src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at SYSTEM_PROMPT, line 16 —
    The absence of evidence that would ground a verdict is itself a reason to answer inconclusively —
    never an invitation to infer, assume, or draw on anything beyond the <criterion>, <evidence>, <case_title>
    and <case_when_to_use> the block carries.'
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at itemBlock(), lines 156-165,\
    \ reading only the EvidenceItem's own already-snapshotted fields — `<item concept=\"${escapeForXmlAttribute(item.concept)}\"\
    >`,\n  ...conceptDescriptionLines(item.concept_description),\n  fieldsBlock(item.fields),\n  ...capabilityPayloadNotesLines(item.capability_payload_notes),\n\
    src/investigation/hypothesis-evaluator.port.ts: held at the EvidenceItem type, limited to concept,\
    \ fields, concept_description and capability_payload_notes plus ObservationOutcome's observation/result\
    \ — nothing drawn from a live glossary or registry read — export type EvidenceItem = {\n  readonly\
    \ concept: string;\n  readonly fields: readonly FieldSemantics[];\n  readonly concept_description:\
    \ string;\n  readonly capability_payload_notes: string;\n} & ObservationOutcome;\nsrc/investigation/judgment-stage.ts:\
    \ held at toEvidenceItems, lines 203-212, with no glossary or registry import in the file — return\
    \ evidence.map((item): EvidenceItem => ({\n  concept: item.concept,\n  result: 'ok',\n  observation:\
    \ item.observation,\n  fields: item.fields,\n  concept_description: item.concept_description,\n  capability_payload_notes:\
    \ item.capability_payload_notes,\n}));\n"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at raceObservation() and settledEvidence(),\
    \ recording a timeout rather than aborting — const timer = setTimeout(() => resolve(TIMED_OUT), boundMs);\n\
    ...\nif (outcome === TIMED_OUT) {\n    return evidenceOf(base, { result: 'timeout', resultDetail:\
    \ `no observation within ${effectiveBoundMs}ms`, elapsedMs });\n  }\nsrc/investigation/judgment-stage.ts:\
    \ held at judgeOneHypothesis line 63 and runIsolatedCall/retryOrFail DEADLINE_ELAPSED branches — if\
    \ (!(await acquireSlotOrDeadline(pool, deadlineGuard))) {\n  return deadlineExceededEvaluation(name);\n\
    }\n"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses, lines 32-44 — return Promise.all(\n\
    \  requiredNames.map((name) =>\n    judgeOneHypothesis({ ... }),\n  ),\n);\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at collectEvidence(), one collectOneEvidence\
    \ per concept in the plan — const concepts = collectionPlan(theCase);\n  return Promise.all(\n   \
    \ concepts.map((concept) =>\n      collectOneEvidence({ concept, subject, requester, capabilities,\
    \ glossary, observationSource, stageCeilingMs, now }),\n    ),\n  );"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/written-at-records-when-the-write-settled
  conforms: false
  how: "src/__tests__/unit/investigation/investigation-factory.spec.ts, lines 396-398, the test 'resolves\
    \ to an Investigation itself, never to a second hand-declared type...': it('resolves to an Investigation\
    \ itself, never to a second hand-declared type standing in for every attribute but written_at', ()\
    \ => {\n  expectTypeOf(buildInvestigation).returns.toEqualTypeOf<Promise<Investigation>>();\n}); —\
    \ rules/investigation/written-at-records-when-the-write-settled.md states that what persistence is\
    \ handed \"is the investigation's own content less written_at\" and that \"the domain model declares\
    \ no second element for an investigation assembled but not yet settled\" — a structural distinction\
    \ between the settled Investigation and its pre-settle content. This test asserts, by name, the opposite\
    \ design choice: that buildInvestigation's return type is exactly `Investigation` and \"never a second\
    \ hand-declared type standing in for every attribute but written_at\". Locking this in as a type-level\
    \ contract makes the rule's own prescribed shape (\"content less written_at\") impossible to introduce\
    \ later without failing this test, and leaves a reader of the domain node believing every Investigation\
    \ the code holds is a settled one with written_at present, when the tested return type says otherwise."
  observed_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at judgeHypotheses, line 30 — the derivation itself
    lives in requiresEvaluationOf, imported from ../case/case-resolution.js, not in this file — import
    { requiresEvaluationOf } from ''../case/case-resolution.js'';

    ...

    const requiredNames = requiresEvaluationOf(theCase);

    '
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: "src/persistence/relational-capability-store.repository.ts: held at readCapabilities(), which issues\
    \ a fresh SELECT against the capabilities table on every call, holding nothing remembered between\
    \ calls. — const rows = await runStatement<ICapabilityRow>(\n      this.connection,\n      {\n   \
    \     text: `SELECT name, version, nature, input_schema, output_schema, timeout, connector, concept,\
    \ payload_notes\n               FROM ${CAPABILITIES_TABLE}`,\n      },\n      raiseReadFailure,\n\
    \    );"
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at settledEvidence()'s TIMED_OUT branch —\
    \ if (outcome === TIMED_OUT) {\n    return evidenceOf(base, { result: 'timeout', resultDetail: `no\
    \ observation within ${effectiveBoundMs}ms`, elapsedMs });\n  }\nsrc/investigation/judgment-stage.ts:\
    \ held at judgeOneHypothesis, lines 59-62 — const nonOkEvidence = evidence.filter((item) => item.result\
    \ !== 'ok');\nif (nonOkEvidence.length > 0) {\n  return noDataEvaluation(name, nonOkEvidence);\n}\n"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at retryOrFail, lines 107-117 — if (deadlineGuard.elapsed())\
    \ {\n  return judgmentFailureEvaluation(name, first);\n}\nconst retry = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion,\
    \ evidenceItems, caseContext), deadlineGuard);\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at conceptDescriptionLines(),\
    \ lines 167-169 — function conceptDescriptionLines(conceptDescription: string): readonly string[]\
    \ {\n  return conceptDescription === '' ? [] : [`<concept_description>${escapeForXmlText(conceptDescription)}</concept_description>`];\n\
    }"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at acquireSlotOrDeadline, lines 119-129, and its call\
    \ site line 63 — async function acquireSlotOrDeadline(pool: CallPool, deadlineGuard: DeadlineGuard):\
    \ Promise<boolean> {\n  if (deadlineGuard.elapsed()) {\n    return false;\n  }\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at toEvidenceItems, line 208 — fields: item.fields,'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: "src/investigation/evidence-collection-stage.ts: held at effectiveBoundMsFor() combined with raceObservation()'s\
    \ timer — function effectiveBoundMsFor(capability: Capability, stageCeilingMs: number): number {\n\
    \  return Math.max(0, Math.min(capability.timeout, stageCeilingMs));\n}"
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
unstated:
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: the final assertion of the first test ("reads back a whole investigation exactly as written...")
  evidence: expect(answered?.hash).toBe(createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex'));
  cost: This locks the store's read() into answering a hash field alongside document, computed by one
    specific algorithm (SHA-256 over JSON.stringify(document), UTF-8, hex digest). No node anywhere in
    the specification says a stored investigation carries or answers a content hash, let alone how one
    is computed -- a caller relying on this shape, or a future implementer changing the serialization
    or algorithm, will not find this contract in the specification.
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  where: it('refuses a registration missing a required attribute as IncompleteCapabilityContractError,
    even though the named connector already holds a configuration that would also embed an orphaned placeholder',
    ...)
  evidence: "const refusal = await registry\n  .registerCapability(completeRegistration({ connector: 'erp-http',\
    \ name: undefined }))\n  .catch((error: unknown) => error);\n\nexpect(refusal).toBeInstanceOf(IncompleteCapabilityContractError);\n\
    expect(refusal).not.toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);"
  cost: No node decides which refusal an operator sees when a registration is both incomplete and would
    orphan a connector placeholder; this test fixes IncompleteCapabilityContractError as taking priority
    over ConnectorPlaceholderOutsideInputSchemaError, a business-visible choice that currently lives only
    in this test and the code it pins.
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  where: it('refuses a registration whose connector holds an orphaning configuration as ConnectorPlaceholderOutsideInputSchemaError
    even though its concept is already answered by another capability, since this check runs before the
    concept-uniqueness refusal', ...)
  evidence: 'expect(refusal).toBeInstanceOf(ConnectorPlaceholderOutsideInputSchemaError);

    expect(refusal).not.toBeInstanceOf(ConceptAlreadyAnsweredError);'
  cost: No node decides whether the connector-placeholder-orphan check or the one-capability-answers-one-concept
    check runs first when a registration trips both; the rationale for fixing the placeholder check as
    running first lives only in this test's title.
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  where: the namedAttributes helper and the assertion in it('refuses an empty registration naming every
    required attribute', ...)
  evidence: "function namedAttributes(refusal: unknown): string[] {\n  if (!(refusal instanceof IncompleteCapabilityContractError))\
    \ {\n    throw new Error('expected the incomplete-contract refusal, got something else');\n  }\n \
    \ return refusal.context.problems.map((problem) => problem.split(' ')[0]);\n}\n...\nexpect(namedAttributes(refusal).sort()).toEqual([\n\
    \  'concept',\n  'connector',\n  'input_schema',\n  'name',\n  'nature',\n  'output_schema',\n  'version',\n\
    ]);"
  cost: rules/integration/a-capability-declares-its-contract says only that an incomplete registration
    is refused with an HTTP 422 IncompleteCapabilityContractError; it never says the refusal names which
    required attribute(s) are missing, unlike the sibling rules for MalformedCapabilityInputSchemaError
    and ConnectorPlaceholderOutsideInputSchemaError, whose own statements explicitly say "naming every
    departure" / "naming every orphaned placeholder". This suite locks in a per-attribute problems entry
    across nine separate tests.
- file: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  where: it('resolves the identity exactly as the path spelled it, case and hyphenation preserved, never
    normalized', ...)
  evidence: "it('resolves the identity exactly as the path spelled it, case and hyphenation preserved,\
    \ never normalized', async () => {\n  const built = buildTestApp();\n  app = built.app;\n  built.readCapabilityByIdentity.mockResolvedValueOnce(\n\
    \    heldCapability({ name: 'Mixed-Case-Capability', version: '1.0.0-RC.1' }),\n  );\n\n  await app.inject({\
    \ method: 'GET', url: '/v1/capabilities/Mixed-Case-Capability/1.0.0-RC.1' });\n\n  expect(built.readCapabilityByIdentity).toHaveBeenCalledWith('Mixed-Case-Capability',\
    \ '1.0.0-RC.1');\n});"
  cost: domain/integration/capability and contracts/integration/capability-registry say a capability is
    "identified by name and version" but never say whether that identity matches case-sensitively and
    without any hyphenation/format normalization. This test is the only place that decision lives; a reader
    checking whether two differently-cased requests for the same name resolve to one capability or two
    will not find the answer in the specification, and a later change to fold case before lookup would
    break only this test rather than anything the business is on record as having decided.
- file: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  where: the test "returns exactly the model's own text content, trimmed of surrounding whitespace"
  evidence: 'create.mockResolvedValueOnce(textResponse(''  The consolidated assessment.\n''));

    ...

    expect(outcome.text).toBe(''The consolidated assessment.'');'
  cost: 'The rule this test locks in -- that an assessment''s text is trimmed of its surrounding whitespace
    before the consolidator hands it back -- is stated nowhere but here: domain/investigation/assessment-consolidator''s
    responsibility says only that the call "return[s] the assessment''s text", and domain/investigation/assessment
    declares text as a plain required string with no normalization rule attached.'
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  where: the test 'defaults the token ceiling to 1024 when the caller configures none'
  evidence: 'expect(createMock.mock.calls[0]?.[0]).toMatchObject({ max_tokens: 1024 });'
  cost: '1024 is a threshold that bounds how much of a judgment call''s answer the provider is allowed
    to return -- exactly the kind of call-shaping figure the specification documents elsewhere for a capability''s
    own timeout (its default of sixty seconds is stated in rules/integration/a-capability-declares-its-contract).
    Here the number lives only in this test (and the adapter it pins): a reader auditing or retuning the
    judgment call''s token budget will look for it in the specification and find nothing, and the day
    someone changes it in code without changing a node, nobody can say whether that was a decision or
    a slip.'
- file: src/__tests__/unit/investigation/evidence.spec.ts
  where: the expectTypeOf<Evidence>().toEqualTypeOf<{...}> object literal, the capability reference fields
  evidence: 'readonly capability_name: string;

    readonly capability_version: string;'
  cost: 'domain/investigation/evidence.md states the capability link only as relationships: target: domain/integration/capability,
    type: reference, cardinality: "1" -- it never says the reference is materialized as two flat string
    fields, or names them capability_name and capability_version. A reader who wants to know how this
    required reference is represented has to read this test (or the implementation it type-checks) to
    learn it.'
- file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  where: outcomeFromModelText, lines 104-107
  evidence: "if (parsed === undefined || parsed.verdict === 'inconclusive') {\n    return judgmentFailureOutcome(callRecord);\n\
    \  }"
  cost: 'When the model returns the well-formed `{"verdict":"inconclusive"}` response the system prompt
    itself instructs it to give "whenever the evidence does not ground either" verdict — the honest, no-inference
    answer judgment-does-not-infer calls for, with nothing having actually failed — this branch records
    it under reason "judgment-failure", the identical label used when the response could not be parsed
    at all. A reader relying on the reason to separate a broken call from an evidence-grounded "cannot
    decide" will find the two merged under one label, which is the same confusion an-inconclusive-evaluation-declares-its-reason''s
    own rationale warns against ("an infrastructure failure is read as a domain fact — the pathology the
    rest of the system exists to avoid"), here running the other way: a domain conclusion (the evidence
    does not decide it) is read as an infrastructure failure.'
- file: src/investigation/evidence-collection-stage.ts
  where: the TIMED_OUT branch of settledEvidence(), line 207
  evidence: 'return evidenceOf(base, { result: ''timeout'', resultDetail: `no observation within ${effectiveBoundMs}ms`,
    elapsedMs });'
  cost: This composes the exact text a timeout's result_detail discloses, including the millisecond bound
    the collection stage computed internally. domain/investigation/evidence-result and rules/investigation/no-stage-aborts-on-its-deadline
    say collection "records a timeout result," and scenarios/investigation/a-collection-timeout-degrades-to-no-data
    says only that "the evidence for equipment-state records result timeout" — neither states what the
    recorded detail says. rules/investigation/no-stage-aborts-on-its-deadline treats this kind of disclosed
    wording as a decision worth stating explicitly for its own persistence-timeout case ("a fact of what
    this system discloses, not an implementation detail nobody outside the code could otherwise learn"),
    yet no node states the collection-timeout wording; a reader checking what a timed-out evidence item
    tells its consumer has nowhere in the specification to look, and the message can drift with no node
    to hold it to.
unbound:
- src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
- src/__tests__/unit/http/dto/evidence.dto.spec.ts
- src/__tests__/unit/http/dto/read-capability-by-identity.dto.spec.ts
- src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
- src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
- src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
- src/__tests__/unit/http/register-capability.routes.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
- src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
- src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
- src/__tests__/unit/investigation/citation-validation.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/evidence.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/investigation-pipeline.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
notes: 'Judged by 41 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/capability-payload-notes.returns/.

  Certification of domain/integration/capability did not hold: the auditor answered `partial` — The payload-notes
  half of the fact is exercised whole: notes are declared exactly where the operator supplies them, an
  absent declaration passes as a capability that simply has none rather than an incomplete contract, an
  empty string is held as none, and a read at (name, version) answers what the store currently holds.
  The read-only nature and the completeness of the required contract are exercised attribute by attribute,
  and the accepted-registration test would fail if a required attribute stopped being carried through.
  Three stated parts go unexercised. First, "It answers exactly one concept, the one the registry resolves
  it by": nothing in the set reads a capability by its concept — every read is by name and version — and
  nothing submits a second capability naming a concept another already answers and expects a refusal;
  ConceptAlreadyAnsweredError appears only as a negative assertion inside the placeholder-ordering test,
  which passes whether or not the concept-uniqueness refusal exists at all. Second, the attribute list
  states timeout required, yet the only registration in the set that states no timeout ("holds the default
  of sixty seconds, as 60000 milliseconds, for a registration that states no timeout") asserts a default
  is applied rather than a refusal; nothing exercises timeout as a required declaration, and the divergence
  between the node''s `required: true` and the asserted default is a fact for a reader to route, not one
  settled here. Third, "The capability resolves internally whatever derivation its concept needs — an
  address from a contract, a region from an access — so derivation is never the case''s work": the offered
  proof is a registry-service unit spec that never executes a capability, so nothing in it could fail
  if derivation moved to the case.. The node is decided by reading, and a certification standing on it
  from an earlier reconciliation is released by the bind. The remainder is testable: Three assertions
  close it. One: with a capability registered against a concept, a read resolving by that concept answers
  exactly that capability, and a second registration naming the same already-answered concept is refused
  as ConceptAlreadyAnsweredError with the held capability left unchanged in the store. Two: a registration
  stating no timeout against the result the node''s `required: true` names — a refusal naming `timeout`
  among the missing attributes — which, if the default of sixty seconds is instead the decided behavior,
  is a divergence to settle in the node rather than a test to write. Three: a capability whose concept
  needs a derivation, executed with only the subject attributes its input schema declares, answers the
  derived value without the case having supplied it — an assertion over execution, so it belongs to a
  test file outside the proof offered here, and the state stays short of covered until such a test is
  named as proof for this node..

  Certification of domain/investigation/evidence did not hold: the auditor answered `partial` — The proof
  is a single type-level equality assertion over the Evidence shape. It exercises the attribute half of
  the fact: capability_payload_notes is present and required as a string, alongside every other attribute
  the node names, and the assertion would fail if that attribute were dropped, made optional, or retyped.
  Two reservations sit on even that half. First, the file''s only assertion is `expectTypeOf(...).toEqualTypeOf(...)`,
  which carries no runtime check — it decides the fact only if the "test" step typechecks the spec; run
  as a plain runtime suite it passes unconditionally, and a reader who opens the file should know that
  before counting it as proof. Second, the asserted shape names `capability_name` and `capability_version`
  where the node declares a reference relationship to domain/integration/capability, so the shape the
  test pins is not, member for member, the shape the node states. Beyond the attribute half, everything
  the Description states about capability_payload_notes goes unexercised: that the value is snapshotted
  from the producing capability''s own payload_notes at the moment of collection and never re-read afterward;
  that a capability registered with no payload notes snapshots the empty string rather than failing or
  inventing an account; that an observation whose capability never resolved — leaving no payload notes
  anywhere to take — snapshots that same empty string and ends exactly as the result already records;
  and that an evidence item collected before this attribute existed reads it the identical honest-empty
  way rather than as a read failure. A type equality cannot fail when any of those stop holding.. The
  node is decided by reading, and a certification standing on it from an earlier reconciliation is released
  by the bind. The remainder is testable: Four inputs against four expected results, over a read of a
  collected evidence item: (1) collection from a capability whose registered payload_notes carry text
  — the item''s capability_payload_notes equals that text as the registry held it at collection, and a
  later change to the capability''s payload_notes leaves the collected item unchanged; (2) collection
  from a capability registered with no payload_notes — capability_payload_notes is the empty string, no
  error raised; (3) collection whose capability never resolved — capability_payload_notes is the empty
  string and the item''s result records the unresolved ending as it already does; (4) a stored evidence
  item written without the capability_payload_notes key — read back, capability_payload_notes is the empty
  string and the read succeeds..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/integration/capability,
  domain/investigation/evidence, domain/investigation/hypothesis-evaluator, rules/integration/a-capability-declares-its-contract,
  rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them, rules/investigation/judgment-reads-the-evidence-snapshot,
  constraints/the-stored-schema-mirrors-the-declared-model, constraints/the-schema-replays-from-its-scripts
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  A finding in src/__tests__/unit/investigation/evidence-collection-stage.spec.ts names rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary,
  which no file of this set is bound to: the it.each test description at lines 448–454, for the parametrized
  cause ''MalformedHttpConnectorConfigurationError'': ''carries %s as the evidence result_detail for a
  held capability whose observation ends unavailable for that cause (rules/integration/an-unresolvable-observation-ends-unavailable,
  rules/integration/an-http-connector-configuration-declares-its-call)'', — A reader who wants to know
  why ''MalformedHttpConnectorConfigurationError'' is a valid result_detail follows this citation to `an-http-connector-configuration-declares-its-call`,
  whose own statement covers only the address, query, headers and body a connector call may declare and
  never mentions a method, a statusMap or this error at all. The node that actually states the required
  keys and this exact error — `an-http-connector-configuration-declares-its-method-and-status-vocabulary`,
  whose statement reads "...an observation reaching a configuration that lacks any of the three issues
  no call and ends unavailable, with a result detail reporting a MalformedHttpConnectorConfigurationError..."
  — is never named, so the citation sends the next reader to the wrong page of the specification for three
  of the four causes'' shared rule and a fourth cause the cited node does not govern.. It blocks nothing
  here; it is owed a route of its own.

  A finding in src/investigation/evidence.ts names rules/knowledge/a-collected-concept-declares-a-ttl,
  which no file of this set is bound to: line 4, the module-level constant beside the `Evidence` type:
  export const DEFAULT_EVIDENCE_TTL_SECONDS = 60; — The sixty-second default is a decided fact of rules/knowledge/a-collected-concept-declares-a-ttl
  (per the decision log: "Sixty seconds... one minute keeps any cached observation fresher than the investigation
  deadline by a factor of three"), and it belongs to a concept''s own declared ttl, not to evidence''s
  ttl attribute (domain/investigation/evidence.ttl is required and always populated from whatever ttl
  the concept already resolved at collection). Restating the number here under an evidence-scoped name
  gives the decided default a second, disconnected home: if the specification''s default ever changes,
  nothing ties this constant to that decision, and a reader of this file has no way to tell the number
  is not this file''s own to decide.. It blocks nothing here; it is owed a route of its own.

  Candidates: 132 opened across 25 of 41 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 10 fact(s) the source states that no node holds, over 8 file(s), listed under `unstated`.
  They block no binding here and no rebind closes them — the route is the analysis that gives each fact
  a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/capability-payload-notes.returns/`, which are the evidence behind every entry above.
