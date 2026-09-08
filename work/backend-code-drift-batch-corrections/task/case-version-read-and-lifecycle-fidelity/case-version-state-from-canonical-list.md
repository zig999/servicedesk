---
title: The case-version-state guard derives from one canonical list
summary: The relational case store's case-version-state guard decides membership against an exported canonical
  list of the enumeration's values, in the form the sibling hypothesis-revision-state guard already uses.
rationale: I cut this as one task because it is one guard in one file gaining its values from one list,
  and the accepted values themselves do not change; the scope listed the finding and stated no cut.
sources:
- intake/scope.md
objective: isCaseVersionState decides membership against an exported canonical list of domain/knowledge/case-version-state's
  values rather than a hand-written union.
criteria:
- isCaseVersionState decides membership against an exported canonical array of the case-version-state
  values, in the same form isHypothesisRevisionState already uses.
- The values the guard accepts are exactly draft and released, spelled as domain/knowledge/case-version-state
  spells them.
- No literal draft or released string remains in isCaseVersionState own condition.
- A stored state value the enumeration does not hold is still rejected by the guard.
- Every path resolving a case version state through the guard -- assembleVersion, listCases, createDraftVersion,
  releaseVersion, discardDraft and updateDraftVersion -- resolves the same state it resolved before.
- The canonical array is declared in one place, with no second list of the same values introduced.
- The refusals rules/knowledge/a-case-version-moves-through-its-declared-lifecycle states, CaseVersionNotDraftError
  and CaseVersionNotDraftAtReleaseError, keep their stated status and name.
implements:
- domain/knowledge/case-version-state
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/validation-runs-at-every-read
---
## What it is
domain/knowledge/case-version-state guarda draft e released, e rules/knowledge/a-case-version-moves-through-its-declared-lifecycle declara draft inicial, released terminal e release o unico gatilho entre eles.
isHypothesisRevisionState no mesmo arquivo ja verifica pertencimento contra um array canonico exportado; isCaseVersionState escreve seus dois valores a mao.

## Notes
UNDERDETERMINED, from the specification -- a clausula final de rules/knowledge/a-case-version-moves-through-its-declared-lifecycle (a recusa carrega o proprio slug, numero de versao e o estado em que a versao estava) nao e alcancada por nenhum criterio; o criterio 7 so guarda o status e os nomes de erro, e o criterio 5 so guarda que cada caminho resolve o mesmo estado. Como esta tarefa reescreve como o estado e resolvido nos caminhos releaseVersion e updateDraftVersion, esse payload esta ao alcance e fica sem guarda. Passaria: uma reescrita da guarda que mantem o array canonico, mantem as duas recusas no status e nome corretos, e mantem os seis caminhos resolvendo o mesmo estado -- mas o corpo da recusa emitido no caminho nao-draft deixa de carregar o estado em que a versao estava (ou o carrega sob uma grafia diferente da enumeracao).
REMAINDER, from the specification -- rules/knowledge/validation-runs-at-every-read e citada aqui so pela clausula que o criterio 4 usa (conteudo armazenado que o modelo declarado nao admite e uma regra de validador estrutural nao valendo); a familia de coerencia, a proibicao de tratar uma falha estrutural como condicao propria, e a excecao do replay nao sao alcancadas -- pertencem as tarefas deste epic que implementam a validacao de leitura sobre versoes armazenadas e a excecao do replay.
REMAINDER, from the specification -- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name nao e alcancada por nenhum criterio (o criterio 4 so diz que a guarda ainda rejeita um valor fora da enumeracao, e nada diz sobre o que responde essa rejeicao); pertence a tarefa irma sobre a validacao de leitura (input-requirements-validates-at-read), no mesmo epic.
REMAINDER, from the specification -- rules/knowledge/a-case-versions-input-requirements-are-derived nao e alcancada por nenhum criterio desta tarefa; pertence a tarefa irma sobre a derivacao dos requisitos de entrada, no mesmo epic.
ADVISORY, from the specification -- a exigencia de forma dos criterios 1 e 6 (na mesma forma que isHypothesisRevisionState ja usa; uma unica declaracao) repousa na forma do codigo-fonte existente e nas regras de organizacao do proprio projeto, nao em nenhum candidato; quem implementar deve ler a guarda irma na fonte para decidir a forma -- nada na especificacao decide isso, e nada deveria ser adicionado la para decidir.
