---
type: invariant
statement: >-
  The two refusals a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  states answer under the same HTTP status and never under the same error value, and neither is
  ever reported as the other or as a refusal carrying no named condition.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Two error values, because telling a document that was never received from one that cannot be read is the whole reason the two refusals are two rules. A single shared value would leave the operator where `constraints/a-domain-error-unmapped-by-status-is-refused-generically` leaves a caller — knowing only that something failed — and would make the surface distinction `a-submitted-registration-states-its-outcome-to-the-operator` requires for a refusal impossible to draw. The parse failure and the unsupported version share one value because one rule states them as one refusal for one reason: nothing partial is worth drafting from text the reader cannot take as OpenAPI 3.x. Both names follow this specification's subject-plus-condition convention (`ConnectorConfigurationNotFoundError`, `CapabilityNotReadOnlyError`): not fetched, and not readable — the second spanning both a document nobody can parse and a 2.0 document handed to a 3.x-only reader, where `NotWellFormed`, already this specification's word for a pure parse-shape refusal, would understate the version half.

One HTTP status for both, because it is this specification's established answer for a well-formed request whose named content the domain refuses — `ConnectorConfigurationNotWellFormedError`, `IncompleteConnectorConfigurationError`, `CapabilitySchemaNotWellFormedError` and `ConnectorPlaceholderOutsideInputSchemaError` all answer it. Both refusals are that case: the request is well formed, and what it names — a link, or the document that link answered — cannot be drafted from.
