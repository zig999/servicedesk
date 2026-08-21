# Registro — ordem, conferência e o que ainda não tem caminho

**Termo.** O que aqui se chama `ConnectorConfiguration` é o **collect**: o registro que define a
chamada HTTP ao IFS — endereço, método, `responseMap` e `statusMap`. São três registros por
concept, e o collect é o terceiro:

| o registro | a palavra do motor | o que guarda |
|---|---|---|
| conceito | `Concept` | o nome, quais sujeitos aceita, o `ttl` |
| capacidade | `Capability` | o contrato da resposta — `output_schema`, `timeout`, e qual connector chamar |
| **collect** | `ConnectorConfiguration` | **a chamada**: `address`, `method`, `responseMap`, `statusMap` |

Os nomes de arquivo e de campo abaixo usam a palavra do motor, porque é ela que o cadastro exige
caractere por caractere.

Os artefatos prontos para registro, e a ordem em que precisam entrar. A ordem importa: uma
capability apontando para um concept inexistente é recusada; um caso citando termo fora do
glossário está citando nada.

| Ordem | Entidade | Arquivos |
|---|---|---|
| 1 | `subject-type`, `subject-attribute` | `../_glossary/{subject-type,subject-attribute}.json` |
| 2 | `outcome`, `action`, `recipient` | `../_glossary/{outcome,action,recipient}.json` |
| 3 | `concept` × 3 | `../_glossary/concept.json` |
| 4 | `Capability` × 3 | `capabilities/*.capability.json` |
| 5 | `ConnectorConfiguration` × 2 | `connectors/*.connector.json` |
| 6 | `Case` × 2 | `../app-congelado-hardware/1.json`, `../init-device-perda-dados/1.json` |

Os dois desfechos de não-conclusão (`inconclusive-no-data`,
`inconclusive-hypotheses-exhausted`) **preexistem a qualquer caso** e são escritos pelo próprio
seed (`NON_CONCLUSION_OUTCOMES`, `src/src/glossary/terms.ts:81`) — não estão em `outcome.json`.

`check.py`, neste diretório, confere mecanicamente tudo o que a checklist abaixo afirma sobre
concordância de nomes — rode `cd docs/cases && python3 _registry/check.py`. Ele não fala com o
banco nem com o IFS, e o que ele deliberadamente não pega está na sua própria docstring.

Capability e connector **não têm verificação cruzada automática** no motor: é possível registrar uma
capability cujo `connector` ainda não tem configuração, e o erro só aparece na hora de coletar.
Por isso os dois entram juntos e são conferidos caractere por caractere.

---

## Mapa de concordância de nomes

O que precisa bater exatamente entre registros vizinhos. A terceira coluna é a que o motor
**filtra em silêncio**: `observationOf` mantém do `responseMap` só as chaves que também estão em
`output_schema.properties` (`src/src/investigation/http-declarative-observation-source.adapter.ts:268`).
Um nome que não bate não dá erro — o campo simplesmente desaparece da observação.

| Concept | Capability | Connector | `properties` ⇄ `responseMap` |
|---|---|---|---|
| `perfil-mobile-tecnico` | `perfil-mobile-tecnico-reader` | `ifs-fsm-tech-profile-connector` | `login`, `installations` |
| `filas-de-transacao-falhadas` | `filas-de-transacao-falhadas-reader` | `ifs-fsm-tech-sync-status-connector` | `failedTransactions` |
| `serie-de-inits-do-device` | `serie-de-inits-do-device-reader` | `ifs-fsm-tech-sync-status-connector` | `syncEvents` |

**Duas capabilities, um connector.** `get-tech-sync-status` do IFS é uma operação só que responde
as filas de transação **e** o histórico de sincronização. Normalmente reaproveitar um connector é
errado — `address` e `responseMap` vivem na configuração, que é única por nome — mas aqui é
exatamente o caso em que é certo: mesma chamada, mesma resposta. O `responseMap` desse connector
carrega as duas chaves, e o filtro acima mantém cada capability na sua.

`statusMap`, idêntico nos dois connectors:

| status HTTP | desfecho | por quê |
|---|---|---|
| `200` | `ok` | inclui `data: null` para identidade inexistente e arrays vazios — **coleção vazia é `ok`, nunca `404`** |
| `400` | `denied` | `invalid-format` / `out-of-range` do IFS |
| `403` | `denied` | `read-only-violation` |
| `500` | `unavailable` | falha interna, **inclusive valor fora de vocabulário fechado** |
| `503` | `unavailable` | `store-not-configured` / `store-unavailable` |

Status **não** declarado resolve para `unavailable` por padrão silencioso
(`DEFAULT_STATUS_ENDING`, `…adapter.ts:79`) — daí declarar os cinco em vez de depender dele. O
`404` do IFS só ocorre em rota não casada, e cai no padrão de propósito: se a rota mudou, o
desfecho certo é "não deu para consultar".

**Só `ok` carrega observação** (`…adapter.ts:228`). `denied`, `unavailable` e `timeout` entregam
nada, e a hipótese vira "sem dados" sem custo de LLM.

---

## Conferência

### `Concept` (3×)
- [x] Todo nome em `accepts` existe como `subject-type` (`technician`).
- [x] `ttl` declarado explicitamente nos três — nunca omitido, não há valor padrão.
- [x] `accepts` com pelo menos um item, e apertado ao que os casos sustentam.
- [x] Todo concept que alguma hipótese coleta tem capability read-only (regra de coerência
      `every-collected-concept-has-a-read-only-capability`, checada **a cada leitura**).

### `Capability` (3×)
- [x] O `concept` citado existe.
- [x] Um concept, uma capability — nenhum dos três tem outra respondendo por ele.
- [x] `nature` é `"read-only"` nos três. **Justificativa contra o IFS**, não contra o repositório
      anterior: `ifs/knowledge/constraints/fsm-read-only-store-access.md` mais a recusa
      `read-only-violation` (HTTP 403) que o próprio serviço devolve.
- [x] Os oito campos preenchidos, nenhum vazio.
- [x] `timeout` inteiro nos três.
- [x] `output_schema` é JSON válido com `properties` cujas chaves são campos reais da resposta do
      IFS. Um `output_schema` malformado **não é recusado no cadastro** — mas faz `declaredFields`
      voltar vazio, o que faz **toda citação sobre aquele concept ser recusada** e a hipótese
      terminar sempre `inconclusive` (`citation-validation.ts:123`). É defeito grave mesmo não
      sendo barrado.
- [x] `name` + `version` únicos e estáveis (`*-reader` + `"1.0.0"`).

### `ConnectorConfiguration` (2×)
- [x] `connector` idêntico ao declarado pelas capabilities correspondentes.
- [x] `configuration` é objeto, com `address`, `method`, `responseMap` e `statusMap`.
- [x] Toda chave de `responseMap` corresponde a uma chave de `properties` de alguma capability
      que declara este connector.
- [x] Nenhuma credencial em texto puro — não há credencial nenhuma no payload (ver §Pendências, 1).
- [x] Todo `${subject:...}` usa um atributo registrado (`user-id`).
- [ ] **`address` tem host e porta reais** — ver §Pendências, 1.

### `Case` (2×)
- [x] Formato `manifest[]` com `hypothesis_name` + `revision`, mais `state` — o formato que
      `src/src/case/parse-case-document.ts` lê hoje. **Não** o array `hypotheses` com `name`, que
      é a forma retirada.
- [x] `position` únicos e refletindo a precedência real; lista na mesma ordem.
- [x] `hypothesis_name` únicos dentro do caso.
- [x] Cada `criterion` é uma única reivindicação falsificável.
- [x] Cada hipótese coleta ao menos um concept, e cada concept aceita o `subject` do caso.
- [x] Cada posição — hipóteses e fallback — declara `outcome` + `referral` completos.
- [x] Fallback distinto de toda resolução de hipótese do mesmo caso.
- [x] `slug` idêntico ao nome do diretório.
- [x] Todo termo citado existe no glossário.

---

## Pendências — a decidir por quem opera

Nenhuma foi decidida em silêncio.

1. **Endereço real do IFS, e se ele exige credencial.** Os dois `address` usam
   `http://IFS_HOST:IFS_PORT/…` — **placeholder literal, não um host inventado que pareça real.**
   O IFS não tem porta padrão: `HTTP_HOST` e `HTTP_PORT` são declarados no ambiente
   (`ifs/backend/src/config/env.ts`, e `server.ts` para de subir sem eles). O IFS também não
   registra plugin de autenticação — `ifs/knowledge/constraints/access-control-at-perimeter.md`
   diz que a alcançabilidade é confinada pelo perímetro de implantação. Então há duas decisões:
   qual host/porta, e se entra um header `Authorization: Bearer ${credential:VARIAVEL}`.
   `${credential:…}` é a **única** forma permitida de uma credencial entrar num connector: é lida
   de `process.env` no momento da chamada e a chamada é recusada se estiver vazia
   (`connector-request-resolver.ts:216`).

2. **Não existe caminho de cadastro para `ConnectorConfiguration`.** Este é o bloqueio mais duro,
   e é do siegardtest, não do conteúdo:

   | registro | serviço existe? | quem carrega hoje |
   |---|---|---|
   | `subject-type`, `subject-attribute`, `outcome`, `action`, `recipient` | sim (`RelationalGlossaryStore`) | só `npm run seed`, de `src/src/fixtures/glossary/*.json` |
   | `Concept` | sim | idem |
   | `Capability` | sim (`CapabilityRegistryService.registerCapability`) | idem, de `src/src/fixtures/capability/capability.json` |
   | `ConnectorConfiguration` | serviço existe (`ConnectorConfigurationRegistryService.registerConnector`), tabela existe (`migrations/0008-connector-configuration.sql`) | **nada.** Sem seed, sem rota, sem script |
   | `Case` | sim | `createDraft` → `reviseHypothesis` → `placeHypothesis` → `release` |

   As 19 rotas em `src/src/http/build-app.ts` são leitura (`list-*`, `read-*`), autoria de caso e
   `diagnose`. **Nenhuma escreve** concept, capability, vocabulário ou connector. Então registrar
   isto exige uma das duas: **(a)** estender `src/src/fixtures/**` e `seed.ts`, incluindo a parte
   de connector que não existe — cadastro passa a ser um deploy; **(b)** superfície de
   administração com rotas de escrita para os quatro registros. Qualquer uma passa pelos pontos de
   entrada do Siegard, porque "existe um caminho para registrar um connector" é um fato que a
   especificação deste projeto ainda não tem.

3. **Um caso não entra por arquivo.** Os `1.json` deste diretório são **documento de referência**,
   na forma que o parser lê — o formato de importação real é o par fixture/seed, e a autoria de
   verdade são as seis operações de ciclo de vida. Ambos os casos estão com `state: "draft"` de
   propósito: `released_at` só existe depois de `release`, e uma versão liberada é imutável
   (`migrations/0006-case-version-immutability.sql`,
   `0010-protect-released-hypothesis-revision-collects.sql`).

4. **`ttl` e `timeout` são propostas, não medidas.** Ninguém mediu a taxa real de mudança nem a
   latência real. Além disso, o `timeout` declarado **nunca vale mais que 7 000 ms**: o teto é
   `min(timeout, COLLECTION_STAGE_BUDGET_MS)`
   (`src/src/investigation/evidence-collection-stage.ts:24`, l. 108). Declarar 8 000 seria
   declarar um número que o motor não pode honrar.

5. **"Entrada inválida" não tem desfecho próprio.** Os quatro desfechos são `ok`, `unavailable`,
   `denied` e `timeout`. O `400` do IFS é erro de validação da requisição, não negação de
   permissão; `denied` é o menos ruim, não o certo. Consequência a conhecer: um `user-id`
   malformado e um IFS recusando por política ficam indistinguíveis no registro da evidência.

6. **Coleção vazia devolve `200`, nunca `404`.** "Técnico não existe" e "técnico sem device" são
   indistinguíveis pelo status — o IFS responde uma identidade inexistente com sucesso, por
   decisão (`ifs/knowledge/rules/fsm/task-answered-nonexistent-not-refused.md`,
   `access-group-absence-answered-not-refused.md`,
   `sync-history-absence-answered-not-refused.md`). Quem escreve um critério trata coleção vazia
   como **não-confirmado**, e nunca como falha de coleta.

7. **O limiar de `re-inits-em-serie`.** "Três ou mais em 24 horas" foi proposto, não herdado — ver
   `../init-device-perda-dados/collects.md` §Suposições. É o único item destas pendências que
   muda um resultado, e precisa ser confirmado antes do `release`.

---

## V2 e a ponte de identidade — por que `assignments-envio-baixa` não está aqui

O material de referência trazia um quarto concept, `assignments-envio-baixa`
(`list-task-assignments` do IFS, `GET /v1/tasks/:taskId/assignments`), com o papel de **ponte de
identidade**: quando o relato chega com um número de tarefa em vez do usuário, ela resolvia
tarefa → login e permitia rodar os collects por-técnico.

Esse papel **não tem lugar no motor**. O plano de coleta de um caso é o conjunto dos concepts que
suas hipóteses coletam (`src/src/case/case-resolution.ts`); nenhuma hipótese destes dois casos
coleta V2, e o sujeito da investigação chega **já montado** no corpo de `POST /v1/diagnose`. Quem
resolve tarefa → login é a camada de triagem que monta esse corpo, antes de o motor ser chamado —
não um collect.

Registrar o concept agora seria registrar um termo que nenhum caso cita. Ele volta quando uma
hipótese realmente o coletar — em `status-divergente-pso` ou `task-nao-desce`, do backlog. Quando
voltar, o IFS já o responde, e a única surpresa é de nomes: `executionInstanceSeq`→`id`,
`rowstate`→`status` (vocabulário fechado de nove valores minúsculos), `userId`→`resource.login`
**sem** `UPPER()`, campos ausentes **omitidos** e não `null`, e um `OBJSTATE` fora dos nove
valores derrubando a lista inteira da tarefa
(`ifs/knowledge/rules/fsm/unknown-assignment-status-fails-the-read.md`).

---

## Verificação contra o IFS ao vivo — 2026-08-21

`http://127.0.0.1:8787`, declarado pelo operador. Os dois endereços de connector deixaram de
carregar o marcador `IFS_HOST:IFS_PORT` e passaram a apontar para ele.

Foram feitas leituras reais, pela superfície HTTP do IFS e por nenhum outro caminho.

### O que a verificação confirmou

- **O envelope e as duas formas de resposta batem exatamente com o que os connectors declaram.**
  `GET /v1/technicians/RODRIGO.MATIAS/profile` devolveu `data.id` e `data.installations`;
  `GET /v1/technicians/RODRIGO.MATIAS/sync-status` devolveu `data.syncEvents` e
  `data.failedTransactions`. Nenhum `responseMap` precisou mudar.
- **A ponte tarefa → login existe e é a que o §V2 descreve.** Um `userId` não sai de
  `list-day-population`, que responde `resource.id` numérico; sai de
  `GET /v1/tasks/:taskId/assignments`, em `resource.login` — foi assim que
  `RODRIGO.MATIAS` foi obtido, a partir da tarefa 412188.
- **Campo ausente vem omitido, não nulo.** A única transação falhada devolvida trazia
  `device: { id: '10002' }` — sem `model`, sem `os`, sem `platform`, conforme
  `ifs/knowledge/rules/fsm/absent-device-model-omitted.md`.
- **O row cap é por tipo de sync-task, e isso é o que salva o collect.** A resposta trouxe 101
  eventos: **100 `batch` e 1 `init`**. Se o cap fosse global, o único `init` teria sido
  empurrado fora da janela pelos batches; ele sobreviveu porque
  `sync-history-capped-per-task-kind` conta por tipo.
- **A ambiguidade que o material de origem deixou está empiricamente resolvida.** A query de
  origem selecionava os três tipos e a projeção "contava todas as linhas retornadas"; ao pé da
  letra, `serie-de-inits-do-device` veria 101 e dispararia `>= 3` para **qualquer** técnico
  ativo. Contando só `init` e `init-entity-data`, como o critério faz, vê 1 — corretamente
  abaixo do limiar. A escolha registrada em `../init-device-perda-dados/collects.md` §Suposições
  deixa de ser só raciocínio e passa a ter medida.

### O que a verificação abriu — e que não estava em nenhuma pendência

**O critério de `limitacao-de-hardware` nomeia aparelhos por nome comercial; o IFS responde
código de modelo.** O critério fala de "Samsung Galaxy A04, A15 ou A16, ou qualquer aparelho da
linha G". O que veio foi `samsung SM-A176B` e `samsung SM-A146M` — texto livre com código
`SM-`, não nome comercial. Nenhum dos dois é A04/A15/A16, então a hipótese seria **refutada**
para este técnico, e a refutação está certa; o problema é que a decisão passa a depender de o
juiz saber mapear `SM-A166` → A16, `SM-A045` → A04 e assim por diante. Isso não é forma, é fato:
quais aparelhos são de linha de entrada é o que o negócio decidiu, e o critério precisa nomeá-los
na grafia em que a origem os guarda, ou a lista precisa virar um node. **Decidir isso é ato de
curadoria e precede o `release` de `app-congelado-hardware`**, na mesma condição em que o limiar
de `re-inits-em-serie` precede o de `init-device-perda-dados`.

### Sobre o endereço estar literal na linha

`http://127.0.0.1:8787` está no payload do connector como valor, não como placeholder. É
deliberado: a linha do connector **é** o dado por implantação, e
`http-connector/connector-request-resolver.ts` diz isso no próprio cabeçalho — "a new external
system is reached by a change to that connector's own configuration alone, never a change to
this module". Trocar de ambiente é registrar outro valor.

O resolvedor aceitaria `${credential:NOME_DA_VARIAVEL}` aqui, porque `resolveCredentialPlaceholder`
lê qualquer variável de ambiente nomeada e recusa quando ela está vazia. Fica registrado como
alternativa, não como recomendação: chamar de credencial uma URL base é usar a palavra errada, e
a recusa por variável ausente já é o que o valor literal ausente também produziria.
