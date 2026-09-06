---
type: policy
statement: >-
  A curator composing a hypothesis revision may abandon that composition before submitting
  it; the abandonment writes no revision, leaves the hypothesis's existing revisions and
  its case's draft version exactly as they were, and returns the curator to the screen the
  composition was opened from.
expression: >-
  For a composition of a revision of hypothesis h, opened from screen s and abandoned
  before it is submitted: no revise of h is requested, so h's revisions are exactly the
  revisions h held when the composition opened — the same numbers, the same content and
  the same states — the draft version of h's case is exactly what it was, in its own
  declared attributes and in every entry of its manifest, and the curator is returned to
  s. Abandonment is available for as long as the composition has not been submitted, and
  turns on nothing else: not on whether a submit would have replaced h's highest existing
  revision in place or created h's next revision, and not on how much of the composition
  was filled in.
constrains:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
consistency: eventual
---

## Description

Composing a revision and saving one are two moments, and everything this specification states about a revise is stated about the second: `a-hypothesis-revision-is-overwritten-while-unreleased` decides which revision a save lands on, `a-revise-answers-the-revision-number-it-saved` states what the curator is told once it has, and `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` states what a completed revise then offers — each of them beginning where a submitted revise ends.
A curator who opens a composition and does not submit it reaches none of those moments, and this states that the not-reaching is an offered act rather than an accident of navigation: a curator who opened the wrong hypothesis, or thought better of a criterion's wording, has a way out that costs nothing.

Writing no revision is the whole of what the abandonment does to the hypothesis, and it is neither of the two acts that do write.
It is not `discard` (`only-a-draft-case-version-may-be-discarded`), which removes a draft version that already exists; a composition is not a revision until it is submitted, so there is nothing here to remove.
It is not a save of unchanged content either: a save would still land somewhere by `a-hypothesis-revision-is-overwritten-while-unreleased` — replacing the highest existing revision's content in place, or creating the next number where a released version had frozen the one the draft pins — and `a-hypothesis-revision-number-is-never-reused` would keep a number so spent spent.
Abandoning is the absence of that call, so every revision the hypothesis holds keeps its number, its content and its own state, and `a-hypothesis-revisions-listing-answers-highest-revision-first` answers afterwards exactly what it answered before.

The case's draft version is named for the same reason a revise reads it at all.
`a-hypothesis-is-revised-only-against-its-cases-draft` makes that draft the anchor a submitted revise is checked against, and `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` reads its manifest afterwards to decide what to offer; an abandonment does neither, so no pin moves, no manifest entry is added or removed, and no declared attribute of the draft changes.
A curator may abandon and open the composition again as often as curation needs, and the version being composed is what it was.

Returning to the screen the composition was opened from is part of the fact rather than its presentation: what a curator can do next is decided by where the abandonment leaves them, and leaving them anywhere else would cost them the place in the case they were curating to buy nothing.
Which control carries the abandonment, its wording and where it sits are form and belong to the interface, not here.

Consistency is eventual because the fact spans two aggregates read separately: the hypothesis whose revisions are unchanged, and the case version whose draft is unchanged.
