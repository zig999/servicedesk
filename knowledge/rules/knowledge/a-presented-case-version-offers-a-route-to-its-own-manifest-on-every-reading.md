---
type: invariant
statement: >-
  A surface presenting one case version a reader named — by that case's own slug together
  with that version's own number — offers the curator a route to that same version's own
  manifest on every reading of that surface, its presence turning on nothing further: not
  on that version's state, and not on whether the read of that version read back as a case
  at that reading, including a reading where that read has not yet answered, a reading
  where it failed, and a reading where it was refused because some validator rule does not
  hold for that version.
expression: >-
  For a case c, a version v of c, and a surface presenting v to a reader who named c's slug
  together with v's own version number: that surface carries a route to the manifest of
  that same v, and never to the manifest of any other version of c. The route's presence
  turns on nothing further — not on which of draft or released v's state holds, not on
  whether every validator rule of validation-runs-at-every-read holds for v at that
  reading, and not on what that surface's own read of v answered: it stands alike while no
  answer for v has arrived, where that read failed, and where that read was refused because
  v does not currently read back as a case. A surface presenting no case version carries no
  such route, there being no version whose manifest to reach.
constrains:
  - domain/knowledge/case-version
---

## Description

`a-listed-case-version-offers-a-route-to-its-own-manifest` owes this route from a listing of one case's versions, and is written over that listing alone — its expression opens on "a case c and a listing of the versions c currently holds", and every version it reaches is one that listing presents.
A reader who named one version is on no listing: that is the surface `a-successful-case-version-creation-lands-on-the-created-versions-own-surface` takes a curator to once a create-draft succeeds, and the one `a-presented-case-version-states-its-own-declared-attributes` states that version's own attributes on. Whether it carries the same route, and whether it carries it on a reading where the version's own read did not answer as a case, stood decided nowhere.

The reason the listing owes the route holds here unchanged. A version's manifest is where the revisions that version uses stand, and it is addressed by the case's slug together with that version's own number — exactly the two facts this surface was reached by. A route owed from the listing and withheld here would hand the further reader what the nearer reader is left to construct.

The presence turns on nothing about the read, on the ground `a-case-listing-offers-a-route-to-author-a-new-case-on-every-reading` already states for a route: the read backing a surface answers what is stored and nothing about whether the act the route reaches may be performed, so a route conditioned on that read withholds an act for a reason unrelated to it, and the readings a condition would drop it from are precisely the ones where the reader has nothing else on the surface to act on.
Here that is sharpest at the refused reading. `validation-runs-at-every-read` makes a version that declares no hypothesis not read back as a case at all, `a-case-version-failing-validation-at-a-read-is-refused-by-name` gives that reading its own refusal, and the manifest this route reaches is precisely where `place-hypothesis` (`contracts/knowledge/case-lifecycle`) composes the entry that ends the condition. A route dropped there is dropped exactly where it is the only correction left.

The version's state does not narrow it either, on the answer `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` fixed and `a-cases-current-pins-come-from-its-highest-numbered-version` and `a-listed-case-version-offers-a-route-to-its-own-manifest` each took after it: a version's state answers whether it may still be composed and whether it may be diagnosed against, never how much of what is true about it a reader is shown.

Nothing here weakens what the surface states. `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` forbids presenting any attribute of a version that does not validate as the case's current content, and this route is no attribute of the version: it carries the case's slug and the version's number, which the reader themself supplied, and discloses nothing the read answered. `a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete` is untouched for the same reason, and `a-newly-created-draft-offers-no-act-before-its-own-record-arrives` already says of its own interval that any route this specification owes from a case's surfaces is offered in it exactly as outside it — this states one such route, rather than an act over a record nobody has read.

What may then be done through the route this decides nothing about: composing a manifest stays exactly where `case-version` and `a-case-version-is-written-once` already put it — freely while draft state holds, never once released — so a released version's manifest is reached to be read and never to be altered.
`a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` is written over a completed revise and carries the fact that the draft is not yet using what was just written; this carries nothing beyond where a version's manifest is read, so the two do not stand in each other's way.
No manifest entry gains a disclosure, no pin moves, and no call is refused. Which control carries the route, its wording and where it sits are form and belong to the interface, not here.
