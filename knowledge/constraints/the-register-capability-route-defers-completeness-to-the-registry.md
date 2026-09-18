---
statement: The register-capability route's declared request shape requires no capability attribute to be present or non-empty for a request that states a JSON object body — its name and version path segments each admit an empty segment, and its body admits an empty JSON object and every attribute absent or empty, with only a value actually supplied held to its declared type and bounds — so such a request, omitting a required attribute, supplying one as an empty string, or stating an empty JSON object body, passes this route's shape validation and meets the registry's own IncompleteCapabilityContractError refusal instead.
scope: integration
fitness: An automated test sends a register-capability request omitting a required body attribute, one supplying a required attribute as an empty string, one with an empty name path segment and one stating a wholly empty JSON object ({}) as its body, and asserts each answer is the registry's HTTP 422 IncompleteCapabilityContractError refusal rather than an HTTP 400 VALIDATION_ERROR one.
---

## Description

Stated for this one route because the registry's completeness refusal is otherwise unreachable through it: a shape check that rejects an absent or empty required attribute answers such a request before the registry ever sees it, and the operator meets a generic shape refusal where a named, per-attribute one is owed.

The declared shape still decides everything that is not a question of completeness — a value actually supplied but of the wrong type, or outside the bounds declared for it, fails here as on any other route — so what this loosens reaches only the presence and the emptiness of the attributes a capability's contract is judged complete by.

It travels to no other route: where a route's own rules make an absent or empty field a question of the shape it declares rather than of content the domain weighs, the standing shape refusal answers it.

A request carrying no body at all — no JSON value, parsed as undefined rather than an empty object — is not this route's declared shape at all, and stays refused at HTTP 400 before the registry is ever reached; only a request that states a JSON object body, however incomplete, is what this constraint's loosening reaches.
