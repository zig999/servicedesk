Correção corretiva. Comportamento errado: em judgment-stage.ts, a checagem de contenção
de citação (todo concept citado pertence ao collects da hipótese julgada) só roda para veredito
confirmado ou refutado. runIsolatedCall (linhas 89-93) retorna cedo quando
first.verdict === 'inconclusive', antes de construir o HypothesisCitationContext — então uma
resposta do avaliador que vem inconclusiva mas ainda carrega citações (o tipo EvaluationOutcome
permite isso: a branch não-decidida tem `citations: readonly Citation[]`, não proibida de ter
itens) nunca passa pela checagem que a regra exige.

A regra rules/investigation/a-citation-stays-within-the-hypothesis-collects já declara "Every
concept an evaluation cites belongs to the collects of the hypothesis-revision it judges" — sem
exceção para veredito inconclusivo. Evidência completa em
siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md (nó
rules/investigation/a-citation-stays-within-the-hypothesis-collects, achado sobre judgment-stage.ts).