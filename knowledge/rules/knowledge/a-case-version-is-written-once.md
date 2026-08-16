---
type: invariant
statement: A case version in released state, and every manifest entry it composes, is never altered again; revising a case's content composes the next draft version instead.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

It is what slug and version pin: with no digest over the content, a released version whose manifest could still change would leave every investigation that pinned it naming a procedure other than the one that ran.
Curation is therefore additive — a new draft, then a release — never an edit to a version already released, which is also what keeps every earlier version readable.
