---
statement: The register-capability route's declared request shape admits any string as a capability's nature rather than only the capability-nature vocabulary, so a request supplying a nature that is a non-empty string outside that vocabulary passes this route's shape validation and meets the registry's HTTP 422 CapabilityNotReadOnlyError refusal instead of an HTTP 400 VALIDATION_ERROR one.
scope: integration
fitness: An automated test sends a register-capability request whose nature is a non-empty string outside the capability-nature vocabulary and asserts the answer is the registry's HTTP 422 CapabilityNotReadOnlyError refusal rather than an HTTP 400 VALIDATION_ERROR one.
---

## Description

Stated for this one route because which natures may be held is a judgment the registry makes over content, not a question of the shape a request arrived in: the registry weighs every nature it does not recognise as read-only the same way, so an operator who named a nature this system has no such thing as is told what is actually wrong with his registration instead of that his body failed a shape check that names no domain condition.

What this loosens is the set of values one supplied attribute may take, and nothing else; an absent or empty nature is a question of completeness, answered where this route's completeness deferral answers it.

It travels to no other route: where the values an enumeration admits are the shape a route declares rather than content the domain weighs, the standing shape refusal answers a value outside them.
