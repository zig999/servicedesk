# Escopo — re-corte após as seis decisões — 2026-08-05

Registro novo. Nenhum intake anterior é editado.

## O pedido, verbatim

> sim

Em resposta à ordem proposta: commitar a base, rodar o `/plan-work`, e deixar o pin da entrega por
último.

## O que move este re-corte

`/analyse-domain` fechou três gaps com decisões do negócio e a base foi de 53 para 57 nós. O pin
mudou de `sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092` para
`sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f`.

Duas mudanças são de **forma** e não só de pin, e é por isso que o decompositor é chamado:

1. `definition/knowledge/case` e `definition/knowledge/draft-case` **perderam o atributo
   `no_hypothesis_confirmed`** e ganharam dois no lugar — `no_data_fallback` e
   `hypotheses_exhausted_fallback`. Todo critério que fala "a resolução que o caso declara para
   quando nenhuma hipótese confirma" fala de um campo que não existe mais.
2. `rule/investigation/a-decided-evaluation-cites-evidence` mudou de statement e de `constrains`: o
   campo citado passa a ser checado contra os campos que o **conceito** declara, não contra o schema
   de saída da capacidade.

Mais: `definition/glossary/concept` ganhou `observation_fields`; `definition/integration/capability`
fechou o gap do `output_schema`; `rule/knowledge/hypothesis-name-is-unique-in-its-case` ganhou
`expression` fixando comparação exata; e entraram quatro nós novos —
`definition/glossary/observation-field`, `rule/knowledge/a-validation-answers-with-every-refusal`,
`rule/knowledge/the-fallback-follows-what-the-collection-returned` e
`rule/knowledge/the-content-hash-covers-the-whole-file`.

## O que esta invocação muda e não muda

**Muda:** os esqueletos cujos critérios referenciam o que mudou de forma, os `covers` das duas
épicas para alcançar os nós novos, e o binding e o pin das 17 tasks.

**Não muda:** o inventário. `src/` não foi tocado desde o levantamento que produziu
`inventory/src-tree`, então o nó continua descrevendo a árvore como ela está e o surveyor não é
chamado.

**Continua fora:** o toolchain. Nada compila, 23 das 47 regras do standard não têm o que as decida,
e nenhuma task cobre isso.

## Uma observação para o relatório, não para esta invocação

A decisão Q2 deixou o corpo de `definition/glossary/concept` afirmando que um conceito que um caso
nomeia deve declarar os campos que sua resposta carrega. Isso é condição falsificável e portanto
candidata a nó `rule` próprio — paralela à que exige o ttl, que existe como
`rule/knowledge/every-collected-concept-declares-a-ttl`. Hoje o fato está só no corpo do nó, e a
assimetria é da base. Registrado aqui em vez de corrigido, porque corrigir seria outra edição de base
e outro re-plano.
