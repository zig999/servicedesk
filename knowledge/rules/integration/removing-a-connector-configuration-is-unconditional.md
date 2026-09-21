---
type: invariant
statement: Removing a connector configuration by name succeeds whether or not any capability currently names it as its own connector and whether or not any configuration is currently registered under that name — a removal naming a connector nothing is registered under is never refused for that absence, leaves every registered configuration exactly as it stood, and is answered exactly as a removal that removed one.
constrains:
  - domain/integration/connector-configuration
---

## Description

The same looseness a-connector-configuration-names-its-connector already holds for registration governs removal: a capability's own connector attribute is an opaque name nothing resolves at registration time, so nothing resolves it at removal time either. A capability left naming a connector configuration that no longer exists reads exactly as one registered before its connector was ever configured — its observation ends unavailable (rules/integration/an-unresolvable-observation-ends-unavailable) rather than the removal being refused.
A removal naming a connector nothing is registered under is the second branch of the same unconditionality. The registry holds a configuration by name and nothing resolves that name, so the only condition such a removal could test is whether the name currently holds something, and the state a refusal would report — no configuration registered under that name — is exactly the state the removal exists to produce: the caller is left nothing to do with the refusal and no way to tell a name never registered from one a removal already emptied. So the operation completes with no effect on the registry, and there is no error value for this case to name.
The divergence from a-connector-configuration-read-by-an-unregistered-name-is-refused is deliberate rather than an inconsistency: a read by a name nothing has registered has no configuration to answer with and so refuses with a value of its own, while a removal by that same name has already arrived at what it was asked for.
