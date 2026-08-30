# Scope

Transformar o botão "Add attribute" do painel de teste do conector
(`frontend/app/src/routes/connector-test-panel-fields.tsx`, hook
`frontend/app/src/hooks/use-test-connector-panel.ts`) para que, a cada clique, ele leia os
placeholders de subject (`${subject:<attribute>}`) presentes no texto atual de "Configuration" e
reconcilie os pares atributo/valor exibidos:

- Para cada nome de atributo de subject encontrado em Configuration: se já existe uma linha com
  esse nome de atributo, preserva o valor já digitado pelo operador; se não existe, cria uma nova
  linha com esse nome e valor vazio.
- Remove as linhas cujo nome de atributo não corresponde mais a nenhum placeholder de subject
  atualmente presente em Configuration.
- Ignora placeholders `${requester}` e `${credential:...}` — não são atributos de subject
  (confirmado por `rules/integration/a-connector-placeholder-is-declared-by-its-capability`: "Only
  a placeholder naming a Subject attribute is held to this — a placeholder naming the requester or
  a credential names no subject attribute").
- Deduplica nomes repetidos (o mesmo atributo pode aparecer em address, query, headers e body).
- Se o texto de Configuration não for JSON válido no momento do clique, o botão não altera as
  linhas existentes (não esvazia a lista).

## Contexto técnico já levantado

- O parsing de placeholders de subject já existe, replicado fielmente do backend
  (`src/src/http-connector/connector-request-resolver.ts`), em
  `frontend/app/src/services/simulation-subject-derivation.ts`
  (`subjectPlaceholderNamesInConfiguration`). Recomenda-se extrair as primitivas puras de parsing
  (regex do placeholder, split kind/argumento, filtro por kind "subject") para um módulo neutro
  compartilhado (ex. `frontend/app/src/shared/services/connector-placeholder-parsing.ts`), e fazer
  tanto `simulation-subject-derivation.ts` quanto o novo hook do painel de teste do conector
  importarem dali — hoje esse módulo pertence à feature de simulação de caso e não deveria ser
  importado diretamente pela feature de autoria de conector.
- O texto atual de Configuration (`state.configuration.value`, tipo `ConfigurationFieldState` em
  `use-connector-configuration-form.ts`) está disponível em `ConnectorConfigurationDetailReadyView`
  (`connector-configuration-detail-ready-view.tsx`), mas não é hoje passado para
  `ConnectorTestPanel`/`useTestConnectorPanel` (que só recebem `connector: string`). Precisa ser
  roteado como prop nova: `ConnectorConfigurationDetailReadyView` → `ConnectorTestPanel` (nova prop
  `configurationText`) → `useTestConnectorPanel(connector, configurationText)`.
- A tela já é coberta pela especificação existente — não é um fato de negócio novo, é uma
  interação de uma capability que a especificação já cobre
  (`contracts/integration/connector-diagnostics`,
  `rules/integration/a-connector-configuration-is-tested-through-a-registered-capability`).
- Alvo: frontend (`frontend/app`).
