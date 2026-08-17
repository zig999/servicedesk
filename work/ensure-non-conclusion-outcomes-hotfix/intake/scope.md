# Correção — GlossaryService.withNonConclusionOutcomes crasha quando um outcome já persistido é permanente

Comportamento observado ao rodar o sistema entregue: `GlossaryService.withNonConclusionOutcomes`
(`src/src/glossary/glossary.service.ts`) garante que os dois non-conclusion outcomes
(`inconclusive-no-data`, `inconclusive-hypotheses-exhausted`) existam, chamando
`this.store.writeTerms('outcome', [...held, ...missing])` sempre que algum deles falta. `writeTerms`
(`RelationalGlossaryStore`, `relational-glossary-store.repository.ts`) é documentado no próprio port
(`IGlossaryStore`) como "Replaces one term vocabulary's persisted records, whole" — dentro de uma
transação, ele faz um DELETE de toda a tabela `outcomes` e depois um INSERT de cada termo da lista
dada.

Isso é seguro apenas enquanto toda linha de `outcomes` puder ser removida. Uma vez que qualquer
outcome — o non-conclusion ou qualquer outro — está referenciado por `case_versions.fallback_outcome`
ou por `hypothesis_revisions.resolution_outcome` de uma versão já **liberada** (imutabilidade de
release, regras já existentes e corretas), esse DELETE falha com violação de foreign key (23503),
e a transação inteira estoura como `GlossaryStoreError`, não capturado em lugar nenhum acima.

Reproduzido ao rodar `src/src/__tests__/integration/seed.spec.ts` isoladamente, depois de outra
correção (work/seed-fixture-isolation) já ter avançado a execução além da sua própria checagem de
pré-condição: `caseCoherenceViolations` → `vocabularyViolations` → `GlossaryService.readVocabularyTerm`
→ `withNonConclusionOutcomes` → `writeTerms` estoura com:

```
error: update or delete on table "outcomes" violates foreign key constraint
"hypothesis_revisions_resolution_outcome_fkey" on table "hypothesis_revisions"
Key (name)=(case-query-outcome-f3e7f87a-ca23-4b5e-baae-e6e1e7bb986a) is still referenced from table
"hypothesis_revisions".
```

O nome citado (`case-query-outcome-<uuid>`) é uma linha residual de alguma suíte de teste anterior
que gera nomes aleatórios e nunca os limpa — mas a causa raiz não depende de lixo de teste: **basta
que qualquer outcome, non-conclusion ou não, esteja permanentemente referenciado por uma versão
liberada em qualquer lugar deste banco persistente** para que este caminho de código quebre, porque
ele tenta substituir a tabela inteira sempre que só precisa garantir que dois nomes específicos
existam.

Este projeto usa um branch Neon dedicado e persistente para os testes automatizados
(`docs/` ou `test:` já documentam isso nesta sessão) — o estado acumula entre execuções, então a
probabilidade de algum outcome estar permanentemente referenciado só cresce com o tempo. Não é
um defeito introduzido por nenhuma correção desta sessão: é uma fragilidade pré-existente do próprio
mecanismo de escrita, que simplesmente nunca tinha sido exercitada nesse estado até agora.

Não responde a nenhum critério de nenhuma tarefa das iniciativas já fechadas
(`glossary-vocabulary`/`relational-persistence`, que entregaram `writeTerms` como "substitui tudo" —
uma semântica legítima para autoria de vocabulário, só incompatível com o uso que
`withNonConclusionOutcomes` faz dela).

Reproduzir com: `npm test` em `src/`, ou isoladamente
`node --env-file=.env.test node_modules/.bin/vitest run src/__tests__/integration/seed.spec.ts` contra
este banco persistente, uma vez que qualquer outcome esteja permanentemente referenciado.
