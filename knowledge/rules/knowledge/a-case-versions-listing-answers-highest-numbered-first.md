---
type: invariant
statement: A listing of one case's versions answers them in descending version-number order, the case's own highest-numbered version first and its first-ever version last.
constrains:
  - domain/knowledge/case-version
---

## Description

rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first already decided this exact shape once, for the sibling listing of one hypothesis's own revisions: the newest of a set a curator browses is what a curator most often needs, so it is what a reading with no further condition answers first, rather than a reading a curator has to page or sort to reach. A case's own versions are the same shape of set — an append-only sequence a-case-version-number-is-never-reused numbers once and never renumbers — so the reasoning that decided the sibling listing decides this one the same way.

Nothing about which version rules/knowledge/a-cases-current-pins-come-from-its-highest-numbered-version reads, or which one a-case-summary-is-derived-from-its-existing-versions derives current_state and last_updated from, turns on this listing's own order — both already name "highest-numbered" directly, by the version's own number, never by a position this listing answers it at. This rule states only the order the listing answers in; a reader who wants the highest-numbered version can already name it without reading this listing at all.
