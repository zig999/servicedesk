# Escopo para `/plan-work` — API HTTP de administração de caso (superfície completa)

> Este documento é o escopo de desenvolvimento a entregar à skill `/plan-work`. `/analyse` já
> processou a lacuna de gestão administrativa de caso e a especificação em `knowledge/` já reflete
> as cinco operações novas — validada (`32 elementos, 53 regras, 10 cenários, 18 contratos,
> 15 restrições; 79 decisões disclosed`) e comitada (commit `94d3ab2`). Este documento não redefine
> domínio — ele descreve **o que construir** em código para satisfazer o que a especificação já diz,
> e referencia cada nó pelo identificador exato que ela usa hoje. Fonte adicional:
> `case-management-http-api-analysis.md` (a análise completa dos 18 serviços, das boas práticas de
> API e do compliance contra o standard do projeto que originou este escopo).

---

## 0. Mapa dos nós da especificação que este escopo implementa

| Nó | Operações que declara | Situação no código hoje |
|---|---|---|
| `contracts/knowledge/case-lifecycle` (api) | `create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, update-draft, release, discard` | as seis primeiras já têm operação de domínio em `src/case/*.operation.ts`, compostas em `case-lifecycle.factory.ts` — **nenhuma tem rota HTTP**. `update-draft` não existe em lugar nenhum do código ainda |
| `contracts/knowledge/case-query` (api) | `read-case, list-cases, list-case-versions, list-hypotheses, list-hypothesis-revisions` | `read-case` já existe (`case-query.service.ts`) sem rota HTTP. As quatro listagens não existem em `ICaseStore` nem em `case-query.service.ts` |
| `contracts/glossary/glossary-query` (api) | `read-vocabulary-term, read-concept, list-vocabulary-terms, list-concepts` | as duas leituras já existem em `IGlossaryQuery`, sem rota HTTP. As duas listagens não existem em `IGlossaryQuery` |
| `contracts/integration/capability-registry` (api) | `read-capability, list-capabilities` | a leitura já existe em `ICapabilityQuery`, sem rota HTTP. A listagem não existe |
| `domain/knowledge/case-version` | operação `update-draft` adicionada às já declaradas | sem código ainda |
| `rules/knowledge/a-case-version-is-written-once` (invariant) | uma versão `released` nunca é alterada — cobre também `update-draft` | já reforçada por `release.operation.ts`/pelo schema; `update-draft` precisa apenas checar `state === 'draft'` antes de escrever, o mesmo padrão de `discard.operation.ts` |
| `contracts/system/case-authoring` (capability) | promessa ampliada: compor o draft livremente, manifesto **e atributos próprios** | prosa apenas — nenhuma obrigação de código nova além do que os itens acima já cobrem |

---

## 1. Resumo do que precisa ser construído

### 1.1 Extensões de porta (domínio) — necessárias antes de qualquer rota HTTP poder existir

| Porta | Método novo | Regras que aplica |
|---|---|---|
| `ICaseStore` | `updateDraft(input)` | recusa se a versão não estiver em `draft` (`a-case-version-is-written-once`) — mesmo padrão de `discard.operation.ts`/`release.operation.ts` |
| `ICaseStore` | `listCases(filter?)` | nenhuma regra nova — leitura |
| `ICaseStore` | `listCaseVersions(slug)` | recusa se o slug não existir (`CaseNotFoundError`, mesmo padrão já usado por `assembleVersion`) |
| `ICaseStore` | `listHypotheses(slug)` | idem |
| `ICaseStore` | `listHypothesisRevisions(slug, hypothesisName)` | idem |
| `IGlossaryQuery` | `listVocabularyTerms(vocabulary)` | nenhuma regra nova — leitura |
| `IGlossaryQuery` | `listConcepts()` | nenhuma regra nova — leitura |
| `ICapabilityQuery` | `listCapabilities()` | nenhuma regra nova — leitura |

A forma exata de cada assinatura (parâmetros de paginação/filtro, forma do retorno) é decisão de
quem implementa — a especificação só nomeia a operação, nunca seus parâmetros ou seu retorno.

### 1.2 A camada HTTP inteira — 18 serviços, nenhum existe hoje além de `POST /v1/diagnose`

| # | Método + rota | Operação | Camada de domínio |
|---|---|---|---|
| 1 | `POST /v1/cases` | `create-draft` | já existe — só falta HTTP |
| 2 | `GET /v1/cases` | `list-cases` | precisa da extensão §1.1 |
| 3 | `GET /v1/cases/{slug}/versions` | `list-case-versions` | precisa da extensão §1.1 |
| 4 | `GET /v1/cases/{slug}/versions/{version}` | `read-case` | já existe — só falta HTTP |
| 5 | `PATCH /v1/cases/{slug}/versions/{version}` | `update-draft` | precisa da extensão §1.1 |
| 6 | `POST /v1/cases/{slug}/versions/{version}/release` | `release` | já existe — só falta HTTP |
| 7 | `DELETE /v1/cases/{slug}/versions/{version}` | `discard` | já existe — só falta HTTP |
| 8 | `POST /v1/cases/{slug}/hypotheses` | `revise-hypothesis` | já existe — só falta HTTP |
| 9 | `GET /v1/cases/{slug}/hypotheses` | `list-hypotheses` | precisa da extensão §1.1 |
| 10 | `GET /v1/cases/{slug}/hypotheses/{name}/revisions` | `list-hypothesis-revisions` | precisa da extensão §1.1 |
| 11 | `PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}` | `place-hypothesis` | já existe — só falta HTTP |
| 12 | `DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}` | `remove-hypothesis` | já existe — só falta HTTP |
| 13 | `GET /v1/glossary/{vocabulary}/{name}` | `read-vocabulary-term` | já existe — só falta HTTP |
| 14 | `GET /v1/glossary/concepts/{name}` | `read-concept` | já existe — só falta HTTP |
| 15 | `GET /v1/glossary/{vocabulary}` | `list-vocabulary-terms` | precisa da extensão §1.1 |
| 16 | `GET /v1/glossary/concepts` | `list-concepts` | precisa da extensão §1.1 |
| 17 | `GET /v1/capabilities/{concept}` | `read-capability` | já existe — só falta HTTP |
| 18 | `GET /v1/capabilities` | `list-capabilities` | precisa da extensão §1.1 |

Cada rota segue exatamente o padrão já estabelecido por `diagnose.routes.ts` +
`diagnose.controller.ts` + `dto/diagnose.dto.ts`: plugin Fastify fino sob o prefixo `/v1`
(API-06), DTO Zod validando na borda (DTO-01/02/03), dependências injetadas via factory — cada
grupo (cases, glossário, capabilities) já tem seu factory pronto
(`case-lifecycle.factory.ts`, `case-query.factory.ts`, `glossary.factory.ts`,
`capability-registry.factory.ts`), então nenhum controller constrói suas próprias dependências
(ARC-02).

### 1.3 Infraestrutura transversal que os itens acima exigem para não violar o standard do projeto

- **`src/types/pagination.ts`** (API-01/02/03/04) — não existe hoje; obrigatório antes de qualquer
  um dos seis endpoints de listagem (itens 2, 3, 9, 10, 15, 16, 18) poder responder no formato que
  o standard exige.
- **`src/errors/status-map.ts`** (COR-04) — não existe hoje. `error-handler.middleware.ts`
  documenta explicitamente que hoje nenhum erro de domínio tem status mapeado; sem este arquivo,
  todo `CaseNotFoundError`, `CaseAlreadyHasDraftError`, `ManifestPositionOccupiedError` etc.
  responderia **500** em vez de 404/409/422 assim que a primeira rota nova entrar no ar. Este é o
  ponto que bloqueia tecnicamente qualquer uma das 18 rotas de escrita/leitura com erro tipado — não
  é opcional a nenhuma delas.

---

## 2. O que este escopo explicitamente NÃO inclui

- **Autenticação/autorização (SEC-01).** Não existe nenhum middleware de autenticação no projeto
  hoje (`diagnose.controller.ts` documenta que nenhum header de auth é lido). Uma API que
  cria/edita/apaga cases precisa disso antes de ir ao ar para qualquer usuário real — mas é um
  escopo à parte, maior (JWKS via `jose`, conforme STK-07 já prescreve, mais a política de quem
  pode editar o quê, que é um fato de negócio que a especificação não declara hoje). Registrar aqui
  como risco conhecido, não como tarefa deste plano.
- **Concorrência otimista e idempotência nas escritas do draft.** Decisão já tomada em conversa com
  o responsável: risco aceito, não entra nesta iniciativa (poucos curadores, uso interno).
- **Qualquer mudança de comportamento do diagnóstico** (`POST /v1/diagnose`) ou do motor de
  investigação — este escopo é só a superfície de gestão de caso.
- **Paginação com cursor, ordenação configurável ou filtros de busca textual** nas listagens — o
  standard já define paginação por offset (API-03/04); um filtro de busca (`q=`) é decisão de quem
  implementa cada listagem, dentro do que a operação de domínio §1.1 expuser, não uma obrigação
  deste escopo.

---

## 3. Pré-condição — satisfeita

`/analyse` já processou a lacuna de gestão administrativa e comitou o resultado (commit `94d3ab2`,
`32 elementos, 53 regras, 10 cenários, 18 contratos, 15 restrições; 79 decisões disclosed`). Este
plano já pode ser decomposto em tarefas.
