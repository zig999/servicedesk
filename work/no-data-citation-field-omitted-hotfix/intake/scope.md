Correção corretiva, agora possível após a decisão de /analyse que tornou
domain/investigation/citation.field ausente (em vez de obrigatório) para uma citação que
fundamenta um veredito no-data. Comportamento errado:

- src/investigation/judgment-stage.ts: noDataEvaluation (linha 232) constrói
  `citations: nonOkEvidence.map((item) => ({ concept: item.concept, field: '' }))` — usa string
  vazia como sentinela.
- src/investigation/anthropic-hypothesis-evaluator.adapter.ts: noDataOutcome (linha 88) faz o
  mesmo, `citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept, field: '' }))`.

A especificação agora decide que field é ausente nesse caso, nunca uma string vazia. Evidência
completa em siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md (nós
domain/investigation/citation e rules/investigation/a-cited-field-exists-in-the-capability-output-schema)
e na decisão de decision-log.md sobre domain/investigation/citation.md, field attributes.field.