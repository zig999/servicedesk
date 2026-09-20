---
title: "Case: operações de escrita"
order: 5
part: "Contexto Conhecimento (src/case)"
status: draft
sources:
  - src/src/case/create-draft.operation.ts
  - src/src/case/discard.operation.ts
  - src/src/case/release.operation.ts
  - src/src/case/revise-hypothesis.operation.ts
  - src/src/case/release-hypothesis-revision.operation.ts
  - src/src/case/manifest-composition.operations.ts
---

Este arquivo deve cobrir as operações que alteram o estado de um caso: criar rascunho, descartar, liberar uma versão, revisar uma hipótese, liberar uma revisão de hipótese e compor o manifesto de versão. Deve explicar, com código verbatim de cada operação, como a imutabilidade de uma versão liberada é respeitada e como o versionamento durável é mantido.
