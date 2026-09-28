---
contract_version: siegard-reconcile/5
title: 'Certification audit: isolable-proof candidates among mechanically-decided constraints'
summary: 'Every file this reconciliation names is asserted correct as it stands; none of the 72 files
  was edited. This is a certification audit over 10 constraint nodes the project registry already treats
  as mechanically decided by a registry step (commands[].decides in standards/backend-node-service.yaml),
  where a human-offered test file is judged by the coverage auditor against the auditor''s own rule --
  would the named test fail if the node''s fact stopped holding -- so that a node whose proof holds is
  bound as decided_by: test (a stronger, file-digest-pinned claim) rather than resting on the registry''s
  un-audited step-level claim alone. The union of every file the trace currently binds to those 10 nodes
  was read fresh by one specification-conformance-reviewer delegation per file, independent of the certification
  question, per the reconcile skill''s own discipline.'
target: backend
files:
- path: migrations/0001-schema-migrations.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0002-glossary-vocabulary.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0003-capability-registry.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0004-case-and-hypothesis.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0005-investigation.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0006-case-version-immutability.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0020-hypothesis-revision-own-state.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0021-refuse-altering-a-released-revision.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0023-drop-subject-attributes.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0024-capability-payload-notes.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: migrations/0025-investigation-evidence-capability-payload-notes.sql
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/__tests__/integration/persistence/schema-migrations.spec.ts
  change: unchanged; offered as the proof named in a certification request for its node
- path: src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/__tests__/unit/http/diagnose.routes.spec.ts
  change: unchanged; offered as the proof named in a certification request for its node
- path: src/__tests__/unit/http/error-handler.middleware.spec.ts
  change: unchanged; offered as the proof named in a certification request for its node
- path: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
  change: unchanged; offered as the proof named in a certification request for its node
- path: src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
  change: unchanged; offered as the proof named in a certification request for its node
- path: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  change: unchanged; offered as the proof named in a certification request for its node
- path: src/capability-registry/capability-registry.service.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/capability-registry/evidence-usage-reader.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/case/case-query.service.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/case/case-store.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/case/delete-case.operation.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/case/hypothesis-revision-overwrite.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/case/hypothesis-revision-release-state.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/case/revise-hypothesis.operation.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/connector-registry/connector-configuration-draft-generation.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/connector-registry/connector-configuration-draft.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/connector-registry/connector-configuration-store.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/errors/case-holds-versions.error.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/errors/investigation-not-buildable.error.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/errors/status-map.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/factories/build-app.factory.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/factories/concept-usage-reader.factory.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/factories/investigation-store.factory.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/factories/production-diagnose.factory.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/glossary/concept-usage-reader.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/glossary/glossary-store.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/http-connector/connector-call-descriptor.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/http-connector/connector-request-resolver.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/http/diagnose.routes.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/http/read-capability-by-identity-rate-limit.middleware.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/http/read-capability-by-identity.controller.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/http/read-capability-by-identity.routes.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/http/remove-capability.controller.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/http/remove-concept.controller.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/assessment-consolidator.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/consolidation-register.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/cost.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/durations.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/evidence-result.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/fake-hypothesis-evaluator.adapter.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/fake-observation-source.adapter.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/field-semantics.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/hypothesis-evaluator.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/investigation-factory.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/investigation.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/judgment-stage.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/observation-source.port.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/resolve-and-narrow-input.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/run-diagnosis.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/investigation/subject.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/migrate.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/persistence/migration-runner.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/persistence/relational-case-store.repository.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/persistence/relational-connector-configuration-store.repository.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/seed.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: src/vitest-global-setup.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
- path: vitest.config.ts
  change: unchanged; read to reconcile conformance and, for its bound constraint node(s), certify the
    named test proof
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: "src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts: held at the three `readCase`\
    \ calls at lines 213-215, 244-246 and 398-400, each followed by an assertion that the returned case's\
    \ hypotheses are non-empty (and, in the latter two, that every hypothesis collects at least one concept)\
    \ — const query = createCaseQuery(connection);\n\n  const result = await query.readCase(SLUG, VERSION);\n\
    \n  expect(result.case.slug).toBe(SLUG);\n  expect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);\n\
    src/case/case-query.service.ts: held at readCase, which assembles the whole version through heldVersion,\
    \ validates it whole through structuralCase and refuseIncoherence before returning, and refuses rather\
    \ than returning a partial case; assembledAsRawDocument likewise maps the whole manifest, never a\
    \ subset. — const assembled = await heldVersion(this.caseStore, slug, version);\nconst theCase = structuralCase(assembled,\
    \ slug, version);\nawait this.refuseIncoherence(theCase, version);\nreturn { case: theCase };\n---\n\
    manifest: assembled.manifest.map((entry) => ({\n  position: entry.position,\n  hypothesis_name: entry.hypothesis_revision.hypothesis_name,\n\
    \  revision: entry.hypothesis_revision.revision,\n  criterion: entry.hypothesis_revision.criterion,\n\
    \  collects: entry.hypothesis_revision.collects,\n  resolution: entry.hypothesis_revision.resolution,\n\
    })),\nsrc/case/case-store.port.ts: held at the return type of assembleVersion, which yields either\
    \ a fully populated AssembledCaseVersion — manifest included, each entry's hypothesis_revision resolved\
    \ inline as HypothesisRevisionContent rather than a bare reference — or undefined; and the separate,\
    \ independent method signatures for insertHypothesisRevision, placeHypothesis and removeManifestEntry\
    \ — assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined>; ...\
    \ export type ManifestEntry = {\n  readonly position: number;\n  readonly hypothesis_revision: HypothesisRevisionContent;\n\
    };\nsrc/persistence/relational-case-store.repository.ts: held at assembleVersion (delegating to assembleWholeVersion)\
    \ — the case version row, its manifest and every manifest entry's collects are all read inside one\
    \ transaction and the whole result is returned only if the version row exists, while insertRevision,\
    \ overwriteRevision, insertManifestEntry, deleteManifestEntry, releaseHypothesisRevisionRow and the\
    \ other hypothesis/manifest-entry operations each run their own separate transaction. — public async\
    \ assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined> {\n  \
    \  return runInTransaction(this.connection, raiseReadFailure, (tx) => assembleWholeVersion(tx, { slug,\
    \ version }));\n  }\n\n  async function assembleWholeVersion(tx: IQueryable, key: ICaseVersionKey):\
    \ Promise<AssembledCaseVersion | undefined> {\n    const versionRow = await queryOneOrAbsent<ICaseVersionRow>(tx,\
    \ caseVersionSelect(key), raiseReadFailure);\n    if (versionRow === undefined) {\n      return undefined;\n\
    \    }\n    const manifest = await readManifest(tx, key);\n    return assembledCaseVersionOf(key,\
    \ versionRow, manifest);\n  }\nsrc/seed.ts: held at The call sites in verifySeededCase() and alreadySeeded():\
    \ this file never assembles a case version's attributes, manifest or hypothesis-revisions itself,\
    \ only ever resolving one through case-query's readCase or case-store's assembleVersion, and it authors\
    \ a case's manifest entry by entry via placeFixtureHypotheses/releaseManifestedRevisions before releasing\
    \ the case — matching the constraint's own carve-out for independent creation/revision during authoring.\
    \ — const stored = await createCaseStore(connection).assembleVersion(CASE_SLUG, CASE_VERSION); ...\
    \ await createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);"
  encoded_at:
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/case/case-query.service.ts
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
  - src/seed.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'The first assertion: take a released case version whose manifest has N entries, read
    it through case-query, and check that exactly N hypotheses come back. Each should carry the criterion,
    collects and resolution of the revision its entry references, in the manifest''s order. The second:
    make one referenced revision fail to resolve or fail validation, and check that the read refuses,
    with a CaseVersionNotValidError or no case, rather than returning the other entries. The third: remove
    a draft''s manifest entry, and revise a hypothesis on its own, and check that each succeeds without
    touching the rest of the version.'
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: true
  how: "src/errors/status-map.ts: held at the fallback path of statusForError — the for-loop over STATUS_BY_ERROR_CLASS\
    \ finding no matching class and falling through to the final return, which signals \"unnamed\" to\
    \ whatever turns that signal into the fixed HTTP 500 INTERNAL_ERROR answer; the fixed message text\
    \ and error code themselves are not constructed in this file. — for (const [errorClass, status] of\
    \ STATUS_BY_ERROR_CLASS) {\n    if (error instanceof errorClass) {\n      return status;\n    }\n\
    \  }\n  return undefined;\nsrc/http/remove-capability.controller.ts: held at nowhere in this file\
    \ — the handler awaits the dependency call with no try/catch and no status-shaping logic of its own,\
    \ deferring the fallback entirely to the system-wide handler (bound in the same batch to src/errors/status-map.ts)\
    \ rather than deciding it here, which is what the node's \"stated once for the whole surface\" placement\
    \ calls for. — export async function handleRemoveCapabilityRequest(\n  dependencies: RemoveCapabilityControllerDependencies,\n\
    \  params: RemoveCapabilityParamsDto,\n): Promise<void> {\n  await dependencies.removeCapability(params.name,\
    \ params.version);\n}\nsrc/http/remove-concept.controller.ts: held at nowhere in this file — the node's\
    \ own text places the fallback \"once for the whole surface so no route decides the shape of this\
    \ fallback on its own,\" and this controller carries no branch, catch, or status-code logic of its\
    \ own. — export async function handleRemoveConceptRequest(\n  dependencies: RemoveConceptControllerDependencies,\n\
    \  params: RemoveConceptParamsDto,\n): Promise<void> {\n  await dependencies.removeConcept(params.name);\n\
    }\n"
  encoded_at:
  - src/errors/status-map.ts
  - src/http/remove-capability.controller.ts
  - src/http/remove-concept.controller.ts
  decided_by: test
  step: test-unit
  proof:
  - src/__tests__/unit/http/error-handler.middleware.spec.ts
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  conforms: true
  how: 'src/errors/case-holds-versions.error.ts: held at the template literal passed to `super(...)` in
    the constructor — `o caso "${slug}" ainda possui versão, e só um caso sem nenhuma versão pode ser
    excluído`'
  encoded_at:
  - src/errors/case-holds-versions.error.ts
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  conforms: true
  how: 'src/errors/case-holds-versions.error.ts: held at the template literal passed to `super(...)` in
    the constructor — `o caso "${slug}" ainda possui versão, e só um caso sem nenhuma versão pode ser
    excluído`'
  encoded_at:
  - src/errors/case-holds-versions.error.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: "src/factories/production-diagnose.factory.ts: held at the arrow function returned by createProductionDiagnoseRunner\
    \ (lines 45-48), which calls and returns the runner's own promise directly rather than enqueuing or\
    \ scheduling it — return (call: ProductionDiagnoseCall): Promise<Assessment> => {\n    const now =\
    \ Date.now();\n    return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });\n  };\n\
    src/http/diagnose.routes.ts: held at the return statement of diagnoseHandler, where the assessment\
    \ produced by the awaited controller call is sent directly in the same response — const assessment\
    \ = await handleDiagnoseRequest(dependencies, parsed.data);\n  return reply.code(200).send(assessment);\n\
    src/investigation/run-diagnosis.ts: held at the body of runDiagnosis itself: the pipeline, the investigation\
    \ build and the store write are all awaited in sequence and the assessment is handed back in the same\
    \ call, with no job enqueued and no poll performed. — export async function runDiagnosis(options:\
    \ RunDiagnosisOptions): Promise<Assessment> {\n  const pipelineStartedAtMs = readClockMs();\n  const\
    \ { evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);\n\
    \  const investigation = await buildInvestigation(\n    buildInvestigationOptions({ options, evidence,\
    \ evaluations, assessment, cost, durations }),\n  );\n  const elapsedBeforePersistenceMs = readClockMs()\
    \ - pipelineStartedAtMs;\n  await writeWithinDeadline({\n    store: options.store,\n    investigation,\n\
    \    now: options.now,\n    deadline: options.deadline,\n    elapsedBeforePersistenceMs,\n  });\n\
    \  return investigation.assessment;\n}"
  encoded_at:
  - src/factories/production-diagnose.factory.ts
  - src/http/diagnose.routes.ts
  - src/investigation/run-diagnosis.ts
  decided_by: reading
  remainder: testable
  remainder_why: One input against one result, in a test that exists for this fact. The input is a single
    POST /v1/diagnose through the production-wired diagnose path, with only the model client stubbed to
    resolve. The expected result is that the same response answers 200 and carries the assessment's outcome,
    referral and text, with no job identifier, Location or poll-for-result body, and no further request
    needed to get the assessment.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses's per-hypothesis Promise.all combined\
    \ with the CallPool acquire/release pair inside judgeOneHypothesis — const pool = new CallPool(poolSize);\n\
    ...\nreturn Promise.all(\n    requiredNames.map((name) =>\n      judgeOneHypothesis({\n        name,\n\
    \        hypothesis: hypothesisNamed(theCase, name),\n        evidence: evidenceFor(name, evidenceByHypothesis),\n\
    \        evaluator,\n        pool,\n        deadlineGuard,\n        caseContext,\n      }),\n    ),\n\
    \  );\n...\nif (!(await acquireSlotOrDeadline(pool, deadlineGuard))) {\n  return deadlineExceededEvaluation(name);\n\
    }\ntry {\n  return await runIsolatedCall({ name, hypothesis, evidence, evaluator, deadlineGuard, caseContext\
    \ });\n} finally {\n  pool.release();\n}\nsrc/investigation/run-diagnosis.ts: held at not in this\
    \ file — the per-hypothesis isolated parallel judgment is delegated whole to runInvestigationPipeline;\
    \ this file only awaits its single combined result. — const { evidence, evaluations, assessment, cost,\
    \ durations } = await runInvestigationPipeline(options);"
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
  decided_by: reading
  remainder: testable
  remainder_why: Two assertions would close it. First, run runDiagnosis on two hypotheses with poolSize
    2 and an evaluator whose calls overlap, and expect the most calls in flight at once to be 2 (with
    poolSize 1 it should be 1). Second, supply a configured pool-size value where the running system reads
    it, and expect the diagnose pipeline to judge with exactly that bound, not a value of its own.
- node: constraints/the-capability-identity-read-is-rate-limited
  conforms: true
  how: "src/http/read-capability-by-identity-rate-limit.middleware.ts: held at the returned hook (createReadCapabilityByIdentityRateLimitHook),\
    \ lines 19-32, and refuseOverLimit, lines 43-55 — const sourceIp = request.ip;\n...\nif (window.requestCount\
    \ > RATE_LIMIT_MAX_REQUESTS_PER_WINDOW) {\n  await refuseOverLimit(reply, window, now);\n}\n...\n\
    await reply\n  .header('Retry-After', String(retryAfterSeconds))\n  .code(429)\n  .send({ ... });\n\
    src/http/read-capability-by-identity.routes.ts: held at the `onRequest` hook attached ahead of this\
    \ route's registration, lines 15-18: `app.addHook('onRequest', createReadCapabilityByIdentityRateLimitHook());`\
    \ immediately followed by `app.get(\\`${API_PREFIX}/capabilities/:name/:version\\`, ...)` — this file's\
    \ share of the constraint is binding the rate-limit hook to exactly this route; the hook's own counting,\
    \ the 429 status and the Retry-After value are declared in the sibling `read-capability-by-identity-rate-limit.middleware.ts`,\
    \ outside this file. — app.addHook('onRequest', createReadCapabilityByIdentityRateLimitHook()); app.get(`${API_PREFIX}/capabilities/:name/:version`,\
    \ (request, reply) =>\n  readCapabilityByIdentityHandler(dependencies, request, reply),\n);"
  encoded_at:
  - src/http/read-capability-by-identity-rate-limit.middleware.ts
  - src/http/read-capability-by-identity.routes.ts
  decided_by: test
  step: test-unit
  proof:
  - src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: false
  how: 'the fact left part of its ground: still held in src/capability-registry/capability-registry.service.ts,
    src/errors/status-map.ts, and src/http/read-capability-by-identity.controller.ts read `nowhere` —
    return dependencies.readCapabilityByIdentity(params.name, params.version); — a binding asserts the
    file answers for the node, so the pair that stopped holding it is released by `--bind ... --replace`,
    never restamped here'
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/status-map.ts
  - src/http/read-capability-by-identity.controller.ts
- node: constraints/the-consolidation-prompt-is-closed
  conforms: true
  how: "src/investigation/anthropic-assessment-consolidator.adapter.ts: held at buildSystemPrompt() and\
    \ buildDataBlock(), and the messages.create() call in consolidate() — const data = { evaluations,\
    \ evidence, consolidation_register: consolidationRegister };\nreturn `<${CONSOLIDATION_DATA_TAG}>\\\
    n${JSON.stringify(data)}\\n</${CONSOLIDATION_DATA_TAG}>`;\n\nconst response = await this.client.messages.create({\n\
    \  model: this.model,\n  max_tokens: this.maxTokens,\n  system: buildSystemPrompt(consolidationRegister),\n\
    \  messages: [{ role: 'user', content: prompt }],\n});"
  encoded_at:
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'Two assertions would close it. First, the prompt-assembly function, which the fitness
    says is pure: give it required evaluations, evidence where some items are cited and some are not,
    and a register value. The assembled prompt should equal an expected string. That string holds exactly
    those evaluations, only the cited evidence and the register, inside the delimited data block, with
    nothing else interpolated. Second, the provider adapter: give it a consolidation call and capture
    the outgoing request. The request should carry no tools and no tool-choice grant.'
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: "src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts: held at the two `it` blocks\
    \ asserting the port file's own import specifiers contain none of the forbidden driver/framework names\
    \ and none of the provider client name — const offenders = importSpecifiersOf(source).filter((specifier)\
    \ => namesOneOf(specifier, FORBIDDEN_DRIVERS_AND_FRAMEWORKS));\n\nexpect(offenders).toEqual([]);\n\
    ...\nconst offenders = importSpecifiersOf(source).filter((specifier) => namesOneOf(specifier, [PROVIDER_CLIENT_PACKAGE]));\n\
    \nexpect(offenders).toEqual([]);\nsrc/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts:\
    \ held at the seven `it` blocks auditing the `case`, `glossary`, `capability-registry` and `investigation`\
    \ modules' imports against forbidden drivers/frameworks, the connection module, the LLM provider client\
    \ (with the two adapters that implement a published port excepted), the connector-configuration store,\
    \ HTTP client packages, the connector-request-resolver and its errors (with the epic's own HTTP adapter\
    \ excepted), and the http-declarative-observation-source adapter — it('the case, glossary, capability-registry\
    \ and investigation modules import no driver and no framework', async () => {\n  const imports = await\
    \ domainModuleImports();\n\n  const offenders: string[] = [];\n  for (const [file, specifiers] of\
    \ imports) {\n    for (const specifier of specifiers.filter((s) => namesOneOf(s,\nFORBIDDEN_DRIVERS_AND_FRAMEWORKS)))\
    \ {\n      offenders.push(`${file} imports ${specifier}`);\n    }\n  }\n\n  expect(offenders).toEqual([]);\n\
    });\nsrc/capability-registry/evidence-usage-reader.port.ts: held at the whole file — an interface\
    \ declaration with zero import statements, so nothing framework, driver, or client-shaped reaches\
    \ it — export type CapabilityIdentityForEvidenceUsageCheck = {\n  readonly name: string;\n  readonly\
    \ version: string;\n};\nexport interface IEvidenceUsageReader {\n\n  isCapabilityNamedByEvidence(identity:\
    \ CapabilityIdentityForEvidenceUsageCheck): Promise<boolean>;\n}\nsrc/case/delete-case.operation.ts:\
    \ held at the import statement, line 1 — import type { ICaseStore } from './case-store.port.js';\n\
    src/case/hypothesis-revision-overwrite.port.ts: held at the file's only import and its interface declaration,\
    \ lines 1–6 — import type { OverwriteHypothesisRevisionInput } from './case-store.port.js';\n\nexport\
    \ interface IHypothesisRevisionOverwrite {\n\n  overwriteHypothesisRevision(input: OverwriteHypothesisRevisionInput):\
    \ Promise<void>;\n}\n\nsrc/case/hypothesis-revision-release-state.port.ts: held at the whole file\
    \ — a port interface with only a type-only import from a sibling port, declaring the query's shape\
    \ rather than implementing anything infrastructural — import type { HypothesisRevisionState } from\
    \ './case-store.port.js';\n\nexport interface IHighestRevisionReleaseStateQuery {\n\n\n  readHighestRevisionReleaseState(slug:\
    \ string, hypothesisName: string): Promise<HighestRevisionReleaseState>;\n}\nsrc/case/revise-hypothesis.operation.ts:\
    \ held at the file's import list, lines 1-13 — import { CaseHoldsNoDraftError } from '../errors/case-holds-no-draft.error.js';\
    \ import { ConceptNotInGlossaryError } from '../errors/concept-not-in-glossary.error.js'; import {\
    \ ConceptRefusesSubjectTypeError } from '../errors/concept-refuses-subject-type.error.js'; import\
    \ { HypothesisRevisionCollectsNoConceptError } from '../errors/hypothesis-revision-collects-no-concept.error.js';\
    \ import type { ConceptResolution, IGlossaryQuery } from '../glossary/glossary-query.port.js'; import\
    \ type {\n  DraftVersion,\n  HypothesisRevisionInput,\n  ICaseStore,\n  OverwriteHypothesisRevisionInput,\n\
    } from './case-store.port.js'; import type { IHypothesisRevisionOverwrite } from './hypothesis-revision-overwrite.port.js';\
    \ import type { IHighestRevisionReleaseStateQuery } from './hypothesis-revision-release-state.port.js';\
    \ — every import is a domain error or a port/type; none names a framework, a driver or a provider\
    \ client.\nsrc/connector-registry/connector-configuration-draft-generation.ts: held at the module's\
    \ own import list, lines 1-28, and the option type `GenerateConnectorConfigurationDraftOptions` (lines\
    \ 37-45) — import { generateCredentialPlaceholders, parameterDisplacedByCredential } from './generated-credential-placeholders.js';\
    \ ... import type { IOpenApiDocumentFetcher } from './openapi-document-fetcher.port.js'; import type\
    \ { ICapabilitiesReader } from './capabilities-reader.port.js'; ... readonly documentFetcher: IOpenApiDocumentFetcher;\
    \ readonly capabilitiesReader: ICapabilitiesReader; readonly registry: RegisteredConnectorConfigurationReader;\n\
    src/connector-registry/connector-configuration-draft.ts: held at the whole file — it declares only\
    \ literal constants and structural types, and carries no import statement of any kind. — export const\
    \ CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS = [\n  'no-capability-registered',\n  'security-scheme-not-reducible-to-a-credential',\n\
    \  'drafted-key-occupied-by-another-security-scheme',\n] as const;\nsrc/connector-registry/connector-configuration-registry.service.ts:\
    \ held at the constructor's dependency list and every read/write path, which reach infrastructure\
    \ only through IConnectorConfigurationStore and ICapabilitiesReader — public constructor(\n    private\
    \ readonly store: IConnectorConfigurationStore,\n    private readonly capabilitiesReader: ICapabilitiesReader\
    \ = NO_REGISTERED_CAPABILITIES,\n  ) {}\nsrc/connector-registry/connector-configuration-store.port.ts:\
    \ held at the file's only import and the interface it declares, lines 1-3 — import type { ConnectorConfiguration\
    \ } from './connector-configuration.js';\nexport interface IConnectorConfigurationStore {\nsrc/errors/case-holds-versions.error.ts:\
    \ held at the whole file — it declares only a class extending the native `Error`, with no import statement\
    \ — export class CaseHoldsVersionsError extends Error {\nsrc/errors/investigation-not-buildable.error.ts:\
    \ held at the whole file — the module declares no import at all and extends only the native `Error`,\
    \ so this error carries no framework, driver or provider client into the domain — export class InvestigationNotBuildableError\
    \ extends Error {\n  public readonly context: Readonly<{ slug: string; violations: readonly string[]\
    \ }>;\n\n  public constructor(slug: string, violations: readonly string[]) {\n    super(`the investigation\
    \ for case \"${slug}\" cannot be built: ${violations.join('; ')}`);\n    this.name = 'InvestigationNotBuildableError';\n\
    \    this.context = { slug, violations };\n  }\n}\nsrc/factories/build-app.factory.ts: held at the\
    \ ComposedResources type (lines 48-70) and composeResources (lines 72-101), which type every domain-facing\
    \ dependency as a port — ICaseQuery, ICaseInputRequirementsQuery, ICaseStore, ICapabilityQuery, IGlossaryQuery,\
    \ ICapabilitiesReader, IEvidenceUsageReader, IConceptUsageReader — while concrete infrastructure (DatabaseConnection,\
    \ OpenApiDocumentFetcher) is constructed only inside this factory, never exposed past the port-typed\
    \ fields — readonly caseQuery: ICaseQuery; readonly caseInputRequirementsQuery: ICaseInputRequirementsQuery;\
    \ readonly caseStore: ICaseStore; readonly capabilityQuery: ICapabilityQuery;\nsrc/factories/concept-usage-reader.factory.ts:\
    \ held at createConceptUsageReader, lines 13-23 — the one place in this file that imports and instantiates\
    \ the concrete infrastructure and hands back only the port — import { RelationalCaseStore } from '../persistence/relational-case-store.repository.js';\
    \ import { RelationalInvestigationStore } from '../persistence/relational-investigation-store.repository.js';\
    \ ... const sources: ConceptUsageSources = {\n  capabilityQuery,\n  investigationStore: new RelationalInvestigationStore(connection),\n\
    \  caseStore: new RelationalCaseStore(connection),\n}; return { readConceptUsage: (concept) => resolveConceptUsage(concept,\
    \ sources) };\nsrc/factories/investigation-store.factory.ts: held at the return statements of createInvestigationStore\
    \ and createEvidenceUsageReader, lines 6-8 and 10-15, where the concrete persistence adapter and its\
    \ driver-backed connection are instantiated and handed back typed only as the domain's ports — export\
    \ function createInvestigationStore(connection: DatabaseConnection): IInvestigationStore {\n  return\
    \ new RelationalInvestigationStore(connection);\n}\n\nexport function createEvidenceUsageReader(connection:\
    \ DatabaseConnection): IEvidenceUsageReader {\n  const store = new RelationalInvestigationStore(connection);\n\
    \  return {\n    isCapabilityNamedByEvidence: (identity) => store.isCapabilityNamedByEvidence(identity.name,\
    \ identity.version),\n  };\n}\nsrc/glossary/concept-usage-reader.port.ts: held at the whole file —\
    \ a pure type-and-interface declaration with no import statement at all — export interface IConceptUsageReader\
    \ {\n\n  readConceptUsage(concept: string): Promise<ConceptUsageResolution>;\n}\nsrc/glossary/glossary-store.port.ts:\
    \ held at the whole file — a pure interface with only a type-only import, declaring the port through\
    \ which infrastructure is meant to reach the glossary domain — import type { Concept, ConceptRegistration,\
    \ GlossaryTerm, TermVocabulary } from './terms.js';\n\nexport interface IGlossaryStore {\nsrc/http-connector/connector-call-descriptor.ts:\
    \ held at the whole file — two exported type aliases with no import statement at all, so the domain-side\
    \ descriptor of an HTTP connector call carries no framework, driver or provider client reference —\
    \ export type ConnectorCallDescriptor = {\n  readonly address: string;\n  readonly query?: Readonly<Record<string,\
    \ string>>;\n  readonly headers?: Readonly<Record<string, string>>;\n  readonly body?: unknown;\n\
    };\n\nexport type AssembledConnectorRequest = {\n  readonly address: string;\n  readonly query: Readonly<Record<string,\
    \ string>>;\n  readonly headers: Readonly<Record<string, string>>;\n  readonly body?: unknown;\n};\n\
    src/http-connector/connector-request-resolver.ts: held at the module's own import list, lines 1-4\
    \ — only domain-side types and this module's own error/type siblings are imported, and the connector\
    \ adapter depends on the domain (`Subject`) rather than the reverse — import type { Subject } from\
    \ '../investigation/subject.js'; import type { AssembledConnectorRequest, ConnectorCallDescriptor\
    \ } from './connector-call-descriptor.js';\nsrc/investigation/anthropic-assessment-consolidator.adapter.ts:\
    \ held at the file's own imports and class shape — the concrete `Anthropic` client is declared and\
    \ used only in this adapter, behind the type-only import of `IAssessmentConsolidator` — import Anthropic\
    \ from '@anthropic-ai/sdk';\n\nimport type { ConsolidationOutcome, IAssessmentConsolidator } from\
    \ './assessment-consolidator.port.js';\n...\nexport class AnthropicAssessmentConsolidator implements\
    \ IAssessmentConsolidator {\n  private readonly client: Anthropic;\nsrc/investigation/assessment-consolidator.port.ts:\
    \ held at the file's own import list, lines 1-4, and the absence of any other import in the file —\
    \ import type { ConsolidationRegister } from './consolidation-register.js'; import type { Evaluation\
    \ } from './evaluation.js'; import type { Evidence } from './evidence.js'; import type { Usage } from\
    \ './usage.js';\nsrc/investigation/consolidation-register.ts: held at the whole file — a bare vocabulary\
    \ declaration with no import statement at all — export const CONSOLIDATION_REGISTERS = ['formal',\
    \ 'plain'] as const;\n\nexport type ConsolidationRegister = (typeof CONSOLIDATION_REGISTERS)[number];\n\
    \nsrc/investigation/cost.ts: held at the type declaration itself, which carries no import statement\
    \ of any kind — export type Cost = {\n  readonly calls: number;\n  readonly input_tokens: number;\n\
    \  readonly output_tokens: number;\n};\nsrc/investigation/durations.ts: held at the whole file — it\
    \ carries no import statement at all, so nothing framework-, driver- or provider-specific reaches\
    \ the durations type. — export type Durations = {\n  readonly collection: number;\n  readonly judgment:\
    \ number;\n  readonly writing?: number;\n  readonly total: number;\n};\nsrc/investigation/evidence-result.ts:\
    \ held at the whole file — it declares only a const array and a type alias, with no import statement\
    \ anywhere in it — export const EVIDENCE_RESULTS = ['ok', 'unavailable', 'denied', 'timeout'] as const;\n\
    \nexport type EvidenceResult = (typeof EVIDENCE_RESULTS)[number];\nsrc/investigation/fake-assessment-consolidator.adapter.ts:\
    \ held at the import list at the top of the file, all of which are local type-only imports — import\
    \ type { ConsolidationOutcome, IAssessmentConsolidator } from './assessment-consolidator.port.js';\
    \ import type { ConsolidationRegister } from './consolidation-register.js'; import type { Evaluation\
    \ } from './evaluation.js'; import type { Evidence } from './evidence.js'; import type { Usage } from\
    \ './usage.js';\nsrc/investigation/fake-hypothesis-evaluator.adapter.ts: held at the import statements\
    \ at the top of the file, lines 1-7 — both imports are type-only, from the local port module and the\
    \ local value-object module, with no framework, driver or provider client — import type {\n  CaseContext,\n\
    \  EvaluationOutcome,\n  EvidenceItem,\n  IHypothesisEvaluator,\n} from './hypothesis-evaluator.port.js';\n\
    import type { Usage } from './usage.js';\nsrc/investigation/fake-observation-source.adapter.ts: held\
    \ at the file's only import statement, line 1 — a type-only import from the sibling port file, with\
    \ no framework, driver or client import anywhere else in the file — import type { IObservationSource,\
    \ ObservationOutcome, ObserveConceptOptions, Subject } from './observation-source.port.js';\nsrc/investigation/field-semantics.ts:\
    \ held at the file's own import list — the only import the file declares is from a sibling domain\
    \ module, and nothing under `properties`/`items` walking touches a driver, framework or provider client\
    \ — import { isPlainObject, parseJsonOrUndefined } from './citation-validation.js';\nsrc/investigation/http-declarative-observation-source.adapter.ts:\
    \ held at the class declaration and its constructor, which confine the fetch-based HTTP dependency\
    \ to this adapter, reached only through the IObservationSource port the class implements — export\
    \ class HttpDeclarativeObservationSource implements IObservationSource {\n  private readonly capabilities:\
    \ ICapabilityQuery;\n  private readonly connectorConfigurations: IConnectorConfigurationQuery;\n \
    \ private readonly httpClient: typeof fetch;\nsrc/investigation/investigation-factory.ts: held at\
    \ the file's own import list — every import is a local domain module (case-resolution, case, the investigation-not-buildable\
    \ error, and the investigation/subject/evidence/ evaluation/assessment/cost/durations types), none\
    \ a framework, driver or provider client. — import { collectionPlan, requiresEvaluationOf } from '../case/case-resolution.js';\n\
    import type { Case } from '../case/case.js';\nimport { InvestigationNotBuildableError } from '../errors/investigation-not-buildable.error.js';\n\
    import type { Assessment } from './assessment.js';\nimport type { Cost } from './cost.js';\nimport\
    \ type { Durations } from './durations.js';\nimport type { Evaluation } from './evaluation.js';\n\
    import type { Evidence } from './evidence.js';\nimport type { Investigation, PinnedCase } from './investigation.js';\n\
    import { buildSubject } from './subject.js';\nimport type { SubjectAttributeValue } from './subject-attribute-value.js';\n\
    src/investigation/investigation.ts: held at the file's only imports, all type-only and all from sibling\
    \ domain modules — import type { Assessment } from './assessment.js';\nimport type { Cost } from './cost.js';\n\
    import type { Durations } from './durations.js';\nimport type { Evaluation } from './evaluation.js';\n\
    import type { Evidence } from './evidence.js';\nimport type { Subject } from './subject.js';\nsrc/investigation/observation-source.port.ts:\
    \ held at the file's own import statements, which pull in only local domain types and declare a port\
    \ interface with no framework, driver or provider client reference — import type { EvidenceResult\
    \ } from './evidence-result.js';\nimport type { Subject } from './subject.js';\nsrc/investigation/resolve-and-narrow-input.ts:\
    \ held at the file's own import statements, lines 1-6 — import { requiresEvaluationOf, resolveOutcome,\
    \ type ResolvedOutcome, type Verdicts } from '../case/case-resolution.js';\nimport type { Case } from\
    \ '../case/case.js';\nimport type { Citation } from './citation.js';\nimport type { Evaluation } from\
    \ './evaluation.js';\nimport type { Evidence } from './evidence.js';\nimport type { Verdict } from\
    \ './verdict.js';\nsrc/investigation/subject.ts: held at the whole file — its only imports are the\
    \ domain's own error type and the domain's own attribute-value type, no framework, driver or provider\
    \ client — import { SubjectCarriesNoAttributeError } from '../errors/subject-carries-no-attribute.error.js';\
    \ import type { SubjectAttributeValue } from './subject-attribute-value.js';\nsrc/persistence/relational-connector-configuration-store.repository.ts:\
    \ held at the class declaration `export class RelationalConnectorConfigurationStore implements IConnectorConfigurationStore`\
    \ (line 14), which keeps every database-specific import — `runInTransaction`, `runStatement`, `IStatement`,\
    \ `DatabaseConnection` — confined to this adapter behind the port, so nothing importing `IConnectorConfigurationStore`\
    \ or `ConnectorConfiguration` (the domain-facing types this file also imports) is made to carry a\
    \ driver. — import { runInTransaction, runStatement, type IStatement } from './database-access.js';\
    \ import type { DatabaseConnection } from './database-connection.js'; ... export class RelationalConnectorConfigurationStore\
    \ implements IConnectorConfigurationStore {\n  public constructor(private readonly connection: DatabaseConnection)\
    \ {}"
  encoded_at:
  - src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts
  - src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  - src/capability-registry/evidence-usage-reader.port.ts
  - src/case/delete-case.operation.ts
  - src/case/hypothesis-revision-overwrite.port.ts
  - src/case/hypothesis-revision-release-state.port.ts
  - src/case/revise-hypothesis.operation.ts
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/connector-registry/connector-configuration-draft.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/connector-registry/connector-configuration-store.port.ts
  - src/errors/case-holds-versions.error.ts
  - src/errors/investigation-not-buildable.error.ts
  - src/factories/build-app.factory.ts
  - src/factories/concept-usage-reader.factory.ts
  - src/factories/investigation-store.factory.ts
  - src/glossary/concept-usage-reader.port.ts
  - src/glossary/glossary-store.port.ts
  - src/http-connector/connector-call-descriptor.ts
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/consolidation-register.ts
  - src/investigation/cost.ts
  - src/investigation/durations.ts
  - src/investigation/evidence-result.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
  - src/investigation/fake-observation-source.adapter.ts
  - src/investigation/field-semantics.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/observation-source.port.ts
  - src/investigation/resolve-and-narrow-input.ts
  - src/investigation/subject.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'The remainder is closed by a finite audit over the domain modules'' imports. Walk every
    .ts file under each directory that holds case behavior, the investigation factory, evaluation and
    vocabulary, recursively. Assert two things. First, every bare specifier is either a node: built-in
    or on a declared allowlist of packages that are not infrastructure; a deny list cannot close this.
    Second, every relative specifier resolves either inside those directories or to a *.port module. Adapters
    placed beside the domain should be identified by a declared marker rather than a file-name list. With
    those assertions, adding a framework, driver or provider client import to any domain module, or a
    direct import of any non-port infrastructure module, makes the test fail.'
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: "src/investigation/anthropic-hypothesis-evaluator.adapter.ts: held at buildUserPrompt() (assembling\
    \ the <judgment_input> block from only the criterion, the evidence block, a freshly-computed current_instant,\
    \ and the pinned case's title/when_to_use) together with requestJudgment()'s call to the Anthropic\
    \ API, which passes no tools parameter — return [\n    '<judgment_input>',\n    '<criterion>',\n \
    \   escapeForXmlText(criterion),\n    '</criterion>',\n    '<evidence>',\n    evidenceBlock(evidence),\n\
    \    '</evidence>',\n    `<current_instant>${escapeForXmlText(currentInstant)}</current_instant>`,\n\
    \    '<case_title>',\n    escapeForXmlText(caseContext.title),\n    '</case_title>',\n    '<case_when_to_use>',\n\
    \    escapeForXmlText(caseContext.whenToUse),\n    '</case_when_to_use>',\n    '</judgment_input>',\n\
    \  ].join('\\n');\n...\nreturn await this.client.messages.create({\n        model: this.model,\n \
    \       max_tokens: this.maxTokens,\n        system: SYSTEM_PROMPT,\n        messages: [{ role: 'user',\
    \ content: prompt }],\n      });\nsrc/investigation/hypothesis-evaluator.port.ts: held at the `EvidenceItem`,\
    \ `CaseContext` types and the `evaluate` signature, which together fix what a judgment prompt may\
    \ be assembled from: one criterion, evidence items carrying only their own snapshotted semantics,\
    \ and the pinned case's title/whenToUse — with no parameter admitting a live glossary or capability-registry\
    \ handle — export type EvidenceItem = {\n  readonly concept: string;\n  readonly fields: readonly\
    \ FieldSemantics[];\n  readonly concept_description: string;\n  readonly capability_payload_notes:\
    \ string;\n  readonly observed_at: string;\n  readonly ttl: number;\n} & ObservationOutcome;\n...\n\
    export type CaseContext = {\n  readonly title: string;\n  readonly whenToUse: string;\n};\n\nexport\
    \ interface IHypothesisEvaluator {\n\n  evaluate(\n    criterion: string,\n    evidence: readonly\
    \ EvidenceItem[],\n    caseContext: CaseContext,\n  ): Promise<EvaluationOutcome>;\n}\nsrc/investigation/judgment-stage.ts:\
    \ held at the arguments runIsolatedCall and retryOrFail pass to evaluator.evaluate — hypothesis.criterion,\
    \ evidenceItems built by toEvidenceItems, and caseContext alone — const caseContext: CaseContext =\
    \ { title: theCase.title, whenToUse: theCase.when_to_use };\n...\nconst evidenceItems = toEvidenceItems(evidence);\n\
    const first = await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion, evidenceItems,\
    \ caseContext), deadlineGuard);\n...\nfunction toEvidenceItems(evidence: readonly Evidence[]): readonly\
    \ EvidenceItem[] {\n  return evidence.map((item): EvidenceItem => ({\n    concept: item.concept,\n\
    \    result: 'ok',\n    observation: item.observation,\n    fields: item.fields,\n    concept_description:\
    \ item.concept_description,\n    capability_payload_notes: item.capability_payload_notes,\n    observed_at:\
    \ item.observed_at,\n    ttl: item.ttl,\n  }));\n}"
  encoded_at:
  - src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/investigation/hypothesis-evaluator.port.ts
  - src/investigation/judgment-stage.ts
  decided_by: reading
  remainder: testable
  remainder_why: Call the real evaluator adapter with one criterion, evidence items whose snapshotted
    fields (with type and description), concept meaning, observed_at and ttl are set, a case context,
    and a fixed clock. Check four results. First, the assembled prompt holds exactly those contents inside
    the delimited data block, plus the fixed clock's instant as a UTC ISO string, and no sibling criterion
    or subject attribute. Second, the provider request carries no tools. Third, two separate judgment
    requests with the clock advanced between them show two different instants. Fourth, with glossary and
    capability-registry doubles that throw on any read, assembly still completes.
- node: constraints/the-schema-replays-from-its-scripts
  conforms: false
  how: 'the fact left part of its ground: still held in migrations/0001-schema-migrations.sql, migrations/0002-glossary-vocabulary.sql,
    migrations/0003-capability-registry.sql, migrations/0004-case-and-hypothesis.sql, migrations/0005-investigation.sql,
    migrations/0006-case-version-immutability.sql, migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql,
    migrations/0020-hypothesis-revision-own-state.sql, migrations/0021-refuse-altering-a-released-revision.sql,
    migrations/0023-drop-subject-attributes.sql, migrations/0024-capability-payload-notes.sql, migrations/0025-investigation-evidence-capability-payload-notes.sql,
    src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts, src/migrate.ts, src/persistence/migration-runner.ts,
    src/vitest-global-setup.ts, and vitest.config.ts read `nowhere` — globalSetup: [''./src/vitest-global-setup.ts''],

    fileParallelism: false,

    testTimeout: 120000, — a binding asserts the file answers for the node, so the pair that stopped holding
    it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - migrations/0001-schema-migrations.sql
  - migrations/0002-glossary-vocabulary.sql
  - migrations/0003-capability-registry.sql
  - migrations/0004-case-and-hypothesis.sql
  - migrations/0005-investigation.sql
  - migrations/0006-case-version-immutability.sql
  - migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  - migrations/0020-hypothesis-revision-own-state.sql
  - migrations/0021-refuse-altering-a-released-revision.sql
  - migrations/0023-drop-subject-attributes.sql
  - migrations/0024-capability-payload-notes.sql
  - migrations/0025-investigation-evidence-capability-payload-notes.sql
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  - src/migrate.ts
  - src/persistence/migration-runner.ts
  - src/vitest-global-setup.ts
  - vitest.config.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: 'src/http/read-capability-by-identity.controller.ts: held at the dependency type and the function
    body — readCapabilityByIdentity(name, version) is invoked with the request''s name and version, matching
    the read-capability-by-identity operation the contract lists — readonly readCapabilityByIdentity:
    (name: string, version: string) => Promise<Capability>; ... return dependencies.readCapabilityByIdentity(params.name,
    params.version);'
  encoded_at:
  - src/http/read-capability-by-identity.controller.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries covering this contract''s own domain errors
    — the unregistered-name read refusal and the malformed/incomplete registration refusals — each paired
    with the status the specification''s other rules give them; the contract itself names only the operations,
    no status. — [ConnectorConfigurationNotFoundError, 404],

    ...

    [ConnectorConfigurationNotWellFormedError, 422],

    [IncompleteConnectorConfigurationError, 422],

    src/factories/build-app.factory.ts: held at registrationDependencies (line 150), removeConnectorDependencies
    (line 156), readDependencies (line 113) and listDependencies (line 127), each wiring one of the contract''s
    four operations to the composed connectorConfigurationRegistry — registerConnector: { registerConnector:
    resources.registerConnector }, removeConnector: { removeConnector: resources.removeConnector }, readConnectorConfiguration:
    { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow }, listConnectorConfigurations:
    { listConnectorConfigurations: resources.listConnectorConfigurations, ...pagination },'
  encoded_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
- node: contracts/investigation/case-source
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at not in this file — the case is neither read nor pinned
    here; it is forwarded unchanged from the caller''s options into the investigation build, so the pinning
    this contract requires is whatever happened before runDiagnosis was called. — case: options.case,'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries covering diagnose''s own refusals — an unreleased
    pinned version, a subject missing a required attribute, and the write deadline — each paired with
    its status; the contract itself names only the diagnose operation, no status. — [CaseVersionNotReleasedError,
    409],

    ...

    [SubjectDoesNotCoverCaseInputsError, 422],

    [SubjectCarriesNoAttributeError, 422],

    ...

    [InvestigationWriteDeadlineExceededError, 500],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/system/case-authoring
  conforms: true
  how: "src/case/case-query.service.ts: held at readCaseVersion/attributesOf, which lets a draft's own\
    \ attributes be read independent of full validity (supporting free composition before release), and\
    \ refuseViolations, which collects every coherence violation before refusing so a release-time or\
    \ read-time refusal reports them together. — public async readCaseVersion(slug: string, version: number):\
    \ Promise<ReadCaseVersionResult> {\n  const assembled = await heldVersion(this.caseStore, slug, version);\n\
    \  return { version: attributesOf(assembled) };\n}\n---\nfunction refuseViolations(slug: string, version:\
    \ number, violations: readonly string[]): void {\n  if (violations.length > 0) {\n    throw new CaseVersionNotValidError(slug,\
    \ version, violations);\n  }\n}"
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/glossary/concept
  conforms: false
  how: "migrations/0002-glossary-vocabulary.sql, the header comment, lines 13-15, and the `concepts` table\
    \ it describes, lines 42-46: -- Every one of these elements declares only \"name\" (plus, for concept,\
    \ \"accepts\" and\n-- \"ttl\") as required, so every column below is required\n-- (constraints/the-stored-schema-mirrors-the-declared-model).\n\
    ...\nCREATE TABLE concepts (\n  name TEXT NOT NULL,\n  ttl  INTEGER NOT NULL,\n  CONSTRAINT concepts_pkey\
    \ PRIMARY KEY (name)\n); — `domain/glossary/concept` declares a fourth required attribute, `description`\
    \ (string, required) — \"its description states what the named observation means, which is exactly\
    \ what a published language owes the speakers who read it\" — and no column of `concepts` holds it.\
    \ The comment's own recitation of what concept \"declares... as required\" omits description and then\
    \ uses that incomplete recitation to claim every column below is required, i.e. that nothing is missing;\
    \ a required attribute the specification states is left with nowhere to be recorded, which is invisible\
    \ from the schema alone."
  observed_at:
  - src/glossary/glossary-store.port.ts
- node: domain/integration/capability
  conforms: false
  how: 'migrations/0003-capability-registry.sql, header comment, lines 1-2: -- domain/integration/capability:
    one registered read-only observation the

    -- system can perform, identified by name and version — This copies domain/integration/capability''s
    own Description ("One registered read-only observation the system can perform, identified by name
    and version") into a migration comment. Migration scripts already applied are never edited in this
    project (0007 and 0024 both state the convention explicitly), so if the node''s wording is later revised,
    this comment cannot follow it — a reader of the migration is left holding a copy of the specification
    that has silently drifted from the node it was copied from.

    migrations/0003-capability-registry.sql, header comment, lines 6-7: -- Every attribute of capability
    is required, so every column below is

    -- NOT NULL (constraints/the-stored-schema-mirrors-the-declared-model). — domain/integration/capability.md''s
    own attribute list marks `payload_notes` as `required: false` — one attribute of the aggregate is
    explicitly optional. A reader of this migration who takes the comment at face value concludes capability
    has no optional attribute at all, which the node currently governing capability''s attributes denies.'
  observed_at:
  - migrations/0024-capability-payload-notes.sql
  - src/capability-registry/evidence-usage-reader.port.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: "src/connector-registry/connector-configuration-store.port.ts: held at the three port methods declared\
    \ on IConnectorConfigurationStore, lines 5-9 — readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]>;\n\
    \n  writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void>;\n\
    \n  deleteConnectorConfiguration(connector: string): Promise<void>;\nsrc/factories/build-app.factory.ts:\
    \ held at composeResources' construction of the registry and its plain delegating methods, lines 75\
    \ and 90-94 — const connectorConfigurationRegistry = createConnectorConfigurationRegistry(connection,\
    \ capabilitiesReader); registerConnector: (registration) => connectorConfigurationRegistry.registerConnector(registration),\
    \ removeConnector: (connector) => connectorConfigurationRegistry.removeConnector(connector),"
  encoded_at:
  - src/connector-registry/connector-configuration-store.port.ts
  - src/factories/build-app.factory.ts
- node: domain/investigation/citation
  conforms: true
  how: "src/factories/concept-usage-reader.factory.ts: held at the citation branch of resolveConceptUsage,\
    \ line 33-35 — the node's required `concept` attribute is what this branch queries by; the node's\
    \ `field` attribute is never touched here — if (await sources.investigationStore.isConceptNamedByCitation(concept))\
    \ {\n  return { named: true, reference: 'citation' };\n}"
  encoded_at:
  - src/factories/concept-usage-reader.factory.ts
- node: domain/investigation/cost
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at the cost value forwarded unchanged from the pipeline''s
    result into buildInvestigationOptions, typed as the value object and passed through without recomputation.
    — readonly cost: Cost;

    ...

    cost,'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/durations
  conforms: true
  how: "src/investigation/run-diagnosis.ts: held at the durations value forwarded from the pipeline into\
    \ buildInvestigation before persistence is ever entered — buildInvestigation (which receives durations)\
    \ runs and completes before writeWithinDeadline is called, so total is already fixed when the investigation\
    \ record is assembled and before persistence reads or stores it. — const investigation = await buildInvestigation(\n\
    \  buildInvestigationOptions({ options, evidence, evaluations, assessment, cost, durations }),\n);\n\
    const elapsedBeforePersistenceMs = readClockMs() - pipelineStartedAtMs;\nawait writeWithinDeadline({"
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/evaluation
  conforms: false
  how: 'src/investigation/fake-hypothesis-evaluator.adapter.ts, the return statement of evaluate(), line
    29: return { ...outcome, usage: ZEROED_USAGE, elapsed_ms: ZEROED_ELAPSED_MS }; — A test that seeds
    an inconclusive outcome with reason `no-data` — meaning judgment was never called for that hypothesis
    at all — gets back usage and elapsed_ms populated (zeroed) from this adapter regardless of that reason,
    because the override is unconditional. Any assertion or downstream code that relies on "usage/elapsed_ms
    present only when a call actually happened" can no longer distinguish a genuine zero-cost call from
    a call that, by its own seeded reason, never ran — the shape the specification calls invalid becomes
    the one every no-data fixture run through this fake actually produces.'
  observed_at:
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
- node: domain/investigation/evidence
  conforms: true
  how: "migrations/0025-investigation-evidence-capability-payload-notes.sql: held at the ADD COLUMN statement,\
    \ line 46 — ALTER TABLE investigation_evidence\n  ADD COLUMN capability_payload_notes TEXT NOT NULL\
    \ DEFAULT '';"
  encoded_at:
  - migrations/0025-investigation-evidence-capability-payload-notes.sql
- node: domain/investigation/subject-attribute-value
  conforms: false
  how: "migrations/0002-glossary-vocabulary.sql, the header comment, line 7 (`domain/glossary/subject-attribute\
    \ -- subject_attributes`), naming what the `subject_attributes` table (lines 22-25) implements: --\
    \   domain/glossary/subject-attribute -- subject_attributes\n...\nCREATE TABLE subject_attributes\
    \ (\n  name TEXT NOT NULL,\n  CONSTRAINT subject_attributes_pkey PRIMARY KEY (name)\n); — A reader\
    \ tracing `subject_attributes` back to the specification to learn what governs it finds no `domain/glossary/subject-attribute`\
    \ node anywhere in the tree — the vocabulary was retired (`domain/glossary/_context.md` now names\
    \ only four vocabularies — subject types, outcomes, actions, recipients — and `domain/investigation/subject-attribute-value.md`\
    \ states the attribute's name \"is free text rather than a governed vocabulary term\"). The citation\
    \ points at a retired identity and gives the reader no path to the migration that already drops this\
    \ table, so the file reads as still governed by a rule the business undid."
  observed_at:
  - migrations/0023-drop-subject-attributes.sql
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "migrations/0020-hypothesis-revision-own-state.sql: held at the ADD COLUMN state statement, paired\
    \ with the CHECK constraint restricting it to exactly the values domain/knowledge/hypothesis-revision-state\
    \ declares — ALTER TABLE hypothesis_revisions\n  ADD COLUMN state TEXT NOT NULL DEFAULT 'draft';\n\
    \nALTER TABLE hypothesis_revisions\n  ADD CONSTRAINT hypothesis_revisions_state_check CHECK (state\
    \ IN ('draft', 'released'));\nmigrations/0021-refuse-altering-a-released-revision.sql: held at the\
    \ trigger function's own guard, which reads only the row's OLD.state and consults no case-version\
    \ or manifest relation before refusing — IF OLD.state = 'released' THEN\n  RAISE EXCEPTION 'ReleasedHypothesisRevisionNotAlterableError';\n\
    END IF;"
  encoded_at:
  - migrations/0020-hypothesis-revision-own-state.sql
  - migrations/0021-refuse-altering-a-released-revision.sql
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: false
  how: "src/glossary/concept-usage-reader.port.ts, line 1, the ConceptUsageReference type declaration:\
    \ export type ConceptUsageReference = 'capability' | 'evidence' | 'citation' | 'hypothesis-revision-collects';\
    \ — The four reference values this type fixes are the exact vocabulary rules/glossary/a-registered-concept-is-never-removed\
    \ already decided for what a ConceptInUseError reports — \"capability where a registered capability\
    \ answers it, evidence where a collected evidence item names it, citation where a citation names it,\
    \ and hypothesis-revision-collects where a hypothesis-revision's own collects lists it\" — re-enumerated\
    \ here as a second, independent literal union. If the node's vocabulary is ever extended or a value\
    \ renamed, nothing ties this type back to that text; a reader who finds the two disagreeing has no\
    \ way to tell which was decided, because this file reads as its own authority for the values rather\
    \ than as a projection of the node.\nsrc/seed.ts, seedConcepts(), lines 74-84: await connection.query(\n\
    \      `INSERT INTO concepts (name, ttl, description) VALUES ($1, $2, $3)\n       ON CONFLICT (name)\
    \ DO UPDATE SET description = EXCLUDED.description`,\n      [concept.name, concept.ttl, concept.description],\n\
    \    );\n    for (const subjectType of concept.accepts) {\n      await connection.query(\n       \
    \ 'INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',\n\
    \        [concept.name, subjectType],\n      );\n    } — Re-seeding a fixture whose concept name already\
    \ exists in the store leaves that concept's ttl untouched (only description is written on conflict)\
    \ and only adds new subject types to its accepts (existing ones already recorded are never dropped,\
    \ via ON CONFLICT DO NOTHING), so a concept fixture edited to change a ttl or to narrow which subject\
    \ types it accepts silently fails to take effect on a store that already holds that name — the JSON\
    \ on disk and the row a diagnosis actually reads can disagree, and nothing here signals it."
  observed_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/glossary/glossary-store.port.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing ConnectorConfigurationNotFoundError with
    404 — [ConnectorConfigurationNotFoundError, 404],

    src/factories/build-app.factory.ts: held at readDependencies (line 113), which wires the readConnectorConfiguration
    controller dependency to the throwing form of the read rather than the resolution-returning one —
    readConnectorConfiguration: { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow
    },'
  encoded_at:
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: false
  how: 'src/connector-registry/connector-configuration-registry.service.ts, orphanedAcrossEveryCapability,
    line 101 — the intersection filter over perCapabilityOrphaned: const orphanedEverywhere = [...first].filter((placeholder)
    => rest.every((set) => set.has(placeholder))); — When a connector has more than one capability registered
    against it and only some of those capabilities'' input schemas declare a placeholder''s Subject attribute,
    this intersection clears the placeholder as soon as any one capability declares it. registerConnector
    then accepts a configuration that rules/integration/a-connector-placeholder-is-declared-by-its-capability''s
    own per-capability check would refuse, so the gap the placeholder-declaration guard exists to close
    at registration time stays open for any connector serving more than one capability — the failure surfaces
    only later, at observation, where an operator has no reason left to look for it.'
  observed_at:
  - src/http-connector/connector-request-resolver.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entries pairing OpenApiDocumentNotFetchedError and OpenApiDocumentNotReadableError
    with 422 — the two error values this rule''s own refusal (and its sibling draft-refusal-distinguishing
    rule, outside this set) is answered under; this node''s own statement names no HTTP status itself.
    — [OpenApiDocumentNotFetchedError, 422],

    [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at the same two entries, reused, plus the entry pairing OpenApiOperationNotFoundError
    with 422 for the sibling path-and-method refusal; this node''s own statement names no HTTP status
    itself. — [OpenApiDocumentNotFetchedError, 422],

    [OpenApiDocumentNotReadableError, 422],

    [OpenApiOperationNotFoundError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at the map entry pairing OpenApiDocumentNotFetchedError with 422,
    which is this file''s part of turning that fetch-failure refusal into a named response rather than
    the generic fallback; the 60000-millisecond timeout this node also fixes is not this file''s concern.
    — [OpenApiDocumentNotFetchedError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at nowhere in this file — subject construction,
    and any check of how many attribute-values subjectAttributes carries, is delegated whole to the imported
    buildSubject call; this file states no branch, count or refusal of its own over subjectAttributes.
    — const subject = buildSubject(subjectType, subjectAttributes);'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: "src/case/case-query.service.ts: held at replayCase, which pins the replay to the case by slug\
    \ and version. — export async function replayCase(slug: string, version: number, caseStore: ICaseStore):\
    \ Promise<Case> {\n  const assembled = await heldVersion(caseStore, slug, version);\n  return trustedCaseOf(assembled);\n\
    }"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  conforms: false
  how: "src/case/delete-case.operation.ts, the body of deleteCase(), lines 3-5: export async function\
    \ deleteCase(store: ICaseStore, slug: string): Promise<void> {\n  await store.delete(slug);\n} — A\
    \ caller invoking deleteCase against a case that still holds a version gets whatever store.delete(slug)\
    \ happens to do — success, a generic driver error, or an unrelated constraint violation — never the\
    \ HTTP 409 reporting a CaseHoldsVersionsError naming the slug that the rule requires, and nothing\
    \ in this function removes the case's referencing hypotheses, hypothesis-revisions or collects either;\
    \ the next reader looking here for the refusal or the cascade finds one unconditional delegated call."
  observed_at:
  - src/case/case-store.port.ts
  - src/case/delete-case.operation.ts
  - src/errors/case-holds-versions.error.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  conforms: true
  how: "src/case/case-query.service.ts: held at heldVersion, which refuses an assembly the store answered\
    \ with nothing. — async function heldVersion(store: ICaseStore, slug: string, version: number): Promise<AssembledCaseVersion>\
    \ {\n  const assembled = await store.assembleVersion(slug, version);\n  if (assembled === undefined)\
    \ {\n    throw new CaseNotFoundError(slug, version);\n  }\n  return assembled;\n}"
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  conforms: false
  how: "src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts, the test \"defaults\
    \ a newly-inserted case_versions row that does not name its own state to 'released' ... every currently-shipped\
    \ write path that inserts without naming state depends on this\", lines 568-579: it(\"defaults a newly-inserted\
    \ case_versions row that does not name its own state to 'released', since the column's own DEFAULT\
    \ is kept permanently rather than dropped after backfill — every currently-shipped write path that\
    \ inserts without naming state depends on this\", async () => {\n...\n  expect(result.rows[0].state).toBe('released');\
    \ — `a-case-version-moves-through-its-declared-lifecycle` declares a case version's own initial state\
    \ `draft` (`initial: draft`), with `released` reached only through the `release` transition. This\
    \ test asserts, and the schema it exercises enforces, the opposite for any insert that omits `state`:\
    \ the row is born `released` — immutable from that moment, per `domain/knowledge/case-version`'s \"\
    once released, it is never altered again\" — and the test's own title states that live write paths\
    \ currently depend on this permanently. A reader who trusts the lifecycle node would expect a name-omitting\
    \ write to still begin in draft; instead it silently produces a version that can never again be corrected\
    \ or discarded, and the specification never says so."
  observed_at:
  - src/case/case-store.port.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: "src/case/case-store.port.ts: held at insertHypothesisRevision's signature, which carries no version\
    \ or subject type of its own, and findDraftVersion, which exposes only the draft's version and its\
    \ declared subject — insertHypothesisRevision(input: HypothesisRevisionInput): Promise<number>; findDraftVersion(slug:\
    \ string): Promise<DraftVersion | undefined>; export type DraftVersion = {\n  readonly version: number;\n\
    \  readonly subject: string;\n};\nsrc/errors/status-map.ts: held at the map entry pairing CaseHoldsNoDraftError\
    \ with 409 — [CaseHoldsNoDraftError, 409],"
  encoded_at:
  - src/case/case-store.port.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: false
  how: "the fact left part of its ground: still held in migrations/0021-refuse-altering-a-released-revision.sql,\
    \ and src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts read `nowhere` — Both `reviseHypothesis`\
    \ call sites in this file (`placeFixtureHypotheses`, lines 95-102, and `releaseOwnedHypothesisRevision`,\
    \ lines 279-289) are invoked before the revision they produce is ever released, never against one\
    \ already in released state; no test in this file attempts to alter a released revision's criterion,\
    \ resolution or state, or asserts the 409 ReleasedHypothesisRevisionNotAlterableError refusal this\
    \ node states. The file's own released-revision test at lines 318-343 —\n\n  await connection.query(\n\
    \    'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',\n \
    \   [ownedSlug, hypothesisName],\n  );\n\n— exercises a removal of the revision's own collects, which\
    \ this node's own Description names as answered instead by `a-released-revisions-collect-removal-is-accepted-with-no-effect`\
    \ (a node outside this file's given set), not by this node's alteration refusal.; src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts\
    \ read `nowhere` — it(\"changes an already-stored hypothesis revision's own columns on an ordinary\
    \ UPDATE while the revision's own state is still draft\", async () => {\n  ...\n  await client.query(\n\
    \    \"UPDATE hypothesis_revisions SET criterion = 'A revised criterion.' WHERE case_slug = $1 AND\
    \ hypothesis_name = $2 AND revision = 1\",\n    [slug, 'the-hypothesis'],\n  );\n  ...\n  expect(rows[0]?.criterion).toBe('A\
    \ revised criterion.');\n});\nThis is the only UPDATE this file runs against hypothesis_revisions,\
    \ and it exercises only\nthe draft-state, mutable case; no test in the file attempts to alter a released\n\
    hypothesis-revision or asserts an HTTP 409 ReleasedHypothesisRevisionNotAlterableError\nrefusal. —\
    \ a binding asserts the file answers for the node, so the pair that stopped holding it is released\
    \ by `--bind ... --replace`, never restamped here"
  observed_at:
  - migrations/0021-refuse-altering-a-released-revision.sql
  - src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: false
  how: 'no named file holds this fact now: src/case/case-query.service.ts read `nowhere` — heldVersion
    calls `await store.assembleVersion(slug, version)` and trusts a single `AssembledCaseVersion` back;
    the file assumes rather than enforces that one slug names one case — uniqueness itself is not stated
    or checked anywhere in this file.'
  observed_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  conforms: true
  how: "src/case/case-query.service.ts: held at readCaseVersion/attributesOf. — function attributesOf(assembled:\
    \ AssembledCaseVersion): CaseVersionAttributes {\n  return {\n    title: assembled.title,\n    when_to_use:\
    \ assembled.when_to_use,\n    subject: assembled.subject,\n    fallback: assembled.fallback,\n   \
    \ ...(assembled.consolidation_register !== undefined\n      ? { consolidation_register: assembled.consolidation_register\
    \ }\n      : {}),\n  };\n}\n---\npublic async readCaseVersion(slug: string, version: number): Promise<ReadCaseVersionResult>\
    \ {\n  const assembled = await heldVersion(this.caseStore, slug, version);\n  return { version: attributesOf(assembled)\
    \ };\n}"
  encoded_at:
  - src/case/case-query.service.ts
- node: scenarios/knowledge/a-case-holding-no-version-is-deleted
  conforms: true
  how: 'src/case/delete-case.operation.ts: held at the call to store.delete(slug), line 4 — await store.delete(slug);'
  encoded_at:
  - src/case/delete-case.operation.ts
unstated:
- file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  where: the test "backfills every pre-existing case_versions row's state to 'released' when migration
    0009 adds the column", lines 539-566
  evidence: "it(\"backfills every pre-existing case_versions row's state to 'released' when migration\
    \ 0009 adds the column\", async () => {\n...\n    expect(rows).toEqual([{ state: 'released', released_at:\
    \ null }]);"
  cost: Which state a case_versions row predating the state column is silently reclassified into on migration
    is a fact with real consequences — `a-case-version-moves-through-its-declared-lifecycle` makes `released`
    terminal and immutable, and only a released version is diagnosable — yet the choice to backfill every
    such row to `released` rather than `draft` lives only in this test and the migration script it exercises;
    a reader checking the specification for how historical case versions were reclassified when the lifecycle
    was introduced will not find it there.
- file: src/factories/concept-usage-reader.factory.ts
  where: the if/else-if chain in resolveConceptUsage, lines 27-38
  evidence: "if (capability.held) {\n  return { named: true, reference: 'capability' };\n} if (await sources.investigationStore.isConceptNamedByEvidence(concept))\
    \ {\n  return { named: true, reference: 'evidence' };\n} if (await sources.investigationStore.isConceptNamedByCitation(concept))\
    \ {\n  return { named: true, reference: 'citation' };\n} if (await sources.caseStore.isConceptCollectedByHypothesisRevision(concept))\
    \ {\n  return { named: true, reference: 'hypothesis-revision-collects' };\n}"
  cost: 'rules/glossary/a-registered-concept-is-never-removed''s own Description says the refusal "names
    which of those conditions was found, so the person told to keep the concept knows what to look at"
    — but its statement pairs each of the four conditions with a reference value one at a time and never
    says which wins when a concept satisfies more than one at once. domain/integration/capability''s own
    Description ("It answers exactly one concept... its output schema... bounds every citation over the
    evidence it produces") means a concept a capability answers routinely also has evidence naming it
    and citations bounded by that evidence, so this is the ordinary case, not an edge one: for such a
    concept this chain always reports ''capability'' and never discloses that evidence or a citation also
    names it. An operator who deregisters the capability believing that clears the concept meets the removal
    refused again, now for a reference (''evidence'' or ''citation'') the first refusal never showed them,
    because the priority that decided what to disclose first lives only in the order of these four ifs.'
- file: src/http/read-capability-by-identity-rate-limit.middleware.ts
  where: refuseOverLimit's response body, lines 48-53
  evidence: "error: {\n  code: 'RATE_LIMIT_EXCEEDED',\n  message: 'too many requests from this source;\
    \ retry after the given number of seconds',\n  details: { retryAfterSeconds },\n},"
  cost: The exact error code, the fixed message wording and the details object's shape are what a caller
    of this route would program against to detect and handle this refusal, yet they are decided only here.
    The node this file answers to states no more than "an HTTP 429 response carrying a Retry-After value
    naming when the caller may retry" — a caller-facing contract fact that lives only in this response
    body, where the next reader will not look for it because they will look in the specification.
- file: src/http/read-capability-by-identity-rate-limit.middleware.ts
  where: the window-tracking logic inside the returned hook (lines 19-27) and pruneExpiredWindows (lines
    35-41)
  evidence: "if (window === undefined) {\n  windows.set(sourceIp, { requestCount: 1, windowStartMs: now\
    \ });\n  return;\n}\n...\nif (now - window.windowStartMs >= RATE_LIMIT_WINDOW_MS) {\n  windows.delete(sourceIp);\n\
    }"
  cost: Anchoring the window to the caller's own first request and expiring it 60 seconds later — rather
    than resetting on a fixed clock-minute boundary — decides when a caller already at the limit may next
    succeed. That choice lives only in this file's window bookkeeping; the node this route answers to
    stops at a count and an HTTP 429/Retry-After shape, so a reader checking what "at most 60 requests
    per minute" means for a caller near a boundary will not find the sliding-vs-fixed answer in the specification.
- file: src/vitest-global-setup.ts
  where: the REPAIRED_CASE_SLUG/REPAIRED_CONCEPTS/REPAIRED_COLLECTS constants (lines 25-37) and the ensureRepairedConceptsExist
    / backfillRepairedCollects functions (lines 39-66) that insert them into `concepts`, `concept_accepts`
    and `hypothesis_revision_collects` on every suite run
  evidence: "const REPAIRED_CONCEPTS: ReadonlyArray<{ readonly name: string; readonly ttl: number }> =\
    \ [\n  { name: 'equipment-status', ttl: 300 },\n  { name: 'network-outage-flag', ttl: 60 },\n];\n\n\
    const REPAIRED_COLLECTS: ReadonlyArray<{ readonly hypothesisName: string; readonly concept: string\
    \ }> = [\n  { hypothesisName: 'customer-equipment-fault', concept: 'equipment-status' },\n  { hypothesisName:\
    \ 'area-network-outage', concept: 'network-outage-flag' },\n];"
  cost: the specification's own scenarios (a-hypothesis-revision-is-released-independently-of-any-manifest,
    a-draft-revision-is-overwritten-by-repeated-saves, and others) name the hypothesis customer-equipment-fault,
    but none of them, nor any node under the specification root, says that it collects a concept called
    equipment-status, that equipment-status carries a ttl of 300, that network-outage-flag exists at all,
    or that the hypothesis area-network-outage collects it. Those associations and values are decided
    here, in a global test-setup file titled "repair", so a reader who wants to know what customer-equipment-fault
    collects or what equipment-status's ttl is will not find it in the glossary or the specification —
    only in this harness script, which reasserts the pairing on every test run whether or not anything
    still needs it repaired
unbound:
- src/__tests__/unit/http/diagnose.routes.spec.ts
- src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts
- src/__tests__/unit/http/read-capability-by-identity.routes.spec.ts
- src/__tests__/unit/investigation/draft-assessment-text.spec.ts
pairs_omitted:
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0001-schema-migrations.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0002-glossary-vocabulary.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/action
  file: migrations/0002-glossary-vocabulary.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/concept
  file: migrations/0002-glossary-vocabulary.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/outcome
  file: migrations/0002-glossary-vocabulary.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/recipient
  file: migrations/0002-glossary-vocabulary.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/subject-type
  file: migrations/0002-glossary-vocabulary.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0003-capability-registry.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/capability
  file: migrations/0003-capability-registry.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/capability-nature
  file: migrations/0003-capability-registry.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/consolidation-register
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/referral
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/resolution
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-slug-identifies-one-case
  file: migrations/0004-case-and-hypothesis.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/assessment
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/citation
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/cost
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/durations
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evaluation
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evaluation-reason
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence-result
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/investigation
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject-attribute-value
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/verdict
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/referral
  file: migrations/0005-investigation.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: migrations/0006-case-version-immutability.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/manifest-entry
  file: migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  file: migrations/0019-hypothesis-revision-alteration-refused-only-when-released.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0020-hypothesis-revision-own-state.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision-state
  file: migrations/0020-hypothesis-revision-own-state.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision-state
  file: migrations/0021-refuse-altering-a-released-revision.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0023-drop-subject-attributes.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0024-capability-payload-notes.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-stored-schema-mirrors-the-declared-model
  file: migrations/0025-investigation-evidence-capability-payload-notes.sql
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/validation-runs-at-every-read
  file: src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject-attribute-value
  file: src/__tests__/integration/persistence/schema-migrations.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/__tests__/unit/http/error-handler.middleware.spec.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/listings-are-paged
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/capability-registry
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability-registry
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-capability-declares-its-contract
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-capability-declares-well-formed-schemas
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-capability-is-read-only
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/one-capability-answers-one-concept
  file: src/capability-registry/capability-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-query
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-version
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/every-case-version-remains-readable
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/validation-runs-at-every-read
  file: src/case/case-query.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/knowledge/case-lifecycle
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/knowledge/case-query
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-summary
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version-state
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/manifest-entry
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/every-case-version-remains-readable
  file: src/case/case-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case
  file: src/case/delete-case.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/case/hypothesis-revision-release-state.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/case/hypothesis-revision-release-state.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-version
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/case-terms-exist-in-the-glossary
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-released-version-keeps-its-original-revision
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  file: src/case/revise-hypothesis.operation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/connector-configuration-draft
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-draft
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-response-field
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-status-reading
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-unresolved-item
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-registers-nothing
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-draft-states-the-chosen-operations-method
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
  file: src/connector-registry/connector-configuration-draft-generation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-draft
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-generated-credential
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-method-mismatch
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-reading-note
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-reading-note-kind
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-response-field
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-status-reading
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-unresolved-item
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/connector-configuration-draft-unresolved-reason
  file: src/connector-registry/connector-configuration-draft.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/listings-are-paged
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/connector-configuration-registry
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-registry
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  file: src/connector-registry/connector-configuration-registry.service.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/connector-configuration-registry
  file: src/connector-registry/connector-configuration-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  file: src/connector-registry/connector-configuration-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/a-concept-declares-its-description
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/a-vocabulary-holds-each-name-once
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-configuration-names-its-connector
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/case-terms-exist-in-the-glossary
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  file: src/errors/status-map.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/glossary/glossary-authoring
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/capability-registry
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/openapi-document-operations
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-input-requirements
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability-registry
  file: src/factories/build-app.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/capability
  file: src/factories/concept-usage-reader.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evidence
  file: src/factories/concept-usage-reader.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision
  file: src/factories/concept-usage-reader.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/a-registered-concept-is-never-removed
  file: src/factories/concept-usage-reader.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/factories/investigation-store.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/factories/production-diagnose.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-system-persists-to-one-relational-database
  file: src/factories/production-diagnose.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/investigation/diagnosis
  file: src/factories/production-diagnose.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  file: src/factories/production-diagnose.factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/glossary/glossary-authoring
  file: src/glossary/glossary-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/glossary/glossary-store.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/system/corporate-records
  file: src/http-connector/connector-call-descriptor.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/concept-observation
  file: src/http-connector/connector-request-resolver.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/corporate-records-source
  file: src/http-connector/connector-request-resolver.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/system/corporate-records
  file: src/http-connector/connector-request-resolver.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/collection-runs-in-the-requester-scope
  file: src/http-connector/connector-request-resolver.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  file: src/http/diagnose.routes.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/investigation/diagnosis
  file: src/http/diagnose.routes.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/system/guided-diagnosis
  file: src/http/diagnose.routes.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability
  file: src/http/read-capability-by-identity.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/no-route-enforces-authentication
  file: src/http/read-capability-by-identity.routes.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/capability-registry
  file: src/http/read-capability-by-identity.routes.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability-registry
  file: src/http/remove-capability.controller.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/assessment
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/assessment-consolidator
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/usage
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/anthropic-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/integration/capability
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/citation
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evaluation
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evidence
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/field-semantics
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/usage
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/an-observation-is-recorded-as-json-object-text
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/judgment-does-not-infer
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/judgment-reads-the-current-instant-fresh
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  file: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/assessment
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/assessment-consolidator
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evaluation
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evidence
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/usage
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/consolidation-register
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/the-writing-input-is-narrowed
  file: src/investigation/assessment-consolidator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/consolidation-register
  file: src/investigation/consolidation-register.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/cost
  file: src/investigation/cost.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/durations
  file: src/investigation/durations.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence-result
  file: src/investigation/evidence-result.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/consolidation-runs-behind-a-port
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/assessment
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/assessment-consolidator
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evaluation
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evidence
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/usage
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-consolidation-answer-states-its-register
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/fake-assessment-consolidator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/fake-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/usage
  file: src/investigation/fake-hypothesis-evaluator.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/concept-observation
  file: src/investigation/fake-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/investigation/observation-source
  file: src/investigation/fake-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence-result
  file: src/investigation/fake-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/subject
  file: src/investigation/fake-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject-attribute-value
  file: src/investigation/fake-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: src/investigation/field-semantics.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/field-semantics
  file: src/investigation/field-semantics.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  file: src/investigation/field-semantics.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-citation-names-a-nested-output-schema-field
  file: src/investigation/field-semantics.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-nested-output-schema-property-is-named-by-its-full-path
  file: src/investigation/field-semantics.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/concept-observation
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/corporate-records-source
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/investigation/observation-source
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/system/corporate-records
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/capability
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evidence-result
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/an-http-connector-configuration-declares-its-call
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/an-http-connector-configuration-declares-its-method-and-status-vocabulary
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-unclassified-status-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-unreachable-connector-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/collection-runs-in-the-requester-scope
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/integration/a-response-map-key-no-output-schema-field-names-observes-nothing
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  file: src/investigation/http-declarative-observation-source.adapter.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/verdict
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-evidence-items-observed-at-is-a-utc-instant
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/hypothesis-evaluator.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/investigation/glossary-source
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/investigation
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/subject
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject-attribute-value
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/one-evaluation-per-required-hypothesis
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/one-evidence-per-collected-concept
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/replay-is-pinned
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/written-at-records-when-the-write-settled
  file: src/investigation/investigation-factory.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/investigation
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/replay-is-pinned
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/written-at-records-when-the-write-settled
  file: src/investigation/investigation.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/judgment-runs-behind-a-port
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/citation
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evaluation
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/evaluation-reason
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/hypothesis-evaluator
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/investigation/verdict
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-version
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-decided-evaluation-cites-evidence
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/one-evaluation-per-required-hypothesis
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-foreign-citation-is-refused
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  file: src/investigation/judgment-stage.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/integration/concept-observation
  file: src/investigation/observation-source.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/investigation/observation-source
  file: src/investigation/observation-source.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: src/investigation/observation-source.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence-result
  file: src/investigation/observation-source.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  file: src/investigation/observation-source.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  file: src/investigation/observation-source.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/collection-runs-in-the-requester-scope
  file: src/investigation/observation-source.port.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/assessment
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/citation
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evaluation
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/evidence
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-version
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/the-outcome-comes-from-the-case
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/the-writing-input-is-narrowed
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/knowledge/no-confirmation-falls-back
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  file: src/investigation/resolve-and-narrow-input.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/investigation/diagnosis
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/investigation
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/an-investigation-is-written-once
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/no-stage-aborts-on-its-deadline
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/replay-is-pinned
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/investigation/the-response-follows-the-record
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/written-at-records-when-the-write-settled
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/investigation/no-response-without-a-record
  file: src/investigation/run-diagnosis.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/subject-type
  file: src/investigation/subject.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject
  file: src/investigation/subject.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/investigation/subject-attribute-value
  file: src/investigation/subject.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  file: src/investigation/subject.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-connection-pool-is-bounded-by-configuration
  file: src/migrate.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-database-is-externally-provisioned
  file: src/migrate.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: contracts/knowledge/case-lifecycle
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/knowledge/case-query
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/case-summary
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/case-version-state
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/manifest-entry
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/glossary/a-registered-concept-is-never-removed
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-has-at-most-one-draft
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-listing-answers-cases-in-slug-order
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-case-version-number-is-never-reused
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-number-is-never-reused
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-slug-identifies-one-case
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/every-case-version-remains-readable
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/hypotheses-are-ordered-by-precedence
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-catalog-entry-follows-the-released-version
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  file: src/persistence/relational-case-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-system-persists-to-one-relational-database
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: contracts/integration/connector-configuration-registry
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/integration/connector-configuration-registry
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  file: src/persistence/relational-connector-configuration-store.repository.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: constraints/the-connection-pool-is-bounded-by-configuration
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/concept
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/glossary/outcome
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: domain/knowledge/hypothesis-revision
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision-state
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-case-version-is-written-once
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: rules/knowledge/validation-runs-at-every-read
  file: src/seed.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: constraints/the-database-is-externally-provisioned
  file: src/vitest-global-setup.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair — the corpus answers it both ways, and a clearance closes a finding here
    as it does in `--owed`
- node: domain/knowledge/hypothesis-revision
  file: src/vitest-global-setup.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  file: src/vitest-global-setup.ts
  reason: the binding computes at the file's content and at the node's text as both stand, and no finding
    stands open against the pair
notes: "Judged by 72 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/capability-and-isolable-constraints-certification-audit.returns/.\nCertification\
  \ of constraints/a-case-is-read-whole did not hold: the auditor answered `partial` — The three case-query\
  \ tests only check that readCase returns the fixture's slug, at least one hypothesis, and at least one\
  \ collected concept per hypothesis they get back. Say the read assembled only part of the manifest,\
  \ and returned one entry out of several, or dropped an entry whose hypothesis-revision failed to resolve.\
  \ All three tests would still pass. So the fact that a diagnosis read is assembled whole goes unexercised:\
  \ no test compares the returned hypotheses with the version's manifest entries, one for one, with each\
  \ entry's own revision. The \"or not at all\" half also goes unexercised. Nothing in the set reads a\
  \ version whose attributes, manifest or referenced revision is incomplete or invalid and then checks\
  \ that nothing comes back. The same goes for resolving it all in one transaction: no test puts a write\
  \ between reading the version and reading its revisions. The second half says a hypothesis, its revisions\
  \ and a draft's manifest entries may be handled independently. The release-ordering test touches this\
  \ only in passing. Its helper revises and releases a hypothesis-revision before placing it, and the\
  \ test asserts only that the release order goes through. Reading, removing, and revising a revision\
  \ that is already placed are not exercised. Three tests do not bear on this fact. The SQL test \"reads\
  \ back every hypothesis-revision the released case version's manifest references with its own state\
  \ released\" queries tables directly and never uses the case-query read. The collects-survive-DELETE\
  \ test checks that a released revision's collects cannot be changed. The second-release refusal test\
  \ checks the revision release lifecycle.. The node is decided by reading, and a certification standing\
  \ on it from an earlier reconciliation is released by the bind. The remainder is testable: The first\
  \ assertion: take a released case version whose manifest has N entries, read it through case-query,\
  \ and check that exactly N hypotheses come back. Each should carry the criterion, collects and resolution\
  \ of the revision its entry references, in the manifest's order. The second: make one referenced revision\
  \ fail to resolve or fail validation, and check that the read refuses, with a CaseVersionNotValidError\
  \ or no case, rather than returning the other entries. The third: remove a draft's manifest entry, and\
  \ revise a hypothesis on its own, and check that each succeeds without touching the rest of the version..\n\
  Certified constraints/a-domain-error-unmapped-by-status-is-refused-generically as decided by step `test-unit`:\
  \ src/__tests__/unit/http/error-handler.middleware.spec.ts (still answers 500 with the unchanged generic\
  \ envelope for a typed domain error the status map does not name); src/__tests__/unit/http/error-handler.middleware.spec.ts\
  \ (never lets an unmapped error's own message or context reach the client) would fail if the fact stopped\
  \ holding.\nCertification of constraints/hypotheses-are-judged-in-isolated-parallel-calls did not hold:\
  \ the auditor answered `partial` — Most of the fact is exercised. One call per hypothesis is covered:\
  \ each evaluate() call carries only its own hypothesis's criterion and evidence, with exactly two calls\
  \ for two hypotheses. Parallel calls under a bounded pool are covered in judgeHypotheses: with a pool\
  \ of two, both h1 and h2 are in flight at once while h3 waits. The pool-of-one tests keep a sibling\
  \ queued, so judgeHypotheses honors the pool size it is given, whether one or two. One provider call\
  \ per hypothesis appearing in the recorded cost is covered too: two judged hypotheses plus consolidation\
  \ write cost.calls 3. The part left unexercised is \"the pool bound is configuration\" at the composition.\
  \ runDiagnosis forwarding poolSize is exercised only at a pool of one, and the maxConcurrent 1 assertion\
  \ holds just as well if runDiagnosis passed a hardcoded 1 to the judgment stage. No run-diagnosis test\
  \ supplies a bound above one and checks that judgment actually runs that many calls at once. Nothing\
  \ in the offered proof shows the bound coming from configuration either. Every test sets poolSize as\
  \ a literal option, so how the running system gets its value from configuration is not exercised by\
  \ these files.. The node is decided by reading, and a certification standing on it from an earlier reconciliation\
  \ is released by the bind. The remainder is testable: Two assertions would close it. First, run runDiagnosis\
  \ on two hypotheses with poolSize 2 and an evaluator whose calls overlap, and expect the most calls\
  \ in flight at once to be 2 (with poolSize 1 it should be 1). Second, supply a configured pool-size\
  \ value where the running system reads it, and expect the diagnose pipeline to judge with exactly that\
  \ bound, not a value of its own..\nCertified constraints/the-capability-identity-read-is-rate-limited\
  \ as decided by step `test-unit`: src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts\
  \ (answers the 61st request within one minute from the same source IP with HTTP 429); src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts\
  \ (names, in the 429 response, a Retry-After value the caller may retry after); src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts\
  \ (answers every one of the first 60 requests within a minute from one source IP with its ordinary response,\
  \ none of them refused); src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts\
  \ (does not count a second source IP's requests against a first source IP's own limit); src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts\
  \ (refuses no route but read-capability-by-identity, even once that route's own limit is exhausted from\
  \ the same source IP); src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts\
  \ (lets a source IP start a fresh window, with its ordinary response, once its prior window has fully\
  \ elapsed); src/__tests__/unit/http/read-capability-by-identity-rate-limit.middleware.spec.ts (never\
  \ answers a Retry-After below one second, even when the refusal lands in the window's very last millisecond)\
  \ would fail if the fact stopped holding.\nCertification of constraints/the-capability-identity-read-refuses-an-unregistered-identity\
  \ did not hold: the auditor answered `partial` — The named test checks one thing: when an error is raised,\
  \ the route turns it into a 404. It asserts HTTP 404 and error.code 'CapabilityIdentityNotFoundError'\
  \ only after the readCapabilityByIdentity dependency has been mocked to reject with a CapabilityIdentityNotFoundError\
  \ built by hand. Nothing in the test makes a request for a name and version that no capability is registered\
  \ at. No registry is consulted, so \"no capability is currently registered\" is never decided by the\
  \ code under test. If the route's real resolution stopped raising CapabilityIdentityNotFoundError for\
  \ an unregistered identity (for example it returned nothing, answered 200 with an empty body, or threw\
  \ a generic error that becomes a 500), this test would still pass. The fact also says the refusal names\
  \ CapabilityIdentityNotFoundError as its message. The test asserts only body.error.code and body.error.details\
  \ and never reads body.error.message, so the message half is not exercised either. The test in the same\
  \ file that checks CapabilityIdentityNotFoundError is not an instance of the other three not-found classes\
  \ never exercises the route, so it does not bear on this fact.. The node is decided by reading, and\
  \ a certification standing on it from an earlier reconciliation is released by the bind. The remainder\
  \ is testable: One input: a GET to the read-capability-by-identity route for a name and version with\
  \ no capability registered, resolved by the route's real identity lookup over a registry that holds\
  \ no such capability (not a mocked rejection). One expected result: HTTP 404, a body whose error names\
  \ CapabilityIdentityNotFoundError as its code, and a message that is CapabilityIdentityNotFoundError's\
  \ own..\nCertification of constraints/the-consolidation-prompt-is-closed did not hold: the auditor answered\
  \ `uncovered` — The offered file tests draftAssessment, which sits one layer above the prompt. Every\
  \ consolidator in it is a stand-in: FakeAssessmentConsolidator, keyed by the {evaluations, evidence,\
  \ consolidationRegister} it was seeded with, or ScriptedConsolidator, which returns a fixed ConsolidationOutcome.\
  \ No consolidation prompt is ever built, and no provider is ever called. The prompt the Assessment carries\
  \ is checked only in \"copies register, usage, elapsed_ms and prompt from the consolidator's own ConsolidationOutcome\
  \ onto the returned Assessment unchanged ...\". There it is the literal 'the exact consolidation prompt',\
  \ copied from the scripted outcome and checked as that same literal. So that assertion cannot fail if\
  \ the prompt stops being closed. The tests that seed the fake with narrowedInput's evaluations and evidence\
  \ and the given register (\"answers text equal to what the consolidator returns ...\", \"answers the\
  \ register-specific text ...\", \"forwards empty evaluations and empty evidence ...\") show what draftAssessment\
  \ passes to the port. They say nothing about what the prompt holds. Four parts of the fact go unexercised.\
  \ First, that the prompt holds only the required hypotheses' evaluations, the evidence their citations\
  \ name, and the register. Second, that evidence no citation names stays out. Third, that the three sit\
  \ inside a delimited data block. Fourth, that the provider call grants the model no tools.. The node\
  \ is decided by reading, and a certification standing on it from an earlier reconciliation is released\
  \ by the bind. The remainder is testable: Two assertions would close it. First, the prompt-assembly\
  \ function, which the fitness says is pure: give it required evaluations, evidence where some items\
  \ are cited and some are not, and a register value. The assembled prompt should equal an expected string.\
  \ That string holds exactly those evaluations, only the cited evidence and the register, inside the\
  \ delimited data block, with nothing else interpolated. Second, the provider adapter: give it a consolidation\
  \ call and capture the outgoing request. The request should carry no tools and no tool-choice grant..\n\
  Certification of constraints/the-domain-depends-on-no-infrastructure did not hold: the auditor answered\
  \ `partial` — These tests can fail. Each one collects the import specifiers read from the real source\
  \ files and asserts that the list of offenders is empty. There is also a guard that throws if no module\
  \ is found, so the audit cannot pass by finding nothing. Three parts of the fact are still unexercised.\
  \ (1) \"No framework, no driver and no provider client\" is checked against fixed deny lists: 23 framework\
  \ and driver names, 7 HTTP clients, and only one provider client, @anthropic-ai/sdk. A domain module\
  \ that imported any other framework, driver or provider client would pass. Examples are a scoped package\
  \ such as @fastify/*, which the prefix match on \"fastify\" does not catch, or another LLM provider's\
  \ SDK. (2) The audit reads only the top-level .ts files of case/, glossary/, capability-registry/ and\
  \ investigation/, because readdir is not recursive. Any domain module in a subdirectory is outside it.\
  \ The node names \"evaluation\" as part of the domain, but the test never says where evaluation lives.\
  \ If evaluation modules sit outside those four directories, nothing audits them. (3) \"Infrastructure\
  \ reaches it only through ports\" is checked only against a few named modules: database-connection,\
  \ the connector-configuration store and its relational repository, the connector-request-resolver and\
  \ its call descriptor and errors, and the http-declarative-observation-source adapter. A domain module\
  \ that imported any other infrastructure module by relative path would pass, and so would any driver\
  \ it reaches through that module. One example is a persistence/*.repository other than the relational\
  \ connector-configuration store. The test also exempts three adapters that sit inside investigation/,\
  \ matching them by file name only: two Anthropic adapters and the HTTP observation-source adapter. That\
  \ treats files in the audited directories as not all being domain, but no test establishes that boundary.\
  \ Two tests assert more than the node states, and are findings rather than coverage. \"the connection\
  \ module sits under persistence/, beside the relational store repositories, rather than under any of\
  \ the four audited domain directories\" checks only that database-connection.ts and relational-case-store.repository.ts\
  \ exist in persistence/. It never checks that either file is absent from the domain directories, so\
  \ it does not bear on the fact and is not cited above. The connector-configuration-store test forbids\
  \ the domain from importing connector-configuration-store.port. That is a ban on importing a port, which\
  \ goes beyond a node that lets infrastructure reach the domain through ports.. The node is decided by\
  \ reading, and a certification standing on it from an earlier reconciliation is released by the bind.\
  \ The remainder is testable: The remainder is closed by a finite audit over the domain modules' imports.\
  \ Walk every .ts file under each directory that holds case behavior, the investigation factory, evaluation\
  \ and vocabulary, recursively. Assert two things. First, every bare specifier is either a node: built-in\
  \ or on a declared allowlist of packages that are not infrastructure; a deny list cannot close this.\
  \ Second, every relative specifier resolves either inside those directories or to a *.port module. Adapters\
  \ placed beside the domain should be identified by a declared marker rather than a file-name list. With\
  \ those assertions, adding a framework, driver or provider client import to any domain module, or a\
  \ direct import of any non-port infrastructure module, makes the test fail..\nCertification of constraints/the-judgment-prompt-is-closed\
  \ did not hold: the auditor answered `partial` — The tests check what the judgment stage hands to evaluate(),\
  \ and only that. Three parts are exercised. First, only the judged hypothesis's own criterion and its\
  \ own evidence are passed, never a sibling's. Second, each item's snapshotted concept meaning, fields,\
  \ observed_at and ttl pass through unchanged, and exact toEqual means an extra attribute such as the\
  \ subject's inputs would fail the test. Third, the pinned case's title and when_to_use are passed as\
  \ CaseContext.\nThe prompt itself is never exercised. Every test uses a scripted evaluator, so nothing\
  \ checks the real evaluator's assembled prompt. Nothing checks that the content sits in a delimited\
  \ data block, and nothing checks that the provider call grants no tools.\nThe current instant is also\
  \ unexercised. Nothing checks that the prompt carries it, read fresh in UTC at assembly. The retry-timing\
  \ test (\"issues a retry as a genuinely separate evaluate() call happening only after real time has\
  \ elapsed since the first attempt ...\") cannot fail on this fact. It only compares the scripted evaluator's\
  \ own clock readings, and its first answer resolves 50ms late in every case.\n\"No live read of the\
  \ glossary\" is not exercised at all. The capability-registry half is covered only by a text search\
  \ of judgment-stage.ts for import names. That binds the module's shape, not behavior, and does not reach\
  \ the file where the prompt is actually assembled.\nA detail for a reader to route: every evidence item\
  \ passed to evaluate() also carries result and capability_payload_notes. Two tests in the file assert\
  \ capability_payload_notes is passed, and the node's list of what an item carries does not name it.\
  \ Whether \"its own evidence\" admits it is not settled here.. The node is decided by reading, and a\
  \ certification standing on it from an earlier reconciliation is released by the bind. The remainder\
  \ is testable: Call the real evaluator adapter with one criterion, evidence items whose snapshotted\
  \ fields (with type and description), concept meaning, observed_at and ttl are set, a case context,\
  \ and a fixed clock. Check four results. First, the assembled prompt holds exactly those contents inside\
  \ the delimited data block, plus the fixed clock's instant as a UTC ISO string, and no sibling criterion\
  \ or subject attribute. Second, the provider request carries no tools. Third, two separate judgment\
  \ requests with the clock advanced between them show two different instants. Fourth, with glossary and\
  \ capability-registry doubles that throw on any read, assembly still completes..\nCertification of constraints/diagnosis-answers-synchronously\
  \ did not hold: the auditor answered `partial` — Both named tests send one POST /v1/diagnose. Each expects\
  \ a 200 whose body is the assessment itself, so either would fail if the route answered with a job handle,\
  \ a 202 or anything the attendant would have to poll. That means the fact is exercised at the route.\
  \ It is only exercised incidentally, though. Each test sets out to prove something else, the narrowing\
  \ to the response DTO in one and the released-state or input-coverage gate in the other. The in-response\
  \ answer is asserted along the way, and nothing marks it as load-bearing, so it would be rewritten the\
  \ day those assertions change. Both tests also replace the wired diagnose runner with a mock that resolves\
  \ at once. Nothing in the set exercises the production diagnose path behind the route. A job, queue\
  \ or wait placed inside that path would pass every test in the file, as long as the runner still resolves\
  \ an assessment in the end. So \"no job, no queue and no polling stand between the attendant and the\
  \ assessment\" is unexercised past the route boundary. The rate-limit tests check status codes only\
  \ and never read the assessment, so they do not bear on this fact.. The node is decided by reading,\
  \ and a certification standing on it from an earlier reconciliation is released by the bind. The remainder\
  \ is testable: One input against one result, in a test that exists for this fact. The input is a single\
  \ POST /v1/diagnose through the production-wired diagnose path, with only the model client stubbed to\
  \ resolve. The expected result is that the same response answers 200 and carries the assessment's outcome,\
  \ referral and text, with no job identifier, Location or poll-for-result body, and no further request\
  \ needed to get the assessment..\nCertification of constraints/the-schema-replays-from-its-scripts did\
  \ not hold: the auditor answered `partial` — The replay half is exercised. The replay test sorts every\
  \ .sql file under migrations by filename, runs each one in that order into a newly created schema, and\
  \ fails if any script errors. It also fails if the set of relations produced differs from its hard-coded\
  \ list of twenty tables. So a script that no longer replays, or an order that breaks replay, is caught.\
  \ Two parts of the fact are not exercised. First, the \"empty database\" is a new schema inside the\
  \ existing lab database, reached through search_path. Anything set up by hand at database level (an\
  \ extension, a role, an object in another schema that a script names explicitly) would still let replay\
  \ pass here but would fail on a truly empty database. So \"with no step performed by hand\" is only\
  \ half-checked. Second, \"the schema the current tree expects\" is checked at column level for only\
  \ a few tables: capabilities, schema_migrations, the state column of hypothesis_revisions, and the list\
  \ of nullable columns. Columns elsewhere are asserted only incidentally, through the insert helpers.\
  \ Nothing compares the replayed schema with what the tree's own queries use. A NOT NULL column that\
  \ the tree reads, missing from every script, would fail no test in the set unless a helper happened\
  \ to insert into it. The column-level tests also read the schema built in beforeAll rather than one\
  \ the test builds itself, so they rest on that replay without being the replay's own assertion.. The\
  \ node is decided by reading, and a certification standing on it from an earlier reconciliation is released\
  \ by the bind. The remainder is testable: Input: every migration script, in filename order, replayed\
  \ onto a newly created database (CREATE DATABASE ... TEMPLATE template0) with nothing else applied.\
  \ Expected result: every script applies, and the resulting catalog (tables, columns, types, nullability,\
  \ constraints, indexes) equals the schema the tree expects, stated whole. Either compare it with a declared\
  \ schema snapshot, or run each repository's own queries against it and require every one to succeed..\n\
  A finding in migrations/0003-capability-registry.sql names domain/integration/capability-nature, which\
  \ no file of this set is bound to: header comment, lines 3-4: -- (domain/integration/capability-nature\
  \ enumerates what it may do to the\n-- world, restricted below to exactly its two declared values).\
  \ — The comment independently asserts the enum's cardinality (\"exactly its two declared values\") rather\
  \ than letting the CHECK constraint alone carry that fact. Because an applied migration is never edited\
  \ here, if capability-nature ever gains a third value this fixed count stays behind as a second, unsynchronized\
  \ statement of what the node currently enumerates.. It blocks nothing here; it is owed a route of its\
  \ own.\nA finding in migrations/0005-investigation.sql names domain/investigation/evaluation-reason,\
  \ which no file of this set is bound to: the CHECK constraint on investigation_evaluations.reason, lines\
  \ 84-86: CONSTRAINT investigation_evaluations_reason_check\n  CHECK (reason IN ('no-data', 'judgment-failure',\
  \ 'deadline-exceeded')) — A judgment call that completes within its deadline over evidence that collected\
  \ ok, and returns a well-formed inconclusive verdict grounded in nothing, must be recorded with reason\
  \ `not-grounded` — the value src/investigation/evaluation-reason.ts already declares (`export const\
  \ EVALUATION_REASONS = ['no-data', 'judgment-failure', 'deadline-exceeded', 'not-grounded'] as const;`)\
  \ and src/investigation/anthropic-hypothesis-evaluator.adapter.ts already produces. This constraint\
  \ admits only the first three, so that exact write is refused by the database at the moment the record\
  \ most needs writing, and no later migration in the tree ever widens this constraint to admit the fourth\
  \ value.. It blocks nothing here; it is owed a route of its own.\nA finding in src/connector-registry/connector-configuration-draft.ts\
  \ names domain/investigation/evidence-result, which no file of this set is bound to: line 25, the local\
  \ type alias `ConnectorConfigurationDraftStatusReadingEnding`: type ConnectorConfigurationDraftStatusReadingEnding\
  \ = 'ok' | 'unavailable' | 'denied' | 'timeout'; — the ending vocabulary already lives as `EvidenceResult`\
  \ in src/investigation/evidence-result.ts (`export const EVIDENCE_RESULTS = ['ok', 'unavailable', 'denied',\
  \ 'timeout'] as const;`), the type every other observation-facing module in the codebase reads its ending\
  \ from; this file re-declares the same four values as a private, unrelated alias, so a fifth ending\
  \ added to the specification's evidence-result enumeration can be reflected in `EvidenceResult` and\
  \ this local copy will still type-check against the old four, with nothing to catch the drift.. It blocks\
  \ nothing here; it is owed a route of its own.\nA finding in src/connector-registry/connector-configuration-registry.service.ts\
  \ names rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder, which\
  \ no file of this set is bound to: orphanedAcrossEveryCapability's return mapping, line 102: return\
  \ orphanedEverywhere.map((placeholder) => ({ placeholder, capabilities })); — The ConnectorPlaceholderOutsideInputSchemaError\
  \ thrown from this carries, for every orphaned placeholder, the entire list of capabilities checked\
  \ against that connector rather than the one capability that fails to declare it. An operator reading\
  \ the refusal cannot tell, among several capabilities sharing a connector, which one is missing the\
  \ attribute — the very correction rules/integration/a-connector-placeholder-refusal-reports-every-orphaned-placeholder\
  \ exists to hand them before they have to guess or retry.. It blocks nothing here; it is owed a route\
  \ of its own.\nA finding in src/investigation/evidence-result.ts names domain/investigation/evidence-result,\
  \ which no file of this set is bound to: line 1, the EVIDENCE_RESULTS const array and the EvidenceResult\
  \ type derived from it: export const EVIDENCE_RESULTS = ['ok', 'unavailable', 'denied', 'timeout'] as\
  \ const; — domain/investigation/evidence-result already fixes this same closed vocabulary (values: ok,\
  \ unavailable, denied, timeout) as the enumeration's one home; this file restates the identical four\
  \ values as a literal array with nothing that reads them from the specification. Should the node's vocabulary\
  \ ever change — a value renamed, added or retired — nothing here would follow from that edit, so the\
  \ two lists can drift apart silently, and a reader auditing what evidence results exist meets two definitions\
  \ with no way to tell which one the business actually decided.. It blocks nothing here; it is owed a\
  \ route of its own.\nA finding in src/investigation/investigation-factory.ts names rules/investigation/written-at-records-when-the-write-settled,\
  \ which no file of this set is bound to: BuildInvestigationOptions.written_at (line 33) and the written_at\
  \ field of the returned Investigation in buildInvestigation's return statement (line 54): readonly written_at?:\
  \ string;\n...\nwritten_at: options.written_at!, — The factory assembles the Investigation record —\
  \ including written_at, forced in from whatever the caller supplied via a non-null assertion — before\
  \ any write has settled against the store. An audit reading written_at off a record built this way learns\
  \ the instant the factory ran (or whatever timestamp a caller chose to pass), not the instant the store\
  \ settled the write, which is the one fact the node says this attribute exists to preserve; the record\
  \ this factory hands onward already carries the value the node says persistence alone may fix.. It blocks\
  \ nothing here; it is owed a route of its own.\nCandidates: 102 opened across 28 of 72 delegation(s);\
  \ each return lists its own under `candidates_opened`.\nUnstated: 5 fact(s) the source states that no\
  \ node holds, over 4 file(s), listed under `unstated`. They block no binding here and no rebind closes\
  \ them — the route is the analysis that gives each fact a node."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/capability-and-isolable-constraints-certification-audit.returns/`, which are the evidence behind every entry above.
