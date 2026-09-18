---
statement: The register-capability route's declared request shape requires no capability attribute to be present or non-empty — its name and version path segments each admit an empty segment, its body admits an absent or empty body and every attribute absent or empty, and only a value actually supplied is held to its declared type and bounds — so a request omitting a required attribute, supplying one as an empty string, or carrying no body passes this route's shape validation and meets the registry's own IncompleteCapabilityContractError refusal instead.
scope: integration
fitness: An automated test sends a register-capability request omitting a required body attribute, one supplying a required attribute as an empty string, one with an empty name path segment and one carrying no body at all, and asserts each answer is the registry's HTTP 422 IncompleteCapabilityContractError refusal rather than an HTTP 400 VALIDATION_ERROR one.
---

## Description

Stated for this one route because the registry's completeness refusal is otherwise unreachable through it: a shape check that rejects an absent or empty required attribute answers such a request before the registry ever sees it, and the operator meets a generic shape refusal where a named, per-attribute one is owed.

The declared shape still decides everything that is not a question of completeness — a value actually supplied but of the wrong type, or outside the bounds declared for it, fails here as on any other route — so what this loosens reaches only the presence and the emptiness of the attributes a capability's contract is judged complete by.

It travels to no other route: where a route's own rules make an absent or empty field a question of the shape it declares rather than of content the domain weighs, the standing shape refusal answers it.
