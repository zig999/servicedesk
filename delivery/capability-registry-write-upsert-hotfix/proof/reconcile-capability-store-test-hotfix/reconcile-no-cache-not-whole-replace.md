---
title: relational-capability-store test reconciled to upsert-by-identity, not whole-table-replace
summary: Rewrites the one stale assertion in relational-capability-store.repository.spec.ts that expected
  a second write to erase a different identity, and adds one distinct test proving the fresh-read (no-cache)
  guarantee for a capability rewritten under its own identity.
implementation: sha256:7701d10367b25bb12d8a78f860161e5167998a27f13a1256400e3df8bf8eec38
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
tests:
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: leaves capability-a exactly as it was when a different capability, capability-b, is written afterward
  proves: O teste em relational-capability-store.repository.spec.ts que hoje espera que escrever capability-b
    apague capability-a passa a afirmar que ambas as identidades permanecem legíveis após a segunda escrita.
  fails_when: readCapabilities() after writing capability-b answers only capability-b (or omits capability-a),
    which is what would happen again if writeCapabilities regressed to deleting rows outside the identity
    it was given, or if the upsert somehow collided across (name, version) identities.
- file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
  name: answers a rewritten capability with its new value at the very next read, never the value an earlier
    read of the same identity already answered
  proves: 'Um teste distinto prova a garantia de leitura fresca (sem cache) para a MESMA identidade: reescrever
    uma capability já registrada com um valor novo (ex.: outro timeout) e ler de novo responde o valor
    novo, nunca o antigo.'
  fails_when: readCapabilities() after the second writeCapabilities call answers the original timeout
    (5000) instead of the rewritten one (9000) -- which is what any caching of a prior read's result,
    or any failure of the second upsert to actually replace the row's attributes in place, would produce.
not_applicable:
- edge_case: Duplicate (name, version) identities written together in one writeCapabilities call
  why: Already exercised by the existing "rolls the whole write back..." test in this same file (constraints/the-system-persists-to-one-relational-database,
    EDG-05), which this task's own instruction forbids touching; this task's criteria ask only for the
    stale erasure assertion to be corrected and for one distinct fresh-read-same-identity test, neither
    of which concerns a same-call collision.
- edge_case: Concurrent writes against one identity, or a write racing a read
  why: No specification node this task implements, and no criterion of this task, states a concurrency
    guarantee; asserting one here would claim a guarantee nobody stated.
- edge_case: An empty writeCapabilities call, or reading with no rows ever written
  why: Outside this task's scope -- it reconciles one existing assertion and adds one distinct test about
    rewriting an already-registered identity, neither of which touches the empty-input or empty-table
    path, and both are already exercised elsewhere in this file.
untested:
- 'The task''s second criterion -- that no test anywhere in the suite asserts a write to one identity
  erasing a different identity -- is not provable by a dedicated runtime assertion, because there is no
  code artifact for such a test to exercise once the one offending assertion above is rewritten. It is
  confirmed instead by reading the whole file end to end (done as part of this delivery): no other test
  in relational-capability-store.repository.spec.ts writes two identities and then asserts that only one
  of them survives a read. That confirmation is a fact about this file''s current content, not a standing
  guarantee a future edit to the file could not break.'
run: run/reconcile-capability-store-test-hotfix-reconcile-no-cache-not-whole-replace-suite
---

## What it is

A prova de task/reconcile-capability-store-test-hotfix/reconcile-no-cache-not-whole-replace:
o teste órfão em relational-capability-store.repository.spec.ts:251 reconciliado com o
contrato de upsert-por-identidade, mais um teste novo provando leitura fresca para a mesma
identidade.

## Notes

None.
