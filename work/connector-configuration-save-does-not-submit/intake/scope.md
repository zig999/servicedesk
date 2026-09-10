# Corrective increment — save on the connector configuration screen dispatches nothing

## The wrong behavior, as the human stated it

Observed by running the delivered system, at
`http://localhost:5173/connectors/ifs-fsm-tech-profile-connector`, in the human's own words:

> a exemplo do erro que havia na tela ao salvar uma hipotese, o mesmo está ocorrendo em
> http://localhost:5173/connectors/ifs-fsm-tech-profile-connector. Mesmo editando, o botão sendo
> habilitado, ao clicar, não acontece nada.

Editing a field enables the Save button; clicking it produces no request, no validation message
and no console error. The configuration is never registered.

## The file the behavior lives in

`src/routes/connector-configuration-form-fields.tsx`, at the frontend target source root.

## What the code shows

`src/routes/connector-configuration-form-fields.tsx:100` renders the screen's own
`<form onSubmit={onSubmit} noValidate>`, with no `id`. The Save control at line 149 is
`<Button type="submit" loading={isSubmitting} disabled={isSaveDisabled}>`, carrying no `form`
attribute, and it sits inside `<ButtonFooter>` (line 148).

`src/shared/components/button-footer.tsx:22-26` renders that group through
`createPortal(group, footerSlotNode)` into the fixed footer slot the app shell provides — the
same portal the hypothesis revision screen took. A React portal preserves the React tree, so
React's own `onClick`/bubbling still works, but form ownership is a DOM fact, not a React one: a
submit control owns the form it is a DOM descendant of, or the one it names through `form`.
Portaled out of the form's subtree and naming no `form`, the button owns no form at all, so
clicking it fires no submit event, and the form's `onSubmit` (in
`src/hooks/use-connector-configuration-detail.ts:135-151`) is never invoked. Nothing downstream
of that handler — the validity checks, the mutation — ever runs.

## The in-repo precedent for the correction

- `src/routes/case-version-editor-form-fields.tsx:11,75` declares `CASE_VERSION_EDITOR_FORM_ID`
  and sets it as the form's own `id`.
- `src/routes/case-version-editor-ready-view.tsx:238-239` renders
  `<Button type="submit" form={CASE_VERSION_EDITOR_FORM_ID}>`, restoring form ownership across
  the same portal.
- `src/routes/hypothesis-revision-form-fields.tsx:14,76,234` answers the identical defect the
  same way, corrected in `work/hypothesis-revision-save-does-not-submit/` — whose own scope
  named `src/routes/connector-configuration-form-fields.tsx:86` as carrying the identical defect,
  deliberately left outside that increment's single-screen scope.

## Scope

This increment corrects the connector configuration screen and nothing else.

## What the proof owes

A proof that fails when the defect returns must mount the screen with the footer slot present,
so the portal the application actually takes is taken — the same requirement the hypothesis
revision correction's proof met, and the same reason a proof against an app-shell-less router
would not have caught this defect either.
