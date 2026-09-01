Correção corretiva. Comportamento errado: em run-diagnosis.ts, buildInvestigationOptions
(linha 64) grava written_at como `new Date(options.now).toISOString()` — o instante em que a
requisição entrou — em vez do instante em que a escrita de fato se assenta no store.

domain/investigation/investigation já declara: "written_at records when the one write happened".
Evidência completa em siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md
(nó domain/investigation/investigation).