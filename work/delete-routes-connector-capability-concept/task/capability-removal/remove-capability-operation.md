---
title: remove-capability, refused where evidence names the identity
summary: The registry service's own remove-capability, removing a registration by name and version unless
  a collected evidence item names that identity, in which case it refuses and leaves the registration
  standing.
rationale: 'The guard and the removal are one task on purpose: they are the two branches of one rule statement,
  and a task delivering the removal without the guard would have criteria the guard task then falsifies.
  Cut between the store and the route because it consumes the store port and the reader port and is the
  route''s dependency.'
sources:
- intake/scope.md
depends_on:
- task/capability-removal/capability-store-delete
- task/cross-context-usage-reads/capability-evidence-usage-reader
objective: The capability registry removes a registration by name and version unless a collected evidence
  item names that identity.
criteria:
- Where no collected evidence item names the identity, this rule does not refuse the removal, and a subsequent
  read of the registry finds nothing registered at that name and version.
- Where a collected evidence item names the identity, the operation refuses the removal.
- Where the operation refuses, the capability is still registered at that identity afterwards.
- Where the operation refuses, it does so before any delete statement is issued, so no database constraint
  violation reaches the caller in place of the refusal.
- The refusal is raised as a domain error of its own, distinct from every error already raised by registering
  a capability.
- The guard obtains its answer through the evidence usage reader port, the registry reading no investigation
  store directly.
- The guard consults no case version's collection plan and no derived input requirement, nothing else
  persisting a reference to a capability by identity.
reference:
- inventory/refusal-guard-rule-evidence.md
- src/src/capability-registry/capability-registry.service.ts
- src/src/case/manifest-composition.operations.ts
- src/src/errors/manifest-would-hold-no-hypothesis.error.ts
implements:
- rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
- domain/integration/capability-registry
- domain/integration/capability
- contracts/integration/capability-registry
- constraints/the-system-persists-to-one-relational-database
---

## What it is
The registry operation the published contract names, with both branches its governing rule now states: refuse where evidence names the identity, and complete with no effect where the identity holds nothing.
Re-registering the identity a piece of evidence already names is a different act with a different outcome, and this operation leaves that path alone.

## Notes
UNDERDETERMINED, from the specification — the rule names the refusal's error value itself, CapabilityCitedByEvidenceError; criterion 5 demands only "a domain error of its own, distinct from every error already raised by registering a capability" and does not carry that name.
UNDERDETERMINED, from the specification — the rule's absent-identity branch (leaves every other registered capability exactly as it stood, answered exactly as a removal that removed one) is reached only partially: criterion 1 checks the requested identity and a subsequent read, not that other registrations are undisturbed or that the two branches answer alike.
ADVISORY, from the specification — this task's own decider found criterion 6's named port ("the evidence usage reader port") to be implementation structure the specification's classes do not admit by name; constraints/the-domain-depends-on-no-infrastructure already requires infrastructure to reach the domain only through a port without naming one, the same treatment its two named ports (hypothesis-evaluator, assessment-consolidator) receive for a different reason (an interchangeable judge, not a citation check with one truth and one source). The reader this plan cuts as task/cross-context-usage-reads/capability-evidence-usage-reader is that port, named and shaped in source, under the trace.
REMAINDER, from the specification — the rule's own HTTP 409 / CapabilityCitedByEvidenceError transport answer reaches no criterion of this service-scoped task; it belongs to the sibling route task's status-map entry.
REMAINDER, from the specification — constraints/a-successful-capability-removal-answers-with-no-content's HTTP 204 / no-body answer likewise belongs to the route task.
ADVISORY, from the specification — which attributes of a collected evidence item carry the capability's name and version is stated by domain/investigation/evidence, outside this task's candidate set; the guard's read is keyed on what the reader port (task/cross-context-usage-reads/capability-evidence-usage-reader) already answers against that node.
Decision, beyond the covers — stand: domain/investigation/evidence is implemented by task/cross-context-usage-reads/capability-evidence-usage-reader, this task's own dependency; growing this task's claim to include it would duplicate coverage that dependency already holds.
