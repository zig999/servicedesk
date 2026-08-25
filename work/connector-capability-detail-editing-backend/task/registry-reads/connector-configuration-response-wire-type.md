---
title: Connector configuration reads answer configuration as the domain's own string
summary: GET /v1/connectors/{connector} and the list-connector-configurations route both answer configuration as the JSON string domain/integration/connector-configuration declares.
rationale: The scope names one call site directly and asks, conditionally, for a second to receive "the identical fix" if it shares the divergence; the inventory confirmed both share one root cause — the domain type's own configuration shape reaching each response through a different route. I cut this as one task with one criterion per route, since fixing one without the other would leave the same divergence live at a second published operation for the same reason the first was wrong.
objective: Every connector-configuration read response answers configuration as the JSON string domain/integration/connector-configuration declares, consistent with the write side.
criteria:
  - A GET /v1/connectors/{connector} response for a registered connector returns configuration as a JSON string, never a parsed object.
  - A list-connector-configurations response returns every entry's configuration as a JSON string, never a parsed object.
  - Parsing the returned configuration string reproduces the same JSON value the connector was registered with.
sources:
  - intake/scope.md
implements:
  - domain/integration/connector-configuration
  - contracts/integration/connector-configuration-registry
---

## What it is

A correction to two read responses so each answers configuration in the wire type the domain model declares, matching what the write side already does.
Nothing here changes what a connector configuration is or how it is validated on write — the divergence is in what a read response answers, not in what the registry accepts or holds.

## Notes

None.
