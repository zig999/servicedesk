---
title: "Case: leitura e portas"
order: 6
part: "Contexto Conhecimento (src/case)"
status: draft
sources:
  - src/src/case/case-query.service.ts
  - src/src/case/case-store.port.ts
  - src/src/case/case-input-requirements.ts
  - src/src/case/case-input-requirements.port.ts
  - src/src/case/hypothesis-revision-own-state.port.ts
  - src/src/case/hypothesis-revision-release-state.port.ts
  - src/src/case/hypothesis-revision-release.port.ts
  - src/src/case/hypothesis-revision-overwrite.port.ts
---

Este arquivo deve explicar como um caso é lido em `case-query.service.ts` (incluindo a leitura em transação única citada no README), o contrato definido por `case-store.port.ts`, e os demais ports que governam o ciclo de vida de uma revisão de hipótese. Deve mostrar como esses ports se conectam às implementações relacionais descritas na Parte 6.
