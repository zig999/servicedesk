# Análise — `caseNew` como cadastro no motor de hipóteses (siegardtest), com FSM vindo do IFS

Alvo do cadastro: **siegardtest** (`/home/siegfriedneto/projects/siegardtest`), o motor de
hipóteses. Fonte dos serviços FSM: **ifs** (`/home/siegfriedneto/projects/ifs`).
**mwoassistant é apenas referência** — nada dele sobrevive.

Material avaliado: `mwoassistant/caseNew/**` e as instruções de trabalho em `mwoassistant/temp/`.

---

## 1. Veredito

Três camadas, três diagnósticos distintos:

| camada | situação |
|---|---|
| **conteúdo de negócio** (hipóteses, critérios, precedência, outcomes, actions, recipients) | **aproveitável quase integralmente.** É a parte caro de produzir e está bem feita. |
| **forma dos artefatos** (`1.json`, `_registry/*.json`, `_glossary.draft.json`) | **a instrução de trabalho está defasada** em relação ao motor. O formato de caso mudou; o de concept/capability/connector não. |
| **caminho de cadastro** | **não existe hoje** para dois dos quatro registros. É trabalho de desenvolvimento no siegardtest, não de preenchimento. |

E há uma **boa notícia estrutural** que inverte três das oito lacunas declaradas no
`1.registration.md`: o motor entrega ao juiz o **valor inteiro** de cada campo declarado —
array completo incluído — e a decisão é uma LLM lendo um critério em prosa, não um motor de
regras avaliando booleanos. Quantificador, derivação de `tier` e limiar numérico **deixam de
ser problema de cadastro** (§5).

---

## 2. Como o motor realmente lê uma capability

Verificado no código, não na instrução:

`src/src/investigation/http-declarative-observation-source.adapter.ts:234`
```ts
const observation = observationOf(capability, configuration.responseMap, body);
return { result: 'ok', observation: JSON.stringify(observation) };
```

E `observationOf` (l. 268):
```ts
const extracted = extractResponseFields(responseMap, body);
const declaredFields = declaredFieldsOf(capability.output_schema);
return Object.fromEntries(Object.entries(extracted).filter(([f]) => declaredFields.includes(f)));
```

Quatro consequências que mandam em todo o resto do cadastro:

1. **O valor de um campo declarado pode ser um array ou objeto inteiro.** O caminho do
   `responseMap` resolve, o valor vai inteiro para a `observation`, e o juiz lê tudo. Não é
   preciso achatar nada.
2. **Sintaxe de caminho:** chave aninhada e índice de array — `data.installations[0].device.model`,
   `[0].id`. **Não há wildcard**: não se itera um array por caminho. Mas, pelo item 1, não é
   necessário — mapeie o array inteiro.
3. **`responseMap` é filtrado por `output_schema.properties`.** Um nome que não conste em
   `properties` é **descartado em silêncio**. As duas metades têm de bater caractere por caractere.
4. **Citação é `{concept, field}`, checada mecanicamente** contra as chaves de `properties`
   (`citation-validation.ts:123`). `output_schema` ausente/malformado ⇒ "nenhum campo declarado"
   ⇒ toda citação recusada ⇒ hipótese sempre `inconclusive`.

Mais dois fatos operacionais:

- **Só `ok` carrega observação** (l. 228). Status que resolva para `unavailable`/`denied`/`timeout`
  entrega *nada* — a hipótese vira "sem dados", sem custo de LLM.
- **Status não mapeado ⇒ `'unavailable'`** (`DEFAULT_STATUS_ENDING`, l. 79).
- **`timeout` da capability é limitado pelo orçamento da etapa**: `min(timeout, 7 000 ms)`
  (`COLLECTION_STAGE_BUDGET_MS`, `evidence-collection-stage.ts:24`, l. 108).

---

## 3. O que muda no formato do caso — a instrução está defasada

`it-geracao-de-casos.md` descreve `hypotheses[]` com `name`. O motor hoje lê **`manifest[]`** com
`hypothesis_name` + `revision`, mais `state` e `released_at`:

```json
{ "...": "...", "state": "released", "released_at": "…",
  "manifest": [ { "position": 1, "hypothesis_name": "…", "revision": 1,
                  "criterion": "…", "collects": ["…"], "resolution": { … } } ] }
```
(`src/src/fixtures/case/intermittent-connection-outage/1.json`; tipos em `src/src/case/case.ts`;
parser em `src/src/case/parse-case-document.ts`, que exige `manifest` e `state` e **não lê mais**
um array `hypotheses`.)

Os dois `1.json` de `caseNew` usam a forma **retirada**. São convertíveis mecanicamente
(`name`→`hypothesis_name`, acrescentar `revision: 1`, `state`, `released_at`), mas não são
carregáveis como estão.

Mais importante: **um caso não entra por arquivo.** Entra pelas seis operações de ciclo de vida —
`createDraft` → `reviseHypothesis` → `placeHypothesis` → `release` (`seed.ts`, e as rotas
`/v1/**` em `src/src/http/`). O `1.json` é **fixture de seed**, não formato de importação. As
migrações `0006-case-version-immutability.sql`, `0009-case-version-lifecycle-schema.sql` e
`0010-protect-released-hypothesis-revision-collects.sql` são o que torna isso irreversível: uma
versão liberada é imutável.

---

## 4. O caminho de cadastro que falta

| registro | existe no motor? | como se cadastra hoje |
|---|---|---|
| `subject-type`, `subject-attribute`, `outcome`, `action`, `recipient` | sim (`RelationalGlossaryStore`) | **só** `npm run seed`, a partir de `src/src/fixtures/glossary/*.json` |
| `Concept` | sim | idem |
| `Capability` | sim (`CapabilityRegistryService.registerCapability`) | idem, de `fixtures/capability/capability.json` |
| `ConnectorConfiguration` | serviço existe (`registerConnector`), tabela existe (`0008-connector-configuration.sql`) | **nada carrega.** Sem seed, sem rota, sem script |
| `Case` | sim | as seis operações de ciclo de vida |

As 19 rotas HTTP registradas em `http/build-app.ts` são todas de **leitura** (`list-*`, `read-*`),
de **autoria de caso** (`create-draft`, `update-draft`, `place-hypothesis`, `revise-hypothesis`,
`remove-hypothesis`, `release`, `discard`) e `diagnose`. **Não há rota de escrita para concept,
capability, vocabulário ou connector.**

Então "cadastrar os casos de `caseNew`" hoje significa uma destas duas coisas — e é decisão sua:

- **(a) via seed**: estender `src/src/fixtures/**` e `seed.ts`, incluindo a parte de
  `ConnectorConfiguration` que ainda não existe. Rápido, mas o cadastro passa a ser um deploy.
- **(b) via superfície de administração**: rotas de escrita para os quatro registros. É o que
  transforma cadastro em operação — e é trabalho especificado, não configuração.

Qualquer uma das duas passa pelos pontos de entrada do Siegard (`/analyse` → `/plan-work` →
`/implement-task`), porque "existe um caminho para registrar um connector" é um fato que a
especificação do siegardtest ainda não tem.

---

## 5. As três lacunas do `1.registration.md` que deixam de existir

Existiam porque o mwoassistant tinha um **motor de regras** avaliando booleanos. O siegardtest tem
uma **LLM lendo um critério em prosa contra a observação inteira**.

- **Lacuna 2 — "resposta em coleção quebra o vocabulário citável".** Falsa aqui. Declare
  `installations` e mapeie `data.installations`: o array inteiro entra na observação, o juiz lê
  "algum device com push desabilitado e estado ativo" e cita `{perfil-mobile-tecnico,
  installations}`. O quantificador vive no `criterion`, que é exatamente onde a instrução manda
  ele viver.
- **Lacuna 3 — "`device.tier` não é campo de resposta".** Deixa de importar. O `ENTRY_TIER_REGEX`
  não precisa migrar: o critério já nomeia os modelos (A04/A15/A16/linha G) e o juiz lê
  `installations[].device.model`. A duplicação regex ⇄ prosa desaparece porque o regex desaparece.
  Isto também **respeita** `rules/fsm/fsm-facts-never-verdicts` do IFS, que proíbe o IFS de
  derivar `tier`.
- **Lacuna 6 — "`sinceDays=14` fixo".** Some junto com o parâmetro: o IFS não aceita janela
  (`rules/fsm/failed-transaction-queue-not-windowed`). O recorte temporal passa a ser prosa do
  critério sobre o `transactionAt` que cada entrada carrega.

O mesmo raciocínio resolve os limiares L# (`kb/limiares.yaml` do mwoassistant, que morre): "acima
da cadência normal" vira uma frase no `criterion`, com o número escrito nela.

---

## 6. Os três cadastros, corrigidos para o IFS

Superfície do IFS (verificada em `ifs/backend/src/http/routes/`): envelope uniforme
`{data, metadata, error[]}`; `data` é a entidade ou o array, direto.

### 6.1 `perfil-mobile-tecnico` (V4) — `GET /v1/technicians/:userId/profile`

`data` é um `FsmUser`: `{id, installations[]}`, cada instalação
`{appName, clientVersion?, state?, pushEnabled?, gpsEnabled?, lastAccess?, device?{id, model?, os?, platform?}}`.

```
output_schema.properties : { login, installations }
responseMap              : { "login": "data.id", "installations": "data.installations" }
statusMap                : { "200":"ok", "400":"denied", "403":"denied", "500":"unavailable",
                             "503":"unavailable" }
timeout                  : 5000
```

Fatos do IFS que o `criterion` precisa respeitar:

- `state` é o **mesmo vocabulário de seis valores, em minúsculas**: `active`, `disabled`,
  `inactive`, `init-required`, `activated`, `initializing`. O critério de `push-desabilitado` fala
  de "estado ativo" — escreva `active`.
- **`pushEnabled` é omitido** quando o store guarda valor fora do par codificado
  (`rules/fsm/uncoded-push-flag-omitted`). Ausente **não** é `false`. O critério tem de dizer
  qual dos dois confirma.
- `device.model` é omitido quando ausente, nunca `null` (`rules/fsm/absent-device-model-omitted`).
- **Modo de falha novo:** uma instalação com `STATE_DB` fora do vocabulário **derruba a leitura
  inteira** com HTTP 500 (`rules/fsm/unknown-installation-state-fails-the-read`) — o perfil todo,
  não uma linha. Vira `unavailable`, sem observação.
- **`input_schema` está errado:** diz "o serviço trata em MAIÚSCULAS". O IFS **recusa** case-fold
  por decisão explícita (`rules/fsm/login-identity-answered-as-stored`). Quem chama
  `/v1/diagnose` tem de passar `user-id` na grafia do store — que é maiúscula por observação
  (`FIDEM.VIEIRA`), não por contrato.

### 6.2 `filas-de-transacao-falhadas` + `serie-de-inits-do-device` (V5b + V5a) — `GET /v1/technicians/:userId/sync-status`

**Uma chamada, duas projeções.** `data` é um `FsmUser` com `failedTransactions[]` — as três filas
**agrupadas numa lista**, na ordem do vocabulário (`failed`, `deleted`, `ignored`), cada entrada
carregando seu próprio campo `queue` (`rules/fsm/transaction-queues-grouped-in-vocabulary-order`)
— e `syncEvents[]` com `{taskType, state?, postedAt?, resultMessage?}`.

O `responseMap` atual (`failed`/`deleted`/`ignored` como três chaves de topo) **não existe no
IFS**. Mas isso não é um problema: o discriminador `queue` está no dado que o juiz lê.

```
responseMap : { "failedTransactions": "data.failedTransactions",
                "syncEvents":         "data.syncEvents" }
```

Pelo §4.4 da instrução, as duas capabilities podem compartilhar **este** connector — é
literalmente a mesma chamada e a mesma resposta, o único caso em que reaproveitar é seguro. A
`ConnectorConfiguration` é única por nome, então este `responseMap` carrega as duas chaves; cada
`output_schema` declara a sua, e o filtro do §2.3 garante que cada capability só entregue a sua.

- `transacao-falha-viva`: o critério nomeia `queue` = `failed` ("viva, reprocessável").
- `descarte-por-inicializacao`: nomeia `queue` = `deleted` — e o IFS confirma o sentido:
  *"a `deleted` entry is data lost to an initialization and irreversible"*.
- Campos: `transactionDate`→**`transactionAt`**, `deviceId`→**`device.id`**.
- `syncEvents` tem cap **por tipo de sync-task** (`rules/fsm/sync-history-capped-per-task-kind`);
  tentativas sem data vêm por último (`undated-sync-attempt-answered-last`).
- **`timeout: 8000` é inalcançável** — o teto da etapa é 7 000 ms (§2). Declare 7000 ou menos, ou
  aceite que o valor declarado nunca vale.
- **`serie-de-inits-do-device` não tem `Concept` nem `Capability` em `_registry/`.** Como
  `init-device-perda-dados` o coleta, **esse caso não roda**. É o item mais barato de fechar.

### 6.3 `assignments-envio-baixa` (V2) — `GET /v1/tasks/:taskId/assignments`

`data` **é** o array. `responseMap: { "assignments": "data" }` — o único dos três que já está
correto.

Renomeações: `executionInstanceSeq`→`id`, `rowstate`→`status` (vocabulário fechado de nove valores
minúsculos), `userId`→`resource.login` (**sem `UPPER()`**). `taskSeq` não é projetado. Campos
ausentes são **omitidos**, nunca `null` (`absent-assignment-field-omitted`), e "sem atribuição" é
distinto de "atribuição não enviada" (`absent-assignment-distinct-from-unsent`). Ordenação: mais
recente primeiro. Um `OBJSTATE` fora dos nove valores derruba a lista inteira da task
(`unknown-assignment-status-fails-the-read`, que declara o custo explicitamente).

### 6.4 `statusMap` — o que muda, e a lacuna que **não** muda

Status que o IFS devolve: `200` (sucesso, incluindo `data: null` para task inexistente e arrays
vazios), `400` (`invalid-format`, `out-of-range`), `403` (`read-only-violation`), `503`
(`store-not-configured`, `store-unavailable`), `500` (falha interna, incluindo valor fora de
vocabulário), `404` (só rota não casada).

O mapa atual (`200 ok`, `422 denied`, `500 unavailable`, `502 unavailable`, `504 timeout`):

- **`422` nunca ocorre.** Entrada morta.
- **`400` não mapeado ⇒ `unavailable`** por default silencioso. Pior consequência de todas: um
  `task-seq` malformado passa a ler como "o IFS caiu".
- **`403` não mapeado ⇒ `unavailable`**, quando o desfecho certo é `denied`.
- `502`/`504` só se houver proxy na frente.

**A Lacuna 7 não desaparece — ela se muda de código.** Os quatro desfechos
(`ok`/`unavailable`/`denied`/`timeout`) continuam sem bucket para "entrada inválida"; antes doía
no `422`, agora dói no `400`. `denied` é o menos ruim pelo mesmo motivo de antes.

---

## 7. Sobre `accepts` e os atributos do sujeito — retifico o que eu disse antes

Eu havia registrado que `accepts: ["task","technician"]` era super-declarado e que
`init-device-perda-dados` (subject `technician`, coletando um concept task-scoped) seria recusado.
**Está errado**, e o código diz por quê:

- O sujeito de `/v1/diagnose` é `{ type, attributes: [{attribute, value}, …] }`
  (`http/dto/diagnose.dto.ts`). `subject-attribute` é um **vocabulário global e plano**
  (`knowledge/domain/glossary/subject-attribute.md`: atributo único `name`) — **nada amarra um
  atributo a um tipo de sujeito**.
- Os únicos controles são: cada atributo nomeado existe no glossário
  (`investigation-factory.ts:187`), há pelo menos um, e
  `a-concept-accepts-the-declared-subject-type`.
- `resolveSubjectPlaceholder` só exige que o sujeito **carregue** o atributo, não vazio
  (`connector-request-resolver.ts:208`).

Logo: um sujeito `technician` **pode** carregar `task-seq`, e o caso funciona. `accepts` diz "este
concept pode ser coletado num caso cujo sujeito é X" — não "a operação toma a identidade X".

O que falta não é corrigir `accepts`; é **documentar, por caso, quais atributos a chamada precisa
carregar**. `init-device-perda-dados` exige `user-id` **e** `task-seq`; nada em `caseNew` diz
isso, e sem `task-seq` a coleta de `eform-respostas-e-fotos` é recusada antes de sair.

---

## 8. Lacunas do lado do IFS

Decisões no projeto `ifs`, não em `caseNew`.

1. **`cadeia-orfa-survey-anexo` não é avaliável hoje.** `read-survey-media-records.ts` responde
   `NO_MEDIA_MATCH = {}` para toda resposta — a query não seleciona nem junta nada de
   `MEDIA_LIBRARY_ITEM`, por inferência declarada no próprio arquivo. `media.mediaKeyRef` e
   `media.itemId` estão **sempre ausentes**, então o critério "ponteiro de anexo sem o item
   correspondente na biblioteca de mídia" não tem o outro lado da comparação — apesar de
   `domain/fsm/media-match` e `rules/fsm/media-match-is-exact` existirem. Isto derruba a hipótese
   `position: 4` de `init-device-perda-dados`. **É a única lacuna que exige mudança de
   especificação no IFS antes de o caso rodar completo.**
2. **`find-task-assyst-link` consulta `ifsapp.tasks`** (`read-assyst-link-record.ts:63`) — nome
   que dois outros readers do mesmo repositório descrevem, em comentário, como inexistente
   (`read-assignment-records.ts:47`, `read-mobile-profile-records.ts:82`). Provável defeito vivo.
   Não afeta os concepts de `caseNew`; afeta V9, se ele entrar depois.
3. **`ifsapp.jt_execution_instance` (view) vs `..._tab`** — o IFS é inconsistente consigo:
   `read-assignment-records.ts` e `read-visit-allocation-record.ts` usam a view,
   `read-day-population-records.ts` usa a tabela.
4. **As pontes V9/V10p não têm rota** — `contracts/fsm/identity-bridges` diz, por decisão, que são
   consumidas in-process e que nenhuma lê o store do outro sistema. E **V10** (status real da
   activity no PSO) **não existe no IFS**. Nenhum caso de `caseNew` depende disso hoje; casos
   futuros que dependam (`status-divergente-pso`) dependem dessa decisão.
5. **Nenhuma operação de lote.** As quatro do mwoassistant (`assignments/batch`,
   `tech-profiles/batch`, `tech-batch-health`, `task-allocations-by-activity-ids`) não têm
   equivalente. Nenhum caso reativo precisa delas — mas o `preventive-scan`, se for reconstruído,
   precisa.

Cobertura, no saldo: dos **7 concepts** que o glossário-rascunho lista, o IFS responde **7**, e
mais V3, V6, V0 e V11. A única hipótese de `caseNew` sem dado é a do item 1.

---

## 9. Ordem de trabalho

**Barato e independente de decisão** (forma, não conhecimento):

1. Converter os dois `1.json` para `manifest[]`/`hypothesis_name`/`revision`/`state`.
2. Reescrever os três `responseMap`/`output_schema` para o IFS (§6.1–6.3) — array inteiro por
   campo, não achatado.
3. Declarar `400`, `403` e `503` nos três `statusMap`; registrar que "entrada inválida" segue sem
   desfecho próprio.
4. Cadastrar `serie-de-inits-do-device` (`Concept` + `Capability`), reaproveitando o connector do
   sync — §4.4 autoriza porque é a mesma chamada.
5. Baixar `timeout` do sync para ≤ 7000 ms, ou declarar que o teto da etapa é que vale.
6. Escrever, por caso, os atributos de sujeito que a chamada precisa carregar (§7).
7. Reescrever `1.collects.md` e `1.registration.md`: hoje citam SQL, classes e nomes de tabela do
   mwoassistant como evidência de origem do dado. O IFS lê **outros objetos físicos** — view vs
   tabela, `MOBILE_SYNC_TASK` vs `..._TAB`, `ACCESS_GROUP_MEMBER` vs
   `SERVICE_ACCESS_GROUP_USER_TAB`. Não é detalhe de redação.
8. Reescrever a justificativa de `nature: "read-only"`: hoje aponta para o `read-only-guard` do
   `ifs-gateway`, que morre. No IFS a garantia é `constraints/fsm-read-only-store-access` + a
   recusa `read-only-violation` (403).

**Decisões que são suas, e que bloqueiam o resto:**

9. **Como se cadastra** (§4): estender o seed, ou construir a superfície de administração.
   Nada em `_registry/` tem runway antes disso, e `ConnectorConfiguration` não tem **nenhum**
   caminho hoje.
10. **`cadeia-orfa-survey-anexo`** (§8.1): o IFS ganha o join de mídia — `/analyse` naquele
    projeto — ou a hipótese sai do caso, declarando por quê.
11. **Onde o IFS é alcançado e sob que credencial.** O host `mwo-assistant.internal` era um
    placeholder declarado; o IFS também não registra autenticação
    (`constraints/access-control-at-perimeter` confina pelo perímetro de implantação). A pergunta
    muda de dono, não desaparece: quem alcança o perímetro do IFS, e entra ou não um
    `Authorization: Bearer ${credential:VAR}` — que é a **única** forma permitida de uma
    credencial entrar num connector (`resolveCredentialPlaceholder`, lê `process.env` na hora da
    chamada e recusa se estiver vazia).
12. **A atualização das duas instruções de trabalho.** `it-geracao-de-casos.md` descreve um
    formato de caso que o motor não lê mais, e nenhuma das duas menciona o ciclo de vida
    draft→release nem a imutabilidade de versão liberada. Enquanto isso não for corrigido,
    qualquer caso novo gerado por elas nasce na forma retirada.

**Fica igual, e continua honesto:** `ttl` e `timeout` são propostas, não medições (Lacunas 4 e 5).
