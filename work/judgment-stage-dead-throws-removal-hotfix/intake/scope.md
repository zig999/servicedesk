Correção corretiva, decidida como remoção de código morto (não alcançável) pelo humano
responsável por esta reconciliação. Comportamento a remover: em judgment-stage.ts,
hypothesisNamed (linha 214) lança um Error genérico quando um nome vindo de
requires-evaluation-of(case) não resolve para nenhuma hipótese do case, e evidenceFor (linha 222)
lança um Error genérico quando o mapa de evidência não tem entrada para uma hipótese obrigatória.
Ambas as condições já são inalcançáveis pelas garantias que a própria especificação já dá: o nome
vem de uma derivação sobre o manifest do próprio case (domain/knowledge/case-version), e a
evidência é construída a partir do plano de coleta do mesmo case
(rules/investigation/one-evaluation-per-required-hypothesis, rules/investigation/one-evidence-per-collected-concept).

A tarefa é remover os dois throws sem substituí-los por um novo comportamento, mantendo o restante
de judgeHypotheses inalterado. Evidência completa em
siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md (nós
domain/knowledge/case-version e rules/investigation/one-evaluation-per-required-hypothesis).