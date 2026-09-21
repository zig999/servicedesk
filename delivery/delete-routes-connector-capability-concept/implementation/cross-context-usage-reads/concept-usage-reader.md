---
target: backend
title: A concept-usage reader spanning capability, investigation and case data
summary: A zero-import glossary port and a cross-store adapter answering whether a registered capability,
  a collected evidence item, an evaluation citation or an unmanifested hypothesis-revision's own collects
  still names a given concept, reporting which kind it found.
task: sha256:7049079263e3b5ac9a49a7be79d0c94e82cd120a0deb6a1fd044e4efd71c0dd9
run: run/cross-context-usage-reads-concept-usage-reader-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/glossary/concept-usage-reader.port.ts
  effect: New port declaring IConceptUsageReader, ConceptUsageResolution and ConceptUsageReference; no
    import statement at all.
- path: src/factories/concept-usage-reader.factory.ts
  effect: 'New factory exposing createConceptUsageReader(connection, capabilityQuery), checking in order:
    capability answers it, evidence names it, citation names it, unmanifested hypothesis-revision collects
    it, or none.'
- path: src/persistence/relational-investigation-store.repository.ts
  effect: Adds isConceptNamedByEvidence(concept) against investigation_evidence and isConceptNamedByCitation(concept)
    against investigation_evaluation_citations.
- path: src/persistence/relational-case-store.repository.ts
  effect: Adds isConceptCollectedByUnmanifestedHypothesisRevision(concept), finding a hypothesis_revision_collects
    row for the concept whose (case_slug, hypothesis_name, revision) has no matching case_version_hypotheses
    row.
- path: src/factories/build-app.factory.ts
  effect: Imports and wires createConceptUsageReader(connection, capabilityRegistry), adding conceptUsageReader
    to ComposedResources beside evidenceUsageReader/capabilitiesReader.
criteria:
- criterion: Given a registered capability whose own concept is the queried name, the reader answers that
    the concept is named.
  met: true
  how: resolveConceptUsage calls the injected ICapabilityQuery's readCapability(concept) first; a held
    resolution answers { named:true, reference:'capability' }.
- criterion: Given a stored evidence item recording the queried concept, the reader answers that the concept
    is named.
  met: true
  how: isConceptNamedByEvidence, a parameterized existence check against investigation_evidence.concept,
    answers { named:true, reference:'evidence' }.
- criterion: Given a stored evaluation citation recording the queried concept and no stored evidence item
    recording it, the reader answers that the concept is named.
  met: true
  how: The citation check only runs once the evidence check has already answered false, so it necessarily
    answers this exact precondition.
- criterion: Given a hypothesis-revision whose own collects lists the queried concept and which no case
    version manifests, the reader answers that the concept is named.
  met: true
  how: isConceptCollectedByUnmanifestedHypothesisRevision selects a hypothesis_revision_collects row with
    no NOT EXISTS match in case_version_hypotheses.
- criterion: Given nothing that answers, records, cites or collects the queried name, the reader answers
    that the concept is not named.
  met: true
  how: resolveConceptUsage falls through to { named:false } only once all four checks have each answered
    negatively.
- criterion: The reader reports which of the four kinds of reference it found, so a caller can refuse
    for a stated reason rather than for an unexplained one.
  met: true
  how: ConceptUsageResolution's positive branch carries a reference field typed as the ConceptUsageReference
    union, named for exactly the check that answered.
- criterion: The port is declared in the glossary module and the glossary module imports no database driver
    to obtain the answer.
  met: true
  how: concept-usage-reader.port.ts lives under glossary and holds no import statement at all; every concrete
    database access lives in the factory-built adapter.
- criterion: The adapter is constructible from the same composition point that already builds the other
    cross-module readers.
  met: true
  how: composeResources calls createConceptUsageReader(connection, capabilityRegistry) directly beside
    createCapabilitiesReader and createEvidenceUsageReader.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/factories/concept-usage-reader.factory.ts
  how: The capability's own concept is read through the already-existing ICapabilityQuery.readCapability(concept);
    this task adds no new attribute, only a first-checked reference kind.
- node: domain/investigation/evidence
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  - src/factories/concept-usage-reader.factory.ts
  how: isConceptNamedByEvidence reads evidence's own concept attribute to answer whether a collected item
    names the queried concept.
- node: domain/investigation/citation
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  - src/factories/concept-usage-reader.factory.ts
  how: isConceptNamedByCitation reads a citation's own concept attribute, checked only once no evidence
    item already answered it.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/persistence/relational-case-store.repository.ts
  - src/factories/concept-usage-reader.factory.ts
  how: isConceptCollectedByUnmanifestedHypothesisRevision reads a hypothesis-revision's own collects for
    the queried concept, holding manifestation status by requiring no case_version_hypotheses row for
    that exact identity.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/glossary/concept-usage-reader.port.ts
  - src/factories/concept-usage-reader.factory.ts
  how: The port file carries zero imports; every concrete relational access is confined to the factory
    and the persistence classes it constructs, never to a file under glossary.
inferences:
- inferred: The four query method names and the port's method name (readConceptUsage) returning a resolution
    object rather than a boolean.
  from: The sibling isCapabilityNamedByEvidence naming style for the query methods, and the read<Thing>/<Thing>Resolution
    pairing already used by glossary-query.port.ts and capability-query.port.ts for the port's own method.
- inferred: The 'hypothesis-revision-collects' literal naming the fourth ConceptUsageReference.
  from: The hypothesis-revision domain node's own attribute name 'collects' and the governing rule's own
    phrase.
- inferred: A fixed check order (capability, then evidence, then citation, then collects).
  from: rules/glossary/a-registered-concept-is-never-removed states the four conditions disjunctively
    with no ranking; a stable order was needed to return exactly one reference per criterion 6, chosen
    in the order the rule's own sentence lists them.
- inferred: createConceptUsageReader takes an already-built ICapabilityQuery as a parameter instead of
    constructing its own RelationalCapabilityStore.
  from: ARC-02 (instantiation happens only inside a factory function, not duplicated across two) and composeResources'
    own existing reuse of capabilityRegistry as capabilityQuery.
divergences:
- from: 'DOM-02 (a public signature of a domain module uses a value object or enumeration for a concept
    with a constraint, never a bare primitive) — noted in prose rather than cited, since this file''s
    path does not resolve under that rule''s declared scope segments'
  departure: readConceptUsage(concept) takes concept as a bare string rather than a value object or enumeration
    for the glossary's concept identity.
  why: Every existing glossary and capability-registry port already names a concept this way; this reader
    calls straight into readCapability(concept), so a new value-object type here would still have to unwrap
    to that same string at the call site. The departure mirrors sibling ports already standing uncorrected.
preserved:
- RelationalInvestigationStore.isCapabilityNamedByEvidence and its query shape, untouched.
- Every existing RelationalCaseStore operation, untouched.
- build-app.factory.ts's existing ComposedResources fields and composeResources wiring for capabilitiesReader,
  evidenceUsageReader, glossaryQuery, capabilityQuery and every downstream dependency group.
deferred:
- what: Wiring conceptUsageReader into a remove-concept operation's guard.
  why: rules/glossary/a-registered-concept-is-never-removed is implemented by task/concept-removal/remove-concept-operation,
    this reader's own stated consumer.
---

## What it is
The missing read the concept removal's guard needs, covering all four references the rule names in one port, spanning the capability, investigation and case stores without the glossary module importing any of them directly.

## Notes
The check order (capability, evidence, citation, collects) is a deliberate choice this task made — the rule states no ranking, and the order matches the rule's own sentence.
The first two build attempts (run/cross-context-usage-reads-concept-usage-reader-build, -build-2) failed with a database connection timeout unrelated to this task's code (typecheck/lint/secret-scan passed both times); the failure was a transient VPN/network outage to the lab Postgres instance, confirmed by a raw TCP connectivity check. The third attempt, after connectivity was restored, passed.
