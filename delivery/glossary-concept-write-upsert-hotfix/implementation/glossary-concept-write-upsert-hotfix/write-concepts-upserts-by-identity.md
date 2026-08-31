---
title: writeConcepts upserts concepts by identity instead of deleting the whole table
summary: RelationalGlossaryStore.writeConcepts now upserts each given concept into "concepts" by its own name and reconciles "concept_accepts" scoped per concept, instead of deleting both tables whole, so PUT /v1/glossary/concepts/:name no longer 500s when some other concept row is permanently referenced by capabilities, investigation_evidence or investigation_evaluation_citations.
task: sha256:1b0564c31a9dc346f19f49a7e8a43f443dacee56ae468e6b1ffe85ecca3f4e8b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/glossary-concept-write-upsert-hotfix-write-concepts-upserts-by-identity-build
files:
- path: src/persistence/relational-glossary-store.repository.ts
  effect: writeConcepts no longer issues DELETE FROM concepts or DELETE FROM concept_accepts against the whole table; it now upserts each given concept into concepts by identity (INSERT ... ON CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description) and reconciles concept_accepts scoped to that concept's own name (DELETE FROM concept_accepts WHERE concept_name = $1, then one insert per accepted subject type), inside the same transaction as before.
- path: src/glossary/glossary-store.port.ts
  effect: writeConcepts docstring now states the upsert-by-identity contract (create or replace in place at the given name, leave every other previously-held concept exactly as it was, never delete a concept row at all) instead of the prior whole-replace contract.
criteria:
- criterion: PUT /v1/glossary/concepts/cpt-ifs-sync criando um concept novo (nome que o glossário ainda não detém), contra um banco onde outro concept já existente tem ao menos uma linha em capabilities, investigation_evidence ou investigation_evaluation_citations citando-o, não retorna 500, e o glossário passa a manter, sob esse nome, exatamente o accepts, o ttl e a description enviados.
  met: true
  how: writeConcepts never deletes a row of concepts; the new name's upsert hits no conflict and inserts exactly the given ttl and description, and concept_accepts for that name is reconciled to exactly the given subject types, while the unrelated referenced concept's row is never touched.
- criterion: Atualizar o ttl, a description ou o accepts de um concept já existente sucede mesmo quando outro concept registrado está referenciado por capabilities, investigation_evidence ou investigation_evaluation_citations, e o glossário passa a manter, sob o nome atualizado, exatamente os valores enviados, substituindo os que estavam ali.
  met: true
  how: the updated concept's own row hits the ON CONFLICT (name) branch and is updated in place; its concept_accepts rows are deleted scoped to its own concept_name and reinserted; the unrelated referenced concept's row is never a DELETE target anywhere in writeConcepts.
- criterion: Atualizar o ttl, a description ou o accepts de um concept cuja própria linha já é referenciada por capabilities, investigation_evidence ou investigation_evaluation_citations sucede sem apagar nem violar essas linhas referenciadas, e o glossário passa a manter, sob esse nome, exatamente os valores enviados.
  met: true
  how: the concepts-table write is an UPDATE-in-place via ON CONFLICT DO UPDATE rather than a delete followed by a fresh insert, so the referenced row's primary key never disappears even momentarily, and every foreign key pointing at it stays satisfied throughout the transaction.
- criterion: Uma linha de concepts referenciada por capabilities, investigation_evidence ou investigation_evaluation_citations nunca é apagada como efeito colateral de escrever um concept de nome diferente.
  met: true
  how: writeConcepts issues zero DELETE statements against concepts; upsertConceptStatement is the only statement it runs against that table, and it is always an INSERT ... ON CONFLICT DO UPDATE, never a DELETE.
- criterion: Atualizar o accepts de um concept substitui só as linhas de concept_accepts desse concept, nunca as de outro concept.
  met: true
  how: deleteConceptAcceptsStatement is always parameterized with WHERE concept_name = $1 for the one concept currently being upserted in the loop, and insertConceptAcceptStatement is likewise always called with that same concept's own name.
- criterion: Registrar um concept sem description continua sendo recusado antes de qualquer escrita, exatamente como antes desta correção.
  met: true
  how: this refusal is raised in GlossaryService.registerConcept (namesNoDescription / ConceptDescriptionRequiredError) before store.writeConcepts is ever called; this delivery does not touch glossary.service.ts, so the refusal path is unmodified and unreached by the store-layer fix.
- criterion: Nenhuma escrita em concepts ou concept_accepts emite mais um DELETE sem filtro de WHERE contra a tabela inteira.
  met: true
  how: the only DELETE writeConcepts issues now is DELETE FROM concept_accepts WHERE concept_name = $1, which always carries a WHERE filter scoped to one concept's own name; there is no unfiltered DELETE against either table.
- criterion: O glossário nunca passa a manter um mesmo nome de concept em duas linhas simultaneamente, em nenhum dos cenários acima.
  met: true
  how: concepts.name is that table's own primary key, unchanged by this delivery, and upsertConceptStatement's ON CONFLICT (name) resolves against exactly that key, so the database itself refuses a second row for one name.
nodes:
- node: contracts/glossary/glossary-authoring
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  - src/glossary/glossary-store.port.ts
  how: register-concept's create-or-replace-at-one-name is exactly what upsertConceptStatement's ON CONFLICT (name) DO UPDATE now does, without a delete-then-reinsert step, so the operation succeeds regardless of what else references a pre-existing concept.
- node: domain/glossary/concept
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: name, accepts, ttl and description are carried through unchanged; name stays the table's own primary key, so the glossary's guarantee that each name exists exactly once is preserved by the database rather than by application logic.
- node: domain/integration/capability
  how: 'honored, not encoded: this delivery never writes to capabilities. capabilities.concept''s foreign key is never at risk because writeConcepts never deletes a concepts row.'
- node: domain/investigation/evidence
  how: 'honored, not encoded: this delivery never touches investigation_evidence, so its concept and concept_description snapshot are never read or rewritten by writeConcepts.'
- node: domain/investigation/citation
  how: 'honored, not encoded: investigation_evaluation_citations is never written or read by writeConcepts; its foreign key to concepts(name) stays satisfied because concepts rows are only ever upserted in place.'
- node: rules/glossary/a-vocabulary-holds-each-name-once
  encoded_at:
  - src/persistence/relational-glossary-store.repository.ts
  how: answers only the store-side half (a name is never held twice), via concepts.name's own primary key together with the ON CONFLICT (name) upsert; the read-side HTTP 500 DuplicateGlossaryNameError clause is unchanged and unreached, recorded as this task's REMAINDER note.
- node: rules/glossary/a-concept-declares-its-description
  how: 'honored, not encoded here: the HTTP 422 ConceptDescriptionRequiredError refusal lives in GlossaryService.registerConcept, a file this delivery does not touch.'
inferences:
- inferred: writeConcepts no longer removes a concept named at a name none of the given concepts holds, rather than reimplementing that removal as a scoped DELETE FROM concepts WHERE name NOT IN (...).
  from: the task's own "What it is" states the fix as an upsert-by-identity replacing the whole delete-and-reinsert, and no specification operation ever asks the store to remove a concept; GlossaryService.registerConcept, the only caller, always passes the full previously-held set plus the new/updated entry, so an upsert-only implementation is behaviorally equivalent for every existing caller while eliminating the risk criterion 4 forbids.
- inferred: concept_accepts is reconciled for every concept in the given array on each writeConcepts call, not only for the one concept a caller is logically authoring.
  from: the repository has no way to tell, from the given array alone, which entry is the one actually changing; the per-item loop shape mirrors the one writeTerms and insertMissingTerms already use in this file.
- inferred: the concepts upsert uses INSERT ... ON CONFLICT (name) DO UPDATE rather than a SELECT-then-branch UPDATE/INSERT.
  from: insertMissingTermStatement, in the same file, already establishes the INSERT ... ON CONFLICT convention for this table's own primary key, and the standard requires parameterized statements through pg with no query builder.
preserved:
- GlossaryService.registerConcept's no-description refusal (ConceptDescriptionRequiredError, HTTP 422) fires before any store write, unchanged.
- The read-side duplicate-name refusal (DuplicateGlossaryNameError, HTTP 500) in GlossaryService's assertUniqueNames, unchanged and untouched.
- 'investigation_evidence.concept_description''s snapshot immutability: writeConcepts never reads or writes investigation_evidence.'
- 'The existing writeConcepts unit tests'' observable statement shapes: an INSERT INTO concepts carrying (name, ttl, description) and one INSERT INTO concept_accepts per accepted subject type, with none emitted where accepts is empty.'
- writeTerms, insertMissingTerms, readConcepts and readTerms are unmodified.
deferred:
- what: GlossaryService.registerConcept's own doc comment still describes writeConcepts as "the store's own whole-replace writeConcepts", language that no longer matches the store's mechanism.
  why: the task names only relational-glossary-store.repository.ts and glossary-store.port.ts; glossary.service.ts is untouched by this task and widening into it would exceed this corrective increment's own cut.
- what: whether ICapabilityStore.writeCapabilities and IConnectorConfigurationStore.writeConnectorConfigurations carry the same latent risk against any table a foreign key might someday point at.
  why: out of this task's objective, which names only RelationalGlossaryStore.writeConcepts; writeConnectorConfigurations is already known (from prior investigation) to still have the table-wide DELETE, but fixing or auditing it is a separate corrective task.
---

## What it is

A correção do mecanismo de escrita do glossário de concepts: writeConcepts passou a fazer
upsert por identidade (name) em concepts, e reconciliação escopada por concept_name em
concept_accepts, em vez de apagar e reinserir as duas tabelas inteiras.

## Notes

UNDERDETERMINED, from the specification — domain/investigation/evidence states that concept_description and fields are an evidence item's own snapshot, held exactly as the glossary held them at collection time and never re-read afterward.
This delivery does not touch investigation_evidence at all, so nothing it wrote could rewrite that snapshot; the gap the note names stays for the test-author to exclude explicitly.

REMAINDER, from the specification — rules/glossary/a-vocabulary-holds-each-name-once also states a read-side refusal (a duplicate-name read answers HTTP 500 reporting DuplicateGlossaryNameError) that this delivery does not answer.
This delivery answers only the store-side half, that a name is never held twice, by relying on concepts.name's own primary key; the read-side clause belongs to the glossary read surface already delivered, not to writeConcepts.
