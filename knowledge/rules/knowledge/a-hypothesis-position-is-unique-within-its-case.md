---
type: invariant
statement: No two manifest entries of one case version share a position; place-hypothesis at a position the manifest already places a different hypothesis at is refused with an HTTP 409 response reporting a ManifestPositionOccupiedError, whose message names the case slug, the version number and the position already occupied, and whose details carry exactly those three values and nothing else.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

Precedence has to be a total order or resolve-outcome has no first confirmed hypothesis to find, only a tie it would settle by whatever it read first.
Position is declared on the manifest entry, not on the hypothesis-revision it references, precisely so that reordering two hypotheses between one version and the next never forces either one's content to gain a new revision.
