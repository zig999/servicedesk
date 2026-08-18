---
title: case-management-http-api — query extensions, listing routes and route registration
summary: 'Reviews the seven tasks this session delivered: three IGlossaryQuery/ICapabilityQuery pagination
  extensions, their three HTTP routes, and the task wiring all nineteen routes into build-app.ts.'
reviewed:
- src/__tests__/integration/factories/diagnose-server.factory.spec.ts
- src/__tests__/integration/http/diagnose-e2e.spec.ts
- src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
- src/__tests__/integration/seed.spec.ts
- src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
- src/__tests__/unit/case/case-query.service.spec.ts
- src/__tests__/unit/case/validate-case-coherence.spec.ts
- src/__tests__/unit/config/env.spec.ts
- src/__tests__/unit/factories/store-wiring.spec.ts
- src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
- src/__tests__/unit/glossary/glossary.service.spec.ts
- src/__tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/http/list-capabilities.routes.spec.ts
- src/__tests__/unit/http/list-concepts.routes.spec.ts
- src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
- src/__tests__/unit/http/read-capability.routes.spec.ts
- src/__tests__/unit/http/read-concept.routes.spec.ts
- src/__tests__/unit/http/read-vocabulary-term.routes.spec.ts
- src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
- src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/capability-registry/capability-query.port.ts
- src/capability-registry/capability-registry.service.ts
- src/config/env.ts
- src/factories/build-app.factory.ts
- src/factories/diagnose-server.factory.ts
- src/glossary/glossary-query.port.ts
- src/glossary/glossary.service.ts
- src/http/build-app.ts
- src/http/dto/list-capabilities.dto.ts
- src/http/dto/list-concepts.dto.ts
- src/http/dto/list-vocabulary-terms.dto.ts
- src/http/list-capabilities.controller.ts
- src/http/list-capabilities.routes.ts
- src/http/list-concepts.controller.ts
- src/http/list-concepts.routes.ts
- src/http/list-vocabulary-terms.controller.ts
- src/http/list-vocabulary-terms.routes.ts
tasks:
- task/capability-registry-http/list-capabilities-query-extension
- task/glossary-query-http/list-concepts-query-extension
- task/glossary-query-http/list-vocabulary-terms-query-extension
- task/capability-registry-http/list-capabilities-route
- task/glossary-query-http/list-concepts-route
- task/glossary-query-http/list-vocabulary-terms-route
- task/case-lifecycle-http/register-routes-in-build-app
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the one captured run (run/register-routes-suite) passed cleanly — there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
coverage:
- criterion: Calling listCapabilities returns every capability currently registered, with its full declared
    contract, paginated per src/types/pagination.ts.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: returns every capability currently registered, whole with its full declared contract, in one
      page
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: windows a page from the middle of a larger set, not just the first page
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: reads the store on every call, answering a capability registered since the previous list rather
      than a remembered one
- criterion: Calling listCapabilities against a registry holding no capabilities returns an empty page
    rather than an error.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: answers a registry holding no capabilities with an empty page rather than an error
- criterion: Calling listConcepts returns every concept currently registered, paginated per src/types/pagination.ts.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers a page of the registered concepts with the full pagination envelope, its page count
      computed from the total and the limit (API-03)
  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers a page from the middle of a larger concept list, windowed by offset and limit rather
      than always starting at the first concept
- criterion: Calling listConcepts against a glossary holding no concepts returns an empty page rather
    than an error.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
    name: answers an empty data array, never an error, for a glossary holding no concepts (API-02)
- criterion: Calling listVocabularyTerms with an existing vocabulary name returns every term that vocabulary
    currently holds, paginated per src/types/pagination.ts.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers a page of a vocabulary with the full pagination envelope, its page count computed from
      the total and the limit (API-03)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: includes both non-conclusion outcomes in the returned page when listing the outcome vocabulary,
      exactly as terms() already seeds them
- criterion: Calling listVocabularyTerms with a vocabulary name the glossary does not recognize is refused
    with the same typed error the existing read-vocabulary-term operation already raises for an unrecognized
    vocabulary.
  state: uncovered
  why: 'Nothing in the test set calls GlossaryService.listVocabularyTerms (or readVocabularyTerm) with
    a vocabulary name outside the five recognized term vocabularies, so the refusal half of this criterion
    is unexercised. Separately, as a fact about the criterion rather than the tests: the source''s own
    comments state that IGlossaryQuery.listVocabularyTerms raises no typed error of its own for an unrecognized
    vocabulary at all — the implementation and proof records both disclose this as a divergence, classing
    it not_applicable (a compile-time-only guarantee with no runtime path to exercise) rather than uncovered;
    the coverage pass''s own vocabulary calls it uncovered on the stricter reading that no test exercises
    it either way. Both readings are in the record for a person to weigh.'
- criterion: A valid request returns a paginated page of every capability currently registered.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
    name: answers 200 with the paginated page of every capability the capability query resolved, for a
      request naming its own offset and limit
- criterion: The response body matches the pagination envelope src/types/pagination.ts defines.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-capabilities.routes.spec.ts
    name: answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse
      declares — data, limit, offset, pageCount and total — nothing more and nothing less
  - file: src/__tests__/unit/http/list-concepts.routes.spec.ts
    name: answers a body carrying exactly the five fields src/types/pagination.ts's PaginatedResponse
      declares — data, limit, offset, pageCount and total — nothing more and nothing less
  why: This exact sentence is the stated criterion of both list-capabilities-route and list-concepts-route;
    one entry covers it for both, since the schema holds coverage by criterion text rather than by task.
- criterion: A valid request returns a paginated page of every concept currently registered.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-concepts.routes.spec.ts
    name: answers 200 with the paginated page of every concept currently registered the glossary query
      resolved, for a request naming its own offset and limit
- criterion: A valid request against a recognized vocabulary returns a paginated page of every term it
    currently holds.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
    name: answers 200 with the paginated page of every term the named vocabulary currently holds, for
      a request naming its own offset and limit
  - file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
    name: resolves a page of the %s vocabulary through listVocabularyTerms, and answers with what it holds
- criterion: A request naming a vocabulary the glossary does not recognize is refused with the status
    status-map assigns.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-vocabulary-terms.routes.spec.ts
    name: answers 400 for a :vocabulary segment naming none of the five term vocabularies, never reaching
      listVocabularyTerms
  why: 'The test fixes the observable status at 400 and would fail if it changed, but the refusal it exercises
    never reaches status-map: the route''s own header comment states this is answered through the same
    plain DTO-validation envelope every malformed offset or limit already does — never a domain typed
    error and never a status-map entry — and errors/status-map.ts defines no entry for an unrecognized-vocabulary
    case at all. Whether 400 is genuinely ''the status status-map assigns'' cannot be confirmed from status-map
    itself; disclosed for a reader to route, not settled here.'
- criterion: build-app.ts declares one convention for registering a route plugin (a list, a loop, or an
    explicit sequence of calls — the implementer's own choice, stated once rather than repeated per route).
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: registers every route plugin through one shared app.register() call site, never one repeated
      per route
  why: The test counts textual occurrences of the literal app.register( call in build-app.ts; it does
    not itself inspect whether the surrounding structure is a list, a loop, or an explicit sequence, only
    that registration happens through exactly one call site.
- criterion: Every route plugin file this initiative delivered by the time this task runs is registered
    through that convention, and a request against each one reaches its own controller rather than answering
    404 for a route that exists in source but was never wired in.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: reaches its own controller rather than answering 404, for the $description route
- criterion: The existing diagnose route's own registration is preserved exactly as it already answers,
    unchanged in shape or behavior.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 200 with the assessment the diagnose call produced, for a request naming an existing
      case, subject, narrative and requester
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers 500 with a generic message, never the rejected call's own error text, when the diagnose
      call itself rejects
findings:
- pass: standard
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: insertTerms(), lines 132-136
  cites: STK-05
  evidence: await connection.query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
  cost: 'the table identifier is spliced into the SQL text via a template literal rather than passed as
    a value, so the invariant this rule states — no value reaches SQL text through concatenation — no
    longer holds generally for this helper; the function''s own signature (table: string) accepts any
    string, so a future call site that forwards a less-trusted name silently defeats the guarantee the
    parameterized-query rule exists to preserve.'
  correction: restrict table to a closed set of the actual table names this helper is ever called with
    (a union type or an internal switch), so the interpolation resolves against a value the compiler pins
    rather than an arbitrary string.
- pass: standard
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: placeFixtureHypotheses(), lines 194-225
  cites: MNT-03
  evidence: "async function placeFixtureHypotheses(\n  lifecycle: CaseLifecycleOperations,\n  fixture:\
    \ CaseFixtureDocument,\n  version: number,\n): Promise<void> {\n  for (const entry of fixture.manifest)\
    \ {\n    const revised = await lifecycle.reviseHypothesis({ ... });\n    await lifecycle.placeHypothesis({\
    \ ... });\n  }\n}"
  cost: this function, together with insertTerms, insertConcepts, insertCapabilities, the CaseFixtureManifestEntry/CaseFixtureDocument
    types, insertFixtureCase, isForeignKeyViolation and deleteTolerantly, is copied verbatim into src/__tests__/integration/http/diagnose-e2e.spec.ts
    rather than shared — the same ~150-line fixture-seeding apparatus exists twice, so a change to how
    the fixture case is authored has to be made in both files.
  correction: extract the fixture-seeding helpers into one shared test-support module both integration
    files import.
- pass: standard
  file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  where: insertTerms(), lines 146-150
  cites: STK-05
  evidence: await connection.query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
  cost: 'the same table-identifier interpolation as diagnose-server.factory.spec.ts''s own insertTerms:
    the value reaching the SQL text is concatenated rather than parameterized, and the function''s table:
    string parameter carries no restriction that would stop a less-trusted value from reaching the same
    interpolation.'
  correction: restrict table to a closed set of the actual table names this helper is ever called with,
    the same correction its duplicate in diagnose-server.factory.spec.ts needs.
- pass: standard
  file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  where: class FakeCapabilityQuery, lines 146-164
  cites: MNT-03
  evidence: "class FakeCapabilityQuery implements ICapabilityQuery {\n  private readonly held = new Map<string,\
    \ Capability>();\n  public hold(capability: Capability): void { this.held.set(capability.concept,\
    \ capability); }\n  public async readCapability(concept: string): Promise<CapabilityResolution> {\n\
    \    const capability = this.held.get(concept);\n    return capability === undefined ? { held: false,\
    \ concept } : { held: true, capability };\n  }"
  cost: the identical class, including its doc comment, already exists in src/__tests__/unit/investigation/evidence-collection-stage.spec.ts;
    a change to how the fake resolves a concept has to be made in every file that copied it.
  correction: move FakeCapabilityQuery into one shared test-support module the investigation spec files
    import, rather than redeclaring it per file.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: class FakeCapabilityQuery, lines 122-138
  cites: MNT-03
  evidence: "class FakeCapabilityQuery implements ICapabilityQuery {\n  private readonly held = new Map<string,\
    \ Capability>();\n  public hold(capability: Capability): void { this.held.set(capability.concept,\
    \ capability); }\n  public async readCapability(concept: string): Promise<CapabilityResolution> {\n\
    \    const capability = this.held.get(concept);\n    return capability === undefined ? { held: false,\
    \ concept } : { held: true, capability };\n  }"
  cost: the same class as evidence-collection-stage.spec.ts's and judgment-stage.spec.ts's own — a third
    copy of the identical fake, so the same fix now has to land in three places instead of one shared
    module.
  correction: import the same shared FakeCapabilityQuery the other investigation specs would use, once
    extracted.
- pass: standard
  file: src/capability-registry/capability-registry.service.ts
  where: pageCountOf(), lines 177-179
  cites: MNT-03
  evidence: "function pageCountOf(total: number, limit: number): number {\n  return limit > 0 ? Math.ceil(total\
    \ / limit) : 0;\n}"
  cost: the header comment above this function names the same formula already living in glossary.service.ts
    and in relational-case-store.repository.ts's own pageCountOf, and restates it a third time rather
    than calling one of them; a future change to how a non-positive limit is handled has three call sites
    to find and update.
  correction: lift the formula into one shared, exported helper and have every listing implementation
    call it.
- pass: standard
  file: src/glossary/glossary.service.ts
  where: pageCountOf(), lines 170-172
  cites: MNT-03
  evidence: "function pageCountOf(total: number, limit: number): number {\n  return limit > 0 ? Math.ceil(total\
    \ / limit) : 0;\n}"
  cost: the same formula as capability-registry.service.ts's own pageCountOf and relational-case-store.repository.ts's
    own, restated here rather than called; a fix applied to one copy is invisible to a reader of the other
    two.
  correction: lift the formula into one shared helper both services (and the relational store) call, rather
    than each restating it.
---

## What it is

The first review of case-management-http-api, over its final seven tasks.

## Notes

The failures pass did not run because the one captured run this review reads (run/register-routes-suite, `npm ci`/`typecheck`/`lint`/`secret-scan`/`test` over the full tree) passed cleanly — there was no failure to diagnose, and no run is stamped on this record for that reason (a review's own `run` field is present only when the failures pass ran). The specification-conformance pass found nothing to report; every domain fact reached is already held by the specification. No standard-presupposed artifact was absent — package.json, tsconfig.json and eslint.config.js all stand. The trace over the target holds 133 drift findings (1 orphaned, 12 moved, 120 code) predating this session's own three bindings; none of the three new bindings this session made are among them, and this is disclosed rather than settled — a fact about the tree, not a finding of this review.
