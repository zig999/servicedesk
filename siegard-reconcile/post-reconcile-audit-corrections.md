---
contract_version: siegard-reconcile/5
title: 'Review of post-reconcile-audit-corrections: three corrective tasks'
summary: task/connector-placeholder-orphan-union/refuse-on-any-capabilitys-absence, task/fake-hypothesis-evaluator-no-data-usage/no-usage-or-elapsed-for-no-data
  and task/seed-concept-upsert/replace-ttl-and-accepts-whole, all under the post-reconcile-audit-corrections
  initiative, wrote and proved the six files below.
target: backend
files:
- path: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  change: pre-existing file, cited by the seed-concept-upsert proof as already deciding the whole-replace/whole-add/whole-remove
    clauses that seedConcepts now reaches through IGlossaryStore.writeConcepts; not modified by this delivery.
- path: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  change: written by the delivery of task/connector-placeholder-orphan-union/refuse-on-any-capabilitys-absence
- path: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  change: written by the delivery of task/fake-hypothesis-evaluator-no-data-usage/no-usage-or-elapsed-for-no-data
- path: src/__tests__/unit/seed.spec.ts
  change: written by the delivery of task/seed-concept-upsert/replace-ttl-and-accepts-whole
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: Replaced orphanedAcrossEveryCapability (intersection -- a placeholder counted as orphaned only
    when absent from every registered capability's input schema) with orphanedAcrossAnyCapability, which
    unions each capability's own orphaned-placeholder set so a placeholder absent from any one capability
    sharing the connector's name is reported; the empty-capabilities short-circuit to no orphans is unchanged,
    and each orphaned entry still pairs the placeholder with the full capabilities array sharing the connector,
    declaring or not. Updated the sole call site in the private refuseOrphanedPlaceholders method to the
    renamed function.
- path: src/investigation/fake-hypothesis-evaluator.adapter.ts
  change: evaluate() now branches on the seeded outcome's reason. When reason is present and equals no-data,
    it returns a freshly built object carrying only verdict, reason and citations -- unconditionally omitting
    usage, elapsed_ms and prompt even when the seed itself supplied any of them, since a no-data outcome
    means judgment was never called. For every other outcome (confirmed, refuted, or inconclusive with
    a reason other than no-data) it returns the seed spread with ZEROED_USAGE and ZEROED_ELAPSED_MS merged
    in as before, plus prompt now set to the seed's own prompt when present or the new PLACEHOLDER_PROMPT
    constant when absent -- so every outcome representing an actual call always carries all three call-record
    fields together.
- path: src/seed.ts
  change: seedConcepts now takes the wired IGlossaryStore instance instead of the raw DatabaseConnection,
    parses concept.json straight into the domain Concept[] type (replacing the redundant local ConceptFixture
    alias), and delegates the whole write to store.writeConcepts(concepts) -- the same call site already
    used by seedOutcomes and seedRemainingVocabularies -- instead of running its own two hand-written
    queries per concept. The main script now passes the already-constructed glossary store into seedConcepts
    instead of the bare connection.
nodes:
- node: constraints/a-case-is-read-whole
  conforms: true
  how: 'src/seed.ts: held at nowhere — the file only calls into case-query, it does not itself assemble
    or validate a case version — await createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);'
  encoded_at:
  - src/seed.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: 'src/investigation/fake-hypothesis-evaluator.adapter.ts: held at the class declaration implementing
    the port, with no LLM-client import anywhere in the file — export class FakeHypothesisEvaluator implements
    IHypothesisEvaluator {'
  encoded_at:
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
- node: constraints/listings-are-paged
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at listConnectorConfigurations(),\
    \ lines 60-73 — const held = await this.store.readConnectorConfigurations();\nconst total = held.length;\n\
    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);\nreturn {\n  data,\n\
    \  total,\n  limit: pagination.limit,\n  offset: pagination.offset,\n  pageCount: pageCountOf(total,\
    \ pagination.limit),\n};"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: constraints/the-connection-pool-is-bounded-by-configuration
  conforms: true
  how: "src/seed.ts: held at the return statement of databasePoolOptionsFrom(), lines 147-151 — return\
    \ {\n    maxConnections: env.DATABASE_POOL_MAX_CONNECTIONS,\n    idleTimeoutMs: env.DATABASE_POOL_IDLE_TIMEOUT_MS,\n\
    \    statementTimeoutMs: env.DATABASE_POOL_STATEMENT_TIMEOUT_MS,\n  };"
  encoded_at:
  - src/seed.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at the import list, lines\
    \ 1-15 — import { ConnectorConfigurationNotFoundError } from '../errors/connector-configuration-not-found.error.js';\n\
    ... import type { IConnectorConfigurationStore } from './connector-configuration-store.port.js';\n\
    — every import is a local error type, a local port type, or a local domain module; none is a framework,\
    \ driver or provider client package.\nsrc/investigation/fake-hypothesis-evaluator.adapter.ts: held\
    \ at the import block, which names only the port's own types and the usage value-object — import type\
    \ {\n  CaseContext,\n  EvaluationOutcome,\n  EvidenceItem,\n  IHypothesisEvaluator,\n} from './hypothesis-evaluator.port.js';\n\
    import type { Usage } from './usage.js';"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/connector-registry/connector-configuration-registry.service.ts: held at the class''s four
    public operations: registerConnector (31-40), removeConnector (42-44), readConnectorConfiguration/readConnectorConfigurationOrThrow
    (46-58), listConnectorConfigurations (60-73) — public async registerConnector(registration: ConnectorConfigurationRegistration):
    Promise<ConnectorConfiguration>

    public async removeConnector(connector: string): Promise<void>

    public async readConnectorConfigurationOrThrow(connector: string): Promise<ConnectorConfiguration>

    public async listConnectorConfigurations(pagination: PaginationRequest): Promise<PaginatedResponse<ConnectorConfiguration>>'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: domain/glossary/concept
  conforms: true
  how: 'src/seed.ts: held at nowhere — seedConcepts() parses the fixture and forwards it whole, it does
    not itself declare or check the concept''s shape — const concepts = JSON.parse(raw) as readonly Concept[];

    await store.writeConcepts(concepts);'
  encoded_at:
  - src/seed.ts
  decided_by: reading
  remainder: testable
  remainder_why: Each remaining part is one input against one expected result. Register a concept with
    no description, then with no ttl, then with a non-integer ttl, and each time expect a refusal that
    leaves the glossary as it was. Register a concept under a name already held, through the registration
    entry point rather than the store, and expect the ttl and accepts that are read back to be exactly
    what was registered. The accepts required-ness half becomes testable only once someone decides whether
    "required, many" means at least one subject type.
- node: domain/glossary/outcome
  conforms: true
  how: 'src/seed.ts: held at seedOutcomes(), lines 30-35 — const known = new Set(fixtureOutcomes.map((outcome)
    => outcome.name));

    const missing = NON_CONCLUSION_OUTCOMES.filter((outcome) => !known.has(outcome.name));

    await store.insertMissingTerms(''outcome'', [...fixtureOutcomes, ...missing]);'
  encoded_at:
  - src/seed.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: 'src/connector-registry/connector-configuration-registry.service.ts: held at heldConfiguration(),
    lines 115-122, and the ConnectorConfiguration shape it returns — return { connector: resolved.connector,
    configuration: resolved.configuration };'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: 'src/connector-registry/connector-configuration-registry.service.ts: held at registerConnector(),
    lines 31-40 — const kept = held.filter((candidate) => candidate.connector !== configuration.connector);

    await this.store.writeConnectorConfigurations([...kept, configuration]);'
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: domain/investigation/evaluation
  conforms: true
  how: "src/investigation/fake-hypothesis-evaluator.adapter.ts: held at the two return statements of evaluate(),\
    \ one for reason `no-data` and one for a decided outcome — if ('reason' in outcome && outcome.reason\
    \ === 'no-data') {\n  return { verdict: outcome.verdict, reason: outcome.reason, citations: outcome.citations\
    \ };\n}\nreturn {\n  ...outcome,\n  usage: ZEROED_USAGE,\n  elapsed_ms: ZEROED_ELAPSED_MS,\n  prompt:\
    \ outcome.prompt ?? PLACEHOLDER_PROMPT,\n};"
  encoded_at:
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
- node: domain/investigation/usage
  conforms: true
  how: 'src/investigation/fake-hypothesis-evaluator.adapter.ts: held at the ZEROED_USAGE constant assigned
    the Usage shape — const ZEROED_USAGE: Usage = { input_tokens: 0, output_tokens: 0 };'
  encoded_at:
  - src/investigation/fake-hypothesis-evaluator.adapter.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/seed.ts: held at nowhere — the fixture's revision content is forwarded to lifecycle.reviseHypothesis,\
    \ which is where the revision is actually held — const revised = await lifecycle.reviseHypothesis({\n\
    \    slug: fixture.slug,\n    hypothesis_name: entry.hypothesis_name,\n    criterion: entry.criterion,\n\
    \    collects: entry.collects,\n    resolution: entry.resolution,\n    subject: fixture.subject,\n\
    \  });"
  encoded_at:
  - src/seed.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: 'src/seed.ts: held at nowhere — the transition is triggered through lifecycle.releaseHypothesisRevision,
    not performed here — await lifecycle.releaseHypothesisRevision(slug, revision.hypothesis_name, revision.revision);'
  encoded_at:
  - src/seed.ts
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: true
  how: 'src/seed.ts: held at nowhere — the file''s only concept-mutating call is a write, no removal path
    exists here to hold or violate the refusal — const concepts = JSON.parse(raw) as readonly Concept[];

    await store.writeConcepts(concepts);'
  encoded_at:
  - src/seed.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: 'src/seed.ts: held at seedOutcomes(), lines 30-35 — const missing = NON_CONCLUSION_OUTCOMES.filter((outcome)
    => !known.has(outcome.name));

    await store.insertMissingTerms(''outcome'', [...fixtureOutcomes, ...missing]);'
  encoded_at:
  - src/seed.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at wellFormedConfiguration()\
    \ and textConfigurationOrThrow(), lines 124-148, and registrationProblems(), lines 169-178 — if (configuration\
    \ === null || Array.isArray(configuration)) {\n  throw new ConnectorConfigurationNotWellFormedError('configuration\
    \ is not a JSON object');\n}\n...\nif (typeof registration.configuration !== 'string') {\n  problems.push('configuration\
    \ is not a plain object');\n}"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at readConnectorConfigurationOrThrow(),\
    \ lines 52-58 — if (!resolution.held) {\n  throw new ConnectorConfigurationNotFoundError(resolution.connector);\n\
    }"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at refuseOrphanedPlaceholders()\
    \ (79-87) and orphanedAcrossAnyCapability() (90-104) — const capabilities = (await this.capabilitiesReader.readCapabilities()).filter(\n\
    \  (capability) => capability.connector === configuration.connector,\n);\nconst orphaned = orphanedAcrossAnyCapability(configuration.configuration,\
    \ capabilities);\nif (orphaned.length > 0) {\n  throw new ConnectorPlaceholderOutsideInputSchemaError(orphaned);\n\
    }"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/integration/removing-a-connector-configuration-is-unconditional
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at removeConnector(),\
    \ lines 42-44 — public async removeConnector(connector: string): Promise<void> {\n  await this.store.deleteConnectorConfiguration(connector);\n\
    }"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/knowledge/a-case-version-is-written-once
  conforms: true
  how: "src/seed.ts: held at nowhere — alreadySeeded() only guards this script's own run against reseeding,\
    \ the invariant itself is enforced by case-lifecycle's own create/release — if (!(await alreadySeeded(connection)))\
    \ {\n    await seedCase(connection);\n  }"
  encoded_at:
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'src/seed.ts: held at nowhere — collects is forwarded from the fixture into reviseHypothesis without
    any count check in this file — collects: entry.collects,'
  encoded_at:
  - src/seed.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/seed.ts: held at nowhere — release is only invoked, the transition lives in the lifecycle
    service — await lifecycle.releaseHypothesisRevision(slug, revision.hypothesis_name, revision.revision);'
  encoded_at:
  - src/seed.ts
- node: rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
  conforms: true
  how: 'src/seed.ts: held at nowhere — seedCase()''s call order happens to satisfy the rule (every placed
    revision is released before the case version is), but the refusal itself is enforced inside lifecycle.release,
    not here — const placed = await placeFixtureHypotheses(lifecycle, fixture, draft.version);

    await releaseManifestedRevisions(lifecycle, fixture.slug, placed);

    await lifecycle.release(fixture.slug, draft.version);'
  encoded_at:
  - src/seed.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: 'src/seed.ts: held at nowhere — the read is only invoked, validation runs inside case-query — await
    createCaseQuery(connection).readCase(CASE_SLUG, CASE_VERSION);'
  encoded_at:
  - src/seed.ts
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  conforms: true
  how: "src/connector-registry/connector-configuration-registry.service.ts: held at refuseOrphanedPlaceholders()\
    \ and orphanedAcrossAnyCapability(), lines 79-104 — the same path as rules/integration/a-connector-placeholder-is-declared-by-its-capability\
    \ — for (const placeholder of orphanedPlaceholders(configurationText, capability.input_schema)) {\n\
    \  orphanedByAnyCapability.add(placeholder);\n}"
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  decided_by: test
  step: test
  proof:
  - src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
unstated:
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  where: the duplicate-name test, lines 319-334 ("never ends up holding one concept name in two rows,
    even when the given array names it twice in one call")
  evidence: '"never ends up holding one concept name in two rows, even when the given array names it twice
    in one call — concepts.name''s own primary key resolves it to exactly one row, carrying the second
    entry''s own values"

    ...

    expect(rows).toEqual([{ ttl: 20, description: ''second entry, in the same call'' }]);'
  cost: Which of two entries naming the same concept in one writeConcepts call survives is a decision
    about how ambiguous input is resolved — a decision the specification makes explicitly elsewhere for
    other ambiguities (first-recorded-value-wins for subject attributes, a refused 500 for a name already
    held twice on read) but never makes for a concept named twice within one registration call. As written,
    "the second entry's own values win" lives only in this test and in whatever SQL upsert produces it;
    the next reader who wants to know what a batch registration guarantees for a repeated name will not
    find the answer in the specification, only in this assertion.
unbound:
- src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
- src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
- src/__tests__/unit/seed.spec.ts
notes: 'Judged by 7 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/post-reconcile-audit-corrections.returns/.

  Certification of domain/glossary/concept did not hold: the auditor answered `partial` — Four things
  are exercised. A concept carries name, accepts, ttl and description. It is held by name: two writes
  under one name leave one row. Writing under a name already held replaces ttl, description and accepts
  whole. The update test and the reconcile test each start from one accepted subject type and write a
  different one, and both check the full accepts array, so a subject type no longer named would show up
  if it were merged back in.


  Several stated parts are not exercised. First, the node declares name, accepts, ttl and description
  as required, and no test offers a concept missing one of them and expects it to be refused. The test
  "answers a concept with an empty accepts array when it currently accepts no subject type" goes the other
  way: it stores a concept with no description and no accepted subject type, and asserts the store returns
  it with description '''' and accepts []. So if required-ness stopped holding, nothing here would fail.


  Second, ttl is declared an integer, and no test offers a non-integer ttl.


  Third, the node says replacement happens "whenever a concept is registered". The offered proof only
  exercises the store''s writeConcepts. Whatever registration path sits above the store is not in the
  offered proof, so a path that merged before writing would pass these tests.


  One ambiguity I did not settle: whether accepts being required and many means at least one subject type.
  The node''s own Responsibility allows a subject type to stop being accepted, and nothing says whether
  the last one may go.


  Two tests prove nothing about this node. "answers no concepts, not a rejection, when no row was ever
  stored under a given name" cannot fail: it checks for a fresh random name that was never written. And
  "removes the named concept and its own accepts declaration..." asserts a concept is deleted. That concerns
  rules/glossary/a-registered-concept-is-never-removed, which this node cites, not this node.. The node
  is decided by reading, and a certification standing on it from an earlier reconciliation is released
  by the bind. The remainder is testable: Each remaining part is one input against one expected result.
  Register a concept with no description, then with no ttl, then with a non-integer ttl, and each time
  expect a refusal that leaves the glossary as it was. Register a concept under a name already held, through
  the registration entry point rather than the store, and expect the ttl and accepts that are read back
  to be exactly what was registered. The accepts required-ness half becomes testable only once someone
  decides whether "required, many" means at least one subject type..

  Certified scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused as
  decided by step `test`: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  (refuses a registration whose call text embeds a Subject-attribute placeholder no capability currently
  registered against that connector declares, as ConnectorPlaceholderOutsideInputSchemaError); src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  (names the orphaned placeholder together with the capability that fails to declare it) would fail if
  the fact stopped holding.

  Staged by a review over files a delivery wrote: every pair a delivery or a hand stamped was judged,
  and a pair was omitted only where a reconciliation''s judgment had cleared it at these very bytes; the
  plan''s node(s) rules/integration/a-connector-placeholder-is-declared-by-its-capability, scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused,
  domain/integration/connector-configuration-registry, domain/investigation/evaluation, domain/glossary/concept,
  rules/glossary/a-registered-concept-is-never-removed were read on every file and answered for, and bound
  from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 12 opened across 4 of 7 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/post-reconcile-audit-corrections.returns/`, which are the evidence behind every entry above.
