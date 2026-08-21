O humano pediu: "encerre todas as iniciativas abertas".

Iniciativa: seed-already-seeded-guard-hotfix.

Motivo dado pelo pedido, e confirmado no disco antes de escrever este arquivo: o trabalho
planejado está entregue. seed.ts volta a semear vocabulários, concepts e capabilities a cada execução, com alreadySeeded() barrando apenas a escrita do caso.

`deliver.py --outstanding delivery/seed-already-seeded-guard-hotfix work/seed-already-seeded-guard-hotfix src knowledge` respondeu
"every task has a record, and every record its proof" — 1 tarefa, 1 implementação e 1 prova. Nenhuma
tarefa sem registro, nenhum registro sem prova, nenhuma nota BLOCKING de pé sob este work root.

`plan.py --check work/seed-already-seeded-guard-hotfix knowledge` valida contra a especificação como ela está hoje, então
o fechamento aqui não está resolvendo nenhuma referência que tenha se movido — está apenas
declarando terminada uma iniciativa que não tem mais nada a entregar.

Target: backend (src). Initiative: seed-already-seeded-guard-hotfix.
