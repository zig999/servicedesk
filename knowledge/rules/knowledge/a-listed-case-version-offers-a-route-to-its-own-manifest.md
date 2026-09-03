---
type: policy
statement: >-
  A curator reading a listing of a case's own versions is offered, for every version that
  listing presents, a route to that version's own manifest — for a version in either state,
  draft or released, and on every reading of the listing, with no revise of any hypothesis
  having to have happened for the route to be there.
expression: >-
  For a case c and a listing of the versions c currently holds: for every version v the
  listing presents, the presentation of v carries a route to v's own manifest. The route's
  presence turns on nothing further — not on v's state, whichever of draft or released it
  holds, and not on whether any revise of any hypothesis of c preceded the reading. A
  listing presenting no version of c carries no such route, there being no version to
  present.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
consistency: eventual
---

## Description

The listing is the read a curator browses one case's versions by — `list-case-versions` of `contracts/knowledge/case-query` — where each presented version names itself and nothing about its manifest is carried alongside it.
A version's manifest is where the revisions that version uses stand, so a curator reading the listing is one step away from the only place those revisions can be read, and this states that the step is offered rather than left to whatever address a reader could construct.
`listings-are-paged` makes the listing one page of a case's versions, so the route is owed per version the listing presents rather than per version the case holds.

The version's state does not narrow it. `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already holds that a version's state answers whether it may still be composed and whether it may be diagnosed against — never how much of what is true about it a reader is shown — and `a-cases-current-pins-come-from-its-highest-numbered-version` took that same answer for a case-keyed surface reading a version's manifest. A released version's manifest is exactly what a reader auditing a past investigation has to reach, since `a-case-version-is-written-once` and `a-released-version-keeps-its-original-revision` make that manifest the record of which revisions actually ran; withholding the route there would put the audit's own subject furthest out of reach.

The route is independent of any revise. `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` states what a completed revise offers and on which of its own two outcomes, and is written over the revise alone; it says nothing about a listing, and this says nothing about a revise. The two carry different content and so do not stand in each other's way: that rule's offer carries the fact that the draft is not yet using what was just written, owed exactly where that is true and nowhere else, while this route carries nothing beyond where a version's manifest is read. A curator who reaches a manifest from the listing learns nothing about whether a pin must move, which is the whole of what the revise's own offer says.

What may then be done through the route this decides nothing about: composing a manifest stays exactly where `case-version` and `a-case-version-is-written-once` already put it — freely while draft state holds, never once released — so a released version's manifest is reached to be read and never to be altered. No manifest entry gains a disclosure for this, no pin moves, and no call is refused.
Which control carries the route, its wording and where it sits are form and belong to the interface, not here.

Consistency is eventual because the fact spans the case whose versions are listed and each of those versions, read separately.
