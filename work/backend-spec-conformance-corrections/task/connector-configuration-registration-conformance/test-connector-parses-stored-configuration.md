---
title: Test-connector parses the stored configuration text
summary: Testing a connector configuration derives its call from the stored text, parsed, rather than an already-parsed object.
objective: Testing a connector configuration derives its call from the stored configuration text, parsed, rather than assuming an already-parsed object.
criteria:
  - Testing a registered connector configuration whose stored configuration is JSON text issues the call the configuration declares, deriving method, responseMap and statusMap from the parsed object.
depends_on:
  - task/connector-configuration-registration-conformance/configuration-held-as-text
rationale: Split out as the one consumer of the sibling task's representation change, under the one-seam test; deriving a call from parsed text is a distinct, independently-verifiable behavior from the registry's own storage shape.
implements:
  - domain/integration/connector-configuration
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
sources:
  - intake/scope.md
---

## What it is

test-connector.controller.ts parses the connector configuration's stored text before deriving the call it issues.

## Notes

UNDERDETERMINED, from the specification — the criterion above is satisfied by an implementation
that accepts a connector configuration's own name directly and issues the call its stored, parsed
configuration declares, without requiring that an already-registered capability names that
connector as its own. The specification refuses that shape wherever no capability is registered at
the named identity (HTTP 404 CapabilityNotRegisteredForTestError) or where a named connector does
not match the found capability's own connector (HTTP 409 CapabilityConnectorMismatchError) —
rules/integration/a-connector-configuration-is-tested-through-a-registered-capability, a node
outside this task's candidates because this epic's own scoping already excludes it (only the
configuration field's representation changes here, not the capability-scoped test's existing
refusal logic). The test this task's criterion demands must exclude an implementation that skips
that scoping — the existing capability-scoped test-connector code, untouched by this task, already
enforces it.
