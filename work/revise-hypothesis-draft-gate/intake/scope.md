# Correção — revise-hypothesis nunca checa se o caso tem um draft aberto

Comportamento observado ao rodar o sistema entregue: `revise-hypothesis.operation.ts`'s own
`reviseHypothesis` origina uma nova identidade de hipótese e sua primeira revisão para qualquer
slug de caso, mesmo quando esse caso não tem nenhuma versão em estado `draft` (nunca foi
originado nenhum draft, ou o único draft já foi liberado/descartado). `rules/knowledge/
a-hypothesis-is-revised-only-against-its-cases-draft` declara que uma hipótese só é revisada
enquanto o caso tem um draft — mas nada no código hoje aplica essa checagem.

Isto não é um bug novo: a própria implementação original já disclosed isso, explicitamente, na
tarefa que a entregou — o cabeçalho de `revise-hypothesis.operation.ts` (linhas ~26-35) contém uma
nota `UNDERDETERMINED` dizendo textualmente que "the whole 'revised only against a draft' gate
belongs to a broader check this task does not close, and nothing here contradicts it." Essa nota
nunca foi fechada por nenhuma tarefa depois, e a iniciativa `case-lifecycle` já fechou
(`closure.md`), então a checagem nunca chegou a existir.

Reproduzido por `src/src/__tests__/integration/case/revise-hypothesis.operation.spec.ts`'s próprio
teste "excludes an implementation that originates a hypothesis identity and revision for a case
holding no draft version at all, without refusing" — que já existia como teste, mas descreve
exatamente uma exclusão (UNDERDETERMINED) que nenhuma implementação jamais satisfez.

Nenhuma porta de armazenamento hoje oferece "qual é a versão em draft deste caso, se houver" —
`ICaseStore.assembleVersion` exige slug+version explícitos, não "a versão draft atual". Este
incremento provavelmente precisa de um novo método de leitura na porta, além da checagem na
própria operação.

Responde a nenhum critério de nenhuma tarefa das iniciativas fechadas (`case-lifecycle`,
`relational-persistence`). Reproduzir com: `npm test` em `src/`, ou especificamente
`src/src/__tests__/integration/case/revise-hypothesis.operation.spec.ts`.
