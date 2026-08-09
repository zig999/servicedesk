---
title: Published glossary-query read
summary: The published IGlossaryQuery contract — readVocabularyTerm and readConcept — provided by the existing glossary holding and wired through the module's factory, answering every read from the store's current records and every absence as typed data.
task: sha256:4cc87881551335b3d10b3a543d45007353e2524f440301d042dcedb9bace2c97
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/published-language-glossary-query-build
files:
  - path: src/glossary/glossary-query.port.ts
    effect: declares the published glossary-query contract as the IGlossaryQuery interface — readVocabularyTerm over the four term vocabularies and readConcept — with TermResolution and ConceptResolution stating a held record or its typed absence carrying what was asked, importing nothing but the domain's own terms module
  - path: src/glossary/glossary.service.ts
    effect: GlossaryService now provides IGlossaryQuery — readVocabularyTerm resolves one term by name against what terms() answers on that call, readConcept resolves one concept by name against what concepts() answers on that call, each answering the typed absence where no held name matches and neither remembering a prior read; terms() and concepts() themselves are unchanged
  - path: src/factories/glossary.factory.ts
    effect: adds createGlossaryQuery(dataDirectory), which wires the published contract over the same file-backed holding and answers the IGlossaryQuery interface alone, so an in-process consumer depends on the contract and never on the service or the store; createGlossary is unchanged
criteria:
  - criterion: Reading a term the glossary holds answers that term as the glossary holds it.
    met: true
    how: readVocabularyTerm reads the named vocabulary through the reused terms() — which reads the store on every call — and answers the matching GlossaryTerm unchanged inside the held:true variant of TermResolution
  - criterion: Reading a term the glossary does not hold reports the absence rather than an invented term.
    met: true
    how: where no held term carries the asked name, readVocabularyTerm answers the held:false variant naming the vocabulary and the name that were asked; nothing constructs a term and nothing raises, so the absence is an ordinary answer a consumer can report
  - criterion: Reading a concept answers its accepted subject types and its ttl.
    met: true
    how: readConcept answers the Concept exactly as the reused concepts() holds it — name, accepts and ttl in seconds, the sixty-second default already applied where a registration stated none — inside the held:true variant of ConceptResolution
  - criterion: A read after the glossary's data changes answers the current holding, never a remembered one.
    met: true
    how: neither GlossaryService nor the published contract holds any cached vocabulary — every read goes through terms()/concepts() to IGlossaryStore, and FileGlossaryStore reads the vocabulary file afresh on each call, so a changed file is answered on the next read
nodes:
  - node: contracts/glossary/glossary-query
    encoded_at:
      - src/glossary/glossary-query.port.ts
      - src/glossary/glossary.service.ts
      - src/factories/glossary.factory.ts
    how: the contract's two operations are IGlossaryQuery's two methods; its published direction is encoded by consumers receiving the interface alone from createGlossaryQuery, and exactly-as-currently-held by every resolution reading through the store on the call that asks
  - node: domain/glossary/subject-type
    encoded_at:
      - src/glossary/glossary-query.port.ts
      - src/glossary/glossary.service.ts
    how: a subject type's one attribute, name, is what readVocabularyTerm resolves by and what the held:true variant answers; the SubjectType value itself stays encoded in the prior delivery's terms.ts, reused rather than redeclared
  - node: domain/glossary/outcome
    encoded_at:
      - src/glossary/glossary-query.port.ts
      - src/glossary/glossary.service.ts
    how: an outcome resolves by name against the holding terms() answers — which already guarantees the two non-conclusion outcomes exist, behavior this read reuses rather than re-encodes
  - node: domain/glossary/action
    encoded_at:
      - src/glossary/glossary-query.port.ts
      - src/glossary/glossary.service.ts
    how: an action resolves by name through readVocabularyTerm, answered exactly as the glossary holds it
  - node: domain/glossary/recipient
    encoded_at:
      - src/glossary/glossary-query.port.ts
      - src/glossary/glossary.service.ts
    how: a recipient resolves by name through readVocabularyTerm, answered exactly as the glossary holds it
  - node: domain/glossary/concept
    encoded_at:
      - src/glossary/glossary-query.port.ts
      - src/glossary/glossary.service.ts
    how: the concept's published identity — the name every consumer uses — is what readConcept resolves by, and the two constraints the glossary guarantees for it, its accepted subject types and its ttl in seconds, are what the held:true ConceptResolution answers
  - node: constraints/the-mvp-persists-to-no-database
    how: honored — the published read adds no dependency and no datastore; every resolution reaches the same plain-JSON FileGlossaryStore through the existing port, and the manifest is untouched
  - node: constraints/the-domain-depends-on-no-infrastructure
    how: honored — glossary-query.port.ts imports only the domain's terms module; the file store enters only inside createGlossaryQuery in the factory, so the contract and its provider stay importable without infrastructure
inferences:
  - inferred: a read that finds no matching term or concept answers a typed absence variant carrying what was asked, rather than raising an error or fabricating a record
    from: the task's advisory note that no node fixes a form for the absence, and criterion 2's own wording, which reads as a resolution's ordinary answer, not a failure
  - inferred: read-vocabulary-term takes the pair vocabulary and name, and read-concept takes the name alone, as request shapes
    from: the contract fixes no request shape; each term node declares name as its only attribute and the four are distinct vocabularies, so a term is identified only by the pair
  - inferred: the contract's synchronous read is encoded as an in-process request-response returning a Promise, not as a non-awaited signature
    from: the holding is reached through the existing async store port, and the contract node distinguishes its synchronous read from messaging rather than prescribing a call convention
  - inferred: GlossaryService provides the published contract directly rather than a separate query class standing between them
    from: the resolution logic is a find-by-name over what terms() and concepts() already answer, so a separate class would exist only to forward two calls; the factory still narrows what a consumer receives to the interface
preserved:
  - GlossaryService.terms() still refuses a duplicated name and still seeds the two non-conclusion outcomes through the store, exactly as the existing unit and factory integration tests exercise it
  - GlossaryService.concepts() still refuses a duplicated name and still answers the sixty-second default ttl where a registration stated none
  - createGlossary(dataDirectory) keeps its signature and wiring, which the factory integration tests call
  - the IGlossaryStore port is unchanged, so the unit tests' in-memory stand-in still implements it
deferred:
  - what: no consumer is wired to createGlossaryQuery yet; case validation consumes this contract when its own task lands.
    why: wiring the consumer belongs to task/case-model/case-coherence-validation, which depends on this one
---
## What it is
The seam the case validation will read through: the published contract as an interface the domain provides, every resolution answered from the store's current records, every absence a typed ordinary answer.
No new module holds state and no new dependency enters the manifest.

## Notes
The absence form is an inference disclosed in its field: no node fixes it, and a typed held-false variant was chosen over an error, because criterion 2 reads absence as an ordinary answer.
The service provides the contract directly — a separate query class would only forward two calls, and the factory already narrows consumers to the interface.
