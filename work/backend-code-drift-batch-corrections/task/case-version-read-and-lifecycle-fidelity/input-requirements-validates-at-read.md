---
title: The input-requirements read runs the validation every read runs
summary: A read of a stored case version input requirements is refused where a validator rule does not
  hold at that reading, the same way a read of the case itself is.
rationale: I cut this as one task because one read path gaining one check is one outcome with one seam;
  the scope listed the finding and stated no cut.
sources:
- intake/scope.md
objective: readCaseInputRequirements answers no input requirements for a stored case version some validator
  rule does not hold for at that reading.
criteria:
- readCaseInputRequirements runs over the named stored version the same validator-rule check readCase
  runs over it.
- A read naming a stored version for which a validator rule does not hold at that reading answers no input
  requirements at all.
- That refusal is an HTTP 409 response reporting a CaseVersionNotValidError.
- That refusal is not the generic refusal a domain error the status map does not name receives.
- That refusal is not a CaseNotFoundError.
- A read naming a slug, or a slug and version, that no stored case version answers is still refused as
  a CaseNotFoundError.
- A read naming a stored draft version every validator rule holds for is not refused by this check.
- A read naming a stored version every validator rule holds for still answers one case-input-requirement
  per subject attribute that a capability answering a concept in the version collection plan names in
  properties.
- A read naming a stored version every validator rule holds for still names separately each resolved capability
  whose own stored input schema does not currently hold a well-formed shape.
implements:
- rules/knowledge/validation-runs-at-every-read
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
- rules/knowledge/a-case-versions-input-requirements-are-derived
---
## What it is
rules/knowledge/validation-runs-at-every-read faz uma versao armazenada ser lida como um caso apenas enquanto toda regra de validador vale naquela leitura, tanto estrutural quanto de coerencia.
rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name declara o que essa leitura responde, e a mantem separada da recusa de slug desconhecido e da recusa generica de erro nao mapeado.
readCaseInputRequirements nunca roda essa checagem, entao uma versao que readCase recusaria ainda responde requisitos de entrada calculados.

## Notes
UNDERDETERMINED, from the specification -- nenhum criterio retira o replay da checagem; rules/knowledge/validation-runs-at-every-read declara replay como excecao expressa (a replay reads the pinned version without revalidation), mas os criterios 1 e 2 sao escritos irrestritamente sobre qualquer versao armazenada nomeada. Passaria: readCaseInputRequirements revalidando tambem a leitura de um replay sobre sua versao fixada, recusando-a -- toda criterio se satisfaz, contradizendo a excecao que o proprio no declara.
REMAINDER, from the specification -- tres clausulas de rules/knowledge/a-case-versions-input-requirements-are-derived (o required de cada atributo, o conjunto de capacidades que respondem um conceito, e a contribuicao nula de um conceito sem resposta unica) nao sao alcancadas por nenhum criterio; pertence a tarefa que implementa a propria derivacao de requisitos de entrada -- escopo que este plano nao cobre, so a checagem de validacao sobre ela.
REMAINDER, from the specification -- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle nao e alcancada por nenhum criterio, que trata so de leitura; pertence a tarefa irma sobre a propria operacao de lifecycle (case-version-state-from-canonical-list), no mesmo epic.
ADVISORY, from the specification -- domain/knowledge/case-version-state nao entra em implements: so fornece o valor draft que o criterio 7 usa como precondicao no fixture; a independencia de estado que o criterio 7 assere ja vem de rules/knowledge/a-case-versions-input-requirements-are-derived e de rules/knowledge/validation-runs-at-every-read, ambos citados.
ADVISORY, from the specification -- o criterio 6 (recusa por CaseNotFoundError) e sustentado por rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused, fora do covers deste epic; dentro dos candidatos aparece so como a clausula de contraste de a-case-version-failing-validation-at-a-read-is-refused-by-name, que nomeia o que esse erro responde sem por si so impor a recusa -- suficiente para sustentar a implementacao.
Decision, beyond the covers — stand: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused ja e demonstravel pela clausula de contraste que os candidatos deste epic carregam; crescer o covers so para nomear formalmente uma regra que nao muda nenhum comportamento desta tarefa gastaria um rejulgamento inteiro por nada.
