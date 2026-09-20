---
title: "Investigation: consolidação e redação"
order: 16
part: "Contexto Investigação (src/investigation)"
status: draft
sources:
  - src/src/investigation/draft-assessment-text.ts
  - src/src/investigation/assessment-consolidator.port.ts
  - src/src/investigation/anthropic-assessment-consolidator.adapter.ts
  - src/src/investigation/fake-assessment-consolidator.adapter.ts
  - src/src/investigation/consolidation-register.ts
---

Este arquivo deve explicar como a conclusão de uma investigação é redigida a partir apenas do que foi de fato citado, via `draft-assessment-text.ts` e `IAssessmentConsolidator` — implementado em produção por `AnthropicAssessmentConsolidator`. Deve cobrir o papel do registro de consolidação (`formal`/`plain`) definido em `consolidation-register.ts`, com código verbatim.
