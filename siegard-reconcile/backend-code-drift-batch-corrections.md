---
contract_version: siegard-reconcile/3
title: Review of backend-code-drift-batch-corrections
summary: 'Six tasks of the backend-code-drift-batch-corrections initiative were delivered by /implement-task
  and merged into main: case-version-state-from-canonical-list, input-requirements-validates-at-read,
  malformed-configuration-vocabularies, simulation-response-integer-fields, written-at-is-required, and
  seeded-concepts-declare-descriptions. Each wrote its own source file(s) and its own proof''s test file(s),
  per its own implementation and proof record under delivery/backend-code-drift-batch-corrections/.'
target: backend
files:
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: written by the delivery of case-version-state-from-canonical-list
- path: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  change: written by the delivery of written-at-is-required
- path: src/__tests__/integration/seed.spec.ts
  change: written by the delivery of seeded-concepts-declare-descriptions
- path: src/__tests__/unit/case/case-query.service.spec.ts
  change: written by the delivery of input-requirements-validates-at-read
- path: src/__tests__/unit/fixtures/concept-fixture-declares-descriptions.spec.ts
  change: written by the delivery of seeded-concepts-declare-descriptions
- path: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  change: written by the delivery of simulation-response-integer-fields
- path: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  change: written by the delivery of simulation-response-integer-fields
- path: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  change: written by the delivery of malformed-configuration-vocabularies
- path: src/__tests__/unit/investigation/investigation-factory.spec.ts
  change: written by the delivery of written-at-is-required
- path: src/__tests__/unit/investigation/investigation.spec.ts
  change: written by the delivery of written-at-is-required
- path: src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
  change: written by the delivery of case-version-state-from-canonical-list
- path: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  change: written by the delivery of written-at-is-required
- path: src/__tests__/unit/seed.spec.ts
  change: written by the delivery of seeded-concepts-declare-descriptions
- path: src/case/case-query.service.ts
  change: readCaseInputRequirements calls a new private refuseGlossaryIncoherence(theCase, version) immediately
    after structuralCase, throwing CaseVersionNotValidError when structural or glossary/concept coherence
    fails at that reading; readCase's own refuseIncoherence, including the capability-availability check,
    is unchanged. Delivered by input-requirements-validates-at-read.
- path: src/case/validate-case-coherence.ts
  change: exports a new glossaryCoherenceViolations(theCase, glossary) composing vocabularyViolations
    + conceptViolations, with no capability-registry involvement; caseCoherenceViolations composes glossaryCoherenceViolations
    + capabilityViolations and still returns the same total violations. Delivered by input-requirements-validates-at-read.
- path: src/fixtures/glossary/concept.json
  change: declares a non-empty description for each of its two concepts (equipment-status, network-outage-flag),
    alongside their unchanged name, accepts and ttl. Delivered by seeded-concepts-declare-descriptions.
- path: src/http/dto/simulate-case.dto.ts
  change: usageSchema.input_tokens/.output_tokens, every evaluationSchema variant's elapsed_ms, and durationsSchema.collection/.judgment/.total/.writing
    are now z.int() instead of z.number(); optionality unchanged throughout. Delivered by simulation-response-integer-fields.
- path: src/http/dto/simulate-hypothesis.dto.ts
  change: the same usageSchema, evaluationSchema.elapsed_ms and durationsSchema (collection, judgment,
    total) tightened from z.number() to z.int() the same way. Delivered by simulation-response-integer-fields.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: httpConfigurationProblems's two malformed-vocabulary problem messages (method outside the accepted
    set, statusMap not mapping to an accepted ending) now interpolate HTTP_METHODS.join(', ') and EVIDENCE_RESULTS.join(',
    ') respectively, rather than spelling the vocabularies as literal text. Delivered by malformed-configuration-vocabularies.
- path: src/investigation/investigation-factory.ts
  change: 'buildInvestigation''s returned object literal now assigns written_at: options.written_at! instead
    of written_at: options.written_at, via a non-null assertion, with BuildInvestigationOptions.written_at
    staying optional. Delivered by written-at-is-required.'
- path: src/investigation/investigation.ts
  change: 'Investigation.written_at is now declared readonly written_at: string (no optional marker),
    matching the required attribute domain/investigation/investigation declares. Delivered by written-at-is-required.'
- path: src/persistence/relational-case-store.repository.ts
  change: isCaseVersionState now returns CASE_VERSION_STATE_VALUES.has(value) -- a ReadonlySet built from
    the imported CASE_VERSION_STATES array (src/case/case.ts) -- instead of comparing value against the
    literal strings 'draft' and 'released'. Delivered by case-version-state-from-canonical-list.
- path: src/seed.ts
  change: ConceptFixture now requires a description field, and seedConcepts() reads it from the fixture
    and publishes it into the concepts table's description column on every run, via ON CONFLICT (name)
    DO UPDATE SET description = EXCLUDED.description. Delivered by seeded-concepts-declare-descriptions.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, src/persistence/relational-case-store.repository.ts,
    and src/seed.ts read `nowhere` — await createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf, lines
    230-234 — const extracted = extractResponseFields(responseMap, body); const declaredFields = declaredFieldsOf(capability.output_schema);
    return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: false
  how: 'the fact left part of its ground: still held in src/investigation/investigation-factory.ts, src/investigation/investigation.ts,
    and src/investigation/http-declarative-observation-source.adapter.ts read `nowhere` — import { issueConnectorHttpCall
    } from ''../http-connector/connector-http-issuer.js''; — this file is the infrastructure adapter itself,
    not a domain module the fitness constrains — a binding asserts the file answers for the node, so the
    pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept, lines
    76-91 — public async observeConcept({ concept, subject, requester, remainingBudgetMs }: ObserveConceptOptions):
    Promise<ObservationOutcome> {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveConnectorConfiguration,
    lines 139-147 — const resolution = await this.connectorConfigurations.readConnectorConfiguration(connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at the whole file — simulateCaseRequestSchema and simulateCaseResponseSchema\
    \ — export const simulateCaseRequestSchema = z.object({\n  case: caseRefSchema,\n  subject: subjectSchema,\n\
    \  requester: z.string().min(1),\n});\nsrc/http/dto/simulate-hypothesis.dto.ts: held at the whole\
    \ file — simulateHypothesisRequestSchema and simulateHypothesisResponseSchema — export const simulateHypothesisRequestSchema\
    \ = z.object({\n  case: caseRefSchema,\n  subject: subjectSchema,\n  requester: z.string().min(1),\n\
    \  hypothesis: z.string().min(1),\n});\n...\nexport const simulateHypothesisResponseSchema = z.object({\n\
    \  evidence: z.array(evidenceSchema).readonly(),\n  evaluation: evaluationSchema,\n  durations: durationsSchema,\n\
    });"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: contracts/investigation/glossary-source
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at refuseAttributesNotInGlossary''s call into
    the glossary port — const resolution = await glossary.readVocabularyTerm(''subject-attribute'', name);'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at class declaration, line
    65 — export class HttpDeclarativeObservationSource implements IObservationSource {'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/knowledge/capability-check
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at the loop in capabilityViolations, which calls the
    query for each collected concept — violations.push(...answerGaps(name, await capabilities.readCapability(name)));'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at the class''s public write methods,
    lines 179-215 (releaseHypothesisRevision, createDraft, insertHypothesisRevision, overwriteHypothesisRevision,
    placeHypothesis, removeManifestEntry, release, discard, updateDraft) — public async createDraft(input:
    CreateDraftInput): Promise<number> { ... }'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/case/case-query.service.ts: held at the five public methods of CaseQueryService (readCase,
    listCases, listCaseVersions, listHypotheses, listHypothesisRevisions) — public async readCase(slug:
    string, version: number): Promise<ReadCaseResult> and public async listCases(pagination: PaginationRequest):
    Promise<PaginatedResponse<CaseCatalogEntry>> and the matching listCaseVersions/listHypotheses/listHypothesisRevisions
    signatures

    src/persistence/relational-case-store.repository.ts: held at listCases, listCaseVersions, listHypotheses,
    listHypothesisRevisions, assembleVersion, lines 125-158 — public async listCases(pagination: PaginationRequest):
    Promise<PaginatedResponse<CaseCatalogEntry>> { return runInTransaction(this.connection, raiseReadFailure,
    (tx) => listCasesPage(tx, pagination)); }'
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: contracts/knowledge/vocabulary-terms
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at vocabularyViolations'' call to readVocabularyTerm
    and conceptViolations'' call to readConcept — const resolution = await glossary.readVocabularyTerm(vocabulary,
    name); ... const resolution = await glossary.readConcept(name);'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/system/case-authoring
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/validate-case-coherence.ts, and src/case/case-query.service.ts
    read `nowhere` — export class CaseQueryService implements ICaseQuery, ICaseInputRequirementsQuery
    { — the class exposes only read operations (readCase, readCaseInputRequirements, the four listings);
    no compose/release/discard operation appears — a binding asserts the file answers for the node, so
    the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
- node: contracts/system/corporate-records
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveConnectorConfiguration
    call, line 104 — const configurationResolution = await this.resolveConnectorConfiguration(capability.connector);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/glossary/action
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at the assertion at the 'holds exactly the fixture's\
    \ own action names' test — const { rows } = await connection.query<{ name: string }>('SELECT name\
    \ FROM actions WHERE name = ANY($1)', [expected]);\n\n  expect(rows.map((row) => row.name).sort()).toEqual([...expected].sort());"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/concept
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at the concept-shape assertion and the description-column\
    \ assertion — 'SELECT name, ttl FROM concepts WHERE name = ANY($1)' ... 'SELECT concept_name, subject_type_name\
    \ FROM concept_accepts WHERE concept_name = ANY($1)' ... expect(stored?.description).toBe(concept.description);\n\
    src/fixtures/glossary/concept.json: held at each array entry — name/accepts/ttl/description — { \"\
    name\": \"equipment-status\", \"accepts\": [\"contract\"], \"ttl\": 300, \"description\": \"The operating\
    \ status corporate systems currently report for the customer's registered equipment.\" }\nsrc/seed.ts:\
    \ held at the ConceptFixture type and seedConcepts' insert, lines 40-45 and 67-83 — type ConceptFixture\
    \ = {\n  readonly name: string;\n  readonly accepts: readonly string[];\n  readonly ttl: number;\n\
    \  readonly description: string;\n};"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/fixtures/glossary/concept.json
  - src/seed.ts
- node: domain/glossary/outcome
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at the two outcomes tests ('holds both non-conclusion\
    \ outcomes...' and 'holds exactly the fixture's own outcome names...') — const { rows } = await connection.query<{\
    \ name: string }>('SELECT name FROM outcomes WHERE name = ANY($1)', [nonConclusionNames]);\n\n   \
    \ expect(rows.map((row) => row.name).sort()).toEqual([...nonConclusionNames].sort());\nsrc/seed.ts:\
    \ held at seedOutcomes, lines 26-31 — const known = new Set(fixtureOutcomes.map((outcome) => outcome.name));"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/seed.ts
- node: domain/glossary/recipient
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the ''holds exactly the fixture''s own recipient
    names'' test — const { rows } = await connection.query<{ name: string }>(''SELECT name FROM recipients
    WHERE name = ANY($1)'', [expected]);'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the attribute names read off subject.attributes
    and checked against the glossary — for (const name of new Set(subject.attributes.map((pair) => pair.attribute)))
    {'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the ''holds exactly the fixture''s own subject-type
    name'' test — const { rows } = await connection.query<{ name: string }>(''SELECT name FROM subject_types
    WHERE name = ANY($1)'', [expected]);'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
- node: domain/integration/capability
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor,
    lines 61-63 — function effectiveTimeoutMsFor(capability: Capability, remainingBudgetMs: number | undefined):
    number { return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout,
    remainingBudgetMs); }'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/assessment
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at assessmentSchema, lines 78-87 — const assessmentSchema\
    \ = z.object({\n  outcome: z.string().min(1),\n  referral: referralSchema,\n  determining_hypothesis:\
    \ z.string().min(1).optional(),\n  text: z.string().min(1),\n  register: z.enum(CONSOLIDATION_REGISTERS),\n\
    \  usage: usageSchema,\n  elapsed_ms: z.int(),\n  prompt: z.string(),\n});"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/citation
  conforms: false
  how: 'src/__tests__/unit/http/dto/simulate-case.dto.spec.ts, the test at lines 52-63, "validates a confirmed
    evaluation''s citation that carries no field key at all, since the shared citation schema now leaves
    field optional for every verdict branch, not narrowed to the inconclusive branch alone" (repeated
    at lines 274-293 and 303-314, each with a confirmed-verdict citation carrying only concept): { hypothesis:
    ''a-hypothesis'', verdict: ''confirmed'', citations: [{ concept: ''a-concept'' }] } ... expect(result.success).toBe(true)
    — domain/investigation/citation ties field''s presence to the verdict — required for confirmed or
    refuted, absent only for a no-data citation — but this suite asserts a confirmed citation with no
    field validates and titles the assertion as the schema''s own current rule; the next reader who trusts
    the suite over the node ships a confirmed verdict with no traceable evidence field and the tests will
    not catch it.'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/cost
  conforms: false
  how: "src/__tests__/unit/http/dto/simulate-case.dto.spec.ts, lines 316-322, \"validates a response whose\
    \ cost.calls is fractional, since domain/investigation/cost stays outside this task's scope\": cost:\
    \ { calls: 1.5, input_tokens: 1, output_tokens: 1 } ... expect(result.success).toBe(true) — domain/investigation/cost\
    \ types calls as a required integer; this test names that very node and then asserts a fractional\
    \ calls value is valid, so anything downstream that compares call counts (billing, load analysis)\
    \ can silently receive a fractional count the domain model was written to exclude, and the suite itself\
    \ is the place recording that this is acceptable.\nsrc/http/dto/simulate-case.dto.ts, costSchema,\
    \ lines 89-93: const costSchema = z.object({\n  calls: z.number(),\n  input_tokens: z.number(),\n\
    \  output_tokens: z.number(),\n}); — domain/investigation/cost declares calls, input_tokens and output_tokens\
    \ as integers; z.number() accepts any finite value including fractions, so a malformed cost (e.g.\
    \ an averaged or miscomputed count) passes this response validation though the specification's own\
    \ shape never allows a non-integer here — and usageSchema, four lines above in the same file, validates\
    \ the identically-named input_tokens/output_tokens as z.int(), so the same fact is checked two different\
    \ ways in one file."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
- node: domain/investigation/durations
  conforms: false
  how: 'src/__tests__/unit/investigation/investigation-factory.spec.ts, the aDurations fixture, line 141-143
    (its default is reused by validOptions() across nearly every test in the file): return { collection:
    10, judgment: 20, writing: 5, total: 35, ...overrides }; — the one default durations value every test
    in the file draws on embodies total as exactly collection + judgment + writing (10+20+5=35); a reader
    treating this fixture as an example of a valid Durations value — the way test fixtures ordinarily
    are read — takes away that total is the sum of the stages, the opposite of what the specification
    states, and may carry that assumption into a load-test comparison or a new fixture that actually depends
    on the relationship'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evaluation
  conforms: false
  how: "src/__tests__/unit/http/dto/simulate-case.dto.spec.ts, lines 303-314, \"validates a response whose\
    \ evaluation carries neither usage nor elapsed_ms and whose durations carries no writing, matching\
    \ a run that made no model call and reached no consolidation\": { hypothesis: 'a-hypothesis', verdict:\
    \ 'confirmed', citations: [{ concept: 'a-concept' }] } ... expect(result.success).toBe(true) — domain/investigation/evaluation\
    \ states usage, elapsed_ms and prompt are present exactly when a call happened and absent only when\
    \ reason is no-data — a state only an inconclusive verdict carries — yet this test names a confirmed\
    \ verdict as the case of \"a run that made no model call\"; a reader of the suite comes away believing\
    \ a confirmed verdict can exist without a judgment call ever having run, which the node rules out.\n\
    src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts, the test titled \"validates a response\
    \ whose evaluation carries usage and elapsed_ms as integers, matching a completed simulation that\
    \ made a model call\" (lines 159-170) and the test titled \"validates a response whose evaluation\
    \ carries neither usage nor elapsed_ms, matching a run that made no model call\" (lines 180-186):\
    \ it('validates a response whose evaluation carries usage and elapsed_ms as integers, matching a completed\
    \ simulation that made a model call' — domain/investigation/evaluation already states that usage,\
    \ elapsed_ms and prompt are \"present exactly when a call happened, absent when reason no-data means\
    \ judgment was never called at all\"; these two test titles restate that same conditional-presence\
    \ rule in their own words as the reason the fixtures are shaped this way, rather than only asserting\
    \ that the schema accepts or omits the fields. If that conditional-presence rule is later refined\
    \ in the node, these titles keep asserting the old pairing without the specification changing, so\
    \ a reader trusts the test's own wording for a fact the node, not the test, is supposed to be the\
    \ one home for.\nsrc/http/dto/simulate-case.dto.ts, usage, elapsed_ms and prompt on the confirmed\
    \ and refuted branches of evaluationSchema, lines 44-46 and 52-54: usage: usageSchema.optional(),\n\
    \    elapsed_ms: z.int().optional(),\n    prompt: z.string().optional(), — domain/investigation/evaluation\
    \ states these three are \"present exactly when a call happened, absent when reason no-data means\
    \ judgment was never called at all\" — a state only the inconclusive branch can reach, since deciding\
    \ confirmed or refuted always required the judgment call to run; marking them optional here too means\
    \ a response missing usage/elapsed_ms/prompt on a confirmed or refuted evaluation validates as if\
    \ the specification allowed that combination, though it never does, and a consumer reading this schema\
    \ alone would not learn that these are actually mandatory there."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'src/http/dto/simulate-case.dto.ts: held at the inconclusive branch of evaluationSchema, line 59
    — reason: z.enum(EVALUATION_REASONS),

    src/http/dto/simulate-hypothesis.dto.ts: held at the reason field of the inconclusive branch, line
    62 — reason: z.enum(EVALUATION_REASONS),'
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evidence
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/dto/simulate-case.dto.ts, and src/http/dto/simulate-hypothesis.dto.ts
    read `nowhere` — evidence: z.array(evidenceSchema).readonly(), — the shape is declared in the imported
    ./evidence.dto.js, not in this file — a binding asserts the file answers for the node, so the pair
    that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: 'the fact left part of its ground: still held in src/investigation/http-declarative-observation-source.adapter.ts,
    and src/http/dto/simulate-case.dto.ts read `nowhere` — import { evidenceSchema } from ''./evidence.dto.js'';;
    src/http/dto/simulate-hypothesis.dto.ts read `nowhere` — import { evidenceSchema } from ''./evidence.dto.js'';
    — this file never names an evidence-result value directly — a binding asserts the file answers for
    the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/investigation
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at the object literal buildInvestigation returns\
    \ — return {\n    id: options.id,\n    requester: options.requester,\n    ticket_ref: options.ticket_ref,\n\
    \    narrative: options.narrative,\n    subject,\n    pinned_case: pinnedCaseOf(theCase),\n    prompt_version:\
    \ options.prompt_version,\n    model: options.model,\n    evidence: [...evidence],\n    evaluations:\
    \ [...evaluations],\n    assessment: options.assessment,\n    cost: options.cost,\n    durations:\
    \ options.durations,\n    written_at: options.written_at!,\n  };\nsrc/investigation/investigation.ts:\
    \ held at the Investigation type declaration, lines 13-30 — export type Investigation = {\n  readonly\
    \ id: string;\n  readonly requester: string;\n\n  readonly ticket_ref?: string;\n  readonly narrative:\
    \ string;\n  readonly subject: Subject;\n  readonly pinned_case: PinnedCase;\n  readonly prompt_version:\
    \ string;\n  readonly model: string;\n  readonly evidence: readonly Evidence[];\n  readonly evaluations:\
    \ readonly Evaluation[];\n  readonly assessment: Assessment;\n  readonly cost: Cost;\n  readonly durations:\
    \ Durations;\n\n  readonly written_at: string;\n};"
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
- node: domain/investigation/subject
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at subjectSchema, lines 11-14 — const subjectSchema =\
    \ z.object({\n  type: z.string().min(1),\n  attributes: z.array(subjectAttributeValueSchema).min(1),\n\
    });\nsrc/http/dto/simulate-hypothesis.dto.ts: held at subjectSchema, lines 11-14 — const subjectSchema\
    \ = z.object({ type: z.string().min(1), attributes: z.array(subjectAttributeValueSchema).min(1) });\n\
    src/investigation/investigation-factory.ts: held at the call to buildSubject and the returned subject\
    \ field — const subject = buildSubject(subjectType, subjectAttributes);"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/investigation-factory.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at subjectAttributeValueSchema, lines 6-9 — const subjectAttributeValueSchema\
    \ = z.object({\n  attribute: z.string().min(1),\n  value: z.string().min(1),\n});\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at subjectAttributeValueSchema, lines 6-9 — const subjectAttributeValueSchema = z.object({\
    \ attribute: z.string().min(1), value: z.string().min(1) });\nsrc/investigation/investigation-factory.ts:\
    \ held at the .attribute field read off each pair in refuseAttributesNotInGlossary — subject.attributes.map((pair)\
    \ => pair.attribute)"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/investigation-factory.ts
- node: domain/investigation/usage
  conforms: true
  how: "src/http/dto/simulate-case.dto.ts: held at usageSchema, lines 34-37 — const usageSchema = z.object({\n\
    \  input_tokens: z.int(),\n  output_tokens: z.int(),\n});\nsrc/http/dto/simulate-hypothesis.dto.ts:\
    \ held at usageSchema, lines 35-38 — const usageSchema = z.object({ input_tokens: z.int(), output_tokens:\
    \ z.int() });"
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/verdict
  conforms: false
  how: 'src/http/dto/simulate-case.dto.ts, the verdict literals inside evaluationSchema''s discriminated
    union, lines 42, 50, 58: verdict: z.literal(''confirmed''), / verdict: z.literal(''refuted''), / verdict:
    z.literal(''inconclusive''), — the sibling src/http/dto/simulate-hypothesis.dto.ts imports the same
    vocabulary — import { VERDICTS } from ''../../investigation/verdict.js''; and const [CONFIRMED_VERDICT,
    REFUTED_VERDICT, INCONCLUSIVE_VERDICT] = VERDICTS; — so this file hardcodes a second copy of the same
    three strings; if a verdict value is ever added or renamed at its one declared source, this schema
    has no dependency on that source and can silently drift out of sync while still looking correct.'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/knowledge/case
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/validate-case-coherence.ts, src/persistence/relational-case-store.repository.ts,
    and src/case/case-query.service.ts read `nowhere` — import type { Case, Hypothesis, ManifestEntry
    } from ''./case.js''; — the file only reads a Case''s fields (slug, title, manifest, ...) already
    assembled by the store; no next_version counter or create-draft operation appears — a binding asserts
    the file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-summary
  conforms: true
  how: "src/persistence/relational-case-store.repository.ts: held at caseCatalogEntryOf, lines 319-329\
    \ — return {\n  slug: row.slug,\n  ...(row.current_state !== null ? { current_state: caseVersionStateOf(row.current_state)\
    \ } : {}),\n  version_count: Number(row.version_count),\n  ...\n};"
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at the 'the case is stored...' test and the 'reads\
    \ the seeded version back whole...' test — expect(result.case.slug).toBe(fixture.slug);\n    expect(result.case.title).toBe(fixture.title);\n\
    \    ...\n    expect(result.case.fallback).toEqual(fixture.fallback);\nsrc/case/validate-case-coherence.ts:\
    \ held at namedVocabularyTerms reading the declared subject type, and declaredResolutions reading\
    \ the fallback — { vocabulary: 'subject-type', name: theCase.subject }, ... return [...theCase.hypotheses.map((hypothesis)\
    \ => hypothesis.resolution), theCase.fallback];\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at ICaseVersionRow (63-74), draftInsertStatement (674-695), updateDraftStatement (896-916),\
    \ assembledCaseVersionOf (255-270) — readonly title: string; readonly when_to_use: string; readonly\
    \ authored_at: Date; readonly subject: string; ... readonly state: string; readonly released_at: Date\
    \ | null;"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/case/validate-case-coherence.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at CASE_VERSION_STATE_VALUES (line 91)
    and caseVersionStateOf (940-945) — const CASE_VERSION_STATE_VALUES: ReadonlySet<string> = new Set<string>(CASE_VERSION_STATES);'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: "src/case/case-query.service.ts: held at trustedHypothesisOf / flatHypothesisOf-style projection\
    \ (lines 131-139) — function trustedHypothesisOf(entry: ManifestEntry): Hypothesis {\n  const revision\
    \ = entry.hypothesis_revision;\n  return {\n    name: revision.hypothesis.name,\n    criterion: revision.criterion,\n\
    \    collects: revision.collects,\n    resolution: revision.resolution,\n  };\n}\nsrc/case/validate-case-coherence.ts:\
    \ held at declaredResolutions mapping each of the case's hypotheses to its resolution — return [...theCase.hypotheses.map((hypothesis)\
    \ => hypothesis.resolution), theCase.fallback];\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at hypothesisIdentityStatement, lines 730-735 — INSERT INTO hypotheses (case_slug, name) VALUES\
    \ ($1, $2) ON CONFLICT (case_slug, name) DO NOTHING"
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the overwrite\
    \ test (line 1766) — calls overwriteHypothesisRevision with new content while asserting the revision\
    \ number is unchanged — await store.overwriteHypothesisRevision({ slug, hypothesis_name: 'a-hypothesis',\
    \ revision, criterion: 'the replaced criterion', collects: [], resolution: aResolution(glossary) });\n\
    const page = await store.listHypothesisRevisions(slug, 'a-hypothesis', { offset: 0, limit: 20 });\n\
    expect(page.data.map((item) => item.revision)).toEqual([revision]);\nsrc/case/validate-case-coherence.ts:\
    \ held at conceptViolations and capabilityViolations walking collectionPlan(theCase), the union of\
    \ every manifested revision's collected concepts — for (const name of collectionPlan(theCase)) {\n\
    src/persistence/relational-case-store.repository.ts: held at IHypothesisRevisionRow (465-472), revisionInsertStatement\
    \ (746-757), releaseHypothesisRevisionRow (615-617) — INSERT INTO hypothesis_revisions (case_slug,\
    \ hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient,\
    \ state) SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, ...\nsrc/seed.ts: held at the reviseHypothesis\
    \ call in placeFixtureHypotheses, lines 106-113 — const revised = await lifecycle.reviseHypothesis({\n\
    \      slug: fixture.slug,\n      hypothesis_name: entry.hypothesis_name,\n      criterion: entry.criterion,\n\
    \      collects: entry.collects,\n      resolution: entry.resolution,\n      subject: fixture.subject,\n\
    \    });"
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/case/validate-case-coherence.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the assertions
    naming state: ''draft'' / state: ''released'' on listHypothesisRevisions results (e.g. line 636) —
    expect(page.data).toEqual([{ revision, criterion: ''a criterion'', collects: [], resolution: aResolution(glossary),
    state: ''released'' }]);

    src/persistence/relational-case-store.repository.ts: held at HYPOTHESIS_REVISION_STATE_VALUES (line
    93) and hypothesisRevisionStateOf (578-583) — const HYPOTHESIS_REVISION_STATE_VALUES: ReadonlySet<string>
    = new Set<string>(HYPOTHESIS_REVISION_STATES);

    src/seed.ts: held at the releaseHypothesisRevision call in releaseManifestedRevisions, line 132 —
    await lifecycle.releaseHypothesisRevision(slug, revision.hypothesis_name, revision.revision);'
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: domain/knowledge/manifest-entry
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at IManifestRow (76-84) and manifestEntryOf
    (244-253) — return { position: row.position, hypothesis_revision: hypothesisRevision };'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/referral
  conforms: true
  how: "src/case/validate-case-coherence.ts: held at namedVocabularyTerms reading each resolution's referral\
    \ action and recipient — ...termsOf('action', resolutions.map((resolution) => resolution.referral.action)),\
    \ ...termsOf('recipient', resolutions.map((resolution) => resolution.referral.recipient)),\nsrc/http/dto/simulate-case.dto.ts:\
    \ held at referralSchema, lines 67-70 — const referralSchema = z.object({\n  action: z.string().min(1),\n\
    \  recipient: z.string().min(1),\n});"
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/http/dto/simulate-case.dto.ts
- node: domain/knowledge/resolution
  conforms: true
  how: "src/case/validate-case-coherence.ts: held at namedVocabularyTerms reading each resolution's outcome\
    \ — ...termsOf('outcome', resolutions.map((resolution) => resolution.outcome)),\nsrc/http/dto/simulate-case.dto.ts:\
    \ held at the outcome/referral pair of resolvedOutcomeSchema, lines 72-76 — const resolvedOutcomeSchema\
    \ = z.object({\n  outcome: z.string().min(1),\n  referral: referralSchema,\n  determining: z.string().min(1).optional(),\n\
    });"
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/http/dto/simulate-case.dto.ts
- node: rules/glossary/a-description-states-meaning-never-policy
  conforms: true
  how: 'src/fixtures/glossary/concept.json: held at the description field of each entry — "description":
    "Whether an active network outage is currently registered for the contract''s service area."'
  encoded_at:
  - src/fixtures/glossary/concept.json
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: "src/seed.ts: held at seedOutcomes, lines 26-31, called before seedCase in the main sequence —\
    \ const missing = NON_CONCLUSION_OUTCOMES.filter((outcome) => !known.has(outcome.name));\n  await\
    \ store.insertMissingTerms('outcome', [...fixtureOutcomes, ...missing]);"
  encoded_at:
  - src/seed.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: 'src/investigation/http-declarative-observation-source.adapter.ts, unavailableFor, lines 52-54,
    as invoked from the MalformedHttpConnectorConfigurationError catch in resolveHttpConnectorCallConfiguration,
    lines 155-157: if (!isHttpMethod(configuration.method)) { problems.push(`method is not one of ${HTTP_METHODS.join('',
    '')}`); } ... if (!isStatusEndingMap(configuration.statusMap)) { problems.push(`statusMap is not a
    plain object mapping a status to one of ${EVIDENCE_RESULTS.join('', '')}`); } ... throw new MalformedHttpConnectorConfigurationError(connector,
    problems); ... if (error instanceof MalformedHttpConnectorConfigurationError) { return { ok: false,
    outcome: unavailableFor(error) }; } ... function unavailableFor(error: Error): ObservationOutcome
    { return { result: ''unavailable'', result_detail: error.name }; } — An operator reading result_detail
    for a malformed method or statusMap sees only the literal string "MalformedHttpConnectorConfigurationError"
    — the accepted HTTP methods or evidence-result endings httpConfigurationProblems computed are discarded
    before the outcome is built, so the operator has to go elsewhere (source, logs) to learn what value
    was expected, defeating the rule''s own stated reason for carrying the vocabulary in the detail at
    all.'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at endingForStatus, lines
    217-220 — return isEvidenceResult(mapped) ? mapped : DEFAULT_STATUS_ENDING;'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unreachable-connector-ends-unavailable
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at unavailableForUnreachableConnector
    (56-59) and issueRequestOrUnreachable''s catch (197-199) — const error = new ConnectorUnreachableError(connector,
    { cause }); return { result: ''unavailable'', result_detail: `${error.name}: ${connector}` };'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveCapability (123-137),
    resolveConnectorConfiguration (139-147), resolveAssembledRequest (163-176) — if (!resolution.held)
    { return { ok: false, outcome: unavailableFor(new CapabilityNotResolvedForObservationError(concept))
    }; }'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observationOf, lines
    230-234 — return Object.fromEntries(Object.entries(extracted).filter(([field]) => declaredFields.includes(field)));'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at refuseAttributesNotInGlossary, invoked before\
    \ the record is assembled — await refuseAttributesNotInGlossary(subject, glossary);\n...\nif (missing.length\
    \ > 0) {\n    throw new SubjectAttributeNotInGlossaryError(subject.type, missing);\n  }"
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/dto/simulate-case.dto.ts, src/http/dto/simulate-hypothesis.dto.ts,
    and src/investigation/investigation-factory.ts read `nowhere` — const subject = buildSubject(subjectType,
    subjectAttributes); — this file passes subjectAttributes straight to buildSubject with no count check
    of its own — a binding asserts the file answers for the node, so the pair that stopped holding it
    is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/investigation-factory.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor,
    lines 61-63 — return remainingBudgetMs === undefined ? capability.timeout : Math.min(capability.timeout,
    remainingBudgetMs);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveAssembledRequest
    call, line 116 — const requestResolution = this.resolveAssembledRequest(rawConfiguration, subject,
    requester);'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept''s timeout
    branch, lines 87-89 — if (call.value.kind === ''timed-out'') { return { result: ''timeout'' }; }'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at evaluationTotalityViolations — for (const\
    \ name of required) {\n    const count = counts.get(name) ?? 0;\n    if (count === 0) {\n      violations.push(`the\
    \ required hypothesis \"${name}\" has no matching evaluation`);\n    } else if (count > 1) {\n   \
    \   violations.push(...)"
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at evidenceTotalityViolations — for (const concept\
    \ of plan) {\n    const count = counts.get(concept) ?? 0;\n    if (count === 0) {\n      violations.push(`the\
    \ collection plan's concept \"${concept}\" has no matching evidence`);\n    } else if (count > 1)\
    \ {\n      violations.push(...)"
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: "src/case/case-query.service.ts: held at replayCase (lines 92-95) — export async function replayCase(slug:\
    \ string, version: number, caseStore: ICaseStore): Promise<Case> {\n  const assembled = await heldVersion(caseStore,\
    \ slug, version);\n  return trustedCaseOf(assembled);\n}\nsrc/investigation/investigation-factory.ts:\
    \ held at the pinned_case, model, prompt_version and evidence fields of the returned literal — pinned_case:\
    \ pinnedCaseOf(theCase),\n    prompt_version: options.prompt_version,\n    model: options.model,\n\
    \    evidence: [...evidence],\nsrc/investigation/investigation.ts: held at the pinned_case, prompt_version,\
    \ model and evidence fields, lines 20-23 — readonly pinned_case: PinnedCase;\n  readonly prompt_version:\
    \ string;\n  readonly model: string;\n  readonly evidence: readonly Evidence[];"
  encoded_at:
  - src/case/case-query.service.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
- node: rules/investigation/written-at-records-when-the-write-settled
  conforms: false
  how: "src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts, the concurrent-writes\
    \ test, lines 302-318 ('lets only one of two concurrent writes to the same id succeed, the other refused\
    \ through InvestigationAlreadyStoredError'): const results = await Promise.allSettled([store.write(investigation),\
    \ store.write(investigation)]);\n\n    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);\n\
    \    const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult\
    \ | undefined;\n    expect(rejected?.reason).toBeInstanceOf(InvestigationAlreadyStoredError); — written-at-records-when-the-write-settled's\
    \ own text says a later attempt that finds the record already present 'settles by finding the record\
    \ already present', unchanged by not being the one that persisted — the specification's own account\
    \ of the losing side of a race is success, not an error. This test instead requires the store to reject\
    \ the losing write with InvestigationAlreadyStoredError, and the sequential write-once test two blocks\
    \ above (lines 281-300) enforces the same rejection for a repeat write under an existing id. Anyone\
    \ implementing to this suite builds a store that raises a caller-visible failure for exactly the case\
    \ the specification calls a settled write, and the next reader who trusts the passing suite over the\
    \ node will reproduce that failure rather than the settling the specification actually asks for."
  observed_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at raiseCreateDraftFailure, lines 707-709
    — (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug)
    : raiseWriteFailure(cause))'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at casesPageSelect, lines 340-365 —
    FROM (SELECT slug FROM cases ORDER BY slug LIMIT $1 OFFSET $2) c ... ORDER BY c.slug'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at the latest/released subqueries inside
    casesPageSelect, lines 350-361 — SELECT DISTINCT ON (slug) slug, state, authored_at, COUNT(*) OVER
    (PARTITION BY slug) AS version_count FROM case_versions ORDER BY slug, version DESC'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: "src/case/case-query.service.ts: held at structuralCase's catch clause and refuseViolations — if\
    \ (error instanceof InvalidCaseDocumentError) {\n      throw new CaseVersionNotValidError(slug, version,\
    \ error.context.problems);\n    } and if (violations.length > 0) {\n    throw new CaseVersionNotValidError(slug,\
    \ version, violations);\n  }"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at the 'holds no second case version...' test and\
    \ the 'leaves every manifested hypothesis-revision...' test — const secondVersion = await createCaseStore(connection).assembleVersion(SLUG,\
    \ VERSION + 1);\n\n  expect(secondVersion).toBeUndefined();\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at refuseUnlessDraft guards inside insertManifestEntry, deleteManifestEntry, discardDraft,\
    \ updateDraftVersion (805-807, 826-827, 850-851, 867-868) — refuseUnlessDraft(key, await requireVersionState(tx,\
    \ key));\nsrc/seed.ts: held at the alreadySeeded guard, lines 154-157 and 171-173 — if (!(await alreadySeeded(connection)))\
    \ {\n    await seedCase(connection);\n  }"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at refuseUnlessDraft and refuseUnlessDraftAtRelease,
    lines 880-890, and their CaseVersionNotDraftError / CaseVersionNotDraftAtReleaseError callers — function
    refuseUnlessDraftAtRelease(key: ICaseVersionKey, state: CaseVersionState): void { if (state !== DRAFT_STATE)
    { throw new CaseVersionNotDraftAtReleaseError(key.slug, key.version, state); } }'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-version-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at nextVersionUpdateStatement, lines
    650-657 (monotonic counter, never reset by discardDraft) — UPDATE cases SET next_version = next_version
    + 1 WHERE slug = $1 RETURNING next_version - 1 AS version'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, and src/case/validate-case-coherence.ts
    read `nowhere` — caseCoherenceViolations composes only glossaryCoherenceViolations and capabilityViolations:
    return [...(await glossaryCoherenceViolations(theCase, glossary)), ...(await capabilityViolations(theCase,
    capabilities))]; — no derivation of a case-input-requirement set appears anywhere in this file — a
    binding asserts the file answers for the node, so the pair that stopped holding it is released by
    `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: 'src/fixtures/glossary/concept.json: held at the ttl field of each entry — "ttl": 300 ... "ttl":
    60'
  encoded_at:
  - src/fixtures/glossary/concept.json
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at conceptViolations'' subject-type acceptance check
    — } else if (!resolution.concept.accepts.includes(theCase.subject)) {

    src/fixtures/glossary/concept.json: held at the accepts field of each entry — "accepts": ["contract"]'
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/fixtures/glossary/concept.json
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: false
  how: 'no named file holds this fact now: src/seed.ts read `nowhere` — collects: entry.collects,'
  observed_at:
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at requireCaseHoldsDraft, lines 723-728,
    called from insertRevision — const row = await queryOneOrAbsent<{ version: number }>(tx, draftVersionSelect(slug),
    raiseReadFailure); if (row === undefined) { throw new CaseHoldsNoDraftError(slug); }'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisIdentityStatement, lines
    730-735 — INSERT INTO hypotheses (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name) DO
    NOTHING'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at raisePlaceHypothesisFailure, lines
    819-824 — isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT) ? new ManifestPositionOccupiedError(input.slug,
    input.version, input.position) : raiseWriteFailure(cause)'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement (746-757)
    and revisionOverwriteStatement (787-795) — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4,
    $5, $6, $7 FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: false
  how: "src/persistence/relational-case-store.repository.ts, releaseHypothesisRevisionRow and releaseHypothesisRevisionStatement,\
    \ lines 615-625: async function releaseHypothesisRevisionRow(tx: IQueryable, key: IRevisionKey): Promise<void>\
    \ {\n  await runStatement(tx, releaseHypothesisRevisionStatement(key), raiseWriteFailure);\n}\n\n\
    function releaseHypothesisRevisionStatement(key: IRevisionKey): IStatement {\n  return {\n    text:\
    \ `UPDATE hypothesis_revisions SET state = $4\n           WHERE case_slug = $1 AND hypothesis_name\
    \ = $2 AND revision = $3`,\n    params: [key.slug, key.hypothesis_name, key.revision, HYPOTHESIS_REVISION_RELEASED_STATE],\n\
    \  };\n} — A release call against a revision already in released state, or against a hypothesis-revision\
    \ identity nothing was ever stored for, matches zero or one row and is answered as a silent success\
    \ instead of the required HTTP 409 — a caller (or a test) built against the documented refusal gets\
    \ no signal at all that the release was a no-op or named nothing real. The gap is also inconsistent\
    \ within this same file: releaseVersion (case-version release) reads the current state and refuses\
    \ via refuseUnlessDraftAtRelease before writing, and insertManifestEntry, deleteManifestEntry, updateDraftVersion\
    \ and discardDraft all guard the same way; releaseHypothesisRevisionRow alone performs its UPDATE\
    \ unconditionally, with no read-then-refuse step and no import of a HypothesisRevisionNotDraftAtReleaseError\
    \ class at all."
  observed_at:
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement, lines 746-757
    — COALESCE(MAX(revision), 0) + 1'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionsPageSelect, lines
    515-524 — ORDER BY revision DESC LIMIT $3 OFFSET $4'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at hypothesisRevisionListItemOf, lines
    547-555 — return { revision: row.revision, criterion: row.criterion, collects, resolution: resolutionOf(...),
    state: hypothesisRevisionStateOf(row.state) };'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at resolveSourceVersion and manifestCopyStatement,
    lines 659-705 — INSERT INTO case_version_hypotheses (case_slug, case_version, hypothesis_name, revision,
    position) SELECT case_slug, $2, hypothesis_name, revision, position FROM case_version_hypotheses WHERE
    case_slug = $1 AND case_version = $3'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: "src/seed.ts: held at the call ordering in seedCase, lines 149-151 — const placed = await placeFixtureHypotheses(lifecycle,\
    \ fixture, draft.version);\n  await releaseManifestedRevisions(lifecycle, fixture.slug, placed);\n\
    \  await lifecycle.release(fixture.slug, draft.version);"
  encoded_at:
  - src/seed.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/__tests__/integration/persistence/relational-case-store.repository.spec.ts: held at the overwrite-against-released-revision
    test (line 2056), asserting the typed error and its mapped status — await expect(rejection).rejects.toBeInstanceOf(ReleasedHypothesisRevisionNotAlterableError);

    const caught = await rejection.catch((error: unknown) => error);

    expect(statusForError(caught)).toBe(409);'
  encoded_at:
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'the fact left part of its ground: still held in src/persistence/relational-case-store.repository.ts,
    and src/case/case-query.service.ts read `nowhere` — public async readCase(slug: string, version: number):
    Promise<ReadCaseResult> { — slug is taken as a read parameter naming an already-unique case; no uniqueness
    check is performed here — a binding asserts the file answers for the node, so the pair that stopped
    holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at vocabularyViolations'' and conceptViolations'' existence
    checks — if (!resolution.held) { violations.push(`the ${VOCABULARY_ROLES[vocabulary]} "${name}" does
    not exist in the glossary`); }'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: "src/case/case-query.service.ts: held at readCase's explicit version parameter and listCaseVersions\
    \ delegation — public async listCaseVersions(\n    slug: string,\n    pagination: PaginationRequest,\n\
    \  ): Promise<PaginatedResponse<CaseVersionListItem>> {\n    return this.caseStore.listCaseVersions(slug,\
    \ pagination);\n  }\nsrc/persistence/relational-case-store.repository.ts: held at discardDraft restricted\
    \ to draft state via refuseUnlessDraft, lines 850-854; no other method deletes a case_versions row\
    \ — async function discardDraft(tx: IQueryable, key: ICaseVersionKey): Promise<void> { refuseUnlessDraft(key,\
    \ await requireVersionState(tx, key)); await runStatement(tx, deleteManifestEntriesStatement(key),\
    \ raiseWriteFailure); await runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);\
    \ }"
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at answerGaps checking nature, output schema and timeout
    — if (capability.nature !== READ_ONLY_NATURE) { gaps.push(answeringGap(concept, ''is not read-only''));
    } if (!declaresText(capability.output_schema)) { ... } if (!declaresTimeout(capability.timeout)) {
    ... }'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at manifestSelect, lines 371-382 — WHERE
    cvh.case_slug = $1 AND cvh.case_version = $2 ORDER BY cvh.position'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'src/case/case-query.service.ts: held at readCaseInputRequirements''s fresh capability read — const
    registeredCapabilities = await everyRegisteredCapability(this.capabilities);

    src/case/validate-case-coherence.ts: held at capabilityViolations calling readCapability fresh for
    each concept inside the loop, with no memoization — for (const name of collectionPlan(theCase)) {
    violations.push(...answerGaps(name, await capabilities.readCapability(name))); }'
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, and src/seed.ts
    read `nowhere` — await createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION); — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/seed.ts
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at resolveAssembledRequest''s
    catch, lines 171-173 — if (error instanceof ConnectorPlaceholderNotResolvedError || error instanceof
    IncompleteConnectorCallDescriptorError) { return { ok: false, outcome: unavailableFor(error) }; }'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at observeConcept''s timeout
    branch, lines 87-89 — return { result: ''timeout'' };'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: 'src/investigation/http-declarative-observation-source.adapter.ts: held at effectiveTimeoutMsFor,
    lines 61-63 — Math.min(capability.timeout, remainingBudgetMs)'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at the released subquery inside casesPageSelect,
    lines 356-361 — SELECT DISTINCT ON (slug) slug, version, title, when_to_use FROM case_versions WHERE
    state = $3 ORDER BY slug, version DESC'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at releaseHypothesisRevisionStatement,
    lines 619-624 — touches only hypothesis_revisions — UPDATE hypothesis_revisions SET state = $4 WHERE
    case_slug = $1 AND hypothesis_name = $2 AND revision = $3'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at conceptViolations'' refusal message, naming both
    the concept and the subject type — `the concept "${name}" does not accept the subject type "${theCase.subject}"
    the case declares`,'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  conforms: true
  how: 'src/persistence/relational-case-store.repository.ts: held at revisionInsertStatement, lines 746-757
    — SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6, $7 FROM hypothesis_revisions WHERE
    case_slug = $1 AND hypothesis_name = $2 RETURNING revision'
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
unstated:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  where: the it() block at lines 854-865, "treats a response body that is not valid JSON as nothing extracted,
    rather than throwing, on the ok path"
  evidence: 'expect(outcome).toEqual({ result: ''ok'', observation: JSON.stringify({}) });'
  cost: The choice to answer an ok-status response whose body does not parse as JSON with an empty, usable-looking
    observation — rather than ending unavailable, or some other classification — is fixed only in this
    test. A reader checking what the specification says a malformed corporate-system payload does to an
    otherwise-successful call finds nothing, and anyone changing this behavior later (e.g. to end unavailable,
    matching how every other malformed-input case in this same file already degrades) has no node to update
    or be held to.
unbound:
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/fixtures/concept-fixture-declares-descriptions.spec.ts
- src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
- src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/investigation.spec.ts
- src/__tests__/unit/persistence/relational-case-store.repository.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/seed.spec.ts
notes: "Judged by 23 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/backend-code-drift-batch-corrections.returns/.\nStaged by a review over files\
  \ a delivery wrote: no pair was omitted, so the delivery's own claims and every other binding of these\
  \ files were judged alike; the plan's node(s) domain/glossary/concept, domain/investigation/durations,\
  \ domain/investigation/evaluation, domain/investigation/evidence-result, domain/investigation/investigation,\
  \ domain/investigation/usage, domain/knowledge/case-version-state, rules/glossary/a-concept-declares-its-description,\
  \ rules/glossary/a-description-states-meaning-never-policy, rules/integration/an-http-connector-configuration-declares-its-call,\
  \ rules/investigation/written-at-records-when-the-write-settled, rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name,\
  \ rules/knowledge/a-case-version-moves-through-its-declared-lifecycle, rules/knowledge/a-case-versions-input-requirements-are-derived,\
  \ rules/knowledge/validation-runs-at-every-read were read on every file and answered for, and bound\
  \ from nowhere here — a binding this record writes is one the trace already held.\nA finding in src/__tests__/unit/case/case-query.service.spec.ts\
  \ names rules/knowledge/a-presented-case-version-states-its-own-declared-attributes, which no file of\
  \ this set is bound to: the expect(result.case).toEqual({...}) block, lines 428-447, and the identical\
  \ expect(replayed).toEqual({...}) block, lines 648-667: expect(result.case).toEqual({\n  slug: SLUG,\n\
  \  title: 'A case',\n  when_to_use: 'when a curator needs a case to test read-case composition over',\n\
  \  version,\n  authored_at: '2024-01-01T00:00:00.000Z',\n  subject: SUBJECT,\n  fallback: { outcome:\
  \ FALLBACK_OUTCOME, referral: { action: FALLBACK_ACTION, recipient: FALLBACK_RECIPIENT } },\n  state:\
  \ 'released',\n  released_at: expect.any(String),\n  manifest: expectedDefaultManifest(),\n  hypotheses:\
  \ [ ... ],\n}); — Both exact-match assertions fix the whole shape readCase and replayCase answer for\
  \ a version, and neither carries any consolidation_register-related key — not a value, not an explicit\
  \ \"no register\" marker. A reader of rules/knowledge/a-presented-case-version-states-its-own-declared-attributes\
  \ goes to case-query.service's read-case expecting every reading to say explicitly whether a version\
  \ declares a consolidation register, and this test locks in a response that says nothing about it at\
  \ all — indistinguishable from the blank the rule's own text names and refuses (\"never leaving a blank\
  \ in place of the statement\").. It blocks nothing here; it is owed a route of its own.\nA finding in\
  \ src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts names rules/investigation/a-measured-duration-below-one-millisecond-is-zero,\
  \ which no file of this set is bound to: the test titled \"validates a response whose durations.collection\
  \ is zero, matching a stage measured below one millisecond\" (lines 172-178): it('validates a response\
  \ whose durations.collection is zero, matching a stage measured below one millisecond' — rules/investigation/a-measured-duration-below-one-millisecond-is-zero\
  \ is the node that states a millisecond duration is 0 exactly \"where the span settled in under one\
  \ millisecond,\" with the reasoning for why a floor of one millisecond would be wrong. The test title\
  \ restates that specific business rule, almost verbatim, as its own explanation for why zero is a valid\
  \ durations.collection, rather than only asserting that the schema accepts zero. That rule lives in\
  \ a node this file's own set does not name, so a reader of this test who trusts its title has no reason\
  \ to go open the rule that actually governs it, and if the rule's own reasoning is ever revised the\
  \ title carries the old rationale forward untouched.. It blocks nothing here; it is owed a route of\
  \ its own.\nA finding in src/http/dto/simulate-case.dto.ts names rules/investigation/a-decided-evaluation-cites-evidence,\
  \ which no file of this set is bound to: citations on the confirmed and refuted branches of evaluationSchema,\
  \ lines 43 and 51: citations: z.array(citationSchema).min(1).readonly(), — the \"at least one citation\"\
  \ threshold is stated once, by rules/investigation/a-decided-evaluation-cites-evidence (\"Every confirmed\
  \ or refuted evaluation carries at least one citation\"), which is not among the nodes domain/investigation/evaluation\
  \ and domain/investigation/citation state as this file's own shape; re-deriving the number here as this\
  \ schema's own .min(1) gives the rule a second home, and the day the business changes that threshold\
  \ nobody can tell from this file alone which value is the decided one.. It blocks nothing here; it is\
  \ owed a route of its own.\nA finding in src/http/dto/simulate-hypothesis.dto.ts names rules/investigation/an-inconclusive-evaluation-declares-its-reason,\
  \ which no file of this set is bound to: the third branch of the evaluationSchema discriminated union\
  \ (lines 59-67), covering all three inconclusive reasons: z.object({\n  hypothesis: z.string().min(1),\n\
  \  verdict: z.literal(INCONCLUSIVE_VERDICT),\n  reason: z.enum(EVALUATION_REASONS),\n  citations: z.array(citationSchema).readonly(),\n\
  \  usage: usageSchema.optional(),\n  elapsed_ms: z.int().optional(),\n  prompt: z.string().optional(),\n\
  }), — citations carries no .min(1) here, so an evaluation with reason no-data and an empty citations\
  \ array validates successfully through this response schema — the same branch already applies .min(1)\
  \ to citations for the confirmed and refuted verdicts two blocks above, so the omission reads as a gap\
  \ rather than a choice; a no-data verdict produced with nothing cited would pass this boundary instead\
  \ of being caught, and a reader checking this schema for how a no-data reason is bound to its evidence\
  \ finds no such constraint.. It blocks nothing here; it is owed a route of its own.\nCandidates: 62\
  \ opened across 13 of 23 delegation(s); each return lists its own under `candidates_opened`.\nUnstated:\
  \ 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They block\
  \ no binding here and no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/backend-code-drift-batch-corrections.returns/`, which are the evidence behind every entry above.
