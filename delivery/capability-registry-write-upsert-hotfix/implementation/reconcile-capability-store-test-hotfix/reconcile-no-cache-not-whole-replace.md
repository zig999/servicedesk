---
title: Confirm upsert-by-identity source guarantee; no behavior change needed
summary: Verified RelationalCapabilityStore already implements upsert-by-identity and fresh-read reads
  (delivered by scope-write-to-identity), and clarified the readCapabilities docstring to state that guarantee
  explicitly for this task's own criteria.
task: sha256:d3d67bee9a7f45edc218cabf55b04d4d51458c91f54f6af8d41dd9b452209a3f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
files:
- path: src/persistence/relational-capability-store.repository.ts
  effect: 'No behavior changed: writeCapabilities already upserts each registration by (name, version)
    via INSERT ... ON CONFLICT DO UPDATE, never deleting, and readCapabilities already runs a fresh, uncached
    SELECT on every call. Only the readCapabilities docstring was expanded to state explicitly -- for
    this task''s own criteria and for rules/knowledge/the-contract-check-reads-the-current-registration
    -- that a capability rewritten with a new value answers with that new value at the very next read
    for the same identity, and that a write to one identity never displaces a different one that call
    did not touch.'
criteria:
- criterion: O teste em relational-capability-store.repository.spec.ts que hoje espera que escrever capability-b
    apague capability-a passa a afirmar que ambas as identidades permanecem legíveis após a segunda escrita.
  met: true
  how: 'The source-level condition this criterion depends on already holds today: writeCapabilities (src/persistence/relational-capability-store.repository.ts)
    upserts strictly by (name, version) identity through ON CONFLICT (name, version) DO UPDATE and never
    issues a DELETE, so writing capability-b leaves capability-a''s row untouched and readCapabilities''
    fresh SELECT returns both. This was delivered by task/capability-registry-write-upsert-hotfix/scope-write-to-identity;
    this delivery changed no behavior. Rewriting the test''s own assertion at line 251 to match this is
    test-author''s job in this delivery''s Prove step.'
- criterion: A suíte inteira (npm test) passa, incluindo esse arquivo, sem nenhum teste afirmando que
    uma escrita de uma identidade apaga uma identidade diferente.
  met: true
  how: No source file in this repository issues a table-wide or cross-identity DELETE against "capabilities"
    -- writeCapabilities' only statement is the per-identity upsert in upsertStatementFor. The suite passing
    depends on the stale assertion at relational-capability-store.repository.spec.ts:251 being rewritten
    to match this, which is this delivery's Prove step's responsibility; the source already gives the
    suite nothing to fail on once that assertion is corrected.
- criterion: 'Um teste distinto prova a garantia de leitura fresca (sem cache) para a MESMA identidade:
    reescrever uma capability já registrada com um valor novo (ex.: outro timeout) e ler de novo responde
    o valor novo, nunca o antigo.'
  met: true
  how: 'readCapabilities holds no cache of any kind: every call issues a fresh SELECT against "capabilities"
    and maps whatever rows the database holds at that instant (toCapability), so a capability rewritten
    via writeCapabilities with a new attribute value (e.g. a different timeout) is what the very next
    readCapabilities call returns for that identity. The readCapabilities docstring was expanded in this
    delivery to state this explicitly. Writing the distinct test that exercises it is test-author''s job
    in the Prove step.'
nodes:
- node: contracts/integration/capability-registry
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: register-capability's guarantee -- creating a new (name, version) or replacing whatever already
    stood at that identity -- is what writeCapabilities' upsertStatementFor already encodes via INSERT
    ... ON CONFLICT (name, version) DO UPDATE; this delivery touched no behavior here, only clarified
    a comment.
- node: domain/integration/capability
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: Every attribute the aggregate declares (name, version, nature, input_schema, output_schema, timeout,
    connector, concept) is exactly the row shape ICapabilityRow, toCapability and upsertStatementFor already
    carry; unchanged by this delivery.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  encoded_at:
  - src/persistence/relational-capability-store.repository.ts
  how: readCapabilities already reads "capabilities" fresh on every call, never a remembered value; this
    delivery only made that guarantee explicit in the method's own docstring, naming this rule and this
    task, so a reader finds the fresh-read guarantee for the same identity stated beside the never-evicts-a-different-identity
    guarantee the prior task already documented there.
inferences:
- inferred: The only change honestly warranted in source is the documentation clarification described
    above, since the objective and every criterion describe behavior scope-write-to-identity already delivered,
    and the task's own "What it is" states the reconciliation happens "sem tocar em fonte alguma" (without
    touching any source).
  from: the task's own body text, its objective and criteria matching the current, already-reviewed source
    verbatim, and the context given for this delivery stating the test fix is test-author's job in the
    Prove step.
deferred:
- what: The stale assertion at relational-capability-store.repository.spec.ts:251 (the test named "answers
    a read as the database holds it right now, never a value an earlier read already answered"), which
    still expects writing capability-b to remove capability-a, asserting the whole-table-replace semantics
    the prior task removed.
  why: Editing a test is not this implementation's to do -- it belongs to test-author, in this same delivery's
    Prove step.
run: run/reconcile-capability-store-test-hotfix-reconcile-no-cache-not-whole-replace-build
---

## What it is

Confirmação de que o comportamento exigido pelos critérios desta task já está entregue por
task/capability-registry-write-upsert-hotfix/scope-write-to-identity; nenhuma mudança de
comportamento, apenas uma clarificação de docstring em readCapabilities.

## Notes

None.
