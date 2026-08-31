---
contract_version: siegard-reconcile/1
title: Attribute the concept-permanence fact to its new node — glossary.service.ts
summary: 'Second round of reconcile-glossary-files.md, after /analyse wrote
  rules/glossary/a-registered-concept-is-never-removed to state the concept-permanence fact
  reconcile-glossary-files.md found no node held. glossary.service.ts alone: its own trace-bound
  node set plus the new node as a named candidate, all still taken as correct, unchanged since the
  first round.'
target: backend
files:
- path: src/glossary/glossary.service.ts
  change: unchanged since reconcile-glossary-files.md
nodes:
- node: constraints/listings-are-paged
  conforms: true
  how: listVocabularyTerms and listConcepts slice the held set by the caller's already-resolved
    pagination.offset/pagination.limit, returning { data, total, limit, offset, pageCount }.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: registerConcept filters out exactly the entry sharing the registered name and writes every
    other held concept back in the same call, matching create-at-a-new-name-or-replace-in-place.
    The batch shape is not this file's own fact; it is rules/glossary/a-registered-concept-is-never-removed's.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: 'readVocabularyTerm, readConcept, listVocabularyTerms and listConcepts each match a
    declared operation, answering an unheld name as "held: false" data at this layer per
    rules/glossary/a-glossary-read-by-an-unheld-name-is-refused''s own permission.'
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/action
  conforms: true
  how: handled as an ordinary named vocabulary via terms(), no action-specific logic needed or
    present.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/concept
  conforms: true
  how: concepts()/registerConcept build { name, accepts, ttl, description } per registration,
    matching the node's four required attributes exactly.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/outcome
  conforms: true
  how: withNonConclusionOutcomes adds the two non-conclusion outcomes through the port's additive
    insertMissingTerms primitive.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/recipient
  conforms: true
  how: handled as an ordinary named vocabulary via terms(), no recipient-specific logic needed or
    present.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: handled as an ordinary named vocabulary via terms(), no subject-attribute-specific logic
    needed or present.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/subject-type
  conforms: true
  how: handled via terms() and concepts()/registerConcept's accepts field, carried unchanged.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: registerConcept's namesNoDescription guard throws ConceptDescriptionRequiredError for an
    absent or empty description before any store call.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: withNonConclusionOutcomes inserts only the missing outcomes through insertMissingTerms and
    never writes or drops an already-held one.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: 'concepts()/registerConcept carry ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS on
    both paths, matching the node''s default.'
  encoded_at:
  - src/glossary/glossary.service.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: registerConcept throws before reading or writing the store, so the glossary's held concepts
    stay unchanged on refusal.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/glossary/a-registered-concept-is-never-removed
  conforms: true
  how: 'registerConcept''s `kept = held.filter((candidate) => candidate.name !== concept.name)`
    removes exactly the entry the call replaces and writes every other held concept back in the
    same call — the node''s replace, never a removal of a concept the call does not name. Named as
    a candidate: this node was written by /analyse after this file was last judged, is not yet
    bound to anything, and is read here fresh rather than from memory.'
  encoded_at:
  - src/glossary/glossary.service.ts
notes: One specification-conformance-reviewer delegation over this one file (second round for this
  batch), handed its own 13-node trace-bound set plus rules/glossary/a-registered-concept-is-never-removed
  as a named candidate (written since the first round, never bound). All 14 clear. Filed separately
  from reconcile-glossary-concept-permanence-citations.md, whose two files' delegations found
  citation and scope findings against some of the same nodes bound elsewhere — folding this file's
  clean answer into that record would have withheld its own clearance over an unrelated file's
  gap. A second, unrelated finding this file's delegation returned — against
  rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one, a node bound only to
  frontend/app/src/routes/glossary-concepts-panel.tsx and not to any file in this batch — changes no
  entry above and is not recorded here a second time; reconcile-glossary-files.md's own notes
  already carry it.
---
