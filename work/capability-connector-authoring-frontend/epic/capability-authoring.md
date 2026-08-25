---
title: Capability authoring surface
summary: Turns the capabilities browser screen from read-only into one that creates and edits a capability's full declared contract, including its two JSON schemas.
rationale: The scope's own stated coverage list spans three distinct aggregates (capability, concept, connector configuration); this epic isolates the capability aggregate, its registry service and the four rules that govern its registration, because the capability editor is one coherent screen change independent of the concept and connector-configuration editors that follow it.
sources:
  - work/capability-connector-authoring-frontend/intake/scope.md
covers:
  - domain/integration/capability
  - domain/integration/capability-nature
  - domain/integration/capability-registry
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-capability-is-read-only
  - rules/integration/one-capability-answers-one-concept
  - rules/integration/a-capability-declares-well-formed-schemas
  - contracts/integration/capability-registry
---

## What it is

The capability aggregate's fields, the registry that refuses a bad registration, and the four rules that bound what a registration may declare.
The published capability-registry surface (read, list, register) that the browser screen's new create/edit actions call.

## Notes

The shared JSON beautify/minify textarea control is also cut into this epic, even though it answers to no specification node on its own, because it is a prerequisite the capability editor's two schema fields need before their own criteria can be demonstrated.
