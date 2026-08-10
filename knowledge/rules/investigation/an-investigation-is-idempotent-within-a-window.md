---
type: invariant
statement: Within the configured window, a request repeating subject type, the subject's whole set of attribute-values, case and a given ticket reference returns the existing investigation — completed returns it, in progress joins it, and neither starts another; a request carrying no ticket reference is never matched this way, and always starts its own investigation.
constrains:
  - domain/investigation/investigation
---

## Description

An attendant who waits minutes on screen clicks twice and refreshes; without the key, each impatience costs a whole investigation.
A ticket reference is what makes two calls the same repeated request; where none is given there is nothing to repeat against, so every such call is its own.
