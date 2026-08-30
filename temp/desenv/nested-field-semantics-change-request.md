# Change Request: semântica de campo alcança só o topo do `output_schema`

> **Status: change request — NADA implementado.** Pede decisão humana e, se aprovada, rota
> `/analyse` (o que muda é o alcance de uma leitura estrutural já especificada, um fato de
> negócio sobre o que o julgamento pode citar) seguida de `/plan-work` → `/implement-task`.
> Onde este documento e a especificação divergirem, a especificação vale.

## 1. Cenário que motivou este pedido

Ao avaliar a capability `perfil-mobile-tecnico-reader` 1.0.0 em produção (`production.capabilities`),
seu `output_schema` era:

```json
{
  "type": "object",
  "properties": {
    "login": { "type": "string" },
    "installations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "appName": { "type": "string" },
          "clientVersion": { "type": "string" },
          "state": {
            "type": "string",
            "enum": ["active", "disabled", "inactive", "init-required", "activated", "initializing"]
          },
          "pushEnabled": { "type": "boolean" },
          "gpsEnabled": { "type": "boolean" },
          "lastAccess": { "type": "string" },
          "device": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "model": { "type": "string" },
              "os": { "type": "string" },
              "platform": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

Nenhuma propriedade tinha `description`. Duas foram adicionadas em `login` e `installations` (as
únicas de topo) diretamente no registro de produção — correção pontual, fora do escopo deste
documento.

O que este documento aborda é o que essa correção **não alcançou**: `installations.items.properties.state`
carrega um enum (`active`, `disabled`, `inactive`, `init-required`, `activated`, `initializing`)
cujo significado é exatamente o tipo de coisa que uma `description` deveria declarar — mas
`state` está aninhado dentro de `installations.items.properties`, não no topo de `properties`.

## 2. Por que a lacuna não se resolve cadastrando a capability de outro jeito

A leitura estrutural do `output_schema` é um fato já fixado na especificação
(`domain/investigation/field-semantics`) e implementado de forma idêntica em dois lugares do
código:

- `src/src/investigation/field-semantics.ts::fieldSemanticsOf` — lê `name`/`type`/`description`
  só das chaves de `parsed.properties` (topo), via `Object.entries(parsed.properties)`.
- `src/src/investigation/citation-validation.ts::declaredFieldsOf` — mesma leitura, só nomes,
  para validar citação.

O próprio nó declara isso deliberadamente: *"read structurally from that schema's own top-level
`properties` object"*. Não é uma omissão de implementação — é o fato especificado hoje.

Consequência prática para esta capability: mesmo que alguém escreva uma `description` dentro de
`installations.items.properties.state`, **nada no sistema a lê**. Ela nunca vira semântica
declarada, nunca é snapshotada em `domain/investigation/evidence.fields` (que hoje é sempre uma
lista achatada de `{name, type?, description?}` referente só a `login` e `installations`), e
nunca chega ao prompt de julgamento (`constraints/the-judgment-prompt-is-closed`). Uma hipótese
não pode sequer citar `state` como campo — `rules/investigation/a-cited-field-exists-in-the-capability-output-schema`
só reconhece `login` e `installations` como campos existentes para esta evidência.

Ou seja: **não é um problema de cadastro** (nenhum valor de `description` que se escreva em
`state` resolve isso); é um limite do alcance estrutural que a especificação fixou.

## 3. O que se pede

Uma decisão de negócio — via `/analyse` — sobre se a semântica de campo deve alcançar
propriedades aninhadas do `output_schema` (dentro de `items` de um array, ou de um objeto
aninhado), e, se sim, como um nome de campo aninhado é citado por uma hipótese e snapshotado na
evidência.

### Opções para a decisão (não mutuamente exclusivas com ressalvas)

**(a) Descer a leitura por um caminho (`path`), achatado em pontos.**
`fieldSemanticsOf` percorre recursivamente `properties` (inclusive dentro de `items` de arrays) e
nomeia cada campo pelo caminho completo, ex. `installations.state`. `FieldSemantics.name` passa a
carregar esse caminho.
- Custo: uma citação de hipótese precisa passar a citar `installations.state`, não `state` —
  muda o que o `SYSTEM_PROMPT` do avaliador ensina a citar; muda a forma de
  `a-cited-field-exists-in-the-capability-output-schema`.
- Ambiguidade a decidir: `installations` é um array — o valor observado tem um `state` por
  instalação, não um único. Uma citação a `installations.state` é sobre o conceito de campo
  (declarado no schema), nunca sobre uma instância específica do array na observação — precisa
  ficar dito explicitamente para não confundir com "cita o índice 2".

**(b) Não descer — exigir que o que deve ser citável esteja no topo.**
Mantém a leitura estrTural como está; quem produz a capability que "achate" para o topo os campos
cujo significado importa para julgamento (ex. um sumário derivado, ou reestruturar o
`output_schema` para não aninhar o que precisa ser citável). Custo: pode forçar um formato de
`output_schema` menos natural para o conector só para tornar um campo citável.

**(c) Separar "dica de operador" de "campo citável".**
`description` aninhada é lida e exibida como texto de apoio no formulário/detalhe da capability
(alcance puramente de UI, sem tocar `field-semantics`, citação ou evidência), mas **não** entra
no snapshot de evidência nem é citável por uma hipótese — só o que está no topo participa do
julgamento. Resolve a necessidade de documentar `state` para quem cadastra a capability, sem
mexer no contrato de citação/prompt.
- Esta opção é a única das três que não altera nenhum nó de regra hoje especificado — é uma
  leitura adicional só para exibição, do tipo que o formulário de capability já faz para o topo.

### Recomendação

Nenhuma opção é claramente superior sem saber se há hoje (ou hipótese futura) uma necessidade real
de uma hipótese citar um campo aninhado especificamente (não só ler seu valor dentro da
observação, que a evidência já carrega inteira). Na ausência dessa necessidade declarada, **(c)**
é o menor comprometimento: resolve o problema concreto observado (documentar `state` para quem lê
o cadastro) sem abrir a superfície de citação/prompt. Se surgir a necessidade de citar um campo
aninhado, (a) é a extensão natural, com a ambiguidade de array explicitamente resolvida na
especificação antes de implementada.

## 4. Nós potencialmente afetados (indicativo — a decisão real é do `/analyse`)

| nó | o que pode mudar |
|---|---|
| `domain/investigation/field-semantics` | alcance da leitura estrutural (top-level vs. recursivo) |
| `rules/investigation/a-cited-field-exists-in-the-capability-output-schema` | forma do nome citável, se (a) |
| `domain/investigation/evidence` (`fields`) | shape de `name` (chave simples vs. caminho), se (a) |
| `constraints/the-judgment-prompt-is-closed` | o que o `SYSTEM_PROMPT` ensina a citar, se (a) |
| nenhum nó de regra | se (c) — é leitura adicional só de exibição, sem tocar citação/evidência/prompt |

## 5. Rota (após decisão humana)

1. Humano escolhe entre (a), (b), (c) — ou outra formulação — e resolve a ambiguidade de array em
   (a), se escolhida.
2. Se (a): `/analyse` com este documento como material → revisar diff sobre `knowledge/` e o
   `decision-log.md`.
   Se (c): não há fato de negócio novo (é leitura de exibição, não citação) — pode ir direto a
   `/plan-work` como escopo de capability's surface, sem passar por `/analyse`.
3. `/plan-work` com o escopo resultante; `/implement-task` por task; `/review-change` ao final.
