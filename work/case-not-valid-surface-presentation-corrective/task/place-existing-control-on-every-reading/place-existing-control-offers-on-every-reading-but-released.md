---
title: The manifest builder's place-existing-hypothesis control offers on every reading but a released
  version
summary: version-manifest-screen.tsx and use-manifest-builder.ts stop gating PlaceExistingHypothesisControl
  and its candidate list to the "ready" phase alone, so the control -- and the case's hypotheses not yet
  in this version's manifest -- are offered on the loading, load-error and not-valid readings too, exactly
  as the pre-existing "+ Add hypothesis" link already is.
rationale: 'Corrective: the prior task''s own UNDERDETERMINED entry 1 disclosed this narrowing as a known
  gap against rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
  and rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold,
  both of which this task now closes rather than leaves open, because the refused (case-not-valid) reading
  is exactly the reading a draft''s empty manifest reaches immediately -- the reading the control exists
  to correct.'
sources:
- work/case-not-valid-surface-presentation-corrective/intake/scope-place-existing-control-on-every-reading.md
objective: The manifest builder offers the place-existing-hypothesis control, with the case's own hypotheses
  not yet in this version's manifest as its candidates, on every reading of the manifest builder except
  one that answered the version released -- the loading, load-error and not-valid readings included --
  exactly as the pre-existing composing route is already offered.
criteria:
- On the manifest builder's loading reading (the version's own read has not yet answered), the screen
  still indicates the version read is pending, and the placing control is offered alongside that
  indication.
- On the manifest builder's load-error reading (the version's own read failed with a code the screen holds
  no presentation of its own for), the screen still states that read as one that did not complete and
  still offers the existing act to retry it, disclosing no error code, message or value the refusal
  carries, and the placing control is offered alongside that statement.
- On the manifest builder's not-valid reading (the version's own read was refused because a validator
  rule of validation-runs-at-every-read does not hold), the screen states explicitly that the version
  named — this slug together with this version number — does not read back as a case, distinct from the
  wording a case-keyed surface (one addressed by slug alone) uses for a case whose current version does
  not read back as a case, and the placing control is offered alongside that statement.
- On the not-valid reading, the screen presents no attribute of the named version and no entry of that
  version's manifest as its current content — no title, no state, no manifest row, whether read fresh
  or left in the query cache from an earlier successful read of the same version — beside the
  version-keyed statement and the placing control.
- On each of those three readings, the control's candidates are exactly the case's own already-composed
  hypotheses that read answered, with none excluded (since none of those readings answers a manifest to
  exclude against), turning on nothing about which validator rule failed over the version, where the reading
  is the not-valid one.
- On each of those three readings, once the case's own hypotheses read has answered and leaves no
  candidate, the control states explicitly that the case holds no hypothesis that is not already in this
  version's manifest, distinguishable from what it shows while that read has not yet answered.
- On each of those three readings, the control still lets the curator choose the revision and declare
  the position exactly as it does on the ready reading — a default may be pre-selected, but neither value
  is fixed or derived from anything other than the curator's own choice before confirming.
- Confirming a placement on any of those three readings still issues exactly one PUT to /v1/cases/{slug}/versions/{version}/manifest/{hypothesisName},
  with the same body shape (revision, position) as on the ready reading.
- A placement confirmed on any of those three readings and refused because the position is already
  occupied states the same telling, against the chosen hypothesis, that the ready reading's control
  already states for that refusal — naming the collision and that the manifest stands unchanged — not the
  generic unrecognised-failure notice.
- A placement confirmed on any of those three readings and refused because the hypothesis is already
  manifested in this version, or for any other reason this control holds no named telling for, discloses
  neither the refusal's own error code, its message, nor any value it carries.
- On a reading that answered the version released, the placing control stays withheld, exactly as it already
  is.
- On the ready reading (draft, whether the manifest holds entries or none), the control's own behavior
  — the candidate-exclusion filter, the empty-state statement, the refusal tellings — is unchanged from
  what the prior task already delivered.
implements:
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
- rules/knowledge/a-first-placements-position-is-the-one-the-curator-declares
- rules/knowledge/a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for
- rules/knowledge/a-manifest-surface-offers-placing-a-hypothesis-on-every-reading-but-a-released-versions
- rules/knowledge/a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names
- rules/knowledge/a-placing-offered-on-a-manifest-surface-carries-the-cases-hypotheses-that-version-does-not-already-hold
- rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
---

## What it is
Widens PlaceExistingHypothesisControl's rendering condition and its candidate-hypotheses read from state.phase === "ready" alone to every reading but one that answered the version released -- closing the prior task's own disclosed UNDERDETERMINED gap.

## Notes
This task folds in the correction of a pre-existing divergence an earlier `/review-change` pass
flagged: the not-valid branch stated the case-keyed wording ("This case's current version does not
read back as a case.") on this version-keyed surface. Criterion 3 now requires the version-keyed
wording instead, distinct from the case-keyed statement used on surfaces addressed by slug alone.

ADVISORY, from the specification — criterion 7's "a default may be pre-selected" admits the same
RevisionPicker auto-selection (the hypothesis's highest existing revision, via an effect calling
onChange while no value is chosen) the immediately prior task in this initiative already shipped and
had bound against `a-placement-into-a-manifest-holding-no-entry-pins-the-revision-the-curator-names`
without objection, on the ready reading. This task extends that same, already-accepted construct
unchanged to the three new readings rather than deciding it afresh; criterion 12 preserves it on the
ready reading for the same reason. The construct holds against the node only while the pre-selected
value stays visible before confirming and freely changeable to any of the hypothesis's own revisions.
