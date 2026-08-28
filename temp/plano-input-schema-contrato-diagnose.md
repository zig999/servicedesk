# Plano: promover o `input_schema` a contrato de entrada do diagnose

> **Documento de handoff, autossuficiente.** Escrito em 2026-08-27 para ser executado em outra
> sessão de Claude Code, sem depender do histórico da conversa que o produziu. Tudo que a
> execução precisa saber está aqui ou no repositório. Uma cópia da proposta em prosa está em
> `temp/input-schema-diagnose-contract-proposal.md` (mesmo conteúdo das seções 3–7 abaixo);
> este arquivo é o plano de execução por cima dela.

---

## 0. Contexto do projeto (leia primeiro)

- Projeto **Siegard** (framework de especificação-como-autoridade). Leia `CLAUDE.md` na raiz
  antes de qualquer coisa — as regras de lá governam tudo: a especificação é a autoridade,
  fatos de negócio só entram por `/analyse`, trabalho só é escrito por `/implement-task` sobre
  um plano cortado por `/plan-work`. **Nunca implemente nada deste documento editando código
  diretamente.**
- `siegard.json` (raiz): `specification_root: knowledge`, `targets: {backend: src, frontend: frontend/app}`,
  `work_root: work`, `delivery_root: delivery`, standards em `standards/`.
- Este plano é **mudança de fato de negócio** (o que o sistema exige na entrada, o que recusa
  e o que diz ao recusar) → rota completa: `/analyse` → `/plan-work` → `/implement-task` →
  `/review-change`.

## 1. O problema (estado atual, verificado no código em 2026-08-27)

O contrato de entrada de um diagnose tem dois lares e nenhum aplicado na entrada:

1. **O contrato de fato** é o conjunto de placeholders `${subject:X}` dentro da configuração
   opaca de cada connector, resolvido por
   `src/src/http-connector/connector-request-resolver.ts` (`resolveConnectorRequest`), que
   suporta três kinds: `${subject:attr}` (busca no conjunto de atributos do subject; ausente
   ou vazio → lança `ConnectorPlaceholderNotResolvedError`), `${requester}` e
   `${credential:ENV_VAR}` (lê `process.env` na resolução; nunca armazena valor).
   - Esse erro **não está mapeado** em `src/src/errors/status-map.ts` → propaga como
     rejeição no meio da coleta → **500**, depois de custo já gasto em outras observações.
   - O adapter `src/src/investigation/http-declarative-observation-source.adapter.ts`
     degrada quatro condições irresolvíveis para `unavailable` (capability não resolvida,
     conceito duplicado, connector não registrado, configuração HTTP malformada — regra
     `an-unresolvable-observation-ends-unavailable`), mas o placeholder não resolvido
     deliberadamente ainda propaga (comentário no header do arquivo).
2. **O contrato declarado** — `input_schema`, atributo obrigatório de toda capability
   (`knowledge/rules/integration/a-capability-declares-its-contract.md`) — é validado apenas
   como JSON sintaticamente bem-formado
   (`a-capability-declares-well-formed-schemas`, aplicada em
   `src/src/capability-registry/capability-registry.service.ts`) e **não é lido por nada**:
   nenhum código lê seu conteúdo para decidir algo. Contraste: o `output_schema` é aplicado
   duas vezes — `declaredFieldsOf` em `src/src/investigation/citation-validation.ts` (lê as
   chaves de `properties` do topo, forma fixada por inferência disclosada no decision-log)
   limita citações, e o adapter HTTP filtra os campos da observação por ele.
3. **A derivação de "quais valores este caso exige" vive só no frontend**:
   `frontend/app/src/hooks/use-simulation-subject.ts` + `deriveRequiredFields`
   (`simulation-subject-derivation.ts`) varrem o texto das configurações de connector
   procurando `${subject:X}` para montar os campos do painel de simulação
   (`frontend/app/src/routes/case-simulation-subject-panel.tsx`). Gramática de placeholder
   duplicada numa segunda base de código; o backend não sabe responder a pergunta.

Cadeia de derivação existente (fatos da especificação, confirmados):
versão do caso → manifest → revisões de hipótese → `collects` (conceitos) →
**uma capability por conceito** (`one-capability-answers-one-concept`) → `input_schema`.
A versão do caso já tem a operação `collection-plan`
(`knowledge/domain/knowledge/case-version.md`).

Fatos da especificação que sustentam o desenho atual (não mudam):

- `knowledge/domain/investigation/subject.md`: o subject é **identidade** (tipo governado +
  conjunto completo de pares atributo-valor); o caso declara só o tipo; a interface monta o
  conjunto; **cada connector recebe o conjunto inteiro** e resolve sozinho o que usa.
- `knowledge/domain/integration/connector-configuration.md`: configuração opaca, JSON object
  text; capability pode ser registrada antes do connector existir (nada força a resolução).
- Wire do diagnose: `src/src/http/dto/diagnose.dto.ts` — `{case:{slug,version}, subject:{type,
  attributes[]}, narrative, requester, ticket_ref?}`.

## 2. A solução em uma frase

O `input_schema` passa a declarar, em forma fixa e validada no registro, **quais atributos de
subject a capability usa e quais exige**; o conjunto exigido de uma versão de caso é
**derivado** (collection-plan → conceitos → capabilities → input_schemas) e publicado como
leitura; o diagnose **recusa na entrada, com 422 nomeando os atributos faltantes**, antes de
qualquer coleta; e um placeholder que ainda assim não resolver na observação **degrada para
`unavailable`** em vez de derrubar a run.

## 3. O que deliberadamente NÃO muda

- Subject continua identidade; nenhum campo novo no request do diagnose.
- Cada connector continua recebendo o conjunto inteiro de atributos.
- `resolveConnectorRequest` e os três kinds de placeholder ficam intactos; credencial
  continua lida do ambiente na resolução, nunca armazenada.
- O wire do `input_schema` continua **string contendo JSON** (`z.string().min(1)`, coluna
  texto no store). Muda a forma interna exigida, não o tipo.

## 4. Decisões de domínio propostas (D1–D7)

Estas são as decisões que o `/analyse` transforma em nós. Cada uma é um fato proposto,
pendente de aprovação humana — o humano deve revisá-las antes de invocar (D4 e D7 são as
mais discutíveis).

### D1 — Forma do `input_schema`

Objeto JSON com, no topo, um objeto `properties` cujas chaves nomeiam atributos de subject
(vocabulário `domain/glossary/subject-attribute`), e opcionalmente um array `required`
subconjunto dessas chaves. O registro de capability passa a recusar **forma**, não só
sintaxe — mesma rota 422 da regra de sintaxe existente, com erro tipado próprio
(proposto `MalformedCapabilityInputSchemaError`, nomeando cada departure em termos
acionáveis, na convenção de `MalformedHttpConnectorConfigurationError`).

Deliberadamente **não** se promete JSON Schema completo: o sistema lê `properties` (chaves)
e `required`; `type`, `description` etc. são dica para operador/painel, nunca validados.
Isso fixa como fato declarado a convenção que o `output_schema` já vive por inferência
disclosada.

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

- `properties` = atributos que a capability **usa** (todo `${subject:X}` da configuração do
  seu connector deve estar aqui — ver D6).
- `required` = atributos que a capability **exige** para observar; um atributo em
  `properties` fora de `required` é opcional — ausente, a observação dessa capability degrada
  sozinha (D5) sem impedir o diagnose.
- `properties` vazio é válido: a capability não lê atributo nenhum do subject (connector só
  de credencial/requester, por exemplo).

### D3 — Conjunto exigido de uma versão de caso (derivado e publicado)

União dos `required` dos input_schemas das capabilities que resolvem os conceitos do
collection-plan da versão. Sempre derivado, nunca armazenado. Conceito sem capability
contribui com nada (a coleta dele já degrada para `unavailable` hoje).

Publicado como leitura derivada (novo contract node, proposto
`contracts/knowledge/case-input-requirements`):

```
GET /v1/cases/:slug/versions/:version/input-requirements
```

Resposta (forma proposta):

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
    { "attribute": "customer_document", "required": false, "askedBy": ["…"] }
  ]
}
```

Serve qualquer estado de versão (draft inclusive — o autor quer ver requisitos enquanto
edita); quem recusa draft é o diagnose, como hoje.

### D4 — Recusa na entrada do diagnose

Subject que não cobre o conjunto exigido — atributo ausente **ou de valor vazio**, o mesmo
critério do resolver — é recusado antes de qualquer coleta, com 422 e erro tipado (proposto
`SubjectDoesNotCoverCaseInputsError`) nomeando **todos** os faltantes de uma vez e, para
cada um, quais capabilities o exigem. Uma recusa, completa — nunca um faltante por vez
(convenção de stop do projeto).

Ordem no controller (`src/src/http/diagnose.controller.ts`): caso não encontrado → versão
não released → subject não cobre → runDiagnose.

O `test-connector` (`POST /v1/test-connector`) **não** ganha esse gate: existe para
diagnosticar exatamente a costura placeholder × subject; o erro cru do resolver é o
diagnóstico.

### D5 — Placeholder não resolvido degrada, não derruba

Na observação, `ConnectorPlaceholderNotResolvedError` (subject-attribute ou credential)
deixa de propagar e responde `unavailable` com `result_detail` nomeando a condição —
juntando-se às quatro condições que `an-unresolvable-observation-ends-unavailable` já
degrada. Justificativa: com D4 cobrindo os `required` na entrada, o que escapa aqui é um
opcional ausente, um `required` subdeclarado (bug de registro — D6 pega) ou env var de
credencial ausente — fatos de configuração/dados, a classe que a regra já resolve como dado.
`IncompleteConnectorCallDescriptorError` já degrada hoje e segue igual.

### D6 — Reconciliação: placeholders ⊆ `properties`

Todo `${subject:X}` na configuração de um connector deve nomear uma chave de `properties`
do input_schema de **cada** capability que nomeia esse connector. Aplicada nas duas
escritas, contra o que existe no momento (registrar capability antes do connector continua
permitido):

- **Registro/edição de configuração de connector**: recusada (422, erro tipado — proposto
  `ConnectorPlaceholderOutsideInputSchemaError` — nomeando cada placeholder órfão e a
  capability que o desdeclara) se violar contra capabilities já registradas que a nomeiam.
- **Registro de capability**: recusado se o connector nomeado já tem configuração registrada
  e algum `${subject:X}` dela fica fora das `properties` declaradas.

O `test-connector` reporta a mesma checagem no response (campo diagnóstico novo).

### D7 — Migração das capabilities já registradas

A recusa de forma (D1) vale para escritas novas. Linha já persistida sem a forma é lida como
**declarando zero atributos** (postura de `declaredFieldsOf`: malformado = nada declarado,
nunca exceção) — nada exigido na entrada, e todo placeholder dela órfão perante D6 na
próxima escrita da configuração. A leitura D3 marca essas capabilities
(`"input_schema_declares": false`) para o operador re-registrá-las. Sem backfill automático:
re-registro é escrita de operador.

## 5. O que o `/analyse` deve criar/emendar na especificação

- **Rule** nova: forma do input_schema e recusa no registro (D1/D2). Emendar também
  `rules/integration/a-capability-declares-its-contract.md`, cuja descrição hoje dá
  propósito só ao output_schema (citações) e ao timeout (coleta) — o input_schema ganha o
  seu: declarar o que a capability lê/exige do subject.
- **Rule** nova: o diagnose recusa subject que não cobre o conjunto exigido, nomeando todos
  os faltantes (D4).
- **Rule** nova: reconciliação placeholder ⊆ properties nas duas escritas (D6).
- **Rule** emendada: `rules/integration/an-unresolvable-observation-ends-unavailable.md`
  passa a listar o placeholder não resolvido entre as condições que degradam (D5).
- **Contract** novo: `contracts/knowledge/case-input-requirements` (D3).
- **Scenarios** novos: diagnose recusado por atributo faltante; opcional ausente degradando
  uma observação para unavailable; registro de configuração recusado por placeholder órfão;
  capability legada lida como zero atributos.
- **Decision-log**: D7 (postura de migração) e a fixação da forma (D1) como fato declarado
  para os dois schemas (encerra a inferência disclosada do output_schema).

## 6. Mudanças por componente (indicativo — a decomposição real é do `/plan-work`)

### Backend (`src/`)

| onde | o quê |
|---|---|
| `src/src/capability-registry/capability-registry.service.ts` | recusa de forma do input_schema (D1), além da sintaxe; checagem D6 contra configuração de connector existente |
| novo módulo (ex.: `src/src/capability-registry/input-schema-contract.ts`) | leitura estrutural: `declaredInputAttributesOf` / `requiredInputAttributesOf`, na convenção de `declaredFieldsOf` — casa única da forma D1 |
| novo módulo de derivação (ex.: junto ao case-query) | derivação D3: collection-plan → capabilities → união; consumida pela rota nova e pelo gate do diagnose |
| nova rota + DTO | `GET /v1/cases/:slug/versions/:version/input-requirements` |
| `src/src/http/diagnose.controller.ts` | gate D4 entre a checagem de released e o runDiagnose |
| `src/src/errors/` + `src/src/errors/status-map.ts` | `MalformedCapabilityInputSchemaError` (422), `SubjectDoesNotCoverCaseInputsError` (422), `ConnectorPlaceholderOutsideInputSchemaError` (422) |
| `src/src/investigation/http-declarative-observation-source.adapter.ts` | D5: captura `ConnectorPlaceholderNotResolvedError` → `unavailable` via `unavailableFor` |
| `src/src/connector-registry/connector-configuration-registry.service.ts` | checagem D6 no registro/edição |
| `src/src/http/test-connector.controller.ts` + DTO | campo diagnóstico D6 no response |

### Frontend (`frontend/app/`)

| onde | o quê |
|---|---|
| `frontend/app/src/hooks/use-simulation-subject.ts` | consome `input-requirements` em vez de `deriveRequiredFields`; expõe required × opcional |
| `simulation-subject-derivation.ts` | **aposentado** — o scan de placeholder some do frontend |
| `frontend/app/src/routes/case-simulation-subject-panel.tsx` | forma preservada; distinção visual required × opcional |
| readiness da simulação | pronto = requester + todos os `required` não-vazios (opcionais não bloqueiam) |

## 7. Riscos e custos aceitos

- **Duas declarações do mesmo fato** (input_schema × placeholders). Mitigação: D6 nas duas
  escritas + relatório no test-connector. Resíduo: registros em ordens permitidas podem
  coexistir inconsistentes até a próxima escrita de qualquer lado — e a observação degrada
  (D5) em vez de quebrar.
- **Fardo de autoria**: quem registra capability escreve schema com forma. Custo de ter
  contrato; painel e test-connector devolvem o valor.
- **Sobredeclaração de `required`**: obriga a preencher valor que talvez nenhuma hipótese
  use. Decisão do operador; `properties` sem `required` cobre o caso "usa se tiver".

## 8. Sequência de execução na nova sessão

1. **Revisão humana das decisões D1–D7** (especialmente D4: test-connector fora do gate; e
   D7: sem backfill). Ajustar este documento se alguma decisão mudar.
2. **`/analyse`** com `temp/input-schema-diagnose-contract-proposal.md` como material (mesmo
   conteúdo; se este plano tiver sido ajustado, ajuste a proposta antes ou aponte este
   arquivo). Revisar o diff sobre `knowledge/` e o `decision-log.md` ao final.
3. **`/plan-work`** com escopo: *"aplicar o contrato de entrada do diagnose derivado dos
   input_schemas das capabilities — forma validada no registro, leitura derivada por versão
   de caso, recusa na entrada do diagnose, degradação do placeholder não resolvido,
   reconciliação nas escritas de capability e configuração de connector, e painel de
   simulação consumindo a leitura derivada"*. As tabelas da seção 6 são indicativas; o
   survey e a decomposição cortam as tasks de verdade.
4. **`/implement-task`** por task deliverable (`bin/deliver.py --outstanding` diz a ordem);
   **`/review-change`** ao final.

Avisos operacionais:

- A árvore de trabalho tinha, em 2026-08-27, `siegard.json` modificado e `telemetry/`
  untracked no branch `case-simulation` — os entry points param sobre árvore suja; resolver
  (commit/discard) antes de invocar.
- Existe uma página publicada desta proposta (mesmo conteúdo, para leitura):
  https://claude.ai/code/artifact/96e6dc33-a2ab-40ae-a5e4-09119b3da8ca
