# Orçamento de tempo (deadlines)

## 17 Orçamento de tempo

### 17.1 Por que existe um orçamento

O diagnóstico é síncrono: o atendente aguarda na tela pela resposta de `POST /v1/diagnose` (`knowledge/constraints/diagnosis-answers-synchronously.md`). Se a resposta demorar mais que o timeout do cliente HTTP, o atendente vê um erro de rede em vez de um parecer degradado — e um parecer degradado ("inconclusivo por falta de tempo") é um resultado útil, enquanto um timeout não é. Por isso a especificação fixa um prazo total e exige que ele seja menor que o timeout do chamador (`knowledge/rules/investigation/an-answer-arrives-within-the-declared-deadline.md`).

A regra propõe **vinte segundos** no total, decompostos assim — proposta de engenharia "pendente de confirmação operacional", nas palavras do próprio nó:

| Fatia declarada na especificação | Valor proposto |
|---|---|
| Overhead e margem | 2 s |
| Coleta de evidências | 7 s |
| Julgamento | 5 s |
| Redação (consolidação) | 4 s |
| Persistência | 2 s |
| **Total** | **20 s** |

Nem toda fatia dessa tabela está implementada como limite (§17.4). Este capítulo descreve o que o código faz hoje.

### 17.2 A regra central: um instante absoluto, propagado

`knowledge/constraints/the-deadline-is-an-absolute-propagated-instant.md`:

> Uma requisição registra um deadline absoluto na entrada; cada etapa recebe o mínimo entre seu orçamento nominal e o tempo restante; e o total interno fica abaixo do timeout do chamador com margem.

A justificativa no mesmo nó: somar orçamentos por etapa e chamar a soma de deadline não deixa nada para o overhead *entre* etapas. Com um instante absoluto, uma etapa que termina cedo devolve o saldo à seguinte, uma que atrasa toma das que vêm depois, e "a última a rodar paga".

A implementação dessa disciplina tem duas partes, complementares:

1. **O par `(now, deadline)` é calculado uma vez** e injetado como parâmetro em toda a cadeia. Nenhum módulo de `src/investigation/` lê `Date.now()`; `run-diagnosis.ts` tem um teste que verifica a ausência literal de `Date.now()`, `new Date()` sem argumento e `performance.now()` no arquivo (`src/__tests__/unit/investigation/run-diagnosis.spec.ts`).
2. **Cada etapa intersecta seu orçamento nominal com o que resta**: `Math.min(ORÇAMENTO_DA_ETAPA, deadline - now)`.

### 17.3 Onde o deadline nasce

`src/factories/production-diagnose.factory.ts`:

```ts
const TOTAL_DEADLINE_BUDGET_MS = 20_000;

export function createProductionDiagnoseRunner(dependencies): (call: ProductionDiagnoseCall) => Promise<Assessment> {
  const runner = createDiagnoseRunner({ ... });
  return (call: ProductionDiagnoseCall): Promise<Assessment> => {
    const now = Date.now();
    return runner({ ...call, now, deadline: now + TOTAL_DEADLINE_BUDGET_MS });
  };
}
```

Este é o **único** lugar em produção onde o relógio é lido para fins de prazo. `now` e `deadline` são inteiros em milissegundos desde a época (epoch), e a partir daqui viajam inalterados por `createDiagnoseRunner` (`src/factories/diagnose.factory.ts`) até `runDiagnosis` (`src/investigation/run-diagnosis.ts`), que os repassa a cada etapa.

Observe que o instante é tomado **depois** que o controlador já leu e validou o caso (`caseQuery.readCase`, em `src/http/diagnose.controller.ts`). O tempo gasto lendo o caso — que inclui validação estrutural e de coerência contra o glossário e o registro de capabilities — **não conta** contra os 20 s.

```mermaid
sequenceDiagram
    participant C as Cliente HTTP
    participant R as diagnose.routes / controller
    participant F as production-diagnose.factory
    participant RD as runDiagnosis
    participant COL as collectEvidence
    participant JUD as judgeHypotheses
    participant DRA as draftAssessment
    participant PER as writeWithinDeadline
    C->>R: POST /v1/diagnose
    R->>R: readCase (fora do orçamento)
    R->>F: runDiagnose(call)
    F->>F: now = Date.now(); deadline = now + 20000
    F->>RD: { ...call, now, deadline }
    RD->>COL: now, deadline → teto = min(7000, deadline−now)
    COL-->>RD: Evidence[] (timeout vira result 'timeout')
    RD->>JUD: now, min(deadline, now+5000)
    JUD-->>RD: Evaluation[] (estouro vira 'deadline-exceeded')
    RD->>DRA: (sem prazo)
    DRA-->>RD: Assessment
    RD->>PER: now, deadline → limite = min(2000, deadline−now)
    alt gravou a tempo
        PER-->>RD: ok
        RD-->>C: 200 Assessment
    else estourou
        PER-->>RD: InvestigationWriteDeadlineExceededError
        RD-->>C: 500 INTERNAL_ERROR
    end
```

### 17.4 Como o orçamento é repartido entre as etapas

| Etapa | Constante | Valor | Onde a constante vive | Quem intersecta com o restante | Como o limite é aplicado |
|---|---|---|---|---|---|
| Coleta | `COLLECTION_STAGE_BUDGET_MS` | 7 000 ms | `src/investigation/evidence-collection-stage.ts` | A própria etapa: `stageCeilingMs = max(0, min(7000, deadline − now))` | Um `setTimeout` por conceito, com `min(capability.timeout, stageCeilingMs)`; `Promise` da observação corre contra ele |
| Julgamento | `JUDGMENT_STAGE_BUDGET_MS` | 5 000 ms | `src/investigation/run-diagnosis.ts` | `runDiagnosis`, ao montar as opções: `deadline: min(deadline, now + 5000)`; a etapa recebe o par e calcula `remainingMs = max(0, deadline − now)` | Um **único** `DeadlineGuard` compartilhado (§17.6) contra o qual toda espera por vaga no pool e toda chamada `evaluate()` correm |
| Redação | — | — | — | — | **Não implementado.** `draftAssessment` não recebe prazo e roda sem limite |
| Persistência | `PERSISTENCE_STAGE_BUDGET_MS` | 2 000 ms | `src/investigation/run-diagnosis.ts` | `runDiagnosis`: `boundMs = min(2000, max(0, deadline − now))` | Um `setTimeout` contra a `Promise` de `store.write()` |
| Overhead / margem | — | o que sobra | — | — | Não há mecanismo; é o que resta dos 20 s |

Um detalhe do código merece ser dito com clareza, porque afeta como ler a tabela: **o `now` que chega a cada etapa é sempre o instante de início da execução**, não o instante em que a etapa começa. `runDiagnosis` repassa `options.now` inalterado a todas as etapas, e nenhuma delas relê o relógio. Consequências:

- Em produção, `deadline − now` vale **sempre 20 000 ms** em toda etapa, porque a fábrica acabou de definir `deadline = now + 20000`. Portanto `min(7000, 20000) = 7000`, `min(5000, 20000) = 5000`, `min(2000, 20000) = 2000`: em produção, o orçamento nominal de cada etapa é sempre o que vale, e o ramo "o que resta do deadline" só se torna efetivo quando um chamador (por exemplo, um teste) passa um `deadline` mais apertado que `now + 7000/5000/2000`.
- Os temporizadores de cada etapa **começam quando a etapa começa** (`setTimeout` criado dentro de `collectEvidence`, `createDeadlineGuard`, `racePersist`). Assim, o julgamento tem 5 s a partir do momento em que é chamado, independentemente de quanto a coleta consumiu antes. O pior caso teórico em produção é a soma dos tetos por etapa (7 + 5 + 2 s) mais a redação sem limite mais o overhead — não um instante absoluto de 20 s a partir do início. Os testes de `run-diagnosis.spec.ts` ("bounds persistence at what remains of the declared deadline when that is smaller than the nominal two-second budget") demonstram a intersecção com um `deadline` estreito fornecido pelo chamador.

Em outras palavras: a disciplina de *não reler o relógio* está integralmente implementada; a propriedade de *instante absoluto que redistribui saldo entre etapas* vale conforme o `deadline` que o chamador injeta, e o chamador de produção injeta sempre `now + 20 s` com `now` congelado no início.

### 17.5 A coleta: dois limites por chamada

Para cada conceito do plano de coleta, `collectOneEvidence` (`src/investigation/evidence-collection-stage.ts`) calcula:

```ts
const stageCeilingMs = Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS, deadline - now));   // por etapa
const effectiveBoundMs = Math.max(0, Math.min(capability.timeout, stageCeilingMs));          // por chamada
```

| Limite | Fonte | Papel |
|---|---|---|
| `capability.timeout` | Coluna `timeout` da capability registrada (`src/capability-registry/capability.ts`; padrão `DEFAULT_CAPABILITY_TIMEOUT_MS = 60000` quando o registro não declara) | Orçamento de **uma** chamada àquela capability (`knowledge/rules/integration/a-capability-declares-its-contract.md`) |
| `stageCeilingMs` | 7 000 ms intersectado com o restante | Teto que a etapa inteira nunca ultrapassa, "seja qual for a capability mais lenta" (`knowledge/rules/investigation/collection-has-its-own-budget-within-the-total.md`) |

O cenário `knowledge/scenarios/investigation/a-slow-capability-yields-to-the-collection-budget.md` fixa o comportamento: capability com timeout de 10 s, orçamento da etapa de 7 s → a evidência registra `timeout` aos 7 s, e "os três segundos que o timeout da capability ainda tinha" não importam. Por isso o `docs/cases/_registry/README.md` observa que declarar um `timeout` acima de 7 000 ms é "declarar um número que o motor não pode honrar".

Todas as chamadas de coleta são disparadas em paralelo (`Promise.all`) no mesmo tick, então um temporizador novo por chamada é suficiente — diferente do julgamento (§17.6).

Há ainda um **terceiro** temporizador, dentro do adaptador HTTP de observação: `HttpDeclarativeObservationSource` (`src/investigation/http-declarative-observation-source.adapter.ts`) aborta o `fetch` via `AbortController` ao fim de `capability.timeout` (`issueConnectorHttpCall`, `src/http-connector/connector-http-issuer.ts`) e devolve `{ result: 'timeout' }`. Esse aborto interrompe a conexão de rede de fato; a corrida da etapa apenas deixa de esperar. Quando `capability.timeout ≤ 7000`, é normalmente o adaptador que responde `timeout`; quando `capability.timeout > stageCeilingMs`, é a corrida da etapa que vence primeiro e a `Promise` do adaptador segue em segundo plano até o próprio aborto.

### 17.6 O julgamento: um sinal de prazo compartilhado (`DeadlineGuard`)

`judgeHypotheses` (`src/investigation/judgment-stage.ts`) não pode criar um temporizador por chamada como a coleta faz, porque as chamadas ao avaliador **não começam no mesmo instante**: cada hipótese espera uma vaga em um pool de tamanho `poolSize` (`CallPool`) e começa quando a vaga é liberada. Criar um `setTimeout(5000)` no início de cada chamada daria a uma hipótese enfileirada mais tempo do que o restante da etapa permite. A solução é um sinal único:

```ts
type DeadlineGuard = {
  readonly signal: Promise<DeadlineMarker>;   // resolve com DEADLINE_ELAPSED quando o teto expira
  readonly elapsed: () => boolean;           // leitura síncrona do mesmo fato
};

function createDeadlineGuard(remainingMs: number): DeadlineGuard {
  let hasElapsed = remainingMs <= 0;
  const signal = new Promise<DeadlineMarker>((resolve) => {
    if (hasElapsed) { resolve(DEADLINE_ELAPSED); return; }
    setTimeout(() => { hasElapsed = true; resolve(DEADLINE_ELAPSED); }, remainingMs);
  });
  return { signal, elapsed: () => hasElapsed };
}
```

Criado **uma vez** por chamada de `judgeHypotheses`, com `remainingMs = max(0, deadline − now)` (onde `deadline` já foi intersectado com `now + 5000` por `runDiagnosis`), o guard é usado em quatro pontos:

| Ponto | Uso | Efeito ao expirar |
|---|---|---|
| `acquireSlotOrDeadline` | `Promise.race([pool.acquire(), guard.signal])`, precedido de `guard.elapsed()` síncrono | A hipótese **não chama** `evaluate()`; sai como `inconclusive` / `deadline-exceeded` sem custo. Se a vaga chegar depois, é liberada imediatamente |
| `raceEvaluateAgainstDeadline` (1ª chamada) | `Promise.race([evaluator.evaluate(...), guard.signal])` | `inconclusive` / `deadline-exceeded` |
| `retryOrFail`, antes da retentativa | `guard.elapsed()` síncrono | Se já expirou, **não há retentativa** e a hipótese sai como `inconclusive` / `judgment-failure` (a primeira resposta tinha citação inválida; o motivo registrado é o da falha de julgamento, não de prazo) |
| `raceEvaluateAgainstDeadline` (retentativa) | Idem à 1ª | `inconclusive` / `deadline-exceeded` |

A escolha do motivo segue `knowledge/rules/investigation/an-inconclusive-evaluation-declares-its-reason.md`: "um julgamento que nunca recebeu vaga, ou que começou e não retornou a tempo, é deadline-exceeded: nada falhou e o dado chegou". O cenário `knowledge/scenarios/investigation/a-queued-judgment-is-deadline-exceeded.md` reforça que ler uma fila saturada como problema de prompt "aponta a curadoria para o lugar errado" — e é por isso que a distinção entre os três motivos é preservada.

Uma chamada `evaluate()` que perdeu a corrida **continua em execução** no provedor até terminar por conta própria; nada a cancela. O custo dessa chamada é real, ainda que a resposta seja descartada.

Detalhe de `evaluate()` de produção: `AnthropicHypothesisEvaluator` não impõe timeout próprio ao SDK da Anthropic; o único limite temporal do julgamento é o guard da etapa.

### 17.7 A redação: sem limite

`draftAssessment` (`src/investigation/draft-assessment-text.ts`) não recebe `now`/`deadline`, e `runDiagnosis` a aguarda sem corrida. A fatia de 4 s prevista na especificação **não está implementada**. O cabeçalho de `run-diagnosis.ts` registra a lacuna: "Drafting (draft-assessment-text.ts) takes no deadline parameter at all and is called unbounded — an existing gap in that already-delivered module". Além disso, `AnthropicAssessmentConsolidator` não passa timeout ao SDK. Na prática, uma chamada de consolidação lenta estende o tempo total além dos 20 s sem que nada a interrompa, e o único limite efetivo passa a ser o timeout do cliente HTTP que chamou `POST /v1/diagnose`.

### 17.8 A persistência: prazo que vira erro

`writeWithinDeadline` (`src/investigation/run-diagnosis.ts`) corre `store.write(investigation)` contra `min(2000, max(0, deadline − now))` ms. Diferente das etapas anteriores, o estouro **não vira dado**: lança `InvestigationWriteDeadlineExceededError` (`src/errors/investigation-write-deadline-exceeded.error.ts`) e nenhum `Assessment` é devolvido. A justificativa está em `knowledge/rules/investigation/no-stage-aborts-on-its-deadline.md` ("persistence cannot degrade because no response exists without a record") e no cenário `knowledge/scenarios/investigation/no-response-without-a-record.md`. Ver [Resolução, consolidação e gravação](10-resolucao-consolidacao-gravacao.md), §16.5.

A regra menciona que a persistência "retries within what remains"; retentativa **não está implementada** — uma única tentativa.

### 17.9 Tabela: etapa × o que acontece quando o prazo estoura

| Etapa | Limite efetivo | O que estourou | Como fica registrado | O que o requerente vê | Fonte |
|---|---|---|---|---|---|
| Leitura do caso | Nenhum | — | — | — | Fora do orçamento (§17.3) |
| Coleta — uma capability | `min(capability.timeout, min(7000, deadline−now))` | A observação de um conceito não resolveu | `Evidence` com `result: 'timeout'`, `observation: ''`, `result_detail: "no observation within <N>ms"`, `origin`, `capability_name`/`version` preenchidos | Nenhum erro; o pipeline segue. A(s) hipótese(s) que coletam esse conceito viram `inconclusive` / `no-data`, citando `{ concept, field: '' }` | `settledEvidence`, `src/investigation/evidence-collection-stage.ts`; `noDataEvaluation`, `src/investigation/judgment-stage.ts`; `knowledge/scenarios/investigation/a-collection-timeout-degrades-to-no-data.md` |
| Coleta — sem capability registrada para o conceito | — (não há chamada) | Não é estouro; registrado aqui por produzir o mesmo efeito downstream | `Evidence` com `result: 'unavailable'`, `origin: ''`, `capability_name: ''`, `result_detail: "no capability is currently registered for concept ..."` | Idem: `no-data` para as hipóteses envolvidas | `unavailableEvidence` |
| Julgamento — espera por vaga no pool | `min(5000, deadline−now)` a partir do início da etapa | A hipótese não obteve vaga antes do guard expirar | `Evaluation` com `verdict: 'inconclusive'`, `reason: 'deadline-exceeded'`, `citations: []` | Nenhum erro; a hipótese não confirma; nenhuma chamada de LLM foi feita | `acquireSlotOrDeadline`; `knowledge/scenarios/investigation/a-queued-judgment-is-deadline-exceeded.md` |
| Julgamento — chamada `evaluate()` (1ª ou retentativa) | Idem | A chamada não retornou antes do guard | `inconclusive` / `deadline-exceeded`, `citations: []` | Nenhum erro; a hipótese não confirma; a chamada segue no provedor em segundo plano | `raceEvaluateAgainstDeadline` |
| Julgamento — retentativa impedida | Idem | 1ª resposta com citação inválida e guard já expirado ao decidir retentar | `inconclusive` / **`judgment-failure`**, `citations: []` | Nenhum erro; a hipótese não confirma | `retryOrFail`; `knowledge/scenarios/investigation/a-foreign-citation-is-refused.md` ("the deadline beats the retry, always") |
| Redação | Nenhum | — | — | Latência adicional sem limite; uma falha do provedor propaga como 500 | `src/investigation/draft-assessment-text.ts`; §17.7 |
| Persistência | `min(2000, max(0, deadline−now))` | `store.write()` não resolveu no limite | **Nada** é registrado com garantia — a transação pode ou não concluir depois; nenhum `Assessment` sai | `500` com `{ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } }` (o erro não está em `src/errors/status-map.ts`) | `writeWithinDeadline`; `src/http/error-handler.middleware.ts`; `src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts` |

Regra que sustenta todas as linhas de coleta e julgamento: `knowledge/rules/investigation/no-stage-aborts-on-its-deadline.md` — "nenhuma etapa aborta por estouro de prazo: a coleta registra um resultado timeout e o julgamento registra deadline-exceeded, com a persistência como a única exceção declarada".

### 17.10 Variáveis de ambiente envolvidas

**Nenhuma variável de ambiente configura um prazo.** Os quatro valores (20 000, 7 000, 5 000, 2 000 ms) são constantes de código. O schema de ambiente (`src/config/env.ts`) não declara nada com "DEADLINE", "TIMEOUT" ou "BUDGET" no nome. As variáveis abaixo **influenciam** quanto tempo cada etapa tende a consumir, sem alterar os limites:

| Variável | Tipo / validação (`src/config/env.ts`) | Efeito sobre o tempo |
|---|---|---|
| `POOL_SIZE` | inteiro positivo, obrigatório | Quantas chamadas `evaluate()` ficam em voo ao mesmo tempo no julgamento. Um pool menor que o número de hipóteses do caso força enfileiramento dentro dos mesmos 5 s; hipóteses que não obtêm vaga saem como `deadline-exceeded` |
| `EVALUATOR_MODEL` | string não vazia, obrigatória | Modelo do julgamento; modelos diferentes têm latências diferentes. Também é o pino `model` gravado na investigação |
| `EVALUATOR_MAX_TOKENS` | inteiro positivo, opcional (adaptador usa 1024 quando ausente) | Teto de tokens de saída por julgamento; um teto maior permite respostas mais longas e, em princípio, mais lentas |
| `CONSOLIDATOR_MODEL` | string não vazia, obrigatória | Modelo da redação, etapa sem limite de prazo |
| `CONSOLIDATOR_MAX_TOKENS` | inteiro positivo, obrigatório | Teto de tokens do texto do parecer; quanto maior, mais longa pode ser a única etapa sem prazo |
| `DATABASE_URL` | string não vazia, obrigatória | Onde a persistência grava; a latência do banco é o que compete com os 2 s da persistência |
| `ANTHROPIC_API_KEY` | lida pelo SDK, não pelo schema | Necessária para as duas chamadas de LLM; não afeta prazo |

Além do ambiente, um valor **de cadastro** afeta a coleta: a coluna `timeout` de cada `Capability` (`PUT /v1/capabilities/:name/:version`, `src/http/register-capability.routes.ts`; padrão 60 000 ms), intersectada com o teto de 7 s (§17.5).

### 17.11 `Durations`: como o gasto é registrado

`Durations` (`src/investigation/durations.ts`) é o objeto que a especificação reserva para medir cada etapa:

```ts
export type Durations = {
  readonly collection: number;
  readonly judgment: number;
  readonly writing: number;
  readonly total: number;
};
```

`knowledge/domain/investigation/durations.md`: "quanto cada etapa levou, em milissegundos, medido desde a primeira entrega. É o que diz quem está excedendo o orçamento total declarado, por etapa e por capability".

**Estado atual: nada mede.** `runDiagnosis` recebe `durations` já pronto nas opções — "already measured by this call's own caller — this composition never reads the system clock, so it has no way to measure it itself" — e copia para a `Investigation` sem tocar. O chamador de produção, `handleDiagnoseRequest` (`src/http/diagnose.controller.ts`), passa:

```ts
const UNMEASURED_DURATIONS: Durations = { collection: 0, judgment: 0, writing: 0, total: 0 };
```

Logo, toda investigação gravada em produção tem `durations_collection = durations_judgment = durations_writing = durations_total = 0` na tabela `investigations` (`src/migrations/0005-investigation.sql`). O comentário do controlador declara a razão: nenhuma porta reporta tempo, e medir está "explicitly outside whichever task eventually adds it". O mesmo vale para `Cost` (`{ calls: 0, input_tokens: 0, output_tokens: 0 }`).

Os únicos tempos que o código mede hoje:

- `issueConnectorHttpCall` (`src/http-connector/connector-http-issuer.ts`) calcula `elapsedMs` de cada chamada HTTP a um conector — usado pela rota de diagnóstico de conector (`POST /v1/test-connector`, `src/http/test-connector.routes.ts`) e **descartado** pelo adaptador de observação em produção.
- `result_detail: "no observation within <N>ms"` em uma evidência `timeout` registra o **limite** que foi atingido, não o tempo gasto.

Uma projeção que quisesse responder "qual caso está estourando o orçamento", como a especificação prevê para `Durations`, não tem dados hoje para fazê-lo.

### 17.12 Resumo das garantias e lacunas

| Afirmação da especificação | Situação no código |
|---|---|
| Um deadline absoluto é registrado na entrada | Implementado: `now + 20000` em `createProductionDiagnoseRunner`, após a leitura do caso |
| Cada etapa recebe `min(nominal, restante)` | Implementado para coleta, julgamento e persistência; o "restante" é calculado a partir do `now` inicial, não do início da etapa (§17.4) |
| Nenhum módulo relê o relógio | Implementado e testado (`run-diagnosis.spec.ts`) |
| Coleta tem orçamento próprio de 7 s dentro do total | Implementado (`COLLECTION_STAGE_BUDGET_MS`) |
| Timeout da capability limita uma chamada, nunca além dos 7 s | Implementado (`effectiveBoundMsFor`) |
| Julgamento em pool limitado, com deadline-exceeded para quem não obtém vaga | Implementado (`CallPool` + `DeadlineGuard`); `POOL_SIZE` configura o pool |
| Redação com fatia de 4 s | **Não implementado** |
| Persistência com 2 s e retentativa | Limite de 2 s implementado; **retentativa não implementada** |
| `Durations` registra o gasto por etapa | **Não implementado**; gravado como zeros |
| Total abaixo do timeout do chamador com margem | Não há mecanismo que garanta o total: a redação sem limite pode ultrapassar 20 s |
