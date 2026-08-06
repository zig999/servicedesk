# Escopo — retomada da re-vinculação após o recorte das seis decisões — 2026-08-06

Registro novo. Nenhum intake anterior é editado.

## O pedido, verbatim

> evoluir o plano work/case-authoring contra a base knowledge: re-vincular as tarefas com pin
> desatualizado, re-triar os gaps que a base fechou em e56be3a, e reconciliar a cobertura dos
> épicos (observation-field e capability), conforme intake/escopo-recorte-seis-decisoes.md

## O que este pedido retoma

A invocação anterior deste mesmo escopo — `intake/escopo-recorte-seis-decisoes.md` — foi
interrompida no meio: as duas épicas foram reescritas, `task/case-validator/validation-run` e
`task/published-case/case-structure` foram re-vinculadas contra o pin
`sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f`, e
`task/published-case/fallback-selection` foi criada e vinculada. Esse estado parcial está
commitado em `3cee878`.

Esta invocação completa o restante: as 15 tasks que ainda apontam o pin
`sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092`, a triagem que ainda
responde gaps que a base fechou (`definition/knowledge/case#attributes.content_hash.derivation`,
`definition/knowledge/case#attributes.no_hypothesis_confirmed.selection`,
`definition/integration/capability#attributes.output_schema`), e a reconciliação de cobertura que
o validador aponta nas duas épicas — `definition/glossary/observation-field` coberto sem task que
o vincule, e `definition/integration/capability` declarado uncovered em `epic/published-case`
enquanto uma task o vincula.

O material de escopo segue sendo `intake/escopo-recorte-seis-decisoes.md`; este arquivo registra
apenas a retomada e o seu recorte.
