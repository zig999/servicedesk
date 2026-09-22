---
type: policy
statement: >-
  A placement of a hypothesis into a case version's manifest that holds no entry for that
  hypothesis pins exactly the revision of that hypothesis the placement itself names —
  whichever of that hypothesis's own revisions the curator chose and whatever state that
  revision carries — and never a revision the placement did not name, the hypothesis's highest
  existing revision included.
expression: >-
  For a case version v whose manifest holds no entry for hypothesis h, and a place-hypothesis
  over v naming h: the placement carries one revision r of h, chosen by the curator performing
  it, and the manifest entry the placement writes references exactly r — r's own state, draft
  or released, narrowing which revision may be named not at all and being left unmoved by the
  placing (scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state).
  No revision is substituted for the one the placement named, and none is supplied where the
  placement names none: the highest revision h currently holds is pinned exactly where it is
  the revision named and never for lack of a naming, and no entry ever stands pinning a
  revision chosen for the curator rather than by the curator. Nothing else is decided here —
  what answers a placement naming a hypothesis the manifest already holds stays
  a-hypothesis-is-manifested-at-most-once-in-a-case-version's own reservation, what a
  presented entry then states about its pin stays with
  a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest and
  a-manifest-entry-discloses-a-higher-revision-of-its-hypothesis, and which readings offer the
  placing at all stays with
  a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions.
constrains:
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
consistency: eventual
---

## Description

`domain/knowledge/manifest-entry` requires every entry to reference exactly one hypothesis-revision, and `domain/knowledge/case-version` already frees a draft's manifest to be composed "pointing at any of that hypothesis's own revisions".
Which revision arrives at an entry being composed for the first time, and whether it is the curator's own choice or something the placing derives, was addressable nowhere: `a-presented-manifest-entry-says-whether-its-pinned-revision-is-the-latest` compares a pin against the hypothesis's highest existing revision only for an entry already presented, and `a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` states that the act is offered while expressly leaving what a `place-hypothesis` then issued answers untouched.

The freedom `case-version` declares is reachable through no other act.
An entry comes to reference a revision in exactly two ways — copied whole from an existing version (`a-new-drafts-manifest-is-copied-from-an-existing-version`), or written by a placing — so a placing that always pinned the hypothesis's highest existing revision would leave "any of that hypothesis's own revisions" a freedom no curator could exercise: the earlier revision a rollback draft continues from, and the released revision a curator keeps while a draft revision stands above it, could be named by nobody.

A derived pin would also commit the version to a fact nobody read.
The highest existing revision is a fact of a second aggregate, read separately, and `a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` stands the offer precisely on the readings where the surface has read least — a read of the version refused, a read that has not yet answered.
Deriving the pin there would write the version's content from a read that may never have completed, which is what `a-manifest-entrys-pinned-revision-is-always-shown` refuses as a source for a pin and the same substitution `a-cases-current-pins-come-from-its-highest-numbered-version` refuses when it declines to answer with "its own highest existing revision" for a hypothesis the current version's manifest holds no entry for.
`replay-is-pinned` rests on an adopted content being deliberate: what a released version answers forever is chosen once, by the curator, never by whichever revision happened to be highest at the moment the entry was written.

Nothing is lost where the curator's intent is the newest content.
The revision just written is the one in front of the curator when `a-revise-offers-the-draft-manifest-only-when-the-pin-must-move` sends them to the draft's manifest on exactly this condition — the manifest holding no entry for the hypothesis at all — so naming it costs a choice already made.
A placing carrying no revision at all is not this rule's business: `manifest-entry` requires the reference, so such a request fails the shape `constraints/a-malformed-request-is-refused-with-a-validation-error` already answers, and no entry stands pinning a revision nobody chose.

Policy with eventual consistency because the revision named is a fact of `hypothesis-revision`, an aggregate root apart from the case version whose manifest holds the entry — the crossing `a-released-case-version-manifests-only-released-hypothesis-revisions` already gives this same reasoning for.
Which control offers the choice, and how the hypothesis's revisions are listed for it, are form and belong to the interface; that the revision the placement carries is the one the curator chose is not.
