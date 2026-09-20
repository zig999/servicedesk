---
target: frontend
title: Evidence fields/concept_description required-member and honest-empty-render proof
summary: Every criterion of evidence-semantics-always-present is backed by a test that fails if it stopped
  holding -- three new type-refusal tests pin the requiredness on all three evidence types, and the pre-existing,
  task-modified snapshot/adapter/render tests are cited as the proof for the passthrough, collapse and
  test-file criteria; neither implemented node's fact is decided whole by any test here.
implementation: sha256:543676ebbdb4fa3b653f8ba6fbb5856ea4dd733f789d736023931bf75db1c827
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/conformant-record-shapes-evidence-semantics-always-present-suite-3
tests:
- file: src/hooks/use-simulate-case-evidence-wire-fields.spec.ts
  name: SimulateEvidenceItem -- fields and concept_description are required members (evidence-semantics-always-present
    criterion 1) > refuses an evidence item literal that assigns undefined to fields or concept_description
  proves: 'criterion 1: SimulateEvidenceItem declares fields and concept_description as required members,
    with no optional marker on either'
  fails_when: fields or concept_description is made optional again (or removed) on SimulateEvidenceItem,
    so either @ts-expect-error directive stops reporting an error and the typecheck step fails on an unused-directive
    error
- file: src/hooks/use-simulate-hypothesis-evidence-wire-fields.spec.ts
  name: Evidence (use-simulate-hypothesis) -- fields and concept_description are required members (evidence-semantics-always-present
    criterion 2) > refuses an evidence item literal that assigns undefined to fields or concept_description
  proves: 'criterion 2: the Evidence type declares fields and concept_description as required members,
    with no optional marker on either'
  fails_when: fields or concept_description is made optional again (or removed) on Evidence, so either
    @ts-expect-error directive stops reporting an error and the typecheck step fails on an unused-directive
    error
- file: src/routes/case-simulation-detail-types.spec.ts
  name: SimulationEvidenceItem -- fields and conceptDescription are required members (evidence-semantics-always-present
    criterion 3) > refuses an evidence item literal that assigns undefined to fields or conceptDescription
  proves: 'criterion 3: SimulationEvidenceItem declares fields and conceptDescription as required members,
    with no optional marker on either'
  fails_when: fields or conceptDescription is made optional again (or removed) on SimulationEvidenceItem,
    so either @ts-expect-error directive stops reporting an error and the typecheck step fails on an unused-directive
    error
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: SimulateEvidenceItem -- fields and concept_description are required, honest-empty wire fields
    (criterion 1) > constructs a bare item with the honest-empty value for both, never undefined
  proves: 'criterion 9: this spec file asserts the honest-empty value for a bare item''s fields and concept_description
    and asserts undefined for neither'
  fails_when: a bare item's fields or concept_description reads as anything other than [] / "" respectively,
    including undefined
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: toDetailEvidence -- carries fields/concept_description through as fields/conceptDescription (criterion
    3) > carries a present, non-empty snapshot through unchanged
  proves: 'criterion 4 (present-value class): toDetailEvidence carries fields and conceptDescription from
    the source item with no fallback for an absent value'
  fails_when: toDetailEvidence's output fields or conceptDescription no longer equals a non-empty source
    item's own fields/concept_description exactly
- file: src/routes/case-simulation-cockpit-adapters-evidence-snapshot.spec.ts
  name: toDetailEvidence -- carries fields/concept_description through as fields/conceptDescription (criterion
    3) > carries a bare item's own honest-empty fields and concept_description through unchanged, asserting
    undefined nowhere
  proves: 'criterion 4 (honest-empty class): toDetailEvidence carries an absent-by-default source item''s
    fields/concept_description through as the honest-empty value, substituting nothing'
  fails_when: toDetailEvidence's output fields or conceptDescription for a bare source item stops being
    [] / "" respectively, or becomes undefined
- file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  name: fromHypothesisEvaluation -- carries the run's own evidence onto the normalized evaluation (criterion
    1) > carries a single-hypothesis run's own collected evidence item through, narrowed to the Detail
    region's own shape
  proves: 'criterion 10: this spec file asserts the honest-empty value for a bare item''s conceptDescription
    and asserts undefined for it nowhere'
  fails_when: the normalized evaluation's evidence[0].fields or .conceptDescription stops equaling []
    / "" for a source item that itself carries [] / "", or either reads as undefined
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: an empty concept_description renders a stated absence, never invented text (criterion 4) > renders
    the stated-absence sentence when concept_description is an empty string
  proves: 'criterion 7: an evidence item whose concept_description is the empty string renders exactly
    what the item''s own snapshot carries, with no glossary value substituted; together with the no-explicit-snapshot
    test below, also stands as the observable half of criterion 5 (renderConceptDescription has one rendering
    for empty and no separate rendering for absent)'
  fails_when: an item with an empty concept_description renders anything other than the literal sentence
    "No description recorded for this concept.", including a substituted glossary value or a blank paragraph
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: an empty fields snapshot renders a stated absence, and the item still renders (criterion 5) >
    renders the stated-absence sentence for an empty fields array, alongside the item's own other content
  proves: 'criterion 8: an evidence item whose fields list is empty renders exactly what the item''s own
    snapshot carries, with no capability-registry value substituted; together with the no-explicit-snapshot
    test below, also stands as the observable half of criterion 6 (renderFieldSemantics has one rendering
    for empty and no separate rendering for absent)'
  fails_when: an item with an empty fields array renders anything other than "No field semantics recorded
    for this observation.", or the rest of the item stops rendering alongside it
- file: src/routes/case-simulation-detail-evidence-tab-snapshot.spec.ts
  name: an item carrying no explicit snapshot renders the same honest-empty text as its empty-value siblings,
    without error (criterion 6) > renders the same stated-absence sentences criteria 4 and 5 already render,
    for an item constructed with no explicit fields/concept_description override
  proves: 'criteria 5, 6, 11 and 12 jointly: testEvidenceItem''s own default supplies fields and conceptDescription
    (12), that default renders the identical honest-empty text as the two tests above render for an explicit
    empty value -- so no separate rendering exists for an item built with no override (5, 6) -- and this
    spec file makes no assertion of a rendering distinct from its empty-value siblings for such an item
    (11)'
  fails_when: constructing an evidence item via testEvidenceItem with no explicit fields/conceptDescription
    override ever renders text different from the explicit-empty-value cases above -- e.g. testEvidenceItem
    stops defaulting to [] / "", or a distinct "absent" rendering is reintroduced
not_applicable:
- edge_case: A simulate response whose evidence item omits the fields or concept_description key entirely,
    or sends a wrong-typed value for either, at runtime
  why: the task's own ADVISORY note states this is backend-side production that no criterion here verifies
    -- the frontend type no longer admits such a value at all, so no criterion asks a test to reach past
    that boundary
- edge_case: Rendering, snapshotting or falling back on capability_payload_notes
  why: the task's own REMAINDER note places capability_payload_notes in a separate task; no criterion
    here declares, carries or renders it
- edge_case: Concurrent or repeated calls to toDetailEvidence
  why: it is a pure, synchronous mapping function with no shared state
- edge_case: A duplicate evidence item, or an empty/multi-item evidence array
  why: no criterion here states a uniqueness or cardinality constraint over the evidence array; array-shape
    behavior is a separate, already-tested obligation this task's files do not touch
- edge_case: A boundary length on fields or concept_description content
  why: neither this task's criteria nor domain/investigation/evidence states a length or range constraint
    on either attribute
untested:
- criterion 13 (the frontend type-checks with no error arising from fields or concept_description in any
  file that declares, converts or renders an evidence item) is a whole-tree compiler fact, decided by
  the project's own typecheck step (TYP-01), not by a vitest test; the three @ts-expect-error tests above
  are file-scoped instances of the same check, and the aggregate, whole-tree claim rests on the implementation's
  own captured build run.
- 'domain/investigation/evidence: the node''s fact is the whole value object -- concept, inputs, observation,
  observed_at, origin, result, result_detail, elapsed_ms, the capability relationship, and capability_payload_notes
  are all untouched by any test here. This task''s tests decide only the fields/concept_description honest-empty
  slice, so the node''s fact is not decided whole.'
- 'rules/investigation/presentation-reads-the-evidence-snapshot: the invariant''s statement enumerates
  three snapshotted things an operator-facing surface must show as-carried -- concept_description, field
  semantics and capability_payload_notes. This task''s own REMAINDER note places capability_payload_notes
  outside its criteria, so no test here decides the invariant whole; only the concept_description and
  field-semantics slices are covered.'
---

## What it is
Three new type-refusal tests pin the requiredness of fields/concept_description on all three evidence types; the pre-existing, task-modified snapshot/adapter/render tests are held up as the proof for the passthrough, collapse and honest-empty criteria.

## Notes
Two suite attempts preceded this one. The first (run/conformant-record-shapes-evidence-semantics-always-present-suite) failed at typecheck: two new @ts-expect-error directives preceded a multi-line object literal, so TypeScript's error landed a few lines past the directive rather than on the very next line (cause: test, on a test this delivery's own proof wrote -- fixed by collapsing both literals to one line each). The second (run/conformant-record-shapes-evidence-semantics-always-present-suite-2) failed at the test step: src/hooks/use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts's first describe block built an inline, untyped mock-response evidence literal that bypassed the compiler's required-field check and still omitted fields/concept_description, crashing renderFieldSemantics (cause: test, on a file the implementation record already claimed but had only partly corrected -- fixed by supplying the honest-empty value there too).
