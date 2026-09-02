---
type: invariant
statement: A listing of one hypothesis's revisions answers them ordered by revision number descending, highest first, so the first page of that listing carries that hypothesis's highest existing revision.
expression: For a listing of the revisions of one hypothesis answering r1..rn in answer order, r_i.revision > r_i+1.revision for every i in 1..n-1; and where the total answered is not zero, the page at offset 0 carries the revision whose number is the highest any revision of that hypothesis currently holds.
constrains:
  - domain/knowledge/hypothesis-revision
---

## Description

Both facts this order rests on are the revision's own: the number it is identified by, and the hypothesis it references.
A hypothesis's first revision is numbered 1 and each later one is exactly one past its highest existing revision, never reused and, unlike a case version, never discarded (`a-hypothesis-revision-number-is-never-reused`), so ordering by that number is a total order over the answered set — no tie to break, and no second fact to read to establish it.

`listings-are-paged` makes any listing of a hypothesis's revisions one page selected by an offset and a limit, and says nothing about which revisions a given page carries.
Left undeclared, the order would be whatever the storage's own arrangement returned, and which revisions a curator can reach without paging would follow from that arrangement rather than from a decision — the same substitution `hypotheses-are-ordered-by-precedence` already refuses for a manifest's precedence.

Descending is the direction that keeps the newest content reachable.
The highest existing revision is what a curator adopts into a draft's manifest and what a reader auditing a pin compares against; ascending order would place exactly that revision on the last page, one page further out of reach with every revision the hypothesis gains.
It is the same asymmetry `a-manifest-entrys-pinned-revision-is-always-shown` reads from the other end — later revisions accumulate past an old pin — answered here so that the ordinary first page corroborates the comparison instead of burying it.

This makes no presentation depend on a page, and changes none.
`a-manifest-entrys-pinned-revision-is-always-shown` states an entry's pinned revision whatever page of revisions arrived beside it, and `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` compares the pin against the hypothesis's highest existing revision rather than against the highest one a page answered; both hold word for word whether or not any page carries the pin or the highest.
The rule decides the order of this one listing and nothing about the other listings `listings-are-paged` governs, and nothing about which revisions a pin may be moved to, which stays case-version's own.
