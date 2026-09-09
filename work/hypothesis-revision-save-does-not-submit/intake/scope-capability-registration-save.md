# Corrective increment — the capability registration Save dispatches nothing

## The wrong behavior

Observed by running the delivered system, at `http://localhost:5173/capabilities/new`.
The Save control cannot submit the capability registration entry.

Measured in the running page:

    label: "Save"
    type: "submit"
    disabled: true          (the pristine-form guard only; filling the entry enables it)
    button.form: null
    hasFormAttr: false
    isInsideForm: false
    formsOnPage: 1

The control is a submit button that owns no form: it is not a DOM descendant of the screen's form,
and it names none through a `form` attribute. With no form owner the browser fires no submit event,
so the form's own handler is never invoked and no register-capability call is ever issued.

The disabled state is the pristine-entry guard and nothing else. Filling the entry enables the
control, and it stays a no-op.

## The file the behavior lives in

`src/routes/capability-form-fields.tsx`, at the frontend target source root.
Its form is at line 85; its submit control at line 196, inside `ButtonFooter`.

## Why the control owns no form

`src/shared/components/button-footer.tsx:23` renders its group through
`createPortal(group, footerSlotNode)` into the fixed footer slot the app shell provides at
`src/shared/components/app-shell.tsx:107`.

A React portal preserves the React tree, so React handlers still bubble. Form ownership is not a
React fact: a submit control owns the form it descends from in the DOM, or the one it names in
`form`. Portaled out, it owns none, and no submit event exists to bubble.

## Why the delivered proof did not catch it

The delivered specs of this screen mount a test router with no app shell, so no
`FooterSlotContext` provider stands, so `button-footer.tsx:20` returns the group inline — inside
the form, where the control does own it. Those tests exercise a DOM shape the application never
has.

A proof that fails when this defect returns must mount with the footer slot present, so the portal
is actually taken. `src/routes/hypothesis-revision-screen-footer-portal.test-support.ts`, written
for the sibling correction in this same initiative, is the shape that works.

## Where the defect came from

Commit `0fcafd67`, "Portal ButtonFooter beside the app's own footer, confining scroll to main" —
a direct commit on this `edits_freely` target, fifteen files, which introduced the portal and never
ran the project's own suite. Three screens stopped saving.

## The correction this project already uses

An explicit `form` attribute pairing an id on the form:

- `src/routes/case-version-editor-ready-view.tsx:238-239` against
  `src/routes/case-version-editor-form-fields.tsx:75`, the original precedent
- `src/routes/hypothesis-revision-form-fields.tsx`, this initiative's first correction,
  delivered under `task/hypothesis-revision-save-act/save-dispatches-the-revise` and reconciled
  under `siegard-reconcile/hypothesis-revision-save-form-ownership.md`

## Scope

The capability registration screen only.

`src/routes/connector-configuration-form-fields.tsx:86` carries the identical defect, measured the
same way at `/connectors/ifs-fsm-tech-profile-connector`. It is deliberately a separate increment,
to follow this one, because two screens that cannot save are two wrong behaviors and one task
answers one.
