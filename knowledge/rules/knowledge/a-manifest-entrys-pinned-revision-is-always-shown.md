---
type: policy
statement: A curator reading a case version's manifest is shown, for every entry, the hypothesis-revision that entry itself pins, whatever page of that hypothesis's own revisions was answered alongside it; an entry whose pinned revision is absent from the revisions answered still states that pinned revision, and is never shown as pinning no revision at all.
constrains:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A manifest entry's pinned revision is the entry's own reference, not a fact recovered from any listing of that hypothesis's revisions — `manifest-entry` carries exactly which revision of that hypothesis's content this version uses, and `hypotheses-are-ordered-by-precedence` already says nothing about how a case version is read back may change what the entry declares.
`listings-are-paged` makes a listing of one hypothesis's revisions one page of a larger set, so the revisions answered beside a manifest entry are a subset that can omit the pinned one; presenting only what that page carried would let the reference the version actually uses vanish from the curator's view while the version keeps using it.
What that omission would cost is the same cost this specification has already refused twice: `a-case-holding-no-versions-is-told-explicitly` refuses an unexplained emptiness over a stored set because absence, a failed read and a pending read then read alike, and `a-released-version-keeps-its-original-revision` is the very guarantee a curator would be unable to verify — the released version's own revision is exactly the one an older page is most likely not to carry, since later revisions accumulate past it.
The rule is a policy over two aggregates read separately, so it holds eventually: the manifest and the revisions arrive as two answers, and the entry's own reference is what governs where they disagree.
