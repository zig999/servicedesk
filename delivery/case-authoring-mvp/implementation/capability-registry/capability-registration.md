---
title: Capability registration with a held read-only contract over plain JSON files
summary: register-capability refuses any registration whose nature is not read-only or whose declared contract is incomplete, defaults an unstated timeout to 60000 milliseconds, and persists every held registration as a plain JSON file behind a store port.
task: sha256:d1f104a74e9d9f4a2725b1810a8426c2330c3e7291df24198d9b55e3822fde9b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/capability-registry-capability-registration-build
files:
  - path: src/capability-registry/capability.ts
    effect: declares the capability element's attributes as pure values — the two-value nature enumeration, the held Capability shape, the all-optional CapabilityRegistration submission shape, the 60000-millisecond default timeout and the list of attributes a registration must declare
  - path: src/capability-registry/capability-store.port.ts
    effect: the ICapabilityStore port the domain declares and infrastructure implements, so no registry module opens a file
  - path: src/capability-registry/capability-registry.service.ts
    effect: register-capability — refuses an incomplete contract and a non-read-only nature before any write, defaults an unstated timeout, replaces a re-registration under an already-held name and version, and answers the capability as held
  - path: src/errors/capability-not-read-only.error.ts
    effect: the typed business error the registry refuses a non-read-only registration with, carrying the stated nature in context
  - path: src/errors/incomplete-capability-contract.error.ts
    effect: the typed business error the registry refuses an incompletely declared contract with, naming each problem in context
  - path: src/errors/capability-store.error.ts
    effect: the typed data error of the capability file store — an unreadable file, non-JSON content, or records the port does not promise
  - path: src/persistence/json-file.ts
    effect: the shared plain-JSON-file handling — read-or-absent with each store's own typed error raised through a callback, and the create-directory-and-write — existing once so both file stores call it
  - path: src/persistence/file-glossary-store.repository.ts
    effect: unchanged behavior, now calling the shared json-file helper instead of holding private copies of the same file handling — same error types, messages, context and file shapes as before
  - path: src/persistence/file-capability-store.repository.ts
    effect: the file-backed adapter of the registry's store port — every registration in one plain capability.json under a caller-chosen directory, an absent file reading as the empty registry, records held to the element's declared attributes on read
  - path: src/factories/capability-registry.factory.ts
    effect: wires the registry module — the file-backed store behind the domain's port, the data directory the caller's to choose
criteria:
  - criterion: A registration whose nature is not read-only is refused.
    met: true
    how: heldCapability in capability-registry.service.ts throws CapabilityNotReadOnlyError before any read or write when the declared nature is not read-only — mutating and any value outside the enumeration alike, since the rule's condition is not-read-only rather than membership
  - criterion: A registration missing its input schema, its output schema or its connector is refused.
    met: true
    how: refuseContractDepartures collects every undeclared required attribute — absent and empty alike — and throws IncompleteCapabilityContractError naming each; name, version and concept are among the required attributes though no criterion names them, per the task's first UNDERDETERMINED note
  - criterion: A registration that states no timeout takes the default of sixty seconds.
    met: true
    how: heldCapability holds registration.timeout ?? DEFAULT_CAPABILITY_TIMEOUT_MS, and the constant is 60000 — the criterion states the default in seconds while the specification declares the timeout attribute in milliseconds, so the encoded value is the specification's unit and the constant's comment carries the mapping
  - criterion: A registration with a complete read-only contract is not refused by these rules.
    met: true
    how: a registration declaring name, version, a read-only nature, both schemas, its connector and the concept it answers passes both refusals, is persisted whole and answered as held
  - criterion: Registrations persist as plain JSON files and the dependency manifest declares no database driver.
    met: true
    how: FileCapabilityStore lands every held registration in capability.json as plain JSON through node:fs, and package.json is untouched — no database driver is declared, this delivery installed nothing, and per the task's second UNDERDETERMINED note no module opens a network connection of any kind
nodes:
  - node: domain/integration/capability
    encoded_at:
      - src/capability-registry/capability.ts
      - src/capability-registry/capability-registry.service.ts
      - src/persistence/file-capability-store.repository.ts
    how: the seven declared attributes are the Capability type and the persisted record schema, spelled exactly as the node spells them; every required attribute is held at registration, and identity by name and version decides which held record a re-registration replaces; the timeout is an integer count of milliseconds in both the type and the read schema
  - node: domain/integration/capability-nature
    encoded_at:
      - src/capability-registry/capability.ts
    how: CAPABILITY_NATURES declares exactly the enumeration's two values, read-only and mutating, single-sourced — the service's refusal and the file schema's enum both derive from it, so mutating exists precisely as the value the registry refuses
  - node: domain/integration/capability-registry
    encoded_at:
      - src/capability-registry/capability-registry.service.ts
    how: register-capability is implemented with the responsibility's refusals raised before any write; resolve-concept is not reached, being the sibling task's per this task's own cut, and each registration names the concept it answers so the one lookup from a concept to its capability has its key persisted
  - node: rules/integration/a-capability-is-read-only
    encoded_at:
      - src/capability-registry/capability-registry.service.ts
      - src/errors/capability-not-read-only.error.ts
    how: the refusal is imposed by the registry rather than by discipline — any nature that is not read-only throws before anything is persisted
  - node: rules/integration/a-capability-declares-its-contract
    encoded_at:
      - src/capability-registry/capability-registry.service.ts
      - src/capability-registry/capability.ts
      - src/errors/incomplete-capability-contract.error.ts
    how: a registration lacking its input schema, output schema, connector or any other required attribute is refused, and one that states no timeout takes DEFAULT_CAPABILITY_TIMEOUT_MS — the rule's sixty seconds in the element's milliseconds
  - node: constraints/the-mvp-persists-to-no-database
    encoded_at:
      - src/persistence/file-capability-store.repository.ts
      - src/persistence/json-file.ts
    how: everything this task records lands as one plain JSON file through node:fs; no database is reached by any means, and the constraint's system-scoped clause is answered for registrations only, as the task's note bounds it
inferences:
  - inferred: a registration states the concept it answers as a required concept attribute, persisted with the record, and a registration naming none is refused with the other undeclared attributes
    from: domain/integration/capability-registry is the one lookup from a concept to the capability that answers it, so the link must be stated at registration for the lookup to hold a key, while the task's advisory records that no node states where the link lives
  - inferred: an attribute present but empty is refused as undeclared, the same as an absent one
    from: the capability's responsibility to declare its contract completely — an empty schema or connector declares nothing
  - inferred: a re-registration under an already-held name and version replaces the held record rather than duplicating it or being refused
    from: the node identifies a capability by name and version — one identity cannot be held as two records — and the registry resolves against capabilities as currently registered
  - inferred: a nature outside the two-value enumeration is refused through the same not-read-only refusal rather than a distinct invalid-value refusal
    from: the rule conditions on the nature not being read-only, which already covers every value outside the enumeration
  - inferred: a stated timeout that is not an integer is refused through the contract refusal
    from: the node types the timeout as an integer count of milliseconds, and persisting a non-integer would write a record the store's own read schema refuses to read back
  - inferred: all registrations persist in one capability.json holding an array of records, an absent file reading as the empty registry
    from: the convention the existing file-glossary-store evidences — plain JSON files, absent file as empty holding, directory chosen by the factory's caller
  - inferred: input_schema and output_schema keep the specification's snake_case spelling in the domain type and the persisted record
    from: the node's own attribute declarations, so the persisted record and the specification read the same
divergences:
  - cites: COR-02
    file: src/capability-registry/capability-registry.service.ts
    departure: the typed errors the service raises carry a name, a message and a context field, but no status.
    why: this tree serves no transport yet and holds no status map — COR-04 puts each error's status in one place when a transport arrives — and the project's existing errors carry none
  - cites: COR-02
    file: src/persistence/file-capability-store.repository.ts
    departure: CapabilityStoreError carries a name, a message and a context field, but no status.
    why: the same reason, consistent with GlossaryStoreError beside it — the mapping belongs to the one place COR-04 names once a transport exists
preserved:
  - FileGlossaryStore's read and write behavior is unchanged through the json-file refactor — same error types, messages, context and file shapes, which its existing unit and integration tests exercise
  - GlossaryService, its two ports, terms.ts and glossary.factory.ts untouched
  - package.json untouched — no dependency added or removed, so the manifest stays free of any database driver
deferred:
  - what: the registry's resolve-concept operation and rules/integration/one-capability-answers-one-concept, so registration does not yet refuse a second capability answering an already-answered concept.
    why: the task's own REMAINDER note assigns that rule to the epic's resolution task, and this task's cut is the refusing half alone
  - what: contracts/integration/capability-registry, the published read-capability contract.
    why: the task's advisory leaves it out of implements — it neighbors the resolution half this task does not reach
  - what: eslint encodings for the ARC-02/ARC-03 layout rules now that .service.ts and factory files exist for them to scope to.
    why: extending the lint configuration is not among this task's criteria or produces, and widening into it would change what every other module is held to
---
## What it is
The refusing half of the registry: nature, both schemas, timeout, connector — and name, version and concept, which the specification requires though no criterion names them — held to the declared contract before anything is persisted, with every held registration in one plain JSON file behind a port.
The shared json-file helper now serves both stores, so the file handling exists once.

## Notes
The concept attribute is the record's one structural inference: the registry is the one lookup from concept to capability, no node states where that link lives, and a registration that names no concept is refused with the other absences — disclosed for the review and for the analysis that may give the link a home in the specification.
The timeout default is 60000 because the specification's unit is milliseconds; the criterion's sixty seconds is the same duration, and the constant's comment carries the mapping.
COR-02 is departed from twice and disclosed, as in every delivery so far: no transport exists for a status to mean anything.
