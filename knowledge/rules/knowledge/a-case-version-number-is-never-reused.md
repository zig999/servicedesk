---
type: policy
statement: A case's next version number is always greater than every version number the case has ever held, including one later discarded.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A discarded draft leaves no version behind to read, but its number is not returned to be issued again — reusing it would let two different draft attempts, at different times, ever have answered to the identical pin.
Reverting to an earlier version's content is therefore always a new, higher version number composed with that earlier version's manifest, never the old number reactivated.
