---
type: policy
statement: Removing a capability's own registration by name and version succeeds unless some collected evidence item names that capability, in which case the removal is refused and the capability is never removed from the registry.
constrains:
  - domain/integration/capability
  - domain/investigation/evidence
consistency: eventual
---

## Description

A capability's registration is load-bearing the moment an investigation's own collected evidence names it: that evidence item's own record of who produced it would strand the moment the capability it names stopped existing. Nothing else persists a reference to a capability by identity — a case version's input requirements and collection plan resolve a capability fresh from its concept on every read, never storing which one answered.
Re-registering the identity a piece of evidence already names replaces the capability going forward without touching that evidence's own past record (scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment); removing it outright is refused instead, since nothing would then stand at that identity for the record to point at.
