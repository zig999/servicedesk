# Emenda ao escopo — alcance das épicas — 2026-08-04

Registro novo, como manda o intake: o `escopo.md` original não é editado.

## O que motivou

Cinco vinculadores, cada um em contexto limpo, devolveram notas `blocking` dizendo que as três
respostas do caso publicado não se demonstram dentro dos `covers` que as épicas declaravam:

- `collection-plan` — a união das coletas, uma vez cada, só é declarada em
  `process/investigation/diagnose`; os nós vinculados dão a estrutura e não a semântica.
- `evaluation-record` — "no que o veredito se apoiou" é uma citação, e citação vive em
  `definition/investigation/citation`, `rule/investigation/a-decided-evaluation-cites-evidence`
  e `definition/integration/capability`.
- `outcome-resolution` — a hipótese determinante e o construto que carrega a resolução vivem em
  `definition/investigation/assessment`.

## A decisão do humano, verbatim como apresentada

> **Crescer a claim das épicas.** Adiciona `process/investigation/diagnose`,
> `definition/investigation/citation`, `rule/investigation/a-decided-evaluation-cites-evidence`,
> `definition/integration/capability` e `definition/investigation/assessment` aos `covers`.
> Três deles são limpos; `capability` e `assessment` trazem gaps, então `evaluation-record` e
> `outcome-resolution` nascem com `unresolved`. As três respostas ficam inteiras.

## O que isso corrige no que foi dito antes

O escopo original afirmava que este corte "nasce sem nenhum `unresolved`". Isso não se sustenta,
e a razão é anterior ao alcance das épicas: `definition/glossary/outcome` enumera apenas os dois
desfechos de não-conclusão, e seu gap diz que todo outro é contribuído por uma hipótese
confirmável — logo a base não tem desfecho com que declarar uma hipótese que confirma, e a
Decisão 4 alcança qualquer task que construa um caso de exemplo confirmável.
