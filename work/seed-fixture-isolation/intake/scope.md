# Correção — seed.spec.ts assume que sempre pode esvaziar o caso de fixture

Comportamento observado ao rodar o sistema entregue: `src/src/__tests__/integration/seed.spec.ts`'s
own `beforeAll` chama `wipeFixtureOwnedRows` e depois `assertGenuinelyEmpty`, que lança um erro se
`createCaseStore(connection).assembleVersion(SLUG, VERSION)` responder qualquer coisa além de
`undefined` para o slug/versão da fixture (`intermittent-connection-outage`, versão 1).

Esse mesmo slug/versão é o ÚNICO caso de fixture do projeto, compartilhado por
`case-fixture-reads-clean.spec.ts` e `diagnose-server.factory.spec.ts`, que **legitimamente**
liberam essa versão para valer, para seus próprios testes de leitura. Uma vez liberada de verdade,
`rules/knowledge/a-case-version-is-written-once` (já existente, migração 0009, anterior a esta
sessão) torna essa linha permanente — nenhum DELETE nunca mais a remove, em nenhuma execução futura
da suíte contra este banco Neon persistente e dedicado.

Isso significa que, depois da primeira vez que qualquer arquivo libera essa fixture de verdade,
`seed.spec.ts`'s own premissa ("uma base que este arquivo mesmo esvaziou, do caso e dos dois
outcomes, antes de seed.ts rodar") nunca mais pode ser satisfeita para o caso especificamente — não
por um bug, mas porque a imutabilidade de release já é o comportamento correto e intencional do
sistema.

Não é um bug novo do sistema: é a premissa de design deste teste específico ficando incompatível
com uma regra correta que passou a valer depois que o teste foi escrito. Responde a nenhum critério
de nenhuma tarefa das iniciativas fechadas.

Reproduzir com: `npm test` em `src/`, ou especificamente `src/src/__tests__/integration/seed.spec.ts`
— falha com "this file's own wipe left the fixture case stored; the transition this file proves
would not be genuine".
