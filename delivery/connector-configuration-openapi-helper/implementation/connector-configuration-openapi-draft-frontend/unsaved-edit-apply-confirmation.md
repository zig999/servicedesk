---
target: frontend
title: Confirm before an apply overwrites an unsubmitted edit
summary: Gates the Configuration Helper's onApply behind a per-screen unsubmitted-edit reading and a controlled
  confirmation dialog, so a draft only replaces the Configuration field's content after a further explicit
  confirm.
task: sha256:4cad1cc15b339d4471c5698b51651857610d78f63649b1b03ea9324b652c4575
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-unsaved-edit-apply-confirmation-build
files:
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Computes hasUnsavedEdit as `isDirty ?? configuration.value !== ""` (the detail view's own isDirty
    when present, the create screen's non-empty-Configuration-field reading otherwise). Replaces the previously
    unconditional onApply passed to ConnectorConfigurationHelper with a named handleApply that either
    calls configuration.onChange(configurationText, true) immediately (no unsaved edit) or stores the
    drafted text in a new local pendingApplyText useState<string | null> without touching the field (an
    unsaved edit stands). Renders a controlled Dialog (open={pendingApplyText !== null}, onOpenChange
    clearing the pending text on any close) built from the same DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose
    composition connector-configuration-detail-ready-view.tsx already uses for its Discard dialog, with
    its own title ("Apply drafted configuration?"), its own description (naming the unsaved edit and the
    Configuration field, warning the replace cannot be undone), a "Keep editing" DialogClose that closes
    without calling onChange, and an "Apply" DialogClose (variant destructive) whose onClick is a new
    handleConfirmApply that calls configuration.onChange(pendingApplyText, true) and clears the pending
    state. Nothing else in the file (register/watch/errors destructuring, the Connector field, the JsonTextareaField,
    the Save button, isSaveDisabled) changed.
criteria:
- criterion: On the ready detail view, an apply requested while the Configuration field's content differs
    from the registered configuration the surface last read asks the operator to confirm before any content
    is replaced.
  met: true
  how: connector-configuration-detail-ready-view.tsx already passes isDirty={state.isDirty} (the detail
    hook's own dirty computation, diffing the minified Configuration value against the read registration's
    baseline) into ConnectorConfigurationFormFields. hasUnsavedEdit reads `isDirty ?? ...`, so on this
    screen it is exactly that isDirty value; handleApply opens the confirmation dialog instead of calling
    configuration.onChange whenever it is true, before any apply, so the operator always sees the dialog
    first.
- criterion: On the create screen, an apply requested while the Configuration field holds content the
    operator entered and has not submitted asks the operator to confirm before any content is replaced.
  met: true
  how: connector-configuration-create-screen.tsx passes no isDirty prop, so isDirty is undefined and hasUnsavedEdit
    falls back to `configuration.value !== ""`. Because this screen's field starts empty and nothing is
    submitted without navigating away (handleSaved navigates off-screen on success), any non-empty value
    is content the operator entered and has not submitted; handleApply reads that same hasUnsavedEdit
    and opens the dialog instead of applying whenever it is true.
- criterion: Where the operator does not confirm, no character of the Configuration field's content changes
    and no part of the draft's configuration text is written to it.
  met: true
  how: While hasUnsavedEdit is true, handleApply's only effect is setPendingApplyText(configurationText)
    -- it never calls configuration.onChange. Declining ("Keep editing") is a DialogClose with no onClick,
    and any other way the dialog closes runs onOpenChange, which only calls setPendingApplyText(null);
    neither path reaches configuration.onChange, so the field's value (still read by JsonTextareaField
    from configuration.value) is untouched.
- criterion: Where the operator confirms in a further act after having asked for the apply, the Configuration
    field's content is replaced with the draft's configuration text.
  met: true
  how: The dialog's "Apply" button's onClick is handleConfirmApply, which calls configuration.onChange(pendingApplyText,
    true) with the exact text handleApply stored when the apply was first requested, then clears pendingApplyText.
    This is the one path in the whole change that calls configuration.onChange while an unsaved edit stood,
    and it fires only from this button, a further explicit act after the apply request opened the dialog.
- criterion: Where the Configuration field holds no unsubmitted edit, this rule's confirmation requirement
    does not refuse the apply.
  met: true
  how: handleApply's first branch -- if (!hasUnsavedEdit) { configuration.onChange(configurationText,
    true); return; } -- calls onChange immediately and never touches pendingApplyText or the dialog, reproducing
    exactly the prior unconditional behavior for this case.
- criterion: Asking for the apply, on its own, replaces no content on either screen.
  met: true
  how: When hasUnsavedEdit is true, requesting the apply (clicking the helper's own "Apply" button, which
    calls handleApply) only runs setPendingApplyText(configurationText) -- a local state write that does
    not call configuration.onChange and does not touch the Connector field or any other state, on either
    screen (the same handleApply and the same hasUnsavedEdit computation serve both, since ConnectorConfigurationFormFields
    is the one shared component).
- criterion: Neither asking for the confirmation, declining it nor confirming it issues a register-connector
    call.
  met: true
  how: handleApply, the Dialog's onOpenChange, the decline DialogClose and handleConfirmApply together
    touch only pendingApplyText (via useState) and, on confirm, configuration.onChange -- none of them
    references form.handleSubmit, onSubmit, or either screen's mutation object; no fetch, mutate() or
    register-connector call exists anywhere on this path, the same absence the sibling apply-to-local-edit
    task's criteria already established for the unconfirmed case.
nodes:
- node: rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  how: 'The rule''s statement -- applying a draft over an unsaved edit is performed only after the operator''s
    further explicit confirmation, and the field''s content stands exactly as it was until then -- is
    exactly the hasUnsavedEdit gate and the pendingApplyText/Dialog mechanism above: no path reaches configuration.onChange
    while an unsaved edit stands except the dialog''s own confirm button.'
- node: rules/integration/applying-a-drafted-configuration-changes-only-the-local-edit
  how: Governs this task without a new fact of its own reaching the code -- it was already implemented
    by the sibling draft-apply-to-local-edit task's wiring of onApply to configuration.onChange, and this
    task's own change only interposes a gate in front of that same, unmodified call (configuration.onChange(pendingApplyText,
    true) on confirm, configuration.onChange(configurationText, true) when no unsaved edit stands); it
    never routes through a register-connector call or any other write.
- node: scenarios/integration/applying-a-draft-over-an-unsaved-edit-asks-for-confirmation
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  how: The scenario's given/when/then -- an unsubmitted edit stands, the operator requests an apply, the
    surface asks to confirm and the content stands untouched until confirmed -- is exactly the hasUnsavedEdit-true
    branch of handleApply opening the dialog and only handleConfirmApply (a further, distinct click) ever
    writing the field.
inferences:
- inferred: The confirmation dialog's exact wording (title "Apply drafted configuration?", a description
    naming the unsaved edit, the Configuration field and the replace being permanent), and its two button
    labels ("Keep editing" for decline, "Apply" for confirm, styled destructive).
  from: The task's own instruction to write fit-for-purpose wording rather than copy the Discard dialog's
    wording verbatim, following that dialog's shape (a Title, a Description sentence, a decline and a
    confirm act) and its "Keep editing" decline label as the shared, non-domain-specific convention for
    backing out of a destructive confirmation; the destructive button variant follows the same convention
    the Discard dialog uses for its own irreversible confirm action.
- inferred: The pendingApplyText/open state and the two handlers are held as local component state and
    named functions directly inside ConnectorConfigurationFormFields, rather than extracted into a new
    hook.
  from: The task's own Notes state the unsubmitted-edit reading is a fresh comparison at the render layer
    rather than a shared hook change; the sibling Discard dialog in connector-configuration-detail-ready-view.tsx
    is likewise composed directly in its route component with no dedicated hook for its own open-state.
preserved:
- The plain, unconditional onApply behavior for a Configuration field holding no unsaved edit -- configuration.onChange(configurationText,
  true) called immediately, exactly as the prior draft-apply-to-local-edit task wired it -- is unchanged
  in that branch.
- The Connector field, the Save button's isSaveDisabled computation, the JsonTextareaField's props, and
  the trailingActions slot (including connector-configuration-detail-ready-view.tsx's own, separate Discard-changes
  Dialog) are untouched.
- use-connector-configuration-form.ts and use-connector-configuration-detail.ts were read but not modified,
  per the task's own Notes; configuration.value and configuration.onChange's existing behavior (recomputing
  validity itself) is exactly what the new gate calls, unchanged.
- connector-configuration-helper.tsx and connector-configuration-helper-fields.tsx's onApply passthrough
  chain, built by the prior draft-apply-to-local-edit task, is untouched -- the gate is applied entirely
  above them, at the one call site that already holds both configuration and isDirty.
deferred:
- what: rules/integration/a-refused-draft-request-states-its-refusal-to-the-operator's Configuration-field-untouched
    clause for a refused draft request.
  why: Named in the task's own REMAINDER note as reaching no criterion here -- it governs a refusal, not
    an apply, and is already the sibling apply-to-local-edit task's and the Configuration Helper's own
    concern; widening this task to touch the refusal-disclosure path would exceed what it was cut to deliver.
- what: rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface and
    rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read.
  why: The task's own Notes name both only descriptively -- the first as the pre-existing rule the isDirty
    baseline this task reuses already comes from, the second as the pre-existing rule that already draws
    the "ready" reading criterion 1 scopes to -- and state explicitly that no criterion here claims to
    implement either; this delivery reads isDirty and the detail view's "ready" phase exactly as they
    already stand, without touching either rule's own behavior.
---

## What it is

The further explicit act that stands between a first gesture and an edit held nowhere else. It reads whether an unsubmitted edit stands, on each of the two screens, and asks before an apply destroys one.

## Notes

None.
