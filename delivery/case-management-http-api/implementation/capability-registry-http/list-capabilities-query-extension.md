---
title: ICapabilityQuery gains listCapabilities
summary: Extends ICapabilityQuery with a paginated listCapabilities operation, implemented by CapabilityRegistryService
  through in-memory slicing over the store's full read, since ICapabilityStore paginates nothing itself.
task: sha256:a873b2f9cebbad01125bc9f43bf665ec598471bb657f9b6630fe948f2c5daf03
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/list-query-extensions-batch-build-2
files:
- path: src/capability-registry/capability-query.port.ts
  effect: 'Declares listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>>
    on ICapabilityQuery, importing PaginatedResponse/PaginationRequest from ../types/pagination.js, documented
    as answering every registered capability whole, paginated, read through the store on every call and
    never remembered.'
- path: src/capability-registry/capability-registry.service.ts
  effect: Implements listCapabilities on CapabilityRegistryService — reads store.readCapabilities() in
    full, slices it in memory by pagination.offset/pagination.limit, and returns the PaginatedResponse<Capability>
    envelope (data, total, limit, offset, pageCount) via a private pageCountOf helper (0 for a non-positive
    limit); pageCountOf's own doc comment names the MNT-03 divergence it represents explicitly, citing
    the two prior instances of the identical choice.
criteria:
- criterion: Calling listCapabilities returns every capability currently registered, with its full declared
    contract, paginated per src/types/pagination.ts.
  met: true
  how: listCapabilities reads store.readCapabilities() — every Capability the store currently holds, each
    already carrying its full declared contract (name, version, nature, input_schema, output_schema, timeout,
    connector, concept) exactly as registerCapability wrote it, nothing narrowed — and returns it windowed
    by offset/limit inside the PaginatedResponse<Capability> shape src/types/pagination.ts declares, with
    total and pageCount computed from the full held array's own length (API-02, API-03).
- criterion: Calling listCapabilities against a registry holding no capabilities returns an empty page
    rather than an error.
  met: true
  how: 'An empty held array slices to data: [] with total: 0 and pageCount 0 (via pageCountOf), never
    throwing — the same empty-array-in, empty-page-out path this store''s other reads already exercise,
    satisfying API-02 without a distinct branch for the empty case.'
nodes:
- node: contracts/integration/capability-registry
  how: The contract's operations list names read-capability and list-capabilities; ICapabilityQuery now
    declares both, and CapabilityRegistryService implements both against the same store, read fresh on
    every call and never remembered, matching the contract's description of the synchronous read the registry
    offers.
  encoded_at:
  - src/capability-registry/capability-query.port.ts
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/capability
  how: listCapabilities answers each held Capability whole — every attribute the domain model requires
    (name, version, nature, input_schema, output_schema, timeout, connector, concept) — sourced from the
    same store-held records registerCapability already wrote to that same contract; this task adds no
    new attribute and narrows none of the existing ones when listing.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
inferences:
- inferred: A non-positive limit answers pageCount 0 rather than an error or Infinity.
  from: Neither this task's criteria nor src/types/pagination.ts states what a non-positive limit answers;
    this mirrors the identical inference already made twice in this codebase for the identical shape of
    computation — relational-case-store.repository.ts's own pageCountOf (for every SQL-paged listing)
    and glossary.service.ts's own pageCountOf (for listVocabularyTerms/listConcepts) — so the same floor
    is applied a third time rather than invented differently here.
divergences:
- cites: MNT-03
  file: src/capability-registry/capability-registry.service.ts
  departure: 'pageCountOf''s arithmetic (limit > 0 ? Math.ceil(total / limit) : 0) is restated as a third
    private, unexported module-level function rather than called from either of the two places it already
    exists (relational-case-store.repository.ts, glossary.service.ts).'
  why: Both existing pageCountOf functions are private and unexported inside modules this task's file
    set does not reach — one in the persistence layer, one in an unrelated domain service — so calling
    either would require exporting it across a layer boundary this task's scope does not open, or lifting
    it into a new shared module neither this task nor its depends_on (pagination-types) declares as an
    artifact to produce. glossary.service.ts's own list-vocabulary-terms-query-extension task already
    made and disclosed the identical departure for the identical reason; this is the same choice made
    a second time rather than a new one.
preserved:
- ICapabilityQuery.readCapability and CapabilityRegistryService.registerCapability/readCapability's existing
  behavior — one-to-one concept resolution, contract-completeness and read-only refusals, and the duplicate-answer
  refusal — none of which this task's addition of listCapabilities touches or reorders.
deferred:
- what: Centralizing the now-three-times-duplicated pageCountOf arithmetic behind one shared, exported
    helper.
  why: Would require touching relational-case-store.repository.ts and/or glossary.service.ts, both outside
    this task's file set and belonging to other tasks' delivery records; doing so here would widen this
    task rather than complete it. Left as a standing MNT-03 departure, disclosed identically at all three
    sites.
---

## What it is

A new read-only ICapabilityQuery method, listCapabilities, with no new refusal rule.

## Notes

The MNT-03 divergence (pageCountOf duplicated a third time) is disclosed above and in the source's own doc comment. Several other test files (case-query.service.spec.ts, validate-case-coherence.spec.ts, read-capability.routes.spec.ts, and four investigation/*.spec.ts files) needed a minimal listCapabilities stub added to their own ICapabilityQuery fakes/doubles purely to keep compiling against the widened interface — that mechanical fix is the test-author's, recorded in this task's proof.
