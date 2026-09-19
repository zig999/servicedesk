---
title: "Fluxo de diagnóstico"
order: 3
part: "O fluxo central"
status: draft
sources:
  - README.md
  - src/src/http/diagnose.controller.ts
  - src/src/http/diagnose.routes.ts
  - src/src/investigation/run-diagnosis.ts
---

Este arquivo deve percorrer o ciclo de vida completo de um pedido `POST /v1/diagnose`, passo a passo: leitura e validação do caso pinado, coleta de evidências, julgamento paralelo das hipóteses, resolução do desfecho pela primeira hipótese confirmada, redação da conclusão e gravação imutável da investigação antes de responder. Deve usar o diagrama de composição do README como fio condutor e servir de mapa para os arquivos da Parte 5, que detalham cada etapa.
