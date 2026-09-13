---
target: frontend
title: Configuration entry guidance proof
summary: Proves the fixed four-claim pt-BR guidance list beside the Configuration field renders
  unconditionally and exhaustively over every content class, that the well-formedness gate on
  Save stands untouched by its presence, and cites the pre-existing Helper-position and
  Save-toggle tests that already show the rest of "withholds no act" holds.
implementation: sha256:bb970f5afbd230a1d842e9fff815119513e5c94d08e9da32288bd5f305a7fb11
run: run/configuration-readiness-configuration-entry-guidance-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
  name: renders exactly the four guidance messages, in that order, as the guidance list's own
    items (over an empty Configuration field, a well-formed JSON object, and not-well-formed JSON
    text)
  proves: Criteria 1, 2, 3 and 4 -- each of the four bounded claims is stated, imported from the
    message module rather than retyped. Criterion 5 -- the guidance list's own direct children are
    exactly these four items. Criterion 6's content-independence facet -- the same exact four-item
    list renders identically regardless of the Configuration field's current content.
  fails_when: for any of the three content states, the guidance list's direct children are not
    exactly the four messages in that order, or a fifth item is present alongside them.
  demonstrates: rules/integration/a-connector-configuration-entry-states-what-the-http-connector-reads-from-it
- file: src/routes/connector-configuration-form-fields-configuration-entry-guidance.spec.ts
  name: keeps Save disabled while the Configuration field holds text that is not well-formed JSON
    object text, even though the guidance itself renders in full
  proves: Criterion 6's other facet -- the entry's own unconditional rendering withholds no act
    of its own, but does not extend to overriding the pre-existing well-formedness gate on Save.
  fails_when: Save's disabled attribute is absent while the Configuration field holds
    not-well-formed JSON text, or the guidance list stops rendering all four items while that gate
    is enforced.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: disables Save by default when the screen first mounts, since a blank configuration is not
    valid JSON either (pre-existing, cited rather than duplicated)
  proves: Criterion 6's Save-gating facet, initial state -- Save's disabled-by-default behavior
    is unchanged by the guidance now rendered unconditionally beside that same field.
  fails_when: Save is not disabled on first mount with a blank Configuration field.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: issues no PUT request when Request Draft is clicked, even while Save itself is enabled
    (pre-existing, cited rather than duplicated)
  proves: Criterion 6's Save-gating facet, enabled state -- Save's disabled attribute is false
    once the Configuration field holds valid JSON, in the same tree where the guidance renders
    unconditionally directly above the Configuration Helper section.
  fails_when: Save is not enabled once the Configuration field holds valid JSON content.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: places the Configuration Helper heading after the Configuration field in document order
    (pre-existing, cited rather than duplicated)
  proves: Criterion 6's Helper-rendering facet -- the Configuration Helper's own position and
    rendering, now with the guidance's list physically inserted between the Configuration field
    and the Helper section, is unaffected.
  fails_when: the Configuration Helper heading no longer follows the Configuration field in
    document order.
not_applicable:
- edge_case: An absent or undefined Configuration field value.
  why: ConfigurationFieldState.value is a required string in its own type; the empty-string case
    already exercised is the class this reaches.
- edge_case: Concurrent or overlapping renders/edits of the Configuration field.
  why: ConfigurationEntryGuidance takes no props, reads no state, and is a pure, synchronous
    render with nothing shared across calls.
- edge_case: A slow or failing dependency.
  why: The guidance component touches no network, storage or clock.
- edge_case: A duplicate or repeated guidance message.
  why: The four messages are four distinct, fixed constants with no data-driven or user-supplied
    input.
untested:
- domain/integration/connector-configuration -- a value-object domain concept spanning the
  registry's own hold-and-replace responsibility, the executing HTTP connector's reading of it,
  and this frontend entry; no finite test decides its whole fact, and this task's guidance only
  names keys and placeholder forms the concept already fixes.
- Placement immediately below the JsonTextareaField call, the list/styling choice, and the
  literal (untranslated) placeholder syntax -- all inferences the implementation record discloses
  about arrangement and form rather than behavior a criterion states.
---

## What it is
The proof of the fixed four-claim guidance, always rendered, gating nothing.

## Notes
Suite round 1 failed lint: testing-library/no-node-access on `.closest("ul")`. Fixed by querying
the list via `screen.getByRole("list")` and its items via `within(...).getAllByRole("listitem")`
instead of DOM navigation. Suite round 2 green.
