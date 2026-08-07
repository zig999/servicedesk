# Escopo — iniciativa case-authoring

Persistido nesta invocação de `/plan-work`, na prosa em que foi fornecido.

## A prosa como fornecida

> Escopo: planejar do zero a iniciativa case-authoring — o sistema de autoria e validação de
> casos descrito em docs/arquitetura-troubleshooting-v5.md, sobre o que a base já registra (os
> contextos case-validator e published-case). O alvo é backend/, vazio: os três artefatos que o
> registro pressupõe (package.json, tsconfig.json, eslint.config.js) não existem lá, então o
> corte de substrato os produz todos, declarados em `produces` com paths relativos a backend/.
>
> Raiz de conhecimento: knowledge
> Raiz de trabalho: work/case-authoring
> Raiz do source alvo: backend
> Standard do projeto: standards/backend-node-service.yaml

## Os arquivos que a prosa referencia

`docs/arquitetura-troubleshooting-v5.md`, copiado para `intake/arquitetura-troubleshooting-v5.md`.
`standards/backend-node-service.yaml`, copiado para `intake/backend-node-service.yaml`.

## O que a prosa nomeia e a base não carrega com esse nome

A prosa nomeia "os contextos case-validator e published-case".
A base não registra contexto algum com esses dois nomes.
O que ela registra é `context/knowledge` — Curated Knowledge — e é lá que a autoria e a validação
de casos estão: `definition/knowledge/case` é o caso publicado, `definition/knowledge/draft-case`
é o caso em edição, `definition/knowledge/refusal` é uma recusa de validação, e
`lifecycle/knowledge/case-publication` é a publicação onde o contrato com o contexto de integração
é verificado.
As catorze regras de `rule/knowledge/` são o que um validador de caso aplica.
A leitura desta invocação é que "case-validator" e "published-case" nomeiam essas duas leituras do
mesmo contexto, e não dois contextos que a base deixou de registrar.
Onde essa leitura estiver errada, o escopo é que corrige — não o plano.

## O que o registro do projeto pressupõe e a árvore não tem

`deliver.py --standard standards/backend-node-service.yaml --against backend` respondeu com três
artefatos ausentes: `package.json`, `tsconfig.json` e `eslint.config.js`.
Nenhum deles é fato de domínio e nenhum nó da base responde por eles.
O corte de substrato os produz, declarados em `produces` com paths relativos a `backend/`.
