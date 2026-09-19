---
title: "Investigation: coleta de evidência"
order: 14
part: "Contexto Investigação (src/investigation)"
status: draft
sources:
  - src/src/investigation/evidence-collection-stage.ts
  - src/src/investigation/observation-source.port.ts
  - src/src/investigation/http-declarative-observation-source.adapter.ts
  - src/src/investigation/fake-observation-source.adapter.ts
---

Este arquivo deve explicar como `evidence-collection-stage.ts` coleta, em paralelo e dentro de um orçamento de tempo próprio, uma evidência por conceito exigido pelo caso, e como `IObservationSource` é implementado em produção por `HttpDeclarativeObservationSource`. Deve mostrar também o dublê `fake-observation-source.adapter.ts` usado em teste, com código verbatim comparando as duas implementações.
