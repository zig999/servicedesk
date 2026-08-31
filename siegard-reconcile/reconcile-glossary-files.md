---
contract_version: siegard-reconcile/1
title: Reconcile glossary module backend files
summary: 'The glossary module''s four backend files (the store port, the service, the shared vocabulary
  terms, and the relational repository) accumulated commits — most recently
  task/glossary-concept-write-upsert-hotfix''s write-concepts-upserts-by-identity, and before that
  pinned-evidence-semantics''s concept-registration-requires-a-description work — without a rebind.
  The human asked to reconcile this batch first among the project''s outstanding code drift, taking
  the delivered source as correct; the question below is only whether the specification still states
  what it now does.'
target: backend
files:
- path: src/glossary/glossary-store.port.ts
  change: writeConcepts changed from a whole-replace to an upsert-by-name over the concepts table, and
    its doc comment now asserts that a concept the call does not name is never removed
- path: src/glossary/glossary.service.ts
  change: registerConcept now refuses a concept naming no description before any store call, and both
    the read and registration paths default an absent ttl to DEFAULT_CONCEPT_TTL_SECONDS
- path: src/glossary/terms.ts
  change: Concept's description became a required, non-optional field alongside the ttl default constant
- path: src/persistence/relational-glossary-store.repository.ts
  change: writeConcepts persists as an INSERT ... ON CONFLICT (name) DO UPDATE upsert rather than a
    delete-and-reinsert, matching the port's upsert-by-identity change
nodes:
- node: constraints/listings-are-paged
  conforms: true
  how: listVocabularyTerms and listConcepts slice the held set by the caller's already-resolved
    pagination.offset/pagination.limit, returning { data, total, limit, offset, pageCount }.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: glossary-store.port.ts imports only './terms.js' and declares the store's own port interface;
    no framework, driver or client import appears in the file.
  encoded_at:
  - src/glossary/glossary-store.port.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: relational-glossary-store.repository.ts's constructor takes the injected IConnectableQueryable
    connection and every read/write runs through it; no file access anywhere in the file.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: false
  how: 'glossary-store.port.ts''s writeConcepts doc comment asserts that a previously-held concept named
    at a name none of the given concepts holds is never removed by this call — a permanence guarantee
    the specification states for outcome (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case)
    but nowhere for concept — and cites task/glossary-concept-write-upsert-hotfix/write-concepts-upserts-by-identity,
    a plan task that does not outlive its plan. glossary.service.ts''s registerConcept and
    relational-glossary-store.repository.ts''s upsert-by-name statement both match the node''s stated
    create-or-replace shape on their own, but the node as a whole does not settle the permanence fact
    the source now asserts, so it is not cleared for any of the three files that carry it.'
  observed_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: glossary.service.ts declares one method per operation the contract names — readVocabularyTerm,
    readConcept, listVocabularyTerms, listConcepts.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/action
  conforms: true
  how: Handled as an ordinary named vocabulary throughout — terms.ts's Action type alias, glossary.service.ts's
    terms(vocabulary), and relational-glossary-store.repository.ts's VOCABULARY_TABLES entry all carry
    it as a bare name with no action-specific fact stated anywhere.
  encoded_at:
  - src/glossary/terms.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/concept
  conforms: true
  how: terms.ts's Concept type, glossary-store.port.ts's readConcepts/writeConcepts, glossary.service.ts's
    concepts()/registerConcept, and relational-glossary-store.repository.ts's IConceptRow/upsertConceptStatement
    all carry exactly the four declared attributes (name, accepts, ttl, description).
  encoded_at:
  - src/glossary/terms.ts
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/outcome
  conforms: true
  how: terms.ts's Outcome type and NON_CONCLUSION_OUTCOMES, glossary.service.ts's withNonConclusionOutcomes,
    and relational-glossary-store.repository.ts's VOCABULARY_TABLES entry carry the vocabulary and its
    two non-conclusion names consistently.
  encoded_at:
  - src/glossary/terms.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/recipient
  conforms: true
  how: Handled as an ordinary named vocabulary — terms.ts's Recipient type alias, glossary.service.ts's
    terms(vocabulary), and relational-glossary-store.repository.ts's VOCABULARY_TABLES entry, none
    stating a recipient-specific fact.
  encoded_at:
  - src/glossary/terms.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: terms.ts's SubjectAttribute type alias, glossary.service.ts's terms(vocabulary), and
    relational-glossary-store.repository.ts's VOCABULARY_TABLES entry all carry it as an open,
    discovered vocabulary with no attribute name fixed in source.
  encoded_at:
  - src/glossary/terms.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: domain/glossary/subject-type
  conforms: true
  how: terms.ts's SubjectType type alias, glossary.service.ts's accepts field carried unchanged, and
    relational-glossary-store.repository.ts's VOCABULARY_TABLES entry plus concept_accepts'
    subject_type_name column all treat it as a discovered vocabulary.
  encoded_at:
  - src/glossary/terms.ts
  - src/glossary/glossary.service.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: glossary.service.ts's registerConcept guard (namesNoDescription) throws
    ConceptDescriptionRequiredError for an absent or empty description before any store call.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: true
  how: relational-glossary-store.repository.ts's upsertConceptStatement and insertMissingTermStatement
    rely on each table's own name primary key so no name is ever held twice on the write side; the
    read side answers rows as read without contradicting the rule's refusal, which the rule locates
    elsewhere.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: glossary-store.port.ts's insertMissingTerms, glossary.service.ts's withNonConclusionOutcomes,
    terms.ts's NON_CONCLUSION_OUTCOMES, and relational-glossary-store.repository.ts's
    insertMissingTermStatement (INSERT ... ON CONFLICT DO NOTHING) together add only what is missing
    and never delete or rewrite an already-held outcome.
  encoded_at:
  - src/glossary/glossary-store.port.ts
  - src/glossary/glossary.service.ts
  - src/glossary/terms.ts
  - src/persistence/relational-glossary-store.repository.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: terms.ts's SubjectAttribute type alias holds the vocabulary shape the rule's existence check
    draws from; the check itself runs outside this file, which the rule does not require of it.
  encoded_at:
  - src/glossary/terms.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: 'terms.ts''s DEFAULT_CONCEPT_TTL_SECONDS = 60 and glossary.service.ts''s registration.ttl ??
    DEFAULT_CONCEPT_TTL_SECONDS on both the read and registration paths match the node''s default.'
  encoded_at:
  - src/glossary/terms.ts
  - src/glossary/glossary.service.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: glossary.service.ts's registerConcept throws before reading or writing the store, so the
    glossary's held concepts stay unchanged on refusal, matching the scenario's then.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  conforms: true
  how: relational-glossary-store.repository.ts's IConceptRow and readWholeConcepts read a legacy row's
    description back as the empty string, never SQL NULL, matching the scenario's given/then.
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
notes: 'Four specification-conformance-reviewer delegations, one per file, each handed its own
  trace-bound node set plus the 18-node union across this batch as candidates. 17 of 18 nodes clear;
  contracts/glossary/glossary-authoring stays unbound on all three files that carry it, over the
  concept-permanence finding above. Separately, the glossary.service.ts delegation opened
  rules/glossary/a-concept-with-an-empty-description-is-read-as-awaiting-one as a candidate outside
  this batch''s located set — it is bound only to frontend/app/src/routes/glossary-concepts-panel.tsx,
  not to any file in this file set — and reported that glossary.service.ts''s concepts()/readConcept/listConcepts
  hand a legacy concept''s empty description straight through with no distinguishing shape, so the
  read side of that node is unaddressed here. That finding names no file in this set''s located nodes,
  so it changes no entry above; it is recorded here for the next invocation to route rather than
  silently dropped.'
---
