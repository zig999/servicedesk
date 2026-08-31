---
title: Proof for write-concepts-upserts-by-identity
summary: Tests proving RelationalGlossaryStore.writeConcepts now upserts by identity instead of deleting concepts/concept_accepts whole, at both the statement-mechanics level (stand-in connection) and the real-foreign-key level (real database), plus the wire-level no-description refusal on both the create and replace paths.
implementation: sha256:c563f3a150ab175ce7ccd758e1128ed6622c68492471cccaa2cad116ac0eafcf
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/glossary-concept-write-upsert-hotfix-write-concepts-upserts-by-identity-suite-4
tests:
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given names either — no matter how many concepts are given
  proves: criterion 4 ('Uma linha de concepts referenciada por capabilities, investigation_evidence ou investigation_evaluation_citations nunca é apagada como efeito colateral de escrever um concept de nome diferente.'), criterion 7's concepts half ('Nenhuma escrita em concepts ou concept_accepts emite mais um DELETE sem filtro de WHERE contra a tabela inteira.'), and the implementation's own inference that writeConcepts no longer removes a concept named at a name none of the given concepts holds.
  fails_when: writeConcepts issues any DELETE statement whose text names concepts, whether unfiltered or scoped to the given names/NOT IN a list.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: runs exactly one statement against concepts per given concept, always the same upsert-by-identity INSERT ... ON CONFLICT (name) DO UPDATE, never a SELECT or any other form
  proves: the concepts-write half of criteria 1–3, and the implementation's own inference that the concepts upsert uses INSERT ... ON CONFLICT (name) DO UPDATE rather than a SELECT-then-branch UPDATE/INSERT.
  fails_when: writeConcepts issues a SELECT against concepts, issues more than one statement per given concept against that table, or the upsert's own SQL text departs from the given INSERT ... ON CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description shape.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: reconciles concept_accepts once per given concept, each one's own DELETE and INSERTs carrying only that concept's own name — for every concept in the given array, not only the first
  proves: criterion 5 ('Atualizar o accepts de um concept substitui só as linhas de concept_accepts desse concept, nunca as de outro concept.'), criterion 7's concept_accepts half, and the implementation's own inference that concept_accepts is reconciled for every concept in the given array on each writeConcepts call.
  fails_when: a second (or later) concept in the given array is not reconciled at all, a concept_accepts DELETE or INSERT for one concept carries a different concept's own name, or a concept_accepts DELETE loses its WHERE concept_name = $1 filter.
- file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
  name: issues no statement referencing investigation_evidence, even when a given concept's description differs from whatever was stored before
  proves: the task's own UNDERDETERMINED Notes entry (domain/investigation/evidence's concept_description snapshot immutability) — excludes exactly the candidate implementation the Notes name, one that also rewrites investigation_evidence.concept_description when the cited concept's own description changes.
  fails_when: writeConcepts issues any statement whose text names investigation_evidence.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: creates a concept at a brand-new name without failing, and leaves a different, already-held concept — permanently referenced by a capability — exactly as it was, even though that referenced concept is not named anywhere in this call
  proves: criterion 1 (create at a new name does not 500 even though another existing concept is referenced by capabilities, and the glossary holds exactly the given accepts/ttl/description under the new name) and criterion 4, reproduced against a real database with a real capabilities.concept foreign key.
  fails_when: the call raises (a real foreign-key violation — the original bug), the referenced concept's own row is altered or missing afterward, or the new concept's own held values differ from what was given.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: updates two already-held concepts in one call — each one's own row permanently referenced by its own capability — replacing each one's ttl, description and accepts exactly with the given values, without failing and without breaking either capability's own foreign key
  proves: criterion 2 (updating an already-existing concept succeeds even though another registered concept is referenced) and criterion 3 (updating a concept whose own row is itself referenced succeeds without deleting or violating that reference), together, against a real database.
  fails_when: the call raises, either concept's own held values after the call differ from what was given, or either capability row disappears or ends up referencing a name no concept holds.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: reconciles one concept's own concept_accepts rows through writeConcepts without ever touching a different concept's own rows, even though that other concept shares the same subject type
  proves: criterion 5, at the real-database level.
  fails_when: the untouched concept's own accepts change or disappear as a side effect of reconciling the changed concept's own accepts.
- file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
  name: never ends up holding one concept name in two rows, even when the given array names it twice in one call
  proves: criterion 8 ('O glossário nunca passa a manter um mesmo nome de concept em duas linhas simultaneamente, em nenhum dos cenários acima.'), at the real-database level.
  fails_when: the table ends up holding more than one row for that name, or the surviving row's values are not the second (last) entry's given values.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: leaves the already-held concept exactly as it was when a registration naming no description targets that very same, already-held name
  proves: criterion 6 on the replace-at-an-existing-name path specifically — the gap the task's own Notes name, since every pre-existing test of this refusal only ever targeted a brand-new name.
  fails_when: registerConcept writes to the store (changing the already-held concept) before, or instead of, throwing ConceptDescriptionRequiredError when the request targets an already-held name with no description.
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 422 reporting a ConceptDescriptionRequiredError when a request creates a concept at a brand-new name with no description
  proves: criterion 6's own stated outcome, on the create-at-a-new-name path, observed at the wire through the real GlossaryService and the real error handler.
  fails_when: the wire answers anything other than HTTP 422 with a ConceptDescriptionRequiredError code for this request.
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 422 reporting a ConceptDescriptionRequiredError when a request replaces an already-held concept at its own name with no description
  proves: criterion 6's own stated outcome, on the replace-at-an-existing-name path.
  fails_when: the wire answers anything other than HTTP 422 with a ConceptDescriptionRequiredError code for this request.
not_applicable:
- edge_case: writeConcepts called with an empty array
  why: no caller in this codebase ever invokes it that way — GlossaryService.registerConcept always appends at least the concept being registered — and the loop's own behavior for zero iterations is unchanged by this task's fix; no criterion states behavior for it.
- edge_case: a driver failure during writeConcepts' own upsert or accepts-reconciliation statements
  why: wrapped and rolled back through the same runInTransaction/raiseWriteFailure mechanism writeTerms already uses, already proven generically by this same unit spec file's existing writeTerms failure test; this task changes which statements run, never that wrapping.
- edge_case: two concurrent PUT requests registering the same concept name at once
  why: GlossaryService.registerConcept's own read-then-write orchestration is a service-level lost-update concern that predates this task and is untouched by it; INSERT ... ON CONFLICT (name) DO UPDATE already serializes correctly at the database level regardless of concurrency, which is not a new guarantee this task introduces.
untested:
- "The literal end-to-end reproduction of the bug report as one continuous HTTP request against a live server and a real database is not exercised as a single test — it is decomposed into its two established halves (the store's own foreign-key safety proven directly against a real database, bypassing HTTP; the wire's own 422 mapping proven through HTTP against an in-memory stand-in store, bypassing the real database), matching every sibling route's own existing convention in this codebase. No single test observes 'the HTTP response is not 500' against a real database holding the referencing row, in one request."
---

## What it is

Os testes que provam a correção de writeConcepts: mecânica de statements (unit, conexão de
mentira), segurança real de foreign key (integration, banco real), e a recusa por description
ausente nos dois caminhos (criar e substituir).

## Notes

Três execuções anteriores desta suíte falharam antes desta: run-1 e run-2 falharam no passo de
lint (excesso de linhas em uma função de teste, depois prefer-const causado pela própria
extração de helper) e foram corrigidas no próprio arquivo de teste sem alterar o que qualquer
teste prova. run-3 falhou no passo suite (test) por ausência de `.env.test` no worktree — causa
`setup`, diagnosticada pelo failure-diagnostician: o processo Node nunca chegou a carregar o
vitest, então nada sobre a mudança foi exercitado. `.env.test` é ignorado pelo git e não existe
neste worktree por não ser copiado pelo `git worktree add`; foi copiado do checkout principal
antes de run-4, que passou.
