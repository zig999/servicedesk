---
title: Degrade every unassemblable connector call to an unavailable evidence result
summary: The one uncaught call to resolveConnectorRequest inside observeConcept is
  wrapped so every typed assembly failure it throws ends the concept's evidence unavailable
  instead of propagating.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
objective: A concept observation whose connector call cannot be assembled — an unresolved
  Subject-attribute or credential placeholder, a missing address, malformed query
  or headers, an unrecognized placeholder kind, or a placeholder missing a required
  argument — records evidence result unavailable with the stated result_detail, instead
  of raising an unhandled exception, while test-connector's own direct call is left
  exactly as it behaves today.
criteria:
- A concept observation whose call embeds a Subject-attribute or credential placeholder
  that resolves to nothing records evidence result unavailable with result_detail
  naming ConnectorPlaceholderNotResolvedError.
- A concept observation whose connector configuration is missing its address records
  evidence result unavailable with result_detail naming IncompleteConnectorCallDescriptorError.
- A concept observation whose connector configuration declares query or headers as
  anything other than an object of string values records evidence result unavailable
  with result_detail naming IncompleteConnectorCallDescriptorError.
- A concept observation whose connector configuration names a placeholder kind the
  HTTP connector does not recognize, or a placeholder missing an argument it requires,
  records evidence result unavailable with result_detail naming IncompleteConnectorCallDescriptorError.
- The collection of every other concept in the same investigation proceeds unaffected
  when one concept's observation degrades this way.
- test-connector's own call to the resolver continues to propagate an unresolved condition
  uncaught, unaltered by this fix.
rationale: The scope states the placeholder degrade and the closed an-http-connector-configuration-declares-its-call
  indecision as two rule changes, but both are thrown by the same resolveConnectorRequest
  call and caught by the one wrapping fix the inventory identifies at observeConcept
  — one seam, one task, with one criterion per error class it now catches.
implements:
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/an-http-connector-configuration-declares-its-call
- contracts/integration/concept-observation
- contracts/integration/connector-diagnostics
- contracts/investigation/observation-source
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
---

## What it is
The one uncaught call to resolveConnectorRequest inside observeConcept is wrapped so every typed assembly failure it throws ends the concept's evidence unavailable instead of propagating.

## Notes
None.
