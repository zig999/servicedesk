---
title: "Persistência: conexão e acesso"
order: 17
part: "Infraestrutura"
status: draft
sources:
  - src/src/persistence/database-connection.ts
  - src/src/persistence/database-access.ts
  - src/src/persistence/isolated-connection.ts
  - src/src/persistence/migration-runner.ts
---

Este arquivo deve explicar como o único `Pool` do `pg` em `database-connection.ts` é a peça que sabe que existe um banco, como os helpers de leitura/escrita/transação de `database-access.ts` rodam por cima dele, e o papel de `isolated-connection.ts` e `migration-runner.ts`. Deve incluir código verbatim mostrando como um repositório relacional recebe a conexão já pronta.
