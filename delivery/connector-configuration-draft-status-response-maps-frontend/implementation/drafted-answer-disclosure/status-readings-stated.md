---
target: frontend
title: Status readings stated in the Configuration Helper's answer disclosure
summary: Adds a "Status readings" section to the Configuration Helper's drafted-answer disclosure, stating
  each status reading's status, ending and declared_as (where present), fed from the existing ConnectorConfigurationDraft.status_readings
  array.
task: sha256:18318734eef68af930d959d60b71b0c517960d7ccb2c86a6a82960c2d9f9719b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-status-readings-stated-suite-2
files:
- path: src/services/connector-configuration-draft-disclosure.ts
  effect: Adds StatusReadingDisclosure (status, ending, declaredAs) and a statusReadings field on DraftDisclosure,
    populated by draftDisclosureFrom() mapping (draft.status_readings ?? []) one-to-one with no filtering
    or reordering -- defaulting to an empty array so a caller's draft omitting the field (three pre-existing
    fixtures, not yet widened by any task) does not crash the projection.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Renders a "Status readings" section (shown only when draft.statusReadings.length > 0, following
    the Unresolved/Generated-credentials convention) listing each reading as its status, its ending and,
    where declaredAs is defined, its declared description, each on its own labeled segment.
criteria:
- criterion: Each status reading the answer carries is stated with the status that reading names.
  met: true
  how: draftDisclosureFrom() copies reading.status into StatusReadingDisclosure.status unchanged, and
    the li in connector-configuration-helper-fields.tsx renders it as "Status {reading.status}".
- criterion: Each status reading is stated with the ending the draft mapped that status to.
  met: true
  how: 'reading.ending is carried through the same projection and rendered as "-- ending: {reading.ending}"
    beside the status, for every entry of draft.statusReadings.'
- criterion: Where a status reading carries what the document declared that status as, that description
    is stated.
  met: true
  how: 'declared_as is projected as declaredAs (string | undefined, unchanged optionality); the li renders
    "(declared as: {reading.declaredAs})" only when declaredAs !== undefined.'
- criterion: A status reading's status and its ending are distinguishable from one another, neither standing
    for the other.
  met: true
  how: 'status is rendered bold and prefixed with the word "Status"; ending follows an explicit "-- ending:"
    label as separate, unstyled text; declared_as (where present) follows its own "(declared as: ...)"
    label -- three distinctly labeled segments, none of which could be read as another.'
- criterion: No status the answer did not carry is stated.
  met: true
  how: the section maps only over draft.statusReadings, itself built only from draft.status_readings,
    with no synthetic or default entries added anywhere in the pipeline, and the whole section is omitted
    when that array is empty.
nodes:
- node: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: This task answers exactly the rule's status_readings clause -- every status reading the answer
    carries, each by its status, its ending and what the document declared it as -- and states no status
    the answer did not carry.
- node: domain/integration/connector-configuration-draft-status-reading
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: StatusReadingDisclosure mirrors the value object's three attributes one-to-one -- status (required),
    ending (required) and declared_as (optional, projected as declaredAs) -- and the render states all
    three.
- node: domain/integration/connector-configuration-draft
  how: This task only consumes the already-grown status_readings attribute of ConnectorConfigurationDraft
    exactly as declared, without altering its shape or that of any other attribute. Honored rather than
    encoded here.
- node: scenarios/integration/an-answered-draft-is-stated-with-its-readings-and-its-notes
  encoded_at:
  - src/services/connector-configuration-draft-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: Demonstrates the scenario's clause that the surface states each status reading with its status,
    its ending and what the document declared it as; the scenario's reading-note clause reaches no criterion
    of this task.
inferences:
- inferred: The section heading reads "Status readings" (title case, plural), following the exact convention
    of the existing "Unresolved" and "Generated credentials"/"Method mismatch" headings.
  from: The existing headings in connector-configuration-helper-fields.tsx, all of which title-case the
    section's subject with no further punctuation.
- inferred: The section is omitted entirely when draft.statusReadings is empty, rather than always rendered
    with an empty list.
  from: The Unresolved and Generated-credentials sections in the same component both gate on .length >
    0, and criterion 5 reads consistently with never presenting an empty section as if it carried something.
- inferred: Status, ending and declared_as are separated by explicit inline labels rather than by position
    alone.
  from: The task's own advisory note reading criterion 4 as a demonstration of the plain statement clause,
    combined with the existing Method Mismatch section's convention of separating its own two values with
    explicit inline labels.
- inferred: Each list item is keyed by reading.status alone.
  from: domain/integration/connector-configuration-draft-status-reading pairs one numeric HTTP status
    with one ending in one drafted statusMap, so status alone is already unique per reading.
preserved:
- The existing Drafted configuration <pre> block and its Apply button.
- The existing Unresolved section's rendering, keys and copy.
- The existing Generated credentials section's rendering, keys and copy.
- The existing Method mismatch section's rendering and copy.
- The existing DraftDisclosure fields (configuration, unresolved, generatedCredentials, methodMismatch)
  and every other branch of disclosureStateForOutcome, unchanged.
deferred:
- what: response_fields and reading_notes have no projection or rendered section yet.
  why: Both reach no criterion of this task per its own Notes (REMAINDER entries) and belong to sibling
    tasks stating the draft's response fields and reading notes respectively.
- what: All copy in this section (and the file generally) stays plain English.
  why: The task explicitly reserves pt-BR wording for a sibling task that moves all strings into a message
    module; introducing wording infrastructure here would widen this task's scope.
- what: UNRESOLVED_REASON_LABEL's orphaned no-matching-input-schema-property entry, flagged by the inventory
    as not part of the current reason enumeration, is untouched.
  why: Outside this task's territory, which is the status_readings statement alone.
---

## What it is
The statement of the drafted statusMap's provenance -- the document's own account of each status beside the ending the draft chose for it.

## Notes
Build round 1 green. Suite round 1 (against build-2's confirmed green build) failed 18 tests across three
pre-existing route spec files this task never touched -- each mocks a ConnectorConfigurationDraft response
that omits status_readings entirely, and the projection's unconditional .map threw, tripping the React error
boundary. Fixed by defaulting to an empty array (`draft.status_readings ?? []`) rather than widening the
three pre-existing fixtures, since the fixtures' own omission is legitimate under the honored-not-yet-required
convention this initiative is still rolling out. Suite round 2 green.
