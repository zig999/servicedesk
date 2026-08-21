# Coleta — `init-device-perda-dados` (v1)

Para cada concept que as hipóteses coletam: **qual operação do IFS o responde**, **o que o IFS
devolve**, **o que o juiz vê** e **como a hipótese decide**. A ordem de cadastro está em
`../_registry/README.md`.

Sistema único envolvido: **IFS, domínio FSM** — o serviço HTTP em
`/home/siegfriedneto/projects/ifs/backend`. Nenhum collect deste caso toca PSO ou Assyst.

> **O limite, e ele não se move.** Este projeto **não abre conexão com banco nenhum do FSM**.
> Não há driver Oracle, não há credencial de store, não há SQL. Um collect é **uma chamada HTTP**
> a um serviço do IFS, montada pelo `ConnectorConfiguration` do concept e executada pelo
> `HttpDeclarativeObservationSource` — cujo único cliente é o `fetch` da plataforma
> (`src/src/investigation/http-declarative-observation-source.adapter.ts`). O único banco que este
> projeto acessa é o seu próprio Postgres, onde ficam cadastro e investigações.
>
> As tabelas Oracle citadas abaixo aparecem como **procedência**: são o que o IFS lê para poder
> responder, registradas aqui para que se saiba de onde o fato vem e o que muda se ele mudar.
> Nenhum nome de tabela deste documento é endereçável por este projeto.


Precedência: `descarte-por-inicializacao` (1) → `re-inits-em-serie` (2) →
`multiplos-devices-vinculados` (3) → fallback.

**Uma quarta hipótese existe e está fora do manifest**: `cadeia-orfa-survey-anexo`. O motivo está
em `blocked-cadeia-orfa-survey-anexo.md` — não é um esquecimento, e não é seguro incluí-la hoje.

## Tabela-resumo

| Collect (concept) | KB | Operação IFS | Rota | Campos citáveis | Hipótese | KB |
|---|---|---|---|---|---|---|
| `filas-de-transacao-falhadas` | V5b | `get-tech-sync-status` | `GET /v1/technicians/:userId/sync-status` | `failedTransactions` | `descarte-por-inicializacao` | R18 |
| `serie-de-inits-do-device` | V5a | `get-tech-sync-status` *(a mesma chamada)* | idem | `syncEvents` | `re-inits-em-serie` | R13 |
| `perfil-mobile-tecnico` | V4 | `get-tech-profile` | `GET /v1/technicians/:userId/profile` | `login`, `installations` | `multiplos-devices-vinculados` | R14 |

As colunas **KB** são procedência: as siglas do material de origem (`kb/siglas.yaml` e as
case-specs do MWO Assistant), guardadas porque são o único índice de volta ao raciocínio que
produziu estas hipóteses. A precedência aqui reproduz a §Tabela de decisão de
`docs/specs/domains/mwo-catalog/cases/init-device-perda-dados.case.spec.md` — e é
**deliberadamente diferente** da ordem de verossimilhança do analista (`regras: [R13, R18, R14,
F5]`) usada para redigir a assinatura do caso. As duas divergem de propósito.

> **Dois concepts, uma chamada.** No IFS, `get-tech-sync-status` responde as filas de transação
> **e** o histórico de sincronização — é uma operação só, duas projeções sobre o mesmo resultado.
> As duas capabilities declaram por isso o **mesmo** connector,
> `ifs-fsm-tech-sync-status-connector`, cujo `responseMap` carrega as duas chaves. É o único
> arranjo em que reaproveitar um connector é seguro (mesma chamada, mesma resposta), e o motor
> mantém cada capability na sua: `observationOf` filtra o `responseMap` pelas chaves de
> `properties` do `output_schema` **daquela** capability
> (`http-declarative-observation-source.adapter.ts:268`). A chamada em si, ainda assim, sai duas
> vezes — uma por concept do plano de coleta.

## Atributos que a chamada precisa carregar

`POST /v1/diagnose` com `subject: { type: "technician", attributes: [{ attribute: "user-id", value: "…" }] }`.

Só `user-id`. Enquanto `cadeia-orfa-survey-anexo` estiver fora do manifest, **nenhum collect deste
caso é task-scoped**, e nenhum `task-seq` é necessário. Passe o login na grafia que o store guarda
(`ifs/knowledge/rules/fsm/login-identity-answered-as-stored.md`).

---

## 1. `filas-de-transacao-falhadas` → `descarte-por-inicializacao`

**Operação:** `get-tech-sync-status`. Procedência — o que o IFS lê, e este projeto nunca: as três filas são três objetos
fisicamente distintos (`ifs/backend/src/store-access/fsm/read-failed-transaction-records.ts:75-89`),
e a fila de uma entrada se sabe por qual objeto a respondeu, nunca por uma coluna.

**Resposta:** uma lista `data.failedTransactions`, as três filas **agrupadas** na ordem do
vocabulário, cada entrada carregando seu `queue`.

**Como a hipótese decide:** presença de ao menos uma entrada com `queue: "deleted"`. Sem limiar
numérico — presença já é prova, e a razão vem do material de origem: essa fila **por definição só
recebe** transações que o servidor marcou como descartadas por reinicialização do device
("Deleted due to Initialization", manual MWO p.132/174). Não é uma inferência sobre o conteúdo da
fila; é o que a fila é.

**Orientação que a resolução carrega** (de `guidance.caveats` da case-spec de origem): a perda é
irreversível, e a resolução **escala em vez de responder sozinha** — nunca prometer recuperação do
que foi descartado.

O IFS declara o sentido dessa fila exatamente como este caso precisa dele
(`rules/fsm/transaction-queues-grouped-in-vocabulary-order`):

> *"a `deleted` entry is data lost to an initialization and irreversible, a `failed` entry may
> still be reprocessed, an `ignored` entry never will be"*

Isto é o que dispensa um marcador próprio de "excluído por inicialização": **a fila é o
marcador**. O critério original falava de "transações descartadas com o marcador de exclusão por
inicialização"; contra o IFS, o campo `queue` com valor `deleted` é esse marcador, e a redação foi
ajustada para dizer isso.

**Ressalva:** vale a mesma retenção de ~6 dias do store. Passado esse prazo a fila volta vazia e a
hipótese não confirma — ausência de fila não é ausência de perda.

---

## 2. `serie-de-inits-do-device` → `re-inits-em-serie`

**Operação:** a **mesma** `get-tech-sync-status`. Procedência — o que o IFS lê, e este projeto nunca: `IFSAPP.MOBILE_SYNC_TASK`
(`read-sync-event-records.ts:127`) — e não `IFSAPP.MOBILE_DEVICE_SYNC_TRACE`, um segundo objeto de
nome parecido, no mesmo schema, que **não guarda nenhum destes registros**
(`ifs/knowledge/contracts/fsm/fsm-store-reads.md`).

**Resposta:** `data.syncEvents`, cada entrada
`{taskType, state?, postedAt?, resultMessage?}`. `taskType` é um vocabulário fechado de três
valores minúsculos — `init`, `init-entity-data`, `batch`
(`ifs/backend/src/domain/fsm/sync-task-type.ts`) — vindos das colunas codificadas do store
(`INIT`, `INIT_ENTITY_DATA`, `BATCH`).

**Como a hipótese decide:** conta as tentativas de tipo `init` ou `init-entity-data` na janela, a
partir do `postedAt` de cada uma, e confirma em **três ou mais**. Tentativa que falhou conta: o
material de origem é explícito de que R13 quer *o volume de tentativas, não só as concluídas*.

**Procedência do limiar, e o que mudou.** O `>= 3` é herdado — é o `R13_MIN_COUNT_PROVISORIO` do
material de origem, cuja base empírica é o episódio T-21, com 23 inicializações num mesmo dia. Já
era provisório lá: **nunca chegou a ser um `L#` formal** em `kb/limiares.yaml`, e todo resultado
de R13 saía marcado `caveats: ['provisionalParameter']`. A janela de **14 dias** também é herdada,
mas por um caminho diferente: ela não era decisão nenhuma — era o parâmetro `sinceDays=14` que o
connector antigo fixava, e que a projeção apenas reportava de volta como
`sync.initSeries = { count, windowDays: 14 }`.

Contra o IFS esse parâmetro **não existe** (`rules/fsm/failed-transaction-queue-not-windowed`, e a
operação não aceita query nenhuma), então a janela deixa de ser efeito colateral de uma
configuração e passa a ser, pela primeira vez, uma escolha. Mantive 14 dias por fidelidade ao
comportamento de origem — não porque alguém a tenha decidido.

**Ambiguidade do material, resolvida aqui de propósito.** A query de origem selecionava
`task_type IN ('INIT','INIT_ENTITY_DATA','BATCH')` — os três — e a projeção "conta todas as linhas
retornadas". Lido ao pé da letra, `initSeries.count` incluiria batches, o que faria `>= 3` disparar
para qualquer técnico ativo. O nome do fato (`initSeries`) e a hipótese que ele alimenta dizem o
contrário, então aqui o critério conta **só** `init` e `init-entity-data`. Se a intenção original
era outra, é isto que precisa ser corrigido.

**Fatos do IFS que o critério respeita:**

| fato | nó |
|---|---|
| **o row cap se aplica por tipo de sync-task**, independentemente. Inicializações são muito mais raras que batches no store; um cap único sobre o histórico misto responderia quase só batches e subcontaria as inicializações | `rules/fsm/sync-history-capped-per-task-kind` |
| mais recente primeiro; tentativa sem data vem por último | `sync-history-ordered-most-recent-first`, `undated-sync-attempt-answered-last` |
| um login sem histórico é **respondido**, não recusado | `sync-history-absence-answered-not-refused` |
| `resultMessage` é omitido quando o store não guarda nenhum — nunca vazio nem `null` | `absent-result-message-omitted` |
| **nenhuma janela de tempo** vem da operação: a janela é contada por quem consome, sobre o `postedAt` | `failed-transaction-queue-not-windowed` (mesma postura) |

---

## 3. `perfil-mobile-tecnico` → `multiplos-devices-vinculados`

**Operação:** `get-tech-profile`. O detalhe completo da resposta, dos vocabulários e do modo de
falha está em `../app-congelado-hardware/collects.md` §1, que descreve a mesma operação — não é
repetido aqui.

**Como a hipótese decide:** duas ou mais entradas em `installations`, cada uma em um `device.id`
distinto, **independentemente do estado** de cada instalação. É o único dos três critérios deste
caso que não olha para `state`: um aparelho obsoleto ainda vinculado é exatamente o problema que
a hipótese nomeia.

**Por que ela é a última, e o que ela não é.** O material de origem sinaliza R14 como
**"red herring" fora deste caso** — em `task-nao-desce` ela nunca é causa principal isolada. Aqui
ela é tratada como **achado adjacente** à história do técnico que reinicializou ou desvinculou o
aparelho, **não como a causa-raiz da perda**. Daí a `position: 3`: ela só decide quando as duas
causas que explicam perda de dado de verdade não confirmaram. A resolução pede remover os
aparelhos obsoletos no servidor e o técnico refazer login.

**Modo de falha:** o mesmo do §1 daquele documento — um estado fora do vocabulário derruba o
perfil inteiro com HTTP 500, que resolve para `unavailable`, que não carrega observação.

---

## Suposições em aberto, para um curador humano confirmar

Nenhuma foi decidida em silêncio.

1. **O limiar de `re-inits-em-serie` é herdado e provisório — não medido.** `>= 3` vem do
   `R13_MIN_COUNT_PROVISORIO` do material de origem (base: o episódio T-21, 23 inits num dia), e
   já saía de lá marcado `provisionalParameter`, sem nunca ter virado um `L#` formal. A janela de
   14 dias é herdada de um lugar mais frágil ainda: era o `sinceDays=14` do connector antigo, não
   uma decisão. Contra o IFS não existe janela nenhuma, então ela passou a ser escolha —
   e continua sem ninguém tê-la escolhido. **É o único item desta lista que muda um resultado**, e
   precisa ser confirmado antes do `release`. Ver §2 para a análise completa.

   Nota de correção: uma versão anterior deste documento trazia "três ou mais em 24 horas", número
   que eu havia proposto antes de ler o `1.collects.md` de origem. 24 horas é muito mais estrito
   que 14 dias e refutaria casos que o material de origem confirmava.
2. **`ttl` dos três concepts é proposta, não medida** — 300 s para o perfil, 60 s para as duas
   projeções do sync.
3. **`timeout` é proposta, não medida**, e limitado a 7 000 ms de todo modo pelo orçamento da
   etapa de coleta (`evidence-collection-stage.ts:24`).
4. **A quarta hipótese está fora** — ver `blocked-cadeia-orfa-survey-anexo.md`. Com ela fora, o
   caso não cobre a perda de anexo cuja cadeia se rompeu no servidor; cobre inicialização,
   re-inits e múltiplos devices.
