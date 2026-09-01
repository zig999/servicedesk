Correção corretiva, agora possível após a decisão de /analyse que definiu
domain/investigation/durations.total como o tempo de parede real da chamada inteira (nunca a soma
dos estágios). Comportamento errado:

- src/investigation/investigation-pipeline.ts: durationsOf (linha 114) retorna
  `total: collection + judgment + writingElapsedMs` — soma dos estágios, não tempo de parede real.
- src/investigation/simulate-hypothesis-pipeline.ts: durationsOf (linha 83) faz o mesmo,
  `total: collection + judgment`.
- src/persistence/relational-investigation-store.repository.ts: a coluna durations_writing
  (linha 46, IInvestigationRow) é declarada não-nula e sempre escrita/lida (linha 164, linhas
  413-418), embora domain/investigation/durations já exigisse (mesmo antes da decisão de hoje)
  que writing seja ausente para uma run que nunca chegou a consolidação.

Evidência completa em siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md
(nó domain/investigation/durations) e na decisão de decision-log.md sobre
domain/investigation/durations.md, field attributes.total.