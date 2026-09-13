---
target: frontend
title: Apply confirmation states its diff, key by key
summary: A new pure diff service computes the top-level and four nested-object key itemisation the
  apply-over-unsaved-edit confirmation owes, and the confirmation dialog now renders it (or the
  not-itemisable statement) instead of only the fixed sentence.
task: sha256:15a4fe705774e2cb4c5aeb96703e91fc71f25224a8f74a6b05b8d0cedddf2d45
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-apply-confirmation-diff-build
files:
- path: src/services/connector-configuration-apply-diff.ts
  effect: New pure module. computeApplyConfirmationDiff(fieldText, draftText) parses both texts as
    JSON; returns { kind = "not-itemisable" } when the field's text does not parse to a JSON object
    (empty string, invalid JSON, array, string, number, boolean, null); otherwise returns
    { kind = "itemisable", topLevel, nested }. topLevel is a KeyChangeSet (added/removed/changed
    string arrays) computed over the two parsed top-level objects. nested is an array of
    { key, diff } entries, one per member of NESTED_OBJECT_KEYS (statusMap, responseMap, query,
    headers) for which BOTH sides hold a JSON object at that key. deepEqual is a small recursive
    structural-equality check. applyConfirmationDiffIsEmpty reports whether an itemisable diff has
    zero adds/removes/changes at every level. Reuses isPlainRecord from
    shared/services/plain-record.ts.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Computes applyConfirmationDiff via useMemo from configuration.value and pendingApplyText
    whenever the confirmation dialog is open, recomputed on either changing. Adds two new
    presentational helpers -- KeyChangeList (renders a labelled added/removed/changed list, or null
    when all three are empty) and ApplyConfirmationDiffBody (branches on diff.kind). The dialog now
    renders ApplyConfirmationDiffBody beside the existing APPLY_OVER_UNSAVED_EDIT_DESCRIPTION, which
    is unchanged and still shown. handleApply, handleConfirmApply, the Dialog's open/onOpenChange,
    and the Keep editing/Apply DialogClose buttons are untouched.
criteria:
- criterion: Where the field's unsubmitted content and the draft's configuration are both
    well-formed JSON object text, the confirmation states each top-level key the apply would add.
  met: true
  how: computeApplyConfirmationDiff returns kind "itemisable" with topLevel.added holding every key
    present in the draft's parsed object but absent from the field's; ApplyConfirmationDiffBody
    renders it via the "Top-level keys" KeyChangeList's "Added:" entries.
- criterion: Under the same condition, the confirmation states each top-level key the apply would
    remove.
  met: true
  how: topLevel.removed holds every key present in the field's parsed object but absent from the
    draft's, rendered as "Removed:" entries.
- criterion: Under the same condition, the confirmation states each top-level key whose value the
    apply would change.
  met: true
  how: topLevel.changed holds every key present in both parsed objects whose values are not
    deep-equal, rendered as "Changed:" entries.
- criterion: Under the same condition, the confirmation states each key of the statusMap,
    responseMap, query and headers objects the apply would add, remove or change in value.
  met: true
  how: For each of NESTED_OBJECT_KEYS, when both sides hold a JSON object at that key,
    computeApplyConfirmationDiff pushes a nested entry diffed with the same logic one level deeper;
    the dialog renders one KeyChangeList per nested entry, labelled by its own key name.
- criterion: Where the field's content is not well-formed JSON object text, the confirmation states
    that what would change cannot be itemised.
  met: true
  how: computeApplyConfirmationDiff returns kind "not-itemisable" whenever the field's text fails
    to parse or parses to something other than a JSON object; ApplyConfirmationDiffBody renders the
    explicit "cannot be itemised" statement for that branch.
- criterion: Where the operator does not confirm, the field's content stands exactly as it was.
  met: true
  how: Confirmed by reading, unchanged -- Keep editing is a DialogClose with no onClick, so it never
    calls configuration.onChange; only handleConfirmApply calls it, and it is untouched by this
    task's edit.
nodes:
- node: rules/integration/an-apply-confirmation-states-what-the-draft-would-change
  encoded_at:
  - src/services/connector-configuration-apply-diff.ts
  - src/routes/connector-configuration-form-fields.tsx
  how: Implemented in full by the itemisation (top-level plus the four nested keys, add/remove/change)
    and the not-well-formed fallback, surfaced by ApplyConfirmationDiffBody in the confirmation
    dialog.
- node: rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
  encoded_at:
  - src/routes/connector-configuration-form-fields.tsx
  how: This task reaches only the negative half (criterion 6, confirmed unchanged); the positive
    half was already in place before this task and remains untouched by it, per the task's own
    REMAINDER note.
- node: rules/integration/a-connector-configuration-drafts-configuration-is-well-formed-object-text
  encoded_at:
  - src/services/connector-configuration-apply-diff.ts
  how: Consumed as a premise, not implemented here -- computeApplyConfirmationDiff parses the draft
    side and would itself report not-itemisable if that parse ever failed, but per the task's own
    ADVISORY note this branch is unreachable given the guarantee.
- node: domain/integration/connector-configuration-draft
  how: The diff reads only the two configuration texts; it does not touch any other attribute of
    the draft value-object. Honored rather than encoded here.
inferences:
- inferred: When the draft's text fails to parse to a JSON object despite the specification's
    guarantee, computeApplyConfirmationDiff returns "not-itemisable" rather than treating a
    missing/malformed draft side as an empty object.
  from: The task's own ADVISORY note states the guarantee closes the case space to exactly two
    branches, so this defensive branch is unreached at runtime; the more conservative reading is
    the safer default.
- inferred: Deep-equality for "changed in value" is a small recursive structural comparison
    rather than JSON.stringify comparison.
  from: The task's own text offers JSON.stringify comparison as merely acceptable, leaving the
    exact method to this delivery's judgment; a recursive comparison avoids two independently
    parsed objects being reported as "changed" purely because their keys serialize in a different
    order.
- inferred: The four nested keys are itemised one level deeper only where BOTH sides hold a JSON
    object at that key; where only one side does (or neither), no nested entry is produced.
  from: The task's own text names this exact edge as the implementer's call and offers this
    resolution as the example, since the top-level add/remove already covers it.
- inferred: The three change-classes (added, removed, changed) are kept as three separate arrays,
    both at top level and per nested key.
  from: The task's own ADVISORY note calls keeping them separate "the safer, most literal reading"
    that "does not cost anything".
- inferred: The confirmation renders both the pre-existing fixed sentence and the new diff body
    beneath it, rather than replacing the sentence outright.
  from: The task's own instruction offers either option and requires only that the fixed sentence
    not be the sole content shown; keeping it preserves its still-true "this cannot be undone"
    warning.
- inferred: An itemisable diff with zero adds/removes/changes at every level renders "Applying this
    draft would change nothing."
  from: The task states no criterion requires specific empty-state wording and offers this exact
    sentence as an example.
preserved:
- handleApply's branch on hasUnsavedEdit, handleConfirmApply's write to configuration.onChange, and
  the Dialog's open/onOpenChange wiring together with the Keep editing/Apply DialogClose buttons --
  read in full before editing, none of this logic was touched.
- The fixed APPLY_OVER_UNSAVED_EDIT_DESCRIPTION sentence and constant, left in place unchanged.
deferred:
- what: pt-BR wording for every English string this task adds (the itemisation labels and the
    not-itemisable/empty-diff statements).
  why: The task's own instruction states pt-BR wording is a separate sibling task's job; plain
    English strings are used instead.
---

## What it is
The itemisation the confirmation dialog owes, in place of the fixed sentence it shows today.

## Notes
Build round 1 green on the first attempt.
