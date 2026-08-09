---
title: Proof for the glossary query
summary: What proves task/published-language/glossary-query, exercising the published IGlossaryQuery contract over a mutable in-memory store for resolution and over the real file store for freshness.
implementation: sha256:abdd98c51bbaf6b812387ca074fd96dab91c07dac877cfc1bb964ce7d40a2384
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/published-language-glossary-query-suite
tests:
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: answers a held vocabulary term exactly as the glossary holds it
    proves: "Reading a term the glossary holds answers that term as the glossary holds it."
    fails_when: readVocabularyTerm stops resolving by name over the current holding, or answers anything other than the held term wrapped as a held resolution
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: reports a term the glossary does not hold as an absence naming what was asked
    proves: "Reading a term the glossary does not hold reports the absence rather than an invented term. — also pinning the implementation's chosen absence form, which the task's advisory notes no specification node fixes"
    fails_when: an unheld name answers a term, raises instead of answering, or the absence stops naming the vocabulary and name that were asked
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: reports any term of an empty vocabulary as the absence
    proves: the empty-collection edge of criterion 2 — a vocabulary holding nothing resolves every name as the absence rather than failing
    fails_when: an empty vocabulary makes the read raise, or answers anything but the absence naming what was asked
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: answers a held concept with its accepted subject types and its ttl
    proves: "Reading a concept answers its accepted subject types and its ttl."
    fails_when: readConcept stops answering the concept's accepts or its ttl as the glossary holds them
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: reports a concept the glossary does not hold as an absence naming what was asked
    proves: criterion 2's absence behavior over the contract's second operation, read-concept
    fails_when: an unheld concept name answers a concept, raises, or the absence stops naming what was asked
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: no longer answers a term the holding no longer carries, even after answering it once
    proves: "A read after the glossary's data changes answers the current holding, never a remembered one. — at the service seam, so a memoization inside GlossaryService is caught without any filesystem"
    fails_when: the service remembers a prior read's holding and answers the replaced term as still held
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: refuses to resolve over a vocabulary holding one name twice rather than picking a copy
    proves: the duplicate edge — the read propagates the vocabulary task's duplicate refusal instead of silently resolving one of the copies
    fails_when: a duplicated vocabulary resolves to one of the copies, or the refusal stops being DuplicateGlossaryNameError
  - file: src/__tests__/unit/glossary/glossary-query.port.spec.ts
    name: lets a failing store read reach the caller instead of answering an absence
    proves: the failing-dependency edge — a store failure is never converted into a held-false resolution, which would be the invented answer criterion 2 forbids
    fails_when: the query catches a store failure and answers an absence or any resolution in its place
  - file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
    name: answers a term added to the data since the previous read
    proves: "A read after the glossary's data changes answers the current holding, never a remembered one. — through createGlossaryQuery and the real file store"
    fails_when: any layer of the real wiring caches the first read, so the term added to the file stays unanswered
  - file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
    name: no longer answers a term removed from the data since the previous read
    proves: the other half of criterion 4 over the real store — a term the file no longer holds is no longer answered
    fails_when: a remembered holding keeps answering a term the file was rewritten without
  - file: src/__tests__/integration/glossary/glossary-query.port.spec.ts
    name: answers a concept's ttl as the data now states it, not as it stood at the previous read
    proves: criterion 4 over read-concept and, jointly, criterion 3 against the real file store
    fails_when: the concept holding is remembered between reads, or the resolved concept stops carrying its accepts and ttl
not_applicable:
  - edge_case: absent input
    why: the contract's two operations take required string parameters, the compiler under STK-01 excludes an absent argument, and no transport boundary is in this task for one to arrive through
  - edge_case: empty-string name
    why: the contract distinguishes no name from any other; an empty string resolves through the same absence branch the absence tests already hold
  - edge_case: a boundary at each end of a stated range
    why: no bound node and no criterion states a range for this read; a ttl passes through as held, and its default and bounds are registration behavior the task's second REMAINDER assigns elsewhere
  - edge_case: an operation against state that forbids it
    why: the read forbids no state; the nearest forbidden holding, a duplicated name, is tested as the propagation of the vocabulary task's refusal
  - edge_case: a dependency that answers slowly
    why: no bound node states a timing guarantee for this synchronous in-process read
  - edge_case: two operations against one subject at once
    why: the contract states no concurrency behavior for the read, and the outcome-seeding write it can pass through belongs to the vocabulary task
untested:
  - resolving an outcome term through the query passes through the seeding terms() performs; that pre-existence is the vocabulary task's behavior, demonstrated by its proof, so nothing here reads the outcome vocabulary at all
  - the sixty-second ttl default surfacing through read-concept — registration behavior this read never exercises, proven at concepts() in the vocabulary task's proof
  - the specific form of the absence answer is pinned only as the implementation chose it; if the analysis later states a form, these tests state the implementation's choice, not the business's
---
## What it is
Eleven tests over two files: the contract's resolution and absence behavior as pure units over a mutable in-memory store, and the freshness criterion through the real wiring — a term added, a term removed and a ttl changed between two reads all answering as the file now stands.

## Notes
The freshness tests are honest rather than passing by construction: the store re-reads its file on every call, and a cache introduced at the service, the factory or the store would fail them.
The absence form the tests pin is the implementation's disclosed inference, not a stated business fact — if the analysis later fixes a form, the tests follow the analysis.
