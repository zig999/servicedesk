---
type: policy
statement: Where a connector configuration is currently registered under the connector name a draft is generated for, and that registered configuration's own text declares a method, and the chosen operation's own HTTP method differs from it, the draft names both methods in a method_mismatch rather than silently replacing either; where no connector configuration is currently registered under that name, or the one registered declares no method, the draft states no method_mismatch.
expression: >-
  For a connector name c a draft is generated for and an operation whose own HTTP method is
  m: where a connector configuration is currently registered under c, and that
  configuration's own text declares a method value r, and r is not equal to m, the draft
  carries a method_mismatch naming registered r and operation m. Where no connector
  configuration is currently registered under c, or one is registered but its own text
  declares no method, the draft carries no method_mismatch, whatever m is.
constrains:
  - domain/integration/connector-configuration-draft
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

Method is the executing connector's own statement, declared inside a connector configuration's own text alongside address, query, headers and body (an-http-connector-configuration-declares-its-call) — it is not a fact a capability's own declared contract carries, so this comparison reads the connector configuration currently registered under the same name, live, the same way a-connector-configuration-is-tested-through-a-registered-capability already reads a registered configuration at the moment of a test rather than a stored copy.

A draft never overwrites a currently registered method on its own account: register-connector is the one write that replaces a configuration, and it acts only on the operator's own later submission. Where the registered configuration declares no method at all — an incomplete configuration nothing has finished authoring — there is nothing yet to disagree with, and the draft states no mismatch rather than inventing one against an absence.
