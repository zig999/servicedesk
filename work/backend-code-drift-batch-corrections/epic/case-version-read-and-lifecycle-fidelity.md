---
title: A stored case version reads and lifecycle state held to their rules
summary: The corrections over the knowledge context's stored case version -- the input-requirements read
  skipping the validation every read runs, and the stored lifecycle state resolved through a hand-written
  union instead of the enumeration's canonical values.
rationale: I grouped these two because both are the persistence and query side of one stored case version
  answering for knowledge-context rules; the scope listed them as separate file findings and stated no
  grouping.
sources:
- intake/scope.md
covers:
- rules/knowledge/validation-runs-at-every-read
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/a-case-versions-input-requirements-are-derived
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- domain/knowledge/case-version-state
---
## What it is
Duas correcoes sobre uma versao de caso armazenada.
readCaseInputRequirements responde requisitos de entrada calculados para uma versao armazenada que readCase, sobre a mesma versao, recusaria.
O relational case store resolve o estado de uma versao de caso atraves de uma uniao 'draft'/'released' tipada a mao, enquanto a guarda irma no mesmo arquivo ja deriva hypothesis-revision-state de uma lista canonica.

## Notes
Fazer a leitura de input-requirements recusar muda o que os chamadores que hoje recebem requisitos calculados para tal versao passam a receber.
O inventario registra que nenhum arquivo na area pesquisada exporta hoje uma lista canonica de case-version-state, e nomeia src/src/case/case-store.port.ts, que ja exporta HYPOTHESIS_REVISION_STATES, como o arquivo a conferir antes de declarar uma nova lista.
