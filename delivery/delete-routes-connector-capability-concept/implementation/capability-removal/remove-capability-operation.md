---
target: backend
title: CapabilityRegistryService.removeCapability, refused where evidence names the identity
summary: Adds removeCapability(name, version) to CapabilityRegistryService, refusing through a new CapabilityCitedByEvidenceError
  when the evidence-usage reader reports the identity is named by collected evidence, and otherwise deleting
  unconditionally through the capability store.
task: sha256:538d45360b2ac48905339e0fb95676935f42603737fce0a8a08114744972a2e9
run: run/capability-removal-remove-capability-operation-suite
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
files:
- path: src/capability-registry/capability-registry.service.ts
  effect: Adds a defaulted third constructor dependency (evidenceUsageReader) and public async removeCapability(name,
    version) that checks isCapabilityNamedByEvidence first, throws CapabilityCitedByEvidenceError when
    cited, and otherwise calls store.deleteCapability unconditionally.
- path: src/errors/capability-cited-by-evidence.error.ts
  effect: New domain error class CapabilityCitedByEvidenceError, modeled on ManifestWouldHoldNoHypothesisError's
    shape — extends Error, sets this.name, carries a readonly typed context ({ name, version }).
criteria:
- criterion: Where no collected evidence item names the identity, this rule does not refuse the removal,
    and a subsequent read of the registry finds nothing registered at that name and version.
  met: true
  how: When isCapabilityNamedByEvidence resolves false, removeCapability falls through to store.deleteCapability
    unconditionally; this also covers the identity-holds-nothing branch.
- criterion: Where a collected evidence item names the identity, the operation refuses the removal.
  met: true
  how: When isCapabilityNamedByEvidence resolves true, removeCapability throws CapabilityCitedByEvidenceError
    before reaching the store.
- criterion: Where the operation refuses, the capability is still registered at that identity afterwards.
  met: true
  how: The throw happens before any store call in the method body; store.deleteCapability is never invoked
    on the cited path.
- criterion: Where the operation refuses, it does so before any delete statement is issued, so no database
    constraint violation reaches the caller in place of the refusal.
  met: true
  how: The evidenceUsageReader check and its throw are the first and only statements before store.deleteCapability
    is called; the two paths are mutually exclusive.
- criterion: The refusal is raised as a domain error of its own, distinct from every error already raised
    by registering a capability.
  met: true
  how: CapabilityCitedByEvidenceError is a new class in its own file, unrelated to and not reused from
    any registration-time error.
- criterion: The guard obtains its answer through the evidence usage reader port, the registry reading
    no investigation store directly.
  met: true
  how: removeCapability calls only this.evidenceUsageReader.isCapabilityNamedByEvidence(...); the service
    imports no persistence or investigation module.
- criterion: The guard consults no case version's collection plan and no derived input requirement, nothing
    else persisting a reference to a capability by identity.
  met: true
  how: The only read the guard performs is the single call to isCapabilityNamedByEvidence; no case-store
    or manifest type is imported or referenced.
nodes:
- node: rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/capability-cited-by-evidence.error.ts
  how: Both branches the rule states are encoded — cited identity refuses via CapabilityCitedByEvidenceError
    before any store write, uncited (including absent) identity completes through an unconditional store.deleteCapability.
- node: domain/integration/capability-registry
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  how: Adds remove-capability, one of the domain service's three stated operations, with the exact refusal
    the node's Responsibility names.
- node: domain/integration/capability
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  how: The guard and delete both operate on the capability's own identity attributes (name, version);
    no other attribute of the aggregate is read or written.
- node: contracts/integration/capability-registry
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  how: Implements the service-layer half of the published remove-capability operation; the synchronous
    surface is out of this task's scope.
- node: constraints/the-system-persists-to-one-relational-database
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  how: removeCapability issues its one write through the same ICapabilityStore port every other mutation
    in this service already uses.
inferences:
- inferred: The default evidence-usage reader always resolves false, so a caller that omits the third
    constructor argument gets the unconditional-delete behavior rather than an always-refuse one.
  from: The existing NO_REGISTERED_CONNECTOR_CONFIGURATIONS default in this same file, which stands in
    for 'nothing to report' rather than 'refuse everything'.
- inferred: The guard is keyed only on { name, version } and calls isCapabilityNamedByEvidence exactly
    once per removeCapability invocation, with no caching or batching.
  from: IEvidenceUsageReader's own declared shape and the removeHypothesis precedent in manifest-composition.operations.ts.
- inferred: CapabilityCitedByEvidenceError's context field names are name and version rather than slug,
    version.
  from: The capability identity's own two attributes and the identity-shaped errors already in this file
    (CapabilityIdentityNotFoundError(name, version)).
---

## What it is
The registry operation the published contract names, with the one refusal its governing rule states.

## Notes
None.
