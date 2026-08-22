# Onda 4 — Manifest Builder + Revise/Nova hipótese + aba Hypotheses

Escopo cortado a partir do plano aprovado (`.claude/plans/precious-skipping-summit.md`, seção
"Onda 4 — Manifest Builder + Revise Hypothesis + aba Hypotheses"), citado abaixo verbatim, mais as
seções 2.4/2.5/2.10 do `docs/frontend-triage-console-proposal.md` (citadas na íntegra), mais os
fatos reais do backend confirmados agora (não assumidos do wireframe).

## Do plano aprovado

- **2.4 Manifest Builder**: reordenar com `▲`/`▼` (decidido nesta sessão), remover, a regra
  "mover é diferente de colidir", botão de remover desabilitado com tooltip quando resta 1 entrada.
- **2.5 Revise/Nova hipótese**: formulário com filtragem client-side de concepts por subject-type
  (pré-checagem, nunca autoridade final), erro que destaca cada concept ofensivo.
- **2.10 Hypotheses** (desenhada nesta sessão): aba do Case Detail, histórico de revisões por
  hipótese, botão "Revise" que abre 2.5 pré-carregado.

As três seguem juntas porque compartilham o mesmo estado (o manifest de um draft) e a mesma ação de
saída (abrir 2.5) — cortá-las em ondas separadas obrigaria a Onda 4a a prever uma integração que só
a 4b escreve.

Depende da Onda 3 (Version Editor é onde o link "manifest holds N hypotheses [open →]" vive, e o
Version Editor é o formulário que já existe para editar o resto de uma versão).

## Wireframes (docs/frontend-triage-console-proposal.md)

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

Decisão de forma já tomada (sessão de planejamento do documento original): botões `▲`/`▼` por
linha, não drag-and-drop — acessível por teclado e leitor de tela sem depender de lib de
arraste. O botão "Remove" por linha, não menu de contexto. O aviso abaixo da lista existe porque
"mover é diferente de colidir" é contra-intuitivo o suficiente pra merecer uma frase.

```
GATILHO: ▲/▼, ou "Remove"
PRÉ-CONDIÇÃO (▲/▼): desabilitado no topo da lista para ▲ e no fim da lista para ▼
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

Os chips de "collects" já vêm filtrados pelo subject-type do draft (pré-checagem client-side contra
o glossário carregado) — reduz round-trips ao servidor, mas o servidor continua sendo a autoridade
final; o texto de rodapé é uma confirmação, nunca uma promessa.

```
GATILHO: form "New hypothesis" ou "Revise" dentro do Manifest Builder
AÇÃO: POST /v1/cases/{slug}/hypotheses
SUCESSO: nova revisão aparece na lista de revisions da hipótese; oferece "place in manifest"
FALHA HypothesisRevisionCollectsNoConceptError / ConceptNotInGlossaryError /
      ConceptRefusesSubjectTypeError: form destaca CADA concept ofensivo citado no erro
      (o backend agrupa múltiplas violações — a UI espelha isso)
```

**Este trecho do wireframe está desatualizado contra o backend real — ver "Achado real do
backend" abaixo, que substitui esta última linha.**

### 2.10 Hypotheses — histórico por caso

**Nota de forma**: `hypothesis` pertence a exatamente um `case` (`cardinality: "1"` no domínio) —
não existe "todas as hipóteses de todos os casos". Esta tela fica dentro do Case Detail, como
segunda aba ao lado de "Versions", nunca na sidebar de topo. `contracts/knowledge/case-query` já
declara `list-hypotheses` e `list-hypothesis-revisions` como leituras escopadas.

```
Cases ▸ intermittent-connection-outage ▸ Hypotheses
[ Versions ]  [ Hypotheses ]
────────────────────────────────────────────────────────────────────
Hypothesis                    Revisions   Referenced by
customer-equipment-fault      2           v2 (draft) → rev 2
area-network-outage           1           v1 (released) → rev 1 · v2 (draft) → rev 1
router-firmware-outdated      1           — (not placed in any manifest)
```

```
GATILHO: clique numa linha
AÇÃO: expande (ou navega) para o histórico de revisões daquela hipótese:
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

Cada revisão é um bloco fechado, nunca editável em linha. "Revise" só aparece na revisão mais
recente e abre o formulário de 2.5 pré-carregado com o conteúdo atual como ponto de partida.

```
GATILHO: "Revise →" na revisão mais recente
AÇÃO: abre 2.5 (Nova hipótese / Revise) pré-carregado com criterion/collects/resolution
      da revisão mostrada, sujeito à mesma pré-condição de 2.5: só contra o draft do caso
ESTADO VAZIO: hipótese sem nenhuma revisão é impossível pelo domínio (toda hipótese nasce com
      rev 1) — não há estado vazio a desenhar aqui
```

**"Referenced by" está fora do alcance real do backend hoje** — ver "Achado real do backend"
abaixo.

## Achado real do backend (confirmado agora, substitui o que o wireframe assumia)

Verificado lendo o código real, não a proposta:

1. **`PUT/DELETE .../manifest/{hypothesis_name}` batem exatamente o wireframe.** `PUT` recebe
   `{ revision, position }`, responde `204` vazio; erros reais: 404 `CaseNotFoundError`, 409
   `CaseVersionNotDraftError`, 409 `ManifestPositionOccupiedError` (contexto `{slug, version,
   position}`). `DELETE` responde `204` vazio; erros reais: 404, 409 `CaseVersionNotDraftError`,
   422 `ManifestWouldHoldNoHypothesisError` (contexto `{slug, version}`). Nada a ajustar aqui.

2. **`POST /v1/cases/{slug}/hypotheses` (revise-hypothesis) tem um corpo diferente do wireframe.**
   O corpo real exige `{ hypothesis_name, criterion, collects, resolution, subject }` — inclui
   `subject` explicitamente (o wireframe não desenha esse campo sendo enviado, só mostrado como
   "from draft, fixed"). Resposta real: `201` com `{ hypothesis_name, revision }` — não ecoa o
   conteúdo salvo.

3. **As quatro falhas de domínio deste POST não estão mapeadas em `status-map.ts` — todas caem em
   500 `INTERNAL_ERROR` genérico, com o `context` tipado descartado pelo `error-handler.middleware.ts`
   antes de chegar ao cliente.** Isso vale para `CaseHoldsNoDraftError`,
   `HypothesisRevisionCollectsNoConceptError`, `ConceptNotInGlossaryError` e
   `ConceptRefusesSubjectTypeError` — as quatro, sem exceção; nenhuma delas aparece em
   `status-map.ts`. O envelope que o cliente de fato recebe é `{ error: { code: "INTERNAL_ERROR",
   message: "an unexpected error occurred" } }` para qualquer uma das quatro, indistinguível de um
   bug real do servidor.
   Isso confirma e aprofunda o risco #3 que a proposta original já registrava ("Erros não mapeados
   caem em 500... mensagem genérica até o backend mapear") — a proposta já citava três desses
   quatro nomes como candidatos ao risco; a leitura direta do código confirma que são exatamente
   esses quatro, sem exceção, e sem nenhum caminho de erro tipado sobrevivendo até o cliente.

   **Decisão herdada da proposta, aplicada aqui**: o formulário de Nova hipótese/Revise mostra uma
   mensagem genérica de falha para qualquer erro deste POST, em vez do destaque por-concept que o
   wireframe descreve — a proposta original já previa essa mitigação para erros não mapeados (seção
   5, risco #3), e o "destaca CADA concept ofensivo" da seção 2.5 não é hoje construível: nenhum
   `code` ou `context` sobrevive até o cliente para diferenciar as quatro causas, muito menos
   nomear os concepts ofensivos. A pré-checagem client-side (só oferecer concepts que já aceitam o
   subject-type do draft, lida do glossário) permanece como está desenhada — ela é o que já reduz a
   chance real de bater nesse gap, não uma correção para ele.

4. **`GET /v1/cases/{slug}/hypotheses` responde só `{ name }` por item** (`PaginatedResponse<{name:
   string}>`) — nenhum contador de revisões, nenhuma referência a qual versão usa qual revisão.
   **`GET /v1/cases/{slug}/hypotheses/{name}/revisions` responde `{ revision, criterion, collects,
   resolution }` por item** — também sem qualquer referência de volta a uma case-version. **A
   coluna "Referenced by" do wireframe 2.10, e a contagem "Revisions" da mesma tabela, não têm
   endpoint que as sustente diretamente.**

   **Decisão necessária aqui, análoga à de `domain/knowledge/case-summary` na Onda 2**: contagem de
   revisões é derivável client-side (o tamanho do array que `list-hypothesis-revisions` retorna,
   contando a paginação real via `total`). "Referenced by", porém, exigiria cruzar TODAS as versões
   do case (via `GET /v1/cases/{slug}/versions/{version}` para cada versão, lendo o `manifest` de
   cada uma e comparando `hypothesis_revision.hypothesis.name`+`revision` contra a hipótese em
   questão) — N+1 leituras por hipótese listada, sem nenhum endpoint dedicado. Diferente do
   `case-summary` da Onda 2 (que também exigia leitura derivada, mas de um número pequeno e fixo de
   chamadas por linha), aqui o custo cresce com o número de versões do case inteiro, por hipótese
   listada na tabela — um custo real que a task de implementação vai encontrar e que precisa de uma
   decisão de especificação (se "referenced by" é mesmo um fato do domínio que a Onda 4 deve expor
   agora) ou de escopo (adiar a coluna).

5. **`GET /v1/glossary/concepts` não tem filtro por subject-type.** A pré-checagem client-side da
   seção 2.5 ("only concepts accepting X are offered") só é possível lendo a lista inteira de
   concepts (paginada) e filtrando no cliente pelo próprio campo `accepts` de cada concept —
   confirmado: não existe `?accepts=` nem endpoint reverso.

## Máquina de estado adicional (aba Manifest Builder)

Nenhuma nova — reaproveita a mesma disciplina de save-state que o Version Editor (Onda 3) já
estabeleceu: cada `PUT`/`DELETE`/`POST` é uma mutação isolada, sem "dirty" acumulado (a lista de
manifest não é um formulário com botão Save único — cada ação já dispara sua própria chamada).

## Fora desta onda, deliberadamente

- **Release e Discard** (Onda 5) — o Manifest Builder não implementa nenhum dos dois botões, mesmo
  que o wireframe do Version Editor os desenhe ao lado do link de manifest.
- **O painel "Try it"** (sandbox de diagnose) — fora de todo o plano, decidido quando a proposta
  original foi revisada.
- **Mapear os quatro erros 500 no backend** — isso é uma mudança no backend (`src/`), fora do
  target `frontend` desta iniciativa; a decisão tomada acima (mensagem genérica) é o que o frontend
  faz enquanto esse mapeamento não existe, não uma correção definitiva.
