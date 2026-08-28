---
title: Capability detail layout adjustment, first review
summary: What four passes found over the row regrouping and the schema-editor height increase, plus one
  pre-existing, unrelated test failure the whole-change run surfaced.
reviewed:
- src/routes/capability-form-fields.tsx
- src/routes/capability-detail-screen-name-version-nature-row.spec.ts
- src/shared/components/json-textarea-field.tsx
- src/shared/components/json-textarea-field.spec.ts
- src/routes/capability-detail-screen-schema-editor-height.spec.ts
- src/routes/connector-configuration-detail-screen-configuration-height.spec.ts
tasks:
- task/capability-detail-layout/name-version-nature-row
- task/capability-detail-layout/schema-editor-height-increase
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
failures_counted: 1
run: run/capability-detail-layout-adjustment
coverage:
- criterion: CapabilityFormFields wraps the Name, Version and Nature FormField elements in one shared
    row container instead of Nature's current standalone FormField block rendered below the Name/Version
    row.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-name-version-nature-row.spec.ts
    name: wraps Name, Version and Nature in one shared container that a later-row field (Timeout) sits
      outside of
- criterion: Nature keeps its existing selectable values and its current selected value for any given
    capability; only its screen position changes.
  state: uncovered
  why: Nothing in this task's proof-declared test set inspects Nature's selectable options or its selected
    value for any capability; the row test only checks structural containment, never the field's own options
    or current selection. The proof's own prose attributes this to capability-detail-screen.spec.ts, a
    pre-existing, untouched file this delivery does not list among its own tests.
- criterion: Name and Version keep their existing values and validation behavior unchanged by the regrouping.
  state: uncovered
  why: Nothing in this task's proof-declared test set exercises Name's or Version's own values or validation
    behavior; the row test asserts only DOM containment. The proof's own prose attributes this to capability-detail-screen.spec.ts
    and capability-detail-screen-save.spec.ts, both pre-existing and untouched.
- criterion: The existing capability-detail-screen.spec.ts suite, which locates every field by screen.getByLabelText,
    passes without modification to its assertions.
  state: uncovered
  why: capability-detail-screen.spec.ts is not part of this task's proof-declared test set, so nothing
    available to this pass runs that suite or confirms its assertions were left unmodified and still pass.
    (The whole-change suite run this review captured did run it, and it passed — see the run itself —
    but the proof record does not declare it as a test proving this criterion.)
- criterion: The Textarea rendered by JsonTextareaField for the capability form's input-schema field has
    a minimum height of exactly 200px (12.5rem).
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-schema-editor-height.spec.ts
    name: renders the Input schema field's Textarea with the 12.5rem minimum-height class, not the shared
      component's own 10rem default
- criterion: The Textarea rendered by JsonTextareaField for the capability form's output-schema field
    has a minimum height of exactly 200px (12.5rem).
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-schema-editor-height.spec.ts
    name: renders the Output schema field's Textarea with the 12.5rem minimum-height class, not the shared
      component's own 10rem default
- criterion: The Textarea rendered by JsonTextareaField for the connector-configuration form's configuration
    field keeps a minimum height of 160px (10rem), unchanged from today.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-configuration-height.spec.ts
    name: renders the Configuration field's Textarea with the shared component's own 10rem default minimum-height
      class, not the capability screen's taller variant
- criterion: JsonTextareaField's default rendered height, used by any consumer that does not explicitly
    opt into the taller variant, remains 160px (10rem).
  state: covered
  tests:
  - file: src/shared/components/json-textarea-field.spec.ts
    name: renders the shared 10rem/160px minimum-height class when the tall prop is left unset entirely
findings:
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: lines 125-128, the conceptSelectOptions assignment feeding Select's options prop
  cites: API-01
  evidence: "const conceptSelectOptions: SelectOption[] = conceptOptions.map((concept) => ({\n    value:\
    \ concept.name,\n    label: concept.name,\n  }));"
  cost: conceptOptions arrives from the concept service layer's own shape (ConceptOption), and the {value,
    label} shape Select needs is assembled inline as a local variable rather than a named, reusable adapter;
    a second Select consumer of concept data, or a future change to ConceptOption's own fields, has no
    shared place to look and reinvents the same value/label assignment separately (the file already carries
    a near-identical, independently-written second instance of this pattern for NATURE_OPTIONS a few lines
    above).
  correction: produce conceptSelectOptions through a named adapter function (exported beside use-concept-options
    or capability-form-schema) rather than assembling the mapping inline in the component body.
- pass: standard
  file: src/routes/capability-form-fields.tsx
  where: lines 130-131, the isSaveDisabled computation
  cites: ARC-03
  evidence: "const isSaveDisabled =\n  isSubmitting || !inputSchema.isValid || !outputSchema.isValid ||\
    \ isDirty === false;"
  cost: whether Save is disabled for an unmodified record is a business rule (refuse re-saving what has
    not changed), and it is decided inline in this route component's own function rather than in a hook.
    The file's own header comment confirms use-capability-form.ts, the hook the sibling dialog caller
    uses, tracks no differs-from-the-loaded-record concept at all -- so the rule exists in exactly one
    place, this render function, and a third caller wanting the same gate has to copy this expression
    rather than call something that already encodes it.
  correction: move the disabled-when-unmodified decision into a hook (e.g. alongside the isValid tracking
    use-capability-form.ts already owns) so a caller other than this route can reuse it rather than reproduce
    the expression.
- pass: failures
  file: src/hooks/use-connector-configuration-detail-validity.spec.ts
  where: useConnectorConfigurationDetail -- configurationValid rejects a non-object parsed value right
    after load (criterion 1) > reads configuration.isValid as false when the loaded configuration parses
    as 'an array' rather than an object
  evidence: "AssertionError: expected true to be false // Object.is equality\n- false\n+ true\n ❯ src/hooks/use-connector-configuration-detail-validity.spec.ts:44:64"
  cause: code
  correction: compute configurationValid synchronously for the render that returns phase "ready" (e.g.
    derive it inline from query.data via isValidConfigurationObject rather than through a useState seeded
    true and corrected later in a useEffect), so the ready phase never surfaces before its own validity
    value is the one the loaded configuration actually has.
  cost: 'src/hooks/use-connector-configuration-detail.ts exposes phase: "ready" for at least one render
    carrying the stale default configurationValid: true before the corrective useEffect (keyed on query.data)
    commits the real value derived from isValidConfigurationObject -- a caller reading the ready phase
    at that instant (this test, or any consumer racing the same window) sees an array or null configuration
    reported valid, contradicting rules/integration/a-connector-configuration-holds-a-well-formed-object,
    which the hook''s own comments say it intends to honor. Neither task under this review touches this
    file; it is a pre-existing defect the whole-change suite run surfaced, not a regression from this
    delivery.'
---

## What it is

Reviews the two tasks of the capability-detail-layout-adjustment initiative: the Name/Version/Nature
row regrouping and the schema-editor height increase. Every criterion the row-grouping task
declares beyond its own new structural test rests on pre-existing, untouched suites
(capability-detail-screen.spec.ts, capability-detail-screen-save.spec.ts) that neither task's proof
record lists among its own `tests` -- the coverage pass reports those criteria `uncovered` on that
account, even though the whole-change suite run this review captured did exercise those files and
they passed.

## Notes

The failures pass's one finding (src/hooks/use-connector-configuration-detail-validity.spec.ts) is a
pre-existing defect in already-delivered code, unrelated to either task under this review -- neither
task's file set reaches src/hooks/use-connector-configuration-detail.ts or its spec. It is reported
here because this review's own whole-change suite run surfaced it, exactly as intended: two
deliveries that each passed alone are not a change that passes together. Routing it (a corrective
increment through /plan-work, since it is one wrong behavior in code already delivered) is left to
the human.
