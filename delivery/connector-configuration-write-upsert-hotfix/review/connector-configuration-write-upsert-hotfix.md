---
title: Connector configuration write upsert hotfix, first review
summary: What four passes found over writeConnectorConfigurations' switch from a whole-table DELETE-then-reinsert
  to a per-connector upsert, and over the two specs reconciled to prove it.
reviewed:
- src/persistence/relational-connector-configuration-store.repository.ts
- src/connector-registry/connector-configuration-store.port.ts
- src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
- src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
tasks:
- task/connector-configuration-write-upsert-hotfix/write-connector-configurations-upserts-by-identity
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/connector-configuration-write-upsert-hotfix) passed in full, so there
    was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: Registrar um connector configuration em uma identidade (connector) nova sucede sem apagar
    a configuração de nenhum connector diferente já registrado.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: leaves connector-a exactly as it was when a different connector, connector-b, is written afterward
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: persists and reads back a connector configuration exactly as given
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: upserts each given configuration by its own connector identity, inside one transaction, and
      never sends a DELETE
- criterion: Reescrever a configuração de um connector já registrado substitui exatamente esse connector;
    nenhuma linha de connector_configurations pertencente a um connector diferente é apagada como efeito
    colateral dessa escrita.
  state: partial
  tests:
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: answers a rewritten connector with its new value at the very next read, never a value an earlier
      read of the same identity already answered
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: keeps exactly one row for a connector name after two writes to the same identity, never appending
      a duplicate
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: upserts each given configuration by its own connector identity, inside one transaction, and
      never sends a DELETE
  why: 'A primeira metade do critério — a reescrita substitui exatamente esse connector — é exercitada,
    mas em nenhum teste uma reescrita de um connector já registrado ocorre enquanto uma identidade diferente
    já está presente na tabela: nos dois testes de reescrita a tabela só contém a identidade reescrita
    (o afterEach limpa a tabela entre testes), e o único teste com duas identidades presentes escreve
    uma identidade nova, não uma reescrita. Nada no conjunto observa, contra o banco real, a linha de
    um connector diferente sobrevivendo à reescrita de outro.'
- criterion: Nenhuma escrita em connector_configurations emite mais um DELETE sem filtro de WHERE contra
    a tabela inteira.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: upserts each given configuration by its own connector identity, inside one transaction, and
      never sends a DELETE
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty
      set
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: leaves connector-a exactly as it was when a different connector, connector-b, is written afterward
findings:
- pass: conformance
  file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  where: line 197, the section banner introducing the last test, and that test's own name at line 199
  evidence: '"// ---------------------------------------------------------------- inference: no transport-specific
    column" [join — the next line quoted is line 199, the banner''s own test] "it(''holds only the connector
    and configuration columns — no transport-specific column such as a method or an address'', async ()
    => {"'
  cost: The column set is labelled as something this delivery inferred, but domain/integration/connector-configuration
    declares exactly two attributes (connector, configuration) and says of the payload "Its shape is not
    fixed here ... what it must be is a well-formed JSON object; what its keys mean is the executing connector's
    own statement" — so a method or address column is already excluded by the specification. Read as an
    inference, the next person who wants a transport-specific column takes the exclusion for a test author's
    choice and revises the test, rather than looking for the attribute that would have to be added to
    the value object first; the fact then has two homes that can disagree, and the code's is the one the
    reader met.
  correction: State the section as what it is — the check constraints/the-stored-schema-mirrors-the-declared-model's
    own fitness asks for, pairing each column against the attribute domain/integration/connector-configuration
    declares — and drop the inference label, so the test cites the node it reads the column set from instead
    of claiming it.
- pass: standard
  file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  where: lines 42-48, requireDatabaseUrl()
  cites: STK-08
  evidence: "function requireDatabaseUrl(): string {\n  const url = process.env.DATABASE_URL;\n  if (!url)\
    \ {\n    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to\
    \ run.');\n  }\n  return url;\n}"
  cost: 'The environment reaches this suite through a hand-written truthiness check instead of a schema,
    so this file decides for itself what a usable DATABASE_URL is: any non-empty string passes, and a
    malformed or wrong-scheme value gets past the check and surfaces as a driver failure inside beforeAll
    rather than as a refusal naming the variable. It also puts what the environment must hold in two places
    — the Zod schema config/env.ts declares and this guard — so a variable renamed or newly constrained
    in the schema leaves this suite still accepting the old shape. The file''s own header discloses this
    same guard already standing in two other spec files, so this is the third place that decides the same
    thing.'
  correction: Parse the variable with a Zod schema — either the one config/env.ts declares or a narrow
    schema over DATABASE_URL alone — and let that parse's failure be what the suite refuses on, rather
    than the if (!url) check.
- pass: standard
  file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  where: lines 50-57, connectorConfigurationRecord()
  cites: MNT-03
  evidence: "/** One connector configuration as the registry holds it. */\nfunction connectorConfigurationRecord(overrides:\
    \ Partial<ConnectorConfiguration> = {}): ConnectorConfiguration {\n  return {\n    connector: 'a-connector',\n\
    \    configuration: JSON.stringify({ method: 'GET', address: 'https://example.test' }),\n    ...overrides,\n\
    \  };\n}"
  cost: 'The same builder, with the same default connector name and the same JSON.stringify({ method:
    ''GET'', address: ''https://example.test'' }) payload, is declared a second time in this change at
    lines 27-33 of src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts.
    The decision that configuration is JSON object text rather than an object is therefore spelled out
    in both files, so the representation change this hotfix carries had to be applied twice and the next
    one can be applied once: the unit half would keep building the old shape, both files would still pass,
    and neither says the other copy exists for a reader to check.'
  correction: Declare the builder once — a shared fixture module both spec files import — and have each
    file call it rather than restate it.
---

## What it is

O primeiro review sobre a correção de writeConnectorConfigurations: upsert por identidade de
connector em vez de DELETE seguido de reinserção da tabela inteira.

## Notes

O standard pass leu só as 35 regras decididas por leitura do registro (24 são decididas por tool e já rodaram como lint/typecheck/secret-scan na captura deste review, todos verdes).
Nada no artefato que o registro presume está ausente da árvore.
O trace tem 155 achados de drift sobre 178 bindings no target backend, quase todos pré-existentes e sem relação com esta mudança (0 orphaned, 2 moved, 153 code — 143 suprimidos sob frontend/app, declarado edits_freely). Os dois arquivos desta mudança aparecem na lista de code drift porque o bind desta entrega restampou só os três nós que a tarefa implementa, deixando as duas outras constraints que já apontavam para os mesmos arquivos (constraints/the-domain-depends-on-no-infrastructure e constraints/the-system-persists-to-one-relational-database) desatualizadas — isso não é um achado deste review, é fato de trace, e a rota é /reconcile.
O looked_past do conformance pass e do standard pass estão registrados nos seus próprios retornos, não repetidos aqui: plumbing de erro tipado, mensagens, a constante NOT_NULL_VIOLATION, e a divulgação já disclosed do padrão STK-08 em outros dois arquivos.
