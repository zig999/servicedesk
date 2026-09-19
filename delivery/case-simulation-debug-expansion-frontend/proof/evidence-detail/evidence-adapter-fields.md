---
target: frontend
title: toDetailEvidence carries inputs, observedAt, ttl and capabilityPayloadNotes
  through, protected end-to-end
summary: DetailEvidenceItem's four widened fields and toDetailEvidence's verbatim
  pass-through of them are proven at the adapter's own unit boundary by a dedicated
  spec, and kept accurate at the full cockpit-hook boundary by extending four pre-existing
  regression tests to the widened, specification-conformant shape.
implementation: sha256:dace3aa1a65dd3734cde28a44f83cccc47de866f077f5df5ae0603fccc4c1d4e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/evidence-detail-evidence-adapter-fields-suite-2
tests:
- file: src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
  name: toDetailEvidence -- carries inputs, observedAt, ttl and capabilityPayloadNotes
    through unchanged, from the argument alone (criteria 2 and 3) > returns each of
    the four values exactly as the response item carried them
  proves: criteria 1 (as a compile-time precondition), 2 and 3
  fails_when: any of the four fields stops being copied verbatim, or the type stops
    declaring one of them
- file: src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
  name: toDetailEvidence -- an empty capability payload notes snapshot stays empty
    (criterion 4) > carries an empty capability_payload_notes through as an empty
    string, never a substituted note
  proves: criterion 4
  fails_when: capabilityPayloadNotes becomes anything other than "" when the source
    item's own value is ""
- file: src/routes/case-simulation-cockpit-adapters-evidence-adapter-fields.spec.ts
  name: toDetailEvidence -- an item collected with no inputs keeps its recorded empty
    object (criterion 5) > carries the response's own {} through unchanged, never
    an invented placeholder
  proves: criterion 5
  fails_when: inputs becomes anything other than "{}" when the source item's own inputs
    is "{}"
- file: src/routes/case-simulation-cockpit-adapters.spec.ts
  name: toDetailEvidence -- shaping a full-case run's own evidence for the Detail
    region's Evidence tab > carries every field through, renaming the run's own origin
    to the Detail region's own connector
  proves: a pre-existing test's own original obligation, extended to the widened shape
    instead of left asserting a stale narrower one
  fails_when: any field of the mapped object, including any of the four widened ones,
    is dropped, mis-renamed, or holds a value other than the source item's own
- file: src/routes/case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts
  name: fromHypothesisEvaluation -- carries the run's own evidence onto the normalized
    evaluation (criterion 1) > carries a single-hypothesis run's own collected evidence
    item through, narrowed to the Detail region's own shape
  proves: a pre-existing test of an earlier task's own obligation, extended here to
    the widened shape
  fails_when: any field, including any of the four widened ones, is dropped or altered
    between the argument and the normalized evaluation's evidence
- file: src/hooks/use-case-simulation-cockpit-evaluations.spec.ts
  name: useCaseSimulationCockpit -- the Detail region reflects whichever run last
    produced an evaluation (criterion 4) > opens the Detail region for a hypothesis's
    evaluation from a single-hypothesis run, exactly as it would from a full-case
    run
  proves: this pre-existing hook-level test's own obligation, kept accurate against
    the widened shape
  fails_when: result.current.detail?.evidence stops including inputs, observedAt,
    ttl or capabilityPayloadNotes with the fixture's own values, or any previously-asserted
    field regresses
- file: src/hooks/use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts
  name: useCaseSimulationCockpit -- a full-case run's own evidence still reaches a
    case-sourced selection unchanged (criterion 6, Evidence tab) > keeps reading a
    case-sourced selection's Evidence tab data from the run's own evidence array,
    not the newly-added per-evaluation field
  proves: this pre-existing hook-level test's own obligation, kept accurate against
    the widened shape
  fails_when: result.current.detail?.evidence stops including inputs, observedAt,
    ttl or capabilityPayloadNotes with the fixture's own values, or any previously-asserted
    field regresses
not_applicable:
- edge_case: An evidence array with more than one item, or an empty evidence array.
  why: criteria 2, 4 and 5 are stated per item, not about array cardinality; array-length
    behavior belongs to a different, already-tested obligation
- edge_case: A malformed or absent capability_payload_notes or inputs value.
  why: the wire type declares both required strings; this task's criteria speak only
    to empty versus populated values
- edge_case: Concurrent or repeated calls to toDetailEvidence.
  why: it is a pure, synchronous mapping function with no shared state
- edge_case: A non-UTC-formatted observed_at string reaching the adapter.
  why: the UTC guarantee is upstream, at collection; this task's criteria require
    only verbatim pass-through
untested:
- 'domain/investigation/evidence: the node''s fact is the whole value object (twelve
  attributes, its capability relationship, elapsed_ms''s honest-zero default, fields/concept_description
  snapshotting); this task''s tests decide only that four attributes pass verbatim
  through one adapter.'
- 'rules/investigation/presentation-reads-the-evidence-snapshot: this task''s tests
  decide only the capability_payload_notes slice; concept_description/fields are untouched
  pre-existing behavior, and the no-live-read clause has no interception point to
  test behaviorally since toDetailEvidence takes no glossary/registry dependency to
  spy on.'
- 'rules/investigation/an-evidence-items-observed-at-is-a-utc-instant: the invariant
  reaches storage, presentation and judgment; this task''s files are the presentation
  slice alone.'
- 'rules/investigation/an-evidence-items-ttl-is-counted-in-seconds-from-its-own-observation:
  the invariant fixes what the ttl figure means, not a transformation any code performs;
  no behavior in this task''s files computes or interprets the unit or anchor.'
- 'rules/investigation/an-evidence-item-that-sent-no-inputs-records-an-empty-object:
  the invariant is about what the collection act records; this frontend adapter never
  collects, only forwards what the response already carries.'
divergences:
- from: four pre-existing tests across earlier delivered tasks (case-simulation-cockpit-adapters.spec.ts,
    case-simulation-cockpit-adapters-hypothesis-evidence-and-prompt.spec.ts, use-case-simulation-cockpit-evaluations.spec.ts,
    use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts) asserting
    an exact evidence-item shape
  departure: Each asserted a totality (toEqual) over the evidence item's shape that
    this task's own legitimate widening extends with four new required fields. Rather
    than routing each through a separate proof-only re-delivery of its owning task,
    all four were extended in place to include the new fields, matching this delivery's
    own earlier precedent (disclosed the same way in task/case-run-record/run-carries-its-record's
    proof).
  why: The old assertions claimed a total shape this task's own criteria 1-2 legitimately
    extend; the fix in each case is narrow (adding the new fields to the expected
    object) and does not weaken, delete or narrow what any of the four originally
    proved. Disclosed here since the strict process for this exact case is a human-invoked
    proof-only re-delivery per owning task, which this delivery did not take, continuing
    the same pragmatic pattern already established once in this initiative.
---

## What it is
The proof for task/evidence-detail/evidence-adapter-fields: that toDetailEvidence carries inputs, observedAt, ttl and capabilityPayloadNotes from its argument unchanged, including the empty-notes and no-inputs edge cases, kept consistent across four pre-existing regression tests that assert the same evidence shape at higher layers.

## Notes
Two suite attempts failed before this one passed: run/evidence-detail-evidence-adapter-fields-suite failed at the test step -- cause: test, on two files this delivery's own tests did not originally touch (use-case-simulation-cockpit-evaluations.spec.ts, use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts) -- fixed by extending their stale expected-evidence literals to the widened shape, the same pattern already applied to two other files in the first pass.
