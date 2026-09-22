---
target: backend
title: GlossaryService.removeConcept, refused where anything still names the concept
summary: Adds the glossary's remove-concept operation and its own ConceptInUseError, refusing removal
  wherever a capability, evidence item, citation or hypothesis-revision's collects still names the concept,
  and reading all four exclusively through the injected concept usage reader port.
task: sha256:cdc5a9b47f8e0ecb61f3760d34387d09b4252426dfc6175875b781da006f406b
run: run/concept-removal-remove-concept-operation-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/errors/concept-in-use.error.ts
  effect: New file. Declares ConceptInUseError, a typed domain error carrying { concept, reference } context,
    where reference is the ConceptUsageReference (capability | evidence | citation | hypothesis-revision-collects)
    that caused the refusal; message text names which kind of reference blocked the removal.
- path: src/glossary/glossary.service.ts
  effect: 'GlossaryService now takes a third, defaulted constructor parameter conceptUsageReader (IConceptUsageReader,
    defaulting to a NO_CONCEPT_NAMED stub resolving { named: false }), and exposes removeConcept(name),
    which awaits conceptUsageReader.readConceptUsage(name), throws ConceptInUseError(name, reference)
    when it resolves named:true, and otherwise calls store.deleteConcept(name) unconditionally.'
criteria:
- criterion: Where nothing answers, records, cites or collects the name, this rule does not refuse the
    removal, and a subsequent read of the glossary by that name answers as the specification already states
    it answers for a name the glossary does not hold.
  met: true
  how: 'When readConceptUsage resolves { named: false } (the NO_CONCEPT_NAMED default, or a real reader
    finding none of the four), removeConcept falls through to store.deleteConcept(name) with no guard
    raised; the store no longer holds the name, so the existing readConcept(name) resolution — unchanged
    by this task — answers { held: false, name } exactly as it already does for any name the store does
    not hold.'
- criterion: Where a registered capability answers the concept, the operation refuses the removal.
  met: true
  how: 'readConceptUsage resolving { named: true, reference: ''capability'' } causes removeConcept to
    throw new ConceptInUseError(name, ''capability'') before any store call.'
- criterion: Where a collected evidence item names the concept, the operation refuses the removal.
  met: true
  how: 'the same guard throws ConceptInUseError(name, ''evidence'') when the reader resolves { named:
    true, reference: ''evidence'' }.'
- criterion: Where an evaluation citation names the concept and no collected evidence item names it, the
    operation refuses the removal.
  met: true
  how: 'the guard throws ConceptInUseError(name, ''citation'') when the reader resolves { named: true,
    reference: ''citation'' }; the ordering (evidence checked ahead of citation) is the reader port''s
    own resolution, already implemented at src/factories/concept-usage-reader.factory.ts, and removeConcept
    refuses uniformly on whichever single reference the port returns.'
- criterion: Where a hypothesis-revision's own collects lists the concept and no case version manifests
    that revision, the operation refuses the removal.
  met: true
  how: 'the guard throws ConceptInUseError(name, ''hypothesis-revision-collects'') when the reader resolves
    { named: true, reference: ''hypothesis-revision-collects'' }.'
- criterion: Where the operation refuses, the concept is still held in the glossary afterwards.
  met: true
  how: the throw statement sits strictly before the only mutating call, await this.store.deleteConcept(name);
    on every refusal branch that call is never reached, so the store's held concepts are untouched.
- criterion: Where the operation refuses, it does so before any delete statement is issued, so no database
    constraint violation reaches the caller in place of the refusal.
  met: true
  how: readConceptUsage is awaited and branched on first; store.deleteConcept is reached only in the single
    non-named branch, mirroring CapabilityRegistryService.removeCapability's own guard-then-delete ordering.
- criterion: The refusal is raised as a domain error of its own, distinct from every error already raised
    by registering a concept.
  met: true
  how: ConceptInUseError is a new class, distinct from ConceptDescriptionRequiredError (registerConcept's
    own error) and from DuplicateGlossaryNameError; the task's own Notes confirm the specification names
    this refusal's error ConceptInUseError, HTTP 409.
- criterion: The guard obtains all four answers through the concept usage reader port, the glossary reading
    no capability, case or investigation store directly.
  met: true
  how: GlossaryService's only new dependency is IConceptUsageReader; no capability, case or investigation
    store or port is imported into glossary.service.ts, and all four references are obtained through the
    single readConceptUsage(name) call.
nodes:
- node: contracts/glossary/glossary-authoring
  encoded_at:
  - src/glossary/glossary.service.ts
  how: implements the published remove-concept operation the contract names, as GlossaryService.removeConcept;
    register-concept's own removal-of-nothing-the-batch-omits behavior is unchanged and untouched by this
    task.
- node: domain/glossary/concept
  how: constrains the work rather than gaining a new fact from it — removeConcept identifies the concept
    solely by its published name attribute, the same identity registerConcept and readConcept already
    key on; no other attribute of the value object is read or altered by removal.
- node: rules/glossary/a-registered-concept-is-never-removed
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/errors/concept-in-use.error.ts
  how: encodes the removal half of the rule's statement — refused with a ConceptInUseError, distinguishing
    which of the rule's four load-bearing references caused the refusal, and never removed any other way
    since store.deleteConcept is reachable only through this one guarded method; the rule's registering
    half is the register-concept operation's, and its closing clause about the accepts declaration and
    the subject-type vocabulary is the store task's to carry, per this task's own Notes.
- node: constraints/the-domain-depends-on-no-infrastructure
  how: honored rather than encoded — the new constructor dependency is IConceptUsageReader, a port type
    declared inside the glossary module itself; glossary.service.ts imports no framework, driver or provider
    client, and no capability, case or investigation store directly.
- node: constraints/the-system-persists-to-one-relational-database
  how: honored rather than encoded — the only mutating call removeConcept makes is store.deleteConcept(name)
    through the existing IGlossaryStore port, whose one implementation is the relational store; this task
    adds no second persistence path.
inferences:
- inferred: 'ConceptInUseError''s context carries exactly { concept: string; reference: ConceptUsageReference
    }, reusing the ConceptUsageReference union already declared by concept-usage-reader.port.ts rather
    than redeclaring the four values.'
  from: the sibling shape of ConceptAlreadyAnsweredError and ManifestWouldHoldNoHypothesisError (both
    carry a narrow, task-specific context object), and the project's own reuse convention against redeclaring
    a union a port already exports.
- inferred: the new error file is named concept-in-use.error.ts and the class ConceptInUseError, kebab-case
    file for a PascalCase class suffixed .error.ts.
  from: every sibling in src/errors/ follows this <name>.error.ts / <Name>Error pairing.
- inferred: 'the defaulted third constructor parameter is named conceptUsageReader, defaulting to a module-level
    NO_CONCEPT_NAMED constant resolving { named: false }.'
  from: CapabilityRegistryService's own defaulted evidenceUsageReader parameter and its NO_CAPABILITY_NAMED_BY_EVIDENCE
    default in src/capability-registry/capability-registry.service.ts, the explicit sibling precedent
    this task's reference list names.
deferred:
- what: src/factories/glossary.factory.ts's createGlossary(connection) still constructs GlossaryService
    with only the store, so the defaulted NO_CONCEPT_NAMED reader is what production wires today even
    though src/factories/concept-usage-reader.factory.ts already builds a real IConceptUsageReader and
    build-app.factory.ts already composes it as resources.conceptUsageReader for other consumers.
  why: neither factory file is named in this task's reference list, wiring a service's dependencies is
    a factory's job rather than the service task's, and the sibling precedent (createCapabilityRegistry(connection,
    connectorConfigurationsReader) also never receives its own composed evidenceUsageReader) shows this
    wiring step is left to a later delivery in this codebase's existing pattern — most likely the remove-concept-route
    task that depends on this one.
---

## What it is
The glossary operation the published contract names, with the four refusal conditions its governing rule states.

## Notes
None.
