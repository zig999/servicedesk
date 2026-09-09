---
type: invariant
statement: >-
  A parameter or field that resolves holds at its position the placeholder it resolved to, and
  one named in the draft's unresolved list still stands at its position, holding its own name in
  the document's own brace form {name}, which names no placeholder kind and is carried as plain
  text — except a parameter named unresolved with reason
  drafted-key-occupied-by-another-security-scheme, which stands at no position at all, the
  drafted key it would have occupied being held instead by the security scheme
  a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
  sends there.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

An unresolved parameter or field keeps its position holding the document's own brace text because the unresolved list is the disclosure while the configuration is what the operator actually edits: dropping the key there would leave the edited artifact silently missing a part the operation requires, with nothing in the text to point at. The brace form is the document's own, names no placeholder kind this connector recognizes, and is carried as the plain text an-http-connector-configuration-declares-its-call already makes of anything that is not a ${kind} form, so leaving it in view misuses nothing in the executing connector's vocabulary. The one parameter this cannot hold for is one displaced from its own key by a security scheme the same operation requires: that key is not free to carry the brace text, since a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme puts the scheme's credential placeholder there, so the parameter is left no position and its unresolved item carries the whole of the disclosure.
