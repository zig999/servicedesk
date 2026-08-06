# Escopo — re-vinculação após as cinco decisões — 2026-08-06

Registro novo. Nenhum intake anterior é editado.

## O pedido, verbatim

> evoluir o plano work/case-authoring contra a base knowledge como recém-validada: re-vincular os
> pins, retirar as quatro questões que as decisões de intake/decisoes-cinco-perguntas-2026-08-06.md
> responderam (lookup exato, output_schema, recusa, evidência total), e alcançar nos covers os
> cinco nós novos — definition/knowledge/refusal e as quatro regras.
>   work root: work/case-authoring
>   target source root: src/, ou o que você decidir

O target source root é `src/`, o nomeado no slot.

## O que move este re-corte

`/analyse-domain` (commit `c92693a`) gravou as cinco decisões e a base foi de 57 para 62 nós; o pin
mudou de `sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f` para
`sha256:d196ce9d9e4ee7f02c9a77beaa94aa21caab7c52084e0cc8cd8179fbb099a411`.

Os cinco nós novos: `definition/knowledge/refusal`,
`rule/knowledge/two-positions-are-two-refusals`,
`rule/glossary/a-lookup-matches-a-published-name-exactly`,
`rule/investigation/one-evidence-per-collected-concept`,
`rule/investigation/an-unattempted-concept-records-a-timeout`. Mais:
`definition/integration/capability` ganhou o atributo `output_schema`; as frases obsoletas de
`definition/investigation/citation` e `definition/knowledge/hypothesis` foram corrigidas para os
campos que o conceito declara; e nós tocados ganharam linhas de aponte em `## Rules`.

## O que esta invocação muda e não muda

**Muda:** os covers das duas épicas — `case-validator` alcança a recusa, a regra das duas posições
e a do lookup exato; `published-case` alcança as duas regras de totalidade da evidência — e a
vinculação de cinco tasks cujas questões as decisões respondem ou cujos nós vinculados mudaram de
substância: `validation-run`, `glossary-lookup`, `read-only-capability`, `fallback-selection` e
`evaluation-citations`. As demais treze tasks têm o pin restatado deliberadamente: os nós que
vinculam mudaram só por linhas de aponte em `## Rules` ou pela frase corrigida no corpo da
hipótese, e nenhum gap abriu ou fechou em qualquer deles.

**Não muda:** o inventário — `src/` não foi tocado desde o levantamento que produziu
`inventory/src-tree`, então o surveyor não é chamado — e o corte: nenhum objetivo ou critério
muda, então o decompositor não é chamado; a evolução é de vinculação e de cobertura.

**Continua fora:** o toolchain, como nos recortes anteriores.
