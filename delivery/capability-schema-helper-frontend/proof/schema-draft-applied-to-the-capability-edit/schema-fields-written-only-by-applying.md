---
target: frontend
title: The two schema fields written only by the operator's own apply
summary: Full-screen tests on both the capability create screen and the capability detail screen establish that a schema-draft answer's arrival (drafted or refused) writes neither schema field, that each field's own apply act writes only that field behind its own unsaved-edit confirmation while registering nothing, that the write reaches the field through the same onChange contract Discard already reads, and that the act stands offered on both screens.
implementation: sha256:2602e335ab46cd6cd88e6a8ce862ec79b653a32c7b013628cc6d35ead6bfddd7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-draft-applied-to-the-capability-edit-schema-fields-written-only-by-applying-suite-2
tests:
- file: src/routes/capability-form-fields-schema-apply.spec.ts
  name: CapabilityFormFields -- a schema-draft answer's arrival, whether a draft or one of the refusal statements, leaves both the Input schema and the Output schema fields exactly as they stood before the request was dispatched > keeps both fields at whatever the operator had typed, both once a drafted outcome arrives and once a refusal statement arrives
  proves: Criteria 1, 2 and 3 -- that arrival of a drafted outcome writes nothing into either schema field, and that arrival of any of the four refusal statements (one representative exercised) writes nothing into either field either.
  fails_when: Either the Input schema field's or the Output schema field's displayed value differs from what the operator had typed before the request was dispatched, once a drafted outcome arrives or once a refusal statement arrives.
  demonstrates: rules/integration/the-input-schema-and-output-schema-fields-are-untouched-by-a-schema-drafts-arrival
- file: src/routes/capability-form-fields-schema-apply.spec.ts
  name: CapabilityFormFields -- applying either drafted schema writes only into its own field, is refused until the operator confirms it over an unsaved edit there, and registers no capability throughout > gates each field's own apply behind its own confirm, writes only the confirmed field, and leaves the other field and the registry untouched
  proves: Criteria 4, 5, 6, 7, 9, 10 and 12 together -- applying input_schema writes only into the Input schema field and applying output_schema writes only into the Output schema field, each is offered for confirmation and writes nothing until confirmed, declining leaves the field exactly as it stood, and none of this ever issues a register-capability call.
  fails_when: An apply act writes before its confirmation is given, writes into the sibling field instead of (or besides) its own, ignores a decline and writes anyway, fails to write the drafted text once confirmed, or the sequence of open/decline/open/confirm issues a PUT to the capability registry.
  demonstrates: rules/integration/applying-a-drafted-capability-schema-changes-only-the-local-edit
- file: src/routes/capability-form-fields-schema-apply.spec.ts
  name: CapabilityFormFields -- applying a drafted schema onto a field holding no unsaved edit writes it immediately, opening no confirmation dialog > writes the drafted input schema straight into the empty Input schema field with no dialog
  proves: The negative boundary of criterion 9 on the create screen's own signal (an untouched, empty field carries no unsaved edit, so the confirmation gate never engages).
  fails_when: Applying over a field that was never edited either opens a confirmation dialog, or fails to write the drafted text into the field.
- file: src/routes/capability-form-fields-schema-apply.spec.ts
  name: CapabilityFormFields -- on the capability detail screen, applying a drafted input schema is offered just as on the create screen and reaches the same field state Discard already reads > writes the drafted input schema through the field's own state, turning on Discard, which reads it back to the loaded baseline exactly as it would a typed edit
  proves: Criterion 13 (the act stands offered on the capability detail screen, not only on the create screen) and criterion 8 (an applied write reaches the field through the same onChange contract typing uses, so Discard reads it exactly as it would a typed edit).
  fails_when: No apply act is offered on the detail screen, applying does not write the drafted text into the field, the Discard control fails to turn on once the applied write lands, or Discard fails to revert the field to its loaded baseline.
not_applicable:
- edge_case: Applying while a schema-draft request stands pending, or over a drafted answer that has since gone stale relative to the chosen operation
  why: No criterion of this task reaches either case; the Apply act is reachable only once outcome.kind === 'drafted', a state whose own rendering rules belong to and are already tested by the sibling schema-helper-request-and-statement task.
- edge_case: Requesting a schema draft with no operation chosen
  why: Governed by useCapabilitySchemaHelper's own criteria (a separate task's obligation), not by any of this task's thirteen criteria about the two apply acts.
- edge_case: Two apply acts, or two clicks of the same apply act, in flight at once
  why: No criterion addresses concurrency; each apply act is a synchronous state write triggered by one operator click.
- edge_case: An applied write racing an in-flight Save submission
  why: Save's own disabling while isSubmitting is governed by existing, separately-tested save-gating behavior outside this task.
untested:
- UNDERDETERMINED, from the specification -- the task's own Notes observe that rules/integration/a-stated-capability-schema-draft-is-marked-stale-once-what-it-was-generated-for-changes and scenarios/integration/a-cleared-operation-choice-leaves-a-stated-schema-draft-stale both require the apply act to stay offered once a draft goes stale, and that no criterion of this task (criterion 13 asks only that the act be offered on both screens) reaches that. The Notes name no implementation this leaves standing that all criteria would still pass; the absence is the binder's own finding, and no test is invented to fill it.
- 'Inference (isValid forced true on every apply): useApplyToJsonSchemaField writes field.onChange(text, true) unconditionally, regardless of whether the drafted text the backend returned is actually valid JSON. No criterion states this.'
- 'Inference (a whole-form, not per-field, unsaved-edit signal on the detail screen): hasUnsavedEdit there is computed from the form''s own isDirty flag rather than a baseline kept per schema field. The implementation record discloses this as an inference rather than a stated fact, so no test pins the specific coarseness.'
- 'Inference (verbatim reuse of the connector-configuration dialog''s own copy): the confirmation dialog''s title and description name the Configuration field the connector draft owns, not the Input/Output schema field actually being overwritten; no test asserts this literal copy.'
---

## What it is

Full-screen tests over both the capability create and detail screens proving the single write path from a stated draft into the capability form: two independent apply acts, one per field, each written only by the operator's own act and confirmed before overwriting an unsaved edit.

## Notes

The first suite attempt (run/schema-draft-applied-to-the-capability-edit-schema-fields-written-only-by-applying-suite) failed with 3 test failures in the new proof file, all a missing async wait for the create screen's own loading race (`getByLabelText` called before `findByLabelText("Connector")` resolved it); diagnosed cause: test. The test author added the missing wait, matching the file's own fourth test and every sibling spec's convention, and the suite passed on the second attempt (-suite-2). Two earlier build attempts also failed and were fixed by the test author: a broken pre-existing fixture (capability-schema-helper-fields.spec.ts needed stubs for two new required props) and a testing-library/no-manual-cleanup lint violation in the new proof file.
