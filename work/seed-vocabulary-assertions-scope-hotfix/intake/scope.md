# Correção — seed.spec.ts assume que tabelas de vocabulário compartilhadas guardam só os dados desta fixture

Comportamento observado ao rodar o sistema entregue: uma vez que `work/seed-fixture-isolation` e
`work/ensure-non-conclusion-outcomes-hotfix` e `work/seed-already-seeded-guard-hotfix` corrigem a
cadeia anterior, `seed.spec.ts` finalmente avança para além do seu próprio `beforeAll` — mas 5 dos
seus 11 testes falham porque cada um roda uma consulta **sem filtro** contra uma tabela de
vocabulário compartilhada (`public.outcomes`, `public.subject_types`, `public.actions`,
`public.recipients`, `public.concepts`/`public.concept_accepts`) e compara o resultado, com
`toEqual`, contra exatamente a lista de nomes que a própria fixture declara — por exemplo:

```ts
const { rows } = await connection.query<{ name: string }>('SELECT name FROM public.recipients');
expect(rows.map((row) => row.name).sort()).toEqual([...expected].sort());
```

Isso assumia que o `beforeAll` deste arquivo (`wipeFixtureOwnedRows`) deixa essas tabelas
genuinamente vazias antes de `seed.ts` rodar — mas `wipeFixtureOwnedRows` só apaga as linhas
**desta própria fixture**, pelo nome; nunca teve como apagar o que outro arquivo de teste deixou.

Confirmado diretamente: `store-wiring.spec.ts` (`src/src/__tests__/integration/factories/`)
também gera seus próprios concepts/subject-types por nome aleatório
(`store-wiring-concept-<uuid>`, `store-wiring-subject-<uuid>`) e também tenta limpá-los no seu
próprio `afterAll` — mas, pelo mesmo mecanismo já corrigido nas tarefas anteriores desta mesma
cadeia, uma vez que a fixture dessa própria suíte é liberada de verdade, a limpeza dela vira um
no-op permanente (tolerada por `deleteTolerantly`), e essas linhas ficam para sempre neste banco
Neon persistente e compartilhado.

Isto não é um bug novo: é a mesma tensão arquitetural de `work/seed-fixture-isolation`, agora
alcançando outras tabelas — o próprio design de "a tabela guarda exatamente isto, nada mais" só
valia enquanto nenhum outro arquivo de teste jamais deixasse nada permanentemente para trás nessas
tabelas compartilhadas. Uma vez que qualquer arquivo o faz (e, pela mesma imutabilidade de release,
sempre vai acontecer de novo com o tempo), a asserção sem filtro nunca mais pode ser genuinamente
satisfeita.

A correção decidida: reescrever essas 5 consultas para filtrar pelos nomes que a própria fixture
declara (`WHERE name = ANY($1)`), a mesma técnica que este arquivo já usa em outros pontos e que
`assertGenuinelyEmpty` já usa para o caso e os non-conclusion outcomes. Isso muda o que o teste
prova — de "a tabela não guarda nada além disto" para "a fixture está exatamente correta, com ou
sem outros dados no mesmo lugar" — e essa mudança de asserção, deliberada, é exatamente o que esta
tarefa registra.

Reproduzido com: `node --env-file=.env.test node_modules/.bin/vitest run
src/__tests__/integration/seed.spec.ts`, depois das três correções anteriores desta cadeia.
Não responde a nenhum critério de nenhuma tarefa das iniciativas já fechadas.
