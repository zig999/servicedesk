---
type: policy
statement: A surface presenting a case version's manifest entry states that a higher revision of that entry's hypothesis exists whenever one does, for a version in either state, draft or released; on a released version's entry it states that existence alone and offers no adoption of it.
constrains:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
consistency: eventual
---

## Description

A released version's entry can never adopt the higher revision, and this states nothing suggesting it could: what it discloses is that the hypothesis's content has moved on since this version pinned it — the one fact a reader auditing a past investigation, or judging whether the case warrants a new draft, has no other way to learn from the entry in front of them. Adoption stays exactly where `a-case-version-is-written-once` already put it, in the next draft.
Two standing decisions already refuse to narrow a read of a case version by that version's state, and neither leaves room for a third answer here: `a-case-versions-input-requirements-are-derived` is available "for a case version in either state, draft or released," and `validation-runs-at-every-read` holds a version's reading to every rule "draft or released alike." A version's state answers whether it may still be composed and whether it may be diagnosed against (`only-a-released-case-version-is-diagnosed`) — never how much of what is true about it a reader is shown.
Withholding it on a released entry would be the silence `a-case-holding-no-versions-is-told-explicitly` already rejects: an entry reading revision 1 with nothing said beside it tells the same story whether revision 1 is the hypothesis's only revision or the oldest of five, and the reader is left to guess which.
