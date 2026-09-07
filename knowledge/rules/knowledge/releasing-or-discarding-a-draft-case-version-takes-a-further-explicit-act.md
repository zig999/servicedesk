---
type: invariant
statement: >-
  Releasing a draft case version and discarding one each take effect only where the curator,
  having asked for that act, states in a further, explicit act that it is to be performed;
  neither is performed on the asking alone, and where the curator does not so state the
  version stands in draft exactly as it stood, its own declared attributes and every entry of
  its manifest untouched. The discard's further act carries more than the statement: it is
  performed only where the curator reproduces the case's own slug, so that the act which
  destroys a version is one no curator reaches without naming what they are destroying. The
  release's further act carries the statement alone.
expression: >-
  For a draft case version v of case c and a curator on a surface offering v's release or v's
  discard: the curator's asking for either act issues neither. A release of v is issued only
  where the curator, having asked for it, states in a further act that the release is to be
  performed. A discard of v is issued only where the curator, having asked for it, states in a
  further act that the discard is to be performed and reproduces c's own slug in that act; an
  act reproducing no slug, or reproducing one that is not c's, issues no discard. Where the
  curator does not so state, v is neither released nor discarded — v's state is draft as it
  was, every declared attribute of v holds the value it held, and v's manifest holds exactly
  the entries it held, at the same positions and referencing the same hypothesis-revisions.
  This turns on nothing else — not on which surface the act is offered from, not on whether v
  meets the release conditions
  a-surface-offering-release-states-which-release-conditions-the-draft-meets discloses, and
  not on how much of v the curator composed.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
---

## Description

Release and discard are the two acts `contracts/knowledge/case-lifecycle` publishes that end a draft's composition, and this specification can answer neither of them back.
Release is the one trigger that leaves draft and released is terminal (`a-case-version-moves-through-its-declared-lifecycle`); what it produces is never altered again, and revising a case's content composes the next draft version instead (`a-case-version-is-written-once`).
Discard removes the version and its own manifest entries (`only-a-draft-case-version-may-be-discarded`), and the number that version held is spent rather than returned (`a-case-version-number-is-never-reused`).
No operation of `contracts/knowledge/case-lifecycle` unreleases a version or restores a discarded one, and `contracts/system/case-authoring` promises the immutability rather than a way out of it.
Left unstated, whether the curator's asking for one of these acts is the act itself fell to whatever a surface happened to offer.

The further act is owed because this specification already reads an act it cannot answer back as one the curator states rather than one a surface infers.
`a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` took exactly that reading, on the ground that the discard destroys content held nowhere else and no operation of the contract can answer it back, and on the ground that it differs from an abandonment in the one respect that bears on protection: an abandonment ends the operator's engagement and shows itself by landing them somewhere they were not, while the protected act leaves them where they were and expecting to continue.
Both acts here meet that ground more squarely than the act it was decided for, because what they freeze or destroy is not an edit a surface was holding but the stored version itself, with its declared attributes and its whole manifest.
The contrast holds here too, and this specification has already drawn it: `an-abandoned-case-version-edit-writes-nothing` and `an-abandoned-revision-composition-writes-nothing` each give a way out that writes nothing and shows itself by returning the curator to the surface the editing was reached from, and each is available for as long as nothing has been submitted; release and discard are issued from the surface the curator stays on and they write, so nothing about them announces itself as a leaving does, and the act after a mis-triggered one is taken on a version that can no longer be corrected at all.

The two acts are not protected identically, because what they destroy is not the same kind of thing.
A release ends a draft by turning it into something that answers for investigations forever, and everything it produced remains readable: the version stands, its attributes stand, its manifest stands, and `only-a-released-case-version-is-diagnosed` makes it the thing diagnosis runs against.
A discard ends a draft by removing it, taking its own manifest entries with it and spending its number for good (`a-case-version-number-is-never-reused`); what the curator composed is not frozen but gone, and no reading of any surface recovers it.
So the discard's further act carries the case's own slug reproduced by the curator, and the release's does not: reproducing the slug is what makes the act one a curator cannot complete without naming the thing being destroyed, and a curator who cannot name it is a curator who did not mean to destroy it.
That the case holds at most one draft (`a-case-has-at-most-one-draft`) settles which version a discard would take, and settles nothing about whether the curator meant to take it — the slug answers intent, not ambiguity.

Nothing here moves what either act evaluates or what it owes.
A release attempted is still refused once, naming every violated rule together (`a-release-refusal-with-no-named-violation-says-so`), still requires every manifest entry to pin a released revision (`a-released-case-version-manifests-only-released-hypothesis-revisions`), and is still refused over a version not in draft by `a-case-version-moves-through-its-declared-lifecycle`; a discard is still refused over anything but a draft by `only-a-draft-case-version-may-be-discarded`.
What a surface offering release must disclose stays exactly where `a-surface-offering-release-states-which-release-conditions-the-draft-meets` put it — stated before any release is attempted and without the curator opening any further control, so the further act this rule states is never where that disclosure lands.
The leaving keeps its own shape and takes no further act: `an-abandoned-case-version-edit-writes-nothing` still writes nothing and still returns the curator to the surface the editing was reached from.
Which control carries each act, which carries the further act, their wording, where they sit and how the second is presented to the curator are form and belong to the interface, not here; that the discard's further act carries the slug is what it requires of the curator, never how a surface asks for it.
