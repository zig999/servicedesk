# Escopo — re-vinculação contra a base movida — 2026-08-05

Registro novo. Os dois arquivos anteriores de intake não são editados.

## O pedido, verbatim

> pode comitar e seguir para o plan-work

## O que o move

`/analyse-domain` alterou três nós da base e o pin mudou de
`sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af` para
`sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092`. O validador do plano
recusa as 17 tasks por duas razões:

- o pin que cada binding leu não é a base como ela está;
- `definition/knowledge/case` declara três gaps novos, e as 14 tasks que o vinculam não os
  triam — nem `unresolved` nem waived.

Os três gaps novos são `attributes.version.derivation`, `attributes.content_hash.derivation` e
`attributes.no_hypothesis_confirmed.selection`. Um gap fechou no mesmo ato —
`draft-case#attributes.[]` — e o nó passou a carregar a forma que o material sempre teve.

## O que esta invocação muda, e o que ela não muda

**Muda:** o inventário, porque `src/` deixou de estar vazio — a entrega de
`task/published-case/assessment-record` escreveu sete módulos e um arquivo de testes; e o binding e
o pin de cada uma das 17 tasks.

**Não muda:** o corte. As duas épicas e os objetivos e critérios das 17 tasks são decisão em pé, e
esta invocação não a reabre — o decompositor não é chamado. Um corte re-aberto como efeito colateral
de uma base que se moveu é exatamente o que a skill proíbe.

**Continua fora:** o toolchain. Nada compila e 23 das 47 regras do standard não têm o que as
decida, e nenhuma task cobre isso. Foi reportado ao humano e nenhuma instrução o trouxe para o
escopo, então segue sem casa.

## O que se espera do resultado

Mais `unresolved`, não menos. As perguntas 2 e 3 da rodada de análise seguem abertas por decisão
registrada, então `no_hypothesis_confirmed.selection` e `output_schema` alcançam toda task em cujo
caminho estejam. Fechar `draft-case` remove o bloqueio estrutural que impedia a épica validadora de
reclamar o construto que ela valida — o que é ganho de outra ordem, e é da decomposição decidir se
o aproveita, não desta invocação.
