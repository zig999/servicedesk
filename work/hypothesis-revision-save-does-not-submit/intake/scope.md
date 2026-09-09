# Corrective increment — SAVE HYPOTHESIS dispatches nothing

## The wrong behavior, as the human stated it

Observed by running the delivered system, on
`http://localhost:5173/cases/perfil-mobile-tecnico-probe/versions/5/manifest/hypotheses/limitacao-de-hardware`,
in the human's own words:

> utilize a conexão mcp do chrome, na aba
> http://localhost:5173/cases/perfil-mobile-tecnico-probe/versions/5/manifest/hypotheses/limitacao-de-hardware,
> tentando salvar SAVE HIPOTHESES, não está disparando nada. Ele deveria salvar a hipotese e não está salvando

Clicking SAVE HYPOTHESIS produces no request, no validation message and no console error.
The revision is never written.

## The file the behavior lives in

`src/routes/hypothesis-revision-form-fields.tsx`, at the frontend target source root.

## What was measured in the running browser

Read through Chrome DevTools against the page above, with the form filled and valid:

    type: "submit"       disabled: false
    button.form: null
    isInsideForm: false
    hasFormAttr: false
    parentChain: div[role=group] -> div -> div -> div -> div -> div#root -> body -> html
    formsOnPage: 1

The Save control is a submit button associated with no form: it is not a DOM descendant of the
form, and it names none through a `form` attribute. With no form owner the browser fires no
submit event at all, so the form's own submit handler is never invoked.

The form itself is sound. Intercepting `submit` in the capture phase and calling
`form.requestSubmit()` reached the form. The interception stopped the event before React saw it,
so nothing was written.

## Why the control left the form

`src/routes/hypothesis-revision-form-fields.tsx:243` places the submit control inside
`ButtonFooter`. `src/shared/components/button-footer.tsx:23` renders that group through
`createPortal(group, footerSlotNode)` into the fixed footer slot the app shell provides at
`src/shared/components/app-shell.tsx:107`.

A React portal preserves the React tree, so React handlers still bubble. Form ownership is not a
React fact: a submit control owns the form it descends from in the DOM, or the one it names in
`form`. Portaled out, it owns none, and the event never exists to bubble.

## Why the delivered proof did not catch it

`src/routes/hypothesis-revision-screen.test-support.ts:110` builds the test router with
`createRootRoute({ component: () => createElement(Outlet) })`. There is no app shell in that
tree, so no footer slot is provided, so `footerSlotNode` is null and
`src/shared/components/button-footer.tsx:20` returns the group inline — inside the form.

In the test the control owns the form. In the running application it does not. The delivered
tests exercise a DOM shape the application never has, which is why a screen that cannot save
passed its own proof.

## The in-repo precedent for the correction

One screen already answers this, deliberately:

- `src/routes/case-version-editor-ready-view.tsx:238-239` renders
  `<Button type="submit" form={CASE_VERSION_EDITOR_FORM_ID}>`
- against `id={CASE_VERSION_EDITOR_FORM_ID}` on its own form, at
  `src/routes/case-version-editor-form-fields.tsx:75`

precisely because its footer is portaled too.

## Scope

This increment corrects the hypothesis revision screen and nothing else. The human chose the
single-screen scope over a combined one.

Two further screens carry the identical defect and are deliberately outside this increment,
recorded here so they are not lost:

- `src/routes/capability-form-fields.tsx:196`
- `src/routes/connector-configuration-form-fields.tsx:86`

## What the proof owes

A proof that fails if the defect returns must mount the screen with the footer slot present, so
the portal is actually taken. A proof against the app-shell-less router cannot fail on this
defect, which is the whole reason the defect shipped.
