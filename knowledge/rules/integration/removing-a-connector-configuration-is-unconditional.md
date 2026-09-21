---
type: invariant
statement: Removing a connector configuration by name succeeds whether or not any capability currently names it as its own connector.
constrains:
  - domain/integration/connector-configuration
---

## Description

The same looseness a-connector-configuration-names-its-connector already holds for registration governs removal: a capability's own connector attribute is an opaque name nothing resolves at registration time, so nothing resolves it at removal time either. A capability left naming a connector configuration that no longer exists reads exactly as one registered before its connector was ever configured — its observation ends unavailable (rules/integration/an-unresolvable-observation-ends-unavailable) rather than the removal being refused.
