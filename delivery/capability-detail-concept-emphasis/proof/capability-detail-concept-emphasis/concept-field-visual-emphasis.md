---
title: Concept field visual emphasis -- proof, lint-conformant revision
summary: Proves the capability form's Concept field carries a visually distinguishing
  container (border-accent-alt/bg-surface, no raw values), that Timeout and Connector
  remain undistinguished, that Concept keeps its grid-cols-3 placement and its Select's
  value/onChange/disabled wiring, and that its notched Panel title sits at heading
  level 2 without recreating the duplicate-accessible-name collision -- with the file's
  two lint findings (an unnecessary type assertion and a stale eslint-disable) resolved
  without weakening any assertion.
implementation: sha256:4da1f1f503787f0ff502452fb1a3fc053a2095d4b841c37f05471a730231b224
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-detail-concept-emphasis-concept-field-visual-emphasis-suite-4
tests:
- file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
  name: CapabilityDetailScreen -- Concept's field container is visually distinguished
    from the other seven fields (criterion 1) > wraps only Concept's control in an
    ancestor carrying the accent-alt border, none of the other seven fields' controls
    sit inside one
  proves: Criterion 1 -- Concept's field container carries a visual property none
    of the other seven field containers carry.
  fails_when: Concept's control container is no longer wrapped in an ancestor whose
    class list carries the accent-alt border token (e.g. the Panel wrap is removed
    or its accent reverts to the default), or any of Name/Version/Nature/Input schema/Output
    schema/Timeout/Connector gains a matching ancestor.
- file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
  name: CapabilityDetailScreen -- Concept no longer shares its former undistinguished
    weight with Timeout and Connector (criterion 2) > carries the accent-alt border
    while Timeout's and Connector's own containers still do not
  proves: Criterion 2 -- Concept no longer shares its former undistinguished weight
    specifically with Timeout and Connector, the two fields it sits beside in the
    same grid-cols-3 row.
  fails_when: Timeout's or Connector's own container also resolves an accent-alt-bordered
    ancestor (the distinction collapses back to equal weight for the row's three siblings),
    or Concept's own ancestor stops carrying it.
- file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
  name: CapabilityDetailScreen -- Concept stays in its existing grid-cols-3 row rather
    than relocating (the implementation record's own disclosed inference) > keeps
    Concept, Timeout and Connector as siblings inside one shared grid row
  proves: The implementation record's disclosed inference that Concept stays in its
    existing grid-cols-3 cell/row beside Timeout and Connector rather than moving
    to a new row or grid.
  fails_when: Concept, Timeout or Connector stops sharing one .grid-cols-3 ancestor
    -- e.g. Concept is pulled into its own row, breaking the row the other two still
    occupy.
- file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
  name: CapabilityDetailScreen -- Concept's distinguishing container resolves only
    to declared semantic tokens (criterion 3) > carries border-accent-alt and bg-surface,
    and no raw px, hex or rgb value
  proves: Criterion 3 -- every value building the visual distinction resolves to a
    declared semantic token (border-accent-alt, bg-surface), with no literal px, hex
    or rgb value introduced. Also confirms the implementation record's disclosed inference
    that accent="alt" is the variant used, since only that variant resolves to border-accent-alt
    specifically.
  fails_when: The distinguishing container's class list stops carrying border-accent-alt
    or bg-surface, or starts carrying a literal hex color, a px value, or an rgb()/rgba()
    call.
- file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
  name: CapabilityDetailScreen -- Concept's notched Panel title sits at heading level
    2, not the primitive's own default of 3 > renders a level-2 heading inside Concept's
    own distinguished container, carrying an accessible name distinct from the field's
    own label
  proves: The implementation record's disclosed inference that titleLevel is explicitly
    set to 2, and its disclosed fix that the panel's title is no longer literally
    "Concept" -- removing the duplicate-accessible-name collision the implementation's
    first attempt failed 22 tests over.
  fails_when: No level-2 heading exists inside Concept's own distinguishing container
    (e.g. titleLevel reverts to Panel's own default of 3, or no heading renders there
    at all), or that heading's accessible name reads exactly "Concept" again (recreating
    the collision the implementation's fix removed).
- file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
  name: CapabilityDetailScreen -- Concept's Select keeps its own value/onChange wiring
    inside the new wrapper (criterion 5) > still lets an operator change the selected
    concept, nested inside the Panel wrap
  proves: Criterion 5 (identity clause) -- Concept's Select still resolves its options
    from conceptOptions and stays driven by the same Controller field.value/field.onChange
    wiring, once nested inside Panel.
  fails_when: Selecting a different concept option no longer updates the trigger's
    own displayed value (e.g. the Panel wrap breaks the Controller's onChange path,
    or the options no longer come from conceptOptions).
- file: src/routes/capability-detail-screen-concept-emphasis.spec.ts
  name: CapabilityDetailScreen -- Concept's Select stays disabled exactly while a
    save is in flight (criterion 5) > disables Concept's control only for the duration
    of a pending save, re-enabling once it resolves
  proves: Criterion 5 (disabled-while-isSubmitting clause) -- Concept's control stays
    disabled exactly while isSubmitting is true, re-enabling once the save resolves,
    once nested inside Panel.
  fails_when: Concept's control fails to become disabled once a save is triggered,
    stays disabled after the pending PUT resolves, or becomes disabled/enabled at
    some other time than the submission window.
not_applicable:
- edge_case: Concurrent operations against one subject at once
  why: This screen has one save-in-flight path already covered (the disabled-during-save
    test), and criteria 1-3/5 describe a static render plus one interaction (selecting
    an option), neither of which has a second concurrent actor to race against.
- edge_case: Absent/empty concept options
  why: Criteria 1-3 and 5 are about container styling and existing wiring, not about
    conceptOptions' own emptiness; an empty-options behavior belongs to whatever task
    defined the Select's own empty-state contract, not to this visual-only task.
- edge_case: A boundary at each end of a stated range
  why: None of this task's criteria states a numeric range for the visual emphasis
    to hold or not hold; the property under test (has vs. does not have the accent-alt-bordered
    ancestor) is binary per field, and every field is exercised.
untested:
- 'Criterion 4 (built only from cataloged TUI components, no TUI source copied or
  forked) -- this project''s own standard (standards/frontend-typescript.yaml) assigns
  this exact concern to ARC-01/ARC-04 as decided_by: reading, because a rendered DOM
  query cannot tell a genuine @tui/ui/panel import apart from a hand-copied equivalent
  producing identical markup. No test proves or could prove it; a reading is the only
  route.'
- The implementation record's disclosed inference that Panel (accent="alt") is the
  correct existing-TUI-primitive vehicle, rather than a hand-rolled bordered div assembled
  from raw Tailwind utility classes -- no observable DOM difference distinguishes
  the two, so this is the same provenance question as criterion 4 and is left to the
  same reading.
- Criterion 6 (neither caller needs a prop/call-site change) and criterion 7 (the
  other seven fields' position, meaning and validation are unchanged) -- both are
  rearrangement claims over files this task did not touch, already asserted by the
  pre-existing, unmodified suite (capability-detail-screen.spec.ts, capability-detail-screen-save.spec.ts,
  capability-detail-screen-name-version-nature-row.spec.ts, capabilities-browser-screen-capability-form-schema.spec.ts,
  capabilities-browser-screen-detail.spec.ts). A new test here duplicating that coverage
  would pin the arrangement those files already pin, not add proof.
---

## What it is
Seven tests, all in one new file (capability-detail-screen-concept-emphasis.spec.ts), proving criteria 1, 2, 3 and 5 of task/capability-detail-concept-emphasis/concept-field-visual-emphasis over the routed capability detail screen.
Criteria 4, 6 and 7 are answered by a reading (criterion 4, per the project's own standard) or by the pre-existing, unmodified suite continuing to pass (criteria 6 and 7) -- see `untested` for why no new test duplicates either.

## Notes
Two lint findings surfaced against this file after its own assertions were rewritten to match the implementation's title-rename fix: an unnecessary `as HTMLElement` type assertion (forbidden by the standard's own consistent-type-assertions rule) and a stale `eslint-disable-next-line testing-library/no-node-access` directive that no longer suppressed anything. Both are fixed in this revision -- `distinguishedAncestor` now types its `closest` call with an explicit generic parameter (`closest<HTMLElement>`) so its return type is `HTMLElement | null` with no cast needed at any call site, and the stale directive was removed with its reasoning replaced by a comment explaining why `no-node-access` structurally cannot fire on a bare `return` statement (it only listens for a `MemberExpression` under an `ExpressionStatement` or `VariableDeclarator`).
The heading-level test's own query was rewritten, in an earlier revision of this same file, to check the heading's level and non-"Concept" name rather than pinning the literal caption "Concept" -- the implementation's own fix renamed that caption to "Emphasized field" to remove a getByLabelText collision, and no criterion this proof answers names a specific caption text.
This proof's own suite run (run/capability-detail-concept-emphasis-concept-field-visual-emphasis-suite-4) reported all 901 tests passing, including all seven of this file's own tests. Two earlier full-suite runs each failed: one on 22 pre-existing tests (the getByLabelText collision, since fixed), one on a single, unrelated, confirmed-flaky test in src/hooks/use-connector-configuration-detail-validity.spec.ts -- disclosed in the implementation record's own `deferred`, not this proof's to answer.
