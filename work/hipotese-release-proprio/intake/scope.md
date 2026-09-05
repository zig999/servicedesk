Implementar tudo que o `/analyse` decidiu no incremento "hipótese com release próprio,
desacoplado do manifest":

- `hypothesis-revision` ganha estado próprio (`draft`/`released`, enum
  `hypothesis-revision-state`).
- Nova operação `release` no agregado `hypothesis-revision`, governada por um novo
  state-machine (`a-hypothesis-revision-moves-through-its-declared-lifecycle`): transição única
  `draft` → `released`; uma segunda tentativa de release é recusada com HTTP 409
  `HypothesisRevisionNotDraftAtReleaseError`.
- `a-hypothesis-revision-is-overwritten-while-unreleased` e
  `a-released-hypothesis-revision-is-never-altered` passam a ler o estado da própria revisão
  (`state == released`), não mais uma leitura cruzada de qualquer case-version released que a
  referencie.
- Novo endpoint/operação `release-hypothesis`, publicado no contrato
  `contracts/knowledge/case-lifecycle`, disparável fora do contexto de qualquer caso — não exige
  manifest nem case-version algum.
- `ReleaseOperation.release()` (case-version) ganha o gate
  `a-released-case-version-manifests-only-released-hypothesis-revisions`: toda entrada do
  manifest deve apontar para uma revisão em estado `released`; se qualquer entrada apontar para
  uma revisão `draft`, o release inteiro é recusado, agregado ao `CaseVersionNotReleasableError`
  já existente (HTTP 422) — sem novo código de erro — nomeando as hipóteses ainda em draft.
  `place-hypothesis` continua irrestrito: apontar para uma revisão em qualquer estado nunca é
  recusado.
- Listagem de revisões de uma hipótese (`list-hypothesis-revisions`) passa a divulgar o estado
  de cada revisão listada (`a-hypothesis-revisions-listing-discloses-each-revisions-own-state`).

Confirmado sem mudança de comportamento (pontos A e B do material lido):
- `a-hypothesis-is-revised-only-against-its-cases-draft` continua exigindo que o caso da
  hipótese tenha um draft aberto para `revise-hypothesis` — o novo release independente não
  afeta essa exigência.
- Uma hipótese nunca é descartada, em nenhum estado — nenhuma operação de discard é introduzida.

Fora de escopo: qualquer coisa em `frontend/app/` (plano separado) e migração de dado existente
(o produto confirmou que os dados atuais podem ser descartados/recriados).

Especificação de origem: `knowledge/` neste mesmo worktree, incremento committed em
`6e7bb77` ("analyse: hypothesis-revision gains its own release lifecycle, decoupled from the
manifest").
