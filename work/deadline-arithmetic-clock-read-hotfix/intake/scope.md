Correção corretiva. Comportamento errado: run-diagnosis.ts e simulate-hypothesis-pipeline.ts
reconstroem "quanto tempo falta" somando as durações de estágio já medidas, em vez de ler o
relógio contra o deadline absoluto propagado no início do estágio seguinte.

- src/investigation/run-diagnosis.ts: persistenceStageBoundMs (linha 88-89) calcula
  elapsedBeforePersistenceMs somando durations.collection + durations.judgment + durations.writing
  e subtrai do deadline a partir do options.now original — nunca lê o relógio no momento em que a
  persistência de fato começa. Além disso, durations.writing pode ser undefined (ausente quando
  nenhuma consolidação rodou), e a soma incondicional pode produzir NaN nesse caso.
- src/investigation/simulate-hypothesis-pipeline.ts: o clamp do deadline de julgamento (linha 66,
  `Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS)`) ancora a janela de
  julgamento no instante de entrada da run inteira, não no instante em que o julgamento de fato
  começa — o que a coleta gastou nunca é subtraído do orçamento nominal do julgamento.

constraints/the-deadline-is-an-absolute-propagated-instant já exige "every stage receives the
minimum of its nominal budget and the remaining time" lido do relógio absoluto. Evidência completa
em siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md (nó
constraints/the-deadline-is-an-absolute-propagated-instant).