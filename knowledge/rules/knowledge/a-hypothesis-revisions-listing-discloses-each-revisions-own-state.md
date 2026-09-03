---
type: invariant
statement: A listing of one hypothesis's revisions states, for every revision answered, that
  revision's own state, draft or released.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

Whether a revision may still be edited in place or is already immutable is now a fact of the revision itself, not something a curator reading the listing could previously see anywhere: two entries reading otherwise identically — same number, same criterion — answer differently to a save, and this specification has already refused every silence of that shape once a fact is addressable at all (`a-manifest-entrys-pinned-revision-is-always-shown`, `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest`). Stating the state on the listing is the same discipline applied to the one new fact this increment gives the revision to carry.
This holds inside the one aggregate the listing already reads — `a-hypothesis-revisions-listing-answers-highest-revision-first` orders this same set — so it is an invariant, not a policy.
