---
type: invariant
statement: Within the configured window, a request repeating subject type, subject id, case and ticket reference returns the existing investigation — completed returns it, in progress joins it, and neither starts another.
constrains:
  - domain/investigation/investigation
---

## Description

An attendant who waits twenty seconds clicks twice and refreshes; without the key, each impatience costs a whole investigation.
