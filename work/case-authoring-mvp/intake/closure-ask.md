Encerrar a iniciativa case-authoring-mvp agora.

As 10 tasks do plano estão entregues e revisadas — deliver.py --check dá delivery.json são
sobre 20 nodes, nenhum critério não atendido, e o review formal das quatro passagens está
registrado em delivery/case-authoring-mvp/review/case-authoring-mvp.md, cobrindo os artefatos
do substrato entre os arquivos revisados.

task/published-language/build-substrate está implementada sem proof record, e isso é estado
permanente, não pendência. Seus critérios são fatos de forma de árvore e de execução —
"type":"module" no topo do manifesto, os quatro scripts que o standard roda, o tsconfig estrito,
o flat config do eslint, e npm ci seguido de cada passo declarado completando sobre a árvore
como produzida — que a build capturada em run/published-language-build-substrate-build-3 já
afirma e que nenhum teste provaria além dela. A única nota UNDERDETERMINED da task, que os
critérios como escritos admitiriam um driver de banco da lista autorizada e
constraints/the-mvp-persists-to-no-database recusa, está excluída por teste:
src/__tests__/unit/dependency-manifest.spec.ts audita o manifesto contra uma lista de drivers,
ORMs e query builders, e está declarado sob proof/published-language/glossary-vocabulary.md.

A suíte do alvo passa inteira no estado atual — 51 arquivos, 458 testes — e o typecheck está
limpo.

Nada mais está em aberto sob este work root.

Target: backend (src). Initiative: case-authoring-mvp.
