---
title: "Persistência: repositórios relacionais"
order: 18
part: "Infraestrutura"
status: draft
sources:
  - src/src/persistence/relational-case-store.repository.ts
  - src/src/persistence/relational-glossary-store.repository.ts
  - src/src/persistence/relational-capability-store.repository.ts
  - src/src/persistence/relational-connector-configuration-store.repository.ts
  - src/src/persistence/relational-investigation-store.repository.ts
  - migrations
---

Este arquivo deve detalhar os cinco repositórios relacionais que implementam os ports de cada contexto, o modelo de dados (uma tabela por elemento do domínio, migrações aplicadas em ordem), a leitura de um caso inteiro em transação única em `assembleVersion`, e como a imutabilidade de uma versão liberada é garantida por regra de schema (`UPDATE`/`DELETE` viram no-op), não por checagem em código.
