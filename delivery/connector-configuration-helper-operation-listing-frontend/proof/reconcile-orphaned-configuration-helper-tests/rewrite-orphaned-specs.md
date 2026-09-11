---
target: frontend
title: Proof for rewrite-orphaned-specs — the three orphaned Configuration Helper specs now drive the
  operation Select
summary: Cites the rewritten it() blocks in the three named spec files that decide this task's four criteria,
  and records why the node this task implements, the suite-wide criterion and the underdetermined casing
  entry carry no test of their own from this task.
implementation: sha256:f2c937548a7dbd69e87fcb655e6e801b1332ecc7f252ed9906d994aa023f0a8e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/reconcile-orphaned-configuration-helper-tests-rewrite-orphaned-specs-suite
tests:
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: ConnectorConfigurationFormFields -- the section offers a control naming one operation from the
    fetched document (criterion 5) > renders an Operation Select whose value reflects the entry the operator
    chooses
  proves: connector-configuration-form-fields-configuration-helper.spec.ts drives the helper by choosing
    an entry from the operations Select, never by typing into a path or a method field.
  fails_when: The Operation control's own displayed text stops containing the path and method of the entry
    chooseHelperOperation opened the Select and picked -- including if the Select were bypassed in favor
    of typing into a path or method input, since chooseHelperOperation only knows how to open the Select
    and mouseDown an option, and finds no such option to click if the helper is driven any other way.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: ConnectorConfigurationFormFields -- the section's control dispatches the draft request with the
    stated link and the chosen operation (criterion 6) > issues a POST to the draft route carrying the
    current connector, link, path and method, when Request Draft is clicked
  proves: Same criterion as above, from the request-payload side -- the operation the draft call carries
    is the one chosen from the Select, not one typed into a separate field.
  fails_when: The JSON body posted to the draft route stops carrying HELPER_OPERATION's own path and method
    after chooseHelperOperation selected it, or the Select's open/select sequence throws because no such
    control exists to interact with.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- on the ready detail view, applying a draft over a differing
    unsaved edit opens a confirmation dialog rather than replacing anything yet (criteria 1 and 6) > opens
    a confirmation dialog and leaves the Configuration field's value exactly as the operator left it
  proves: The detail view's conflict-opens-a-dialog behavior is unchanged, and reaching it goes through
    offerDraft's Select-driven pick rather than typed path/method fields.
  fails_when: No dialog opens once Apply is clicked over a differing unsaved edit, the Configuration field's
    value changes before confirmation, or offerDraft throws because the Select it depends on is no longer
    how the operation is named.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- declining the ready detail view's apply confirmation leaves
    the unsaved edit untouched (criterion 3) > keeps the Configuration field's value exactly as it stood,
    writing none of the draft's text, once Keep editing is clicked
  proves: The decline path on the detail view still leaves the unsaved edit untouched, reached the same
    Select-driven way.
  fails_when: The Configuration field's value changes, or the dialog fails to close, once Keep editing
    is clicked.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- confirming the ready detail view's apply replaces the unsaved
    edit with the draft's configuration text (criterion 4) > writes the draft's own configuration text
    into the Configuration field once the dialog's Apply button is clicked
  proves: The confirm path on the detail view still replaces the field with the drafted text.
  fails_when: The Configuration field does not end up holding the drafted configuration text after the
    dialog's own Apply button is clicked.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- on the ready detail view, applying a draft while nothing is
    unsaved is never refused by the confirmation rule (criterion 5) > applies the draft immediately, opening
    no confirmation dialog, when the Configuration field holds no unsaved edit
  proves: The no-conflict skip-the-dialog behavior on the detail view is unchanged.
  fails_when: A dialog opens, or the field is not updated to the drafted text, when there was no unsaved
    edit to conflict with.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- on the ready detail view, asking for, declining and confirming
    the apply confirmation issues no register-connector call (criterion 7) > issues no PUT to the registry
    through the whole ask/decline/ask/confirm sequence
  proves: The invariant that offering, declining and later confirming an apply never itself registers
    the connector is unchanged on the detail view.
  fails_when: Any PUT to the registry route is observed across the ask/decline/ask/confirm sequence.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- the apply confirmation dialog's own wording and button styling
    (disclosed inference) > titles the dialog, describes the unsaved edit it would replace, and styles
    Apply as destructive against a plain Keep editing
  proves: The dialog's pre-existing title, description and button styling are unchanged, reached the same
    Select-driven way.
  fails_when: The dialog's title text, description text, or the destructive/plain styling on its two buttons
    stop matching what this test asserts.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- on the create screen, applying a draft over unsubmitted, operator-entered
    content opens a confirmation dialog rather than replacing anything yet (criteria 2 and 6) > opens
    a confirmation dialog and leaves the Configuration field's value exactly as the operator typed it
  proves: The create screen's conflict-opens-a-dialog behavior is unchanged, reached the same Select-driven
    way.
  fails_when: No dialog opens over conflicting typed content, or the field's value changes before confirmation.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- declining the create screen's apply confirmation leaves the
    operator's typed content untouched (criterion 3) > keeps the Configuration field's value exactly as
    typed, writing none of the draft's text, once Keep editing is clicked
  proves: The create screen's decline path still leaves the typed content untouched.
  fails_when: The field's value changes, or the dialog fails to close, once Keep editing is clicked.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- confirming the create screen's apply replaces the typed content
    with the draft's configuration text (criterion 4) > writes the draft's own configuration text into
    the Configuration field once the dialog's Apply button is clicked
  proves: The create screen's confirm path still replaces the field with the drafted text.
  fails_when: The field does not end up holding the drafted configuration text after the dialog's Apply
    is clicked.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- on the create screen, applying a draft while the Configuration
    field is still empty is never refused by the confirmation rule (criterion 5) > applies the draft immediately,
    opening no confirmation dialog, when the Configuration field holds no unsubmitted edit
  proves: The create screen's no-conflict skip-the-dialog behavior is unchanged.
  fails_when: A dialog opens, or the field is not updated, when there was no unsubmitted content to conflict
    with.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: ConnectorConfigurationFormFields -- on the create screen, asking for, declining and confirming
    the apply confirmation issues no register-connector call (criterion 7) > issues no PUT to the registry
    through the whole ask/decline/ask/confirm sequence
  proves: The invariant that the ask/decline/ask/confirm sequence never itself registers the connector
    is unchanged on the create screen.
  fails_when: Any PUT to the registry route is observed across that sequence.
- file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  name: ConnectorConfigurationCreateScreen -- applying an answered draft writes its configuration text
    into the Configuration field (criterion 1) > shows the drafted configuration text in the Configuration
    field after Apply
  proves: Applying a draft still writes its configuration text into the field, reached by choosing the
    operation from the Select rather than typing it.
  fails_when: The Configuration field does not hold the drafted text after Apply, or fillHelperRequestFields
    throws because no Select is available to choose the operation from.
- file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  name: ConnectorConfigurationCreateScreen -- applying an answered draft dispatches no save request, so
    every registered connector configuration stands unchanged (criteria 2 and 3) > issues no PUT to the
    registry when Apply is clicked
  proves: Applying a draft still issues no PUT, unchanged.
  fails_when: Any PUT to the registry is observed once Apply is clicked.
- file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  name: ConnectorConfigurationCreateScreen -- applying an answered draft leaves the operator on the same,
    unsubmitted surface (criterion 4) > stays on /connectors/new with the applied text still held rather
    than submitted
  proves: Applying a draft still leaves the operator on /connectors/new, unchanged.
  fails_when: The router's pathname changes away from /connectors/new after Apply.
- file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  name: ConnectorConfigurationCreateScreen -- applying an answered draft leaves the Connector field exactly
    as it stood (criterion 5) > keeps the typed connector name unchanged after Apply
  proves: Applying a draft still leaves the Connector field's typed value untouched.
  fails_when: The Connector field's value changes from what was typed once Apply is clicked.
- file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  name: ConnectorConfigurationCreateScreen -- applying a draft whose text is not a well-formed object
    leaves Save disabled (criterion 6, recomputed rather than trusted) > keeps Save disabled after applying
    non-object JSON text, despite the wiring passing a valid hint
  proves: Save's disabled state is still recomputed from the applied text itself rather than trusted from
    a hint, unchanged.
  fails_when: Save becomes enabled after a non-object JSON text is applied.
- file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  name: ConnectorConfigurationCreateScreen -- applying a well-formed draft's text enables Save, recomputed
    from the drafted content itself (criterion 6, recomputed from real content) > flips Save from disabled
    to enabled once a well-formed draft is applied to a field that started invalid and empty
  proves: Save flips from disabled to enabled once well-formed drafted content lands in the field, unchanged,
    reached via the Select-driven flow.
  fails_when: Save stays disabled after a well-formed draft is applied, or fillHelperRequestFields throws
    for want of a path/method Select to choose from.
untested:
- 'The full frontend suite (npm test) passes with these three files included (criterion 4): this is a
  property of executing every spec file in the suite together, not something any single test in these
  three files (or a new one) asserts on its own -- verified instead by the captured suite run (run/reconcile-orphaned-configuration-helper-tests-rewrite-orphaned-specs-suite),
  which passed clean, 1490 tests.'
- 'rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing: its
  statement conjoins three facts -- every operation the document declares is offered once the link is
  fetched and parses; the operator names one by choosing it, never by typing; and the draft request names
  the chosen pair''s own path and method. Only the middle clause is exercised by the tests this task''s
  three files carry (cited above); the first and third clauses are exercised by the sibling task''s own
  spec files, per this task''s own REMAINDER note. No test here decides the node''s fact whole, so the
  node stays unproven by this proof.'
- 'The task''s UNDERDETERMINED entry (nothing here excludes stubbing the fixture operation with the OpenAPI
  document''s own lower-case path-item keys, which rules/integration/an-openapi-operations-method-is-upper-cased
  refuses): no test is written over it. That rule is not implemented by this task -- it belongs to, and
  is already delivered and tested by, the sibling task operation-choice-fields -- so settling it sits
  outside what this task implements.'
not_applicable:
- edge_case: The operations-read fetch failing or answering slowly once the OpenAPI link is set.
  why: No criterion of this task states behavior for a failed or slow operations-read fetch; that robustness
    is the sibling task's own hook and its own tests, not this rewrite's concern.
- edge_case: The stubbed OpenAPI document declaring zero operations, or more than one.
  why: This task's criteria require only that the helper be driven by choosing from whatever the Select
    offers; whether the Select offers none, one or many is the offers-every-operation clause the task's
    own REMAINDER note assigns to the sibling task's own spec, not to these three files.
- edge_case: Choosing an operation from the Select before the OpenAPI document link is set.
  why: No criterion here states an ordering constraint between setting the link and choosing an operation;
    that sequencing belongs to the surface's own wiring, not to this task's criteria.
---

## What it is

Cites the it() blocks already present in the three rewritten spec files that decide this task's four criteria; no new test was written, since the rewritten assertions already are the tests that decide them.

## Notes

None.
