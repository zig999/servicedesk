---
target: frontend
title: Proof for drafted-answer-disclosure/status-readings-stated
summary: Tests the Configuration Helper's disclosure of status readings -- each stated with its status,
  its ending and, where carried, what the document declared it as, distinguishably and with no status
  the answer did not carry -- at both the projection layer and the rendered surface.
implementation: sha256:f4f81eb00fa600bdf43ed896168eaa0074b6197f3f8451b29ae24c488397be7d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-status-readings-stated-suite-2
tests:
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries status and ending through unchanged for every reading, and carries declaredAs as undefined
    for a reading with no declared_as
  proves: 'Criteria 1, 2 and 3 at the projection layer: each status reading stated with its status, its
    ending, and, where carried, what the document declared it as.'
  fails_when: the projection stops copying a reading's own status or ending unchanged, or fabricates or
    drops declaredAs instead of carrying declared_as through exactly as the reading carries it.
  demonstrates: domain/integration/connector-configuration-draft-status-reading
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: carries through an empty array rather than inventing a status reading
  proves: 'Criterion 5 at the projection layer, the empty case: no status the answer did not carry is
    stated.'
  fails_when: the projection invents a status reading where draft.status_readings carried none, or stops
    answering with an empty array.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders exactly the given status readings, each by its own status, its own ending and its declared_as
    where carried
  proves: Criteria 1, 2, 3 and 5 (the nonzero case) at the rendered surface.
  fails_when: any of the three readings' status, ending or declared_as (where carried) stops being rendered,
    an extra status reading is rendered, or a declared_as is rendered for a reading that carries none.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders exactly the given status readings, each by its own status, its own ending and its declared_as
    where carried
  proves: The status_readings clause of rules/integration/an-answered-draft-request-states-its-draft-to-the-operator.
  fails_when: the surface stops stating a carried status reading's status, ending or declared_as, or states
    a status reading the answer did not carry.
  demonstrates: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders exactly the given status readings, each by its own status, its own ending and its declared_as
    where carried
  proves: The status-readings clause of scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes.
  fails_when: the surface stops stating any of the scenario's three status readings (200, 403, 503) with
    its status, its ending and what the document declared it as.
  demonstrates: scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders the status and the ending under their own distinct labels, so neither could be read as
    the other
  proves: 'Criterion 4: status and ending distinguishable, neither standing for the other.'
  fails_when: the rendered item's status and ending are not each held under their own distinct label.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: renders no status reading at all
  proves: Criterion 5 at the rendered surface, the empty case.
  fails_when: any status-reading text is rendered when draft.statusReadings is empty.
not_applicable:
- edge_case: Two status readings sharing the same status code
  why: domain/integration/connector-configuration-draft-status-reading pairs one status with one ending
    in one drafted statusMap, so a status is already unique per reading upstream of this task.
- edge_case: A status reading whose declared_as is an empty string rather than absent
  why: No criterion or node distinguishes an empty declared description from an absent one.
- edge_case: Concurrent or overlapping draft requests changing status_readings mid-render
  why: No criterion or node of this task addresses concurrency; the outcome state machine's own stale-disclosure
    clearing is already covered by pre-existing tests.
untested:
- domain/integration/connector-configuration-draft's fact spans connector, configuration, unresolved,
  generated_credentials, method_mismatch, response_fields and reading_notes as well as status_readings;
  this task only consumes the already-grown status_readings attribute unaltered.
- Whether the 'Status readings' section is hidden entirely or rendered with an empty list when draft.statusReadings
  is empty is an inference the implementation recorded, not stated by any criterion, so this specific
  display choice is left unproven rather than pinned by a test.
---

## What it is
Proof of the status-readings disclosure at both the projection layer and the rendered surface.

## Notes
Suite round 1 failed 18 tests in three pre-existing route spec files -- a real implementation defect (unguarded .map on an optional field), not a defect of this proof's own tests. Fixed by the implementer defaulting to an empty array. Suite round 2 passed clean.
