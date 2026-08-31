---
contract_version: siegard-reconcile/1
title: Reconcile wave 1 of backend code drift — glossary read/write and connector-configuration store
summary: >-
  These four files are the shipped, committed backend behavior for reading and registering
  glossary concepts and for reading and writing connector configurations (the connector side
  post connector-configuration-write-upsert-hotfix, the glossary side post
  glossary-concept-write-upsert-hotfix). The human asserts this behavior — concept registration's
  shape validation, an unheld concept's read answering ConceptNotHeldError, and both stores'
  upsert-by-identity persistence — is correct as it stands; this reconciliation checks only
  whether the specification still states what these files now do.
target: backend
files:
  - path: src/http/dto/register-concept.dto.ts
    change: >-
      validates a concept registration's body with accepts as an array of non-empty strings and
      ttl as an optional positive integer, alongside the contract's required name and accepts
      and optional description
  - path: src/http/read-concept.controller.ts
    change: >-
      reads a concept by name and answers its four attributes verbatim, throwing
      ConceptNotHeldError when the glossary's own resolution reports the name unheld
  - path: src/connector-registry/connector-configuration-store.port.ts
    change: >-
      declares writeConnectorConfigurations as an upsert by connector identity that never
      deletes a row, leaving a connector the given set does not name exactly as it stood
  - path: src/persistence/relational-connector-configuration-store.repository.ts
    change: >-
      implements that upsert as a single INSERT .. ON CONFLICT (connector) DO UPDATE per given
      configuration, inside one transaction, touching no row outside the given set
nodes:
  - node: contracts/glossary/glossary-authoring
    conforms: true
    how: >-
      the file's two exported schemas are exactly this contract's one operation's request shape —
      registerConceptParamsSchema carries the name on the path and registerConceptBodySchema
      carries the body — and nothing in the file distinguishes create from replace, which is the
      contract's own reading of register-concept.
    encoded_at:
      - src/http/dto/register-concept.dto.ts
  - node: domain/glossary/concept
    conforms: false
    how: >-
      register-concept.dto.ts's judge cleared the four attributes themselves (name, accepts, ttl,
      description all present, none added) but found two further constraints this node does not
      hold: `accepts: z.array(z.string().min(1))` refuses a registration naming an empty string
      among its accepted subject types, and `ttl: z.number().int().positive().optional()` refuses
      a ttl of zero or negative — this node types accepts as subject-type and ttl as integer, and
      says nothing about either bound. read-concept.controller.ts's judge separately found the
      node's four attributes passed through unaltered on read, with no finding of its own.
    observed_at:
      - src/http/dto/register-concept.dto.ts
      - src/http/read-concept.controller.ts
  - node: rules/glossary/a-concept-declares-its-description
    conforms: true
    how: >-
      description is left optional at this boundary deliberately — an absent one passes
      validation and is refused downstream by GlossaryService.registerConcept's own
      ConceptDescriptionRequiredError, which is this rule's own refusal; the file cites the rule
      by identity rather than restating or contradicting it.
    encoded_at:
      - src/http/dto/register-concept.dto.ts
  - node: contracts/glossary/glossary-query
    conforms: false
    how: >-
      the file's header comment cites this contract's "own description" as the source of the
      split between an internal ordinary-data answer (`{ held: false, name }`) and the published
      refusal, but the contract's description states only the opposite-facing half — "A read by a
      name nothing holds is a refusal of its own" — and says nothing about an internal ordinary
      answer; that split is rules/glossary/a-glossary-read-by-an-unheld-name-is-refused's own
      fact ("The glossary's own resolution may answer the absence as ordinary data internally;
      the published read turns it into this refusal"), not this contract's.
    observed_at:
      - src/http/read-concept.controller.ts
  - node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
    conforms: true
    how: >-
      the file holds no evidence item and no judgment prompt — it passes `resolution.concept.description`
      through untouched — so it states none of the scenario's facts and contradicts none of them.
    encoded_at:
      - src/http/read-concept.controller.ts
  - node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
    conforms: false
    how: >-
      opened as a candidate because the file's own header comment misattributes this rule's fact
      to contracts/glossary/glossary-query (see that node's entry) and, separately, states that
      "Which transport status that ordinary absence becomes is COR-04's concern, not this
      specification's" — but this rule already fixes it: "a read of a concept by a name the
      glossary does not hold is refused with an HTTP 404 response reporting a
      ConceptNotHeldError", recorded in decision-log.md as a disclosed decision. The code's own
      branch (`if (!resolution.held) { throw new ConceptNotHeldError(resolution.name); }`)
      implements exactly that decision, but the trace binds this file to no node that states it.
    observed_at:
      - src/http/read-concept.controller.ts
  - node: constraints/the-domain-depends-on-no-infrastructure
    conforms: false
    how: >-
      both files' judges independently confirmed the boundary itself is honored — the port
      declares only an interface behind a type-only import, and the repository names no driver
      package. The port file's judge additionally returned a finding, naming no node of the two
      this file is bound to, against the same doc comment reported under
      contracts/integration/connector-configuration-registry below; per the fold rule an
      unattributed finding lands on every node its judge read, so this node is not cleared until
      that attribution is resolved.
    observed_at:
      - src/connector-registry/connector-configuration-store.port.ts
      - src/persistence/relational-connector-configuration-store.repository.ts
  - node: contracts/integration/connector-configuration-registry
    conforms: false
    how: >-
      both files' judges confirmed the contract's published operations (read, list, register by
      create-or-replace) are what each file implements, with no refusal or status added. The port
      file's doc comment on writeConnectorConfigurations additionally asserts, uncited to any of
      this file's own bound nodes, that "a connector this call does not name is left exactly as it
      stood" — the same permanence fact the repository's judge found explicitly against
      domain/integration/connector-configuration-registry below. Neither node this contract or the
      port's own bound set holds that guarantee.
    observed_at:
      - src/connector-registry/connector-configuration-store.port.ts
      - src/persistence/relational-connector-configuration-store.repository.ts
  - node: constraints/the-system-persists-to-one-relational-database
    conforms: true
    how: >-
      every record answers from the one injected connection and the write runs inside
      runInTransaction; nothing in the file opens, reads or writes anything but that one
      relational store.
    encoded_at:
      - src/persistence/relational-connector-configuration-store.repository.ts
  - node: domain/integration/connector-configuration
    conforms: true
    how: >-
      the row type's two columns are exactly the node's two attributes, and the write passes the
      configuration through as JSON object text without inspecting its keys, matching "Its shape
      is not fixed here."
    encoded_at:
      - src/persistence/relational-connector-configuration-store.repository.ts
  - node: domain/integration/connector-configuration-registry
    conforms: false
    how: >-
      the node states "hold the current configuration for each connector name as currently
      registered" — about the name being written — and says nothing about names that are not.
      The file's header comment, its class docstring and upsertStatementFor's own docstring all
      assert, three times, that "No write ever deletes a row: one write never touches, let alone
      removes, a row belonging to a different connector," citing only
      task/connector-configuration-write-upsert-hotfix — a task belonging to a closed plan. The
      identical fact for the sibling vocabulary was decided into
      rules/glossary/a-registered-concept-is-never-removed after a prior reconciliation found this
      same pattern in writeConcepts; the connector registry's permanence now lives in a comment
      where the glossary's lives in a node.
    observed_at:
      - src/persistence/relational-connector-configuration-store.repository.ts
notes: >-
  Judgment ran as four delegations, one per file, spawned together. read-concept.controller.ts's
  judge opened rules/glossary/a-glossary-read-by-an-unheld-name-is-refused as a candidate beyond
  the node set it was handed, to attribute a fact its own bound nodes (contracts/glossary/glossary-query,
  domain/glossary/concept, scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone)
  do not settle; that node was never bound to this file by any prior delivery, so nothing here
  closes an existing binding for it — the finding is recorded so it is not lost, and binding it
  is a future delivery's act, not this one's. Both agents reading files anchored under this
  target's nested `src/` directory initially received an absolute path from the caller missing
  that inner segment (e.g. `.../src/http/read-concept.controller.ts` instead of
  `.../src/src/http/read-concept.controller.ts`); each resolved the correct file itself from the
  target-relative path given and said so under `looked_past`, and confirmed which file it actually
  read. Three of the six unconformed nodes above converge on one fact — that a batch write to the
  glossary or the connector-configuration registry never removes an entry the batch does not name
  — decided once already for the glossary (rules/glossary/a-registered-concept-is-never-removed)
  and stated only in comments for the connector registry; a single specification change likely
  answers domain/integration/connector-configuration-registry, contracts/integration/connector-configuration-registry
  and constraints/the-domain-depends-on-no-infrastructure's shared finding at once, alongside the
  glossary-side misattribution findings, which are a second, unrelated fact about the same file.
---
