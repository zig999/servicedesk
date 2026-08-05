# Adendo ao escopo da re-vinculação — 2026-08-05

O arquivo `escopo-revinculacao.md` afirma que o corte não muda. Isso deixou de ser exato durante a
invocação, e o registro é corrigido aqui em vez de lá.

`epic/case-validator` teve a claim crescida por dois nós: `definition/knowledge/draft-case`, que
entra em `covers` e é vinculável, e `lifecycle/knowledge/case-publication`, que entra em `covers` e
é declarado `uncovered`.

O motivo não é uma decisão de escopo desta invocação. Cinco vinculadores independentes, na rodada
anterior, devolveram nota `blocking` dizendo que o construto que uma checagem de publicação recusa é
o caso em edição, e que a épica não o reclamava — e a skill prescreve exatamente uma resposta a isso:
*"Where a note says the task needs what the candidates do not hold, the cut is wrong: grow the
epic's `covers` or move the task, and re-bind — never widen a binding by hand."* Antes desta rodada
crescer a claim não resolvia nada, porque a forma do caso em edição era um gap; com o gap fechado,
crescer passa a custar zero `unresolved`.

O ato da publicação continua fora, e agora está declarado fora em vez de silenciosamente ausente: o
escopo excluiu o ciclo de publicação, nenhuma task desta épica transiciona um caso, e o nó carrega
dois gaps próprios que ninguém aqui tria.

O decompositor não foi chamado: nenhum objetivo, critério ou dependência de task mudou.
