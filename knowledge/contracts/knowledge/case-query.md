---
type: api
direction: published
operations:
  - read-case
  - read-case-version
  - list-cases
  - list-case-versions
  - list-hypotheses
  - list-hypothesis-revisions
---

## Description

The synchronous read the knowledge context offers: a case by slug and version, validated at this reading, and read whole; a case version's own stored record by that same slug and version number — its title, when_to_use, subject, fallback and consolidation_register exactly as stored, neither validated at this reading nor assembled as a whole case; and the listings a curator browses by — every case, the versions of one named case, the hypotheses of one named case, and the revisions of one named hypothesis.
