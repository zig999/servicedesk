---
contract_version: siegard-reconcile/3
title: Reconcile backend code drift accumulated across prior deliveries and hotfixes
summary: 'These 23 backend files carry bindings that drifted into the `code` class because deliveries
  and corrective hotfixes over time changed them without every sibling binding being restamped -- a bind
  restamps only the delivering task''s own nodes, and each of these files has since been touched by a
  delivery whose binding covered a different node on the same file. The source as it stands is asserted
  correct; this reconciliation catches the trace up to what these files currently do.

  '
target: backend
files:
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  change: Asserts the diagnose-server factory's persisted hypothesis-revision states and measured durations.
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  change: Asserts migration 0009's case_versions lifecycle columns and hypothesis_revisions immutability
    once released.
- path: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  change: Asserts hypothesis-revision overwrite/release-independence behavior directly against the repository.
- path: src/case/case-query.service.ts
  change: Implements readCase (running coherence validation) and readCaseInputRequirements, replayCase
    and the case/hypothesis-revision listing reads, keyed by slug.
- path: src/case/case-store.port.ts
  change: Declares the ICaseStore interface, CaseVersionState, HypothesisRevisionState and the store's
    other domain types.
- path: src/case/release.operation.ts
  change: Implements ReleaseOperation.release, aggregating structural, coherence and manifest-hypothesis-state
    violations before releasing a draft.
- path: src/errors/case-not-valid.error.ts
  change: Re-exports CaseVersionNotValidError from its own module.
- path: src/http/dto/register-concept.dto.ts
  change: Validates a register-concept request body with zod, including an optional description field.
- path: src/http/dto/simulate-case.dto.ts
  change: Validates the simulate-case response body, including usage, evaluation, evidence and durations
    shapes.
- path: src/http/dto/simulate-hypothesis.dto.ts
  change: Validates the simulate-hypothesis response body, mirroring simulate-case.dto.ts's shapes for
    a single hypothesis.
- path: src/http/simulate-hypothesis.controller.ts
  change: Builds the subject and dispatches the simulate-hypothesis pipeline under a fixed deadline budget.
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: Builds an Evaluation's outcome (verdict/reason/citations/usage/elapsed_ms) from a model call,
    a no-data short-circuit, or a judgment failure.
- path: src/investigation/assessment-consolidator.port.ts
  change: Declares the IAssessmentConsolidator interface and ConsolidationOutcome type, over Evaluation
    and Evidence arrays.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: A fixture-keyed test double for IAssessmentConsolidator.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: Validates an HTTP connector configuration's shape and resolves a declarative HTTP call into
    an evidence-result outcome.
- path: src/investigation/investigation-factory.ts
  change: Builds an Investigation aggregate from options, refusing glossary/totality violations before
    assembly.
- path: src/investigation/investigation-pipeline.ts
  change: Orchestrates evidence collection and judgment, deriving cost, durations and per-hypothesis evidence
    from Evaluation/Evidence arrays.
- path: src/investigation/investigation.ts
  change: Declares the Investigation aggregate-root type.
- path: src/investigation/judgment-stage.ts
  change: Runs bounded-pool parallel judgment calls per hypothesis, with deadline and citation-retry handling.
- path: src/investigation/run-diagnosis.ts
  change: Orchestrates a full diagnosis run (pipeline, write-deadline, single-retry) and assembles the
    persisted Investigation.
- path: src/investigation/simulate-hypothesis-pipeline.ts
  change: Runs the single-hypothesis simulation pipeline, deriving durations from one Evaluation.
- path: src/persistence/relational-case-store.repository.ts
  change: Implements ICaseStore against the relational schema, including lifecycle-state guards and hypothesis-revision-state
    checks.
- path: src/seed.ts
  change: Seeds fixture concepts, capabilities, connector configurations and case/hypothesis data via
    direct SQL.
nodes:
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: false
  how: 'no named file holds this fact now: src/investigation/run-diagnosis.ts read `nowhere` — const {
    evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options); —
    the per-hypothesis parallel dispatch and pool bound are not present in this file; it only invokes
    runInvestigationPipeline (defined in investigation-pipeline.ts) and threads the returned cost/durations
    through to buildInvestigationOptions.'
  observed_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/integration/capability-registry
  conforms: false
  how: 'src/investigation/judgment-stage.ts, the module''s sole export, `judgeHypotheses` (line 26), and
    everything it calls down to `callRecordOf` (line 250): export async function judgeHypotheses(options:
    JudgeHypothesesOptions): Promise<readonly Evaluation[]> { — the trace still binds this file to the
    capability-registry contract (read-capability, read-capability-by-identity, list-capabilities, register-capability),
    so a reader following that binding to find where the registry''s synchronous surface is implemented
    lands in a module about hypothesis-pool deadlines, citation retries and evaluation shaping instead,
    with no trace of any of the four operations to point them onward'
  observed_at:
  - src/investigation/judgment-stage.ts
- node: contracts/system/case-authoring
  conforms: false
  how: 'the fact left part of its ground: still held in src/case/case-query.service.ts, and src/errors/case-not-valid.error.ts
    read `nowhere` — export { CaseVersionNotValidError } from ''./case-version-not-valid.error.js''; —
    a binding asserts the file answers for the node, so the pair that stopped holding it is released by
    `--bind ... --replace`, never restamped here'
  observed_at:
  - src/case/case-query.service.ts
  - src/errors/case-not-valid.error.ts
- node: domain/investigation/durations
  conforms: false
  how: "src/http/dto/simulate-case.dto.ts, durationsSchema, lines 95-100: const durationsSchema = z.object({\n\
    \  collection: z.number(),\n  judgment: z.number(),\n  writing: z.number().optional(),\n  total: z.number(),\n\
    });\n — domain/investigation/durations fixes collection, judgment, writing and total as integer; the\
    \ response schema accepts fractional values for all four, so a load test or a caller comparing durations\
    \ against the declared total budget cannot rely on the wire type matching the domain type the node\
    \ states.\nsrc/http/dto/simulate-hypothesis.dto.ts, durationsSchema, lines 70-74: collection: z.number(),\n\
    \  judgment: z.number(),\n  total: z.number(), — domain/investigation/durations declares collection,\
    \ judgment and total type integer, in milliseconds; z.number() admits fractional milliseconds for\
    \ all three, so a load test comparing this value against the declared total budget (the node's own\
    \ stated use) can be handed a value shaped differently than the domain model promises."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/investigation/evaluation
  conforms: false
  how: 'src/http/dto/simulate-case.dto.ts, evaluationSchema, elapsed_ms in each of the three discriminated-union
    branches, lines 45, 53, 62: elapsed_ms: z.number().optional(), — domain/investigation/evaluation fixes
    elapsed_ms as integer; the response schema allows a fractional millisecond count where the specification
    does not, so the wire contract is looser than the domain type it exposes.

    src/http/dto/simulate-hypothesis.dto.ts, evaluationSchema, elapsed_ms at lines 48, 56 and 65: elapsed_ms:
    z.number().optional(), — domain/investigation/evaluation declares elapsed_ms type integer, the same
    millisecond unit domain/investigation/durations keeps its stage totals in; z.number() lets a fractional
    millisecond value through validation in all three verdict branches, so the response can carry a call
    duration the domain model''s own type forbids.'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
- node: domain/investigation/evidence
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/dto/simulate-case.dto.ts, src/investigation/fake-assessment-consolidator.adapter.ts,
    src/investigation/investigation-pipeline.ts, and src/http/dto/simulate-hypothesis.dto.ts read `nowhere`
    — import { evidenceSchema } from ''./evidence.dto.js'';


    ... evidence: z.array(evidenceSchema).readonly(),; src/investigation/assessment-consolidator.port.ts
    read `nowhere` — evidence: readonly Evidence[], — a binding asserts the file answers for the node,
    so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/investigation-pipeline.ts
- node: domain/investigation/evidence-result
  conforms: false
  how: 'src/investigation/http-declarative-observation-source.adapter.ts, httpConfigurationProblems, line
    265, the statusMap-shape diagnostic: problems.push(''statusMap is not a plain object mapping a status
    to one of ok, unavailable, denied, timeout''); — The evidence-result vocabulary (ok, unavailable,
    denied, timeout) is already imported as EVIDENCE_RESULTS and read by isEvidenceResult two lines below;
    this message spells the same four values out again as independent literal text. A future change to
    the evidence-result enumeration would leave this diagnostic silently wrong while the actual validation,
    driven by EVIDENCE_RESULTS, stayed correct — the message becomes a second, driftable home for a vocabulary
    the specification already owns.'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/investigation
  conforms: false
  how: 'src/investigation/investigation.ts, line 29, the `written_at` field of the `Investigation` type:
    readonly written_at?: string; — The aggregate-root type lets an `Investigation` exist with `written_at`
    absent — the factory (`investigation-factory.ts`) and the run-diagnosis tests build and pass around
    such values on purpose before the store settles the write. A caller reading only this type learns
    that a written record may or may not carry its write instant, and has to consult the specification
    (or the store''s own settle logic) to learn that the specification instead treats written_at as always
    present on the aggregate; the type is the one place the shape of `Investigation` is declared, and
    it currently declares a shape the node does not.'
  observed_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/usage
  conforms: false
  how: "src/http/dto/simulate-case.dto.ts, usageSchema, lines 34-37: const usageSchema = z.object({\n\
    \  input_tokens: z.number(),\n  output_tokens: z.number(),\n});\n — domain/investigation/usage fixes\
    \ input_tokens and output_tokens as integer, but the wire schema accepts any finite number; a response\
    \ can legally carry a fractional token count (e.g. 12.5), and a client trusting the specification's\
    \ integer type has no schema-level guarantee of it — the same file enforces integer-only elsewhere\
    \ (`version: z.int().positive()`, `elapsed_ms: z.int()`), so the looseness here is not this codebase's\
    \ general convention for a measured/counted value.\nsrc/http/dto/simulate-hypothesis.dto.ts, usageSchema,\
    \ lines 35-38: input_tokens: z.number(),\n  output_tokens: z.number(), — domain/investigation/usage\
    \ declares both attributes type integer; z.number() admits any finite JS number, so a fractional token\
    \ count (e.g. 12.5) passes validation and is served as a valid usage record — the boundary meant to\
    \ enforce the domain model's declared shape is looser than the shape it names."
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: "src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the assertion on\
    \ manifest-entry states, in the it block \"seeds every hypothesis-revision the fixture case version's\
    \ manifest references as released, once beforeAll has run\" (around line 358-371) — const states =\
    \ await Promise.all(manifestEntries.map((entry) => store.readHypothesisRevisionOwnState(SLUG, entry.hypothesis_revision.hypothesis_name,\
    \ entry.hypothesis_revision.revision))); ... expect(states).toEqual(manifestEntries.map(() => 'released'));\n\
    src/case/case-store.port.ts: held at the HYPOTHESIS_REVISION_STATES const and HypothesisRevisionState\
    \ type, lines 7-9 — export const HYPOTHESIS_REVISION_STATES = ['draft', 'released'] as const;\n\n\
    export type HypothesisRevisionState = (typeof HYPOTHESIS_REVISION_STATES)[number];\nsrc/persistence/relational-case-store.repository.ts:\
    \ held at HYPOTHESIS_REVISION_STATE_VALUES (built from the imported HYPOTHESIS_REVISION_STATES) and\
    \ isHypothesisRevisionState, lines 92 and 584-586 — const HYPOTHESIS_REVISION_STATE_VALUES: ReadonlySet<string>\
    \ = new Set<string>(HYPOTHESIS_REVISION_STATE_VALUES);\nfunction isHypothesisRevisionState(value:\
    \ string): value is HypothesisRevisionState {\n  return HYPOTHESIS_REVISION_STATE_VALUES.has(value);\n\
    }\n"
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: false
  how: 'no named file holds this fact now: src/http/dto/register-concept.dto.ts read `nowhere` — description:
    z.string().optional(),'
  observed_at:
  - src/http/dto/register-concept.dto.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: false
  how: 'src/investigation/http-declarative-observation-source.adapter.ts, httpConfigurationProblems, line
    259, the method-shape diagnostic: problems.push(''method is not one of GET, POST, PUT, PATCH, DELETE'');
    — The accepted method set already lives in the imported HTTP_METHODS constant, which the very next
    line (`isHttpMethod`) reads to decide the same question; this message re-enumerates the same vocabulary
    as a second, independent literal. If HTTP_METHODS is ever extended or narrowed, this text goes stale
    while the actual acceptance logic keeps working correctly — an operator reading the rejection is told
    a set of methods that no longer matches what the connector actually accepts.'
  observed_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: true
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the assertions in
    the it block "persists real, non-zero cost and durations for the judgment and consolidation calls..."
    (around line 412-417) — expect(written?.durations_judgment).toBeGreaterThanOrEqual(MOCK_RESPONSE_DELAY_MS);

    expect(written?.durations_writing).toBeGreaterThanOrEqual(MOCK_RESPONSE_DELAY_MS);

    expect(written?.durations_collection).toBeGreaterThan(0);

    expect(written?.durations_total).toBeGreaterThanOrEqual((written?.durations_collection ?? 0) + (written?.durations_judgment
    ?? 0) + (written?.durations_writing ?? 0));'
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: false
  how: 'the fact left part of its ground: still held in src/http/dto/simulate-case.dto.ts, src/http/dto/simulate-hypothesis.dto.ts,
    src/http/simulate-hypothesis.controller.ts, and src/investigation/investigation-pipeline.ts read `nowhere`
    — const subject = buildSubject(options.subjectType, options.subjectAttributes); — the pipeline passes
    subjectAttributes straight to buildSubject in ./subject.js with no length check of its own — a binding
    asserts the file answers for the node, so the pair that stopped holding it is released by `--bind
    ... --replace`, never restamped here'
  observed_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/investigation-pipeline.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: false
  how: "src/persistence/relational-case-store.repository.ts, the DRAFT_STATE/RELEASED_STATE constants\
    \ (lines 101-102) and the isCaseVersionState function (lines 946-948): const DRAFT_STATE: CaseVersionState\
    \ = 'draft';\nconst RELEASED_STATE: CaseVersionState = 'released';\n...\nfunction isCaseVersionState(value:\
    \ string): value is CaseVersionState {\n  return value === DRAFT_STATE || value === RELEASED_STATE;\n\
    }\n — the case-version lifecycle's two legal states are re-enumerated here as hand-typed literals\
    \ rather than read from any single canonical source — contrast HYPOTHESIS_REVISION_STATE_VALUES a\
    \ few lines above, which derives from the imported HYPOTHESIS_REVISION_STATES array instead of hardcoding\
    \ 'draft'/'released' again. If the specification's state machine ever adds a state, this check has\
    \ no link back to the rule that declares initial/terminal states; a maintainer edits this constant\
    \ pair from memory, and the next reader who wants to know what states a case version has does not\
    \ find the answer read from the specification — they find it typed here."
  observed_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: false
  how: 'no named file holds this fact now: src/seed.ts read `nowhere` — placeFixtureHypotheses forwards
    the fixture''s collects array unchecked: collects: entry.collects, inside the object passed to lifecycle.reviseHypothesis({
    slug: fixture.slug, hypothesis_name: entry.hypothesis_name, criterion: entry.criterion, collects:
    entry.collects, resolution: entry.resolution, subject: fixture.subject }); seed.ts never inspects
    entry.collects.length; the refusal, if it exists, lives inside reviseHypothesis itself, not in this
    file.'
  observed_at:
  - src/seed.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: "src/case/release.operation.ts: held at manifestOwnStateViolations(), lines 84-101 — const ownState\
    \ = await hypothesisRevisions.readHypothesisRevisionOwnState(\n  assembled.slug,\n  hypothesisName,\n\
    \  revision,\n);\nif (ownState !== RELEASED_STATE) {\n  violations.push(`the hypothesis \"${hypothesisName}\"\
    \ is manifested at a revision that is not released`);\n}"
  encoded_at:
  - src/case/release.operation.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/persistence/relational-case-store.repository.spec.ts,
    and src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts read `nowhere` — it("changes
    an already-stored hypothesis revision''s own columns on an ordinary UPDATE while the revision''s own
    state is still draft", ...) — insertHypothesisRevision never names a state column (default ''draft''),
    so every hypothesis_revisions row this file ever creates stays draft; no test in this file inserts
    or produces a revision whose own state is ''released'' and attempts to alter its criterion, resolution
    or state, and no test in this file deletes a hypothesis_revision_collects row belonging to a released
    revision. The rule''s own refusal (HTTP 409 / ReleasedHypothesisRevisionNotAlterableError) and its
    collects no-op are exercised nowhere in this file. — a binding asserts the file answers for the node,
    so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  - src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: "the fact left part of its ground: still held in src/case/release.operation.ts, src/persistence/relational-case-store.repository.ts,\
    \ and src/case/case-query.service.ts read `nowhere` — async function heldVersion(store: ICaseStore,\
    \ slug: string, version: number): Promise<AssembledCaseVersion> {\n  const assembled = await store.assembleVersion(slug,\
    \ version);\n— slug is the sole case-identifying parameter across readCase, readCaseInputRequirements,\
    \ listCaseVersions, listHypotheses and listHypothesisRevisions alike, but this file neither checks\
    \ nor asserts uniqueness; it presupposes the invariant rather than enforcing or restating it — a binding\
    \ asserts the file answers for the node, so the pair that stopped holding it is released by `--bind\
    \ ... --replace`, never restamped here"
  observed_at:
  - src/case/case-query.service.ts
  - src/case/release.operation.ts
  - src/persistence/relational-case-store.repository.ts
pairs_omitted:
- node: domain/investigation/durations
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-schema-replays-from-its-scripts
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision-state
  file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/a-case-is-read-whole
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-query
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/replay-is-pinned
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/every-case-version-remains-readable
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/a-case-is-read-whole
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-query
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-summary
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version-state
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/manifest-entry
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/every-case-version-remains-readable
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/system/case-authoring
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/manifest-entry
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-release-refusal-with-no-named-violation-says-so
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  file: src/case/release.operation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/glossary/glossary-authoring
  file: src/http/dto/register-concept.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/glossary/concept
  file: src/http/dto/register-concept.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/case-simulation
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/cost
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/evaluation-reason
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject-attribute-value
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/verdict
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/referral
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/resolution
  file: src/http/dto/simulate-case.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/case-simulation
  file: src/http/dto/simulate-hypothesis.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/http/dto/simulate-hypothesis.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/evaluation-reason
  file: src/http/dto/simulate-hypothesis.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/http/dto/simulate-hypothesis.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject-attribute-value
  file: src/http/dto/simulate-hypothesis.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/verdict
  file: src/http/dto/simulate-hypothesis.dto.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/case-simulation
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  file: src/http/simulate-hypothesis.controller.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-judgment-prompt-is-closed
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/usage
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/judgment-does-not-infer
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment-consolidator
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/usage
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/consolidation-register
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-writing-input-is-narrowed
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment-consolidator
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/usage
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/integration/concept-observation
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/integration/corporate-records-source
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/observation-source
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/system/corporate-records
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/integration/capability
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/an-unclassified-status-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/an-unreachable-connector-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/collection-runs-in-the-requester-scope
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/glossary-source
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/glossary/subject-attribute
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject-attribute-value
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/one-evaluation-per-required-hypothesis
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/one-evidence-per-collected-concept
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/replay-is-pinned
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/written-at-records-when-the-write-settled
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/assessment
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/cost
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/durations
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/resolution
  file: src/investigation/investigation-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-domain-depends-on-no-infrastructure
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/replay-is-pinned
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/written-at-records-when-the-write-settled
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-judgment-prompt-is-closed
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/citation
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/evaluation
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/evaluation-reason
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/verdict
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/one-evaluation-per-required-hypothesis
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-foreign-citation-is-refused
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/diagnosis-answers-synchronously
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/case-source
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/diagnosis
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/cost
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/durations
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/an-investigation-is-written-once
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/replay-is-pinned
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/the-response-follows-the-record
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/written-at-records-when-the-write-settled
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/no-response-without-a-record
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/investigation/case-simulation
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/durations
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/investigation/subject
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/investigation/a-simulation-writes-no-investigation
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  file: src/investigation/simulate-hypothesis-pipeline.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/a-case-is-read-whole
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: contracts/knowledge/case-query
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-summary
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/case-version-state
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/manifest-entry
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-has-at-most-one-draft
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-version-number-is-never-reused
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/every-case-version-remains-readable
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: constraints/a-case-is-read-whole
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/glossary/outcome
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: domain/knowledge/hypothesis-revision-state
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/seed.ts
  reason: the binding computes at the file's content as it stands, and no record holds an open finding
    against the pair
notes: "Judged by 23 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/backend-code-drift-batch.returns/.\nA finding in src/case/case-query.service.ts\
  \ names rules/knowledge/validation-runs-at-every-read, which no file of this set is bound to: readCaseInputRequirements(),\
  \ lines 41-46: const assembled = await heldVersion(this.caseStore, slug, version);\nconst theCase =\
  \ structuralCase(assembled, slug, version);\nconst registeredCapabilities = await everyRegisteredCapability(this.capabilities);\n\
  return deriveCaseInputRequirements(theCase, registeredCapabilities); — readCase, reading the same stored\
  \ version, refuses with CaseVersionNotValidError whenever a coherence violation exists (a glossary term\
  \ or concept the case names no longer resolves, a concept the subject type no longer accepts, a capability\
  \ that stopped answering). readCaseInputRequirements runs structuralCase but never refuseIncoherence/caseCoherenceViolations\
  \ on that same version, so it derives and returns input requirements for a version the specification\
  \ treats as not currently readable as a case at all — a curator composing against, or any caller reading,\
  \ a version whose glossary terms currently fail to resolve gets a computed answer instead of the refusal\
  \ read-case gives for the identical content, and nothing in this file marks that the two reads diverge\
  \ on this.. It blocks nothing here; it is owed a route of its own.\nA finding in src/seed.ts names domain/glossary/concept,\
  \ which no file of this set is bound to: ConceptFixture type (line 40) and seedConcepts's INSERT (lines\
  \ 62-77): type ConceptFixture = { readonly name: string; readonly accepts: readonly string[]; readonly\
  \ ttl: number };\n... await connection.query('INSERT INTO concepts (name, ttl) VALUES ($1, $2) ON CONFLICT\
  \ DO NOTHING', [\n      concept.name,\n      concept.ttl,\n    ]); — domain/glossary/concept declares\
  \ description a required attribute of every concept — the vocabulary term a hypothesis cites and evidence\
  \ carries. ConceptFixture never carries one, the concept.json fixture data (\"equipment-status\", \"\
  network-outage-flag\") never states one, and the INSERT writes only name and ttl, so every concept this\
  \ seed produces is persisted with no stated meaning. Anyone reading these entries through the glossary\
  \ — or through the registry, which would refuse the same omission with a ConceptDescriptionRequiredError\
  \ — finds a published term nobody can read, and the next reader assumes the seed exercises the full\
  \ concept shape the domain model requires when it never has.. It blocks nothing here; it is owed a route\
  \ of its own.\nCandidates: 18 opened across 7 of 23 delegation(s); each return lists its own under `candidates_opened`."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/backend-code-drift-batch.returns/`, which are the evidence behind every entry above.
