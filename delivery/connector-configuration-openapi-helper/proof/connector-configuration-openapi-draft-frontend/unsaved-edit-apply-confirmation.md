---
title: Proof that an apply over an unsaved edit is confirmed before anything is replaced
summary: One spec file mounting both the ready detail view and the create screen through their real
  hook chains and a fetch stub proves all seven criteria -- the confirmation dialog's appearance,
  the field's untouched content until a further explicit confirm, the immediate apply where nothing
  is unsaved, and the absence of any register-connector call through the whole sequence.
implementation: sha256:3b8873c3fdde0d89af4082e17655ca5cea7773c68b8b401ebf60b08da4696418
standard:
  at: ../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-unsaved-edit-apply-confirmation-suite
tests:
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- on the ready detail view, applying a draft over a differing unsaved edit opens a confirmation dialog rather than replacing anything yet (criteria 1 and 6) > opens a confirmation dialog and leaves the Configuration field's value exactly as the operator left it"
    proves: "Criteria 1 and 6: on the ready detail view, an apply requested while the Configuration field's content differs from the registered configuration asks the operator to confirm before any content is replaced, and the act of asking, on its own, replaces no content."
    fails_when: No dialog opens after Apply is clicked while an unsaved edit stands on the detail view, or the Configuration field's value differs from the unsaved edit text it held before Apply was clicked.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- declining the ready detail view's apply confirmation leaves the unsaved edit untouched (criterion 3) > keeps the Configuration field's value exactly as it stood, writing none of the draft's text, once Keep editing is clicked"
    proves: "Criterion 3, on the detail view: where the operator does not confirm, no character of the Configuration field's content changes and no part of the draft's configuration text is written to it."
    fails_when: The Configuration field's value differs from the unsaved edit text after Keep editing is clicked -- overwritten by the draft text, blanked, or altered in any way.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- confirming the ready detail view's apply replaces the unsaved edit with the draft's configuration text (criterion 4) > writes the draft's own configuration text into the Configuration field once the dialog's Apply button is clicked"
    proves: "Criterion 4, on the detail view: where the operator confirms in a further act after having asked for the apply, the Configuration field's content is replaced with the draft's configuration text."
    fails_when: The Configuration field's value is not exactly the drafted configuration text after the dialog's own Apply button is clicked.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- on the ready detail view, applying a draft while nothing is unsaved is never refused by the confirmation rule (criterion 5) > applies the draft immediately, opening no confirmation dialog, when the Configuration field holds no unsaved edit"
    proves: "Criterion 5, on the detail view: where the Configuration field holds no unsubmitted edit, this rule's confirmation requirement does not refuse the apply."
    fails_when: A confirmation dialog opens, or the Configuration field's value is not the drafted text, when Apply is clicked against a freshly loaded, undirtied detail view.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- on the ready detail view, asking for, declining and confirming the apply confirmation issues no register-connector call (criterion 7) > issues no PUT to the registry through the whole ask/decline/ask/confirm sequence"
    proves: "Criterion 7, on the detail view: neither asking for the confirmation, declining it nor confirming it issues a register-connector call."
    fails_when: Any PUT request reaches the fetch stub at any point across the ask, decline, re-ask and confirm sequence.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- the apply confirmation dialog's own wording and button styling (disclosed inference) > titles the dialog, describes the unsaved edit it would replace, and styles Apply as destructive against a plain Keep editing"
    proves: The implementation record's disclosed inference that the confirmation dialog's wording (title, description naming the unsaved edit and the Configuration field) and its two button labels and styling (destructive Apply confirm, plain Keep editing decline) follow the existing Discard dialog's own convention.
    fails_when: The dialog's title or description text differs from what the implementation states, or the Apply confirm button is not styled destructive, or Keep editing is styled destructive.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- on the create screen, applying a draft over unsubmitted, operator-entered content opens a confirmation dialog rather than replacing anything yet (criteria 2 and 6) > opens a confirmation dialog and leaves the Configuration field's value exactly as the operator typed it"
    proves: "Criteria 2 and 6: on the create screen, an apply requested while the Configuration field holds content the operator entered and has not submitted asks the operator to confirm before any content is replaced, and the act of asking, on its own, replaces no content."
    fails_when: No dialog opens after Apply is clicked while typed, unsubmitted content stands on the create screen, or the Configuration field's value differs from what was typed before Apply was clicked.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- declining the create screen's apply confirmation leaves the operator's typed content untouched (criterion 3) > keeps the Configuration field's value exactly as typed, writing none of the draft's text, once Keep editing is clicked"
    proves: "Criterion 3, on the create screen: where the operator does not confirm, no character of the Configuration field's content changes and no part of the draft's configuration text is written to it."
    fails_when: The Configuration field's value differs from the typed text after Keep editing is clicked -- overwritten by the draft text, blanked, or altered in any way.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- confirming the create screen's apply replaces the typed content with the draft's configuration text (criterion 4) > writes the draft's own configuration text into the Configuration field once the dialog's Apply button is clicked"
    proves: "Criterion 4, on the create screen: where the operator confirms in a further act after having asked for the apply, the Configuration field's content is replaced with the draft's configuration text."
    fails_when: The Configuration field's value is not exactly the drafted configuration text after the dialog's own Apply button is clicked.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- on the create screen, applying a draft while the Configuration field is still empty is never refused by the confirmation rule (criterion 5) > applies the draft immediately, opening no confirmation dialog, when the Configuration field holds no unsubmitted edit"
    proves: "Criterion 5, on the create screen: where the Configuration field holds no unsubmitted edit, this rule's confirmation requirement does not refuse the apply."
    fails_when: A confirmation dialog opens, or the Configuration field's value is not the drafted text, when Apply is clicked against a freshly mounted, still-empty create screen.
  - file: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
    name: "ConnectorConfigurationFormFields -- on the create screen, asking for, declining and confirming the apply confirmation issues no register-connector call (criterion 7) > issues no PUT to the registry through the whole ask/decline/ask/confirm sequence"
    proves: "Criterion 7, on the create screen: neither asking for the confirmation, declining it nor confirming it issues a register-connector call."
    fails_when: Any PUT request reaches the fetch stub at any point across the ask, decline, re-ask and confirm sequence.
not_applicable:
  - edge_case: Clicking Apply while a save is already submitting (a concurrent apply/save race).
    why: No criterion of this task states behavior for this interleaving -- hasUnsavedEdit and handleApply read nothing about isSubmitting, and the sibling draft-apply-to-local-edit task's own record already deferred exactly this interleaving to this task, which itself states no criterion over it.
  - edge_case: Requesting or applying a second draft while the confirmation dialog is already open (two operations against one subject at once).
    why: Radix's Dialog renders a modal overlay that covers the rest of the page while open, so the underlying helper's own Apply button cannot be reached by a pointer while the confirmation dialog stands; no criterion states behavior for this interleaving either.
  - edge_case: Confirming an apply whose drafted configuration text is empty.
    why: The confirm path (configuration.onChange(pendingApplyText, true)) treats the drafted text as an opaque string with no branch on its content or length; the non-empty distinctive text already exercised by every confirm test reaches the exact same code path an empty string would.
untested:
  - "The task's own Notes carry one UNDERDETERMINED entry: criterion 1's baseline (\"the registered configuration the surface last read\") is stated by rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface, outside this epic's covers, read as descriptive of the existing isDirty computation rather than a new claim on that rule. It names no implementation this task's criteria let through and the specification refuses -- it observes only that the baseline fact belongs to a rule this task does not implement -- so no test is owed for it, and none is written; the implementation record's own 'Decision, beyond the covers -- stand' already settles it as out of this task's scope."
  - "The implementation record's second inference -- that pendingApplyText, handleApply and handleConfirmApply are held as local component state and named functions directly inside ConnectorConfigurationFormFields, rather than extracted into a hook -- is a decision about internal code shape with no externally observable difference; asserting it would bind a test to which construct holds the state rather than to any behavior a user, a caller or a register-connector request could observe, so it is left untested rather than tested against the component's internals."
  - Declining the confirmation dialog by pressing Escape or clicking its overlay, rather than by clicking the explicit Keep editing button. Both close through the same onOpenChange handler this record's decline tests already exercise via Keep editing, but the Escape/overlay path itself is never triggered by any test here.
  - Whether the apply confirmation dialog and the ready detail view's own, separate Discard-changes dialog could ever both be asked for at once. No criterion of this task states behavior for that interplay, and no test here exercises it.
---

## What it is

Proof that an apply over an unsaved edit is confirmed before anything is replaced, on both screens, and that no register-connector call ever issues from asking, declining or confirming.

## Notes

None.
