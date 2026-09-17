---
contract_version: siegard-reconcile/5
title: Backend removal of the glossary vocabulary subject-attribute
summary: 'Four tasks under initiative subject-attribute-glossary-removal-backend: removed the glossary
  attribute check from both simulate controllers and from investigation building, dropped subject-attribute
  from the glossary''s own vocabularies, and dropped the subject_attributes table and its foreign key
  via a new migration.'
target: backend
files:
- path: migrations/0023-drop-subject-attributes.sql
  change: New migration dropping investigation_subject_attribute_values_attribute_fkey and then the subject_attributes
    table, preserving every recorded row and the table's own primary key and its foreign key to investigations.
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  change: Same SEEDED_SUBJECT_ATTRIBUTE_NAME substitution, for the same FK reason.
- path: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  change: Removed the subject_attributes INSERT/DELETE calls from its fixture helpers.
- path: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  change: SEEDED_SUBJECT_ATTRIBUTE_NAME substitution replacing the retired fixture read, for the FK the
    migration later drops.
- path: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  change: Same substitution as the simulate-case factory spec.
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  change: ensureFixtureSeeded/cleanupFixtureSeeded drop their subject_attributes seed and cleanup.
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  change: buildSimulateCase/buildSimulateHypothesis dropped the glossary field they built; seeding switched
    from the retired fixture to a shared literal name.
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  change: Same change — dropped the glossary field and switched seeding to the shared literal name.
- path: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  change: Drops the subject-attribute cleanup call and rewrites the five-vocabularies round-trip test
    for four.
- path: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  change: Removed the subject_attributes INSERT/DELETE calls from its fixture helpers.
- path: src/__tests__/integration/persistence/schema-migrations.spec.ts
  change: EXPECTED_TABLES drops subject_attributes; new filename-order, structural FK/PK and row-survival
    tests added; the full round-trip test now demonstrates the free-text attribute name.
- path: src/__tests__/integration/seed.spec.ts
  change: Cleanup helpers drop their subject_attributes delete-by-fixture-name calls; removed the subject-attribute-name
    test.
- path: src/__tests__/unit/errors/status-map.spec.ts
  change: New test chaining buildSubject's real throw into statusForError for the 422 mapping.
- path: src/__tests__/unit/glossary/glossary.service.spec.ts
  change: The page-count-zero test now exercises 'subject-type' instead of the retired 'subject-attribute'.
- path: src/__tests__/unit/glossary/terms.spec.ts
  change: New file asserting TERM_VOCABULARIES lists exactly the four remaining vocabularies.
- path: src/__tests__/unit/http/build-app.spec.ts
  change: stubSimulateCase/stubSimulateHypothesis no longer carry a glossaryQuery; not otherwise updated
    by this delivery.
- path: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
  change: Retitled the five-vocabularies 400 test to four; adds a test asserting GET /v1/glossary/subject-attribute
    now answers 400.
- path: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  change: Retitled its own five-vocabularies 400 test to four.
- path: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
  change: Removed the now-unused freshGlossaryQuery helper; dependency objects no longer carry a glossary
    field.
- path: src/__tests__/unit/http/simulate-case.controller.spec.ts
  change: Dropped glossary stubs and the two glossary-refusal tests; retitled and asserts the empty-attribute
    422 refusal.
- path: src/__tests__/unit/http/simulate-case.routes.spec.ts
  change: buildTestApp no longer constructs an IGlossaryQuery stub or passes glossary.
- path: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  change: Same shape of change as the case controller spec.
- path: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
  change: Same change for the hypothesis route spec.
- path: src/__tests__/unit/investigation/investigation-factory.spec.ts
  change: Removed six glossary-only tests and stubs; kept the two subject-related and every totality-violation
    test.
- path: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  change: New test proving the glossary field's removal from the built-options literal while the pipeline's
    own (unrelated) glossary dependency is still supplied.
- path: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  change: The it.each vocabulary/table-mapping test drops the subject-attribute row.
- path: src/case/validate-case-coherence.ts
  change: VOCABULARY_ROLES drops its dead 'subject-attribute' entry.
- path: src/errors/status-map.ts
  change: Added SubjectCarriesNoAttributeError mapped to 422 and DuplicateGlossaryNameError mapped to
    500.
- path: src/factories/diagnose-server.factory.ts
  change: simulateCase and simulateHypothesis are now constructed as { caseQuery, runSimulate } and {
    caseQuery, runSimulateHypothesis } with no glossary field.
- path: src/glossary/terms.ts
  change: TERM_VOCABULARIES shrinks to exactly ['subject-type', 'outcome', 'action', 'recipient'].
- path: src/http/simulate-case.controller.ts
  change: Removed the refuseAttributesNotInGlossary call, the glossary field from SimulateCaseControllerDependencies,
    and the IGlossaryQuery/refuseAttributesNotInGlossary imports. handleSimulateCaseRequest still invokes
    buildSubject as a bare statement for its own SubjectCarriesNoAttributeError throw.
- path: src/http/simulate-hypothesis.controller.ts
  change: Same removal — the glossary field, the refuseAttributesNotInGlossary call and its imports are
    gone; buildSubject is still called as a bare statement for its own refusal.
- path: src/investigation/investigation-factory.ts
  change: Removed refuseAttributesNotInGlossary, its call, the BuildInvestigationOptions.glossary field,
    and the SubjectAttributeNotInGlossaryError/IGlossaryQuery imports.
- path: src/investigation/run-diagnosis.ts
  change: 'Removed the glossary: options.glossary, line from the BuildInvestigationOptions literal.'
- path: src/persistence/relational-glossary-store.repository.ts
  change: VOCABULARY_TABLES drops the 'subject-attribute' -> 'subject_attributes' entry.
- path: src/seed.ts
  change: seedRemainingVocabularies() no longer calls insertMissingTerms('subject-attribute', ...).
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the two it blocks
    calling query.readCase(SLUG, VERSION) and asserting the returned case is complete — const result =
    await query.readCase(SLUG, VERSION); expect(result.case.slug).toBe(SLUG); expect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);

    src/seed.ts: held at alreadySeeded(), lines 156-159 — const stored = await createCaseStore(connection).assembleVersion(CASE_SLUG,
    CASE_VERSION); return stored !== undefined;'
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: true
  how: 'src/errors/status-map.ts: held at the fallback branch of statusForError — return undefined;'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at runDiagnosis, lines 27-42 — export async function
    runDiagnosis(options: RunDiagnosisOptions): Promise<Assessment> { ... return investigation.assessment;
    }'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: false
  how: 'no named file holds this fact now: src/investigation/run-diagnosis.ts read `nowhere` — const {
    evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);'
  observed_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: 'src/errors/status-map.ts: held at the CapabilityIdentityNotFoundError entry — [CapabilityIdentityNotFoundError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: constraints/the-connection-pool-is-bounded-by-configuration
  conforms: true
  how: "src/factories/diagnose-server.factory.ts: held at databasePoolOptionsFrom(), lines 53-59 — function\
    \ databasePoolOptionsFrom(env: Env): IDatabaseConnectionPoolOptions {\n  return { maxConnections:\
    \ env.DATABASE_POOL_MAX_CONNECTIONS, idleTimeoutMs: env.DATABASE_POOL_IDLE_TIMEOUT_MS, statementTimeoutMs:\
    \ env.DATABASE_POOL_STATEMENT_TIMEOUT_MS };\n}\n\nsrc/seed.ts: held at databasePoolOptionsFrom(),\
    \ lines 165-171 — return { maxConnections: env.DATABASE_POOL_MAX_CONNECTIONS, idleTimeoutMs: env.DATABASE_POOL_IDLE_TIMEOUT_MS,\
    \ statementTimeoutMs: env.DATABASE_POOL_STATEMENT_TIMEOUT_MS };"
  encoded_at:
  - src/factories/diagnose-server.factory.ts
  - src/seed.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: 'src/factories/diagnose-server.factory.ts: held at line 28 — const connection = createDatabaseConnection(env.DATABASE_URL,
    poolOptions);'
  encoded_at:
  - src/factories/diagnose-server.factory.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: "src/investigation/run-diagnosis.ts: held at persistenceStageBoundMs, lines 93-95 — function persistenceStageBoundMs(now:\
    \ number, deadline: number, elapsedBeforePersistenceMs: number): number {\n  return Math.min(PERSISTENCE_STAGE_BUDGET_MS,\
    \ Math.max(0, deadline - now - elapsedBeforePersistenceMs));\n}"
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the file''s import list, lines 1-11 — import
    { collectionPlan, requiresEvaluationOf } from ''../case/case-resolution.js'';

    import type { Case } from ''../case/case.js'';

    import { InvestigationNotBuildableError } from ''../errors/investigation-not-buildable.error.js'';

    import { buildSubject } from ''./subject.js'';'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: "migrations/0023-drop-subject-attributes.sql: held at the file itself — a plain numbered script\
    \ beside its siblings, applied through its own DDL statements with no manually-performed step — ALTER\
    \ TABLE investigation_subject_attribute_values\n  DROP CONSTRAINT investigation_subject_attribute_values_attribute_fkey;\n\
    \nDROP TABLE subject_attributes;\n"
  encoded_at:
  - migrations/0023-drop-subject-attributes.sql
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: 'migrations/0023-drop-subject-attributes.sql: held at the DROP TABLE statement removing the table
    paired with no Domain Model element — DROP TABLE subject_attributes;'
  encoded_at:
  - migrations/0023-drop-subject-attributes.sql
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'src/factories/diagnose-server.factory.ts: held at createDiagnoseHttpServer(), lines 27-45 — const
    connection = createDatabaseConnection(env.DATABASE_URL, poolOptions);

    const caseQuery = createCaseQuery(connection);

    const caseInputRequirementsQuery = createCaseInputRequirementsQuery(connection);


    src/persistence/relational-glossary-store.repository.ts: held at every operation routes through runStatement/runInTransaction
    against the single injected IConnectableQueryable connection — return runStatement<GlossaryTerm>(this.connection,
    { text: `SELECT name FROM ${VOCABULARY_TABLES[vocabulary]}` }, raiseReadFailure,);'
  encoded_at:
  - src/factories/diagnose-server.factory.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: 'src/persistence/relational-glossary-store.repository.ts: held at writeConcepts, via upsertConceptStatement
    — INSERT INTO ${CONCEPTS_TABLE} (name, ttl, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO
    UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description'
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConnectorConfigurationNotFoundError, ConnectorConfigurationNotWellFormedError
    and IncompleteConnectorConfigurationError entries — [ConnectorConfigurationNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/investigation/case-simulation
  conforms: true
  how: 'src/http/simulate-case.controller.ts: held at the destructuring of runSimulate''s result and the
    return statement, lines 18-24 — const { evidence, evaluations, resolved, assessment, cost, durations
    } = await dependencies.runSimulate({...});

    return { evidence, evaluations, resolved, assessment, cost, durations };

    src/http/simulate-hypothesis.controller.ts: held at the shape of the call to runSimulateHypothesis
    and of the returned response — const { evidence, evaluation, durations } = await dependencies.runSimulateHypothesis({...});

    return { evidence, evaluation, durations };'
  encoded_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
- node: contracts/investigation/case-source
  conforms: false
  how: 'no named file holds this fact now: src/investigation/run-diagnosis.ts read `nowhere` — case: options.case,'
  observed_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/errors/status-map.ts: held at the SubjectDoesNotCoverCaseInputsError, SubjectCarriesNoAttributeError
    and InvestigationWriteDeadlineExceededError entries — [InvestigationWriteDeadlineExceededError, 500],

    src/investigation/run-diagnosis.ts: held at runDiagnosis, lines 27-42 — export async function runDiagnosis(options:
    RunDiagnosisOptions): Promise<Assessment> { ... }'
  encoded_at:
  - src/errors/status-map.ts
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/glossary-source
  conforms: false
  how: 'no named file holds this fact now: src/http/simulate-case.controller.ts read `nowhere` — no read-concept
    dependency is imported or called here; the concept read happens inside runSimulate''s own pipeline.;
    src/http/simulate-hypothesis.controller.ts read `nowhere` — no call in this file reads a concept from
    the glossary directly.; src/investigation/investigation-factory.ts read `nowhere` — const counts =
    countsByKey(evidence.map((item) => item.concept));

    This treats concept as an opaque string key; the file performs no glossary read-concept call.'
  observed_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/investigation-factory.ts
- node: contracts/knowledge/capability-check
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at capabilityViolations, the await capabilities.readCapability
    call per concept — violations.push(...answerGaps(name, await capabilities.readCapability(name)));'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: 'src/factories/diagnose-server.factory.ts: held at lines 34 and 36-42 — const caseInputRequirementsQuery
    = createCaseInputRequirementsQuery(connection);

    const diagnose: DiagnoseControllerDependencies = { caseQuery, caseInputRequirementsQuery, runDiagnose,
    };

    '
  encoded_at:
  - src/factories/diagnose-server.factory.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/errors/status-map.ts: held at the CaseAlreadyHasDraftError, CaseHoldsNoDraftError, ManifestPositionOccupiedError
    etc. entries — [CaseHoldsNoDraftError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/vocabulary-terms
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at vocabularyViolations'' glossary.readVocabularyTerm
    call and conceptViolations'' glossary.readConcept call — const resolution = await glossary.readVocabularyTerm(vocabulary,
    name);

    const resolution = await glossary.readConcept(name);'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: contracts/system/case-authoring
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at caseCoherenceViolations combining every check into
    one list before validateCaseCoherence throws once — return [...(await glossaryCoherenceViolations(theCase,
    glossary)), ...(await capabilityViolations(theCase, capabilities))];

    const violations = await caseCoherenceViolations(theCase, glossary, capabilities);

    if (violations.length > 0) { throw new IncoherentCaseError(theCase.slug, violations); }'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/glossary/action
  conforms: true
  how: "src/__tests__/integration/seed.spec.ts: held at the fixture-vs-database action-name assertion,\
    \ lines 247-252 — const { rows } = await connection.query<{ name: string }>('SELECT name FROM actions\
    \ WHERE name = ANY($1)', [expected]);\n\nsrc/glossary/terms.ts: held at line 11 — export type Action\
    \ = GlossaryTerm; — export type Action = GlossaryTerm;\nsrc/persistence/relational-glossary-store.repository.ts:\
    \ held at the action: 'actions' entry of VOCABULARY_TABLES — outcome: 'outcomes',\n  action: 'actions',\n\
    \  recipient: 'recipients',"
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/terms.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/concept
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the concept fixture-match test, lines 261-285,
    and the description column test, lines 287-304 — const { rows: conceptRows } = await connection.query<{
    name: string; ttl: number }>(''SELECT name, ttl FROM concepts WHERE name = ANY($1)'', [conceptNames]);


    src/glossary/terms.ts: held at lines 19-27 — the Concept type — export type Concept = { readonly name:
    string; readonly accepts: readonly string[]; readonly ttl: number; readonly description: string; };

    src/persistence/relational-glossary-store.repository.ts: held at IConceptRow, upsertConceptStatement
    and readWholeConcepts — interface IConceptRow { readonly name: string; readonly ttl: number; readonly
    description: string; }

    src/seed.ts: held at seedConcepts(), lines 74-84 — INSERT INTO concepts (name, ttl, description) VALUES
    ($1, $2, $3) ...'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/terms.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/seed.ts
- node: domain/glossary/outcome
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the non-conclusion-outcomes test, lines 223-231,
    and the fixture outcome-names test, lines 233-238 — const nonConclusionNames = NON_CONCLUSION_OUTCOMES.map((outcome)
    => outcome.name);


    src/glossary/terms.ts: held at line 9 and lines 38-41 — NON_CONCLUSION_OUTCOMES — export type Outcome
    = GlossaryTerm;

    export const NON_CONCLUSION_OUTCOMES: readonly Outcome[] = [{ name: ''inconclusive-no-data'' }, {
    name: ''inconclusive-hypotheses-exhausted'' }];

    src/persistence/relational-glossary-store.repository.ts: held at the outcome: ''outcomes'' entry of
    VOCABULARY_TABLES — outcome: ''outcomes'',

    src/seed.ts: held at seedOutcomes(), lines 30-35 — const fixtureOutcomes = await fixtureTerms(''outcome.json'');
    const known = new Set(fixtureOutcomes.map((outcome) => outcome.name));'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/terms.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/seed.ts
- node: domain/glossary/recipient
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the recipient names test, lines 254-259 — const
    { rows } = await connection.query<{ name: string }>(''SELECT name FROM recipients WHERE name = ANY($1)'',
    [expected]);


    src/glossary/terms.ts: held at line 13 — export type Recipient = GlossaryTerm; — export type Recipient
    = GlossaryTerm;

    src/persistence/relational-glossary-store.repository.ts: held at the recipient: ''recipients'' entry
    of VOCABULARY_TABLES — recipient: ''recipients'','
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/terms.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-type
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the subject-type names test, lines 240-245 — const
    { rows } = await connection.query<{ name: string }>(''SELECT name FROM subject_types WHERE name =
    ANY($1)'', [expected]);


    src/glossary/terms.ts: held at line 5 — export type SubjectType = GlossaryTerm; — export type SubjectType
    = GlossaryTerm;

    src/persistence/relational-glossary-store.repository.ts: held at the ''subject-type'': ''subject_types''
    entry of VOCABULARY_TABLES — ''subject-type'': ''subject_types'','
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/glossary/terms.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/investigation/cost
  conforms: false
  how: 'no named file holds this fact now: src/investigation/run-diagnosis.ts read `nowhere` — const {
    evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);'
  observed_at:
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/durations
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/factories/diagnose-server.factory.spec.ts,
    and src/investigation/run-diagnosis.ts read `nowhere` — const { evidence, evaluations, assessment,
    cost, durations } = await runInvestigationPipeline(options); — a binding asserts the file answers
    for the node, so the pair that stopped holding it is released by `--bind ... --replace`, never restamped
    here'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/investigation
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the returned object literal, lines 40-55 —
    return { id: options.id, requester: options.requester, ... written_at: options.written_at! };

    src/investigation/run-diagnosis.ts: held at buildInvestigationOptions, lines 55-73 — return { id:
    options.id, requester: options.requester, ... cost, durations, };'
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/subject
  conforms: true
  how: 'src/http/simulate-case.controller.ts: held at the buildSubject call, line 17 — buildSubject(body.subject.type,
    body.subject.attributes);

    src/http/simulate-hypothesis.controller.ts: held at the buildSubject call and the subjectType/subjectAttributes
    fields forwarded — buildSubject(body.subject.type, body.subject.attributes);

    src/investigation/investigation-factory.ts: held at line 38 (build) and line 45 (assignment) — const
    subject = buildSubject(subjectType, subjectAttributes);'
  encoded_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/investigation-factory.ts
- node: domain/investigation/subject-attribute-value
  conforms: false
  how: "src/__tests__/integration/persistence/schema-migrations.spec.ts, the IGlossary interface (lines\
    \ 39-46) and its use to build the `glossary` fixture (lines 250-264, 288-296): interface IGlossary\
    \ {\n  subjectType: string;\n  outcome: string;\n  action: string;\n  recipient: string;\n  subjectAttribute:\
    \ string;\n  concept: string;\n} — Five of the six fields this type groups together — subjectType,\
    \ outcome, action, recipient, concept — are governed vocabulary terms this same suite still enforces\
    \ through a foreign key to a vocabulary table (subject_types, outcomes, actions, recipients, concepts).\
    \ subjectAttribute is bundled into the same \"glossary\" shape and populated the same way (`subjectAttribute:\
    \ 'an-attribute'` in seedMinimalPreMigrationVocabulary and in the shared `glossary` fixture), even\
    \ after migration 0023 — verified by this very file — drops the vocabulary table and the foreign key\
    \ that once tied attribute to it. A reader relying on this type to learn which subject facts remain\
    \ glossary-checked after the drop will read subject-attribute as still belonging to that governed\
    \ set, when the specification holds the opposite.\nsrc/glossary/terms.ts, line 7 — `export type SubjectAttribute\
    \ = GlossaryTerm;`, sitting between SubjectType (line 5) and Outcome (line 9): export type SubjectAttribute\
    \ = GlossaryTerm; — TERM_VOCABULARIES already lists exactly the four vocabularies the glossary publishes,\
    \ with no 'subject-attribute' entry. Leaving SubjectAttribute typed as a GlossaryTerm — the same governed-name\
    \ shape as SubjectType, Outcome, Action and Recipient — tells the next reader that a fifth governed\
    \ vocabulary still exists, exactly the fact domain/investigation/subject-attribute-value says is no\
    \ longer true."
  observed_at:
  - migrations/0023-drop-subject-attributes.sql
  - src/__tests__/integration/persistence/schema-migrations.spec.ts
  - src/investigation/investigation-factory.ts
- node: domain/knowledge/case
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at the throw in validateCaseCoherence, line 52 — throw
    new IncoherentCaseError(theCase.slug, violations);'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the whole-read-back test, lines 330-356 — expect(result.case.slug).toBe(fixture.slug);


    src/case/validate-case-coherence.ts: held at namedVocabularyTerms reading theCase.subject and declaredResolutions
    reading theCase.fallback — { vocabulary: ''subject-type'', name: theCase.subject },

    return [...theCase.hypotheses.map((hypothesis) => hypothesis.resolution), theCase.fallback];

    src/http/simulate-hypothesis.controller.ts: held at the destructured pinnedCase read from caseQuery.readCase
    and forwarded as case — const { case: pinnedCase } = await dependencies.caseQuery.readCase(body.case.slug,
    body.case.version);'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/case/validate-case-coherence.ts
  - src/http/simulate-hypothesis.controller.ts
- node: domain/knowledge/case-version-state
  conforms: true
  how: 'src/http/simulate-case.controller.ts: held at the readCase call, line 16 — const { case: pinnedCase
    } = await dependencies.caseQuery.readCase(body.case.slug, body.case.version);'
  encoded_at:
  - src/http/simulate-case.controller.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at declaredResolutions, line 78 — theCase.hypotheses.map((hypothesis)
    => hypothesis.resolution)'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at placeFixtureHypotheses''s
    call to lifecycle.reviseHypothesis — const revised = await lifecycle.reviseHypothesis({ slug: fixture.slug,
    ... });

    src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at placeFixtureHypotheses
    and releaseOwnedHypothesisRevision, via reviseHypothesis — const revised = await lifecycle.reviseHypothesis({
    slug: fixture.slug, hypothesis_name: entry.hypothesis_name, criterion: entry.criterion, collects:
    entry.collects, resolution: entry.resolution, subject: fixture.subject });

    src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts: held at seedFixture / createDraftAndRevision,
    lines 168-177 and 419-434 — const revised = await lifecycle.reviseHypothesis({ slug: fixture.slug,
    hypothesis_name: ''h1'', ... });

    src/case/validate-case-coherence.ts: held at conceptViolations and capabilityViolations, both iterating
    collectionPlan(theCase) — for (const name of collectionPlan(theCase)) {

    src/seed.ts: held at placeFixtureHypotheses(), lines 109-116 — const revised = await lifecycle.reviseHypothesis({
    slug: fixture.slug, ... });'
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  - src/case/validate-case-coherence.ts
  - src/seed.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the test "seeds every
    hypothesis-revision the fixture case version''s manifest references as released" — expect(states).toEqual(manifestEntries.map(()
    => ''released''));

    src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the RELEASED_REVISION_STATE
    constant and the assertion that every returned row''s state equals it — const RELEASED_REVISION_STATE
    = ''released''; expect(rows.every((row) => row.state === RELEASED_REVISION_STATE)).toBe(true);

    src/seed.ts: held at releaseManifestedRevisions(), line 135 — await lifecycle.releaseHypothesisRevision(slug,
    revision.hypothesis_name, revision.revision);'
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: domain/knowledge/referral
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at termsOf(''action'', ...) and termsOf(''recipient'',
    ...), lines 72-73 — ...termsOf(''action'', resolutions.map((resolution) => resolution.referral.action)),'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: domain/knowledge/resolution
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at declaredResolutions and termsOf(''outcome'', ...),
    lines 71 and 77-79 — ...termsOf(''outcome'', resolutions.map((resolution) => resolution.outcome)),'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConceptDescriptionRequiredError entry — [ConceptDescriptionRequiredError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the VocabularyTermNotHeldError and ConceptNotHeldError entries
    — [VocabularyTermNotHeldError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: false
  how: 'the fact left part of its ground: still held in src/errors/status-map.ts, and src/persistence/relational-glossary-store.repository.ts
    read `nowhere` — readTerms and readConcepts issue a plain SELECT with no duplicate-row check; no DuplicateGlossaryNameError
    is raised anywhere in this file. — a binding asserts the file answers for the node, so the pair that
    stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/errors/status-map.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: 'src/glossary/terms.ts: held at lines 38-41 — NON_CONCLUSION_OUTCOMES names exactly the two outcomes
    the rule requires — export const NON_CONCLUSION_OUTCOMES: readonly Outcome[] = [...]

    src/persistence/relational-glossary-store.repository.ts: held at insertMissingTerms, via insertMissingTermStatement
    — INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING

    src/seed.ts: held at seedOutcomes(), lines 33-34, called before seedCase — const missing = NON_CONCLUSION_OUTCOMES.filter((outcome)
    => !known.has(outcome.name)); await store.insertMissingTerms(''outcome'', [...fixtureOutcomes, ...missing]);'
  encoded_at:
  - src/glossary/terms.ts
  - src/persistence/relational-glossary-store.repository.ts
  - src/seed.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the MalformedCapabilityInputSchemaError entry — [MalformedCapabilityInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConnectorConfigurationNotWellFormedError and IncompleteConnectorConfigurationError
    entries — [ConnectorConfigurationNotWellFormedError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the IncompleteConnectorConfigurationError entry — [IncompleteConnectorConfigurationError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConnectorConfigurationNotFoundError entry — [ConnectorConfigurationNotFoundError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConnectorPlaceholderOutsideInputSchemaError entry — [ConnectorPlaceholderOutsideInputSchemaError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    entries — [OpenApiDocumentNotFetchedError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotReadableError entry — [OpenApiDocumentNotReadableError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotReadableError entry — [OpenApiDocumentNotReadableError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiOperationNotFoundError entry — [OpenApiOperationNotFoundError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    entries — [OpenApiDocumentNotFetchedError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at the OpenApiDocumentNotFetchedError entry — [OpenApiDocumentNotFetchedError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: 'src/errors/status-map.ts: held at the SubjectDoesNotCoverCaseInputsError entry — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  conforms: false
  how: 'no named file holds this fact now: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
    read `nowhere` — expect(written?.durations_judgment).toBeGreaterThanOrEqual(MOCK_RESPONSE_DELAY_MS);'
  observed_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the HypothesisNotInManifestError entry — [HypothesisNotInManifestError,
    404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
  conforms: false
  how: 'no named file holds this fact now: src/http/simulate-case.controller.ts read `nowhere` — no requirement
    check or refusal branch appears between buildSubject and runSimulate.; src/http/simulate-hypothesis.controller.ts
    read `nowhere` — no check against a case-input-requirement, and no refusal for a missing required
    attribute, is present in this file.'
  observed_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: false
  how: "src/__tests__/unit/http/build-app.spec.ts, the test \"refuses with 400 a request whose subject\
    \ carries no attribute at all\" (diagnose route), around line 612-624: const response = await app.inject({\n\
    \  method: 'POST',\n  url: '/v1/diagnose',\n  payload: validRequestBody({ subject: { type: 'a-subject-type',\
    \ attributes: [] } }),\n});\n\nexpect(response.statusCode).toBe(400);\nexpect(built.runDiagnose).not.toHaveBeenCalled();\
    \ — The specification's own decision for this exact condition (decision-log.md, location rules/investigation/a-subject-carries-at-least-one-attribute.md:\
    \ \"A call whose subject carries no attribute-value is refused with an HTTP 422 response reporting\
    \ a SubjectCarriesNoAttributeError\", precisely because \"400 being reserved by a-malformed-request-is-refused-with-a-validation-error\
    \ for the route's declared shape\") calls for HTTP 422 and a named domain error here, not the generic\
    \ 400 this test locks in with no error-class assertion at all.\nsrc/__tests__/unit/http/build-app.spec.ts,\
    \ the test \"refuses with 400 a simulate-case request whose subject carries no attribute at all, at\
    \ the wire, before the route ever reaches its own controller\", around line 696-707: const response\
    \ = await app.inject({\n  method: 'POST',\n  url: '/v1/simulate',\n  payload: { ...validSimulateRequestBody(),\
    \ subject: { type: 'a-subject-type', attributes: [] } },\n});\n\nexpect(response.statusCode).toBe(400);\
    \ — Same rule, same decided response: rules/investigation/a-subject-carries-at-least-one-attribute\
    \ names no exception for simulate. This test's own title frames the 400 as a wire-level shape check,\
    \ but the node's decided fact is a domain refusal (422, SubjectCarriesNoAttributeError), not a shape\
    \ violation."
  observed_at:
  - src/errors/status-map.ts
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
  - src/investigation/investigation-factory.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: false
  how: "src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts, the title string of\
    \ the third `it()` block, lines 472-476: \"declares TOTAL_DEADLINE_BUDGET_MS, the total deadline this\
    \ file injects into the diagnose runner, equal to \" +\n  \"rules/investigation/an-answer-arrives-within-the-declared-deadline's\
    \ own declared total of 20000ms \" +\n  '(2000 overhead/margin + 7000 collection + 5000 judgment +\
    \ 4000 writing + 2000 persistence), never a locally ' +\n  'chosen figure that diverges from it' —\
    \ The only assertion this test makes is `expect(declared).toBe(20_000)` — it never reads back or checks\
    \ the per-stage split. If the specification's own breakdown of the twenty-second budget changes, this\
    \ title keeps stating the old split as fact and nothing here would catch the drift; a reader who trusts\
    \ this title for the breakdown reads a business decision that may no longer be the one the node holds."
  observed_at:
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at raceWriteAttempt, lines 113-119 — const settlement
    = write.then((): WriteAttemptOutcome => ''settled'', (error: unknown): WriteAttemptOutcome => (error
    instanceof InvestigationAlreadyStoredError ? ''settled'' : ''failed''),);'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: false
  how: "src/investigation/run-diagnosis.ts, the throw in writeWithinDeadline, line 89, reusing stageBoundMs:\
    \ const stageBoundMs = persistenceStageBoundMs(now, deadline, elapsedBeforePersistenceMs);\nconst\
    \ settled = stageBoundMs > 0 && (await persistWithinBound(store, investigation, stageBoundMs));\n\
    if (!settled) {\n  throw new InvestigationWriteDeadlineExceededError(investigation.id, stageBoundMs);\n\
    } — The node requires remainingMs to be the milliseconds that remained of the declared deadline when\
    \ persistence gave up. stageBoundMs is instead the bound persistence was granted at entry, fixed before\
    \ any write attempt runs. A requester who meets this refusal is told a number that is never the actual\
    \ deadline slack left when persistence stopped trying — sometimes overstating it as nonzero when in\
    \ fact none was left."
  observed_at:
  - src/errors/status-map.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at evaluationTotalityViolations, lines 97-116
    — const required = requiresEvaluationOf(theCase);

    const counts = countsByKey(evaluations.map((item) => item.hypothesis));'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at evidenceTotalityViolations, lines 76-95 —
    const plan = collectionPlan(theCase);

    const counts = countsByKey(evidence.map((item) => item.concept));'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the returned object''s pinned_case, model,
    prompt_version and evidence fields, lines 46-49 — pinned_case: pinnedCaseOf(theCase), prompt_version:
    options.prompt_version, model: options.model, evidence: [...evidence],

    src/investigation/run-diagnosis.ts: held at buildInvestigationOptions, lines 63-68 — case: options.case,
    prompt_version: options.prompt_version, model: options.model, evidence,'
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at runDiagnosis, lines 34-41 — await writeWithinDeadline({
    store: options.store, investigation, now: options.now, deadline: options.deadline, elapsedBeforePersistenceMs,
    }); return investigation.assessment;'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/written-at-records-when-the-write-settled
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the returned object''s written_at field, line
    54 — written_at: options.written_at!,

    src/investigation/run-diagnosis.ts: held at buildInvestigationOptions''s returned object, lines 57-72
    (written_at omitted) — return { id: options.id, ... cost, durations, };'
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/run-diagnosis.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/errors/status-map.ts: held at the CaseVersionNotValidError entry — [CaseVersionNotValidError,
    409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: 'src/__tests__/integration/seed.spec.ts: held at the reseed-idempotency tests, lines 358-366 —
    it(''resolves without rejecting when seed.ts is run a second time against a database it has already
    seeded'', async () => {


    src/seed.ts: held at main script, lines 182-184 — if (!(await alreadySeeded(connection))) { await
    seedCase(connection); }'
  encoded_at:
  - src/__tests__/integration/seed.spec.ts
  - src/seed.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: false
  how: 'no named file holds this fact now: src/case/validate-case-coherence.ts read `nowhere` — the file
    imports only collectionPlan from ./case-resolution.js and computes no case-input-requirement, no per-attribute
    derivation and no capability input-schema check.'
  observed_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: 'src/glossary/terms.ts: held at line 36 and line 32 — export const DEFAULT_CONCEPT_TTL_SECONDS
    = 60; readonly ttl?: number;'
  encoded_at:
  - src/glossary/terms.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at conceptViolations, lines 91-95 — } else if (!resolution.concept.accepts.includes(theCase.subject))
    { violations.push(`the concept "${name}" does not accept the subject type "${theCase.subject}" the
    case declares`); }

    src/errors/status-map.ts: held at the ConceptRefusesSubjectTypeError entry — [ConceptRefusesSubjectTypeError,
    422],'
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: false
  how: 'the fact left part of its ground: still held in src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts,
    src/errors/status-map.ts, and src/seed.ts read `nowhere` — collects: entry.collects, — passed straight
    through, enforcement left to reviseHypothesis. — a binding asserts the file answers for the node,
    so the pair that stopped holding it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/errors/status-map.ts
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the CaseHoldsNoDraftError entry — [CaseHoldsNoDraftError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at releaseManifestedRevisions,
    driving the one declared draft-to-released transition — async function releaseManifestedRevisions(...)
    { for (const revision of revisions) { await lifecycle.releaseHypothesisRevision(...); } }

    src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the second-invocation-proof
    it block — const refusal = await lifecycle.releaseHypothesisRevision(ownedSlug, released.hypothesisName,
    released.revision).catch((error: unknown) => error); expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);

    src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts: held at the second `it()`
    block, lines 451-453 — const refusal = await releaseRevisionDirectly(connection, identity).catch((error:
    unknown) => error); expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);

    src/errors/status-map.ts: held at the HypothesisRevisionNotDraftAtReleaseError entry — [HypothesisRevisionNotDraftAtReleaseError,
    409],

    src/seed.ts: held at placeFixtureHypotheses()/releaseManifestedRevisions(), lines 109-135 — const
    revised = await lifecycle.reviseHypothesis({...}); ... await lifecycle.releaseHypothesisRevision(...);'
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  - src/errors/status-map.ts
  - src/seed.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: 'src/__tests__/integration/factories/diagnose-server.factory.spec.ts: held at the same manifest-state
    test as domain/knowledge/hypothesis-revision-state — expect(states).toEqual(manifestEntries.map(()
    => ''released''));

    src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the second it block —
    SELECT hr.state FROM hypothesis_revisions hr JOIN case_version_hypotheses cvh ... WHERE cv.slug =
    $1 AND cv.version = $2 AND cv.state = ''released''

    src/seed.ts: held at seedCase(), lines 151-153 — const placed = await placeFixtureHypotheses(lifecycle,
    fixture, draft.version); await releaseManifestedRevisions(lifecycle, fixture.slug, placed); await
    lifecycle.release(fixture.slug, draft.version);'
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: false
  how: 'the fact left part of its ground: still held in src/errors/status-map.ts, and src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
    read `nowhere` — No block attempts to alter a released revision''s criterion, resolution or state.
    — a binding asserts the file answers for the node, so the pair that stopped holding it is released
    by `--bind ... --replace`, never restamped here'
  observed_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/errors/status-map.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at vocabularyViolations lines 60-62 and conceptViolations
    lines 89-90 — if (!resolution.held) { violations.push(`the ${VOCABULARY_ROLES[vocabulary]} "${name}"
    does not exist in the glossary`); }

    src/errors/status-map.ts: held at the ConceptNotInGlossaryError entry — [ConceptNotInGlossaryError,
    404],'
  encoded_at:
  - src/case/validate-case-coherence.ts
  - src/errors/status-map.ts
- node: rules/knowledge/every-collected-concept-has-a-read-only-capability
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at answerGaps, lines 112-126 — if (capability.nature
    !== READ_ONLY_NATURE) { gaps.push(answeringGap(concept, ''is not read-only'')); }'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at capabilityViolations, a fresh await capabilities.readCapability(name)
    per concept on every call — violations.push(...answerGaps(name, await capabilities.readCapability(name)));'
  encoded_at:
  - src/case/validate-case-coherence.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: 'src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the last it block
    — "reads the shared canonical fixture case whole with no CaseVersionNotValidError, and with every
    hypothesis still collecting at least one concept..."

    src/seed.ts: held at verifySeededCase(), lines 161-163 — await createCaseQuery(connection).readCase(CASE_SLUG,
    CASE_VERSION);'
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/seed.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the ConceptDescriptionRequiredError entry — [ConceptDescriptionRequiredError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the SubjectDoesNotCoverCaseInputsError entry — [SubjectDoesNotCoverCaseInputsError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-draft-case-version-is-simulated
  conforms: true
  how: 'src/http/simulate-case.controller.ts: held at the return statement, line 24 — return { evidence,
    evaluations, resolved, assessment, cost, durations };'
  encoded_at:
  - src/http/simulate-case.controller.ts
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  conforms: false
  how: 'no named file holds this fact now: src/persistence/relational-glossary-store.repository.ts read
    `nowhere` — readWholeConcepts passes row.description straight through with no default or transformation.'
  observed_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at writeWithinDeadline, lines 84-91 — if (!settled) {
    throw new InvestigationWriteDeadlineExceededError(investigation.id, stageBoundMs); }'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
  conforms: true
  how: 'src/case/validate-case-coherence.ts: held at conceptViolations, lines 92-94 — the concept "${name}"
    does not accept the subject type "${theCase.subject}" the case declares,'
  encoded_at:
  - src/case/validate-case-coherence.ts
unstated:
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  where: the test 'does not treat a whitespace-only description as naming none...', lines 302-316
  evidence: "const registered = await glossary.registerConcept({\n  name: 'a-whitespace-description-concept',\n\
    \  accepts: ['a-subject-type'],\n  description: '   ',\n});\n\nexpect(registered.description).toBe('\
    \   ');"
  cost: No node decides whether a whitespace-only description counts as "no description" for rules/glossary/a-concept-declares-its-description's
    own refusal, yet this test fixes the answer as "no, it is a real description, stored verbatim" — the
    opposite of the idiom the specification applies everywhere else a required text field is checked (a
    connector name, a case's slug/title/subject/fallback), where "whitespace alone holds none" is the
    decided reading.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  where: line 103, inside the 404-refusal test (lines 93-104)
  evidence: 'expect(body.error.details).toEqual({ vocabulary: ''recipient'', name: ''an-absent-term''
    });'
  cost: The specification's own governing node for this refusal states only the status and the error class;
    this test additionally fixes, as a guaranteed contract, that the response body's error.details carries
    {vocabulary, name}, a fact no node holds.
- file: src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
  where: line 60, inside the case/hyphenation-preservation test (lines 53-61)
  evidence: expect(built.readVocabularyTerm).toHaveBeenCalledWith('outcome', 'Mixed-Case-Term');
  cost: Whether a vocabulary-term name is looked up exactly as spelled or normalized before resolution
    is fixed here as "never normalized" for one route's own test, with no node stating this matching semantics
    either way.
- file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  where: line 11 (EXPECTED_DEADLINE_BUDGET_MS) and the test titled 'computes now and a deadline the specification-declared
    twenty seconds later...' (lines 152-165)
  evidence: 'const EXPECTED_DEADLINE_BUDGET_MS = 20_000;

    it(''computes now and a deadline the specification-declared twenty seconds later, immediately before
    calling runSimulateHypothesis, and includes both in the call it sends'', async () => {

    expect(call?.deadline).toBe((call?.now ?? 0) + EXPECTED_DEADLINE_BUDGET_MS);'
  cost: rules/investigation/an-answer-arrives-within-the-declared-deadline constrains domain/investigation/investigation,
    a record neither simulate operation ever creates; its twenty-second breakdown even spends time on
    writing and persistence stages simulate-hypothesis never reaches. The 20,000ms figure this controller
    is held to lives only in this test.
- file: src/http/simulate-hypothesis.controller.ts
  where: the module-level constant TOTAL_DEADLINE_BUDGET_MS and its use in the deadline field passed to
    runSimulateHypothesis
  evidence: 'const TOTAL_DEADLINE_BUDGET_MS = 20_000;

    deadline: now + TOTAL_DEADLINE_BUDGET_MS,'
  cost: rules/investigation/an-answer-arrives-within-the-declared-deadline is scoped explicitly to "a
    diagnosis" and includes writing/persistence stages simulate-hypothesis never runs. This controller
    nonetheless binds simulate-hypothesis to the same 20,000ms ceiling with no node naming that figure
    for this operation.
unbound:
- src/__tests__/integration/factories/production-diagnose.factory.spec.ts
- src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
- src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/errors/status-map.spec.ts
- src/__tests__/unit/glossary/glossary.service.spec.ts
- src/__tests__/unit/glossary/terms.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
- src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
- src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
- src/__tests__/unit/http/simulate-case.controller.spec.ts
- src/__tests__/unit/http/simulate-case.routes.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
- src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
notes: "Judged by 36 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/subject-attribute-glossary-removal-backend.returns/.\nStaged by a review over\
  \ files a delivery wrote: no pair was omitted, so the delivery's own claims and every other binding\
  \ of these files were judged alike; the plan's node(s) constraints/the-schema-replays-from-its-scripts,\
  \ constraints/the-stored-schema-mirrors-the-declared-model, contracts/investigation/glossary-source,\
  \ domain/investigation/subject-attribute-value, rules/glossary/a-glossary-read-by-an-unheld-name-is-refused,\
  \ rules/glossary/a-vocabulary-holds-each-name-once, rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes,\
  \ rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses, rules/investigation/a-subject-carries-at-least-one-attribute\
  \ were read on every file and answered for, and bound from nowhere here — a binding this record writes\
  \ is one the trace already held.\nA finding in src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts\
  \ names domain/knowledge/consolidation-register, which no file of this set is bound to: the `consolidation_register`\
  \ field of the `CaseFixtureDocument` type, line 117: readonly consolidation_register?: 'formal' | 'plain';\
  \ — The register's closed vocabulary — formal or plain — is spelled out a second time here instead of\
  \ being read from the domain type that already carries it. If domain/knowledge/consolidation-register's\
  \ enumeration ever changed, this literal union would not change with it.. It blocks nothing here; it\
  \ is owed a route of its own.\nA finding in src/__tests__/unit/glossary/glossary.service.spec.ts names\
  \ constraints/listings-are-paged, which no file of this set is bound to: the test 'answers a page count\
  \ of zero for a non-positive limit, rather than dividing by it (API-03)', lines 513-521: const page\
  \ = await glossary.listVocabularyTerms('subject-type', { offset: 0, limit: 0 });\n\nexpect(page.pageCount).toBe(0);\
  \ — constraints/listings-are-paged states a limit is \"an optional positive integer\" and that \"no\
  \ request with a non-positive limit reaches the count, because a-malformed-request-is-refused-with-a-validation-error\
  \ refuses it first\" — this case is never supposed to reach this computation, yet this test fixes a\
  \ defined answer for it.. It blocks nothing here; it is owed a route of its own.\nA finding in src/errors/status-map.ts\
  \ names rules/integration/one-capability-answers-one-concept, which no file of this set is bound to:\
  \ the STATUS_BY_ERROR_CLASS map, lines 43-83 (and its import list, lines 1-39): [InvestigationWriteDeadlineExceededError,\
  \ 500],\n  [DuplicateGlossaryNameError, 500],\n]); — DuplicateConceptAnswerError is a fully implemented,\
  \ named error carrying its own concept and answers context, but it is imported and named nowhere in\
  \ this map. A concept read that finds two capabilities answering it throws this class, statusForError\
  \ finds no matching entry and falls through to a generic 500/INTERNAL_ERROR, indistinguishable from\
  \ any other unanticipated server fault.. It blocks nothing here; it is owed a route of its own.\nA finding\
  \ in src/seed.ts names rules/glossary/a-registered-concept-is-never-removed, which no file of this set\
  \ is bound to: seedConcepts(), lines 74-84: await connection.query(\n  `INSERT INTO concepts (name,\
  \ ttl, description) VALUES ($1, $2, $3)\n   ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,\n\
  \  [concept.name, concept.ttl, concept.description],\n);\nfor (const subjectType of concept.accepts)\
  \ {\n  await connection.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES\
  \ ($1, $2) ON CONFLICT DO NOTHING', [concept.name, subjectType]);\n} — Re-seeding an environment where\
  \ a concept's fixture already exists but its ttl changed, or a subject type was removed from its accepts\
  \ list, leaves the stored ttl and the stale concept_accepts row exactly as they were: the UPDATE clause\
  \ touches only description, and the concept_accepts insert only adds pairs, never removes one the fixture\
  \ no longer names.. It blocks nothing here; it is owed a route of its own.\ndomain/glossary/subject-attribute\
  \ is bound to src/glossary/terms.ts and the specification no longer holds it; no judge was handed it,\
  \ and --prune is its route.\nrules/investigation/a-subject-attribute-is-drawn-from-the-glossary is bound\
  \ to src/glossary/terms.ts and the specification no longer holds it; no judge was handed it, and --prune\
  \ is its route.\nrules/investigation/a-subject-attribute-is-drawn-from-the-glossary is bound to src/http/simulate-case.controller.ts\
  \ and the specification no longer holds it; no judge was handed it, and --prune is its route.\nrules/investigation/a-subject-attribute-is-drawn-from-the-glossary\
  \ is bound to src/http/simulate-hypothesis.controller.ts and the specification no longer holds it; no\
  \ judge was handed it, and --prune is its route.\ndomain/glossary/subject-attribute is bound to src/investigation/investigation-factory.ts\
  \ and the specification no longer holds it; no judge was handed it, and --prune is its route.\nrules/investigation/a-subject-attribute-is-drawn-from-the-glossary\
  \ is bound to src/investigation/investigation-factory.ts and the specification no longer holds it; no\
  \ judge was handed it, and --prune is its route.\ndomain/glossary/subject-attribute is bound to src/persistence/relational-glossary-store.repository.ts\
  \ and the specification no longer holds it; no judge was handed it, and --prune is its route.\nCandidates:\
  \ 73 opened across 22 of 36 delegation(s); each return lists its own under `candidates_opened`.\nUnstated:\
  \ 5 fact(s) the source states that no node holds, over 4 file(s), listed under `unstated`. They block\
  \ no binding here and no rebind closes them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/subject-attribute-glossary-removal-backend.returns/`, which are the evidence behind every entry above.
