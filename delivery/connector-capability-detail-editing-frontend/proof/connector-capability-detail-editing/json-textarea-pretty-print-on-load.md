---
title: Proof for JsonTextareaField's load-time pretty-print behavior
summary: Unit tests over JsonTextareaField prove mount-time pretty-printing of a valid
  value, the unchanged as-is display of an invalid one, and the disclosed generic-load
  inference; the connector-configuration and capability dialogs' own specs gain dedicated
  tests plus corrected pre-existing assertions proving each dialog's own field shows
  its loaded value pretty-printed.
implementation: sha256:38962976e234668696b7bb96d40662ad67e9741c5332f23d98126daef57add66
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-capability-detail-editing-json-textarea-pretty-print-on-load-suite
tests:
- file: src/shared/components/json-textarea-field.spec.ts
  name: reports a compact valid JSON value reformatted as pretty-printed text and
    marked valid immediately on mount, before any interaction
  proves: Given a syntactically valid JSON value, the textarea's displayed text is
    pretty-printed rather than left in the minified form it was passed, immediately
    on mount.
  fails_when: the mount-time load effect never fires for a valid, not-yet-pretty loaded
    value, or reports back anything other than the exact two-space-indented reformatting
    of it.
- file: src/shared/components/json-textarea-field.spec.ts
  name: never calls onChange on mount when the loaded value is already in its own
    pretty-printed form
  proves: criterion 1's own boundary, so the mount effect never loops a caller feeding
    its own onChange output back in as value
  fails_when: the mount effect calls onChange even though the loaded value already
    equals its own reformatting.
- file: src/shared/components/json-textarea-field.spec.ts
  name: leaves the value exactly as passed and never calls onChange for it, when it
    is not valid JSON, on mount
  proves: Given a value that is not valid JSON, the textarea shows the value as-is,
    so the existing inline Invalid JSON error behavior is unchanged.
  fails_when: the displayed textarea value differs from the exact string passed in
    for an invalid load, or the mount-time load effect calls onChange for it at all.
- file: src/shared/components/json-textarea-field.spec.ts
  name: pretty-prints a second, externally-loaded value too, not only the component's
    very first render
  proves: the implementation record's own disclosed inference that a value transition
    the control did not itself produce is treated as a load whenever it occurs, not
    only on first render
  fails_when: a second externally-produced value replacing the first without remounting
    is left minified instead of reformatted.
- file: src/shared/components/json-textarea-field.spec.ts
  name: operates independently across two field instances sharing the same props shape,
    so editing one never reports through the other onChange
  proves: the two mounted instances' own onChange callbacks never cross-report, holding
    once the new mount-time load-normalization call is accounted for
  fails_when: a change to one field's own textarea or load-normalization causes the
    sibling field's onChange to be called, or the revised assertion is satisfied only
    because it was weakened.
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: opens a Dialog whose connector and configuration fields already hold that
    row own current values
  proves: this pre-existing test's own subject, corrected to expect the Configuration
    field displayed text as the pretty-printed reformatting of the loaded, minified
    fixture rather than the raw minified string it held before this task
  fails_when: the Configuration field displays the raw minified fixture text instead
    of its reformatting once the Edit dialog opens.
- file: src/routes/connector-configurations-screen-form.spec.ts
  name: renders the configuration field's loaded, minified value reformatted as indented
    JSON as soon as the Edit dialog opens
  proves: The configuration field in the connector-configuration create/edit dialog
    shows its loaded value pretty-printed.
  fails_when: the configuration field shows anything other than the exact reformatting
    of the loaded, minified fixture once the Edit dialog opens.
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: opens a Dialog whose fields already hold that row own current values, and
    no detail panel renders alongside it
  proves: this pre-existing test's own subject, corrected to expect both schema fields
    displayed text as the pretty-printed reformatting of their loaded, minified fixtures
  fails_when: either schema field displays its raw minified fixture text instead of
    its reformatting once the Edit dialog opens.
- file: src/routes/capabilities-browser-screen-detail.spec.ts
  name: renders both schema fields' loaded, minified values reformatted as indented
    JSON as soon as the Edit dialog opens
  proves: The input_schema and output_schema fields in the capability create/edit
    dialog show their loaded values pretty-printed.
  fails_when: either schema field shows anything other than the exact reformatting
    of its loaded, minified fixture once the Edit dialog opens.
not_applicable:
- edge_case: an empty string as the loaded value
  why: parseJsonText of an empty string fails identically to any other syntactically
    invalid text, taking the same early-return path already proved by the invalid-load
    test; a pre-existing test already establishes an empty value is reported invalid
    on first render.
- edge_case: a loaded value that parses to a JSON scalar rather than an object or
    array
  why: pretty-printing a scalar never differs from its unindented form, so this is
    the same already-pretty boundary the idempotence test already covers, not a distinct
    code path.
- edge_case: two operations against one subject at once
  why: JsonTextareaField holds no state besides one ref, and a single instance value
    prop can only change from one source at a time; two independent instances are
    already proved independent by the cross-instance test.
- edge_case: a dependency that fails or answers slowly
  why: JsonTextareaField and its load-normalization effect call no network or other
    asynchronous dependency.
untested:
- Whether a value the operator reaches via the Beautify click, rather than typing,
  is also recognized as self-produced by the same selfInitiatedRef mechanism once
  it round-trips back through a caller's own state, so the mount/load effect never
  re-processes it a second time -- no test round-trips handleBeautify's own output
  back in as a new value prop the way the disclosed-inference test round-trips handleChange's.
---

## What it is

Proves the four criteria plus the implementation own disclosed inference, and corrects two pre-existing dialog-level tests and one pre-existing component-level test whose assertions the new mount-time onChange call otherwise breaks.

## Notes

None.
