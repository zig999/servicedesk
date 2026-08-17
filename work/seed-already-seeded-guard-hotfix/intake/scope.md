# Correção — seed.ts's própria guarda alreadySeeded() vira um bloqueio permanente para tudo, não só para o caso

Comportamento observado ao rodar o sistema entregue: `src/src/seed.ts`'s own top-level sequence é

```
if (!(await alreadySeeded(connection))) {
  await seedOutcomes(glossary);
  await seedRemainingVocabularies(glossary);
  await seedConcepts(connection);
  await seedCapabilities(connection);
  await seedCase(connection);
}
await verifySeededCase(connection);
```

`alreadySeeded()` responde `true` sempre que `createCaseStore(connection).assembleVersion(CASE_SLUG,
CASE_VERSION)` responde qualquer coisa além de `undefined` — exatamente a mesma checagem que
`work/seed-fixture-isolation` já corrigiu em `seed.spec.ts`'s own `assertGenuinelyEmpty`. O próprio
comentário desta função em `seed.ts` já disclosed a razão original da guarda: sem ela, rodar este
script uma segunda vez contra um banco já semeado faz `seedOutcomes`/`seedRemainingVocabularies`
(que usam `IGlossaryStore.writeTerms`, substituição total da tabela) falhar com violação de foreign
key, porque as hipóteses do caso já referenciam essas linhas de vocabulário.

Isso fazia sentido enquanto a existência do caso implicava a existência de tudo o mais que ele
precisa — mas `src/src/__tests__/integration/seed.spec.ts`'s own `wipeFixtureOwnedRows` (rodado no
`beforeAll` desse arquivo de teste, um script diferente) apaga `concepts`, `concept_accepts` e
`capabilities` de forma tolerante, independentemente do caso permanecer ou não. Agora que o caso é
legitimamente permanente (imutabilidade de release, corrigida em `work/seed-fixture-isolation`),
`alreadySeeded()` sempre responde `true` a partir da primeira liberação real — e o bloco inteiro de
reseeding (incluindo `seedConcepts`/`seedCapabilities`, que são idempotentes e nunca precisariam
estar sob essa guarda) é pulado para sempre, mesmo que `concept_accepts`/`capabilities` tenham
acabado de ser apagados pelo wipe do próprio arquivo de teste.

Reproduzido diretamente: depois de `work/seed-fixture-isolation` e
`work/ensure-non-conclusion-outcomes-hotfix` corrigirem os dois problemas anteriores desta mesma
cadeia, rodar `seed.spec.ts` isoladamente chega a `verifySeededCase` e falha com:

```
CaseNotValidError: the case "intermittent-connection-outage" at version 1 violates its validator
rules: the concept "equipment-status" does not accept the subject type "contract" the case
declares; the concept "network-outage-flag" does not accept the subject type "contract" the case
declares; no read-only capability currently answers the concept "equipment-status"; no read-only
capability currently answers the concept "network-outage-flag"
```

Confirmado por consulta direta ao banco: `concepts` existe (equipment-status, network-outage-flag,
ttl corretos), mas `concept_accepts` está vazio para ambos e nenhuma capability os referencia —
exatamente o que `seedConcepts`/`seedCapabilities` reconstituiriam, se chegassem a rodar.

`seedConcepts` (INSERT ... ON CONFLICT DO NOTHING) e `seedCapabilities` (delega a
`CapabilityRegistryService`, que substitui em vez de recusar numa re-registração) já são,
individualmente, seguros para reexecutar. A fragilidade real está apenas em `seedOutcomes` e
`seedRemainingVocabularies`, que ainda chamam `IGlossaryStore.writeTerms` (substituição total da
tabela) — exatamente o mesmo padrão que `work/ensure-non-conclusion-outcomes-hotfix` já corrigiu
para `GlossaryService.withNonConclusionOutcomes`, introduzindo `IGlossaryStore.insertMissingTerms`
(inserção aditiva, nunca um DELETE) como alternativa segura.

Não responde a nenhum critério de nenhuma tarefa das iniciativas já fechadas. Reproduzir com:
`node --env-file=.env.test node_modules/.bin/vitest run src/__tests__/integration/seed.spec.ts` contra
este banco persistente, uma vez que o caso de fixture já esteja liberado de verdade.
