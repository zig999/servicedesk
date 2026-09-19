---
title: "Investigation: julgamento das hipóteses"
order: 15
part: "Contexto Investigação (src/investigation)"
status: draft
sources:
  - src/src/investigation/judgment-stage.ts
  - src/src/investigation/hypothesis-evaluator.port.ts
  - src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts
  - src/src/investigation/fake-hypothesis-evaluator.adapter.ts
  - src/src/investigation/citation-validation.ts
  - src/src/investigation/evaluation.ts
  - src/src/investigation/evaluation-reason.ts
---

Este arquivo deve explicar como `judgment-stage.ts` julga cada hipótese exigida isoladamente e em paralelo, sob um limite de concorrência configurável, chamando `IHypothesisEvaluator` — implementado em produção por `AnthropicHypothesisEvaluator`. Deve detalhar a segunda tentativa disparada quando a citação da primeira resposta não se sustenta, com base em `citation-validation.ts`, e usar código verbatim dessas classes.
