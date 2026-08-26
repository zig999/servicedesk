# Correções de conformidade com a especificação — backend

Quatro comportamentos, observados por três reconciliações (`/reconcile backend`) rodadas em
2026-08-25 contra `siegard-trace.json`, em que o código entregue e revisado diverge dos nós
que a especificação passou a declarar no mesmo dia (dois incrementos de `/analyse`). As
reconciliações são a evidência; os registros ficam em
`siegard-reconcile/connector-capability-corrections-post-closure-drift.md`,
`siegard-reconcile/post-analyse-refusals-and-endings-drift.md` e
`siegard-reconcile/status-map-knowledge-refusals-drift.md`, no toplevel do target `backend`.

Mais de um comportamento errado — cada um decide o que segue.

## 1. A observação de um concept não resolvível termina `unavailable`, não lança

Arquivo: `src/investigation/http-declarative-observation-source.adapter.ts`.

Hoje `resolveCapability` lança `CapabilityNotResolvedForObservationError` quando nenhuma
capability responde o concept, e a mesma função (ou a leitura da capability) não distingue o
caso em que duas capabilities respondem o mesmo concept; `resolveConnectorConfiguration` lança
`ConnectorConfigurationNotRegisteredError` quando o connector da capability não tem
configuração registrada; e `refuseHttpConfigurationDepartures` lança
`MalformedHttpConnectorConfigurationError` quando a configuração do conector HTTP não declara
`method`, `responseMap` ou `statusMap`.

`rules/integration/an-unresolvable-observation-ends-unavailable` e
`rules/integration/an-http-connector-configuration-declares-its-call` dizem que, nos quatro
casos, a observação não emite chamada e termina com `result: 'unavailable'`, carregando o nome
do erro (`CapabilityNotResolvedForObservationError`, `DuplicateConceptAnswerError`,
`ConnectorConfigurationNotRegisteredError` ou `MalformedHttpConnectorConfigurationError`) como
`result_detail` — nunca uma exceção que aborta o estágio.

Também: `resolveCapability`/`observeConcept` aplicam hoje só `capability.timeout` como bound
da chamada HTTP (`this.issueRequest(httpFields.method, request, capability.timeout)`).
`rules/investigation/collection-has-its-own-budget-within-the-total` diz que o timeout da
capability nunca passa do que resta do orçamento de sete segundos do estágio, propagado pelo
chamador — hoje não há esse clamp porque `observeConcept` não recebe tempo restante nenhum.

Nós que este comportamento implementa: `rules/integration/an-unresolvable-observation-ends-unavailable`,
`rules/integration/an-http-connector-configuration-declares-its-call`,
`rules/investigation/collection-has-its-own-budget-within-the-total`,
`domain/investigation/evidence-result`, `contracts/investigation/observation-source`,
`contracts/integration/concept-observation`.

## 2. `register-connector` responde as recusas do nó, não as que o código inventou

Arquivo: `src/connector-registry/connector-configuration-registry.service.ts`, e o mapeamento
de status em `src/errors/status-map.ts`.

Três divergências:

- `IncompleteConnectorConfigurationError` (conector sem nome, ou nome vazio) não está mapeado
  em `STATUS_BY_ERROR_CLASS` — cai no 500 padrão do handler. `rules/integration/a-connector-configuration-names-its-connector`
  diz HTTP 422.
- `wellFormedConfiguration`/`registrationProblems` deixam passar um valor já dado como objeto,
  `null`, array ou ausente sem checar se é um objeto simples, e `refuseRegistrationDepartures`
  recusa esses casos como `IncompleteConnectorConfigurationError` — mas
  `rules/integration/a-connector-configuration-holds-a-well-formed-object` diz que qualquer
  configuração que não é um objeto JSON simples (texto ou já objeto) é
  `ConnectorConfigurationNotWellFormedError`, não uma configuração incompleta.
- O serviço guarda e responde `configuration` como objeto (`Readonly<Record<string, unknown>>`).
  O nó `domain/integration/connector-configuration` declara o atributo como `string` (o texto
  JSON), e o registro/leitura publicados (`register-connector`, `read-connector-configuration`)
  já respondem texto — só o meio de campo do serviço guarda o objeto.

Nós: `rules/integration/a-connector-configuration-names-its-connector`,
`rules/integration/a-connector-configuration-holds-a-well-formed-object`,
`domain/integration/connector-configuration`.

## 3. Timeout de capability não-inteiro — qual recusa aplica

Arquivo: `src/capability-registry/capability-registry.service.ts`, `contractProblems`.

Hoje um `timeout` declarado e não-inteiro cai na mesma recusa de "contrato incompleto"
(`IncompleteCapabilityContractError`, 422) que um atributo ausente — mas
`rules/integration/a-capability-declares-its-contract` só pareia essa recusa com "a registration
leaving any required attribute undeclared", nunca com um valor declarado e mal formado.
`constraints/a-malformed-request-is-refused-with-a-validation-error` já existe para "a request
whose path, query or body fails the route's declared shape" com 400 `VALIDATION_ERROR`.

Qual das duas rege um `timeout` não-inteiro — a recusa 422 do contrato incompleto, estendida
para cobrir esse caso, ou o 400 de validação da rota — é uma decisão que cabe ao binder: nenhuma
reconciliação a resolveu, e a especificação como está hoje não decide entre as duas leituras.

Nós candidatos: `rules/integration/a-capability-declares-its-contract`,
`constraints/a-malformed-request-is-refused-with-a-validation-error`.

## 4. Comentários e constantes que citam uma leitura antiga da especificação

Nove locais, todos comentários de código ou constantes que restatam um nó em vez de o citar
como está hoje — nenhum é uma recusa observável, todos são o texto que o próximo leitor segue
para a autoridade errada:

- `src/errors/status-map.ts`, l.3-8 — cabeçalho diz "which status each domain error resolves to
  is this project's own engineering decision, not a fact the specification holds or should
  hold"; vários nós agora fixam o status como fato decidido.
- `src/capability-registry/capability-registry.service.ts`, l.95-99 — comentário sobre
  `readCapabilityByIdentity` diz que a operação "not part of the published capability-registry
  contract"; `contracts/integration/capability-registry` publica `read-capability-by-identity`
  entre suas quatro operações.
- `src/http/read-capability-by-identity.controller.ts`, l.10-16 e l.31-34 — mesma alegação
  sobre o contrato, e "which transport status ... is COR-04's concern, not this
  specification's"; `constraints/the-capability-identity-read-refuses-an-unregistered-identity`
  fixa o 404.
- `src/http/read-connector-configuration.controller.ts`, l.33-38 — mesma alegação sobre status
  para `rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused`.
- `src/connector-registry/connector-configuration-registry.service.ts`, l.11-21 — cabeçalho diz
  que a ausência de configuração "is never an error"; o read publicado a recusa com 404.
- Os três `pageCountOf` (em `capability-registry.service.ts`, `connector-configuration-registry.service.ts`
  e `glossary.service.ts`) — cada comentário diz que "neither this task's own criteria nor
  src/types/pagination.ts states what a non-positive limit answers"; `constraints/listings-are-paged`
  agora fecha esse caso a montante, num 400 de validação.
- `src/investigation/http-declarative-observation-source.adapter.ts`, l.71-80 — comentário do
  `DEFAULT_STATUS_ENDING` diz "no specification node states a default classification";
  `rules/integration/an-unclassified-status-ends-unavailable` agora o faz.
- As quatro citações a `(task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome)`
  em `src/glossary/glossary-store.port.ts`, `src/glossary/glossary.service.ts` (duas vezes) e
  `src/persistence/relational-glossary-store.repository.ts` — a garantia que citavam por um
  task path descartável agora está no `statement` de
  `rules/glossary/the-non-conclusion-outcomes-precede-the-first-case`.
- `src/capability-registry/capability.ts`, l.11 (`CAPABILITY_NATURES`) e l.66-80
  (`REQUIRED_REGISTRATION_ATTRIBUTES`, e o comentário que atribui `concept` ao domain-service
  errado) — a enumeração e o conjunto obrigatório são uma segunda casa do que
  `domain/integration/capability-nature` e `domain/integration/capability` já declaram.

Nenhum destes muda o que um usuário aprende ou faz — a correção é a citação e a fonte única,
não o comportamento observável — mas o código ainda é o único lugar onde a leitura errada vive,
e uma reconciliação futura continuaria a reportá-los.

Nós: `contracts/integration/capability-registry`,
`constraints/the-capability-identity-read-refuses-an-unregistered-identity`,
`rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused`,
`rules/integration/a-connector-configuration-holds-a-well-formed-object`,
`constraints/listings-are-paged`, `rules/integration/an-unclassified-status-ends-unavailable`,
`rules/glossary/the-non-conclusion-outcomes-precede-the-first-case`,
`domain/integration/capability-nature`, `domain/integration/capability`.
