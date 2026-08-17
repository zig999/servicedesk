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

## Achado adicional, durante a entrega deste próprio incremento

Corrigida a primeira checagem (existência do caso), rodar o arquivo isoladamente contra o banco
real revelou uma segunda instância do mesmo padrão, por um caminho diferente: a checagem seguinte
de `assertGenuinelyEmpty`, que confirma a ausência dos dois "non-conclusion outcomes"
(`inconclusive-no-data`, `inconclusive-hypotheses-exhausted`), também passa a falhar de forma
permanente — não por causa do caso de fixture deste arquivo, mas porque outros arquivos de teste
(`diagnose-e2e.spec.ts`, `diagnose-server.factory.spec.ts`) legitimamente liberam, para valer,
hipóteses cuja resolução usa esses mesmos dois outcomes, compartilhados globalmente pela tabela
`public.outcomes`. Uma vez que qualquer hipótese liberada resolve para um desses nomes,
`rules/knowledge/a-case-version-is-written-once` torna essa referência permanente também — o
mesmo mecanismo de imutabilidade de release, agora bloqueando a remoção de uma linha de
`outcomes` em vez da linha do caso.

Dividir o DELETE em lote (`WHERE name = ANY($1)`) num laço por nome (mesmo padrão já usado para
capabilities/concepts no mesmo arquivo) não resolve isto: cada nome de non-conclusion outcome,
isoladamente, também está genuinamente bloqueado por uma FK permanente vinda de outro arquivo —
confirmado rodando o teste isolado depois da correção. A premissa original desta tarefa, de que
"a checagem de outcomes fica intocada", foi escrita antes deste segundo achado existir e não se
sustenta mais: o mesmo padrão de tolerância que resolve a existência do caso precisa se estender
à checagem de outcomes.
