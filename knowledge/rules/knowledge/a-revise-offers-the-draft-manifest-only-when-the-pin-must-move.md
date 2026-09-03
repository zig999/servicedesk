---
type: policy
statement: >-
  A curator who has just revised a hypothesis is offered a way to reach the manifest of that
  case's draft version whenever the revision the revise wrote is higher than the revision
  that draft version's manifest entry for the hypothesis pinned immediately before the
  revise, and whenever that draft version's manifest holds no entry for the hypothesis at
  all; where the revise wrote into the very revision that entry already pins, no such offer
  is made.
expression: >-
  For a revise of hypothesis h whose case holds draft version d: let written be the revision
  number the revise wrote — h's own highest existing revision, overwritten in place, or the
  next revision it created — and pinned be the revision number d's manifest entry for h held
  immediately before the revise. The completed revise offers a route to d's manifest where
  d's manifest held no entry for h, and where written > pinned; it offers none where written
  == pinned. No third relation arises: pinned never exceeds h's highest existing revision
  before the revise, so written is never lower than pinned.
constrains:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
  - domain/knowledge/case-version
consistency: eventual
---

## Description

The offer exists for one reason: what the curator just wrote does not yet reach the version being composed, and the draft's own manifest is the only place that can be fixed.
Where the revise created the next revision — `a-hypothesis-revision-is-overwritten-while-unreleased`'s create branch, taken because a released version had already frozen the revision the draft pins — the draft's entry now names a superseded number, and only moving that pin makes the new content part of the version being composed.
Where the draft's manifest holds no entry for the hypothesis at all, the same gap is wider still: nothing the curator wrote is used by any version until the hypothesis is placed, which is what `place-hypothesis` (`contracts/knowledge/case-lifecycle`) exists for and what `a-case-has-at-least-one-hypothesis` will hold the release to.
The two offered branches are one condition read from two ends — the draft's manifest does not currently carry what was just written — and the missing entry is its degenerate case, where there is no pin to be behind.

The silent branch is the ordinary curation loop the overwrite rule was written for. An in-place overwrite leaves the entry pinning exactly the revision whose content changed, so the draft is already using what was just saved: `a-draft-revision-is-overwritten-by-repeated-saves` states precisely this — the entry still pins revision 2 and discloses no higher revision. Offering a repin there would send the curator to correct an entry that is already correct, and a step that is always available and never necessary teaches a curator to ignore it on the occasions it is necessary.

This rule states when the route is offered, and nothing about what may then be done through it. The comparison it turns on is the one `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` already makes on a presented entry, read here at the moment of the revise rather than at the moment of presentation; no new disclosure is added to any manifest entry, and no pin moves on its own — composing a draft's manifest stays exactly where `a-case-version-is-written-once` and `case-version` already put it.
Consistency is eventual because the fact spans two aggregates: the hypothesis whose revision was written, and the case version whose manifest is read to answer whether that revision is the one it pins.
Which control carries the offer, its wording and where it sits are form and belong to the interface, not here.
