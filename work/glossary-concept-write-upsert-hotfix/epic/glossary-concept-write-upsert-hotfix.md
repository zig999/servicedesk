---
title: Glossary concept write upsert hotfix
summary: A tarefa corretiva única que corrige o writeConcepts do glossário de concepts
  para não derrubar a tabela inteira ao salvar.
rationale: Um incremento corretivo não corta epic algum por survey/decomposição —
  este é o contêiner estrutural que o validador ainda exige, segurando só a reivindicação
  da própria tarefa.
covers:
- contracts/glossary/glossary-authoring
- domain/glossary/concept
- domain/integration/capability
- domain/investigation/evidence
- domain/investigation/citation
- rules/glossary/a-vocabulary-holds-each-name-once
- rules/glossary/a-concept-declares-its-description
sources:
- intake/scope.md
---

## What it is

Um epic de tarefa única para o incremento corretivo glossary-concept-write-upsert-hotfix.

## Notes

None.
