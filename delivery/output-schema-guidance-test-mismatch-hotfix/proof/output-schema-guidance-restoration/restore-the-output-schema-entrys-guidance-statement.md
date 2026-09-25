---
target: frontend
title: Output schema guidance restoration proven by the pre-existing spec file's own criteria 1-7 tests
summary: Each of the task's six criteria is already proven, one test per criterion, by the pre-existing
  spec file's criterion-1, criterion-3, criterion-4, criterion-5, criterion-6 and criterion-7 tests, verified
  against the restored paragraph's exact text; no gap found, no new test written.
implementation: sha256:d8251e8c9d0b3d6595b92cd2b7e70fa1a1a7ed15a9258a68e83e0f104b139f0c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/output-schema-guidance-restoration-full
tests:
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states that what is entered is JSON (criterion 3) > states
    that the entered content is JSON
  proves: The Output schema entry surface states that what is entered there is JSON.
  fails_when: the rendered guidance paragraph stops containing a sentence matching /o que é inserido aqui
    é json\./i -- e.g. the JSON claim sentence is removed, or reworded away from stating the entered content
    is JSON
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states the field names are the full recursive paths through
    the schema (criterion 1) > states that the read field names are the paths through the schema's own
    top-level properties object and every properties object and items schema reachable beneath it
  proves: The Output schema entry surface states that a field's own name is the path through the schema's
    top-level properties object and every properties object and items schema reachable beneath it.
  fails_when: the guidance stops matching the field-name-path sentence pattern -- e.g. the sentence naming
    the top-level properties object and every nested properties/items schema is removed or altered to
    name a different path rule
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states a reached node's own type and description are read
    as its declared semantics (criterion 4) > states that the type and description declared at the node
    each path reaches, where the schema states them, are read as that field's declared semantics
  proves: The Output schema entry surface states that a reached node's own type and description, where
    the schema states them, are read as that field's declared semantics.
  fails_when: the guidance stops matching the type/description-as-semantics sentence pattern -- e.g. that
    sentence is removed or reworded to claim something other than a reached node's own type and description
    is read as declared semantics
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states nothing else in the schema is read or validated (criterion
    5) > states that no other content of the entered schema is read or validated
  proves: The Output schema entry surface states that no other content of the entered schema is read or
    validated.
  fails_when: the guidance stops matching the "nothing else is read or validated" sentence pattern --
    e.g. that sentence is dropped or weakened to permit reading/validating other content
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance states a description declares meaning and names no decision
    (criterion 6) > states that a description entered there states what its value means and names no decision
  proves: The Output schema entry surface states that a description entered there states what a value
    means and names no decision.
  fails_when: the guidance stops matching the description-meaning-not-decision sentence pattern -- e.g.
    that sentence is removed or reworded to permit a description naming a decision
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: CapabilityFormFields — the guidance makes no claim beyond the three nodes bounding it (criterion
    7) > carries no sentence that fails to match one of the six known claim statements
  proves: The Output schema entry surface states no claim beyond these five.
  fails_when: any sentence appears in the guidance paragraph that does not match one of the six known
    claim patterns -- i.e. a sixth claim, or a changed sentence outside the bounded five, is introduced
    into the statement
not_applicable:
- edge_case: empty or absent value in the Output schema editor
  why: the six criteria concern only the static guidance text rendered beside the entry, which does not
    vary with the entered value's presence or emptiness
- edge_case: malformed or invalid JSON entered in the output schema field
  why: the criteria state what the guidance text says about how a well-formed schema is read, not what
    the surface accepts; acceptance/validity is governed by a-capability-declares-well-formed-schemas,
    and the file's pre-existing, task-untouched criterion-11/12 tests already cover schema-shape boundaries
    outside this task's implementation
- edge_case: concurrent edits or two operations against the entry at once
  why: the guidance is static text with no mutable state of its own; no criterion concerns concurrency
- edge_case: a dependency (e.g. a schema-validation call) failing or answering slowly
  why: the restored paragraph is rendered synchronously from static JSX with no dependency call; no criterion
    concerns latency or a collaborator's failure
untested:
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it -- its fact is a conjunction
  (states all five claims, and refuses no entry, and checks no entered content against any of them). The
  five 'states' clauses are each decided whole by one existing test (the five cited above), and 'refuses
  no entry / checks no entered content' is evidenced only by the file's pre-existing, task-untouched criterion-11
  and criterion-12 tests (Save not disabled for two boundary schema shapes) -- behavior this task's implementation
  never touched. No single existing test asserts the full conjunction, so none can carry `demonstrates`
  without claiming more than it alone proves; the fact is left to a reading assembling these separately-scoped
  tests rather than pinned to one.
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim -- its fact conjoins 'no
  sentence beyond the three source nodes' (decided whole by the criterion-7 test cited above, which checks
  every sentence against the six known patterns), 'carries no worked example of its own' (evidenced only
  by the file's pre-existing, task-untouched criterion-8 tests, no digit/no brace), and 'refuses nothing
  on these grounds' (the same untouched criterion-11/12 evidence as the other node). No single test asserts
  all three together, so `demonstrates` is not claimed here either; the fact is decided by reading the
  separately-scoped tests as a set.
- Implementation record's second inference -- that restoring the paragraph once in CapabilityFormFields
  suffices for identical guidance text on the capability create screen and the capability detail screen,
  since no other component renders its own copy -- is a behavioral claim this task's own six criteria
  do not state (the task's criteria only govern what the text says, not where it is repeated). It happens
  to be exercised by the file's pre-existing, task-unclaimed criterion-10 test (identical text on both
  screens), which is not cited above because it proves none of this task's own six criteria and this task's
  implementation did not touch that mounting logic.
---

## What it is

No new test was written: every one of this task's six criteria is already proven, one test per criterion, by tests already present in the pre-existing spec file capability-form-fields-output-schema-guidance.spec.ts, verified against the restored paragraph's exact text.

## Notes

None.
