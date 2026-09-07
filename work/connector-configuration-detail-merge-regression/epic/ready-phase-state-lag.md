---
title: Ready-phase state lag in the capability and connector configuration detail
  hooks
summary: 'The one wrong behavior the merge exposed: the schema/configuration text
  state a detail hook holds lags one render behind the phase flipping to ready, so
  a reader capturing ready at its earliest render sees stale or empty text.'
covers:
- contracts/integration/connector-configuration-registry
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
- rules/integration/a-connector-configuration-holds-a-well-formed-object
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- contracts/integration/capability-registry
- domain/integration/capability
- rules/integration/a-capability-declares-well-formed-schemas
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
uncovered:
- node: contracts/integration/connector-configuration-registry
  why: The trace binds this file to the registry's whole contract; the render-lag fix touches
    neither an operation nor its shape, only when a hook's own state catches up to an answer
    already returned.
- node: domain/integration/connector-configuration
  why: The trace binds this file to the aggregate as a whole; the fix touches no attribute the
    aggregate declares, only the render at which the hook's state reflects one.
- node: rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
  why: Abandonment is untouched by this correction; the hook's Cancel/Discard behavior is not
    what the merge broke.
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  why: The validity check itself is not the defect — main's own prior fix
    (hook-computes-validity-before-ready) already moved it to render time; this task fixes the
    sibling lag left deferred by that same commit, in the value fields, not the validity check.
- node: rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
  why: The return-to-origin (Cancel) act is untouched; nothing here changes where either hook
    navigates.
- node: rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
  why: Save/error toast behavior is untouched; the defect is in what the ready phase presents on
    load, not in what a submission reports.
- node: rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
  why: Post-save navigation is untouched by this fix.
- node: rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
  why: This landing behavior is untouched; no criterion of this task reaches it.
- node: contracts/integration/capability-registry
  why: The trace binds this file to the registry's whole contract; the fix touches no operation's
    shape, only the render at which a hook's own state reflects an answer already returned.
- node: domain/integration/capability
  why: The fix touches no attribute the aggregate declares beyond the two schemas already named in
    criteria 1 and 2, which the underdetermined notes below account for.
- node: rules/integration/a-capability-declares-well-formed-schemas
  why: The schema well-formedness check itself is untouched; this task fixes when the already-valid
    schema text reaches the exposed state, not whether it validates.
- node: rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
  why: This rule's own clauses — the outstanding and failed windows, and the reattempt control —
    are untouched; only its sibling's read-and-shown clause, now stated at
    a-presented-capability-states-its-declared-attributes-as-the-read-answered-them, is what this
    task implements.
- node: rules/integration/an-abandoned-capability-registration-entry-registers-nothing
  why: Abandonment is untouched by this correction.
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  why: What a placeholder is and which capability declares it is untouched; this task fixes only
    which configuration text the Add attribute reading is taken from at the first ready render,
    per the binder's third pass, which did not bind this node.
- node: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
  why: The discard act itself is untouched by this fix; an underdetermined note below records that
    a registered baseline synced only at the surface layer, and not down to this hook's own state,
    can still leave a discard taken immediately after load setting fields to the empty string —
    the binder's third pass did not bind this node to any criterion as written.
sources:
- intake/scope.md
---

## What it is

The trace's own reverse lookup (`trace.py --encodes`) over the two files the corrective scope
names — `use-connector-configuration-detail.ts` and `use-capability-detail.ts` — is this epic's
whole claim: every node either file is presently bound to, so the correction is judged against
exactly what the trace already says these files answer for, and nothing this plan invented.

## Notes

The first binder pass over this epic's task returned two out-of-candidates notes: criterion 3
(`configuration.value` on the ready render) rests on
`rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read`,
absent from the original `--encodes` seed; criterion 4 (Add attribute reading the just-loaded
text) rests on `rules/integration/a-connector-configuration-is-tested-through-a-registered-capability`,
`rules/integration/a-connector-placeholder-is-declared-by-its-capability` and
`rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface`, none
of which the trace binds to either file. All four are added to `covers` above, and the task's
binder is re-run against the grown set.

The re-run's own `implements` was
`rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read` and
`rules/integration/a-connector-configuration-is-tested-through-a-registered-capability`, with an
`unstated` note over criteria 1 and 2 (the capability hook's schema fields): no candidate states
what a capability-keyed surface presents once its identity-keyed read has answered — the sibling
capability rule states only the two unsettled windows. That fact was decided, blind to this cut,
at `rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them`,
disclosed in the decision log. It is added to `covers` above, and the binder is run a third time
against the fully grown set.

The third pass's `implements` was
`rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them`,
`rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read` and
`rules/integration/a-connector-configuration-is-tested-through-a-registered-capability` — no
further `unstated` note, and five `underdetermined` notes over clauses these three nodes state
that no criterion of this task reaches, carried into the task's own `## Notes`. The remaining
fifteen nodes `covers` names are declared `uncovered` above, each with why this correction does
not reach it.
