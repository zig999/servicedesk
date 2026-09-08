---
title: The capability-registry contract is bound only to files holding its operations
summary: The trace stops asserting that src/src/investigation/judgment-stage.ts answers for contracts/integration/capability-registry,
  while every other node that file answers for stays bound.
rationale: I cut this as its own task because its outcome is a binding assertion rather than a behavior,
  so it is neither demonstrable by nor falsifiable with any of the source corrections in this plan.
sources:
- intake/scope.md
objective: The trace no longer asserts that src/src/investigation/judgment-stage.ts answers for contracts/integration/capability-registry.
criteria:
- The nodes src/src/investigation/judgment-stage.ts is bound to do not include contracts/integration/capability-registry.
- Every other node src/src/investigation/judgment-stage.ts was bound to is still bound to it, constraints/hypotheses-are-judged-in-isolated-parallel-calls
  and rules/investigation/one-evaluation-per-required-hypothesis among them.
- The files holding the four operations of contracts/integration/capability-registry remain bound to that
  contract, src/src/capability-registry/capability-registry.service.ts among them.
- The content of src/src/investigation/judgment-stage.ts is unchanged.
- The recorded finding against the pair contracts/integration/capability-registry and src/src/investigation/judgment-stage.ts
  is no longer open.
implements:
- contracts/integration/capability-registry
---
## What it is
contracts/integration/capability-registry publica quatro operacoes: read-capability, read-capability-by-identity, list-capabilities e register-capability.
O trace vincula esse contrato aos arquivos que de fato guardam essas operacoes, e tambem a src/src/investigation/judgment-stage.ts, um modulo sobre prazos de pool de hipoteses, novas tentativas de citacao e formatacao de avaliacao.
Um leitor que segue esse vinculo para achar onde a superficie sincrona do registro esta implementada chega a um arquivo que nao guarda nenhuma das quatro operacoes.

## Notes
REMAINDER, from the specification -- toda clausula de rules/integration/an-http-connector-configuration-declares-its-call (as tres chaves obrigatorias, o vocabulario no result detail, o mecanismo de placeholder, os desfechos de montagem) nao e alcancada por esta tarefa, que nao muda codigo nenhum (o criterio 4 exige o conteudo de judgment-stage.ts inalterado) e so mexe em vinculos do trace. Coberto pela tarefa irma malformed-configuration-vocabularies, no mesmo epic.
ADVISORY, from the specification -- domain/investigation/evidence-result e candidato do epic mas nenhum criterio desta tarefa o alcanca; coberto pela tarefa irma malformed-configuration-vocabularies.
ADVISORY, from the specification -- o criterio 2 cita constraints/hypotheses-are-judged-in-isolated-parallel-calls e rules/investigation/one-evaluation-per-required-hypothesis, ambos fora do covers deste epic. Nenhum no de especificacao declara a quais arquivos o trace vincula outro no -- isso e do proprio trace, nao da especificacao -- entao o criterio e checado contra o estado anterior do trace, e implements nao precisa crescer para cobri-los.
Decision, beyond the covers — stand: constraints/hypotheses-are-judged-in-isolated-parallel-calls so aparece como identidade a preservar no trace, nunca como fato que esta tarefa implementa ou contradiz; crescer o covers do epic para nomea-lo formalmente misturaria o vinculo do trace com o conteudo desse no, que pertence a outro julgamento.
Decision, beyond the covers — stand: rules/investigation/one-evaluation-per-required-hypothesis so aparece como identidade a preservar no trace, nunca como fato que esta tarefa implementa ou contradiz; crescer o covers do epic para nomea-lo formalmente misturaria o vinculo do trace com o conteudo desse no, que pertence a outro julgamento.
