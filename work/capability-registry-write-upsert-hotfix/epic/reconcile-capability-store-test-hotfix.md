---
title: Reconcile capability store test hotfix
summary: A tarefa corretiva única que corrige a asserção de relational-capability-store.repository.spec.ts
  que ainda afirma o whole-table-replace removido pelo hotfix anterior.
rationale: Um incremento corretivo não corta epic algum por survey/decomposição — este é o contêiner estrutural
  que o validador ainda exige, segurando só a reivindicação da própria tarefa. Um segundo epic de tarefa
  única, sob o mesmo work root, porque a task dona do teste original (task/relational-stores/capability-store)
  pertence a uma iniciativa já fechada (relational-persistence) e não pode ser reaberta.
covers:
- contracts/integration/capability-registry
- domain/integration/capability
- rules/knowledge/the-contract-check-reads-the-current-registration
sources:
- intake/reconcile-capability-store-test-scope.md
---

## What it is

Um epic de tarefa única para o incremento corretivo reconcile-capability-store-test-hotfix.

## Notes

None.
