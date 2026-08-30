# Proposta: promover o `input_schema` a contrato de entrada do diagnose

> **Status: proposta — material para `/analyse`.** Nada aqui é especificação ainda. Cada
> decisão abaixo (D1–D7) é um fato proposto, pendente de aprovação humana; o `/analyse` é
> quem os transforma em nós. Onde este documento e a especificação divergirem, a
> especificação vale.

## 1. Problema

Hoje o contrato de entrada de um diagnose tem dois lares e nenhum aplicado na entrada:

- O contrato **de fato** é o conjunto de placeholders `${subject:X}` dentro da configuração
  opaca de cada connector — um detalhe de implementação do adapter HTTP, aplicado por
  exceção (`ConnectorPlaceholderNotResolvedError`) **no meio da coleta**, não mapeada no
  status-map, virando 500 depois de custo já gasto.
- O contrato **declarado** — `input_schema`, atributo obrigatório de toda capability
  (`rules/integration/a-capability-declares-its-contract`) — é validado apenas como JSON
  sintaticamente bem-formado e **não é lido por nada**: é exibido como dica de texto livre
  no painel de simulação e ecoado nas leituras. O contraste com o `output_schema` é direto:
  aquele é aplicado duas vezes (limita citações via `declaredFieldsOf` e filtra os campos
  da observação no adapter).
- A derivação de "quais valores este caso exige" existe **só no frontend**
  (`deriveRequiredFields` varre o texto das configurações de connector), duplicando a
  gramática de placeholder numa segunda base de código e deixando o backend incapaz de
  responder a pergunta.

## 2. Solução em uma frase

O `input_schema` passa a declarar, em forma fixa e validada no registro, **quais atributos
de subject a capability usa e quais exige**; o conjunto exigido de uma versão de caso é
**derivado** (collection-plan → conceitos → capabilities → input_schemas) e publicado como
leitura; o diagnose **recusa na entrada, com 422 nomeando os atributos faltantes**, antes
de qualquer coleta; e um placeholder que ainda assim não resolver na observação **degrada
para `unavailable`** em vez de derrubar a run.

## 3. O que deliberadamente não muda

- O subject continua sendo **identidade** (`domain/investigation/subject`): tipo governado
  pelo glossário + conjunto completo de pares atributo-valor, montado pela interface antes
  do diagnose. Nenhum campo novo no request do diagnose.
- **Cada connector continua recebendo o conjunto inteiro** e resolvendo sozinho o que usa —
  adicionar um parâmetro a um connector continua sendo editar a configuração dele (e agora,
  quando novo, declará-lo no `input_schema` da capability).
- O mecanismo de substituição (`resolveConnectorRequest`) fica intacto: `${subject:attr}`,
  `${requester}`, `${credential:ENV_VAR}`, texto plano, sem eval, credencial lida do
  ambiente na resolução e nunca armazenada.
- O wire do `input_schema` continua **string contendo JSON** (`z.string().min(1)`, coluna
  texto). Muda a forma interna exigida, não o tipo.

## 4. Decisões de domínio propostas

### D1 — Forma do `input_schema`

Um `input_schema` é um objeto JSON com, no topo, um objeto `properties` cujas chaves nomeiam
atributos de subject (vocabulário `domain/glossary/subject-attribute`), e opcionalmente um
array `required` que é subconjunto dessas chaves. O registro de capability passa a recusar
**forma**, não só sintaxe — a mesma rota 422 que
`rules/integration/a-capability-declares-well-formed-schemas` já usa, com um erro tipado
próprio (proposto: `MalformedCapabilityInputSchemaError`, nomeando cada departure em termos
acionáveis, na convenção de `MalformedHttpConnectorConfigurationError`).

Deliberadamente **não** se promete JSON Schema completo: o sistema lê `properties` (chaves)
e `required`; `type`, `description` e demais campos são dica para o operador e para o
painel, nunca validados. Isso fixa como fato declarado a mesma convenção que o
`output_schema` já vive por inferência disclosada (decision-log de
`domain/integration/capability`).

Exemplo:

```json
{
  "type": "object",
  "properties": {
    "contract_number": { "type": "string", "description": "número do contrato" },
    "customer_document": { "type": "string", "description": "CPF/CNPJ do titular" }
  },
  "required": ["contract_number"]
}
```

### D2 — Semântica

- `properties` = os atributos que a capability **usa** (todo `${subject:X}` da configuração
  do seu connector deve estar aqui — ver D6).
- `required` = os atributos que a capability **exige** para observar; um atributo em
  `properties` fora de `required` é opcional: ausente, a observação dessa capability pode
  falhar sozinha (D5) sem impedir o diagnose.
- Um `input_schema` com `properties` vazio declara, validamente, que a capability não lê
  atributo nenhum do subject (um connector só de credencial/requester, por exemplo).

### D3 — Conjunto exigido de uma versão de caso (derivado)

O conjunto de atributos exigidos por uma versão de caso é a **união dos `required`** dos
`input_schema`s das capabilities que resolvem os conceitos do collection-plan da versão
(manifest → revisões → `collects` → conceitos → uma capability por conceito, pela regra
`one-capability-answers-one-concept`). É sempre derivado, nunca armazenado: recomputado a
cada leitura, como toda projeção deste sistema. Um conceito que hoje não resolve capability
nenhuma contribui com nada (a coleta dele já degrada para `unavailable`).

Publicado como leitura derivada (novo contract node, proposto
`contracts/knowledge/case-input-requirements`):

```
GET /v1/cases/:slug/versions/:version/input-requirements
```

```json
{
  "subject_type": "cliente",
  "attributes": [
    {
      "attribute": "contract_number",
      "required": true,
      "askedBy": [
        { "capability": "consulta-contrato", "version": "1", "connector": "erp-http",
          "concept": "situacao-contratual",
          "hint": { "type": "string", "description": "número do contrato" } }
      ]
    },
    { "attribute": "customer_document", "required": false, "askedBy": [ "…" ] }
  ]
}
```

Disponível para qualquer estado de versão (draft inclusive — o painel de simulação também
serve o rascunho? **não**: a simulação exige versão released como o diagnose; mas o autor
do caso quer ver os requisitos enquanto edita — a leitura serve qualquer estado, quem
recusa draft é o diagnose, como hoje).

### D4 — Recusa na entrada do diagnose

Um diagnose cujo subject não cobre o conjunto exigido (D3) — atributo ausente **ou de valor
vazio**, o mesmo critério que o resolver já aplica — é recusado antes de qualquer coleta,
com 422 e erro tipado (proposto: `SubjectDoesNotCoverCaseInputsError`) nomeando **todos** os
atributos faltantes de uma vez e, para cada um, quais capabilities o exigem. Uma recusa,
completa, na convenção de stop deste projeto — nunca um faltante por vez.

Ordem das recusas no controller: caso não encontrado → versão não released → subject não
cobre (nesta ordem; a checagem de cobertura pressupõe a versão lida).

O `test-connector` **não** ganha esse gate: ele existe para diagnosticar exatamente a
costura placeholder × subject, e o erro cru do resolver é o diagnóstico. Segue como está.

### D5 — Placeholder não resolvido degrada, não derruba

Na observação, `ConnectorPlaceholderNotResolvedError` (subject-attribute ou credential)
deixa de propagar como rejeição e passa a responder `unavailable` com `result_detail`
nomeando a condição — juntando-se às quatro condições irresolvíveis que
`rules/integration/an-unresolvable-observation-ends-unavailable` já degrada. Justificativa:
com D4 cobrindo os `required` na entrada, o que resta escapar aqui é um atributo opcional
ausente, um `required` subdeclarado (bug de registro — D6 é quem o pega) ou uma env var de
credencial ausente — todos fatos de configuração/dados, exatamente a classe que aquela
regra já decidiu resolver como dado e não como falha. `IncompleteConnectorCallDescriptorError`
(configuração malformada) já degrada hoje e segue igual.

### D6 — Reconciliação placeholders ⊆ `properties`

Todo `${subject:X}` na configuração de um connector deve nomear uma chave de `properties`
do `input_schema` de **cada** capability que nomeia esse connector. Aplicada nos dois
momentos de escrita, contra o que existe no momento (a especificação permite registrar
capability antes do connector existir, e isso não muda):

- **Registro/edição de configuração de connector**: recusada (422, erro tipado nomeando
  cada placeholder órfão e a capability que o desdeclara) se violar contra as capabilities
  já registradas que a nomeiam.
- **Registro de capability**: recusado se o connector nomeado já tem configuração
  registrada e algum `${subject:X}` dela fica fora das `properties` declaradas.

O `test-connector` reporta a mesma checagem no seu response (campo diagnóstico novo),
porque é o instrumento de quem está montando essa costura.

### D7 — Migração das capabilities já registradas

A recusa de forma (D1) vale para escritas novas. Uma linha já persistida cujo
`input_schema` não tem a forma é lida como **declarando zero atributos** (mesma postura de
`declaredFieldsOf`: malformado = nada declarado, nunca uma exceção) — o que significa: nada
exigido na entrada (D4 não bloqueia nada por causa dela) e todo placeholder dela órfão
perante D6 na próxima escrita da configuração do connector. A leitura D3 marca essas
capabilities (`"input_schema_declares": false`) para o operador vê-las e re-registrá-las.
Sem backfill automático: re-registro é escrita de operador.

## 5. Mudanças por componente

### Backend (`src/`)

| onde | o quê |
|---|---|
| `capability-registry/capability-registry.service.ts` | recusa de forma do `input_schema` (D1), além da sintaxe que já recusa; checagem D6 contra configuração de connector existente |
| novo módulo (proposto `capability-registry/input-schema-contract.ts`) | leitura estrutural do `input_schema`: `declaredInputAttributesOf` / `requiredInputAttributesOf`, na convenção de `declaredFieldsOf` (citation-validation.ts) — casa única da forma D1 |
| novo módulo (proposto `knowledge/case-input-requirements.ts` ou junto ao case-query) | derivação D3: collection-plan → capabilities → união; consumida pela rota nova e pelo gate do diagnose |
| nova rota + DTO (`http/read-case-input-requirements.routes.ts`, `http/dto/…`) | `GET /v1/cases/:slug/versions/:version/input-requirements` |
| `http/diagnose.controller.ts` | gate D4 entre a checagem de released e o `runDiagnose` |
| `errors/` + `errors/status-map.ts` | `MalformedCapabilityInputSchemaError` (422), `SubjectDoesNotCoverCaseInputsError` (422), `ConnectorPlaceholderOutsideInputSchemaError` (422) |
| `investigation/http-declarative-observation-source.adapter.ts` | D5: captura `ConnectorPlaceholderNotResolvedError` e responde `unavailable` via `unavailableFor` |
| `connector-registry/connector-configuration-registry.service.ts` | checagem D6 no registro/edição |
| `http/test-connector.controller.ts` + DTO | campo diagnóstico D6 no response |

### Frontend (`frontend/app/`)

| onde | o quê |
|---|---|
| `hooks/use-simulation-subject.ts` | passa a consumir `input-requirements` em vez de `deriveRequiredFields`; expõe required × opcional |
| `simulation-subject-derivation.ts` | **aposentado** (o scan de placeholder some do frontend; a gramática volta a ter uma casa só) |
| `routes/case-simulation-subject-panel.tsx` | forma preservada (um input por campo derivado, anotado por capability/connector, hint do schema); distinção visual required × opcional |
| readiness da simulação | pronto = requester preenchido + todos os `required` não-vazios (opcionais não bloqueiam) |

### Especificação (o que o `/analyse` cria/emenda)

- **Rule** nova: a forma do `input_schema` e sua recusa no registro (D1/D2).
- **Rule** nova: o diagnose recusa subject que não cobre o conjunto exigido, nomeando os
  faltantes (D4) — atualiza também o texto de `a-capability-declares-its-contract`, que
  hoje dá propósito só ao output_schema e ao timeout.
- **Rule** nova: reconciliação placeholder ⊆ properties nas duas escritas (D6).
- **Rule** emendada: `an-unresolvable-observation-ends-unavailable` passa a listar o
  placeholder não resolvido entre as condições que degradam (D5).
- **Contract** novo: `contracts/knowledge/case-input-requirements` (D3).
- **Scenario**s: diagnose recusado por atributo faltante; opcional ausente degradando uma
  observação para unavailable; registro de configuração recusado por placeholder órfão;
  capability legada lida como zero atributos.
- **Decision-log**: D7 (postura de migração) e a fixação da forma (D1) como fato, encerrando
  a inferência disclosada do output_schema como convenção agora declarada para os dois.

## 6. Riscos e custos aceitos

- **Duas declarações do mesmo fato** (input_schema × placeholders). Mitigação: D6 nas duas
  escritas + relatório no test-connector. Resíduo: os dois registros feitos em ordens que a
  especificação permite podem coexistir inconsistentes só até a próxima escrita de qualquer
  um dos lados — e a observação degrada (D5) em vez de quebrar.
- **Fardo de autoria**: todo operador que registra capability agora escreve um schema com
  forma. É o custo de ter contrato; o painel e o test-connector devolvem o valor.
- **Sobredeclaração de `required`**: obriga o atendente a preencher valor que talvez
  nenhuma hipótese daquele fluxo use. É decisão do operador da capability; `properties`
  sem `required` existe exatamente para o caso "usa se tiver".

## 7. Rota

1. **`/analyse`** com este documento como material — cria/emenda os nós da seção 5.
2. **`/plan-work`** com escopo "aplicar o contrato de entrada do diagnose derivado dos
   input_schemas" — o survey e a decomposição cortam as tasks (a tabela da seção 5 é
   indicativa, não a decomposição).
3. **`/implement-task`** por task; **`/review-change`** ao final.
