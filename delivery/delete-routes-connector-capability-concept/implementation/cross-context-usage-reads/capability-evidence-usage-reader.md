---
target: backend
title: Cross-module evidence-usage reader for capability identities
summary: A new port declared in the capability-registry module, answering whether any collected investigation
  evidence names a given capability (name, version), backed by a relational adapter built at the same
  composition point as the registry's existing cross-module reader.
task: sha256:d6577ab13f6eab57d8e40fdc1b772df8759ac1c07fe73e843dd8df99c7b71e26
run: run/cross-context-usage-reads-capability-evidence-usage-reader-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/capability-registry/evidence-usage-reader.port.ts
  effect: New port file declaring CapabilityIdentityForEvidenceUsageCheck (name+version identity) and
    IEvidenceUsageReader, whose isCapabilityNamedByEvidence(identity) answers whether collected evidence
    names that identity. No imports.
- path: src/persistence/relational-investigation-store.repository.ts
  effect: RelationalInvestigationStore gains isCapabilityNamedByEvidence(name, version), running one parameterized
    SELECT 1 ... LIMIT 1 against investigation_evidence's capability_name/capability_version columns.
- path: src/factories/investigation-store.factory.ts
  effect: New exported factory function createEvidenceUsageReader(connection), instantiating RelationalInvestigationStore
    and adapting its new method into an IEvidenceUsageReader.
- path: src/factories/build-app.factory.ts
  effect: composeResources now also calls createEvidenceUsageReader(connection) and exposes the result
    as evidenceUsageReader on ComposedResources.
criteria:
- criterion: The port takes a capability identity as name and version together, the composite identity
    a capability is registered at.
  met: true
  how: IEvidenceUsageReader.isCapabilityNamedByEvidence takes one CapabilityIdentityForEvidenceUsageCheck
    parameter carrying readonly name and version fields together.
- criterion: Given a stored evidence item recording that name and version as what produced it, the reader
    answers that the identity is named.
  met: true
  how: The SQL query matches capability_name = $1 AND capability_version = $2; a matching row makes the
    method return true.
- criterion: Given no stored evidence item recording that name and version, the reader answers that the
    identity is not named.
  met: true
  how: No matching row resolves to undefined, so the method returns false.
- criterion: Given a stored evidence item recording the same name at a different version, the reader answers
    that the queried identity is not named.
  met: true
  how: The WHERE clause requires both columns to match; a row whose version differs fails the predicate
    and is excluded.
- criterion: The port is declared in the capability-registry module and the adapter answering it reads
    the recorded evidence through the relational store that holds it, the capability-registry module importing
    no database driver to obtain the answer.
  met: true
  how: evidence-usage-reader.port.ts lives under capability-registry and imports nothing; the answering
    adapter is built in investigation-store.factory.ts against RelationalInvestigationStore, wired in
    build-app.factory.ts.
- criterion: The adapter is constructible from the same composition point that already builds the capability
    registry's other cross-module reader.
  met: true
  how: composeResources calls createEvidenceUsageReader(connection) beside where createConnectorConfigurationsReader(connection)
    already builds capability-registry's existing cross-module reader.
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
  how: The adapter's dedicated query reads exactly the two attributes evidence.md ties to which capability
    produced an observation — capability_name and capability_version — from the same investigation_evidence
    table this repository already uses.
- node: domain/integration/capability
  encoded_at:
  - src/capability-registry/evidence-usage-reader.port.ts
  how: CapabilityIdentityForEvidenceUsageCheck carries exactly capability.md's own composite identity
    — name and version.
- node: constraints/the-domain-depends-on-no-infrastructure
  encoded_at:
  - src/capability-registry/evidence-usage-reader.port.ts
  - src/factories/build-app.factory.ts
  - src/factories/investigation-store.factory.ts
  how: The capability-registry module holds only the interface and the identity type, with no import at
    all; the pg-touching implementation is confined to persistence, and the wiring lives in factories.
inferences:
- inferred: isCapabilityNamedByEvidence stays a method on the concrete RelationalInvestigationStore class
    only, and is not added to the IInvestigationStore domain port it implements.
  from: Existing test doubles implementing IInvestigationStore would fail typecheck if the interface widened,
    and fixing test files is outside this delegation's scope; the two reference readers' own factories
    already establish the precedent of instantiating the concrete relational class directly.
- inferred: The method name isCapabilityNamedByEvidence and the type name CapabilityIdentityForEvidenceUsageCheck.
  from: The task's own criteria language, and the two reference ports' own <Noun>For<Purpose> composite
    type naming convention; no node names either identifier.
- inferred: No default-to-empty stub constant is added for this reader in this task.
  from: The task's own Notes assign the consuming guard logic to task/capability-removal/remove-capability-operation,
    a separate task; no constructor parameter exists yet to default.
- inferred: evidenceUsageReader is exposed as a field on ComposedResources even though nothing yet reads
    it from that object.
  from: capabilitiesReader showed the same shape before its own consumer existed; criterion 6 asks only
    that the adapter be constructible from composeResources.
- inferred: The adapter's query is a targeted SELECT 1 ... LIMIT 1 against investigation_evidence rather
    than reading whole investigations to check membership.
  from: standards/backend-node-service.yaml's PER-02 (a listing reads through a dedicated query and never
    hydrates an aggregate to discard it).
preserved:
- IInvestigationStore's existing surface (write, read) and every test double implementing it, unchanged.
- The existing shape and behavior of createCapabilitiesReader, createConnectorConfigurationsReader, createCapabilityRegistry
  and createConnectorConfigurationRegistry.
- composeResources' existing returned fields and their construction order.
deferred:
- what: Wiring IEvidenceUsageReader into whatever service performs the capability-removal guard, and giving
    that consumer a default-to-empty-stub when none is supplied.
  why: The task's own Notes name task/capability-removal/remove-capability-operation as this reader's
    consumer.
---

## What it is
The missing read the capability removal's guard needs, mirroring this codebase's existing cross-module reader-port pattern (ICapabilitiesReader, IConnectorConfigurationsReader): a port declared in the consuming module, a relational adapter, wired through the same composition point.

## Notes
isCapabilityNamedByEvidence is added only to the concrete RelationalInvestigationStore class, not to the IInvestigationStore port it implements, to avoid breaking existing IInvestigationStore test doubles — matching the precedent the two reference readers already set.
