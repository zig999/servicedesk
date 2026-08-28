# Correção — registro de capability derruba o registry inteiro quando há evidência

Comportamento observado ao rodar o sistema entregue: `PUT /v1/capabilities/:name/:version`
devolveu HTTP 500 `{"error":{"code":"INTERNAL_ERROR","message":"an unexpected error occurred"}}`
ao tentar salvar uma correção de `input_schema` em `perfil-mobile-tecnico-reader` 1.0.0.

Causa raiz reproduzida ao vivo (app real, mesmo banco): `RelationalCapabilityStore.writeCapabilities`
(`src/src/persistence/relational-capability-store.repository.ts`) implementa "salvar o conjunto de
capabilities" como `DELETE FROM capabilities` (a tabela inteira, sem `WHERE`) seguido de um `INSERT`
por capability mantida, dentro de uma única transação. `capabilities(name, version)` é referenciada
por `investigation_evidence_capability_fkey` (`src/migrations/0005-investigation.sql`), declarada
**não-deferível** — Postgres checa essa FK por statement, não no commit, então o `DELETE` já falha
assim que **qualquer** linha da tabela está referenciada por `investigation_evidence`, mesmo a de
uma capability sem relação com a que está sendo escrita:

```
error: update or delete on table "capabilities" violates foreign key constraint
"investigation_evidence_capability_fkey" on table "investigation_evidence"
code: 23503
detail: Key (name, version)=(perfil-mobile-tecnico-reader, 1.0.0) is still referenced from table
"investigation_evidence".
```

Esse erro sobe como `CapabilityStoreError`, ausente de `STATUS_BY_ERROR_CLASS`
(`src/src/errors/status-map.ts`), então cai no fallback genérico 500 — escondendo a causa real.
Confirmado direto no banco: a capability citada tem 4 linhas em `investigation_evidence` e é a
única linha hoje na tabela `capabilities` — então **qualquer** escrita no registry, para qualquer
identidade, está bloqueada enquanto essa linha existir.

O contrato já declara o `PUT` como upsert — "creating it at a new name and version, or replacing
whatever already stood at that identity" (`contracts/integration/capability-registry.md`) — o
defeito é que a implementação de "replacing" não cumpre isso quando o registro tem evidência
associada a qualquer linha da tabela.

Correção: trocar o delete-all/insert-all por um upsert real, escopado por identidade — nunca mais
um `DELETE` sem filtro contra `capabilities`.

Responde a nenhum critério de nenhuma task: é um defeito de infraestrutura de escrita, sem fato de
negócio envolvido, encontrado rodando o sistema entregue.

Reproduzir com: `PUT /v1/capabilities/perfil-mobile-tecnico-reader/1.0.0` contra o banco real,
uma vez que a capability já tenha ao menos uma linha em `investigation_evidence` citando-a.
