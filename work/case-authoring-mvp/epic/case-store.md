---
title: Case store and read
summary: The database-free persistence of every case version and the published read-case that validates at every reading with all refusals at once.
rationale: The scope named the persistence without a database as its own deliverable; the epic pairs the store with the published read because the read is where validation at every reading and the authoring promise become demonstrable.
covers:
  - rules/knowledge/validation-runs-at-every-read
  - rules/knowledge/every-case-version-remains-readable
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - contracts/knowledge/case-query
  - contracts/system/case-authoring
  - constraints/the-mvp-persists-to-no-database
  - constraints/a-case-is-stored-as-one-json-document
sources:
  - intake/scope.md
---
## What it is
The file-backed case store that keeps every version readable and pinned by content, and the read-case operation that runs the whole validator at each reading.

## Notes
None.
