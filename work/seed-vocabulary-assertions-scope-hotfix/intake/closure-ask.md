O humano pediu: "encerre todas as iniciativas abertas".

Iniciativa: seed-vocabulary-assertions-scope-hotfix.

Motivo dado pelo pedido, e confirmado no disco antes de escrever este arquivo: o trabalho
planejado está entregue. As cinco asserções de tabela inteira de vocabulário em seed.spec.ts passaram a se restringir aos nomes que a própria fixture declara.

`deliver.py --outstanding delivery/seed-vocabulary-assertions-scope-hotfix work/seed-vocabulary-assertions-scope-hotfix src knowledge` respondeu
"every task has a record, and every record its proof" — 1 tarefa, 1 implementação e 1 prova. Nenhuma
tarefa sem registro, nenhum registro sem prova, nenhuma nota BLOCKING de pé sob este work root.

`plan.py --check work/seed-vocabulary-assertions-scope-hotfix knowledge` valida contra a especificação como ela está hoje, então
o fechamento aqui não está resolvendo nenhuma referência que tenha se movido — está apenas
declarando terminada uma iniciativa que não tem mais nada a entregar.

Target: backend (src). Initiative: seed-vocabulary-assertions-scope-hotfix.
