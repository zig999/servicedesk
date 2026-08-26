---
type: invariant
statement: A connector configuration's diagnostic call masks whatever value a credential placeholder in its own call resolves to, so the response echoing that call back never carries a credential's real value.
constrains:
  - domain/integration/connector-configuration
---

## Description

A connector configuration's call may name a credential the executing connector reads from environment configuration rather than from the configuration text itself, so nobody has to author a secret directly into an operator-editable field. The diagnostic operation exists to let an operator see the request a connector configuration would actually issue (contracts/integration/connector-diagnostics), and that same visibility would otherwise hand back the one thing the indirection was meant to keep out of an editable field and a response body alike. Masking is what keeps the diagnostic honest about shape without being honest about the secret.
