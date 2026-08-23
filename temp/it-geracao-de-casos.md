# Instrução de trabalho — geração de novos `Case`

Instrução para uma LLM que vai **gerar novos casos** de diagnóstico (documentos
`Case`) para um motor de investigação orientado a hipóteses. Este documento é
autocontido: define sozinho tudo o que um caso precisa declarar e todas as regras
que uma saída válida precisa satisfazer. Onde a tarefa não decidir um valor, quem
decide é o curador humano que revisa a saída — a LLM nunca inventa em silêncio um
fato de negócio que o vocabulário existente não sustenta.

---

## 1. O que você está gerando

Um **caso** é um procedimento de troca de diagnóstico: um conjunto de hipóteses, cada
uma com um critério falsificável e uma conclusão, mais um desfecho padrão para quando
nenhuma hipótese se confirma. O documento inteiro — caso, hipóteses, resoluções,
encaminhamentos — vive em **um único arquivo JSON**, nunca decomposto em partes.

Você produz **um** arquivo JSON por invocação, salvo em:

```
<diretório-de-casos>/<slug>/<version>.json
```

onde `<slug>` é o campo `slug` do próprio documento e `<version>` é o campo `version`
(ex.: `case/intermittent-connection-outage/1.json`).

---

## 2. Entidades, o que significam, como preencher

### 2.1 `Case` (o documento raiz)

| Campo | Tipo | Preenchimento |
|---|---|---|
| `slug` | string | Identificador do caso, em `kebab-case`, descrevendo o problema (ex.: `intermittent-connection-outage`). **Deve ser idêntico ao nome do diretório** onde o arquivo será salvo — são a mesma identidade, nunca dois valores que possam discordar. |
| `title` | string | Título legível por humano do mesmo problema (ex.: `"Intermittent internet connection outage"`). |
| `when_to_use` | string | Uma frase dizendo a um atendente **quando escolher este caso** — o gatilho de triagem, não a explicação do problema. |
| `version` | integer | Versão do caso. Para um caso novo, use `1`. Junto com `slug`, forma a identidade única desta versão — uma revisão de conteúdo sempre sobe o `version`; uma versão já existente nunca é reescrita. |
| `authored_at` | string (datetime ISO-8601) | Quando esta versão foi escrita (ex.: `"2024-01-01T00:00:00.000Z"`). Se a tarefa não informar uma data, use o instante atual em UTC. |
| `subject` | string | O tipo de sujeito que este caso examina — deve ser um nome de `SubjectType` **já existente no glossário** (ex.: `"contract"`), a menos que a tarefa peça explicitamente para introduzir um tipo novo (ver §4). |
| `fallback` | `Resolution` | O que responder quando **nenhuma** hipótese se confirma. Ver §2.3. **Precisa ser diferente** da resolução de toda hipótese deste caso — se calhar de bater com uma, ajuste a redação até divergir; um fallback igual a uma hipótese esconderia qual delas realmente confirmou. |
| `consolidation_register` | string | `"formal"` ou `"plain"` — o registro estilístico que a etapa de escrita final deve manter. **Opcional**: declare um dos dois quando a tarefa indicar uma preferência; se não indicar, omita o campo inteiramente. |
| `hypotheses` | `Hypothesis[]` | Lista de hipóteses, **na ordem de precedência** — a primeira que confirmar decide o resultado. Pelo menos uma. Ver §2.2. |

### 2.2 `Hypothesis` (dentro de `hypotheses[]`)

Uma hipótese é uma única afirmação testável sobre a causa do problema.

| Campo | Tipo | Preenchimento |
|---|---|---|
| `name` | string | Identificador em `kebab-case`, **único dentro do caso** (ex.: `"customer-equipment-fault"`). Nunca repita um nome entre hipóteses do mesmo caso — evaluations são indexadas por esse nome, e uma colisão sobrescreveria um veredito em silêncio. |
| `position` | integer | A posição desta hipótese na ordem de precedência do caso — **1 é a primeira a ser testada**. **Única dentro do caso**: nunca repita um valor de `position` entre hipóteses do mesmo caso. É este campo — não a ordem em que as hipóteses aparecem na lista — que decide qual hipótese confirmada determina o resultado; ainda assim, mantenha a lista `hypotheses` na mesma ordem de `position`, para facilitar a leitura. |
| `criterion` | string | **Exatamente uma** reivindicação falsificável, em uma a três frases de prosa de negócio (ex.: `"The customer's registered equipment reports a fault status in the corporate systems."`). Nunca escreva um critério com "confirma quando X, ou também quando Y" — isso são duas hipóteses, não uma. |
| `collects` | string[] | Lista de nomes de `Concept` (do glossário) que esta hipótese precisa observar para avaliar seu `criterion`. Pelo menos um. Cada concept citado precisa existir no glossário (ver §3) e aceitar o `subject` deste caso. |
| `resolution` | `Resolution` | O que esta hipótese conclui **se confirmada**. Ver §2.3. |

### 2.3 `Resolution` (usado em `fallback` e em cada `hypotheses[].resolution`)

Não tem identidade própria — é só a combinação de um desfecho com um encaminhamento.

| Campo | Tipo | Preenchimento |
|---|---|---|
| `outcome` | string | O que foi concluído (ex.: `"issue-equipment-fault"`). Para uma hipótese, é um outcome **novo, contribuído por ela** (uma hipótese confirmável contribui exatamente um outcome ao glossário) — só reaproveite um outcome já existente se a tarefa pedir explicitamente para referenciar uma conclusão já usada em outro caso. Para o `fallback`, use sempre um dos dois outcomes de não-conclusão que já preexistem a qualquer caso: `"inconclusive-no-data"` ou `"inconclusive-hypotheses-exhausted"`. |
| `referral` | `Referral` | O encaminhamento associado a esse desfecho. Ver §2.4. |

### 2.4 `Referral` (dentro de cada `Resolution`)

| Campo | Tipo | Preenchimento |
|---|---|---|
| `action` | string | O que fazer (ex.: `"schedule-technician-visit"`). Deve nomear **o ato**, não o motivo — se duas hipóteses diferentes levam ao mesmo ato, use o mesmo nome de action para ambas. |
| `recipient` | string | A fila operacional que executa (ex.: `"field-service-queue"`). Sempre um papel/fila real, **nunca uma pessoa**. |

---

## 3. O glossário — o vocabulário que o caso só pode citar, nunca definir

O caso **cita** termos por nome; ele não os define. Todo `subject`, `concept`,
`outcome`, `action` e `recipient` que o documento nomeia precisa existir no glossário
do projeto — um caso citando um termo que o glossário não tem está citando nada.

- **`SubjectType`** — um tipo de sujeito (`"contract"`, `"customer"`, um elemento de
  rede, uma região). Vocabulário *descoberto*: só cresce quando um caso realmente
  precisa de um tipo novo.
- **`Concept`** — uma observação nomeada que uma hipótese coleta. Tem `name`, os
  `SubjectType`s que aceita, e um `ttl` (tolerância de frescor em segundos).
  **`ttl` é obrigatório — não existe valor padrão**; se a tarefa não indicar um
  valor, proponha um e liste-o como suposição (ver §4). O formato do dado que o
  concept nomeia **não é problema do caso**: pertence ao schema de saída da
  capability que o produz.
- **`Outcome`** — o que uma hipótese confirmada (ou o fallback) conclui. Vocabulário
  *contribuído*: cada hipótese confirmável de cada caso contribui o seu; os dois
  outcomes de não-conclusão (`inconclusive-no-data`,
  `inconclusive-hypotheses-exhausted`) já existem antes do primeiro caso.
- **`Action`** — o ato que um encaminhamento pede. Vocabulário global e pequeno: só
  cresce quando o ato em si muda, nunca quando só o motivo muda.
- **`Recipient`** — a fila que recebe o encaminhamento. Global e estável: papéis
  operacionais reais.

**Se a tarefa não fornecer um glossário existente**, gere também as entradas de
glossário que o caso introduz (mesma lógica de nome único, um arquivo por vocabulário),
e declare-as separadamente do documento do caso — nunca dentro dele.

**Todo `concept` citado precisa ter uma capability de leitura registrada** (nome,
schema de saída, timeout) antes que o caso possa rodar de ponta a ponta; se a tarefa não
pedir essa capability explicitamente, avise no fim da sua resposta que ela ainda falta,
em vez de inventar uma silenciosamente.

---

## 4. Regras que toda saída precisa satisfazer

Verifique cada uma antes de entregar o JSON:

1. **Pelo menos uma hipótese.** Um caso sem hipótese não investiga nada; o fallback
   solo não é uma investigação.
2. **Nomes de hipótese únicos** dentro do mesmo caso.
3. **Valores de `position` únicos** dentro do mesmo caso — nenhuma hipótese
   compartilha sua posição de precedência com outra do mesmo caso.
4. **Um critério, uma reivindicação falsificável**, nunca duas condições disfarçadas
   de uma.
5. **Toda hipótese coleta pelo menos um concept**, e todo concept que ela coleta
   aceita o `subject` do caso.
6. **Toda posição — cada hipótese e o fallback — declara resolução completa**
   (outcome + referral); nenhuma conclusão sem encaminhamento.
7. **`position` reflete a precedência real** — a hipótese de menor `position` é
   testada primeiro, e a primeira a confirmar decide o resultado. Dê o menor valor
   à causa mais provável, ou mais barata de descartar; mantenha a lista
   `hypotheses` na mesma ordem de `position`.
8. **O fallback é distinto de toda resolução de hipótese** do mesmo caso.
9. **`consolidation_register`, quando declarado, é `"formal"` ou `"plain"`** —
   nunca outro valor. O campo é opcional: se a tarefa não indicar uma preferência,
   pode ser omitido.
10. **`slug` do documento é idêntico ao nome do diretório** em que ele será salvo.
11. **Todo termo citado (`subject`, cada `concept`, cada `outcome`, cada `action`,
    cada `recipient`) existe no glossário** que acompanha o caso.

Se cumprir uma regra exigir inventar um fato de negócio que nem a tarefa nem o
glossário fornecido sustentam (por exemplo, decidir sozinho qual causa é mais provável
sem nenhuma pista no pedido), **não decida por conta própria** — gere a melhor versão
possível e liste a suposição feita como uma nota separada, para que um curador humano a
confirme ou corrija.

---

## 5. Exemplo completo

```json
{
  "slug": "intermittent-connection-outage",
  "title": "Intermittent internet connection outage",
  "when_to_use": "When an attendant needs to troubleshoot a customer contract reporting an intermittent or unstable internet connection.",
  "version": 1,
  "authored_at": "2024-01-01T00:00:00.000Z",
  "subject": "contract",
  "consolidation_register": "formal",
  "fallback": {
    "outcome": "inconclusive-hypotheses-exhausted",
    "referral": {
      "action": "escalate-to-specialist",
      "recipient": "tier-two-support-queue"
    }
  },
  "hypotheses": [
    {
      "name": "customer-equipment-fault",
      "position": 1,
      "criterion": "The customer's registered equipment reports a fault status in the corporate systems.",
      "collects": ["equipment-status"],
      "resolution": {
        "outcome": "issue-equipment-fault",
        "referral": {
          "action": "schedule-technician-visit",
          "recipient": "field-service-queue"
        }
      }
    },
    {
      "name": "area-network-outage",
      "position": 2,
      "criterion": "An active network outage is currently registered for the contract's service area.",
      "collects": ["network-outage-flag"],
      "resolution": {
        "outcome": "issue-area-outage",
        "referral": {
          "action": "notify-customer-of-outage",
          "recipient": "customer-communications-queue"
        }
      }
    }
  ]
}
```

Este exemplo é ilustrativo — use-o como modelo de formato, não como conteúdo a copiar.

---

## 6. Formato de saída esperado

Responda com:

1. **Um bloco de código JSON**, um único objeto, exatamente com as chaves e a
   estrutura descritas nas seções 2–3 (mesmos nomes de campo, `snake_case`, sem campos
   extras e sem campos ausentes). Nenhum comentário dentro do JSON — JSON puro,
   parseável sem pré-processamento.
2. Se o caso introduzir termos de glossário novos (subject type, concept, outcome,
   action ou recipient que ainda não existiam), **um segundo bloco JSON por
   vocabulário afetado**, cada um só com as entradas novas, rotulado com o nome do
   vocabulário (`subject-type`, `concept`, `outcome`, `action`, `recipient`).
3. Uma lista curta, em prosa, de **toda suposição de negócio feita** para preencher
   algo que a tarefa não decidiu — vazia se nenhuma foi necessária.
4. Nenhum outro texto fora desses três blocos: sem saudação, sem resumo do que foi
   feito, sem repetição da instrução.
