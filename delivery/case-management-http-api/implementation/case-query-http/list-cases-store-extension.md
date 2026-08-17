---
title: ICaseStore gains listCases
summary: ICaseStore and RelationalCaseStore gain a paginated listCases operation answering every case's
  bare identity, empty stores answering an empty page rather than an error.
task: sha256:faef2c0b16460a3118de8cb0623a593246ca1e638789c14cbc7292ff5c13bee0
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/store-extensions-batch-suite
files:
- path: src/case/case-store.port.ts
  effect: 'declares CaseIdentity ({ slug }) and adds listCases(pagination): Promise<PaginatedResponse<CaseIdentity>>
    to ICaseStore.'
- path: src/persistence/relational-case-store.repository.ts
  effect: implements listCases by reading the total row count of cases and one ordered, limited/offset
    page of slugs through one transaction; helpers listCasesPage, countCases, casesCountSelect, casesPageSelect,
    pageCountOf.
criteria:
- criterion: Calling listCases with no filter returns every case currently held, paginated per src/types/pagination.ts.
  met: true
  how: listCases answers a PaginatedResponse<CaseIdentity> assembled by listCasesPage — data holds this
    page's slugs (ORDER BY slug LIMIT/OFFSET), total/limit/offset/pageCount answer the whole cases table's
    count and the given window.
- criterion: Calling listCases against an empty store returns an empty page rather than an error.
  met: true
  how: 'countCases answers 0 when the COUNT(*) row is absent; casesPageSelect answers no rows against
    an empty cases table; listCasesPage always returns the PaginatedResponse shape (data: [], total: 0,
    pageCount: 0) rather than throwing.'
nodes:
- node: contracts/knowledge/case-query
  how: the contract's own list-cases operation is what listCases answers — a synchronous, paginated read
    of every case the store holds, with no filter.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case
  how: CaseIdentity carries exactly slug, the one attribute of this domain model that is a listing's own
    concern — next_version is deliberately left out.
  encoded_at:
  - src/case/case-store.port.ts
inferences:
- inferred: listCases' page item carries only { slug } (CaseIdentity), never next_version or any other
    attribute.
  from: domain/knowledge/case's own attributes are exactly slug and next_version, and next_version is
    the identity's durable version-assignment counter, not a fact a listing states about each case.
- inferred: listCases reads its total count and its page of slugs through one transaction, the same convention
    assembleVersion already keeps.
  from: the file's own established convention (assembleVersion's header comment) is to run related reads
    that must not disagree through one transaction.
- inferred: pageCountOf answers 0 for a non-positive limit rather than dividing by it or raising.
  from: neither this task's criteria nor pagination.ts states what a non-positive limit answers; this
    is a defensive floor, disclosed rather than silently assumed.
preserved:
- Every existing ICaseStore method's own behavior and signature — listCases is additive only.
- The file's own schema-qualification, parameterized-statement and typed-error conventions.
deferred:
- what: FakeCaseStore in case-query.service.spec.ts lacked listCases as a required member.
  why: extending a test double is a test-author's judgment, not this implementation's.
---

## What it is

A new read-only ICaseStore method, listCases, with no new refusal rule.

## Notes

None.
