# Scope

Aplicar o contrato de entrada do diagnose derivado dos input_schemas das capabilities.

Este plano implementa, no target backend (`src`), o que a especificação (root `knowledge`)
passou a declarar através do incremento de `/analyse` commitado em `7cf18be` ("analyse:
input_schema como contrato de entrada do diagnose"):

- **Forma validada do `input_schema`** — `rules/integration/a-capability-input-schema-holds-a-well-formed-object`:
  o registro de capability recusa (422, `MalformedCapabilityInputSchemaError`) um `input_schema`
  que não declare `properties` como objeto e, opcionalmente, `required` como subconjunto de suas
  chaves; uma capability já registrada antes desta regra, cujo `input_schema` armazenado não tem
  essa forma, é lida como declarando `properties` e `required` ambos vazios — nunca uma falha.
- **Leitura derivada dos requisitos de entrada de uma versão de caso** —
  `rules/knowledge/a-case-versions-input-requirements-are-derived` e
  `contracts/knowledge/case-input-requirements`: uma nova rota publicada
  (`read-case-input-requirements`) devolve, por versão de caso (rascunho ou released), a união
  dos atributos de subject que os `input_schema`s das capabilities que respondem aos conceitos do
  collection-plan da versão declaram — quais são exigidos, quais são opcionais, e quais
  capabilities pedem cada um. Nomeia também, à parte, toda capability do collection-plan cujo
  `input_schema` armazenado ainda não declara essa forma.
- **Recusa na entrada do diagnose** —
  `rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes`: um diagnose cujo
  subject não cobre (atributo ausente ou de valor vazio) o que a versão de caso pinada exige é
  recusado antes de qualquer coleta, com 422 e `SubjectDoesNotCoverCaseInputsError` nomeando todos
  os atributos faltantes juntos e, para cada um, as capabilities que o exigem. O `test-connector`
  não é tocado por este gate.
- **Degradação do placeholder não resolvido** —
  `rules/integration/an-unresolvable-observation-ends-unavailable` (emendada): um placeholder que
  nomeia um atributo de subject ou uma credencial e não resolve a nada passa a terminar a
  observação em `unavailable` com `result_detail` nomeando `ConnectorPlaceholderNotResolvedError`,
  em vez de propagar como exceção não mapeada (500) como o código hoje faz.
- **Reconciliação placeholder ⊆ properties** —
  `rules/integration/a-connector-placeholder-is-declared-by-its-capability`: o registro ou edição
  de uma configuração de connector é recusado (422, `ConnectorPlaceholderOutsideInputSchemaError`)
  se um placeholder nomeando um atributo de subject não estiver nas `properties` de alguma
  capability já registrada que nomeia esse connector; e o registro de uma capability é recusado da
  mesma forma se o connector que ela nomeia já tem uma configuração cujo placeholder escapa das
  `properties` que a capability declara. O `test-connector` reporta a mesma checagem no seu
  próprio response, para o par capability/connector sob teste.
- **Uma segunda condição já existente, fechada pelo cross-check do `/analyse`** —
  `rules/integration/an-http-connector-configuration-declares-its-call` (emendada): as demais
  falhas de montagem da chamada HTTP (endereço ausente, query/headers malformados, kind de
  placeholder não reconhecido, argumento de placeholder ausente) também terminam em `unavailable`
  com `IncompleteConnectorCallDescriptorError` — uma decisão que a especificação já vinha
  deixando indecisa e que este incremento fechou por completo, não só a fatia do placeholder.

## O que este plano não muda

- O wire do `input_schema` continua string contendo JSON.
- O subject continua identidade completa assemblada pela interface; nenhum campo novo no request
  do diagnose.
- O mecanismo de substituição de placeholder (`${subject:X}`, `${requester}`,
  `${credential:ENV_VAR}`) fica intacto.
- Nenhuma capability já registrada é migrada automaticamente — sem backfill; a leitura derivada
  apenas sinaliza qual capability precisa de re-registro.

## Onde ler o resto

A especificação completa está em `knowledge/` (contexts `integration`, `investigation`,
`knowledge`, `glossary`). O material de negócio original que originou este incremento está em
`temp/input-schema-diagnose-contract-proposal.md` e `temp/plano-input-schema-contrato-diagnose.md`
na raiz do projeto — prosa de apoio, não normativa: onde ela e a especificação divergem, a
especificação (já commitada) vale.
