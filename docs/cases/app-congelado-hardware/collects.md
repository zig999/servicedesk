# Coleta — `app-congelado-hardware` (v1)

Para cada concept que as hipóteses coletam: **qual operação do IFS o responde**, **o que o IFS
devolve**, **o que o juiz vê** e **como a hipótese decide**. Este documento é a origem do dado;
a ordem de cadastro está em `../_registry/README.md`.

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


Precedência: `limitacao-de-hardware` (1) → `transacao-falha-viva` (2) → `push-desabilitado` (3)
→ fallback. A primeira que confirmar decide o resultado.

## Tabela-resumo

| Collect (concept) | KB | Operação IFS | Rota | Campos citáveis | Hipótese | KB |
|---|---|---|---|---|---|---|
| `perfil-mobile-tecnico` | V4 | `get-tech-profile` | `GET /v1/technicians/:userId/profile` | `login`, `installations` | `limitacao-de-hardware` · `push-desabilitado` | R25 · R2 |
| `filas-de-transacao-falhadas` | V5b | `get-tech-sync-status` | `GET /v1/technicians/:userId/sync-status` | `failedTransactions` | `transacao-falha-viva` | R12 |

As colunas **KB** são procedência: as siglas do material de origem (`kb/siglas.yaml` e as
case-specs do MWO Assistant), guardadas porque são o único índice de volta ao raciocínio que
produziu estas hipóteses. A precedência reproduz a §Tabela de decisão de
`docs/specs/domains/mwo-catalog/cases/app-congelado-hardware.case.spec.md`.

> **Duas hipóteses, uma chamada.** `limitacao-de-hardware` e `push-desabilitado` coletam o
> **mesmo** concept. O plano de coleta do caso é o conjunto dos concepts
> (`case-resolution.ts`), então `get-tech-profile` é chamada **uma vez**, e as duas hipóteses
> julgam sobre a mesma evidência.

## Atributos que a chamada precisa carregar

`POST /v1/diagnose` com `subject: { type: "technician", attributes: [{ attribute: "user-id", value: "…" }] }`.

`user-id` é obrigatório: os dois connectors o citam como `${subject:user-id}`, e um placeholder
que não resolve **recusa a chamada antes de sair** (`connector-request-resolver.ts:208`).
**Passe o login na grafia que o store guarda** — o IFS recusa, por decisão explícita, normalizar
a caixa (`ifs/knowledge/rules/fsm/login-identity-answered-as-stored.md`). Os valores observados
são maiúsculos (`FIDEM.VIEIRA`), mas isso é observação, não contrato.

---

## 1. `perfil-mobile-tecnico` → `limitacao-de-hardware` e `push-desabilitado`

**Operação:** `get-tech-profile` (`ifs/knowledge/contracts/fsm/technician-queries.md`),
implementada em `ifs/backend/src/domain-service/fsm/get-tech-profile.ts`, rota em
`ifs/backend/src/http/routes/technician-queries.routes.ts`.

**Procedência — o que o IFS lê (este projeto, nunca):** `IFSAPP.MOBILE_DEVICE_APP_USER` LEFT JOIN `IFSAPP.MOBILE_DEVICE`
(`ifs/backend/src/store-access/fsm/read-mobile-profile-records.ts:96`). O modelo do aparelho é a
coluna `DESCRIPTION` de `MOBILE_DEVICE`, respondida sob o apelido `model`
(`ifs/knowledge/contracts/fsm/fsm-store-reads.md`).

**Resposta:** o envelope uniforme do IFS, `{data, metadata, error[]}`, com `data` sendo o próprio
`FsmUser`:

```json
{ "data": { "id": "FIDEM.VIEIRA",
            "installations": [ { "appName": "…", "clientVersion": "…", "state": "active",
                                 "pushEnabled": false, "gpsEnabled": true, "lastAccess": "…",
                                 "device": { "id": "…", "model": "samsung SM-A166M",
                                             "os": "…", "platform": "…" } } ] },
  "metadata": {}, "error": [] }
```

**O que o juiz vê:** o `responseMap` mapeia `installations` para `data.installations` — o **array
inteiro** entra na observação, porque o motor serializa o valor que o caminho resolveu
(`http-declarative-observation-source.adapter.ts:234`). Os campos citáveis são `login` e
`installations`; os campos de dentro do array não são nomes citáveis, mas seus **valores estão
visíveis** ao juiz. É por isso que "alguma instalação com X" é uma pergunta que o critério pode
fazer sem que o cadastro precise achatar nada.

**Como cada hipótese decide:**

- `limitacao-de-hardware` — o critério nomeia os modelos (A04 / A15 / A16 / linha G) e o juiz os
  procura em `installations[].device.model`. **Não existe campo `tier`**: a classificação
  entry/standard não é resposta do IFS e não deve ser — `fsm-facts-never-verdicts` proíbe o
  domínio de julgar o que os fatos significam. Isso é uma melhoria e não uma perda: o critério é
  o único lugar onde a lista de modelos vive agora, em vez de estar duplicada entre uma expressão
  regular e um texto.
- `push-desabilitado` — o par `state: "active"` **e** notificações desabilitadas, na **mesma**
  instalação. Um aparelho desativado com push off não conta.

**Por que push é a última (`position: 3`).** O material de origem registra em `guidance.caveats` da
case-spec: *"não roteie por essa flag isoladamente"*. Neste quadro, push oscilando `TRUE→FALSE` é
**sintoma** do app morrendo — perda do token de notificação — e não a causa primária. A precedência
existe para que ele só decida o resultado quando as duas causas mais fortes não confirmarem.

**Fatos do IFS que o critério respeita:**

| fato | nó |
|---|---|
| `state` é um vocabulário fechado de seis valores **minúsculos**: `active`, `disabled`, `inactive`, `init-required`, `activated`, `initializing` | `ifs/backend/src/domain/fsm/mobile-app-state.ts` |
| **`pushEnabled` é omitido** quando o store guarda ali algo que não é nenhum dos dois valores que ele codifica — ausente **não** é `false` | `rules/fsm/uncoded-push-flag-omitted` |
| `device.model` é omitido quando ausente, nunca `null` nem vazio | `rules/fsm/absent-device-model-omitted` |
| o login é respondido como o store o guarda, sem case-fold | `rules/fsm/login-identity-answered-as-stored` |

**Modo de falha a conhecer:** uma instalação cujo estado caia fora dos seis valores **derruba a
leitura inteira** com HTTP 500 — o perfil todo, não uma linha
(`rules/fsm/unknown-installation-state-fails-the-read`, que declara o custo). Pelo `statusMap`,
500 resolve para `unavailable`, e **um desfecho diferente de `ok` não carrega observação nenhuma**
(`…adapter.ts:228`): as duas hipóteses ficam sem dado, e o motor as marca `inconclusive` sem gastar
LLM.

---

## 2. `filas-de-transacao-falhadas` → `transacao-falha-viva`

**Operação:** `get-tech-sync-status`, em
`ifs/backend/src/domain-service/fsm/get-tech-sync-status.ts` — quatro leituras independentes
disparadas em paralelo (`constraints/fsm-independent-reads-run-concurrently`).

**Procedência — o que o IFS lê (este projeto, nunca):** as três filas são **três objetos fisicamente distintos**, um por valor do
vocabulário — `IFSAPP.MOBILE_FAILED_TRANSACTION`, `IFSAPP.MOBILE_DELETED_FAILED_TNX`,
`IFSAPP.MOBILE_IGNORED_TRANSACTION` (`read-failed-transaction-records.ts:75-89`). A qual fila uma
entrada pertence se sabe **por qual objeto a respondeu**, nunca por uma coluna.

**Resposta:** uma **única** lista `data.failedTransactions`, com as três filas **agrupadas** na
ordem do vocabulário (`failed`, `deleted`, `ignored`), cada entrada carregando seu próprio campo
`queue`:

```json
{ "data": { "id": "FIDEM.VIEIRA",
            "failedTransactions": [ { "queue": "failed", "methodName": "…", "projection": "…",
                                      "transactionAt": "…", "device": { "id": "…" } } ] },
  "metadata": {}, "error": [] }
```

**Por que isso é mais simples do que parecia:** o discriminador `queue` está no dado que o juiz
lê. Não é preciso separar as filas no cadastro — o `responseMap` mapeia um caminho, e um caminho
não filtra por valor de campo. O critério nomeia a fila em prosa, e é o juiz que a distingue.

**Como a hipótese decide:** presença de **ao menos uma** entrada com `queue: "failed"`. Sem
limiar numérico — presença já é prova. A resolução encaminha reprocesso ao BackOffice sob a
disciplina **P-3** do material de origem: reprocessar o **pai** primeiro, nunca o anexo solto. Semântica que importa para a redação final: transação viva
significa que **o dado não se perdeu**, o oposto de `deleted`.

**Fatos do IFS que o critério respeita:**

| fato | nó |
|---|---|
| **nenhuma janela de tempo.** O IFS responde a fila inteira como o store a guarda, limitada só pelo seu row cap. Recortar por tempo é trabalho de quem consome, sobre o `transactionAt` de cada entrada | `rules/fsm/failed-transaction-queue-not-windowed` |
| as três filas vêm agrupadas na ordem do vocabulário, cada grupo na ordem que a sua própria fila já tem — nunca mescladas por data | `rules/fsm/transaction-queues-grouped-in-vocabulary-order` |
| mais recente primeiro; entrada sem data vem por último | `failed-transaction-queue-ordered-most-recent-first`, `undated-failed-transaction-answered-last` |

**Ressalvas conhecidas, herdadas e ainda válidas:**

- **Retenção do store (~6 dias) não é o row cap.** Para um episódio de mais de ~6 dias a fila volta
  vazia, e a hipótese não confirma — **ausência de fila não é ausência de problema**. Reconstruir
  exigiria a linha do tempo de eventos (`list-task-events`), que este caso não coleta.
- **A fila é por-técnico, não por-tarefa.** A entrada não carrega o identificador da task, então
  não dá para isolar qual tarefa específica falhou a partir deste collect.

---

## Suposição em aberto, para um curador humano confirmar

Nenhuma foi decidida em silêncio.

1. **`ttl` dos dois concepts é proposta, não medida.** `perfil-mobile-tecnico` = 300 s (o perfil
   muda pouco, mas as notificações oscilam durante o incidente); `filas-de-transacao-falhadas` =
   60 s (muda a cada sync). Ninguém mediu a taxa real de mudança.
2. **`timeout` das capabilities é proposta, não medida.** 5 000 ms para o perfil; 7 000 ms para o
   sync-status, que dispara quatro leituras em paralelo. E o valor declarado **nunca passa de
   7 000 ms de todo modo**: o teto real é `min(timeout, 7 000)`, o orçamento da etapa de coleta
   (`COLLECTION_STAGE_BUDGET_MS`, `src/src/investigation/evidence-collection-stage.ts:24`).
3. **A lista de modelos de linha de entrada** (A04 / A15 / A16 / linha G) é a que o material de
   referência sustentava. Se um aparelho novo de linha de entrada entrar na frota e não estiver
   nomeado no critério, a hipótese não confirma — **falso-negativo silencioso por construção**, e
   agora corrigível em um lugar só (o critério), o que exige subir a revisão da hipótese.
