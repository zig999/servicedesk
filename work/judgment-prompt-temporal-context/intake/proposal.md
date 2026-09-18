# Proposta: revisão do system prompt de julgamento de hipóteses

Arquivo alvo: `src/src/investigation/anthropic-hypothesis-evaluator.adapter.ts`
(`SYSTEM_PROMPT`, `buildUserPrompt`, `itemBlock`).

## O que está faltando, hoje

1. **A relação `<observation>` ↔ `<criterion>` não é dita explicitamente.**
   O prompt atual diz "ground every verdict in the `<judgment_input>` block", mas
   nunca afirma que `<observation>` é o dado concreto a ser confrontado contra o
   `<criterion>`, e que `<fields>`, `<concept_description>` e
   `<capability_payload_notes>` são só apoio para *ler* esse dado — nunca fatos em
   si. O modelo tem que inferir essa hierarquia por conta própria.

2. **Não há nenhuma referência temporal — nem "agora", nem "quando foi observado".**
   `Evidence` (o registro persistido, `src/src/investigation/evidence.ts:13-14`) já
   carrega `observed_at` (ISO 8601) e `ttl` (segundos) para cada evidência — e a UI
   já mostra isso na aba EVIDENCE. Mas `toEvidenceItems()`
   (`src/src/investigation/judgment-stage.ts:203-211`) descarta os dois campos ao
   montar o `EvidenceItem` que vai para o avaliador, e `itemBlock()`
   (`anthropic-hypothesis-evaluator.adapter.ts:163-172`) nunca os inclui no prompt.
   Resultado: qualquer critério que dependa de recência ("última sincronização
   recente", "dado desatualizado", checagem de TTL) é estruturalmente impossível de
   julgar corretamente hoje — o modelo não sabe nem quando a observação foi
   capturada, nem que data é "agora".

3. **Múltiplos `<item>` sem regra explícita de isolamento.**
   Quando há mais de um item em `<evidence>`, nada impede — na letra do prompt — que
   o modelo misture o valor de um campo de um item com o nome de campo de outro (a
   única salvaguarda de "never a field named on another item" está restrita à seção
   de citação, não à etapa de julgamento em si).

4. **Não é dito que `<observation>` é uma string JSON serializada.**
   O modelo até hoje lida bem com isso na prática, mas o prompt nunca afirma "isto é
   JSON, faça parse antes de avaliar" — fica implícito.

## Proposta de novo `SYSTEM_PROMPT`

```
You judge whether the criterion of one troubleshooting hypothesis is confirmed or refuted, using only the evidence given to you.

Ground every verdict in the <judgment_input> block of the user message. The absence of evidence that would ground a verdict is itself a reason to answer inconclusively — never an invitation to infer, assume, or draw on anything beyond the <criterion>, <evidence>, <now>, <case_title> and <case_when_to_use> the block carries. Do not consult outside knowledge, and never let the case's title or when-to-use substitute for evidence.

Each <item> inside <evidence> is the data you validate the <criterion> against. Its <observation> is a JSON-encoded string — the actual payload a capability returned for this subject; parse it and read the criterion's conditions directly off its values. Everything else on the item exists only to help you read that JSON correctly, never as a fact to check the criterion against: <concept_description> names what the item's concept means wherever known (absent where none is known); <fields> lists, inside <fields>, the names — and wherever known, the type and meaning — of the keys <observation> may carry; <capability_payload_notes> carries free-text notes the capability declared about how to interpret its own payload's shape. None of these three is itself citable evidence, and none may substitute for a value that must come from <observation>.

<now> states the current date and time in UTC, at the moment this judgment is requested. Each item's own <observed_at> states when its <observation> was captured, in UTC, and <ttl_seconds> states how many seconds that observation was considered fresh for from that moment. Compare <now> against an item's <observed_at> and <ttl_seconds> whenever the <criterion> depends on recency, staleness, or elapsed time — never assume an observation is current otherwise. <now> and an item's <observed_at>/<ttl_seconds> are context for that reasoning, never themselves citable evidence.

When <evidence> carries more than one <item>, evaluate each independently: a field's value on one item never carries over to another item, even where two items declare a field of the same name.

Answer with exactly one JSON object and nothing else — no prose before or after it, no markdown code fence — matching exactly one of these three shapes:

{"verdict":"confirmed","citations":[{"concept":"<a concept named in <evidence>>","field":"<the name of one of that item's own <field> elements>"}]}
{"verdict":"refuted","citations":[{"concept":"<a concept named in <evidence>>","field":"<the name of one of that item's own <field> elements>"}]}
{"verdict":"inconclusive"}

A citation's field must be copied exactly from the name one of its own item's <field> elements declares — never invented, never the observation's own text, and never a field named on another item. Use "confirmed" or "refuted" only where the evidence's own content grounds that verdict, with at least one citation naming the evidence that grounds it. Use "inconclusive" whenever the evidence does not ground either, or whenever the item that would ground it declares no fields at all.
```

Mudanças em relação ao atual: adiciona `<now>` ao inventário de blocos citáveis no
primeiro parágrafo; substitui a frase solta sobre `<capability_payload_notes>` por
um parágrafo único que hierarquiza `<observation>` (dado) acima de
`<concept_description>`/`<fields>`/`<capability_payload_notes>` (leitura); acrescenta
o parágrafo de `<now>`/`<observed_at>`/`<ttl_seconds>`; acrescenta o parágrafo de
isolamento entre `<item>`s. O bloco de formato de resposta é mantido literal.

## Mudanças de dado necessárias (fora do texto do prompt)

Para o parágrafo de tempo fazer sentido, o `<judgment_input>` precisa passar a
carregar o que ele descreve:

1. **`buildUserPrompt`** (`anthropic-hypothesis-evaluator.adapter.ts:140-157`): incluir
   um elemento `<now>` de topo, ex.: `<now>2026-09-18T16:56:19.246Z</now>`, logo após
   `</criterion>` ou antes de `<evidence>`.
2. **`itemBlock`** (linhas 163-172): incluir `<observed_at>` e `<ttl_seconds>` por
   item, lidos de `EvidenceItem`.
3. **`EvidenceItem`** (`hypothesis-evaluator.port.ts`): hoje é
   `{ concept, fields, concept_description, capability_payload_notes } & ObservationOutcome`
   — não carrega `observed_at`/`ttl`. Precisa passar a carregá-los.
4. **`toEvidenceItems`** (`judgment-stage.ts:203-211`): hoje descarta
   `item.observed_at` e `item.ttl` ao montar o `EvidenceItem` — precisa parar de
   descartar.
5. **Origem do `<now>`**: não existe hoje nenhum port de relógio no código
   (`grep -rn "IClock\|SystemClock"` não retorna nada). Precisa de uma decisão: usar
   `Date.now()` direto dentro do adapter (simples, mas não testável
   deterministicamente), ou introduzir um port de relógio injetável (`IClock` com
   `nowIso()`) — no padrão hexagonal que o resto do código já segue (ports/adapters
   para toda dependência externa) — e injetá-lo no `AnthropicHypothesisEvaluator`.
   Recomendo a segunda opção, para o `test-author` poder fixar `now` nos testes de
   julgamento em vez de aceitar timestamps voadores.

## Fora de escopo desta proposta (mencionar, não decidir aqui)

- O `FakeHypothesisEvaluator` (usado em testes/fixtures) não constrói prompt e não
  precisa mudar.
- A UI da aba PROMPT (`case-simulation-detail-prompt-tab.tsx`) mostra hoje só
  `judgmentCall.prompt` — o `SYSTEM_PROMPT` nunca aparece lá. Ficou de fora desta
  proposta porque é uma pergunta separada (já registrada em conversa anterior); vale
  revisitar depois que o texto do system prompt estabilizar, para não fazer o
  usuário revisar um texto duas vezes.

## Rota

Isto é comportamento já entregue em produção (como o modelo julga hipóteses) — pelo
critério do CLAUDE.md do projeto (rota Siegard), uma correção de comportamento em
código já entregue é o incremento corretivo do `/plan-work`, seguido de
`/implement-task`, não uma edição direta. Ficando à disposição para abrir esse
incremento se a proposta acima for aprovada como está, ou com os ajustes que você
apontar.
