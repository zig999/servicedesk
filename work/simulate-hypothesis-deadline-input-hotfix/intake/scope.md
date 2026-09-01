Correção corretiva. Comportamento errado: production-simulate-hypothesis.factory.ts define
`TOTAL_DEADLINE_BUDGET_MS = 20_000` (linha 13) e calcula `now`/`deadline` internamente
(`Date.now()` e `now + TOTAL_DEADLINE_BUDGET_MS`, linhas 41 e 50), enquanto seu arquivo irmão
simulate.factory.ts (que implementa simulate-case sobre o mesmo contrato
contracts/investigation/case-simulation) já trata `now`/`deadline` como entradas fornecidas pelo
chamador — SimulationCall não os omite do tipo que o InvestigationPipelineOptions herda. Nenhum nó
da especificação declara um deadline total próprio para simulate-hypothesis; o valor de vinte
segundos foi inventado no código sem base, reaproveitando o número da diagnose.

A tarefa é alinhar production-simulate-hypothesis.factory.ts ao mesmo padrão que
simulate.factory.ts já segue — receber now/deadline do chamador — em vez de decidir um número aqui.
Evidência completa em siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md
(achado sobre rules/investigation/an-answer-arrives-within-the-declared-deadline).