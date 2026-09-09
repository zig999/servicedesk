---
type: invariant
statement: >-
  The method a connector configuration currently registered under the same connector name
  declares is never drafted in place of the chosen operation's own method, whether the two
  agree or differ.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The value is the operation's own method rather than the registered one because the draft states what the document says and the mismatch states the disagreement: `a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered` names both methods side by side and replaces neither, which it can only do where the draft's own text holds the operation's. An operator reading both decides which to submit, and register-connector remains the one write that changes what is registered.
