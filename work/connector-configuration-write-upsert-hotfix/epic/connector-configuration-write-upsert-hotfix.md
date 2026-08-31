---
title: Connector configuration write upsert hotfix
summary: A tarefa corretiva única que corrige o writeConnectorConfigurations do registry
  de connector configurations para não derrubar a tabela inteira ao salvar.
rationale: Um incremento corretivo não corta epic algum por survey/decomposição —
  este é o contêiner estrutural que o validador ainda exige, segurando só a reivindicação
  da própria tarefa.
covers:
- contracts/integration/connector-configuration-registry
- domain/integration/connector-configuration
- domain/integration/connector-configuration-registry
sources:
- intake/scope.md
---

## What it is

Um epic de tarefa única para o incremento corretivo connector-configuration-write-upsert-hotfix.

## Notes

None.
