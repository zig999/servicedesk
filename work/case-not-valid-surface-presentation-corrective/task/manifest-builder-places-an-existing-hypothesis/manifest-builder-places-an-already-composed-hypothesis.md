---
title: The manifest builder places an already-composed hypothesis of the case into a draft version's manifest
summary: version-manifest-screen.tsx and use-manifest-builder.ts gain a control that lists the case's
  already-composed hypotheses this version's manifest does not hold and places a chosen one into it through
  the existing place-hypothesis call, so a curator who composed a hypothesis can get it into the manifest
  without composing a second one.
rationale: 'Cut as one task rather than a hook task and a screen task, because the scope names one gap
  and one falsifiable outcome -- a curator places an existing hypothesis -- and the candidate list, the
  placing act and its refusal presentation are not demonstrable apart from one another: use-manifest-builder.ts
  already holds the builder''s whole presentation state and version-manifest-screen.tsx only renders it,
  so the two files change for the same reason and land as one seam rather than an interface and its consumer.'
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-manifest-builder-places-an-existing-hypothesis.md
objective: From a draft case version's manifest builder, a curator selects one of the case's already-composed
  hypotheses that this version's manifest does not yet hold and places it into that manifest, without
  composing a new hypothesis identity.
criteria:
- On a draft version's manifest builder whose version record has arrived, the surface offers a control
  whose choices are the case's already-composed hypotheses, named by hypothesis name.
- That control's choices exclude every hypothesis this version's manifest already holds as a row.
- When every already-composed hypothesis of the case is already held by this version's manifest, the control
  offers no hypothesis to place.
- On that same reading the surface states that the case holds no further composed hypothesis to place,
  distinguishable from a choice list whose own read has not settled.
- Choosing a hypothesis and confirming the placement issues exactly one PUT to /v1/cases/{slug}/versions/{version}/manifest/{hypothesisName}
  for that placement.
- That request's body carries both revision and position, neither omitted, for a placement into a manifest
  that does not yet hold the hypothesis.
- The revision carried is the revision of the chosen hypothesis the curator selected on the placing
  control, defaulting to that hypothesis's highest existing revision but changeable to any other of
  its own revisions before confirming.
- The position carried is one the curator declares on the placing control, and is never derived
  from how many entries this version's current manifest holds or from any other fact of that
  manifest.
- After a settled placement the manifest builder shows the placed hypothesis as a row of the manifest
  table without the curator reloading the screen.
- A settled placement emits the manifest placement telemetry event naming the case slug, the version,
  the hypothesis name and the position, as the builder's existing move and repin placements do.
- A placement refused because the position is already occupied states, against the chosen hypothesis
  on the placing control, that this version's manifest already places a different hypothesis at the
  position that placement named and that this version's manifest stands exactly as it stood before
  the act — not only as the builder's generic save-failure toast — distinguishable from the telling
  the builder already states for a remove-hypothesis refused because the manifest would then hold no
  hypothesis.
- A placement refused because the hypothesis is already manifested in this version discloses neither
  the refusal's own error code, its message, nor any value it carries, and is presented as the same
  notice the builder already shows for a place or a remove refused with a code it holds no named
  presentation for.
- On a released version's reading the placing control is not offered, as the composing route already is
  not.
- The existing "+ Add hypothesis" route to the New Hypothesis screen stays offered on every reading of
  the manifest builder that offers it today.
- The placement goes through use-manifest-builder.ts's existing placeMutation, and the frontend holds
  no second call site issuing PUT over a manifest entry.
- The control's choices are derived from the existing case-hypotheses listing query and the existing hypothesis-revisions
  query, and the frontend gains no third way of finding a hypothesis's latest revision.
implements:
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/manifest-entry
- rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold
- rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names
- rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares
- rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
- rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
---

## What it is
Adds the missing act to the manifest builder: choosing one of the case's existing hypotheses and placing it into the draft version's manifest. The choices come from the case's own hypotheses listing, filtered against the manifest rows the builder already holds, each carrying the hypothesis's latest revision. The placement reuses use-manifest-builder.ts's placeMutation with a new call kind, which needs its own refusal branch so a position-occupied or already-manifested answer reaches the curator against the hypothesis chosen rather than as a generic toast.

## Notes
UNDERDETERMINED, from the specification, entry 1 — no criterion reaches the readings whose read of
the version was refused or has not yet answered, where
`a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions` and
`a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold`
both require the placing control offered with every one of the case's own hypotheses as a
candidate. This task's criteria scope the control to the "ready" phase alone; a control rendered
only there, absent on loading/load-error/not-valid, satisfies every criterion while the
specification requires more.

UNDERDETERMINED, from the specification, entry 2 — criterion 8's telling for a position-occupied
refusal is written to the node's full required content (names the occupying placement's position,
states the manifest unchanged, distinguishable from the remove-hypothesis telling); implementing
it narrower than that would satisfy no criterion here that checks its wording word for word, since
none quotes the exact text — only that it says these things.

REMAINDER, from the specification — the telling
`a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for` owes for a
remove-hypothesis refused as ManifestWouldHoldNoHypothesisError belongs to the manifest builder's
existing remove act (already delivered in `removeMutation`/`REMOVE_BLOCKED_MESSAGE`), not to this
task, which only places.

ADVISORY, from the specification — the candidate-hypotheses and empty-state criteria, and the
default-revision criterion, are phrased over "the case's already-composed hypotheses" and "that
hypothesis's [...] revisions" as a whole, while `contracts/knowledge/case-query`'s list-hypotheses
and list-hypothesis-revisions each answer one page
(`constraints/listings-are-paged`); today's `use-case-hypotheses.ts`/`use-hypothesis-revisions.ts`
request no offset or limit, so within this task's own scope the two coincide, and the criteria are
read over what those reads answer.

ADVISORY, from the specification — the telemetry criterion rests on no specification node (this
project's specification holds no telemetry vocabulary); it is read as a non-regression convention
this task follows (matching the builder's existing move/repin placements), not as implementing any
node.

ADVISORY, from the specification — the "+ Add hypothesis route stays offered" criterion is a
non-regression guard against the composing route already delivered by a prior task in this
initiative; it is not this task's own implementation of
`a-hypothesis-composition-stands-on-a-reading-whose-anchoring-version-does-not-read-back-as-a-case`.
