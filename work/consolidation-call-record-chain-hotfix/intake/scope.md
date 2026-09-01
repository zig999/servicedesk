Correção corretiva. Uma tarefa, sem survey nem decomposição.

Comportamento errado: o registro da chamada de escrita (register/usage/elapsed_ms/prompt) que a
consolidação produz nunca alcança o assessment retornado nem o armazenado, embora
domain/investigation/assessment já exija os quatro atributos como obrigatórios.

- src/investigation/assessment-consolidator.port.ts: o tipo de retorno ConsolidationOutcome não
  tem campo `register`, e o parâmetro `consolidationRegister` do método `consolidate` é
  obrigatório, o que impede o adapter de devolver o register que ele mesmo decidiu usar (inclusive
  o default do adapter quando a versão do caso não declara um).
- src/investigation/draft-assessment-text.ts: draftAssessment lê só `text` da chamada de
  consolidação (linha 21) e constrói um Assessment de quatro campos (outcome, referral, text,
  determining_hypothesis condicional), sem register/usage/elapsed_ms/prompt.
- src/investigation/investigation-pipeline.ts: o prompt de escrita vai para um campo irmão
  (`prompts.writing`) em vez de no próprio assessment retornado.
- src/persistence/relational-investigation-store.repository.ts: IInvestigationRow e as colunas de
  escrita/leitura do assessment (assessment_outcome, assessment_action, assessment_recipient,
  assessment_determining_hypothesis, assessment_text) não têm nenhuma coluna para register, usage,
  elapsed_ms ou prompt, então o investigation armazenado nunca guarda os quatro atributos.

O nó já exige os quatro atributos (domain/investigation/assessment) — a especificação está certa;
o código não implementa. Evidência completa no achado correspondente de
siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md (nó
domain/investigation/assessment e domain/investigation/assessment-consolidator).
