---
type: policy
statement: >-
  A surface presenting a case's hypotheses and, for each hypothesis, the revision of its
  content the case currently uses reads every one of those pinned revisions from the
  manifest of the case's highest-numbered version, and from no other version of that case;
  for a hypothesis that version's manifest holds no entry for — including every hypothesis
  of a case currently holding no version at all — the surface states explicitly that the
  case currently uses no revision of that hypothesis, never omitting the hypothesis and
  never presenting any revision of it as the one in use.
expression: >-
  For a case c and a surface presenting c's hypotheses with the revision of each
  hypothesis's content c currently uses: let v be the version, among the versions c
  currently holds, whose version number is highest. For every hypothesis h that v's
  manifest holds an entry for, the revision the surface states as the one c currently uses
  is exactly the revision that entry references; no manifest entry of any other version of
  c, and no revision of h read from anywhere else, ever supplies it. For every hypothesis h
  of c that v's manifest holds no entry for, and for every hypothesis of c where c
  currently holds no version at all and so no such v exists, the surface presents h and
  states of it that c currently uses no revision of it; it states no revision number for h
  and leaves nothing unsaid beside h's name.
constrains:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis
consistency: eventual
---

## Description

A hypothesis belongs to the case identity and to no one version of it, so a surface keyed by the case rather than by a version has no version named for it — while the revision the case currently uses is a fact only some one version's manifest carries.
Which version that is has to be decided, or the surface answers from whichever version happened to be read.

The highest-numbered version is the one this specification already reads as the case as it currently stands: `a-case-summary-is-derived-from-its-existing-versions` derives both `current_state` and `last_updated` from it, on the reasoning that a case's `next_version` counter issues each number once and always higher, and a version is only ever created after every version before it — so the highest-numbered version a case currently holds is always its most recently authored one, whichever of draft or released its own state happens to be.
`a-case-has-at-most-one-draft` makes that same version the case's own draft wherever it holds one, since a draft is assigned its number from that counter the moment it is created, and its latest released version wherever it holds none.
Reading the pins from any other version would show a curator composing a draft the pins of a version `a-case-version-is-written-once` no longer lets anyone change.

The version's state does not narrow this. `a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis` already holds that a version's state answers whether it may still be composed and whether it may be diagnosed against, never how much of what is true about it a reader is shown; which version a case-keyed surface reads is the same kind of question and takes the same answer.

A hypothesis of the case with no entry in that version's manifest is the ordinary second state of a manifest with respect to a hypothesis, not an edge of the store: `a-hypothesis-is-manifested-at-most-once-in-a-case-version` reads a manifest as holding one entry for a hypothesis or none, `a-new-drafts-manifest-is-copied-from-an-existing-version` gives a case's first-ever draft no manifest to copy at all, `remove-hypothesis` takes an entry back out while draft state holds, and a case whose one and only draft was discarded holds no version to read a manifest from.
In every one of those, the hypothesis still exists — it is named across every version the case ever holds — and the case simply uses no revision of it right now.
The surface says exactly that. Dropping the hypothesis from view would hide the one hypothesis a curator must reach `place-hypothesis` for, which is precisely the gap `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` offers a route to close; and answering with some revision of it — its own highest existing revision, or the pin some other version of the case holds — would state as in use a revision no manifest of the case's current version pins, which `a-manifest-entrys-pinned-revision-is-always-shown` refuses as a source for a pin.
Leaving the answer blank instead is the silence `a-case-holding-no-versions-is-told-explicitly` already rejects and `a-case-summary-is-derived-from-its-existing-versions` already answered the same way for a case with no version: the absence is stated, never inferred from an empty space that reads alike whether nothing is pinned, the read failed, or the read is still pending.

What this rule decides is only which version's manifest is read, and what is said where that manifest carries no entry for a hypothesis. What each entry that does exist then states stays exactly where it already sits: `a-manifest-entrys-pinned-revision-is-always-shown` makes the pinned revision the entry's own reference rather than anything recovered from a listing of that hypothesis's revisions, and `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` carries the comparison against the hypothesis's highest existing revision — both written over an entry, so neither reaches a hypothesis with no entry to present. No pin moves for this, no entry gains a disclosure, and no call is refused.

Consistency is eventual: the fact spans the case, the version whose number is compared against its siblings', and that version's own manifest entries, each read separately.
