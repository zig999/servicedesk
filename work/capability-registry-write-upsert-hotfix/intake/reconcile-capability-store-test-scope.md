# Correção — teste de RelationalCapabilityStore afirma o whole-table-replace removido

Comportamento observado ao rodar a suíte após a entrega do incremento corretivo anterior
(`task/capability-registry-write-upsert-hotfix/scope-write-to-identity`, que trocou o
delete-all/insert-all de `writeCapabilities` por um upsert escopado por identidade): a suíte
falha em exatamente 1 teste entre 1460, em
`src/src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts:251`
— `it('answers a read as the database holds it right now, never a value an earlier read already
answered', ...)`.

Esse teste escreve `capability-a` via `store.writeCapabilities([capability-a])`, lê, escreve
`capability-b` via `store.writeCapabilities([capability-b])`, e espera que a leitura seguinte
responda **só** `capability-b` — ou seja, que `capability-a` tenha sumido. Isso só era verdade
sob o mecanismo antigo (delete-all/insert-all): `writeCapabilities` recebendo um array virava a
tabela inteira. Esse teste pré-existe ao incremento corretivo acima e não foi tocado pelo
`test-author` que o entregou.

Diagnóstico (failure-diagnostician, causa `test`): a task dona desse arquivo,
`task/relational-stores/capability-store` (iniciativa `relational-persistence`, já fechada com
`closure.md`), declara como critério "A read answers the registration as the database holds it
at that call, never a value held from an earlier call" — sobre ausência de cache, nunca sobre
uma escrita apagar o resto da tabela. Nenhum critério daquela task afirma
"whole-table-replace". O teste antigo afirmava mais do que seu próprio critério estabelecia, e
o incremento corretivo anterior falsificou legitimamente esse excesso — mas a rota mecânica
comum para esse caso (re-entrega só-da-prova sobre a task dona do teste) está bloqueada: sua
iniciativa está fechada, e `/implement-task` recusa escrever contra um work root com
`closure.md`.

Correção: o teste em `relational-capability-store.repository.spec.ts:251` passa a afirmar o
contrato de upsert-por-identidade já declarado — uma escrita de uma identidade nova nunca
apaga uma identidade diferente já registrada; uma leitura responde o estado corrente do banco a
cada chamada, sem cache. Nada no store em si precisa mudar: o comportamento já está correto
(entregue pela task acima); o que está errado é a asserção do teste.

Responde a nenhum critério de nenhuma task existente sob esta iniciativa — é uma correção nova,
decidida pelo humano, dentro da mesma iniciativa aberta `capability-registry-write-upsert-hotfix`,
precisamente para não reabrir `relational-persistence`.

Reproduzir com: `npm test` em `src/`, contra o banco de teste real — o teste citado é o único
que falha.
