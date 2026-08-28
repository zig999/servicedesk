---
title: relational-capability-store test asserts upsert-by-identity, not whole-table-replace
summary: Corrige a asserção de src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts:251
  para provar leitura fresca por chamada e upsert por identidade, em vez do whole-table-replace que o
  incremento anterior removeu.
objective: 'O teste de RelationalCapabilityStore em relational-capability-store.repository.spec.ts prova
  exatamente o que writeCapabilities e readCapabilities garantem hoje: uma leitura responde o estado do
  banco a cada chamada (nunca um valor de uma leitura anterior), e escrever uma identidade nova nunca
  apaga uma identidade diferente já registrada.'
criteria:
- O teste em relational-capability-store.repository.spec.ts que hoje espera que escrever capability-b
  apague capability-a passa a afirmar que ambas as identidades permanecem legíveis após a segunda escrita.
- A suíte inteira (npm test) passa, incluindo esse arquivo, sem nenhum teste afirmando que uma escrita
  de uma identidade apaga uma identidade diferente.
- 'Um teste distinto prova a garantia de leitura fresca (sem cache) para a MESMA identidade: reescrever
  uma capability já registrada com um valor novo (ex.: outro timeout) e ler de novo responde o valor novo,
  nunca o antigo.'
implements:
- contracts/integration/capability-registry
- domain/integration/capability
- rules/knowledge/the-contract-check-reads-the-current-registration
sources:
- intake/reconcile-capability-store-test-scope.md
---

## What it is

A reconciliação da asserção de relational-capability-store.repository.spec.ts com o contrato
de upsert-por-identidade já declarado, sem tocar em fonte alguma: o comportamento já está
correto, entregue por task/capability-registry-write-upsert-hotfix/scope-write-to-identity.

## Notes

None.
