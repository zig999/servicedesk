---
subject: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
given:
  - a case whose version 1 is released and whose version 2 is a draft still being revised
when:
  - the case's summary is read for the catalog
then:
  - title, when_to_use and released_version are read from version 1, the released one
  - current_state still reports draft, read from version 2 — the case's highest-numbered version, not its released one
  - version 2's own when_to_use never surfaces in the catalog while it remains a draft
involves:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-summary
---

## Description

only-a-released-case-version-is-diagnosed refuses to pin an investigation to version 2 while it stays a draft, so a catalog entry naming version 2's own when_to_use would point a reader at a version diagnosis itself would refuse; released_version names version 1 instead, the one a diagnosis may actually run against, and title and when_to_use follow it rather than the newer draft above it.
