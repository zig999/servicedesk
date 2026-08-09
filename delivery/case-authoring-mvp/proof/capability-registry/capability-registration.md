---
title: Proof for capability registration
summary: What proves task/capability-registry/capability-registration — the registry's refusals, the sixty-second default held as 60000 milliseconds, the plain-JSON persistence, and the exclusions the task's two UNDERDETERMINED notes require.
implementation: sha256:26e676cc01d244ea1b67d653c1bc158d1af73d3dd43676603c5e7676b6323b5d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/capability-registry-capability-registration-suite
tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose nature is mutating
    proves: "A registration whose nature is not read-only is refused."
    fails_when: register-capability accepts a mutating nature, or the refusal stops being CapabilityNotReadOnlyError carrying the refused nature
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose nature is outside the capability-nature vocabulary
    proves: "A registration whose nature is not read-only is refused. — not-read-only reaches every other nature, not only mutating"
    fails_when: a nature the vocabulary does not hold registers instead of being refused
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration
    proves: "A registration whose nature is not read-only is refused. — refused means not held: the refusal precedes any write"
    fails_when: a refused registration reaches the store, altering or dropping what the registry already held
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration that declares no input schema, naming the attribute
    proves: "A registration missing its input schema, its output schema or its connector is refused."
    fails_when: a registration without input_schema registers, or the refusal stops naming the undeclared attribute
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration that declares no output schema, naming the attribute
    proves: "A registration missing its input schema, its output schema or its connector is refused."
    fails_when: a registration without output_schema registers, or the refusal stops naming the undeclared attribute
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration that declares no connector, naming the attribute
    proves: "A registration missing its input schema, its output schema or its connector is refused."
    fails_when: a registration without connector registers, or the refusal stops naming the undeclared attribute
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration that declares no name
    proves: the task's first UNDERDETERMINED note — name is required by the specification while no criterion refuses its omission; this test fails over exactly the implementation the note names
    fails_when: the registry accepts a registration stating no name
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration that declares no version
    proves: the task's first UNDERDETERMINED note — version is required by the specification while no criterion refuses its omission
    fails_when: the registry accepts a registration stating no version
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration that declares no concept
    proves: the implementation's inference that a registration declares the concept its capability answers, so the choice is stated rather than silent
    fails_when: the registry accepts a registration stating no concept
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses an empty registration naming every required attribute
    proves: the implementation record's claim that the contract refusal names every undeclared required attribute, over the absent-input edge case
    fails_when: an empty registration registers, or the refusal reports fewer than all seven required attributes
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: treats an attribute declared as the empty string as undeclared
    proves: the implementation's inference that an empty attribute declares nothing — absent and empty alike are refused
    fails_when: an empty-string attribute passes as declared
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: holds the default of sixty seconds, as 60000 milliseconds, for a registration that states no timeout
    proves: "A registration that states no timeout takes the default of sixty seconds. — asserted in the specification's unit, milliseconds, per the task's advisory; the value 60000 is spelled in the test rather than imported"
    fails_when: an unstated timeout stops defaulting to 60000, or defaults in some other unit
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: passes a stated timeout through unchanged
    proves: "A registration that states no timeout takes the default of sixty seconds. — the boundary: the default reaches only a registration that states none"
    fails_when: a stated timeout is overwritten by the default or otherwise altered
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a stated timeout that is not an integer count of milliseconds
    proves: the implementation's reading of the timeout as an integer count of milliseconds, pinned as a stated choice
    fails_when: a fractional timeout registers instead of being refused as a contract departure
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: accepts a complete read-only contract and answers the capability as registered
    proves: "A registration with a complete read-only contract is not refused by these rules."
    fails_when: a complete read-only registration is refused, or the answered capability departs from what was submitted
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: persists an accepted registration through the store
    proves: "A registration with a complete read-only contract is not refused by these rules. — accepted means held: the registration reaches the store"
    fails_when: register-capability answers without writing what it accepted
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: replaces the held record when a held name and version register again
    proves: the implementation's inference that a re-registration under an already-held name and version replaces the record it holds
    fails_when: a re-registration duplicates the record or leaves the old one in place
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: holds two versions of one capability name as two registrations
    proves: the other half of the same inference — identity is name and version together
    fails_when: a new version replaces or refuses over a held record that shares only the name
  - file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
    name: persists written registrations as a plain JSON file named capability.json
    proves: "Registrations persist as plain JSON files and the dependency manifest declares no database driver. — the JSON half; the driver-free half stands proven by the pre-existing dependency-manifest audit"
    fails_when: the adapter stops writing capability.json, or what it writes stops parsing as the registered records
  - file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
    name: answers written registrations back exactly as persisted
    proves: the persisted file is what the registry reads back
    fails_when: a round trip through the file alters, drops or reorders a record
  - file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
    name: answers an absent capability file as the empty registry
    proves: the implementation's inference that an absent file reads as the empty registry
    fails_when: a fresh directory raises instead of answering the empty registry
  - file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
    name: creates the data directory on the first write
    proves: the first write against a directory that does not yet exist succeeds
    fails_when: writing into an uncreated data directory raises
  - file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
    name: replaces the persisted registrations whole on the next write
    proves: the store port's promise that writeCapabilities replaces the persisted registrations whole
    fails_when: a second write appends to or merges with what the file already held
  - file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
    name: refuses a capability file that does not hold valid JSON
    proves: the failing-dependency edge — unparseable content answers as the module's typed CapabilityStoreError
    fails_when: unparseable content answers as data, or the raw parse error escapes untyped
  - file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
    name: refuses a capability file whose content is not the promised records
    proves: a file departing from the records the port promises is refused rather than answered
    fails_when: records missing required attributes flow through the port as capabilities
  - file: src/__tests__/integration/persistence/file-capability-store.repository.spec.ts
    name: refuses a capability file whose timeout is not an integer count of milliseconds
    proves: the milliseconds-integer reading of the timeout, held at the persistence boundary too
    fails_when: a persisted fractional timeout reads back as a capability
  - file: src/__tests__/integration/factories/capability-registry.factory.spec.ts
    name: persists a registered capability as a plain JSON file under the data directory
    proves: "Registrations persist as plain JSON files and the dependency manifest declares no database driver. — the JSON half through the module's real wiring"
    fails_when: the wired module stops landing an accepted registration in capability.json under the caller's data directory
  - file: src/__tests__/integration/factories/capability-registry.factory.spec.ts
    name: replaces the persisted record when the same name and version register again through the real wiring
    proves: the re-registration inference reaches the file — the replacement lands in what persists
    fails_when: a re-registration leaves two records for one name and version in the persisted file
  - file: src/__tests__/unit/capability-registry/no-network-persistence.spec.ts
    name: the registration path reaches no service over the network — persistence is the filesystem alone
    proves: the task's second UNDERDETERMINED note — criterion 5 as written admits a database reached without a driver, over HTTP; this audit fails over exactly that implementation
    fails_when: any module under capability-registry/, persistence/ or factories/ imports a network module or client package, or uses fetch, WebSocket or XMLHttpRequest
not_applicable:
  - edge_case: a boundary at each end of a stated range
    why: no bound node states a minimum or a maximum for the timeout — only that it is an integer count of milliseconds, which is tested
  - edge_case: two registrations against one registry at once
    why: no bound node states concurrent behavior over the registry, and a test would assert a guarantee nobody made
  - edge_case: a dependency that answers slowly
    why: the timeout attribute budgets the capability's own execution inside the collection's deadline, not the store's read; no bound node states latency behavior for the registry's persistence
untested:
  - the manifest half of criterion 5 is proven by the pre-existing dependency-manifest audit written for the glossary task; a duplicate would pin the same fact twice
  - the store's unreadable-file failure other than absence needs permission manipulation the suite does not do; the not-JSON and wrong-shape refusals are proven instead
  - the no-network audit reads source text statically — a network reach assembled at runtime, or hidden behind a module outside the three audited directories, would evade it
  - the fitness half of constraints/the-mvp-persists-to-no-database — that the deployment provisions no database — is a fact about deployment artifacts, not this source tree
  - how a refusal answers over a transport — the published contract was deliberately left out of the task's implements, so the tests assert the typed errors only
  - the glossary store's rearrangement onto json-file.ts gets no new behavioral test on purpose — the pre-existing glossary store integration spec covers what moved, and a test written beside the rearrangement would pin the new shape instead of the old behavior
divergences:
  - cites: TST-04
    file: src/__tests__/unit/capability-registry/no-network-persistence.spec.ts
    departure: the file mirrors no single unit's path — its subject is every module of the registration path, across three directories.
    why: the second UNDERDETERMINED note names an implementation no single unit exhibits, so the test that excludes it cannot sit at one unit's mirrored path; the tree already holds audit specs of this shape
---
## What it is
Twenty-nine tests over four files: the registry's refusals and defaults as pure units against a fake store, the file adapter and the real wiring against the filesystem, and the no-network audit that excludes the database-without-a-driver implementation the second UNDERDETERMINED note names.

## Notes
The two UNDERDETERMINED notes are each excluded by a dedicated test: the missing name and version refusals, and the no-network audit.
The timeout default is asserted as 60000 with the value spelled in the test, so a drifted constant fails; the criterion's sixty seconds is the same duration in the specification's milliseconds.
