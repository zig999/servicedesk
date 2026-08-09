---
title: Capability resolution as the published one-to-one read over the registry
summary: read-capability resolves a concept to the one capability currently answering it, whole and as currently registered, reporting an unanswered concept as data — and the registry now guarantees the one-to-one by refusing, before any write, a registration whose concept a different capability identity already answers.
task: sha256:969565b7637b42ea5affbbfb30fcebf42739ffd108053f2733e604281197623b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/capability-registry-capability-resolution-build
files:
  - path: src/capability-registry/capability-query.port.ts
    effect: the published capability-registry contract — ICapabilityQuery with read-capability, and the CapabilityResolution variants stating the held capability whole or the absence as data naming the concept that was asked
  - path: src/capability-registry/capability-registry.service.ts
    effect: now provides the published contract — readCapability filters the current holding by concept, answers zero as absence and one whole, and refuses a holding answering one concept more than once rather than choosing among the answers; registerCapability additionally refuses, before any write, a registration naming a concept a different name-and-version identity already answers, while a re-registration under its own held identity still replaces its record
  - path: src/errors/concept-already-answered.error.ts
    effect: the typed business error the registry refuses a second capability identity for an already-answered concept with, carrying the concept and both identities in context
  - path: src/errors/duplicate-concept-answer.error.ts
    effect: the typed business error the resolution refuses a holding answering one concept with more than one capability with, carrying the concept and every answering identity in context
  - path: src/factories/capability-registry.factory.ts
    effect: additionally wires the published contract — createCapabilityQuery hands a consumer ICapabilityQuery alone over the same file-backed holding, mirroring createGlossaryQuery
criteria:
  - criterion: Reading a concept one capability answers returns that capability with its name, version, nature, both schemas, timeout and connector.
    met: true
    how: readCapability answers the held variant with the record exactly as the store holds it — the Capability type carries all seven declared attributes plus the concept it answers, nothing projected away and nothing recomputed
  - criterion: Reading a concept no capability currently answers reports the absence rather than an invented capability.
    met: true
    how: zero answers yield the held-false variant naming what was asked — data, never a default, never an error and never a fabricated record; the form is the tree's resolution-variant convention, recorded as an inference since no node states it
  - criterion: No concept ever resolves to more than one capability.
    met: true
    how: three guards, none of them a chain — registerCapability refuses a registration whose concept a different identity already answers before any write, a re-registration under its own name and version replaces rather than duplicates, and a holding hand-edited into two answers is refused at read rather than resolved by any ordering, so no priority, head or fallback exists anywhere in the lookup
  - criterion: A read after a registration changes answers the registration as it stands, never a remembered one.
    met: true
    how: the service keeps no cache and holds no state beyond the store port — every readCapability call reads the holding through the store, and FileCapabilityStore reads capability.json on each call, so a read after registerCapability answers what was just written
nodes:
  - node: domain/integration/capability
    encoded_at:
      - src/capability-registry/capability-query.port.ts
    how: the resolution answers the capability whole — the seven attributes the node declares, the timeout an integer count of milliseconds — by carrying the module's existing Capability type through CapabilityResolution; identity by name and version is what the one-to-one refusal compares
  - node: domain/integration/capability-nature
    how: honored, not newly encoded — the resolution returns the nature as one of the enumeration's two values through the Capability type; the enumeration itself stays encoded by the registration task, and nothing here adds to or refuses natures
  - node: domain/integration/capability-registry
    encoded_at:
      - src/capability-registry/capability-registry.service.ts
      - src/capability-registry/capability-query.port.ts
    how: resolve-concept now exists as readCapability — the one lookup from a concept to the capability that answers it, one to one, with no fallback chain — and register-capability upholds exactly-one-as-currently-registered by refusing a second answering identity before any write
  - node: contracts/integration/capability-registry
    encoded_at:
      - src/capability-registry/capability-query.port.ts
      - src/capability-registry/capability-registry.service.ts
      - src/factories/capability-registry.factory.ts
    how: the published synchronous read is ICapabilityQuery.readCapability, answering the capability currently answering a concept with its declared contract; the service provides it and the factory narrows to it, so a consumer holds the contract alone
  - node: rules/integration/one-capability-answers-one-concept
    encoded_at:
      - src/capability-registry/capability-registry.service.ts
      - src/errors/concept-already-answered.error.ts
      - src/errors/duplicate-concept-answer.error.ts
    how: the policy is imposed by the registry rather than by discipline — at registration a concept answered by a different identity is refused before the write, and at resolution a holding answering one concept twice is refused rather than ordered, so no fallback chain exists until the specification admits a second source
  - node: constraints/the-mvp-persists-to-no-database
    how: honored, not newly encoded — the resolution reaches disk only through the existing store port to the same plain capability.json; this delivery adds no dependency, touches no manifest, and opens nothing but that file
inferences:
  - inferred: an unanswered concept is reported as a typed resolution variant — held false, naming the concept — data rather than an error or a named refusal
    from: the task's advisory that no node states the form of the absence report, plus the convention the tree evidences in the glossary-query port
  - inferred: the one-to-one rule is enforced at registration — a registration naming a concept a different name-and-version identity already answers is refused before any write, while a re-registration under its own held identity may keep or change its concept
    from: the rule's each-concept-resolves-to-exactly-one together with the registry node's as-currently-registered responsibility, and the sibling registration record's deferral of exactly this refusal to this task
  - inferred: a holding that already answers one concept with more than one capability — possible only outside the service, the store being a hand-editable plain JSON file — is refused at resolution through a typed error rather than answered by picking any of them
    from: the task's UNDERDETERMINED note refusing fallback machinery — answering the head of any ordering would ship the priority chain the specification refuses — and the glossary convention of refusing a duplicated holding on read
  - inferred: the published contract is encoded as ICapabilityQuery with the factory narrowing through createCapabilityQuery, named for the sibling pattern rather than for the contract node
    from: the naming the tree evidences in the glossary module; the contract node names the operation read-capability, which the method keeps
divergences:
  - cites: COR-02
    file: src/capability-registry/capability-registry.service.ts
    departure: the two typed errors this task raises carry a name, a message and a context field, but no status.
    why: this tree serves no transport yet and holds no status map — COR-04 puts each error's status in one place when a transport arrives — and every existing error in the tree carries none
preserved:
  - registerCapability's existing refusals unchanged — a non-read-only nature and an incompletely declared contract are refused exactly as before, before any read or write
  - a registration stating no timeout still takes the 60000-millisecond default
  - a re-registration under an already-held name and version still replaces the held record, including when it keeps its concept
  - a complete read-only registration for a concept nothing else answers still registers and is answered as held — the new refusal reaches only a concept a different identity already answers
  - FileCapabilityStore's read and write behavior and the capability.json record shape are untouched
  - the glossary module, the store ports, capability.ts and package.json are untouched — nothing installed, the manifest still declares no database driver
deferred:
  - what: the consumed contracts/knowledge/capability-check seam — case validation consuming this read.
    why: it belongs to task/case-model/case-coherence-validation, which depends on this task
---
## What it is
The resolution half of the registry: the published read answering each concept's one capability whole and current, with the one-to-one guaranteed twice — refused at registration before a second identity can answer, and refused at read where a hand-edited holding already does.
No ordering exists anywhere for a fallback chain to hide in.

## Notes
The one-to-one enforcement point is the record's main inference, disclosed: the rule and the registry's responsibility read together place the refusal at registration, which is exactly the refusal the sibling registration task's REMAINDER deferred here.
The duplicate-holding refusal at read exists because the store is a hand-editable plain file — picking any answer would ship the priority the specification cut.
COR-02 departed from once more, same reason as every delivery: no transport exists for a status to mean anything.
