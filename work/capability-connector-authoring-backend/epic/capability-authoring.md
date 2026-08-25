---
title: Capability authoring surface
summary: The write HTTP route that lets an operator register a capability directly, enacting the registry's existing refusals plus the new schema-well-formedness check.
rationale: The scope's four backend operations split one epic per authored entity so each is independently reviewable against its own spec nodes; Capability gets its own epic because its domain-service refusals (contract-completeness, read-only, one-concept-one-capability) and its new schema-validity check are all reachable through the one route this epic delivers.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
covers:
  - domain/integration/capability
  - domain/integration/capability-registry
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-capability-is-read-only
  - rules/integration/one-capability-answers-one-concept
  - rules/integration/a-capability-declares-well-formed-schemas
  - contracts/integration/capability-registry
  - constraints/no-route-enforces-authentication
---

## What it is

The epic delivering register-capability as a write HTTP route.
It covers the capability aggregate, its registry service and every rule the registry already enforces plus the one new refusal this scope adds.
It covers the no-authentication constraint because this is a new route reaching the API layer.

## Notes

None.
