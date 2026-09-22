---
target: backend
title: CapabilityRegistryService.removeCapability, refused where evidence names the identity
summary: Five new unit tests over CapabilityRegistryService.removeCapability prove both branches of the
  cited-evidence guard — refusal with CapabilityCitedByEvidenceError before any store write, and unconditional
  delete completing with no refusal for an uncited or absent identity.
implementation: sha256:49677719f2cae55eeab580b0a0cb15b2a5d350d3dcf9d98c87db7a0f497f4b7f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/capability-removal-remove-capability-operation-suite
tests:
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses removal with CapabilityCitedByEvidenceError when the evidence-usage reader reports the
    identity is cited
  proves: Criterion 2 and criterion 5 together with the UNDERDETERMINED entry naming the specific error
    class.
  fails_when: removeCapability resolves without throwing for a cited identity, or throws any error that
    is not an instance of CapabilityCitedByEvidenceError.
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: leaves the capability registered at that identity when the removal is refused
  proves: Criterion 3 — a refused removal leaves the capability still registered at that identity.
  fails_when: a subsequent readCapabilityByIdentity no longer finds the capability after a refused removal.
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses before any delete statement is issued, so a failure the store would raise on delete never
    reaches the caller in place of the refusal
  proves: Criterion 4 — the refusal is raised before any delete statement is issued.
  fails_when: the caught error is the store's own thrown error rather than CapabilityCitedByEvidenceError.
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: removes the capability, so a subsequent read of the registry finds nothing registered at that
    identity, when the evidence-usage reader reports it is not cited
  proves: Criterion 1's registered-identity branch.
  fails_when: a subsequent readCapabilityByIdentity still finds the capability registered after removeCapability
    resolves.
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: completes with no refusal when nothing is registered at the requested identity, since nothing
    there is named by evidence either
  proves: Criterion 1's absent-identity branch.
  fails_when: removeCapability throws for an identity nothing is currently registered at.
not_applicable:
- edge_case: Absent or malformed name/version input to removeCapability
  why: No criterion of this task states a service-layer validation behavior; that validation is a sibling
    route task's remit.
- edge_case: An empty collection returned where one is expected
  why: removeCapability returns Promise<void>; no collection is returned by this operation.
- edge_case: A duplicate registration matching one name-and-version identity
  why: No criterion of this task addresses a duplicate-match scenario for removal.
- edge_case: A dependency (the evidence-usage reader or the store) that fails or answers slowly during
    removeCapability
  why: No criterion or node of this task states a propagation behavior for a failing dependency during
    removeCapability specifically.
- edge_case: Two removeCapability (or a register/remove) calls against one identity at once
  why: No criterion or node of this task states a concurrency behavior for removeCapability.
- edge_case: A boundary at each end of a numeric or length range
  why: name and version are unconstrained strings in this task's scope; no criterion states a range boundary.
untested:
- 'rules/integration/a-registered-capability-cited-by-evidence-is-never-removed: the node''s fact includes
  the HTTP 409 transport response and message shape, out of this service-scoped task''s criteria.'
- 'domain/integration/capability-registry: the node''s Responsibility spans three operations delivered
  across separate tasks; this task''s tests exercise only the remove-capability slice.'
- 'domain/integration/capability: the node describes the whole aggregate; this task''s guard and delete
  touch only the identity attributes.'
- 'contracts/integration/capability-registry: the node names the whole published synchronous surface;
  this task implements only the service-layer half.'
- 'constraints/the-system-persists-to-one-relational-database: a system-wide fitness claim, decided by
  the project''s own full test step rather than by any single service-level unit test.'
- The rule's absent-identity branch is reached only partially by criterion 1; no test is invented beyond
  what the criteria state, per the binder's own finding.
- Implementation-record inferences (default reader resolving false, single-call guard, error context field
  names) are behavioral or shape choices the specification does not state and are not pinned by any test.
- Criterion 6's 'reading no investigation store directly' and criterion 7 in full are structural absences
  decided by reading the file's own imports rather than by exercising code.
---

## What it is
The tests proving remove-capability-operation: both branches of the evidence-citation guard, the refusal-before-delete ordering, and the absent-identity success path.

## Notes
None.
