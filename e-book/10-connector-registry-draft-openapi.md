---
title: "Connector Registry: rascunho a partir de OpenAPI"
order: 10
part: "Contexto Glossário e Integração"
status: draft
sources:
  - src/src/connector-registry/openapi-document-fetcher.adapter.ts
  - src/src/connector-registry/openapi-document-fetcher.port.ts
  - src/src/connector-registry/openapi-document-reader.ts
  - src/src/connector-registry/openapi-document-operations-reader.ts
  - src/src/connector-registry/openapi-operation-reader.ts
  - src/src/connector-registry/connector-configuration-draft-generation.ts
  - src/src/connector-registry/connector-configuration-draft.ts
  - src/src/connector-registry/connector-configuration-draft-reading-notes.ts
  - src/src/connector-registry/capability-schema-draft.ts
  - src/src/connector-registry/capability-schema-draft-input-schema.ts
  - src/src/connector-registry/capability-schema-draft-output-schema.ts
  - src/src/connector-registry/generated-credential-placeholders.ts
---

Este arquivo deve explicar como o sistema lê um documento OpenAPI de um sistema externo e gera rascunhos de configuração de conector e de schema de capacidade a partir dele, poupando trabalho manual de quem cadastra uma integração nova. Deve cobrir o encadeamento entre leitura do documento, leitura de operações e geração dos drafts, com código verbatim das funções centrais.
