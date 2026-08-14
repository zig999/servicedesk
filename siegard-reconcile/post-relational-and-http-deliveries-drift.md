---
contract_version: siegard-reconcile/1
title: The 18 files later deliveries rewrote under older tasks' bindings, judged against every node
  the trace binds to them
summary: >-
  Every change in this set came out of this framework's own routes — the relational-persistence
  deliveries (store-wiring, precedence-from-position, case-aggregate-shape, author-case-version-command,
  replay-by-slug-and-version), the http-connector-adapter delivery (its production wiring and the
  connector variables in the environment schema), and four committed correctives (ticket_ref optional,
  judgment citations against real fields, case-query dropping the withdrawn document hash, seed
  resolving fixtures against the source tree). Each was validated, reviewed or recorded on its own
  route; the human states the source is correct as it stands, and the drift exists only because a bind
  restamps the delivering task's own nodes, leaving the bindings older tasks held on these shared
  files stale.
target: backend
files:
- path: src/case/case-query.service.ts
  change: >-
    readCase validates the aggregate at every reading against the glossary and capability registry as
    they stand; replayCase answers the pinned version by slug and version alone, and the published
    read no longer carries the withdrawn document hash.
- path: src/case/case-resolution.ts
  change: >-
    The three case operations read hypothesis precedence from each hypothesis's own declared position
    rather than array order.
- path: src/case/case.ts
  change: >-
    The aggregate carries a position field on Hypothesis, an optional consolidation_register and
    authored_at; no document hash remains on the type.
- path: src/case/parse-case-document.ts
  change: >-
    Parses a submitted case version with position-based ordering, position and name uniqueness
    refusals and the optional consolidation_register, collecting every violation into one refusal.
- path: src/config/env.ts
  change: >-
    The single environment schema gains the connector-configuration variables the HTTP adapter's
    production wiring reads, beside the one DATABASE_URL every store answers from.
- path: src/factories/case-query.factory.ts
  change: >-
    Wires the relational case store into the published case-query rather than a file repository.
- path: src/factories/diagnose-server.factory.ts
  change: >-
    Wires the HTTP declarative observation source and the connector-configuration registry into the
    production server, on top of the relational store wiring.
- path: src/factories/glossary.factory.ts
  change: >-
    Wires the relational glossary store into the published glossary-query rather than a data
    directory.
- path: src/factories/production-diagnose.factory.ts
  change: >-
    Composes the production diagnose runner from the one shared database connection and stamps the
    request's entry instant and total deadline.
- path: src/fixtures/case/intermittent-connection-outage/1.json
  change: >-
    The curated case carries authored_at, explicit hypothesis positions and a consolidation_register,
    matching the current aggregate shape.
- path: src/http/diagnose.controller.ts
  change: >-
    ticket_ref is optional and travels through as correlation only; the endpoint reads the case
    through the published case-query before running the diagnose.
- path: src/investigation/investigation-factory.ts
  change: >-
    Assembles and validates the subject against the glossary vocabulary and builds the investigation
    record in its current shape, ticket_ref optional.
- path: src/investigation/investigation.ts
  change: >-
    The investigation record carries the four replay pins and an optional ticket_ref.
- path: src/investigation/judgment-stage.ts
  change: >-
    Judgment citations are validated against the capability output schemas' real fields, and the
    evaluator port receives the case context beside the criterion and evidence.
- path: src/investigation/run-diagnosis.ts
  change: >-
    The end-to-end composition over the relational store; receives the pinned, already-read case from
    its caller, carries ticket_ref optionally, and writes the record once before answering.
- path: src/persistence/relational-case-store.repository.ts
  change: >-
    The relational case store carries the authoring command's write path with write-once held by the
    primary key over slug and version.
- path: src/seed.ts
  change: >-
    Resolves its fixtures against the source tree so a real build seeds without ENOENT, authoring the
    curated case last through the published command.
- path: src/vitest-global-setup.ts
  change: >-
    The suite's global setup applies every pending migration through the shared runner against the
    DATABASE_URL the environment names, before any test runs.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: >-
    case-query.service.ts's read-case answers the case whole, validated as of this reading, and the
    store reads one version in one transaction — "return runInTransaction(this.connection,
    raiseReadFailure, (tx) => readWholeVersion(tx, { slug, version }))".
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: >-
    The factory returns the assessment from the same call — "return runner({ ...call, now, deadline
    ... })" — and runDiagnosis is one Promise<Assessment> that resolves with the written record's own
    assessment.
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: false
  how: >-
    The isolation and bounded pool are carried by judgment-stage.ts ("one otherwise judged in its own
    isolated evaluate() call, under a configured pool bound"), but the file attributes to this node a
    sentence it does not hold — "(constraints/hypotheses-are-judged-in-isolated-parallel-calls' own 'a
    hypothesis denied a slot makes no call, so it costs nothing')" — and diagnose.controller.ts
    records "const UNMEASURED_COST: Cost = { calls: 0, ... }", so the node's own fitness, one provider
    call per hypothesis appearing in the recorded cost, is false over every record the system writes.
  observed_at:
  - src/investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: >-
    judgment-stage.ts reaches the evaluator only through IHypothesisEvaluator —
    "evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext)" — importing the port type,
    never a concrete client.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: >-
    env.ts's "DATABASE_URL: z.string().min(1)" is the one place the URL is read, and
    vitest-global-setup.ts refuses to run without it — "const connectionUrl =
    process.env.DATABASE_URL; if (!connectionUrl) { throw new MigrationStepError(...) }" — no default
    URL anywhere.
  encoded_at:
  - src/config/env.ts
  - src/vitest-global-setup.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: false
  how: >-
    The entry stamp is carried — "const now = Date.now(); return runner({ ...call, now, deadline: now
    + TOTAL_DEADLINE_BUDGET_MS })" — but run-diagnosis.ts computes each stage's bound from the run's
    entry instant rather than the stage's own start ("deadline: Math.min(options.deadline, options.now
    + JUDGMENT_STAGE_BUDGET_MS)"), so a stage that begins late is granted its full nominal budget from
    its own start and its ceiling floats past the propagated absolute instant — the summed-durations
    arrangement the node forbids, reintroduced by construction.
  observed_at:
  - src/factories/production-diagnose.factory.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: >-
    investigation-factory.ts's only imports are the case aggregate's types, sibling plain-data types,
    ports and typed errors — infrastructure reaches it only through a port — and investigation.ts
    imports nothing but this context's own sibling plain-data types.
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: >-
    judgment-stage.ts hands the evaluator only the case context, the declared output-schema fields and
    the hypothesis's own criterion and evidence — "const caseContext: CaseContext = { title:
    theCase.title, whenToUse: theCase.when_to_use }".
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: >-
    vitest-global-setup.ts runs "await applyPendingMigrations(connection, MIGRATIONS_DIRECTORY)" —
    applying every pending script under migrations/ before any test runs.
  encoded_at:
  - src/vitest-global-setup.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: >-
    env.ts states each store answers from the one DATABASE_URL connection and no data path is written
    in source; every factory in the set wires its stores from that one connection — "const connection
    = createDatabaseConnection(env.DATABASE_URL)" in diagnose-server.factory.ts, the same connection
    threaded through case-query, glossary and production-diagnose factories.
  encoded_at:
  - src/config/env.ts
  - src/factories/case-query.factory.ts
  - src/factories/diagnose-server.factory.ts
  - src/factories/glossary.factory.ts
  - src/factories/production-diagnose.factory.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: >-
    "export function createGlossaryQuery(connection: DatabaseConnection): IGlossaryQuery" — what the
    caller receives is the contract alone.
  encoded_at:
  - src/factories/glossary.factory.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: >-
    judgment-stage.ts resolves capabilities only through the registry contract — "const resolutions =
    await Promise.all(concepts.map((concept) => capabilities.readCapability(concept)))".
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: contracts/investigation/case-source
  conforms: true
  how: >-
    run-diagnosis.ts receives "the pinned case, already read and validated by this call's own caller —
    never fetched or re-resolved here", matching the node as it now stands (it moved on the
    specification side since the bind and was judged as it stands today).
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: >-
    The factory adds no caching, so two identical calls each run the whole pipeline; ticket_ref
    travels through exactly as the request carried it — "Correlation with the ticketing system, never
    a matching key" — in the controller and in run-diagnosis.ts.
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  - src/http/diagnose.controller.ts
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/glossary-source
  conforms: true
  how: >-
    investigation-factory.ts consumes the glossary-source port the caller supplies — "await
    glossary.readVocabularyTerm('subject-attribute', name)".
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: contracts/knowledge/author-case-version
  conforms: true
  how: >-
    parse-case-document.ts refuses a violating document once with every violation named, and seed.ts
    authors through the published command and no other write — "await
    createAuthorCaseVersion(connection).authorCaseVersion(document)" — with the write-once refusal
    caught as already-seeded.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/seed.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: >-
    "public async readCase(slug: string, version: number): Promise<ReadCaseResult>" — validated at
    this reading, read whole — and the factory answers the contract alone: "export function
    createCaseQuery(connection: DatabaseConnection): ICaseQuery".
  encoded_at:
  - src/case/case-query.service.ts
  - src/factories/case-query.factory.ts
- node: contracts/system/case-authoring
  conforms: false
  how: >-
    The all-refusals-together promise is carried ("refuses once, naming every violated rule
    together"), but parse-case-document.ts applies a validator rule the specification does not hold —
    "the slug \"${slug}\" does not equal the name \"${name}\" of the file that holds it", cited to
    rules/knowledge/the-slug-matches-the-file-name, which exists under no specification root — so the
    validator set this contract promises is wider in code than in the base, and knowledge here is
    gated by code, which "knowledge improves by curation rather than by code" rules out.
  observed_at:
  - src/case/case-query.service.ts
  - src/case/parse-case-document.ts
- node: contracts/system/guided-diagnosis
  conforms: true
  how: >-
    diagnose.controller.ts is the guided flow — "readCase(body.case.slug, body.case.version) ...
    runDiagnose({ ... narrative: body.narrative, subjectType: body.subject.type ... })" — choose a
    case, name the subject and narrative, receive the assessment.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: >-
    "glossary.readVocabularyTerm('subject-attribute', name)" — one governed attribute name, resolved
    from the glossary's own vocabulary.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: >-
    "reason: 'no-data' / reason: 'deadline-exceeded' / reason: 'judgment-failure'" — exactly the
    enumeration's three values, each produced by a distinct cause.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: >-
    "evaluator.evaluate(hypothesis.criterion, evidenceItems, caseContext)" — one hypothesis's
    criterion and its own evidence, judged through the port.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: false
  how: >-
    The shape and one-write discipline are carried (investigation.ts holds every declared attribute
    plus pinned_case; the factory is "the one factory that can build a valid Investigation";
    run-diagnosis.ts stamps written_at once), but the record's cost and durations are filled with
    stated zeros by the controller ("const UNMEASURED_DURATIONS: Durations = { collection: 0,
    judgment: 0, writing: 0, total: 0 }"), so the complete record the node holds "so ... an audit can
    replay it" carries values the run contradicts rather than an absence a reader could recognize.
  observed_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/subject
  conforms: true
  how: >-
    "const subject = buildSubject(subjectType, subjectAttributes)" — the subject's whole
    attribute-value set, exactly as the entry point assembled it.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: >-
    "subject.attributes.map((pair) => pair.attribute)" — one governed name paired with one value,
    travelling as one fact.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/investigation/verdict
  conforms: true
  how: >-
    "if (outcome.verdict === 'confirmed') ... if (outcome.verdict === 'refuted') ..." — the
    enumeration's three values, every hypothesis answered with one.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/case
  conforms: false
  how: >-
    The aggregate itself is carried faithfully across the five files, but case.ts states a
    storage-medium fact no node holds — "export const CASE_DOCUMENT_ENDING = '.json'", cited to
    constraints/a-case-is-stored-as-one-json-document, which does not exist under the specification
    root — while the nodes that do exist state the opposite medium (one relational store, relations of
    their own); case-query.service.ts consumes the same phantom fact.
  observed_at:
  - src/case/case-query.service.ts
  - src/case/case-resolution.ts
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/consolidation-register
  conforms: true
  how: >-
    "readonly consolidation_register?: ConsolidationRegister" — optional, closed to the two declared
    values in the parse ("consolidation_register is not one of formal, plain"), instantiated in the
    fixture as "formal".
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/hypothesis
  conforms: true
  how: >-
    "export type Hypothesis = { name; position; criterion; collects; resolution }" — parsed with a
    name, a declared integer position, a non-empty criterion, at least one collected concept and a
    complete resolution, read as part of the whole aggregate and instantiated in the fixture.
  encoded_at:
  - src/case/case-query.service.ts
  - src/case/case-resolution.ts
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/referral
  conforms: true
  how: >-
    "export type Referral = { readonly action: string; readonly recipient: string }" — the forwarding
    to act on, whole, refused in the parse when either half is missing, instantiated in the fixture.
  encoded_at:
  - src/case/case-resolution.ts
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: domain/knowledge/resolution
  conforms: true
  how: >-
    "export type Resolution = { readonly outcome: string; readonly referral: Referral }" — an outcome
    paired with a referral so no position can declare one without the other, answered as one pair by
    case-resolution.ts and instantiated in the fixture.
  encoded_at:
  - src/case/case-resolution.ts
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: >-
    seed.ts's seedOutcomes is called first, before every other vocabulary, every concept, every
    capability and the case itself; the case is authored last.
  encoded_at:
  - src/seed.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: >-
    "const context: HypothesisCitationContext = { collects: hypothesis.collects, evidence,
    outputSchemas }; ... accepted.length === citations.length" — a citation outside the hypothesis's
    own collects is refused.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: false
  how: >-
    The decided path carries the rule (outputSchemas resolved, refusal through acceptedCitations), but
    noDataEvaluation manufactures citations whose field is the empty string — "citations:
    nonOkEvidence.map((item): Citation => ({ concept: item.concept, field: '' }))" — and an
    empty-string field exists in no capability output schema and points at no place, a citation-shape
    convention living only in code.
  observed_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: >-
    "if (citations.length === 0) { return false; }" — a decided answer with no citation is
    structurally invalid.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: >-
    "refuseAttributesNotInGlossary ... throw new SubjectAttributeNotInGlossaryError(subject.type,
    missing)".
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: >-
    "const subject = buildSubject(subjectType, subjectAttributes)" — the one place this rule is
    enforced, reused rather than re-decided.
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: false
  how: >-
    The declared figures are carried ("const TOTAL_DEADLINE_BUDGET_MS = 20_000",
    "JUDGMENT_STAGE_BUDGET_MS = 5_000", "PERSISTENCE_STAGE_BUDGET_MS = 2_000"), but run-diagnosis.ts
    calls the drafting stage with no bound at all — its own header admits "Drafting
    (draft-assessment-text.ts) takes no deadline parameter at all and is called unbounded" — so a slow
    consolidator makes the response miss the declared total while every bounded stage stayed inside
    its own budget.
  observed_at:
  - src/factories/production-diagnose.factory.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: >-
    Every inconclusive carries one of the three reasons, and noDataEvaluation cites every non-ok
    evidence item the hypothesis collects.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: >-
    "await writeWithinDeadline(...)" — one write, no intermediate persistence anywhere in the
    pipeline, InvestigationAlreadyStoredError propagating unmodified.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: >-
    Every overrun degrades to a recorded evaluation (deadlineExceededEvaluation / noDataEvaluation /
    judgmentFailureEvaluation); persistence is the one stage never let degrade silently — "throw new
    InvestigationWriteDeadlineExceededError(...)".
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: >-
    The factory refuses a record where a required hypothesis has no matching evaluation or more than
    one, and judgment produces "requiredNames.map((name) => judgeOneHypothesis(...))" — exactly one
    Evaluation per required name, degradation instead of silence.
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: >-
    evidenceTotalityViolations — "the collection plan's concept ... has no matching evidence" /
    "exactly one is required".
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: >-
    replayCase answers by slug and version alone with the store's content hash never consulted;
    "pinnedCaseOf: { slug: theCase.slug, version: theCase.version }" — never a digest over the
    content; investigation.ts names pinned_case, model, prompt_version and evidence as the four replay
    pins, carried whole by run-diagnosis.ts.
  encoded_at:
  - src/case/case-query.service.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: >-
    "await writeWithinDeadline(...); return investigation.assessment;" — the response leaves only
    after the write concluded, and is the written record's own.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  conforms: true
  how: >-
    "const NO_HYPOTHESIS_PROBLEM = 'the case declares no hypothesis'"; the fixture declares two.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-case-version-is-written-once
  conforms: false
  how: >-
    Write-once is carried by the primary key over (slug, version) with the duplicate mapped to
    CaseVersionAlreadyStoredError, but the same file computes and answers a sha256 content digest per
    version — "return { document, hash: contentHash(document) }" — where the node's own text is "with
    no digest over the content"; two answers now exist to what names a version's content.
  observed_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: >-
    The fixture pairs "subject": "contract" with collects the coherence read validates against the
    registered concepts, proven by seed.ts's uncaught verifySeededCase.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: >-
    collectsProblems — "`${locator} collects no concept`"; each fixture hypothesis collects at least
    one.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  conforms: true
  how: >-
    "stringProblems(value['criterion'], ...)" — absent, non-string and empty all refused; the fixture
    declares one per hypothesis.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  conforms: true
  how: >-
    sharedNameProblems — "`hypotheses ${at.join(', ')} share the name`"; the fixture's two names are
    distinct.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  conforms: true
  how: >-
    case.ts declares position "also unique within its case", and the parse refuses shared positions —
    sharedPositionProblems.
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: >-
    "INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING" — cases.slug as the
    table's sole column and primary key is the whole of how a second, distinct case under one slug is
    refused.
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: >-
    Every subject type, concept, outcome, action and recipient in the fixture is named by glossary
    name, seeded before the case is authored and re-checked at every read.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: >-
    replayCase answers the pinned version's exact stored content even where it would now fail a rule,
    and the store keeps every version — "listVersions: SELECT version FROM ${CASE_VERSIONS_TABLE}
    WHERE slug = $1 ORDER BY version" — no delete exists.
  encoded_at:
  - src/case/case-query.service.ts
  - src/persistence/relational-case-store.repository.ts
- node: rules/knowledge/every-position-declares-a-resolution
  conforms: true
  how: >-
    resolutionProblems run for the fallback and every hypothesis — "`${subject} is undeclared`"; the
    fixture's fallback and both hypotheses each declare outcome and referral.
  encoded_at:
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  conforms: true
  how: >-
    "byPrecedence: [...theCase.hypotheses].sort((a, b) => a.position - b.position)" — never by the
    array's own arrangement; the parse keeps document order and carries positions through; the fixture
    declares positions 1 and 2 explicitly.
  encoded_at:
  - src/case/case-resolution.ts
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  conforms: true
  how: >-
    Each fixture criterion states one claim ("An active network outage is currently registered for
    the contract's service area."); the node leaves verification to human review.
  encoded_at:
  - src/fixtures/case/intermittent-connection-outage/1.json
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: >-
    Coherence is checked against the glossary and the capability registry as they stand right now —
    caseCoherenceViolations reads this.capabilities at each readCase.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: >-
    "read-case alone runs that validation, at every one of its own readings" while replayCase is the
    declared exception — reproducibility pins content, not current validity.
  encoded_at:
  - src/case/case-query.service.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: >-
    "if (nonOkEvidence.length > 0) { return noDataEvaluation(name, nonOkEvidence); }" — inconclusive
    with reason no-data, citing that evidence, never touching the pool.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: >-
    retryOrFail — no retry at all once the deadline has elapsed; one retry, and a second structural
    miss becomes a judgment-failure evaluation.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: >-
    "if (!(await acquireSlotOrDeadline(pool, deadlineGuard))) { return
    deadlineExceededEvaluation(name); }" — nothing failed and the data arrived, only time ran out.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: >-
    "if (outcome === WRITE_TIMED_OUT) { throw new InvestigationWriteDeadlineExceededError(...) }" —
    the requester receives an error, not the assessment.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: scenarios/knowledge/no-confirmation-falls-back
  conforms: true
  how: >-
    "if (determining === undefined) { return { outcome: theCase.fallback.outcome, referral:
    theCase.fallback.referral }; }" — no determining hypothesis named.
  encoded_at:
  - src/case/case-resolution.ts
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  conforms: true
  how: >-
    "byPrecedence(theCase).find((hypothesis) => verdicts[hypothesis.name] === CONFIRMED)" — the first
    confirmed in declared precedence answers; the verdicts are only read here, never written.
  encoded_at:
  - src/case/case-resolution.ts
notes: >-
  contracts/investigation/case-source moved on the specification side since its bind and was judged
  as it now stands. Three paths bindings still claim no longer exist on disk and are outside this
  record's file set, since no judgment can read them: src/persistence/file-capability-store.repository.ts
  under domain/integration/capability, src/persistence/file-investigation-store.repository.ts under
  rules/investigation/an-investigation-is-written-once, and src/persistence/file-case-store.repository.ts
  under rules/knowledge/every-case-version-remains-readable — all deleted by
  task/service-on-the-database/store-wiring's migration to relational stores; their facts moved into
  the relational repositories those tasks bound, and the route for the stale paths is trace.py
  --replace, a hand operation outside this record. Because eight nodes above carry findings, this
  record binds nothing — not even the fifty-eight that cleared.
---
