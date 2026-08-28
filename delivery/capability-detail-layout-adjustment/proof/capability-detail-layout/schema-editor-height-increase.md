---
title: Proof for the capability schema editors' height increase, scoped away from connector-configuration
summary: Four tests proving JsonTextareaField's opt-in tall prop raises the capability form's input-schema
  and output-schema fields to 200px/12.5rem while leaving the connector-configuration form's configuration
  field and the component's own default at 160px/10rem, each asserted on the rendered Textarea's className
  at the call site the criterion names.
implementation: sha256:c0c4eecad336dda6615f6f29234094c403405ba1a662bf882befc211fe36be15
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-detail-layout-schema-editor-height-increase-suite
tests:
- file: src/shared/components/json-textarea-field.spec.ts
  name: renders the shared 10rem/160px minimum-height class when the tall prop is left unset entirely
  proves: JsonTextareaField's default rendered height, used by any consumer that does not explicitly opt
    into the taller variant, remains 160px (10rem).
  fails_when: the rendered Textarea's className stops containing min-h-40 when tall is omitted, or also
    carries min-h-[12.5rem] at the same time (e.g. the default branch was flipped, or the conditional
    was dropped in favor of always applying the taller class)
- file: src/routes/capability-detail-screen-schema-editor-height.spec.ts
  name: renders the Input schema field's Textarea with the 12.5rem minimum-height class, not the shared
    component's own 10rem default
  proves: The Textarea rendered by JsonTextareaField for the capability form's input-schema field has
    a minimum height of exactly 200px (12.5rem).
  fails_when: the input_schema call site in capability-form-fields.tsx stops passing tall, or the rendered
    Textarea's className loses min-h-[12.5rem] or regains min-h-40
- file: src/routes/capability-detail-screen-schema-editor-height.spec.ts
  name: renders the Output schema field's Textarea with the 12.5rem minimum-height class, not the shared
    component's own 10rem default
  proves: The Textarea rendered by JsonTextareaField for the capability form's output-schema field has
    a minimum height of exactly 200px (12.5rem).
  fails_when: the output_schema call site in capability-form-fields.tsx stops passing tall, or the rendered
    Textarea's className loses min-h-[12.5rem] or regains min-h-40
- file: src/routes/connector-configuration-detail-screen-configuration-height.spec.ts
  name: renders the Configuration field's Textarea with the shared component's own 10rem default minimum-height
    class, not the capability screen's taller variant
  proves: The Textarea rendered by JsonTextareaField for the connector-configuration form's configuration
    field keeps a minimum height of 160px (10rem), unchanged from today.
  fails_when: connector-configuration-form-fields.tsx's configuration call site starts passing tall (e.g.
    the increase was raised through the shared default instead of scoped through the opt-in), or the rendered
    Textarea's className loses min-h-40 or gains min-h-[12.5rem]
not_applicable:
- edge_case: absent/empty input and a boundary at each end of a stated range
  why: the behavior under test is a fixed, literal minimum-height class selected by a boolean prop, not
    a value computed from user input or spanning a numeric range -- there is no boundary to sit at.
- edge_case: a duplicate where uniqueness is claimed
  why: no criterion claims uniqueness of anything; each field independently resolves its own className.
- edge_case: an operation against state that forbids it
  why: this is a static rendering fact with no state machine or guarded transition involved.
- edge_case: a dependency that fails or answers slowly
  why: no new dependency is introduced by this task; height resolution needs no network or async data,
    and the existing load-failure behavior for each screen is untouched and unrelated to which className
    a loaded field's Textarea carries.
- edge_case: two operations against one subject at once
  why: this task is a static className change with no new interactive or concurrent behavior.
- edge_case: a consumer passing tall explicitly as false, rather than omitting it
  why: no call site in this codebase passes tall={false} -- capability-form-fields.tsx passes bare tall
    (true) and every other consumer passes no such prop at all -- so testing that branch would exercise
    a call shape nothing here produces; the omitted case, which every non-opting consumer actually uses,
    is what the default-height test covers.
untested:
- 'Whether the conditional height class is composed through cn() versus a plain ternary or string concatenation
  (the implementation record''s second disclosed inference): the rendered className is identical either
  way, so no test can distinguish the two without asserting on an internal call rather than observable
  output, which none of this task''s criteria requires.'
- connector-test-panel-fields.tsx's own sample-input JsonTextareaField call site is not itself rendered
  or asserted on by any new test here -- no criterion names it, and the implementation record's own preserved/how
  text only mentions it as an example of an untouched consumer. The component-level default-height test
  proves the mechanism it would rely on, but that specific call site's own wiring is not independently
  exercised.
divergences:
- cites: TST-04
  file: src/routes/capability-detail-screen-schema-editor-height.spec.ts
  departure: The file sits beside capability-detail-screen.tsx, suffixed for the specific behavior it
    proves, rather than named exactly capability-detail-screen.spec.ts.
  why: Mirrors the already-established, previously-delivered precedent for this exact screen -- capability-detail-screen-save.spec.ts,
    capability-detail-screen-discard.spec.ts, capability-detail-screen-invalid-schema.spec.ts and capability-detail-screen-name-version-nature-row.spec.ts
    are all split the same way from the same unit, sharing capability-detail-screen.test-support.ts, to
    stay under this project's own max-lines discipline (MNT-01). Matching TST-04 literally would mean
    either exceeding MNT-01 in one of the existing sibling files or duplicating the mounting harness in
    a second, unrelated file for two tests, either of which costs more than the departure.
- cites: TST-04
  file: src/routes/connector-configuration-detail-screen-configuration-height.spec.ts
  departure: The file sits beside connector-configuration-detail-screen.tsx, suffixed for the specific
    behavior it proves, rather than named exactly connector-configuration-detail-screen.spec.ts.
  why: Same reasoning as the sibling divergence above, for the same established split-file convention
    already carried by connector-configuration-detail-screen-save.spec.ts and connector-configuration-detail-screen-discard.spec.ts
    for this screen.
---

## What it is

The tests proving task/capability-detail-layout/schema-editor-height-increase's four criteria: the
two capability-screen editors render the taller class, the connector-configuration editor and the
component's own default stay untouched.

## Notes

None.
