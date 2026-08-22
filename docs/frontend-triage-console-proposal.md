# Proposta de Frontend — Case Management Admin Console

Documento autocontido: reúne a proposta de UX discutida em sessão, o conteúdo que existia apenas no
artefato interativo ("Triage Console"), e a tradução prática de tudo isso para o ciclo real do Siegard
Framework — agora que o framework tem `reference`/`intake/layout/` e a tabela de quatro rotas.

## 0. Enquadramento do produto

O backend não é um sistema end-user: é o motor de um **assistente de diagnóstico configurável**.
Alguém (curador/engenheiro de conhecimento) autora **casos** — árvores de hipóteses que, dado um
"subject" com atributos, chegam a uma **resolution** (outcome + referral). `POST /v1/diagnose` é o
único endpoint que *usa* um caso já publicado; as outras 17 rotas administram conteúdo.

Isso define o produto: um **console de curadoria**, não um app de atendimento. Persona única por ora —
o curador — sem autenticação (confirmado no backend: nenhuma rota tem auth). Decisão de UX forçada por
isso: **o frontend precisa comunicar visualmente "quem mexeu por último" e "isto pode ter sido alterado
por outra pessoa"**, porque o servidor não protege ninguém disso.

## 1. Arquitetura da informação

```
┌─ Cases (lista)
│   └─ Case detail
│        ├─ Versions (timeline: draft | released)
│        │    └─ Version editor (se draft)
│        │         ├─ Atributos do caso (title, when_to_use, subject, fallback, register)
│        │         └─ Manifest (hipóteses ordenadas por position)
│        │              └─ Hypothesis revision (criterion, collects, resolution)
│        └─ Hypotheses (aba do Case Detail — identidade + histórico de revisões do caso;
│             ver 2.10 -- decisão de forma: não é item de topo, hypothesis pertence a um só case)
├─ Glossary
│   ├─ Concepts (name, accepts[], ttl)
│   └─ Vocabulary terms (5 abas: subject-type, subject-attribute, outcome, action, recipient)
└─ Capabilities (registro read-only: name, version, nature, connector, concept, schemas)
```

Duas árvores paralelas: **Cases** (o que muda) e **Glossary/Capabilities** (o vocabulário fixo que os
cases consomem). Todo formulário de caso puxa suas opções dessas duas — não digita à mão.

O casco visual é o mesmo em toda tela: uma barra lateral fixa com as quatro seções acima, uma barra
superior com breadcrumb e o indicador "sem login", e a área de conteúdo. Só a área de conteúdo muda de
tela para tela.

```
┌────────────────┬──────────────────────────────────────────────────────────────┐
│ Triage Console │  Cases                              [No auth in this build]  │
│                │──────────────────────────────────────────────────────────────│
│ ▸ Cases   (12) │                                                              │
│   Glossary     │                     ← área de conteúdo muda aqui →           │
│   Capabilities │                                                              │
│                │                                                              │
│ No sign-in     │                                                              │
│ required.      │                                                              │
└────────────────┴──────────────────────────────────────────────────────────────┘
```

## 2. Telas

Cada tela abaixo traz: o wireframe ASCII da área de conteúdo, a leitura em prosa do porquê daquela
disposição, e o contrato de comportamento (gatilho → pré-condição → ação → sucesso → falha) que trava
ambiguidade antes de virar código.

### 2.1 Cases List

```
Cases                                              [ Search / filter ]
Every diagnostic case this console has ever originated a draft for.
────────────────────────────────────────────────────────────────────
Case                             State              Versions  Updated
intermittent-connection-outage   ● Draft · v2        2         12m ago
billing-dispute-duplicate-charge ● Released · v3      3         6d ago
device-activation-failure        ● Released · v1      1         19d ago
sim-not-provisioned              ● Draft · v1         1         1h ago
```

Tabela, não cards: o curador está escaneando um número de casos que só cresce, e uma tabela deixa
"estado" e "última atualização" comparáveis coluna a coluna — um cardápio de cards obrigaria a ler
célula por célula. O estado usa cor + palavra (nunca só cor), porque é a informação mais escaneada da
tela.

```
GATILHO: clique na linha de um caso
AÇÃO: navega para Case Detail (2.2) daquele slug
ESTADO VAZIO: nenhum caso ainda → "No cases yet — create the first one" + botão
```

### 2.2 Case Detail

```
Cases ▸ intermittent-connection-outage
Intermittent internet connection outage           [ Continue draft → ]
────────────────────────────────────────────────────────────────────
v2   ● Draft       opened 12 min ago               [ Continue editing ]
v1   ● Released    released 2024-01-01             [ View read-only ]

  A case keeps at most one open draft — that's why there's no
  "new draft" button while v2 is still open.
```

A ausência do botão "New draft" **é** o design, não uma omissão: o backend não faz pre-check de draft
já existente (`CaseAlreadyHasDraftError`, 409, sem verificação prévia), então a tela evita o convite ao
erro escondendo a ação que colidiria.

```
GATILHO: "Continue editing" / clicar em v2
PRÉ-CONDIÇÃO: nenhuma — a lista de versões já veio do GET, então já sabemos se há draft
AÇÃO: navega para Version Editor (2.3)
GATILHO alternativo: caso não haja draft nenhum, o botão vira "New draft"
AÇÃO: POST /v1/cases
FALHA 409 CaseAlreadyHasDraftError: outra pessoa abriu um draft entre o GET e o clique —
         toast + redireciona para o draft real (condição de corrida esperada, não é bug)
```

### 2.3 Version Editor

```
Cases ▸ intermittent-connection-outage ▸ v2 (draft)
Editing v2 ● Draft                    [ Discard draft ]  [ Release… ]
────────────────────────────────────────────────────────────────────
 Title
 [ Intermittent internet connection outage                        ]
 When to use
 [ When an attendant needs to troubleshoot a customer contract     ]
 [ reporting an intermittent or unstable internet connection.      ]
 Subject type (fixed)      Consolidation register
 [ contract              ] [ formal                             ▾ ]
 Fallback outcome                    Fallback referral
 [ inconclusive-…-exhausted ▾]      [ escalate-to-specialist → … ▾]
────────────────────────────────────────────────────────────────────
 Last saved 2 min ago · manifest holds 2 hypotheses [open →]
                                                [ Save changes ]
```

Formulário de campo único porque o `PATCH` do backend é **full replace**, nunca patch parcial — a UI
nunca deve enviar um campo isolado; sempre reenvia o objeto inteiro carregado + editado. "Subject type"
aparece desabilitado porque hoje só existe um vocabulário registrado (`contract`) — mostrar um dropdown
de uma opção só seria ruído; um campo fixo com um rótulo "(fixed)" já ensina a regra.

```
GATILHO: form, on blur ou botão "Save"
AÇÃO: PATCH /v1/cases/{slug}/versions/{version}
SUCESSO (200): re-hidrata o form com o read-back, marca "saved at HH:mm"
FALHA 409 CaseVersionNotDraftError: alguém liberou a versão enquanto você editava —
         bloqueia o form, banner "This version was released by someone else.
         Your changes were not saved.", oferece "start a new draft"
FALHA 404 CaseNotFoundError: caso removido — redireciona para Cases List
```

Banner de conflito (evento `ui.stale_conflict_detected`, o mais importante do catálogo — seção 3):

```
┌──────────────────────────────────────────────────────────┐
│ ! This version was released by someone else                │
│   Your changes were not saved. Reload to see the current    │
│   state, or start a new draft.              [ Dismiss ]     │
└──────────────────────────────────────────────────────────┘
```

### 2.4 Manifest Builder

```
Cases ▸ intermittent-connection-outage ▸ v2 ▸ Manifest
Manifest — v2                                  [ + Add hypothesis ]
────────────────────────────────────────────────────────────────────
[▲][▼] 1  customer-equipment-fault · rev 1               [ Remove ]
        The customer's registered equipment reports a fault status.
        collects: equipment-status → issue-equipment-fault

[▲][▼] 2  area-network-outage · rev 1                    [ Remove ]
        An active network outage is registered for the service area.
        collects: network-outage-flag → issue-area-outage

  Move with ▲/▼. Landing on a free position always succeeds;
  only a position another hypothesis already holds is refused.
  Removing the last entry is blocked here before it reaches the
  server.
```

**Decisão de forma tomada nesta rodada**: botões `▲`/`▼` por linha, não drag-and-drop (a versão
original desta proposta usava um handle `⠿` de arraste) — acessível por teclado e leitor de tela sem
depender de uma lib de drag-and-drop. O botão "Remove" por linha, não um menu de contexto: são as
únicas ações desta tela e todas precisam de affordance visível sem clique extra. O aviso abaixo da
lista existe porque a regra de negócio ("mover é diferente de colidir") é contra-intuitiva o
suficiente para merecer uma frase — sem isso, o primeiro curador que mover uma hipótese para uma
posição livre vai esperar um erro que nunca vem.

```
GATILHO: ▲/▼, ou "Remove"
PRÉ-CONDIÇÃO (▲/▼): desabilitado no topo da lista para ▲ e no fim da lista para ▼ (não há posição
              anterior/seguinte pra mover)
PRÉ-CONDIÇÃO (remove): se o manifest tem 1 entrada, o botão fica desabilitado com tooltip
              "A case must keep at least one hypothesis"
PRÉ-CONDIÇÃO (place): mover a MESMA hipótese para outra posição é permitido (é um "move");
              só posições ocupadas por hipótese DIFERENTE bloqueiam
AÇÃO: PUT/DELETE .../manifest/{hypothesis_name}
FALHA 409 ManifestPositionOccupiedError: reverte o movimento, mensagem inline na linha
FALHA 422 ManifestWouldHoldNoHypothesisError: não deveria ocorrer se o botão foi
         desabilitado corretamente — se ocorrer, força reload do manifest
```

### 2.5 Nova hipótese (Revise)

```
Cases ▸ ... ▸ Revise hypothesis
New hypothesis
────────────────────────────────────────────────────────────────────
 Hypothesis name              Subject type (from draft, fixed)
 [ router-firmware-outdated ] [ contract                        ]

 Criterion
 [ The business condition an attendant checks for…                ]

 Collects (only concepts accepting "contract" are offered)
 ( ✓ equipment-status )  (   network-outage-flag   )

 Resolution outcome           Referral
 [ issue-equipment-fault  ▾]  [ schedule-technician-visit → … ▾]
────────────────────────────────────────────────────────────────────
 Both concepts shown accept "contract" — nothing here would be
 refused server-side.                        [ Save hypothesis ]
```

Os chips de "collects" já vêm filtrados pelo subject-type do draft (pré-checagem client-side contra o
glossário carregado) — reduz round-trips ao servidor, mas o servidor continua sendo a autoridade final;
o texto de rodapé é uma confirmação, nunca uma promessa.

```
GATILHO: form "New hypothesis" ou "Revise" dentro do Manifest Builder
AÇÃO: POST /v1/cases/{slug}/hypotheses
SUCESSO: nova revisão aparece na lista de revisions da hipótese; oferece "place in manifest"
FALHA HypothesisRevisionCollectsNoConceptError / ConceptNotInGlossaryError /
      ConceptRefusesSubjectTypeError: form destaca CADA concept ofensivo citado no erro
      (o backend agrupa múltiplas violações — a UI espelha isso)
```

### 2.6 Release — modal de confirmação

```
        ┌ Release v2? ──────────────────────────────────┐
        │ Once released, this version and every manifest │
        │ entry it holds are frozen — permanently.        │
        │                                                  │
        │ ✓ Manifest holds at least one hypothesis (2)     │
        │ ✓ Fallback resolution is set                     │
        │ ✓ Every collected concept accepts the case        │
        │   subject                                         │
        │                                                    │
        │                    [ Cancel ]      [ Release ]     │
        └────────────────────────────────────────────────────┘
```

Variante quando o `422 CaseVersionNotReleasableError` agrega múltiplas violações — a UI **precisa**
mostrar todas juntas, porque o backend já as agrega; mostrar uma de cada vez forçaria o curador a
tentar de novo repetidamente para descobrir a próxima:

```
        │ ✓ Manifest holds at least one hypothesis (2)      │
        │ ! Fallback resolution is set                       │
        │ ! area-network-outage: network-outage-flag no      │
        │   longer accepts "contract"                        │
```

```
GATILHO: botão "Release…" no Version Editor
AÇÃO: POST .../release
SUCESSO (200): estado muda para "released", form vira somente-leitura
FALHA 422 CaseVersionNotReleasableError: lista TODAS as violações juntas (acima)
FALHA 409 CaseVersionNotDraftAtReleaseError: já foi liberado por outra sessão — recarrega
```

### 2.7 Discard — modal destrutivo

```
        ┌ Discard this draft? ──────────────────────────┐
        │ customer-equipment-fault and area-network-      │
        │ outage keep their content — only this draft      │
        │ and its manifest are removed. This cannot be      │
        │ undone.                                            │
        │                                                     │
        │ Type the case slug to confirm                       │
        │ [ intermittent-connection-outage                 ]  │
        │                                                      │
        │           [ Keep draft ]      [ Discard draft ]      │
        └──────────────────────────────────────────────────────┘
```

Confirmação por digitação do slug, não só um checkbox: é a única ação irreversível que apaga (as
outras — release — só congelam). O texto explica explicitamente que as hypothesis-revisions
sobrevivem, porque é contra-intuitivo e vale ensinar na primeira vez.

### 2.8 Glossary Browser

```
Glossary ▸ Concepts | Subject types | Subject attributes | Outcomes | Actions | Recipients
────────────────────────────────────────────────────────────────────
Concept                    Accepts     TTL
equipment-status           contract    300s
network-outage-flag        contract    60s
```

Somente leitura, abas simples — não há ação de escrita nesta versão porque o glossário é vocabulário
fixo consumido pelos cases, não editado por este console.

### 2.9 Capabilities Browser

```
Capabilities
────────────────────────────────────────────────────────────────────
Capability                  Nature      Connector                    Concept          Timeout
equipment-status-reader     read-only   corporate-records-equip-…    equipment-status  5000ms
network-outage-flag-reader  read-only   corporate-records-netw-…    network-outage-…  5000ms

┌ equipment-status-reader — schemas ────────────────────────────────┐
│ Input schema:  contract-identifier-input                           │
│ Output schema: {"type":"object","properties":{"status":"string"}}  │
└──────────────────────────────────────────────────────────────────────┘
```

Clique na linha troca o painel de detalhe abaixo — evita abrir um modal para algo que é só leitura de
referência.

### 2.10 Hypotheses — histórico por caso

**Nota de forma, decidida agora**: a seção 1 desenhou "Hypotheses" como item solto na sidebar
global, mas `hypothesis` pertence a exatamente um `case` (`cardinality: "1"` no domínio) — não existe
"todas as hipóteses de todos os casos" como conceito. Esta tela fica dentro do Case Detail, como uma
segunda aba ao lado de "Versions", nunca na sidebar de topo. É decisão de forma (onde a tela mora),
não de fato — o contrato `contracts/knowledge/case-query` já declara `list-hypotheses` e
`list-hypothesis-revisions` como leituras escopadas a um caso e a uma hipótese, respectivamente.

```
Cases ▸ intermittent-connection-outage ▸ Hypotheses
[ Versions ]  [ Hypotheses ]
────────────────────────────────────────────────────────────────────
Hypothesis                    Revisions   Referenced by
customer-equipment-fault      2           v2 (draft) → rev 2
area-network-outage           1           v1 (released) → rev 1 · v2 (draft) → rev 1
router-firmware-outdated      1           — (not placed in any manifest)
```

Tabela, mesmo raciocínio de 2.1: o curador está comparando quantas revisões cada hipótese acumulou e
qual versão ainda depende de qual — "Referenced by" existe porque uma revisão nunca é alterada depois
de liberada (`a-released-hypothesis-revision-is-never-altered`); a única forma de mudar conteúdo é uma
revisão nova, então saber quem ainda lê a antiga é a pergunta que este índice responde.

```
GATILHO: clique numa linha
AÇÃO: expande (ou navega, se a lista crescer) para o histórico de revisões daquela hipótese:
```

```
Cases ▸ intermittent-connection-outage ▸ Hypotheses ▸ customer-equipment-fault
customer-equipment-fault — 2 revisions
────────────────────────────────────────────────────────────────────
rev 2  ● current                                     referenced by v2 (draft)
       The customer's registered equipment reports a fault status,
       confirmed twice within 5 minutes.
       collects: equipment-status → issue-equipment-fault

rev 1  frozen (a released version reads this)         referenced by v1 (released)
       The customer's registered equipment reports a fault status.
       collects: equipment-status → issue-equipment-fault
                                                           [ Revise → ]
```

Cada revisão é um bloco fechado, nunca editável em linha — o texto "frozen" na rev 1 é a mesma lógica
do "(fixed)" em 2.3: em vez de deixar o curador tentar editar e descobrir o refuse depois, a tela já
mostra que aquele bloco é somente-leitura. "Revise" só aparece na revisão mais recente e abre o
formulário de 2.5 pré-carregado com o conteúdo atual como ponto de partida.

```
GATILHO: "Revise →" na revisão mais recente
AÇÃO: abre 2.5 (Nova hipótese / Revise) pré-carregado com criterion/collects/resolution
      da revisão mostrada, sujeito à mesma pré-condição de 2.5: só contra o draft do caso
ESTADO VAZIO: hipótese sem nenhuma revisão é impossível pelo domínio (toda hipótese nasce com
      rev 1) — não há estado vazio a desenhar aqui
```

## 3. Catálogo de eventos (telemetria/auditoria)

| Evento | Payload | Disparado quando |
|---|---|---|
| `case_draft.created` | `{slug, version, source_version?}` | POST /cases sucesso |
| `case_draft.updated` | `{slug, version}` | PATCH sucesso |
| `case_draft.discarded` | `{slug, version}` | DELETE version sucesso |
| `case.released` | `{slug, version}` | POST release sucesso |
| `manifest.hypothesis_placed` | `{slug, version, hypothesis_name, position, moved: bool}` | PUT manifest sucesso |
| `manifest.hypothesis_removed` | `{slug, version, hypothesis_name}` | DELETE manifest sucesso |
| `hypothesis.revised` | `{slug, hypothesis_name, revision, is_new_identity: bool}` | POST hypotheses sucesso |
| `ui.stale_conflict_detected` | `{slug, version, action}` | qualquer 409 de estado inesperado — mede quão frequente é a colisão entre curadores sem lock nenhum; é o argumento de dados para priorizar concorrência otimista numa iteração futura |

## 4. Máquinas de estado

**Case Version (domínio, fixo pelo backend):** `draft → released` (terminal), um só gatilho.

**Formulário de edição (UI):** `clean → dirty → saving → clean | conflict`. Este segundo precisa de
spec própria porque o backend não ajuda em nada aqui (sem optimistic concurrency) — a UI é a única
linha de defesa contra dois curadores editando o mesmo draft.

## 5. Riscos herdados do backend

1. **Sem auth** — qualquer pessoa com a URL faz qualquer operação.
2. **Sem controle de concorrência** — mitigado só pelo padrão pessimista + `ui.stale_conflict_detected`.
3. **Erros não mapeados caem em 500** (`CaseHoldsNoDraftError`, `ConceptNotInGlossaryError`,
   `ConceptRefusesSubjectTypeError`, `CaseNotValidError`) — mensagem genérica até o backend mapear.
4. **`diagnose` fica fora deste console** — chamado por outro sistema; um painel "Try it" (rodar um
   `subject` de teste contra uma versão released) é sugestão de valor, não requisito.

## 6. Como isto entra no Siegard hoje

O framework mudou desde a primeira versão desta proposta: agora existe `reference`/`intake/layout/` (o
que uma task deve *parecer*, lido só pela entrega) e uma tabela de quatro rotas que decide, por
mudança, qual caminho ela percorre. Esta seção aplica as duas coisas a este documento especificamente.

### 6.1 Qual rota cada parte deste documento percorre

| Parte deste documento | Rota | Por quê |
|---|---|---|
| Telas 2.1–2.10, seus formulários e ações | **capability's surface** → `/plan-work` → `/implement-task` → `/review-change` | Cada tela expõe uma capacidade que a especificação já sustenta (case, hypothesis, hypothesis-revision, manifest, glossário, capability já são nodes de domínio; `list-hypotheses`/`list-hypothesis-revisions` já são operações do contrato `case-query`) — não é fato novo, é superfície nova sobre fato existente. |
| Textos de erro/aviso citados nas seções 2.3, 2.6, 2.7 (banner de conflito, checklist de release, aviso de discard) | **nenhuma** — já cobertos | Checamos linha a linha: nenhum inventa fato que a especificação não sustente. Todos reapresentam regras já existentes (`ManifestWouldHoldNoHypothesisError`, a preservação das hypothesis-revisions no discard). Se algum precisasse de uma wording que a especificação não sustenta, essa frase específica — nunca o documento inteiro — entraria por `/analyse`. |
| Paleta, tipografia, ícones, espaçamento (não fixados neste documento — ver o artefato "Triage Console" publicado em sessão) | **the surface alone** → editado direto num target `edits_freely`, uma vez declarado | Cor e espaçamento não alteram o que alguém aprende ou faz no sistema — o critério exato que a tabela de rotas usa para separar "surface" do resto. |
| A ordem/arraste do manifest, o comportamento de "mover vs. colidir", os estados de loading/erro/vazio | **capability's surface**, junto com as telas | Altera o que a pessoa pode aprender/fazer (ex.: reordenar é uma ação nova) — não é surface por definição, mesmo sendo "só" interação. |

### 6.2 `intake/layout/` e `reference` — usando este documento como entrada real

Este documento (ou os wireframes ASCII de cada tela, extraídos como arquivos individuais) é exatamente
o que `reference` foi desenhado para carregar: *"names what a task is written to look like... a
reference decides form, never fact."* Prática recomendada:

1. Salvar cada wireframe (seção 2.1–2.9) como um arquivo próprio sob `intake/layout/`, ex.:
   `intake/layout/cases-list.md`, `intake/layout/version-editor.md`, `intake/layout/manifest-builder.md`.
2. Ao cortar as tasks em `/plan-work`, cada task de tela nomeia seu arquivo de layout via `reference` —
   isso é o que leva o wireframe até o único passo que escreve código (`/implement-task`), sem que ele
   passe pela survey, pela decomposição ou pela binding como se fosse fato.
3. **O validador nunca abre esses arquivos** — exatamente como `sources`. Se um wireframe descrever um
   texto que a especificação não sustenta, isso não é pego automaticamente; é a mesma vigilância que já
   fizemos manualmente na tabela 6.1, e deve ser repetida sempre que um layout novo entrar.
4. O artefato HTML interativo publicado em sessão ("Triage Console") pode acompanhar como material de
   apoio adicional, mas os arquivos sob `intake/layout/` — texto e ASCII, como este documento já traz —
   são a forma que o framework realmente lê.

### 6.3 Declarações pendentes em `siegard.json`

- `targets.frontend` ainda não existe — precisa ser declarado via `/siegard-config` antes de qualquer
  task de frontend poder ser cortada.
- `standard` para o alvo frontend — hoje só há exemplos (`standards/frontend-typescript.yaml` +
  `frontend-design-tokens.example.css`), não adotados. Precisam virar o registro real do projeto (ou
  serem substituídos) antes de `/implement-task` ter algo a instalar/rodar.
- `edits_freely` — vale já declarar `frontend` aqui desde o início, para que ajustes de cor/rótulo/
  espaçamento depois do primeiro release não precisem reabrir o ciclo completo de planejamento a cada
  vez — é exatamente o caso de uso que este campo existe para cobrir.

### 6.4 Passo a passo de entrega

1. `/siegard-config` — declarar `targets.frontend`, adotar o standard, declarar `edits_freely` para o
   alvo.
2. Extrair os wireframes das seções 2.1–2.9 para arquivos individuais sob `intake/layout/`.
3. `/plan-work` — escopo em prosa citando as telas e comportamentos deste documento; cada task de tela
   nomeia seu `reference` em `intake/layout/`.
4. `/implement-task`, uma task por vez, cada uma lendo seu layout, a especificação e o inventário.
5. `/review-change` sobre cada entrega — as quatro passagens de sempre, mais o que a suíte do standard
   frontend rodar (typecheck, lint, style, secret-scan, testes).
6. Depois do primeiro release: ajustes de cor/rótulo/espaçamento isolados vão direto pela rota
   `edits_freely` (6.1), sem reabrir plano — apenas mudanças que alterem o que alguém aprende ou faz
   voltam para `/plan-work`.

## 7. Perguntas em aberto

1. ~~Vale o painel "Try it" (sandbox de diagnose) nesta v1, ou fica para depois?~~ **Decidido**: fica
   para depois. Nenhuma onda deste plano inclui.
2. ~~Reordenação do manifest: drag-and-drop ou lista com botões up/down?~~ **Decidido**: botões
   up/down — acessível sem mouse, sem dependência de lib de drag-and-drop. O wireframe de 2.4 usa
   `⠿` como ilustração; a implementação real usa `[ ▲ ]`/`[ ▼ ]` por linha.
3. Nomenclatura do produto para o curador final — "Cases", "Hypotheses" são termos de domínio; mantém
   ou traduz para linguagem de negócio na UI? **Não bloqueia o planejamento**: rótulo de tela é
   superfície (tabela de rotas, 6.1) — as ondas usam os termos de domínio como estão na especificação,
   ajustável depois por `edits_freely` sem reabrir o plano.
4. Quem escreve os arquivos de `intake/layout/` — este documento é convertido 1:1, ou alguém edita os
   wireframes antes de congelá-los como "fotografia do que foi decidido"? **Decidido**: a extração é
   1:1 a partir deste documento como ele está agora (incluindo 2.10, adicionado nesta rodada).
5. ~~A tela "Hypotheses" citada na seção 1 nunca foi desenhada~~ **Resolvido**: desenhada em 2.10,
   como aba do Case Detail em vez de item de topo (decisão de forma, não de fato).
