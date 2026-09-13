---
target: frontend
title: pt-BR message module proof, and the corrected literal expectations it made stale
summary: Proves the module's whole finite inventory is non-empty pt-BR text, refutes the one
  candidate the task's UNDERDETERMINED note names (a single shared text collapsing the three
  unresolved reasons, the nine reading-note kinds, or the two operations-read states),
  demonstrates by same-string-reference that four representative rendered surfaces read from the
  module rather than duplicate its text, and corrects every pre-existing test whose literal
  English assertion this task's translation made stale.
implementation: sha256:7f2cbeb369bc6bc1e895b77bbcefb14c4fdd0a3bc5fb5c913a43f35963a2c276
run: run/drafted-answer-disclosure-pt-br-message-module-suite-3
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
tests:
- file: src/services/connector-configuration-messages.spec.ts
  name: every exported constant and function yields non-empty text carrying its own known pt-BR
    wording
  proves: Criterion 3, whole -- every one of the module's exported symbols (each parameterized
    function invoked once per value in its own finite vocabulary where one exists), not a sample
    of them, since the criterion states "every message the module holds."
  fails_when: any single entry's value stops being non-empty, or stops containing the specific
    pt-BR fragment its own current text carries.
- file: src/services/connector-configuration-messages.spec.ts
  name: the three unresolved-reason messages are pairwise distinct
  proves: the task's own UNDERDETERMINED entry, its unresolved-reason clause -- refuses exactly the
    implementation the entry names (one shared text for all three reasons).
  fails_when: any two of the three closed-set reasons produce the same message text.
- file: src/services/connector-configuration-messages.spec.ts
  name: the nine reading-note-kind messages are pairwise distinct
  proves: the same UNDERDETERMINED entry, its reading-note-kind clause.
  fails_when: any two of the nine closed-set kinds produce the same message text.
- file: src/services/connector-configuration-messages.spec.ts
  name: the outstanding-read message and the no-operations-declared message are distinct from one
    another
  proves: the same UNDERDETERMINED entry's third clause.
  fails_when: OPERATIONS_READ_PENDING_MESSAGE and OPERATIONS_READ_EMPTY_MESSAGE become equal.
- file: src/services/connector-configuration-messages-consumption.spec.ts
  name: renders the same string CONFIGURATION_HELPER_WAITING_ON_CONNECTOR_NAME_MESSAGE holds when
    no connector name stands
  proves: criterion 1, by same string reference.
  fails_when: the component stops rendering the module's own constant value for this state.
- file: src/services/connector-configuration-messages-consumption.spec.ts
  name: renders the same string CONFIGURATION_HELPER_REQUEST_DRAFT_BUTTON holds as the button's
    accessible name once a connector name and a chosen operation both stand
  proves: criterion 1, by same string reference, over the draft-request button.
  fails_when: the button's accessible name stops matching the imported constant.
- file: src/services/connector-configuration-messages-consumption.spec.ts
  name: renders the same string CONFIGURATION_HELPER_HEADING holds as the section's own heading
  proves: criterion 1, by same string reference, over the Configuration Helper's own heading.
  fails_when: the heading's accessible name stops matching the imported constant.
- file: src/services/connector-configuration-messages-consumption.spec.ts
  name: titles the apply-confirmation dialog with the same string
    APPLY_CONFIRMATION_DIALOG_TITLE holds, once a draft is offered over an unsaved edit
  proves: criterion 2, by same string reference, over the configuration form's apply-confirmation
    dialog.
  fails_when: the dialog's title stops matching the imported constant.
- file: src/services/connector-configuration-draft-disclosure.spec.ts
  name: fetch-refusal, not-readable-refusal and unrecognised-refusal assertions (pre-existing,
    corrected)
  proves: (pre-existing, corrected) that spec's own criteria 9, 10, 12 -- a fetch refusal names its
    failure kind, a document-not-readable refusal is distinguishable, and an unrecognised failure
    reuses none of the three named refusal sentences.
  fails_when: any of the three refusal conditions stops naming its own reason, or the
    unrecognised fallback starts reusing a fragment unique to one of the three named refusals'
    current pt-BR text.
- file: src/services/connector-configuration-operations-read-disclosure.spec.ts
  name: the three operations-read refusal messages (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criteria 1-5 -- an unfetchable link, an
    unreadable document and an unrecognised refusal are each stated and distinguishable.
  fails_when: any of the three refusal conditions stops naming its own reason in pt-BR, or reuses
    a fragment unique to a different one of the three.
- file: src/routes/connector-configuration-helper-fields.spec.ts
  name: every inline-text assertion across this file's criteria 1-12, 23 (pre-existing, corrected)
  proves: (pre-existing, corrected) the drafting/drafted/refusal disclosure criteria this file's
    own tests establish.
  fails_when: any of these rendered fragments stops matching the module's current pt-BR text for
    that state.
- file: src/routes/connector-configuration-helper-fields-apply.spec.ts
  name: Apply-button presence/absence and click-forwarding assertions (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criterion 7 and criterion 1's callback half.
  fails_when: the Apply button's accessible name stops matching "Aplicar" in any of the states
    this file exercises.
- file: src/routes/connector-configuration-helper-fields-operation-select.spec.ts
  name: the surviving link input and Request Draft button (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criterion 7.
  fails_when: the link input or the Request Draft button stops being reachable under its current
    pt-BR accessible name.
- file: src/routes/connector-configuration-helper-fields-draft-request-gate.spec.ts
  name: the four gate states' messages and button (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criteria 1-5 (the draft-request gate).
  fails_when: any of the four gate states stops matching its current pt-BR text or button name.
- file: src/routes/connector-configuration-helper-fields-stale-draft-marking.spec.ts
  name: the staleness statement and Apply button (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criteria 4-7 (stale-draft marking). Corrected
    the /stale/i regex to /desatualizado/i.
  fails_when: the staleness statement stops rendering (or renders when it should not), or the
    Apply button stops being reachable under its current name.
- file: src/routes/connector-configuration-helper-fields-operations-read-disclosure.spec.ts
  name: operations-read pending/empty/refusal fragments (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criteria 3, 4, 7, 8 and operations-read-states
    criteria 1-4.
  fails_when: any of the five pairwise-distinct statements this file asserts stops matching its
    current pt-BR text.
- file: src/routes/connector-configuration-helper-fields-response-fields.spec.ts
  name: response-field rendering (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criteria 1-5 (response-field disclosure).
  fails_when: any of the rendered response-field fragments stops matching its current pt-BR text.
- file: src/routes/connector-configuration-helper-fields-reading-notes.spec.ts
  name: reading-note rendering (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criteria 1-3, 5 (reading-note disclosure).
  fails_when: the rendered detail fragment or the section label stops matching its current pt-BR
    text.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: every Connector/Configuration/link/Operation label and Request-Draft/Save button in this
    file (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criteria 1-8.
  fails_when: any of the labelled fields or named buttons this file exercises stops being
    reachable under its current pt-BR accessible name.
- file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  name: the apply-confirmation flow's labels, buttons and dialog text (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own apply-confirmation criteria 1, 3-7 on both the
    create screen and the ready detail view.
  fails_when: any of the five apply-confirmation behaviors these tests stage stops holding once
    the pt-BR controls and dialog text are read correctly.
- file: src/routes/connector-configuration-form-fields-apply-confirmation-diff.spec.ts
  name: the diff itemisation labels and buttons (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own apply-confirmation-diff criteria 1-5.
  fails_when: any of the three key-change prefixes or the not-itemisable statement stops matching
    its current pt-BR text.
- file: src/routes/connector-configuration-form-fields-action-footer.spec.ts
  name: the Actions group's Save control (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own action-footer criteria 1-2.
  fails_when: the Save button stops being reachable under its current pt-BR accessible name.
- file: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  name: the whole apply-draft flow's labels and buttons (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own apply-draft criteria 1-6.
  fails_when: any labelled field or named button this flow depends on stops being reachable under
    its current pt-BR accessible name.
- file: src/routes/connector-configuration-detail-screen-outcome.spec.ts
  name: the Configuration field and Save button across the three save-outcome tests (pre-existing,
    corrected)
  proves: (pre-existing, corrected) that spec's own save-outcome criterion 4.
  fails_when: the Configuration field or the Save button stops being reachable under its current
    pt-BR accessible name.
- file: src/routes/connector-configuration-detail-screen-discard.spec.ts
  name: the Configuration field and Save button (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own discard-confirmation-dialog criteria 1-3.
  fails_when: the Configuration field or the Save button stops being reachable under its current
    pt-BR accessible name.
- file: src/routes/connector-configuration-detail-screen-cached-load.spec.ts
  name: the Connector/Configuration fields and Save button (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own already-held-answer criteria 1, 3-5.
  fails_when: the Connector field, the Configuration field, or the Save button stops being
    reachable under its current pt-BR accessible name.
- file: src/routes/connector-configuration-detail-screen-footer-portal.spec.ts
  name: the SAVE_BUTTON constant and Configuration field (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own footer-portal criteria 1-5.
  fails_when: the Save button or the Configuration field stops being reachable under its current
    pt-BR accessible name.
- file: src/routes/connector-configuration-detail-screen.spec.ts
  name: the Connector/Configuration fields and Save button across this file's criteria
    (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own detail-screen criteria 1, 3, 6, 8.
  fails_when: the Connector field, the Configuration field, or the Save button stops being
    reachable under its current pt-BR accessible name.
- file: src/routes/connector-configuration-create-screen.spec.ts
  name: the Connector/Configuration fields and Save button across this file's criteria
    (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own create-screen criteria 3, 4, 5, 12, 13.
  fails_when: the Connector field, the Configuration field, or the Save button stops being
    reachable under its current pt-BR accessible name.
- file: src/routes/connector-configuration-create-screen-save.spec.ts
  name: the Connector/Configuration fields and Save button (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own create-screen save criteria 6-11.
  fails_when: the Connector field, the Configuration field, or the Save button stops being
    reachable under its current pt-BR accessible name.
- file: src/routes/connector-configuration-create-screen-outcome.spec.ts
  name: the Connector/Configuration fields and Save button (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own create-screen outcome criterion 4.
  fails_when: the Connector field, the Configuration field, or the Save button stops being
    reachable under its current pt-BR accessible name.
- file: src/routes/connector-configuration-create-screen-cancel.spec.ts
  name: the Connector/Configuration fields (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own create-screen cancel criteria 1, 6, 7.
  fails_when: the Connector field or the Configuration field stops being reachable under its
    current pt-BR accessible name.
- file: src/routes/connector-configuration-detail-ready-view-forwards-configuration-text.spec.ts
  name: the Configuration field and Save button (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criteria 3, 4.
  fails_when: the Configuration field or the Save button stops being reachable under its current
    pt-BR accessible name.
- file: src/routes/connector-configuration-detail-screen-save.spec.ts
  name: the Configuration field and Save button across this file's criterion 4 and 7 tests
    (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own detail-screen save criteria 4, 7.
  fails_when: the Configuration field or the Save button stops being reachable under its current
    pt-BR accessible name.
- file: src/routes/connector-configuration-detail-screen-return-to-origin.spec.ts
  name: the Configuration field (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own return-to-origin criteria 1, 2, 7-10, 19.
  fails_when: the Configuration field stops being reachable under its current pt-BR accessible
    name.
- file: src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
  name: the Configuration field (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criterion 7.
  fails_when: the Configuration field stops being reachable under its current pt-BR accessible
    name.
- file: src/routes/connector-configuration-detail-ready-view-order.spec.ts
  name: the Configuration field (pre-existing, corrected)
  proves: (pre-existing, corrected) that spec's own criterion 2.
  fails_when: the Configuration field stops being reachable under its current pt-BR accessible
    name.
- file: src/routes/connector-configuration-detail-screen-listing-route.spec.ts
  name: the one presence-based Configuration-field assertion this file makes (pre-existing,
    corrected)
  proves: (pre-existing, corrected) that spec's own listing-route UNDERDETERMINED note.
  fails_when: the Configuration field stops being reachable under its current pt-BR accessible
    name once the ready phase actually renders it.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: shared Configuration-field and Save-button queries used across every test in this file
    (pre-existing, corrected -- found red on the first suite run, missed by the initial pass since
    the ConnectorTestPanel feature is outside this task's named files but shares the same rendered
    Configuration field and Save button on the same screen)
  proves: (pre-existing, corrected) the placeholder-reconciliation criteria this file's own tests
    establish, unrelated to this task's own criteria -- the correction only restores reachability
    of the shared field/button this test-panel feature depends on.
  fails_when: the shared Configuration field or Save button stops being reachable under its current
    pt-BR accessible name.
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: shared Configuration-field and Save-button queries (pre-existing, corrected, same reason as
    above)
  proves: (pre-existing, corrected) that file's own capability-picker and create-screen-Test-section
    criteria.
  fails_when: the shared Configuration field or Save button stops being reachable under its current
    pt-BR accessible name.
- file: src/routes/connector-test-panel-fields.spec.ts
  name: shared Configuration-field query (pre-existing, corrected, same reason as above)
  proves: (pre-existing, corrected) that file's own subject-attribute-value criterion.
  fails_when: the shared Configuration field stops being reachable under its current pt-BR
    accessible name.
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: shared Configuration-field and Save-button queries (pre-existing, corrected, same reason as
    above)
  proves: (pre-existing, corrected) that file's own attribute-row criterion.
  fails_when: the shared Configuration field or Save button stops being reachable under its current
    pt-BR accessible name.
not_applicable:
- edge_case: Concurrent or overlapping requests changing state mid-render.
  why: This task moves string values and changes their language; it introduces no new
    asynchronous logic for a race to reach.
- edge_case: A dependency (network call, storage) failing or answering slowly.
  why: No criterion of this task adds a new dependency; the existing fetch-failure branches are
    exercised in their now-pt-BR form by the corrected pre-existing tests.
- edge_case: An empty collection rendered in place of an item.
  why: No criterion of this task states a new list obligation; the pre-existing empty-list tests
    are unaffected by translation.
- edge_case: A boundary at each end of a numeric range.
  why: This task's criteria concern wording and its language, not any numeric range.
untested:
- The specific pt-BR word chosen for a given English source word is the implementation's own
  inference about natural pt-BR phrasing -- criterion 3 requires the text to be pt-BR, not any one
  specific translation of it. A later, equally valid re-wording would be a legitimate change to the
  module and to the tests that mirror it, not a regression this proof would be right to catch.
- Criterion 4 ("no operator-facing wording of this surface is held anywhere under this area but
  that module") is a totality claim over source structure. No finite render decides this; it is
  answered by a source reading, not by a test asserting part of the claim as the whole.
divergences:
- cites: TST-04
  file: src/services/connector-configuration-messages-consumption.spec.ts
  departure: This file's primary subject is the message module (imported symbols asserted by
    reference), so it sits beside connector-configuration-messages.ts and is named for it, per the
    rule. Its four tests each also render a route component to prove criteria 1 and 2's "reads
    from the module" clause by same-string-reference, so an equally defensible reading of the rule
    would instead place it beside those route components.
  why: Disclosed rather than silently resolved either way; the module-adjacent placement was
    chosen because the file's assertions are keyed off the module's exports, not the components'.
---

## What it is
The proof of the module's finite pt-BR inventory, the distinctness the UNDERDETERMINED note demands, and the correction of every pre-existing test whose literal expectation this translation made stale.

## Notes
Suite round 1 failed 14 tests across 4 spec files under `connector-test-panel-*`: a wholly separate
feature (the connector test panel) that renders on the same screen as the connector configuration
form and queries the SAME shared Configuration field and Save button this task translated, by their
old English accessible names. Missed by the test-author's search since those files' own describe
blocks are about the test panel, not the connector configuration surface. Corrected the same way as
every other stale pre-existing assertion in this delivery: updated the literal accessible-name
strings to the module's current pt-BR text, changing no assertion's meaning. Suite round 2 still
failed 7 tests in 3 of those same files over a remaining stale "Save" button name; corrected the
same way. Suite round 3 green.
