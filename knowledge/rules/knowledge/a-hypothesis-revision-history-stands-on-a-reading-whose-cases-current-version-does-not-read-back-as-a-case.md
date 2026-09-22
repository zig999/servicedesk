---
type: policy
statement: >-
  A surface presenting the revisions of one hypothesis of a case to a reader who named that
  case's slug and that hypothesis and named no version presents those revisions on a reading
  whose read of the case's current version was refused because some validator rule of
  validation-runs-at-every-read does not hold for that version at that reading, and states on
  that reading no fact derived from that version's manifest, whether any of the revisions
  presented is the one the case currently uses included.
expression: >-
  For a case c, a hypothesis h of c, and a surface presenting h's revisions to a reader who
  named c by its slug and h by its name and named no version of c: let v be the version, among
  the versions c currently holds, whose version number is highest. Where that surface's read of
  v was refused because some validator rule of validation-runs-at-every-read does not hold for
  v at that reading, and its own read of h's revisions answered, the surface presents the
  revisions that read answered. On that reading it states neither that some revision it
  presents is the revision c currently uses nor that c currently uses no revision of h, and it
  states nothing else derived from v's manifest. Neither the presenting nor the withholding
  turns on which validator rule failed over v — v's manifest holding no entry at all included.
  This settles no other reading of that surface: not one whose read of v answered, not one
  whose read of v has not answered or did not complete, and not one whose read of h's revisions
  did not complete. What the surface states about its own refused read of v is untouched here,
  and nothing is written by the revisions' presence.
constrains:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
  - domain/knowledge/case
consistency: eventual
---

## Description

`a-cases-current-pins-come-from-its-highest-numbered-version` sends a curator standing on a case's hypotheses to the one version whose manifest says which revision of each hypothesis the case currently uses, and `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` says what a surface reached by a slug alone tells the reader when that version does not read back at all — closing, as its neighbours do, by leaving what such a surface presents and offers to wherever this specification decides that.
A reader who named a case's slug and one of its hypotheses and named no version stands on both boundaries at once: the revisions they came for are answered by `list-hypothesis-revisions` of `contracts/knowledge/case-query` on a read that succeeded, while the pin that would mark one of them comes from a read that was refused.
Whether the content of the read that answered survives the read that did not was settled by neither node, so it fell to whatever a surface happened to render.

The refused reading is where the history is worth most. `validation-runs-at-every-read` makes a draft whose manifest declares no hypothesis fail a validator rule at every read, and `a-new-drafts-manifest-is-copied-from-an-existing-version` leaves a case's first-ever draft with no manifest to copy, so this refusal is where every case begins; `a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case` keeps the composition standing there precisely because the revision composed is the content `place-hypothesis` then puts into that manifest.
This surface is where the curator reads back what they composed, and `a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading` and `a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` have already spent their reasoning keeping the correcting route open across this same refusal. A history withheld on it hides a hypothesis's own content behind another read's failure and empties the end of that route.

The revisions take nothing from the version's read, which is why presenting them states nothing that read declined to answer.
`domain/knowledge/hypothesis-revision` makes the criterion, the collected concepts and the resolution the hypothesis's own content; `a-hypothesis-revisions-listing-answers-highest-revision-first` and `a-hypothesis-revisions-listing-discloses-each-revisions-own-state` are written over that listing alone and hold word for word whatever became of any other read; and `a-hypothesis-composition-states-which-of-its-reads-did-not-complete` already holds the revisions read apart from the version's on a neighbouring surface, on the reasoning that failing one teaches the surface nothing about the other.

The pin is the one thing on this surface that does come from the refused read, and nothing on this reading stands behind it.
`a-manifest-entrys-pinned-revision-is-always-shown` makes a pinned revision the manifest entry's own reference and refuses any other source for it, `a-cases-current-pins-come-from-its-highest-numbered-version` fixes the highest-numbered version's manifest as where a case-keyed surface reads those pins from, and `a-case-is-read-whole` leaves the refused read answering a complete validated version or nothing — so a revision marked as the one in use would be marked from a manifest nobody read.
The opposite statement is no safer. The refusal names the surface no rule, and a manifest that does pin a revision of this hypothesis sits inside a version refused for any other validator rule, so telling the reader the case currently uses no revision of it would assert as the case's current content a fact nobody read and that may be false — the substitution `a-manifest-entrys-pinned-revision-is-always-shown` refuses for a pin, made once more from a read that was not answered at all.

Withholding the marking is not the unexplained emptiness this specification has refused before. `a-case-holding-no-versions-is-told-explicitly` and `a-cases-current-pins-come-from-its-highest-numbered-version` both refuse a blank that reads alike whether nothing is pinned, the read failed or the read is still pending, and the reader here is left with no such blank to read: the refused read of the current version is stated on this surface by `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case`, exactly as that rule wrote it, and a pin unstated beside that statement is accounted for rather than silent. Nothing that rule forbids is presented here either: a revision of a hypothesis is not an attribute of the version, and the version's own content stays as unpresented as it was.

This decides the refused reading alone. What the surface presents or states where its read of the current version answered, where it has not answered, or where it did not complete is not settled here, and neither is what it does where its own read of the revisions did not complete. Which control carries the history, how it is worded and where it sits are form and belong to the interface, as this specification's other surface rules leave them.

Consistency is eventual: the fact spans the hypothesis's revisions and the case version whose validation is judged, each read separately.
