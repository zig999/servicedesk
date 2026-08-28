---
title: Proof for the writeCapabilities upsert-by-identity hotfix
summary: Reconciles the capability-store unit and integration specs with the new upsert-by-identity mechanics
  and adds a real, foreign-key-backed reproduction of the original DELETE-triggered 23503 failure, proving
  all four criteria.
implementation: sha256:d89822d910402b4a13c5166c938f01048fc65c5fd6f95bb50ae9b8d0693a71b3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
tests:
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: upserts each given capability by its own (name, version) identity, inside one transaction, and
    never sends a DELETE
  proves: Nenhuma escrita em capabilities emite mais um DELETE sem filtro de WHERE contra a tabela inteira.
  fails_when: writeCapabilities issues any DELETE statement for a non-empty batch, or fails to issue one
    INSERT ... ON CONFLICT (name, version) DO UPDATE per given capability with that capability's own params,
    or does not wrap the batch in exactly one BEGIN/COMMIT.
- file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
  name: sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty set
  proves: Nenhuma escrita em capabilities emite mais um DELETE sem filtro de WHERE contra a tabela inteira
    -- o caso de borda de conjunto vazio do mesmo critério.
  fails_when: writing an empty capabilities array sends any statement besides BEGIN and COMMIT, in particular
    a DELETE.
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: rolls the whole write back and leaves the table's earlier content untouched, when a later upsert
    in the same batch violates a real constraint
  proves: EDG-05 e constraints/the-system-persists-to-one-relational-database, como preservado no registro
    de implementação -- substitui o teste obsoleto de duas linhas colidindo que o mesmo registro sinalizou
    como não forçando mais uma violação real de restrição sob o novo ON CONFLICT DO UPDATE por identidade.
  fails_when: a NOT NULL violation partway through a two-item batch leaves the batch's earlier, otherwise-valid
    upsert committed, or the previously-held row is altered or missing afterward.
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: updates a capability already referenced by investigation_evidence without failing, and the reference
    still resolves to the updated identity afterward
  proves: PUT /v1/capabilities/perfil-mobile-tecnico-reader/1.0.0 com um input_schema alterado, contra
    um banco onde essa identidade já tem ao menos uma linha em investigation_evidence citando-a, responde
    200 com a capability atualizada, nunca 500. -- a reprodução direta, contra um banco real e uma FK
    real, do modo de falha original.
  fails_when: writeCapabilities throws (in particular a real Postgres 23503 from a reintroduced table-wide
    DELETE) when re-registering an identity a stored investigation_evidence row already cites, or the
    capability's own row is not updated to the new value, or the investigation_evidence row's own capability_name/capability_version
    no longer resolves to that identity afterward.
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: registers a brand-new identity while a different capability remains referenced by investigation_evidence,
    leaving the referenced row exactly as it was
  proves: Registrar uma capability em uma identidade (name, version) nova sucede mesmo quando outra capability
    já registrada está referenciada por investigation_evidence. e Uma linha de capabilities referenciada
    por investigation_evidence nunca é apagada como efeito colateral de escrever uma capability de identidade
    diferente.
  fails_when: registering the brand-new identity throws while the different, referenced identity is held,
    or the referenced identity's row is altered, missing, or the newly registered identity fails to persist.
not_applicable:
- edge_case: a boundary at each end of a stated numeric range
  why: writeCapabilities takes an array of whole Capability records with no bounded numeric input of its
    own; no criterion or node this task implements states a range.
- edge_case: an empty collection where one comes back
  why: readCapabilities (the read side) is untouched by this task and its empty-answer behavior is already
    proven by this file's own pre-existing tests; this task's own change is confined to the write path.
- edge_case: an operation attempted against state that forbids it
  why: the store layer enforces no state-dependent refusal of its own -- contract-completeness, well-formed-schema,
    read-only-nature and one-concept-one-capability refusals all live above the store in capability-registry.service.ts,
    untouched by this task and already proven by this file's own pre-existing, unmodified tests.
- edge_case: a dependency that fails or answers slowly
  why: already proven, and unaffected by the upsert-mechanism change, by this file's own pre-existing,
    unmodified unit test "raises this store's own typed error, carrying the driver failure as its cause,
    and rolls back, when the write is refused" -- the failure-wrapping and rollback path this task did
    not touch.
- edge_case: two operations against one subject at once
  why: no criterion or specification node this task implements states concurrent-write behavior for two
    simultaneous writers to one identity; asserting one would claim a guarantee nobody made.
untested:
- 'writeCapabilities given two entries sharing one (name, version) identity within the same call: under
  the new per-identity ON CONFLICT DO UPDATE, the second entry''s own upsert now resolves against the
  row the first entry just inserted in the same transaction, rather than raising the uniqueness violation
  the removed delete-then-insert mechanics did. Neither the task''s four criteria nor the implementation
  record''s own inferences state which of the two given values should be held afterward, so this record
  leaves that outcome unproven rather than asserting a behavior nobody decided.'
- The literal HTTP contract of criterion 1 -- a PUT /v1/capabilities/:name/:version request handled by
  Fastify, over a real database, answering 200 -- is not exercised end to end. Since this delivery's own
  fix is entirely inside RelationalCapabilityStore and the route/controller are unchanged, the reproduction
  here is proven one layer below the transport boundary -- directly against the store the bug and the
  fix both live in -- rather than through an actual HTTP request/response cycle.
divergences:
- cites: MNT-03
  file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  departure: Duplicates, rather than imports, the subject_types/outcomes/actions/recipients/cases/case_versions
    fixture-row SQL relational-investigation-store.repository.spec.ts's own insertFixtureRows already
    establishes, narrowed to exactly what investigations and investigation_evidence require for this file's
    own reproduction tests.
  why: A spec file's own fixture helpers are private to that file and are not exported for a sibling spec
    file to import; importing them would couple two independent test files' own module-level state across
    files, which this project's one-file-per-unit test boundary (TST-04) does not contemplate. Duplicating
    the minimal SQL needed keeps this file self-contained and independently runnable, matching every other
    integration spec in this project.
run: run/capability-registry-write-upsert-hotfix-scope-write-to-identity-suite-3
---

## What it is

A prova de task/capability-registry-write-upsert-hotfix/scope-write-to-identity: os testes
que reconciliam o store com o upsert-por-identidade e reproduzem a falha original de FK.

## Notes

O primeiro `run` capturado sob esta task (`run/capability-registry-write-upsert-hotfix-scope-
write-to-identity-suite`) ficou vermelho por causa `setup` — `.env.test` ausente na worktree
(diagnosticado; arquivo local copiado). O segundo (`-suite-2`) ficou vermelho por causa `test`
num teste pré-existente de fora desta task
(`relational-capability-store.repository.spec.ts:251`), pertencente a
`task/relational-stores/capability-store` sob a iniciativa fechada `relational-persistence` —
reconciliado por `task/reconcile-capability-store-test-hotfix/reconcile-no-cache-not-whole-
replace`, sob esta mesma iniciativa. O terceiro (`-suite-3`) rodou depois dessa reconciliação
e passou inteiro; é o run que este proof cita.
