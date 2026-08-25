---
title: Connector diagnostics surface
summary: The test-connector diagnostic route that exercises a connector configuration's real call through an already-registered capability, without writing evidence.
rationale: test-connector is its own epic because it answers a different specification concern from the other three — a diagnostic read against systems already registered elsewhere, governed by its own policy restricting when a connector configuration may be tested at all, rather than a create-or-replace registration.
sources:
  - work/capability-connector-authoring-backend/intake/scope.md
covers:
  - rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  - contracts/integration/connector-diagnostics
  - constraints/no-route-enforces-authentication
---

## What it is

The epic delivering test-connector as a diagnostic HTTP route.
It covers the one policy restricting when a connector configuration may be tested and the contract naming test-connector as a published operation.
It covers the no-authentication constraint because this is a new route reaching the API layer.

## Notes

None.
