# Configuration Helper guia o operador até uma connector-configuration que funciona

Material de entrada para `/analyse` → `/plan-work` → `/implement-task` → `/review-change`.
Consolida o pedido original (rascunho preenche `statusMap` e `responseMap`) com a reanálise de UX da
tela de autoria de connector-configuration. Cada seção marca o que é **decidido pelo humano** (o
pedido original e as sete decisões fechadas em 2026-09-12, seção 12) e o que é **proposto** (UX e
comportamentos da tela, aceitos pelo humano em 2026-09-12 como parte desta iniciativa). Nenhuma decisão
de derivação ficou pendente; o `/analyse` ainda decide nome, tipo e home dos nós.

---

## 1. Contexto

### 1.1 O que existe hoje

A tela de autoria/edição de connector-configuration (`connector-configuration-create-screen` e
`connector-configuration-detail-screen`) tem um campo **Connector**, um campo **Configuration**
(textarea JSON com Beautify e validação de sintaxe) e, abaixo, a seção **Configuration Helper**: link
de um documento OpenAPI, select de operações lidas do documento, botão que pede um rascunho, e a
disclosure do rascunho respondido — JSON em `<pre>` com botão **Apply**, mais três seções: itens não
resolvidos (nome + razão), credenciais geradas (nome + security scheme) e divergência de método
(registrado × rascunhado).

O rascunho é uma função pura da operação escolhida (`connector-configuration-draft-generation.ts`).
Hoje ele **nunca** preenche `statusMap` nem `responseMap` — a regra
`rules/integration/a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap` diz
que nenhum construto do OpenAPI permite inferir esses dois campos.

### 1.2 Investigação ao vivo

Via Chrome DevTools, no conector `ifs-fsm-tech-profile-connector`, operação
`GET /v1/technicians/:userId/profile`, documento OpenAPI real do serviço:

- Rascunho gerado: `{"method":"GET","address":"/v1/technicians/:userId/profile"}`.
- Config salva à mão para o mesmo conector: `statusMap` com 5 status (incluindo `400`/`500`, que
  **não existem** no documento) e `responseMap` com 2 entradas: `login`→`data.id` e
  `installations`→`data.installations`.
- O nome `login` não aparece no schema OpenAPI (o campo lá é `id`). Ele é o **nome do campo que a
  capability declara no `output_schema`** — ver 1.3.

### 1.3 Fato hoje só no código: chaves do `responseMap` são os campos do `output_schema`

Em `src/src/investigation/http-declarative-observation-source.adapter.ts`, `observationOf` extrai
os paths do `responseMap` e **descarta toda chave que não seja um campo declarado no
`output_schema` da capability** (`declaredFieldsOf(capability.output_schema)`). Consequências:

- Uma chave `id` no `responseMap`, quando a capability declara `login`, não produz nada.
- A coleta termina `ok` com observação vazia — nenhuma recusa, nenhum aviso, em lugar nenhum.
- Nenhum nó da especificação enuncia isso (grep em `knowledge/` por `responseMap` acha só 4
  arquivos, nenhum com este fato). **É a primeira lacuna a fechar no `/analyse`.**

Isso muda a leitura do pedido: o operador não renomeou `id`→`login` por preferência; renomeou porque
sem isso a configuração não observa nada.

### 1.4 As três camadas de "salvo corretamente"

| Camada | Quem decide | Critério (nó existente) | Quando o operador descobre hoje |
|---|---|---|---|
| 1. O registro aceita | Registry | JSON objeto bem-formado (`a-connector-configuration-holds-a-well-formed-object`); nome do conector (`a-connector-configuration-names-its-connector`); todo `${subject:x}` declarado por uma capability do conector (`a-connector-placeholder-is-declared-by-its-capability`) | Ao clicar Salvar (422) — só o JSON inválido é antecipado |
| 2. A chamada executa | HTTP connector em runtime | `method` ∈ GET/POST/PUT/PATCH/DELETE; `statusMap` objeto status→`ok`/`denied`/`timeout`/`unavailable`; `responseMap` objeto de strings (`an-http-connector-configuration-declares-its-method-and-status-vocabulary`); `address` não vazio (`an-http-connector-configuration-declares-its-call`); `${credential:X}` resolve no ambiente | Só numa coleta real, como `unavailable` + `MalformedHttpConnectorConfigurationError` |
| 3. A observação tem conteúdo | `observationOf` | chaves do `responseMap` ∩ campos do `output_schema` da capability | Nunca |

A tela hoje guia parcialmente a camada 1. O pedido original entrega **dados** para as camadas 2 e 3
(os dois mapas), mas não entrega **orientação**. Este material trata das duas coisas.

---

## 2. Pedido

### 2.1 Rascunho preenche `statusMap` e `responseMap` — decidido pelo humano

Revogar a regra atual: o rascunho passa a preencher os dois mapas deterministicamente a partir do
que a operação escolhida declara.

**Princípio orientador (humano):** o rascunho é **independente** de qualquer connector-configuration
já salva. É sempre a mesma função pura da operação OpenAPI escolhida. É deliberadamente mais
abrangente do que qualquer config que um operador tenha salvo à mão, porque a config salva é uma
escolha humana (filtra, renomeia, decide o que importa); o rascunho existe para dar o máximo de
informação para essa avaliação, não para acertar o valor final. O operador aplica e depois
edita/remove/renomeia antes de salvar.

Corolário: o rascunho **não** renomeia chaves do `responseMap` para casar com o `output_schema`.
O cruzamento com a capability é **disclosado na tela** (seções 4 e 5), nunca embutido no rascunho.

### 2.2 A tela guia o operador até uma configuração que funciona — proposto, aceito em 2026-09-12 como parte desta iniciativa

O helper vira um **acelerador** (preenche o campo com o máximo de material) e a tela ganha um
**guia** (painel de prontidão, seção 5) que diz o que ainda falta em cada camada, valendo tanto para
conteúdo vindo do rascunho quanto digitado à mão. Mensagens seguem o padrão
*o que está errado → por que importa → o que fazer*, em pt-BR.

---

## 3. Regras de derivação do rascunho

### 3.1 `statusMap` — decidido pelo humano

Para cada status code numérico que a operação declara em `responses`:

- `2xx` → `"ok"`
- `401`, `403`, `407` → `"denied"`
- demais `4xx` → `"unavailable"`
- `5xx` → `"unavailable"`
- Nenhum status gera `"timeout"` — esse ending só nasce de um timeout real de rede em runtime.

**3.1.a — decidido (2026-09-12):** só `401/403/407` viram `denied`. Razão: `denied` no vocabulário
sugere autorização/autenticação; 400/404/422 continuam `unavailable`, que é o que
`an-unclassified-status-ends-unavailable` já produz hoje em runtime para eles — o rascunho não altera
o ending desses casos, só o torna explícito. (Sobrescreve o "todo 4xx → denied" do pedido original.)

**3.1.b — decidido (2026-09-12):** `responses.default` e chaves de faixa `2XX`/`4XX`/`5XX` **não são
rascunhadas** — nenhuma casa com `statusMap[String(status)]` em runtime — e são nomeadas na disclosure
como "não rascunhado", cada uma com o motivo (seção 4.2).

**Decidido por consequência:** `statusMap` é **sempre emitido**, mesmo `{}` quando a operação não
declara `responses` — a ausência da chave torna a config malformada em runtime. Chaves em ordem
numérica crescente.

### 3.2 `responseMap` — decidido pelo humano

Para cada propriedade top-level do schema JSON da resposta de sucesso, uma entrada cuja chave é o
**nome literal** da propriedade e cujo valor é o path até ela. Sem inferir nome de conceito, sem
filtrar, sem achatar abaixo do primeiro nível.

**3.2.a — envelope, decidido (2026-09-12): descida de envelope único.** Quando o schema de sucesso
tem **exatamente uma** propriedade e ela é `type: object` com `properties`, o rascunho desce um nível
e prefixa o path com o nome dessa propriedade (`"id": "data.id"`); a descida é disclosada ("campos
lidos dentro do envelope `data`"). Em qualquer outro caso, top-level literal (`"id": "id"`). Nunca
desce mais de um nível. Razão: `data` é convenção desta API, não do OpenAPI; a regra precisa valer
para qualquer documento sem hardcodar o nome do envelope.

**3.2.b — mais de um `2xx`, decidido (2026-09-12): união deduplicada por nome.** Os campos de todos
os `2xx` com schema JSON são listados; um nome repetido com paths diferentes fica com o path do
menor status e o conflito é disclosado ("`id` aparece em 200 como `data.id` e em 201 como `id`;
foi usado o de 200"). A regra de envelope (3.2.a) é aplicada por status, antes da união.

**3.2.c — composição na raiz, decidido (2026-09-12):** `allOf` mescla as `properties` de todas as
partes; `oneOf`/`anyOf` listam os campos de todas as variantes, disclosado como "a resposta N declara
variantes; os campos de todas foram listados". A composição é resolvida antes da regra de envelope.

**Decididos por consequência:**

- Só `content["application/json"]` (mesma leitura que `requestBodyFieldNamesOf` já faz para o body).
- `2xx` sem `content` (ex.: `204`) entra no `statusMap` e não contribui para o `responseMap`.
- `responseMap` é **sempre emitido**, mesmo `{}` quando não há `2xx` com schema JSON — a ausência
  da chave torna a config malformada em runtime.
- Ordem das entradas: a ordem em que o schema declara as propriedades.
- Além de chave e path, o leitor guarda **para disclosure** (nunca para o JSON do rascunho): o
  `type` da propriedade, se está em `required`, e a `description` da resposta por status.

### 3.3 Exemplo concreto (orienta a leitura; não copiar literalmente na especificação)

Para `GET /v1/technicians/{userId}/profile` — responses `200` (schema `{ data: { id, installations,
syncEvents, failedTransactions, gpsTrail, active, accessGroups } }`), `403`, `503`, mais um `default`
— com a recomendação 3.2.a aplicada:

```json
{
  "method": "GET",
  "address": "/v1/technicians/${subject:userId}/profile",
  "statusMap": { "200": "ok", "403": "denied", "503": "unavailable" },
  "responseMap": {
    "id": "data.id",
    "installations": "data.installations",
    "syncEvents": "data.syncEvents",
    "failedTransactions": "data.failedTransactions",
    "gpsTrail": "data.gpsTrail",
    "active": "data.active",
    "accessGroups": "data.accessGroups"
  }
}
```

7 entradas contra as 2 que o operador escolheu — esperado e é o ponto: o rascunho não faz curadoria.

---

## 4. Disclosure do rascunho respondido — proposto, aceito em 2026-09-12

O `<pre>` com o JSON continua (é o que **Aplicar** copia para o campo). Abaixo dele, além das três
seções existentes, entram seções que explicam os dois mapas com informação que o JSON não carrega.

### 4.1 Cabeçalho de estado do rascunho

Uma linha de síntese acima do JSON, derivada das seções abaixo:

- `Rascunho de GET /v1/technicians/{userId}/profile para o conector ifs-fsm-tech-profile-connector.`
- `Este rascunho precisa de N ajustes antes de funcionar.` (N = itens ✗ do painel de prontidão
  avaliados sobre o texto do rascunho) ou `Este rascunho está pronto para aplicar e salvar.`
- Se link, operação ou conector mudarem depois do rascunho:
  `Este rascunho ficou desatualizado — o link, a operação ou o conector mudaram. Peça um novo rascunho.`
  (o botão Aplicar permanece disponível; o rascunho não é descartado sozinho).

### 4.2 Seção "Mapa de status" (tabela)

| coluna | origem |
|---|---|
| Status | chave em `responses` |
| Resultado | ending rascunhado |
| Declarado no documento como | `responses[status].description` |

Abaixo da tabela, uma linha "Não rascunhado": `default`, chaves de faixa, content types não-JSON —
cada um com o motivo em uma frase.

Estado vazio (operação sem `responses`): em vez da tabela,
`A operação não declara respostas. statusMap foi rascunhado vazio ({}); todo status terminará como "unavailable" até você preencher.`

### 4.3 Seção "Mapa de resposta" (tabela)

| coluna | origem |
|---|---|
| Campo | chave rascunhada (nome literal) |
| Path | valor rascunhado |
| Tipo | `type` no schema (`string`, `array`, `object`, `boolean`, `number`) |
| Obrigatório | presença em `required` |
| Lido pela capability | nome da capability do conector cujo `output_schema` declara esse campo, ou `—` |

Abaixo da tabela:

- **Cobertura inversa** (o item de maior valor): `A capability ifs-tech-profile espera o campo "login", e nenhuma entrada do rascunho tem esse nome. Renomeie a entrada que corresponde a ele ou adicione "login": "<path>".` Uma linha por campo do `output_schema` não coberto, por capability.
- **Envelope**: `Os campos foram lidos dentro do envelope "data" da resposta 200.` (só quando 3.2.a desceu).
- **Variantes** (3.2.c): `A resposta 200 declara variantes (oneOf); os campos de todas foram listados.`
- Quando não há capability registrada para o conector: `Nenhuma capability usa este conector ainda, então não é possível dizer quais campos serão lidos. Registre uma capability para o conector antes de salvar.` com rota para a tela de capabilities.

Estado vazio (sem `2xx` com schema JSON):
`A operação não declara uma resposta 2xx com schema JSON. responseMap foi rascunhado vazio ({}); a coleta terminará "ok" sem observar nenhum campo até você preencher.`

### 4.4 Seções existentes — mensagens reescritas

- **Não resolvidos** — cada razão diz o que fazer (catálogo, seção 8).
- **Credenciais geradas** — `O security scheme "bearerAuth" virou ${credential:IFS_FSM_TECH_PROFILE_CONNECTOR_BEARERAUTH}. Defina essa variável de ambiente no servidor antes de testar a configuração.`
- **Divergência de método** — `A configuração salva chama com POST; esta operação está declarada como GET. Ao aplicar e salvar, o conector passa a chamar com GET.`

---

## 5. Painel de prontidão — proposto, aceito em 2026-09-12 nesta iniciativa (os três blocos)

Painel fixo logo abaixo do campo **Configuration**, reavaliado a cada alteração do conteúdo do
campo (não do rascunho). Três blocos, na ordem em que o operador precisa vencê-los. Quatro estados
por item:

- `✓` critério atendido
- `✗` bloqueia a camada — com motivo e ação
- `!` não verificável nesta tela — diz quem verifica e quando
- `·` informativo, não bloqueia

Cada item julga **pelo critério de um nó existente** e não promete verificação que ninguém faz — a
mesma disciplina de `a-connector-configuration-surface-judges-its-configuration-fields-content`.

### 5.1 Bloco "Pode ser salva" (camada 1)

| item | critério | mensagem quando ✗ |
|---|---|---|
| JSON objeto válido | `a-connector-configuration-holds-a-well-formed-object` | `O conteúdo não é um objeto JSON válido (perto da linha N). Corrija a sintaxe para habilitar Salvar.` |
| Nome do conector | `a-connector-configuration-names-its-connector` | `Preencha o nome do conector.` |
| Cada `${subject:x}` | `a-connector-placeholder-is-declared-by-its-capability` | `${subject:userId} não é declarado no input_schema de nenhuma capability do conector "X". O registro vai recusar. Ajuste o nome do placeholder ou o input_schema da capability.` |
| Sem capability para o conector | idem | `Nenhuma capability usa o conector "X" ainda; os placeholders ${subject:…} não podem ser conferidos. Registre uma capability para o conector.` [ir para capabilities] |

Enquanto houver `✗` neste bloco, **Salvar** fica desabilitado e o botão exibe o motivo
(`Salvar indisponível: corrija os itens em "Pode ser salva"`).

### 5.2 Bloco "Vai executar" (camada 2)

| item | critério | mensagem quando ✗ / ! |
|---|---|---|
| `method` | `an-http-connector-configuration-declares-its-method-and-status-vocabulary` | `"get" não é um método aceito. Use GET, POST, PUT, PATCH ou DELETE.` |
| `address` presente e não vazio | `an-http-connector-configuration-declares-its-call` | `Falta o address. Informe o caminho ou URL da chamada.` |
| `statusMap` presente, objeto | idem vocabulário | `Falta o statusMap. Sem ele a chamada não é feita e a coleta termina "unavailable".` |
| Cada valor de `statusMap` | idem | `statusMap "200": "OK" não é um resultado conhecido. Use ok, denied, timeout ou unavailable.` |
| `responseMap` presente, objeto de strings | idem | `Falta o responseMap.` / `responseMap "id" precisa ser um path em texto, não um número.` |
| `query`/`headers` objetos de string, se presentes | `an-http-connector-configuration-declares-its-call` | `headers precisa ser um objeto de textos.` |
| Cada `${credential:X}` | — (não verificável) | `! ${credential:X} precisa existir como variável de ambiente no servidor. Esta tela não consegue conferir; o teste após salvar confere.` |
| Placeholder malformado | `a-connector-configuration-placeholder-is-written-in-one-of-three-forms` | `"${subject}" está incompleto: use ${subject:<atributo>}, ${requester} ou ${credential:<nome>}.` |

### 5.3 Bloco "Vai observar algo" (camada 3)

Requer o nó novo (seção 9.3). Para cada capability do conector:

| item | mensagem |
|---|---|
| campo do `output_schema` coberto por chave do `responseMap` | `✓ installations → lido por ifs-tech-profile` |
| campo do `output_schema` sem chave | `✗ login — ifs-tech-profile espera este campo e nenhuma chave do responseMap tem esse nome. Renomeie uma chave para "login" ou adicione "login": "<path>".` |
| chave do `responseMap` que nenhuma capability lê | `· id, syncEvents, gpsTrail — nenhuma capability lê estes campos. Não atrapalham; remova se não precisar.` |
| sem capability registrada | `! Nenhuma capability usa este conector; não é possível dizer o que será observado.` |
| `responseMap` vazio | `✗ responseMap está vazio; a coleta terminará "ok" sem observar nada.` |

`✗` neste bloco **não** desabilita Salvar (o registro aceita), mas o cabeçalho do painel diz
`Pode ser salva, mas não vai observar nada ainda`.

### 5.4 Cabeçalho do painel

Uma frase-síntese, sempre presente:

- `Pronta para salvar e testar.`
- `Pode ser salva, mas não vai executar: N item(ns) em "Vai executar".`
- `Pode ser salva, mas não vai observar nada ainda: N item(ns) em "Vai observar algo".`
- `Não pode ser salva: N item(ns) em "Pode ser salva".`
- Campo vazio: `Cole uma configuração, ou use o Configuration Helper abaixo para gerar um rascunho.`

---

## 6. Descrição da tela e variações de comportamento

### 6.1 Composição (de cima para baixo)

1. Campo **Connector** (inalterado).
2. Campo **Configuration** (textarea JSON, Beautify, validação de sintaxe) + texto fixo de ajuda:
   `Uma configuração HTTP declara method, address, statusMap e responseMap; query, headers e body são opcionais. Placeholders: ${subject:<atributo>}, ${requester}, ${credential:<nome>}.`
3. **Painel de prontidão** (seção 5).
4. **Configuration Helper**: link OpenAPI · select de operações · botão Pedir rascunho ·
   disclosure (seção 4).
5. Rodapé: Salvar (+ ações da tela de detalhe: descartar, testar, voltar).

### 6.2 Etapa 0 — antes do helper

| situação | comportamento |
|---|---|
| Campo Connector vazio | Helper mostra `Preencha o nome do conector antes de pedir um rascunho: é por ele que o rascunho encontra as capabilities e resolve os placeholders.` Botão Pedir rascunho desabilitado. |
| Connector preenchido, nenhuma capability o usa | Helper funciona; painel e disclosure mostram o aviso de "nenhuma capability" com rota para capabilities. |
| Campo Configuration vazio | Painel exibe o convite (5.4); Salvar desabilitado. |
| Tela de detalhe com config já registrada | Painel avalia o conteúdo registrado desde o primeiro render — configs antigas podem já mostrar ✗ (ex.: `statusMap` ausente). |

### 6.3 Etapa 1 — link e operação

| situação | comportamento |
|---|---|
| Link vazio | Select desabilitado com placeholder `Informe o link do documento OpenAPI`. |
| Link digitado, leitura em andamento | Select desabilitado, `Lendo as operações do documento…`. |
| Leitura recusada — não buscou | `Não foi possível buscar o documento (motivo: falha de rede / tempo esgotado / resposta HTTP N). Confira o link e tente novamente.` |
| Leitura recusada — não legível | `O documento foi buscado, mas não é um OpenAPI 3.x legível. Confira se o link aponta para o JSON/YAML da especificação (Swagger 2.0 não é aceito).` |
| Documento lido, zero operações | `O documento não declara nenhuma operação.` |
| Documento com operações | Select `path — MÉTODO`, com filtro por texto quando houver mais de 15 (superfície). |
| Operação não escolhida | Pedir rascunho desabilitado com hint `Escolha uma operação para pedir o rascunho.` A recusa "operação não encontrada" fica inalcançável por esta via. |
| Link alterado após escolher operação | Seleção limpa; disclosure anterior marcada como desatualizada (4.1). |

### 6.4 Etapa 2 — pedido e resposta do rascunho

| situação | comportamento |
|---|---|
| Pedido em andamento | `Gerando o rascunho…`; botão desabilitado; disclosure anterior permanece (marcada como desatualizada se houver). |
| Recusado — link não buscado | mesma mensagem de 6.3, prefixada `Nenhum rascunho foi gerado:`. |
| Recusado — documento não legível | idem. |
| Recusado — operação não encontrada | `Nenhum rascunho foi gerado: o documento não declara GET em /v1/x. Recarregue a lista de operações.` |
| Recusado — motivo não reconhecido | `Nenhum rascunho foi gerado: o pedido falhou por um motivo que esta tela não reconhece. Tente novamente; se persistir, avise o suporte.` |
| Respondido | Disclosure completa (seção 4). O campo Configuration **não muda** (`the-configuration-field-is-untouched-by-a-drafts-arrival`). |
| Respondido com mapas vazios | Estados vazios de 4.2/4.3. |
| Respondido sem capability | Avisos de "nenhuma capability" em 4.3 e no painel. |

### 6.5 Etapa 3 — aplicar e editar

| situação | comportamento |
|---|---|
| Aplicar, campo sem edição não salva | Substitui o campo; painel reavalia; foco vai para o campo Configuration; toast `Rascunho aplicado. Revise os itens do painel antes de salvar.` |
| Aplicar, campo com edição não salva | Diálogo de confirmação com **diff** (6.7). Confirmar substitui; cancelar mantém tudo. |
| Aplicar na tela de detalhe | O "edição não salva" inclui o conteúdo registrado carregado; o diff compara registrado × rascunho. |
| Operador edita à mão | Painel reavalia a cada alteração; sem debounce visível (avaliação é local). |
| Operador renomeia `id`→`login` | Item ✗ de `login` vira ✓; `id` some da lista `·`. |
| Operador digita `"OK"` | Item ✗ em "Vai executar" na hora, não na coleta. |
| Operador remove `statusMap` | Item ✗ `Falta o statusMap`. |

### 6.6 Etapa 4 — salvar e depois

| situação | comportamento |
|---|---|
| Salvar desabilitado | Botão com motivo: `Salvar indisponível: corrija os itens em "Pode ser salva".` |
| Registrado | `Configuração do conector "X" salva.` seguido de **Próximos passos**: (1) se há `${credential:…}`: `Defina a variável de ambiente Y no servidor.`; (2) `Teste a configuração com a capability Z.` [Testar] — rota para o teste na tela de detalhe (`a-presented-connector-configuration-offers-its-test-on-the-reading-that-answered`). |
| Recusado — não bem-formado | `Nada foi salvo: o conteúdo não é um objeto JSON.` (o painel já deveria ter impedido; mensagem de segurança). |
| Recusado — placeholder órfão | `Nada foi salvo: ${subject:userId} não é declarado pela capability ifs-tech-profile.` (lista todos). |
| Recusado — condição não reconhecida | `Nada foi salvo: o registro recusou por um motivo que esta tela não reconhece.` |
| Pós-save, tela de detalhe | Painel continua visível avaliando o registrado; o item `!` de credencial permanece até o teste. |

### 6.7 Diálogo de confirmação de Aplicar

```
┌───────────────────────────────────────────────────────────────┐
│ Aplicar o rascunho sobre a edição atual?                      │
├───────────────────────────────────────────────────────────────┤
│ O conteúdo do campo Configuration que você ainda não salvou   │
│ será substituído. Isso não pode ser desfeito.                 │
│                                                               │
│ O que muda                                                    │
│  method       POST → GET                                      │
│  statusMap    remove 400, 500          adiciona (nenhum)      │
│  responseMap  remove login             adiciona id,           │
│                                        syncEvents,            │
│                                        failedTransactions,    │
│                                        gpsTrail, active,      │
│                                        accessGroups           │
│  headers      remove X-Tenant                                 │
│                                                               │
│                      ┌──────────────────┐  ┌───────────────┐  │
│                      │ Continuar editando│ │   Aplicar     │  │
│                      └──────────────────┘  └───────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

O diff compara por chave top-level; para `statusMap`, `responseMap`, `query` e `headers`, por
sub-chave. Quando o conteúdo atual não é JSON válido: `O conteúdo atual não é JSON válido, então não é possível mostrar o que muda.`

---

## 7. Wireframes

### 7.1 Tela completa — rascunho respondido, campo já aplicado e editado à mão

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Connector                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ifs-fsm-tech-profile-connector                                          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Configuration                                                  [Beautify]   │
│ Uma configuração HTTP declara method, address, statusMap e responseMap;     │
│ query, headers e body são opcionais. Placeholders: ${subject:<atributo>},   │
│ ${requester}, ${credential:<nome>}.                                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ {                                                                       │ │
│ │   "method": "GET",                                                      │ │
│ │   "address": "/v1/technicians/${subject:userId}/profile",               │ │
│ │   "headers": { "Authorization": "Bearer ${credential:IFS_…_BEARERAUTH}"}│ │
│ │   "statusMap": { "200": "OK", "403": "denied", "503": "unavailable" },  │ │
│ │   "responseMap": { "id": "data.id", "installations": "data.installat…" }│ │
│ │ }                                                                       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ Prontidão ─────────────────────────────────────────────────────────────┐ │
│ │ Pode ser salva, mas não vai executar: 1 item em "Vai executar".         │ │
│ │                                                                         │ │
│ │ Pode ser salva                                                          │ │
│ │  ✓ Objeto JSON válido                                                   │ │
│ │  ✓ ${subject:userId} é declarado pela capability ifs-tech-profile       │ │
│ │                                                                         │ │
│ │ Vai executar                                                            │ │
│ │  ✓ method GET · ✓ address presente · ✓ responseMap com paths em texto   │ │
│ │  ✗ statusMap "200": "OK" não é um resultado conhecido.                  │ │
│ │      Use ok, denied, timeout ou unavailable.                            │ │
│ │  ! ${credential:IFS_FSM_TECH_PROFILE_CONNECTOR_BEARERAUTH} precisa      │ │
│ │      existir como variável de ambiente no servidor. Esta tela não       │ │
│ │      consegue conferir; o teste após salvar confere.                    │ │
│ │                                                                         │ │
│ │ Vai observar algo                                                       │ │
│ │  ✓ installations → lido por ifs-tech-profile                            │ │
│ │  ✗ login — ifs-tech-profile espera este campo e nenhuma chave do        │ │
│ │      responseMap tem esse nome. Renomeie uma chave para "login" ou      │ │
│ │      adicione "login": "<path>".                                        │ │
│ │  · id — nenhuma capability lê este campo. Não atrapalha; remova se não  │ │
│ │      precisar.                                                          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ─────────────────────────────────────────────────────────────────────────── │
│ Configuration Helper                                                        │
│                                                                             │
│ Link do documento OpenAPI                   Operação                        │
│ ┌─────────────────────────────────────┐     ┌─────────────────────────────┐ │
│ │ https://ifs…/openapi.json           │     │ /v1/technicians/{userId}… ▾ │ │
│ └─────────────────────────────────────┘     └─────────────────────────────┘ │
│                                                        ┌──────────────────┐ │
│                                                        │ Pedir rascunho   │ │
│                                                        └──────────────────┘ │
│                                                                             │
│ Rascunho de GET /v1/technicians/{userId}/profile para                       │
│ ifs-fsm-tech-profile-connector. Este rascunho precisa de 2 ajustes antes    │
│ de funcionar.                                                ┌───────────┐  │
│                                                              │  Aplicar  │  │
│ ┌──────────────────────────────────────────────────────────┐ └───────────┘  │
│ │ { "method": "GET", "address": "…", "statusMap": {…},     │                │
│ │   "responseMap": {…} }                                   │                │
│ └──────────────────────────────────────────────────────────┘                │
│                                                                             │
│ Mapa de status                                                              │
│ ┌────────┬──────────────┬──────────────────────────────────────────────────┐│
│ │ Status │ Resultado    │ Declarado no documento como                      ││
│ ├────────┼──────────────┼──────────────────────────────────────────────────┤│
│ │ 200    │ ok           │ Technician profile                               ││
│ │ 403    │ denied       │ Forbidden                                        ││
│ │ 503    │ unavailable  │ Service unavailable                              ││
│ └────────┴──────────────┴──────────────────────────────────────────────────┘│
│ Não rascunhado: resposta "default" (não é um status) · conteúdo text/html   │
│ na resposta 503 (só application/json é lido).                               │
│                                                                             │
│ Mapa de resposta — campos lidos dentro do envelope "data" da resposta 200   │
│ ┌────────────────────┬────────────────────────┬─────────┬─────┬───────────┐ │
│ │ Campo              │ Path                   │ Tipo    │ Obr.│ Lido por  │ │
│ ├────────────────────┼────────────────────────┼─────────┼─────┼───────────┤ │
│ │ id                 │ data.id                │ string  │ sim │ —         │ │
│ │ installations      │ data.installations     │ array   │ sim │ ifs-tech… │ │
│ │ syncEvents         │ data.syncEvents        │ array   │ não │ —         │ │
│ │ failedTransactions │ data.failedTransactions│ array   │ não │ —         │ │
│ │ gpsTrail           │ data.gpsTrail          │ array   │ não │ —         │ │
│ │ active             │ data.active            │ boolean │ sim │ —         │ │
│ │ accessGroups       │ data.accessGroups      │ array   │ não │ —         │ │
│ └────────────────────┴────────────────────────┴─────────┴─────┴───────────┘ │
│ ⚠ A capability ifs-tech-profile espera o campo "login", e nenhuma entrada   │
│   do rascunho tem esse nome. Renomeie a entrada correspondente ou adicione  │
│   "login": "<path>".                                                        │
│                                                                             │
│ Não resolvidos                                                              │
│ (nenhum)                                                                    │
│                                                                             │
│ Credenciais geradas                                                         │
│ • O security scheme "bearerAuth" virou                                      │
│   ${credential:IFS_FSM_TECH_PROFILE_CONNECTOR_BEARERAUTH}. Defina essa      │
│   variável de ambiente no servidor antes de testar a configuração.          │
│                                                                             │
│ Divergência de método                                                       │
│ A configuração salva chama com POST; esta operação está declarada como GET. │
│ Ao aplicar e salvar, o conector passa a chamar com GET.                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ Salvar ]  [ Descartar ]  [ Testar ]  [ Voltar ]                           │
│   Salvar indisponível: corrija os itens em "Pode ser salva".  (quando for)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Estados vazios e de aviso (no lugar das tabelas)

```
Mapa de status
  A operação não declara respostas. statusMap foi rascunhado vazio ({});
  todo status terminará como "unavailable" até você preencher.

Mapa de resposta
  A operação não declara uma resposta 2xx com schema JSON. responseMap foi
  rascunhado vazio ({}); a coleta terminará "ok" sem observar nenhum campo
  até você preencher.

Mapa de resposta (sem capability)
  Nenhuma capability usa este conector ainda, então não é possível dizer
  quais campos serão lidos. Registre uma capability para o conector antes
  de salvar.  [Ir para capabilities]
```

### 7.3 Helper antes de ter conector / operação

```
Configuration Helper
  ⓘ Preencha o nome do conector antes de pedir um rascunho: é por ele que o
    rascunho encontra as capabilities e resolve os placeholders.

Link do documento OpenAPI            Operação
┌───────────────────────────┐        ┌──────────────────────────────────┐
│ https://…                 │        │ Lendo as operações do documento… │
└───────────────────────────┘        └──────────────────────────────────┘
                                     ┌──────────────────────────────────┐
                                     │ Pedir rascunho  (desabilitado)   │
                                     │ Escolha uma operação para pedir  │
                                     │ o rascunho.                      │
                                     └──────────────────────────────────┘
```

### 7.4 Pós-save

```
✓ Configuração do conector "ifs-fsm-tech-profile-connector" salva.

Próximos passos
 1. Defina a variável de ambiente IFS_FSM_TECH_PROFILE_CONNECTOR_BEARERAUTH
    no servidor.
 2. Teste a configuração com a capability ifs-tech-profile.   [Testar]
```

---

## 8. Catálogo de mensagens (pt-BR)

Padrão: **o que está errado → por que importa → o que fazer.** Uma ou duas linhas. Sem vocabulário
da especificação ("invariante", "reading", "surface"). Nomes técnicos (`statusMap`, `${subject:…}`)
mantidos porque são o que o operador digita.

### 8.1 Razões de item não resolvido

| razão | mensagem |
|---|---|
| `no-capability-registered` | `Nenhuma capability usa o conector "X" ainda, então "userId" não pôde virar ${subject:userId}. Registre uma capability para este conector e peça o rascunho de novo.` |
| `security-scheme-not-reducible-to-a-credential` | `O security scheme "oauth2" não se reduz a um único valor de credencial. Escreva essa parte da chamada à mão (header, query ou cookie) usando ${credential:<nome>}.` |
| `drafted-key-occupied-by-another-security-scheme` | `"X-Api-Key" já foi ocupado por outro security scheme desta operação. Decida qual dos dois a chamada envia e ajuste à mão.` |

### 8.2 Recusas do rascunho e da leitura de operações

Ver 6.3 e 6.4. A distinção "não buscou" × "não legível" × "operação não encontrada" × "não
reconhecido" é obrigatória (`a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document`,
`a-refused-draft-request-states-its-refusal-to-the-operator`).

### 8.3 Painel de prontidão

Ver 5.1–5.4.

### 8.4 Resultado do registro

Ver 6.6. A distinção "registrado" × "recusado com condição nomeada" × "recusado sem condição" é
obrigatória (`a-submitted-registration-states-its-outcome-to-the-operator`).

### 8.5 Rótulos fixos

Connector · Configuration · Prontidão · Pode ser salva · Vai executar · Vai observar algo ·
Configuration Helper · Link do documento OpenAPI · Operação · Pedir rascunho · Aplicar · Mapa de
status · Mapa de resposta · Não resolvidos · Credenciais geradas · Divergência de método · Salvar ·
Descartar · Testar · Voltar · Continuar editando.

Nota: a tela hoje está em inglês. A troca de idioma dos rótulos é superfície; o conteúdo das
mensagens (o que dizem) é fato onde muda o que o operador aprende.

---

## 9. Impacto na especificação

### 9.1 Revogar / reescrever

- `rules/integration/a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap` —
  revogar; substituir por duas regras de derivação (3.1 e 3.2) e uma de emissão sempre presente.
  A entrada no decision-log deve dizer por que a leitura mudou: o documento **supre** os status e
  os paths; o que ele não supre (o ending de cada status e o nome do campo que a capability lê) é
  exatamente o que a tela passa a disclosar em vez de inventar.
- `domain/integration/connector-configuration-draft` — Description afirma "it never states a
  responseMap or a statusMap, which no OpenAPI construct can supply"; reescrever. Avaliar novos
  atributos para carregar o material de disclosure (tipo, obrigatório, description por status,
  envelope, construtos não rascunhados) — ou um value-object irmão.
- `rules/integration/an-answered-draft-request-states-its-draft-to-the-operator` — cita a regra
  revogada (Description) e precisa passar a exigir a disclosure dos dois mapas, do material de
  proveniência e da cobertura contra o `output_schema`.
- `domain/integration/connector-configuration-draft-unresolved-reason` — avaliar se os "não
  rascunhados" (default, faixas, não-JSON, variantes) entram como razões novas ou como elemento
  próprio.

### 9.2 Nós novos — rascunho

- Derivação do `statusMap` por faixa (com a decisão 3.1.a).
- Derivação do `responseMap` por propriedade top-level, com regra de envelope (3.2.a), múltiplos
  `2xx` (3.2.b) e composição (3.2.c).
- Emissão sempre presente dos dois mapas, `{}` quando vazios.
- Construtos não rascunhados são nomeados na resposta (3.1.b).

### 9.3 Nós novos — fato hoje só no código

- **Uma observação carrega só os campos do `output_schema` que o `responseMap` alcança** —
  enuncia o que `observationOf` faz. Sem este nó, nem a cobertura inversa (4.3) nem o bloco "Vai
  observar algo" (5.3) têm fato para citar.
  **Home decidido (2026-09-12):** policy em `rules/integration/`, com `constrains`
  `domain/integration/connector-configuration` e `domain/investigation/evidence`, no molde de
  `an-unclassified-status-ends-unavailable`. O nome fica para o `/analyse`. Evidência no código:
  `src/src/investigation/http-declarative-observation-source.adapter.ts`, função `observationOf`.

### 9.4 Nós novos — tela

- Gate do nome do conector no helper (6.2).
- Pedir rascunho só com operação escolhida (6.3).
- Estados da leitura de operações distinguíveis: em andamento, vazio, recusado (6.3).
- Rascunho desatualizado quando link/operação/conector mudam (4.1).
- Confirmação de Aplicar declara o que muda (6.7) — estende
  `an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation`.
- Painel de prontidão: uma regra por bloco, cada uma no molde de
  `a-connector-configuration-surface-judges-its-configuration-fields-content` (julga pelo critério
  de um nó existente; não promete check que ninguém faz; distinguível das quatro leituras do read).
  O item `!` de credencial é o que garante esse limite.
- Salvar desabilitado declara o motivo (estende
  `a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed`).
- Pós-registro declara próximos passos (credencial a definir, teste com capability) — estende
  `a-submitted-registration-states-its-outcome-to-the-operator`.
- Texto fixo de ajuda junto ao campo Configuration — análogo a
  `an-output-schema-entry-states-what-the-system-reads-from-it`, com o mesmo limite de "nenhuma
  sexta afirmação".

### 9.5 Não muda

`applying-a-drafted-configuration-changes-only-the-local-edit`,
`the-configuration-field-is-untouched-by-a-drafts-arrival`,
`a-connector-configuration-draft-registers-nothing`, `a-drafted-method-is-never-taken-from-the-registered-configuration`,
as regras de placeholder e de credencial gerada, e o contrato `connector-configuration-draft`
(continua uma leitura; a resposta cresce, a operação não).

---

## 10. Impacto no código (pontos de partida para o plan-work)

### Backend (`src/src`)

- `connector-registry/openapi-operation-reader.ts` — `OpenApiOperationReading` ganha `responses`:
  por status, `description`, e para `application/json` o schema resolvido (com `$ref`), suas
  `properties` top-level (nome, `type`, `required`), a descida de envelope e os construtos
  ignorados. Reutiliza `resolveRef`.
- `connector-registry/connector-configuration-draft-generation.ts` — `draftedConfigurationText`
  passa a emitir `statusMap` e `responseMap`; a resposta do draft carrega o material de disclosure.
- `connector-registry/capabilities-reader.port.ts` — `RegisteredCapabilityForPlaceholderCheck`
  ganha `output_schema` (hoje só `input_schema`) para a cobertura inversa.
- `connector-registry/connector-configuration-draft.ts` — tipo da resposta cresce.
- `http/draft-connector-configuration-from-openapi.routes.ts` — schema de resposta.
- Nenhuma mudança em `http-declarative-observation-source.adapter.ts`: o comportamento de
  `observationOf` é o que a especificação passa a enunciar (9.3), não o que muda.

### Frontend (`frontend/app/src`)

- `hooks/use-connector-configuration-helper.ts` — gate por conector, invalidação do rascunho ao
  mudar link/operação/conector, seleção limpa ao mudar link.
- `hooks/use-draft-connector-configuration-from-openapi.ts` — tipo da resposta.
- `services/connector-configuration-draft-disclosure.ts` — mapas, proveniência, cobertura,
  mensagens pt-BR (o dicionário atual tem uma razão órfã, `no-matching-input-schema-property`, que
  não existe na enumeração — limpar).
- `routes/connector-configuration-helper-fields.tsx` — tabelas, estados vazios, cabeçalho,
  botão desabilitado com hint, estados da leitura de operações.
- `routes/connector-configuration-form-fields.tsx` — painel de prontidão, texto de ajuda, diff no
  diálogo, motivo no Salvar desabilitado.
- Novo serviço puro para o painel de prontidão (entrada: texto do campo + capabilities do conector;
  saída: itens por bloco) — testável sem DOM.
- Novo serviço puro para o diff do diálogo.
- `routes/connector-configuration-create-screen.tsx` / `-detail-screen.tsx` — próximos passos
  pós-save; leitura das capabilities do conector para o painel (já existe leitura equivalente para o
  teste na tela de detalhe).

---

## 11. Fora de escopo / quinta rota

- Editor estruturado (linhas chave→valor) para `statusMap`/`responseMap` no lugar do textarea.
  Mudaria o que o operador pode fazer (fato) e colide com "configuração é texto opaco autorado
  diretamente"; fica registrado para uma iniciativa futura.
- Aplicação parcial do rascunho (checkbox por entrada) — não recomendado; a edição pós-aplicar
  cobre com custo zero.
- Agrupamento/filtro do select de operações, tooltips, espaçamentos, ícones, troca de idioma dos
  rótulos fixos — superfície; só se `siegard.json` declarar `edits_freely` para os arquivos.

---

## 12. Decisões fechadas pelo humano em 2026-09-12

Todas decididas antes do `/analyse`; a análise as registra no decision-log como decisões do humano,
não como decisões tomadas em seu nome.

| # | decisão | resultado |
|---|---|---|
| 3.1.a | quais `4xx` viram `denied` | só `401`, `403`, `407`; demais `4xx` → `unavailable` |
| 3.1.b | `default` e faixas `2XX`/`4XX`/`5XX` | não rascunhar; disclosar como "não rascunhado" com motivo |
| 3.2.a | regra de envelope | descida de envelope único quando o schema 2xx tem exatamente uma propriedade `object` com `properties`; path prefixado; disclosado; nunca mais de um nível |
| 3.2.b | múltiplos `2xx` | união deduplicada por nome; conflito de path fica com o menor status e é disclosado |
| 3.2.c | `allOf`/`oneOf`/`anyOf` na raiz | `allOf` mescla; `oneOf`/`anyOf` união disclosada como variantes |
| 5 | escopo do painel de prontidão | entra nesta iniciativa, com os três blocos |
| 9.3 | home do nó "observação carrega só campos do `output_schema` que o `responseMap` alcança" | policy em `rules/integration/`, constrains `connector-configuration` + `evidence`, molde de `an-unclassified-status-ends-unavailable` |

O que **ainda fica** para o `/analyse`: nomes e tipos dos nós novos, redação de statements e
expressions, quais atributos novos o elemento `connector-configuration-draft` ganha para carregar o
material de disclosure (ou se nasce um value-object irmão), e se os "não rascunhados" entram na
enumeração de razões existente ou em elemento próprio.

---

## 13. Roteamento

Fato de negócio (o que o sistema preenche, disclosa e diz ao operador; o que o painel julga), não
superfície. Rota completa: `/analyse` → `/plan-work` → `/implement-task` → `/review-change`.
