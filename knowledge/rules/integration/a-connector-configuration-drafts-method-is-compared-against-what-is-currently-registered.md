---
type: policy
statement: Where a connector configuration is currently registered under the connector name a draft is generated for, and that registered configuration's own text declares a method, and the chosen operation's own HTTP method differs from it — the two compared with each upper-cased first, so that the lower-case path-item key an OpenAPI document names an operation's method by and the upper-case method an HTTP connector configuration declares are never read as a disagreement on that difference alone — the draft names both methods in a method_mismatch, each stated upper-cased, rather than silently replacing either; where no connector configuration is currently registered under that name, or the one registered declares no method, the draft states no method_mismatch.
expression: >-
  For a connector name c a draft is generated for and an operation whose own HTTP method is
  m: where a connector configuration is currently registered under c, and that
  configuration's own text declares a method value r, and r upper-cased is not equal to m
  upper-cased, the draft carries a method_mismatch naming registered r upper-cased and
  operation m upper-cased. Where r upper-cased equals m upper-cased, the draft carries no
  method_mismatch, whatever case either source gave its value in. Where no connector
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

The two sides spell one fact in two fixed conventions: an OpenAPI document names an operation's method as a lower-case path-item key, while an-http-connector-configuration-declares-its-call holds a declared method to one of GET, POST, PUT, PATCH or DELETE. Read exactly as each source gives it, a registered GET against an operation keyed get would report a disagreement that does not exist, and every draft over an already-configured connector would carry a mismatch — which is why the comparison folds case, and why folding here is not the normalization a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability deliberately refuses: a parameter name has no closed vocabulary and no stated convention on either side, so a difference in its case is unexplained and may be a different fact, whereas a method's difference in case is accounted for by both sources' own stated conventions and can be nothing else.

Both methods are named upper-cased because that is the one vocabulary a method may be declared in, and because the draft's own configuration already declares the operation's method in it — naming the same value one way inside the configuration and another beside it in the method_mismatch would give one draft two spellings of one method for an operator to reconcile before reading the disagreement the mismatch exists to show.
