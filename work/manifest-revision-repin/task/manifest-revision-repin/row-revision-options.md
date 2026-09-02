---
title: A manifest row's own revision list and highest revision
summary: For any manifest row, the revisions of that row's hypothesis and the highest revision among them,
  read through the listing and the reduction already in the tree.
rationale: Cut as its own task because reading a hypothesis's revisions is one reason to change and both
  the Select and the newer-revision marker build on the same answer; delivering it inside either one would
  leave the other reading revisions a second way. The scope named the endpoint and the query key but not
  that the read is separable from the two controls that consume it.
sources:
- intake/scope.md
objective: The manifest screen can obtain, for any row's hypothesis, that hypothesis's own revisions and
  the highest revision number among them, from the revisions listing already used elsewhere in the tree.
criteria:
- For a row whose hypothesis's revisions listing answered revisions 1, 2 and 3, the revisions obtained
  for that row are exactly 1, 2 and 3.
- No revision the hypothesis-revisions listing did not answer appears among the revisions obtained for
  a row.
- The revisions are read through the existing query key ["hypothesis-revisions", slug, hypothesisName],
  so a hypothesis whose revisions the revision form already read is served from that same cache entry
  rather than a second one.
- Each obtained revision carries the revision number the listing answered for it, never its position in
  the obtained sequence.
- The revisions obtained for one row are that row's own hypothesis's revisions, and a row naming a different
  hypothesis obtains that other hypothesis's revisions.
- The highest revision among those obtained is answered by the existing latest-revision reduction rather
  than by a second implementation of it.
- Before the revisions listing for a row's hypothesis has answered, the revisions obtained for that row
  are empty rather than derived from the row's pinned revision.
implements:
- contracts/knowledge/case-query
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
---

## What it is
A read that answers, per manifest row, the revisions the hypothesis-revisions listing holds for that row's hypothesis and the highest number among them.
It reuses the query key and the latest-revision reduction the hypothesis-revision form already established, so the manifest screen and that form read one cache entry.

## Notes
ADVISORY, from the specification — constraints/listings-are-paged means a hypothesis holding more revisions than the applied limit yields, for this task's own read, one page of them, so "the highest revision among those obtained" is the highest of that page rather than necessarily the hypothesis's own highest existing revision; whether a row must page to learn the whole set is left open by the criteria as written.
REMAINDER, from the specification — constraints/a-case-is-read-whole's whole-transaction assembly of a case version for diagnosis reaches no criterion here, only its permission for a hypothesis and its revisions to be read independently. Belongs: the task delivering case-query's own whole-case read (backend).
REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-number-is-never-reused's assignment clauses (first revision numbered 1, each later exactly one past the highest existing) reach no criterion here, which only reads revisions already assigned. Belongs: the task delivering revise-hypothesis (contracts/knowledge/case-lifecycle).
REMAINDER, from the specification — rules/knowledge/a-hypothesis-position-is-unique-within-its-case reaches no criterion here, which reads revisions and never places a hypothesis. Belongs: the task delivering place-hypothesis over a draft's manifest.
REMAINDER, from the specification — rules/knowledge/hypotheses-are-ordered-by-precedence reaches no criterion here; criterion 4's "never its position in the obtained sequence" is about an index in the obtained revision sequence, not a manifest entry's declared position. Belongs: the task that presents or edits the manifest's declared order on the manifest screen.
REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once reaches no criterion here, which writes nothing. Belongs: the task delivering release and the draft-only composition path.
REMAINDER, from the specification — rules/knowledge/a-case-version-moves-through-its-declared-lifecycle reaches no criterion here. Belongs: the task delivering the case-version lifecycle operations (contracts/knowledge/case-lifecycle).
REMAINDER, from the specification — rules/knowledge/validation-runs-at-every-read reaches no criterion here; the revisions listing this task reads is not a case-version read. Belongs: the task delivering case-query's validated case-version read, and the replay path in the investigation act.
