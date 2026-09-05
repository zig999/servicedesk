---
type: invariant
statement: A case version's manifest declares at least one entry; remove-hypothesis that would leave the manifest holding none is refused with an HTTP 422 response reporting a ManifestWouldHoldNoHypothesisError. Remove-hypothesis asked for a hypothesis name the manifest does not currently hold succeeds with no effect, never refused for the name's absence.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

A case version with no manifested hypothesis investigates nothing; the fallback alone is not an investigation.
