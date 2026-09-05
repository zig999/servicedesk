---
type: policy
statement: >-
  A surface presenting a case version's manifest states, for every entry, the state — draft or
  released — of the hypothesis-revision that entry pins, so a curator reading the manifest
  learns which of its pinned revisions are still in draft from the manifest itself, never only
  from a refused release of that version; while the read of that revision's state has not yet
  completed the entry states explicitly that this pin's state is still being read, and where
  that read fails the entry states explicitly that this pin's state could not be read, so that
  neither window is ever presented as a state and neither is left indistinguishable from an
  entry carrying no state at all.
expression: >-
  For every entry e presented in a case version's manifest, the presentation of e states the
  value of e's referenced hypothesis-revision.state, read from that revision itself; the
  statement is unconditional — it does not depend on the case version's own state, on a release
  of that version having been attempted, or on the reader opening e's revision selector. Where
  that read has not yet returned, the presentation of e states that e's pinned revision's state
  is still being read; where that read fails, the presentation of e states that e's pinned
  revision's state could not be read. The three presentations — a state read, a read still
  outstanding, a read that failed — are distinguishable from one another to the reader, and
  none of them is the presentation of an entry that carries no state.
constrains:
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

A pinned revision's own state now decides whether the case version around it may be released at all: `a-released-case-version-manifests-only-released-hypothesis-revisions` refuses the release of any version whose manifest still references a revision in draft state.
Left unstated on the entry, that fact reaches the curator only through the refusal — a manifest whose every pin is releasable reads exactly like one where none is, and the single act that tells them apart is the act that fails.

This specification has already refused a silence of this shape three times around this same fact.
`a-manifest-entrys-pinned-revision-is-always-shown` and `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` both exist because an entry that reads identically in two materially different situations tells the reader nothing about which one they are in, and `a-hypothesis-revisions-listing-discloses-each-revisions-own-state` states this very fact — the revision's own state — on the adjacent listing of one hypothesis's revisions.
Disclosing the state where a curator inspects revisions and withholding it where a curator composes the version that depends on it would leave the fact addressable everywhere except the one surface whose next act it governs.

The state is read from the revision itself, an aggregate root separate from the case version whose manifest carries the entry, so between the manifest arriving and that read settling there is a window in which the entry has no state to show, and a read that fails leaves it with none at all.
A blank in either window is the same silence this rule was written against: an entry showing nothing reads exactly like one whose pin is released, one whose pin is still in draft, and one where nobody ever asked — and the curator would take the manifest as answered while the one fact governing its next release stayed unknown to them.
So each window is stated in its own right, and each is distinguishable from a state actually read and from the other, because the curator's next act differs across the three: an outstanding read resolves on its own and is worth waiting for, a failed read is worth retrying, and a state read is what the curator composes against.
`a-case-holding-no-versions-is-told-explicitly` already refuses an emptiness a reader cannot tell from a pending read or a failure over a stored set, and `releasing-an-already-released-revision-tells-the-curator-so` already refuses collapsing one known outcome into an undifferentiated failure notice; this is that same discipline, on this surface.
Neither window touches what the entry states about the pin itself: `a-manifest-entrys-pinned-revision-is-always-shown` still has the entry stating the hypothesis-revision it pins, which is the entry's own reference and needs no read of that revision to be known.

Nothing here moves what the refusal owes: a release attempted over a draft pin is still refused naming every such hypothesis among its violations, and that naming stays the refusal's own.
This rule makes the refusal predictable rather than the only source of the fact.
Nor does it restrict composition — placing an entry that pins a draft revision is still never refused, and the state shown beside it is a disclosure, not a warning this specification words.

On a released version's entry the state necessarily reads released, since that version's own release required exactly that and released is terminal; the statement stays universal rather than narrowed to drafts, because the rule says what an entry carries and not what its reader may still change — the same reading `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already gives a released entry.
The rule is a policy holding eventually because the state is a fact of `hypothesis-revision`, an aggregate root separate from the case version the entry sits inside, and a revision's release reaches into no version's manifest to change it.
Which control carries the statement, and the wording of all three — a state read, a read still outstanding, a read that failed — are form and belong to the interface, not here.
