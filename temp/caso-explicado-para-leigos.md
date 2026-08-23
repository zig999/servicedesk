# O ServiceDeskN1 explicado por um caso de verdade

Este documento usa **o único caso que está hoje no banco de produção** — lido linha por linha em
2026-08-21 — para explicar o que o ServiceDeskN1 é, quais peças ele tem, como elas se conectam, e
o que acontece quando alguém o chama.

Não pressupõe conhecimento nenhum do sistema. Todo termo técnico é explicado na primeira vez que
aparece.

---

## Parte 1 — O que é o ServiceDeskN1

### A analogia

Imagine um técnico sênior de suporte que, depois de dez anos, aprendeu que quando alguém reclama
"o aplicativo fecha sozinho", vale checar três coisas, **nesta ordem**:

1. o aparelho é fraco? → se sim, é isso, manda pro pessoal de TI
2. as notificações estão desligadas? → se sim, é isso, manda pro suporte do app
3. o cara tem dois celulares no mesmo login? → se sim, é isso, manda tirar o antigo

Esse técnico escreveu isso num papel. O papel tem tudo: o que checar, em que ordem, e o que fazer
em cada caso.

**O ServiceDeskN1 é a máquina que executa esse papel.** Ela não sabe nada sobre celular, sobre
aplicativo, sobre suporte. Ela sabe fazer quatro coisas:

- ir buscar os fatos que o papel manda buscar, em outros sistemas;
- decidir cada item do papel — bate ou não bate — olhando **só** os fatos que buscou;
- parar no primeiro item que bate;
- escrever o laudo e guardar tudo.

### A consequência importante disso

O papel é **dado**, não código. Escrever um caso novo, corrigir um critério, apontar um fato para
outro sistema — nada disso recompila nada, nada disso é um release. É cadastro.

É por isso que o sistema se chama resolvedor de casos e não "diagnosticador de celular": troque o
papel, e ele resolve outra coisa completamente diferente sem uma linha de código nova.

---

## Parte 2 — O que existe hoje no banco

O banco é um Postgres na nuvem (Neon). Estas são as contagens reais:

| tabela | linhas | o que é |
|---|---|---|
| `subject_types` | 1 | tipos de "coisa" que se pode investigar |
| `subject_attributes` | 1 | como identificar essa coisa |
| `outcomes` | 8 | os desfechos possíveis de uma investigação |
| `actions` | 7 | as providências possíveis |
| `recipients` | 4 | para quem se encaminha |
| `concepts` | 1 | os fatos que se pode ir buscar |
| `capabilities` | 1 | quem sabe buscar cada fato |
| `connector_configurations` | 1 | como chegar em quem sabe |
| `cases` | 1 | o caso |
| `case_versions` | 1 | a versão do caso |
| `hypotheses` | 3 | as hipóteses |
| `hypothesis_revisions` | 3 | o conteúdo de cada hipótese |
| `hypothesis_revision_collects` | 3 | quais fatos cada hipótese precisa |
| `case_version_hypotheses` | 3 | a ordem em que as hipóteses são checadas |
| `investigations` | 3 | três execuções já rodadas |

**Um caso, três hipóteses, um fato observável, três execuções.** É tudo.

---

## Parte 3 — As entidades, de fora para dentro

Vou percorrer as peças na ordem em que elas precisam existir. Cada uma depende das anteriores.

### 3.1 — Os vocabulários: as palavras permitidas

Antes de qualquer coisa, o sistema exige que **toda palavra usada num caso esteja cadastrada**.
Não é burocracia: é o que impede um caso de dizer "manda pra fila-suporte" e outro dizer
"encaminhar ao suporte" querendo dizer a mesma coisa. Se a palavra não está na lista, o caso é
recusado.

São cinco listas. Cada uma guarda **só nomes** — nenhuma descrição, nenhum valor.

**`subject_types` — que tipo de coisa se investiga**

```
technician
```

Uma linha. Este sistema, hoje, só investiga técnicos. Poderia investigar contratos, equipamentos,
pedidos — bastaria cadastrar.

**`subject_attributes` — como se identifica essa coisa**

```
user-id
```

Um técnico é identificado pelo `user-id`. Note que esta lista é **global e não amarrada ao tipo**:
nada diz "user-id serve para technician". Foi decisão de projeto — quem sabe qual atributo precisa
é o conector, na hora de montar a chamada.

**`outcomes` — os desfechos possíveis** (8)

```
issue-limitacao-de-hardware              issue-descarte-por-inicializacao
issue-push-desabilitado                  issue-re-inits-em-serie
issue-multiplos-devices-vinculados       issue-transacao-falha-viva
inconclusive-hypotheses-exhausted        inconclusive-no-data
```

Os seis `issue-*` são problemas identificados. Os dois `inconclusive-*` são desfechos de
não-conclusão, e o sistema **exige** que existam antes do primeiro caso — porque toda investigação
tem de poder terminar dizendo "não descobri", e não haveria palavra para isso.

**`actions` — as providências** (7)

```
orientar-runbook-de-hardware        solicitar-reprocesso-de-transacao
orientar-runbook-de-push            escalar-fornecedor-ifs
remover-devices-obsoletos           orientar-logout-login-sem-inicializar
orientar-regras-de-ouro-do-mwo
```

**`recipients` — para quem vai** (4)

```
fila-suporte-mwo    fila-ti-unifique    fila-backoffice    fila-fornecedor-ifs
```

> **Sobra proposital.** Das 19 palavras cadastradas, o caso atual usa 10. As outras 9 —
> `issue-re-inits-em-serie`, `fila-backoffice`, `escalar-fornecedor-ifs` e mais 6 — pertencem a
> casos que ainda não foram cadastrados. Palavra cadastrada e não usada não incomoda ninguém; o
> contrário é que é erro.

### 3.2 — `concepts`: os fatos que se pode ir buscar

Um **conceito** é um fato observável. Não é o valor do fato — é o *nome* do fato.

```
name : perfil-mobile-tecnico
ttl  : 300
```

Leia assim: *"existe um fato chamado perfil-mobile-tecnico, e ele vale por 300 segundos"*.

O `ttl` (*time to live*, tempo de vida) é a tolerância de frescor: quanto tempo uma observação
desse fato continua valendo antes de precisar ser buscada de novo.

> ⚠️ **Este `ttl` hoje não faz nada.** O estágio de coleta grava um padrão fixo de 60 segundos,
> porque não tem caminho até o valor registrado. Está declarado no próprio código
> (`src/investigation/evidence.ts`). Ou seja: 300 está cadastrado, 60 é o que acontece.

**`concept_accepts`** amarra o conceito ao tipo de coisa que ele descreve:

```
concept_name : perfil-mobile-tecnico
subject_type_name : technician
```

*"esse fato só faz sentido sobre um técnico."*

### 3.3 — `capabilities`: quem sabe buscar o fato

Um conceito diz **o que** se quer saber. Uma **capacidade** diz **quem sabe responder**, e qual é
o formato da resposta.

```
name          : perfil-mobile-tecnico-reader
version       : 1.0.0
nature        : read-only
concept       : perfil-mobile-tecnico
connector     : ifs-fsm-tech-profile-connector
timeout       : 5000
input_schema  : "user-id: o usuario corporativo do tecnico, sem domínio, na grafia
                 que o store do FSM guarda (o IFS nao normaliza a caixa)"
output_schema : {"type":"object","properties":{
                   "login":        {"type":"string"},
                   "installations":{"type":"array","items":{"type":"object","properties":{
                       "appName":      {"type":"string"},
                       "clientVersion":{"type":"string"},
                       "state":        {"enum":["active","disabled","inactive",
                                                "init-required","activated","initializing"]},
                       "pushEnabled":  {"type":"boolean"},
                       "gpsEnabled":   {"type":"boolean"},
                       "lastAccess":   {"type":"string"},
                       "device":       {"properties":{"id","model","os","platform"}}}}}}}
```

Campo por campo:

- **`nature: read-only`** — só lê, nunca altera nada no sistema externo. O vocabulário conhece
  duas naturezas, `read-only` e `mutating`, mas **só a primeira consegue se registrar**: uma regra
  recusa a segunda. É uma garantia estrutural — um diagnóstico jamais muda o mundo que está
  diagnosticando.
- **`timeout: 5000`** — 5 segundos de paciência. Vale notar: o estágio de coleta tem um teto
  próprio de **7 segundos** (`COLLECTION_STAGE_BUDGET_MS`) e usa o menor dos dois. Declarar 60
  segundos aqui não daria 60 segundos.
- **`input_schema`** — prosa livre, para quem lê. Note o detalhe: *"o IFS nao normaliza a caixa"*.
  Isso significa que `RODRIGO.MATIAS` e `rodrigo.matias` são logins diferentes. É o tipo de
  armadilha que só quem já se queimou documenta.
- **`output_schema`** — **este é o campo que mais importa**, e por um motivo que não é óbvio: ele
  é a **lista branca de campos**. Só o que está declarado aqui chega ao julgamento. Tudo o mais
  que o sistema externo devolver é descartado antes de qualquer decisão.

### 3.4 — `connector_configurations`: como chegar lá

A capacidade diz *quem* responde. O **conector** diz *como chamar*.

```json
{
  "connector": "ifs-fsm-tech-profile-connector",
  "configuration": {
    "method": "GET",
    "address": "http://127.0.0.1:8787/v1/technicians/${subject:user-id}/profile",
    "responseMap": {
      "login": "data.id",
      "installations": "data.installations"
    },
    "statusMap": {
      "200": "ok",
      "400": "denied",
      "403": "denied",
      "500": "unavailable",
      "503": "unavailable"
    }
  }
}
```

Quatro coisas acontecem aqui.

**`address` e o `${subject:user-id}`.** Aquilo entre `${}` é um espaço em branco preenchido na
hora. Investigando `RODRIGO.MATIAS`, o endereço que sai é:

```
http://127.0.0.1:8787/v1/technicians/RODRIGO.MATIAS/profile
```

Existem três tipos de espaço em branco: `${subject:<atributo>}` (um atributo do sujeito),
`${requester}` (quem pediu o diagnóstico) e `${credential:<VARIÁVEL>}` (uma senha, lida do
ambiente na hora, **nunca guardada aqui**).

Se o sujeito não tiver o atributo, a chamada é **recusada antes de sair** — não sai uma chamada
com um buraco na URL.

**`responseMap` — o tradutor.** O sistema externo responde no formato dele. Este mapa traduz para
os nomes que a capacidade declarou:

```
o IFS respondeu               →  o mapa diz         →  a observação fica
{"data":{"id":"RODRIGO...",       login ← data.id       {"login":"RODRIGO...",
         "installations":[…]},    installations ←        "installations":[…]}
 "metadata":{},"error":[]}         data.installations
```

Note que `metadata` e `error` **desapareceram**. Não porque o mapa os excluiu — porque não estão
no `output_schema`. Duas peneiras em série.

**`statusMap` — traduzindo "deu certo?"**. Toda tentativa de observar termina num de exatamente
quatro finais:

| final | significado |
|---|---|
| `ok` | veio dado, e só este final carrega observação |
| `unavailable` | o sistema não respondeu, ou respondeu erro |
| `denied` | recusou responder |
| `timeout` | estourou o tempo |

Um status que o mapa não prevê cai em `unavailable` por padrão.

**O `configuration` inteiro é opaco.** Esse JSON entra e sai do banco sem que nenhum módulo de
domínio olhe dentro dele. Foi decisão explícita de projeto: assim o nome do fornecedor, o formato
da URL e o dialeto do sistema externo nunca entram no modelo do negócio. Trocar de fornecedor é
trocar esta linha — não é mexer em código.

### 3.5 — O caso, e por que ele tem quatro tabelas

Aqui está a parte mais confusa à primeira vista, e vou explicar *por que* é assim antes de mostrar
*como* é.

**O problema que essas quatro tabelas resolvem.** Um caso é conhecimento vivo: o técnico sênior vai
querer melhorar um critério na semana que vem. Mas uma investigação já feita tem de continuar
legível para sempre — se alguém contestar um laudo de três meses atrás, é preciso poder mostrar
**exatamente** o critério que estava valendo naquele dia. As duas coisas parecem se contradizer.

A saída é separar três coisas que a gente normalmente confunde:

| tabela | guarda | analogia |
|---|---|---|
| `cases` | a **identidade** do caso | a pasta na estante |
| `case_versions` | uma **edição** do caso | uma edição do manual dentro da pasta |
| `hypotheses` | o **nome** de uma hipótese | o título de um capítulo |
| `hypothesis_revisions` | o **texto** daquela hipótese | a redação daquele capítulo, numerada |
| `case_version_hypotheses` | o **índice**: qual redação, em que ordem | o sumário da edição |

**`cases` — a pasta**

```
slug         : perfil-mobile-tecnico-probe
next_version : 2
```

`next_version: 2` é um contador que **só sobe**. A próxima versão criada será a 2 — mesmo que a 1
seja descartada. Número de versão nunca é reciclado.

**`case_versions` — a edição**

```
slug                   : perfil-mobile-tecnico-probe
version                : 1
state                  : released
title                  : Sonda do conceito perfil-mobile-tecnico
when_to_use            : Quando se quer exercitar a cadeia conceito-capability-connector
                         de perfil-mobile-tecnico contra o IFS, com as tres hipoteses que
                         so coletam esse conceito.
subject                : technician
authored_at            : 2026-08-21T00:00:00.000Z
released_at            : 2026-08-21T17:03:11.993Z
consolidation_register : plain
fallback_outcome       : inconclusive-hypotheses-exhausted
fallback_action        : orientar-regras-de-ouro-do-mwo
fallback_recipient     : fila-suporte-mwo
```

- **`state`** só tem dois valores: `draft` (rascunho, editável à vontade) e `released` (liberado,
  **imutável para sempre**). Este está `released`.
- **A imutabilidade é do banco, não do código.** O schema tem regras que transformam `UPDATE` e
  `DELETE` sobre versão liberada em **nada** — silenciosamente. Não há como um bug de aplicação
  furar isso.
- **Um caso só pode ter um rascunho de cada vez** — garantido por um índice único parcial.
- **`fallback`** é a saída de emergência: se nenhuma hipótese confirmar, é este o desfecho.
  Toda versão é obrigada a ter um.
- **`consolidation_register: plain`** é o tom do laudo: `plain` (direto) ou `formal`.
- **`title` e `when_to_use`** não são decoração: eles vão junto no pedido ao juiz, para dar
  contexto — mas o juiz é instruído a nunca usá-los como evidência.

**`hypotheses` — os nomes**

```
perfil-mobile-tecnico-probe / limitacao-de-hardware
perfil-mobile-tecnico-probe / push-desabilitado
perfil-mobile-tecnico-probe / multiplos-devices-vinculados
```

Só isso. Nenhum conteúdo. O nome é único dentro do caso, para sempre, em todas as versões.

**`hypothesis_revisions` — o conteúdo**

Aqui está o miolo. Três revisões, todas `revision: 1`.

---

**Hipótese 1 · `limitacao-de-hardware` · revisão 1**

> Alguma instalação do técnico está vinculada a um aparelho de linha de entrada — um Samsung
> Galaxy A04, A15 ou A16, ou qualquer aparelho da linha G — com histórico documentado de
> encerramento do app por falta de memória. O modelo é o texto livre que a origem guarda, e ocorre
> com ou sem o nome do fabricante à frente; um aparelho cuja instalação não traz modelo algum não
> confirma esta hipótese.

```
resolution_outcome   : issue-limitacao-de-hardware
resolution_action    : orientar-runbook-de-hardware
resolution_recipient : fila-ti-unifique
```

**Hipótese 2 · `push-desabilitado` · revisão 1**

> Uma mesma instalação do técnico está com estado `active` e com o envio de notificações
> desabilitado. Uma instalação que não traz o campo de notificações não confirma esta hipótese: o
> campo ausente significa que a origem guardou ali um valor que não é nenhum dos dois que ela
> codifica, e não que o envio esteja desligado.

```
resolution_outcome   : issue-push-desabilitado
resolution_action    : orientar-runbook-de-push
resolution_recipient : fila-suporte-mwo
```

**Hipótese 3 · `multiplos-devices-vinculados` · revisão 1**

> O técnico tem duas ou mais instalações do app vinculadas ao seu usuário, cada uma em um aparelho
> distinto, independentemente do estado de cada instalação.

```
resolution_outcome   : issue-multiplos-devices-vinculados
resolution_action    : remover-devices-obsoletos
resolution_recipient : fila-suporte-mwo
```

---

Três coisas a observar nesses critérios:

1. **São prosa, não código.** Não há operador, não há campo, não há `if`. Quem decide se batem é um
   modelo de linguagem, lendo o critério e a evidência.
2. **São falsificáveis.** "duas ou mais instalações em aparelhos distintos" é verificável e pode
   dar errado. "o app está com problema" não seria critério.
3. **Duas delas dizem explicitamente o que fazer com campo ausente** — e sempre para o lado
   conservador: ausente **não** confirma. Isso importa porque o sistema externo omite campos em vez
   de mandar nulo; sem essa instrução, o juiz poderia ler ausência como negação.

**`hypothesis_revision_collects` — o que cada hipótese precisa**

```
limitacao-de-hardware        r1 → perfil-mobile-tecnico
push-desabilitado            r1 → perfil-mobile-tecnico
multiplos-devices-vinculados r1 → perfil-mobile-tecnico
```

Todas as três pedem o mesmo fato. Isso quer dizer que o sistema busca esse fato **uma vez só** e
usa nas três — é a união dos conceitos que forma o plano de coleta, não uma busca por hipótese.

**`case_version_hypotheses` — o índice, e a ordem**

```
posição 1 → limitacao-de-hardware        revisão 1
posição 2 → push-desabilitado            revisão 1
posição 3 → multiplos-devices-vinculados revisão 1
```

**A ordem é a regra de decisão.** Não é preferência de leitura: o desfecho é o da **primeira**
posição que confirmar, e as seguintes não mudam nada. Quem escreveu o caso pôs hardware antes de
push porque, se as duas coisas forem verdade, hardware é a causa que interessa.

### 3.6 — `investigations`: o que já aconteceu

Cada execução deixa um registro imutável. Há três, todas do mesmo caso, todas com o mesmo desfecho:

| id | ticket | desfecho | determinante | quando |
|---|---|---|---|---|
| `f29f2015` | — | `issue-multiplos-devices-vinculados` | `multiplos-devices-vinculados` | 17:06:54 |
| `e0481212` | `DEBUG-01` | idem | idem | 17:24:18 |
| `6816975d` | `DEBUG-01` | idem | idem | 17:25:23 |

Cada uma guarda também: a evidência coletada com sua observação inteira, um julgamento por
hipótese, as citações de cada julgamento, os pares atributo-valor do sujeito, a versão do prompt
(`v1`) e o modelo usado.

> ⚠️ **Custo e duração são gravados em zero.** As três investigações dizem `cost_calls: 0`,
> tokens 0, durações 0 — e todas fizeram quatro chamadas de modelo e levaram ~17 segundos. É
> deliberado e documentado: nenhuma porta reporta esses números, e a rota grava zero em vez de
> inventar. Mas o registro não diz quanto custou.

---

## Parte 4 — O mapa

```
  ┌───────────────────── VOCABULÁRIOS: as palavras permitidas ─────────────────────┐
  │  subject_types      subject_attributes    outcomes    actions    recipients    │
  │  [technician]       [user-id]             [8]         [7]        [4]           │
  └──────┬────────────────────┬───────────────────┬──────────┬───────────┬─────────┘
         │ aceita             │ citado no          └──────────┴───────────┘
         │                    │ placeholder                   │ nomeados pelas
         ▼                    │                               │ resoluções
    concepts                  │                               │
    perfil-mobile-tecnico     │                               │
    ttl 300                   │                               │
         │ 1 conceito         │                               │
         │ 1 capacidade       │                               │
         ▼                    │                               │
    capabilities              │                               │
    perfil-mobile-tecnico-    │                               │
    reader 1.0.0              │                               │
    timeout 5000              │                               │
         │ nomeia             │                               │
         ▼                    ▼                               │
    connector_configurations                                  │
    ifs-fsm-tech-profile-connector                            │
    GET .../${subject:user-id}/profile                        │
         │                                                    │
         ▼                                                    │
    ╔═══════════════════════╗                                 │
    ║  IFS  (outro sistema) ║                                 │
    ╚═══════════════════════╝                                 │
                                                              │
  ┌───────────────────────── O CASO ─────────────────────────┐ │
  │  cases                                                   │ │
  │  perfil-mobile-tecnico-probe · next_version 2            │ │
  │      │                                                   │ │
  │      ▼                                                   │ │
  │  case_versions ── v1 · released · fallback ──────────────┼─┤
  │      │                                                   │ │
  │      ▼                                                   │ │
  │  case_version_hypotheses  (o índice, com a ORDEM)        │ │
  │  pos 1 → limitacao-de-hardware        r1                 │ │
  │  pos 2 → push-desabilitado            r1                 │ │
  │  pos 3 → multiplos-devices-vinculados r1                 │ │
  │      │                          │                        │ │
  │      │ nomeia                   │ usa a revisão          │ │
  │      ▼                          ▼                        │ │
  │  hypotheses            hypothesis_revisions ─────────────┼─┘
  │  (só o nome)           (critério + resolução)             │
  │                                 │                         │
  │                                 ▼                         │
  │                        hypothesis_revision_collects ──────┼──► concepts
  │                        (quais fatos precisa)              │
  └───────────────────────────────────────────────────────────┘
                              │
                              ▼ ao ser executado, produz
                        investigations
                        + evidence + evaluations + citations
                              (imutável)
```

Lendo o mapa em uma frase: **o caso pede conceitos; cada conceito tem uma capacidade; cada
capacidade tem um conector; o conector fala com o mundo. E toda palavra que o caso usa tem de estar
num vocabulário.**

---

## Parte 5 — Uma execução real, passo a passo

Esta é a investigação `6816975d`, com os valores que de fato passaram por ali.

### O pedido

```json
POST /v1/diagnose
{
  "case": { "slug": "perfil-mobile-tecnico-probe", "version": 1 },
  "subject": { "type": "technician",
               "attributes": [{ "attribute": "user-id", "value": "RODRIGO.MATIAS" }] },
  "narrative": "Tecnico relata que o aplicativo MWO fecha sozinho durante o expediente...",
  "requester": "siegfried.neto",
  "ticket_ref": "DEBUG-01"
}
```

Quatro coisas obrigatórias: **qual caso** (com versão fixa — sempre se sabe qual edição do manual
foi usada), **qual sujeito**, **a narrativa** e **quem pediu**.

### Passo 1 — Lê o caso, e revalida tudo

O sistema monta a versão 1 inteira numa transação só, e **revalida na hora da leitura**: todo termo
existe no vocabulário? todo conceito coletado aceita `technician`? todo conceito tem `ttl`? todo
conceito tem capacidade read-only? Se qualquer resposta for não, para aqui.

Isso é o oposto de "validou quando foi cadastrado". O caso é validado **em toda leitura**, porque o
vocabulário pode ter mudado desde o cadastro.

### Passo 2 — Monta o plano de coleta

União dos conceitos que as hipóteses exigidas pedem: `{perfil-mobile-tecnico}`. **Um** fato, para
três hipóteses.

### Passo 3 — Vai buscar o fato

Conceito → capacidade → conector → placeholder resolvido → chamada:

```
GET http://127.0.0.1:8787/v1/technicians/RODRIGO.MATIAS/profile
→ HTTP 200 em 168 ms
```

Resposta do IFS:

```json
{ "data": { "id": "RODRIGO.MATIAS",
            "installations": [
              { "clientVersion":"26.4.3834.0", "state":"active", "pushEnabled":true,
                "lastAccess":"2026-08-21T14:25:00.000Z",
                "device":{"model":"samsung SM-A176B","os":"Android-Phone 16",
                          "platform":"Android","id":"10002"},
                "appName":"ServiceEngApp" },
              { "clientVersion":"26.4.3834.0", "state":"inactive", "pushEnabled":true,
                "lastAccess":"2026-06-26T09:40:37.000Z",
                "device":{"model":"samsung SM-A146M","os":"Android-Phone 15",
                          "platform":"Android","id":"3860"},
                "appName":"ServiceEngApp" } ] },
  "metadata": {}, "error": [] }
```

### Passo 4 — Peneira e guarda como evidência

`statusMap` diz que 200 é `ok`. O `responseMap` traduz, o `output_schema` peneira:

```json
{"login":"RODRIGO.MATIAS","installations":[ … as duas instalações … ]}
```

`metadata` e `error` não passaram. A evidência gravada:

```
concept    : perfil-mobile-tecnico
result     : ok
origin     : ifs-fsm-tech-profile-connector
capability : perfil-mobile-tecnico-reader 1.0.0
ttl        : 60          ← o padrão fixo, não o 300 do conceito
```

### Passo 5 — Julga cada hipótese, isoladamente

Aqui está a parte mais importante de entender. **Cada hipótese vai numa chamada separada ao
modelo**, e cada chamada recebe **só cinco coisas**:

1. o critério **daquela** hipótese;
2. a evidência, com o nome do conceito e a lista de campos permitidos;
3. o título do caso;
4. o `when_to_use` do caso;
5. nada mais.

O que **não** entra: a narrativa do usuário, os dados do sujeito, o critério das outras hipóteses,
o resultado das outras hipóteses. Uma hipótese não pode contaminar outra, e a narrativa — que é
opinião de quem abriu o chamado — não pode virar evidência.

O modelo só pode responder uma de três formas exatas:

```
{"verdict":"confirmed",  "citations":[{"concept":"...","field":"..."}]}
{"verdict":"refuted",    "citations":[{"concept":"...","field":"..."}]}
{"verdict":"inconclusive"}
```

**Confirmar ou refutar exige citar** — dizer de qual conceito e de qual campo saiu a conclusão. E
a citação é **checada por máquina**: se o campo citado não estiver na lista que a capacidade
declarou, a citação não vale. Não dá para o modelo inventar a fonte.

O que aconteceu:

| pos | hipótese | resposta do modelo | tempo | tokens saída |
|---|---|---|---|---|
| 1 | `limitacao-de-hardware` | `{"verdict":"inconclusive"}` | 866 ms | 15 |
| 2 | `push-desabilitado` | `refuted`, citando `installations` | 789 ms | 33 |
| 3 | `multiplos-devices-vinculados` | `confirmed`, citando `installations` | 1766 ms | 32 |

Traduzindo:

- **posição 1** — o modelo não conseguiu decidir (por quê, na Parte 7);
- **posição 2** — refutada: as duas instalações têm `pushEnabled: true`, o oposto do critério;
- **posição 3** — confirmada: duas instalações, aparelhos `10002` e `3860`, distintos. Bate.

### Passo 6 — Resolve o desfecho

Percorre as posições em ordem e para na primeira confirmada:

```
pos 1  inconclusive  → segue
pos 2  refuted       → segue
pos 3  confirmed     → PARA AQUI
```

Desfecho = a resolução da posição 3:

```
outcome   : issue-multiplos-devices-vinculados
action    : remover-devices-obsoletos
recipient : fila-suporte-mwo
```

Se nenhuma tivesse confirmado, seria o `fallback`: `inconclusive-hypotheses-exhausted` /
`orientar-regras-de-ouro-do-mwo` / `fila-suporte-mwo`.

### Passo 7 — Redige o laudo

Uma chamada final a um modelo mais forte, que recebe **só** as três avaliações e a evidência — e
uma instrução de que tudo ali é dado, nunca instrução a seguir. Levou 7,6 s (71% do tempo medido).

### Passo 8 — Grava e só então responde

Investigação, evidência, três avaliações, duas citações, os pares do sujeito. **A resposta só sai
depois que o registro está escrito** — se a gravação falhar, o pedido falha. Nunca há laudo
entregue sem registro correspondente.

```json
{ "outcome": "issue-multiplos-devices-vinculados",
  "referral": { "action": "remover-devices-obsoletos", "recipient": "fila-suporte-mwo" },
  "determining_hypothesis": "multiplos-devices-vinculados",
  "text": "# Avaliação da Investigação\n\n..." }
```

Tempo total: **17,4 segundos**.

---

## Parte 6 — Seis decisões de projeto que este caso deixa ver

**1. O conhecimento é dado, o motor é código.** Nada em nenhuma tabela deste caso é específico de
celular. Trocar as três hipóteses por três hipóteses sobre contrato de internet não toca uma linha
do motor.

**2. Uma hipótese por vez, sem contexto lateral.** Julgar as três juntas seria mais barato e mais
rápido. A escolha foi a oposta, para que o veredicto de uma não possa se apoiar no da outra.

**3. Citação verificada por máquina.** O modelo pode errar o julgamento — não pode errar a fonte.
Se ele citar um campo que a capacidade não declarou, a citação é rejeitada mecanicamente.

**4. Precedência em vez de pontuação.** Não há score, não há "72% de confiança". Há uma ordem que
uma pessoa escreveu, e a primeira que bate ganha. Quem quiser mudar a prioridade edita a ordem, não
ajusta um peso.

**5. Imutabilidade pelo banco.** Versão liberada não muda porque o schema não deixa. Não é
disciplina de código, não é revisão de PR — é regra do Postgres.

**6. Só quatro finais de observação, e só um traz dado.** `ok`, `unavailable`, `denied`, `timeout`.
Não existe "veio meio dado". Isso força quem escreve o critério a pensar no caso sem dado, em vez
de descobrir na produção.

---

## Parte 7 — O que está errado neste caso

Um caso real tem defeitos, e este tem dois. Servem melhor como ensinamento do que qualquer exemplo
perfeito.

### Defeito 1 — a hipótese 1 pede um fato que nenhum conceito carrega

Volte ao critério da `limitacao-de-hardware`. Ele exige **duas** coisas:

1. um aparelho de linha de entrada — A04, A15, A16 ou linha G;
2. **"com histórico documentado de encerramento do app por falta de memória"**.

Agora olhe o `output_schema` do único conceito disponível: `login` e `installations`, e dentro de
`installations` há estado, versão, push, GPS, último acesso e aparelho. **Não há, em campo nenhum,
histórico de encerramento por memória.** E não pode haver: o IFS não responde isso nesse endpoint.

Então o modelo fez a coisa certa. Ele foi instruído a responder `inconclusive` sempre que a
evidência não sustentar nem confirmação nem refutação — e ela não sustenta. **Essa hipótese, como
está escrita, não pode ser decidida por nenhuma execução, para nenhum técnico, nunca.**

**A lição:** um critério só é escrevível contra os fatos que os conceitos do caso realmente
carregam. Escrever critério antes de olhar o `output_schema` produz uma hipótese eternamente
inconclusiva — e, pior, que *parece* estar funcionando.

Há um segundo problema menor na mesma hipótese: ela nomeia aparelhos por nome comercial
("Galaxy A16") e o IFS responde código de modelo (`samsung SM-A166`). Mesmo resolvendo o defeito
principal, o critério precisaria falar a língua do dado.

### Defeito 2 — o laudo chama de "falha" o que não foi falha

A resposta do modelo à hipótese 1 foi `{"verdict":"inconclusive"}` — **exatamente uma das três
formas permitidas**, em 15 tokens, sem erro nenhum. O sistema registrou isso como:

```
verdict : inconclusive
reason  : judgment-failure
```

E o consolidador, recebendo `judgment-failure` como dado, escreveu no laudo:

> *"Não foi possível chegar a um veredito sobre esta hipótese devido a uma falha no processo de
> julgamento."*

**Não houve falha.** O motivo é que o vocabulário de razões de inconclusão tem só três membros —
`no-data` (não veio dado), `judgment-failure` (deu errado) e `deadline-exceeded` (estourou o
prazo) — e **nenhum** deles significa "o juiz olhou o dado e concluiu que não dá para decidir".
Uma abstenção fundamentada cai em `judgment-failure` por falta de palavra melhor. O próprio código
diz isso em comentário, sem rodeio.

**A lição:** um vocabulário fechado é uma decisão sobre o que o sistema *pode dizer*. Quando falta
um membro, o sistema não fica calado — ele diz a coisa errada. E aqui o custo vaza para fora: quem
ler o laudo vai procurar um defeito técnico inexistente, e não vai olhar o Defeito 1, que é o real.

---

## Parte 8 — Glossário

| termo | em uma frase |
|---|---|
| **caso** (*case*) | a ficha de troubleshooting: hipóteses em ordem, e o que fazer com cada uma |
| **versão do caso** | uma edição da ficha; `draft` é editável, `released` é imutável para sempre |
| **hipótese** | um palpite de causa, com um critério verificável |
| **revisão** | o texto de uma hipótese, numerado; nunca alterado depois de manifestado |
| **manifesto** | o índice de uma versão: qual revisão de qual hipótese, em que posição |
| **posição** | a ordem de precedência; a primeira confirmada decide o caso |
| **critério** | a frase que diz quando a hipótese bate; prosa, não código |
| **resolução** | o trio desfecho + providência + destinatário de uma hipótese |
| **fallback** | a resolução usada quando nenhuma hipótese confirma |
| **conceito** (*concept*) | o nome de um fato que se pode ir buscar |
| **ttl** | por quantos segundos uma observação desse fato continua valendo |
| **capacidade** (*capability*) | quem sabe responder um conceito, e em que formato |
| **`output_schema`** | os campos que a capacidade promete; **a lista branca do julgamento** |
| **conector** (*connector*) | como chamar: endereço, método, tradutor de resposta e de status |
| **placeholder** | `${subject:x}`, `${requester}`, `${credential:X}` — buracos preenchidos na hora |
| **sujeito** (*subject*) | a coisa investigada: um tipo mais seus pares atributo-valor |
| **evidência** | o resultado de uma tentativa de observar um conceito |
| **final de evidência** | `ok`, `unavailable`, `denied` ou `timeout`; só `ok` traz dado |
| **veredicto** | `confirmed`, `refuted` ou `inconclusive` |
| **citação** | de qual conceito e campo saiu o veredicto; checada por máquina |
| **investigação** | o registro imutável de uma execução inteira |
| **vocabulário** | uma lista fechada de palavras permitidas; fora dela, o caso é recusado |

---

*Lido do banco de produção em 2026-08-21. O trace completo de uma execução, com os prompts e as
respostas verbatim, está em [`debug-01/`](debug-01/).*
