# Correção — manifesto lido com `collects` vazio

Comportamento observado ao rodar o sistema entregue: ler uma versão de caso de volta pelo store
real (`ICaseStore.assembleVersion`, consumido tanto por `case-query.service.ts` quanto por
`release.operation.ts`) responde toda entrada de manifesto com o `collects` da sua
hypothesis-revision **vazio**, mesmo a revisão tendo sido originada por `reviseHypothesis`/
`insertRevision` com uma lista de `collects` não vazia (ex.: o caso de fixture
`intermittent-connection-outage`, cujas duas hipóteses foram revisadas com
`collects: ["equipment-status"]` e `collects: ["network-outage-flag"]`, respectivamente).

Isso faz a checagem estrutural de `parse-case-document.ts` recusar com "manifest entry 1 collects
no concept" / "manifest entry 2 collects no concept" para um caso que foi validamente autorado —
quebrando `release` (que roda essa mesma checagem) e toda leitura de um caso cuja hipótese coleta
algo.

Não é novo: o último `run` que a própria iniciativa `case-lifecycle` registrou antes de fechar
(`delivery/case-lifecycle/run/case-lifecycle-epic-suite-8-after-cleanup/test.log`) já mostra as
mesmas 9 falhas, com a mesma assinatura:
- `src/src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts`
- `src/src/__tests__/integration/factories/diagnose-server.factory.spec.ts` (6 testes)
- `src/src/__tests__/integration/http/diagnose-e2e.spec.ts`
- `src/src/__tests__/integration/case/revise-hypothesis.operation.spec.ts`
- `src/src/__tests__/integration/seed.spec.ts`

Responde a nenhum critério de nenhuma tarefa porque `case-lifecycle` já tem `closure.md`.

Área provável: `src/src/persistence/relational-case-store.repository.ts`'s
`collectsByHypothesisName`/`readManifest` (o join entre `case_version_hypotheses` e
`hypothesis_revision_collects`), ou o próprio `insertRevision`'s write de
`hypothesis_revision_collects` — ambos lêem como estruturalmente corretos por inspeção do código,
então o defeito real precisa ser achado rodando/instrumentando o banco real, não só lendo a fonte.

Reproduzir com: `npm test` (em `src/`), ou especificamente
`src/src/__tests__/integration/fixtures/case-fixture-reads-clean.spec.ts` e
`src/src/__tests__/integration/seed.spec.ts` contra o banco de teste Neon real do projeto
(`.env.test`).
