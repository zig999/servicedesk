---
title: Capability registry write upsert hotfix
summary: A tarefa corretiva única que corrige o writeCapabilities do registry de capabilities
  para não derrubar a tabela inteira ao salvar.
rationale: Um incremento corretivo não corta epic algum por survey/decomposição —
  este é o contêiner estrutural que o validador ainda exige, segurando só a reivindicação
  da própria tarefa.
covers:
- contracts/integration/capability-registry
- domain/integration/capability
- domain/investigation/evidence
sources:
- intake/scope.md
---

## What it is

Um epic de tarefa única para o incremento corretivo capability-registry-write-upsert-hotfix.

## Notes

None.
