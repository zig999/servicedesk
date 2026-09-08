---
title: written_at is a required attribute of the Investigation type
summary: The Investigation type declares written_at as required, matching the attribute declaration in
  domain/investigation/investigation.
rationale: I cut this as one task because the required-ness of one attribute in one type declaration is
  a single outcome; the scope listed the finding and stated no cut.
sources:
- intake/scope.md
objective: The Investigation type in src/src/investigation/investigation.ts declares written_at as a required
  attribute, so no value lacking it is an Investigation.
criteria:
- The Investigation type declares written_at without an optional marker.
- An object lacking written_at is rejected by the compiler where an Investigation is expected.
- No producer of an Investigation acquires a written_at assignment it did not already make.
- The declared type of written_at remains the datetime representation it already carries.
implements:
- domain/investigation/investigation
- rules/investigation/written-at-records-when-the-write-settled
---
## What it is
domain/investigation/investigation declara written_at obrigatorio, ao lado de id, requester, narrative, subject, prompt_version, model, evidence, evaluations, assessment, cost e durations.
O tipo declara opcional, entao um registro sem instante de escrita passa a checagem de tipo como uma investigacao completa.

## Notes
UNDERDETERMINED, from the specification -- nenhum criterio diz a forma que o conteudo pre-settle assume no codigo-fonte, entao os criterios sao satisfeitos por asserir esse conteudo dentro do proprio tipo Investigation (via cast ou non-null assertion), em vez de declarar written_at obrigatorio de verdade e dar ao conteudo pre-settle uma identidade propria. rules/investigation/written-at-records-when-the-write-settled declara que o que a persistencia entrega ao store e o conteudo da investigacao menos written_at, e que o modelo de dominio nao declara um segundo elemento para uma investigacao montada mas ainda nao assentada; nenhum criterio exclui a saida do cast. Passaria: declarar written_at obrigatorio no tipo, provar o criterio 2 com um exemplo de rejeicao em tempo de tipo, e manter cada produtor sem written_at compilando via cast, non-null assertion, ou uma segunda interface declarada a mao repetindo todo atributo de Investigation exceto written_at.
REMAINDER, from the specification -- tres clausulas de rules/investigation/written-at-records-when-the-write-settled nao sao alcancadas por nenhum criterio desta tarefa: que written_at guarda o instante em que o store assentou a escrita (nunca o instante da chegada do pedido, nunca o instante em que uma tentativa de escrita foi emitida); que, havendo duas tentativas, exatamente uma persiste o registro e o written_at persistido e o instante de assentamento dessa escrita, inalterado por uma tentativa posterior que assenta ao encontrar o registro ja presente; e que o store responde a investigacao persistida com written_at ja fixado. Pertence a uma tarefa irma sobre o proprio estagio de persistencia -- esta iniciativa nao contem tal tarefa, entao essa clausula fica como escopo que este plano ainda nao cobre.
