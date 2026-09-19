---
title: "Investigation: orquestração do pipeline"
order: 13
part: "Contexto Investigação (src/investigation)"
status: draft
sources:
  - src/src/investigation/investigation-pipeline.ts
  - src/src/investigation/run-diagnosis.ts
  - src/src/investigation/resolve-and-narrow-input.ts
  - src/src/investigation/investigation-factory.ts
---

Este arquivo deve detalhar como `investigation-pipeline.ts` e `run-diagnosis.ts` orquestram as etapas de coleta, julgamento, resolução, redação e gravação sob o prazo absoluto único do pedido, e como `resolve-and-narrow-input.ts` participa da resolução pura do desfecho. Deve explicar o papel de `investigation-factory.ts` na composição do pipeline, com código verbatim dos pontos de decisão.
