---
target: backend
title: Evidence-usage reader for capability identities — proof
summary: Six criteria and one file-level import boundary are each protected by a dedicated test against
  the real investigation_evidence table and the exported factory function; the three cited nodes' own
  whole facts remain unproven by this task's narrow reads and are reported as such.
implementation: sha256:039ee0b773b75e0074e3b4629b9a6f46a481bfab8376f5b7158ddeb153ba5b03
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/cross-context-usage-reads-capability-evidence-usage-reader-suite
tests:
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: answers true from isCapabilityNamedByEvidence when a stored evidence item names that exact capability
    name and version as what produced it
  proves: Criterion 2 — a stored evidence item recording the queried (name, version) makes the reader
    answer that the identity is named.
  fails_when: isCapabilityNamedByEvidence answers false, throws, or resolves to anything other than true
    for a capability name and version an investigation was just written with real evidence citing.
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: answers false from isCapabilityNamedByEvidence when no stored evidence item names the given capability
    name and version at all
  proves: Criterion 3 — with no stored evidence item recording the queried identity, the reader answers
    that it is not named.
  fails_when: isCapabilityNamedByEvidence answers true (or throws) for a capability name and version no
    evidence row anywhere in the real table cites.
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  name: answers false from isCapabilityNamedByEvidence when the only stored evidence item names the same
    capability name at a different version
  proves: Criterion 4 — a stored evidence item recording the same name at a different version still answers
    that the queried identity is not named.
  fails_when: isCapabilityNamedByEvidence answers true for a version string the stored evidence item does
    not carry.
- file: src/__tests__/unit/factories/investigation-store.factory.spec.ts
  name: forwards a composite identity's own name and version, in that order, as the underlying query's
    own parameters, and answers true when a row comes back
  proves: Criterion 1 (the port takes name and version together as one composite identity) and the constructible
    half of criterion 6.
  fails_when: the identity's name and version are forwarded out of order, forwarded to the wrong parameter,
    dropped, or createEvidenceUsageReader no longer builds a working IEvidenceUsageReader from a bare
    connection.
- file: src/__tests__/unit/capability-registry/evidence-usage-reader.port.spec.ts
  name: declares IEvidenceUsageReader and its composite capability identity with no import statement at
    all, so the capability-registry module reaches no database driver through this file
  proves: Criterion 5's file-level half — the port is declared in the capability-registry module without
    importing a database driver to obtain its answer.
  fails_when: evidence-usage-reader.port.ts gains any import statement pulling in pg, a persistence module,
    or any other infrastructure dependency.
not_applicable:
- edge_case: An evidence row recording no capability name or version at all (the capability-never-resolved
    case)
  why: investigation_evidence.capability_name and capability_version are both declared NOT NULL with a
    foreign-key constraint, so no such row can be produced through the write path this task's tests can
    drive; no criterion depends on distinguishing this case from an ordinary no-match.
- edge_case: More than one evidence row recording the same queried capability identity
  why: the query only needs one matching row to exist (an existential predicate); a second matching row
    exercises the identical predicate and answer the matching test already asserts.
- edge_case: The database connection failing or being unavailable while isCapabilityNamedByEvidence runs
  why: no criterion of this task names a refusal or any specific failure behavior; it reuses the same
    failure wrapping this file's own pre-existing read()-failure test already exercises.
- edge_case: Concurrent reads of isCapabilityNamedByEvidence for the same or different identities
  why: the method runs a single stateless SELECT with no shared mutable state; no criterion states any
    concurrency requirement for a read.
untested:
- domain/investigation/evidence's whole fact — all thirteen declared attributes and its degradation semantics
  — is not decided by any test in this proof; this reader touches only the capability_name/capability_version
  pair among evidence's own attributes.
- domain/integration/capability's whole fact — its nine declared attributes and its 'declare its contract
  completely' responsibility — is not decided here; this task's identity type carries only name and version,
  the subset a cross-module caller needs.
- constraints/the-domain-depends-on-no-infrastructure is a system-wide dependency audit over every domain
  module's imports, decided by the project's lint step per the standard, not by a test in this suite.
- The co-location half of criterion 6 — that createEvidenceUsageReader is built inside the very same composeResources
  call as createConnectorConfigurationsReader — is confirmed only by reading build-app.factory.ts; composeResources
  is unexported so no black-box test can observe that co-location. The test written proves the exported
  factory function itself is constructible and correctly forwards a composite identity, the whole of what
  is behaviorally observable.
---

## What it is
The tests proving capability-evidence-usage-reader: the composite identity's round trip through the factory, the port's own zero-import boundary, and the three matching/non-matching cases against the real investigation_evidence table.

## Notes
The build passed cleanly on the first attempt (run/cross-context-usage-reads-capability-evidence-usage-reader-build); no existing fixtures needed repair since this task introduces a new port rather than widening one.
