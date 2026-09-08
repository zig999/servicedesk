---
title: Connector configuration authoring surface, its form fields and confirmation-dialog
  pattern
summary: The area the openapi-draft-helper scope lands in -- the connector configuration
  form fields shared by the create-screen and detail-ready-view, their backing hooks,
  the shared JSON textarea field, and the existing apiFetch/TanStack Query, Select
  and Dialog conventions a new helper section will reuse.
sources:
- work/connector-configuration-openapi-helper/intake/frontend-scope.md
area:
- frontend/app/src/routes
- frontend/app/src/hooks
- frontend/app/src/shared/components
- frontend/app/src/services
modules:
- name: connector-configuration-form-fields
  path: frontend/app/src/routes/connector-configuration-form-fields.tsx
  role: touched
- name: connector-configuration-create-screen
  path: frontend/app/src/routes/connector-configuration-create-screen.tsx
  role: touched
- name: connector-configuration-detail-ready-view
  path: frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
  role: touched
- name: use-connector-configuration-form
  path: frontend/app/src/hooks/use-connector-configuration-form.ts
  role: depends-on
- name: use-connector-configuration-detail
  path: frontend/app/src/hooks/use-connector-configuration-detail.ts
  role: depends-on
- name: use-connector-configuration-detail-view
  path: frontend/app/src/hooks/use-connector-configuration-detail-view.ts
  role: depends-on
- name: connector-configuration-form-schema
  path: frontend/app/src/services/connector-configuration-form-schema.ts
  role: depends-on
- name: json-textarea-field
  path: frontend/app/src/shared/components/json-textarea-field.tsx
  role: depends-on
- name: api-client
  path: frontend/app/src/services/api-client.ts
  role: depends-on
- name: use-test-connector-panel
  path: frontend/app/src/hooks/use-test-connector-panel.ts
  role: adjacent
- name: connector-test-panel-fields
  path: frontend/app/src/routes/connector-test-panel-fields.tsx
  role: adjacent
conventions:
- statement: The Configuration field's value lives in a ConfigurationFieldState ({value,
    isValid, onChange}) exported from use-connector-configuration-form.ts, plain useState
    in the owning hook, never a React Hook Form registered field.
  seen_at: frontend/app/src/hooks/use-connector-configuration-form.ts
- statement: connectorConfigurationFormSchema is a zod object with only connector
    required -- the Configuration field is deliberately outside the RHF-managed schema.
  seen_at: frontend/app/src/services/connector-configuration-form-schema.ts
- statement: apiFetch throws ApiError on any non-2xx response and otherwise returns
    the parsed JSON body typed by the caller's generic; it is the one HTTP call helper.
  seen_at: frontend/app/src/services/api-client.ts
- statement: A registers-nothing, one-off POST is a bare apiFetch-backed useMutation
    with no queryKey, status mapped by hand into an explicit outcome union, mutation.reset()
    before each new dispatch, and an isDispatchingRef guard against double-dispatch.
  seen_at: frontend/app/src/hooks/use-test-connector-panel.ts
- statement: A list-then-pick-one control is @tui/ui/select's Select driven by a SelectOption[]
    array and a plain string value/onChange.
  seen_at: frontend/app/src/routes/connector-test-panel-fields.tsx
- statement: A confirmation dialog is @tui/ui/dialog's Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose,
    with a destructive confirm action and a secondary keep-editing close.
  seen_at: frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
- statement: A mutation failure is reported through toast.error fed by a *FailureMessage(error)
    function that special-cases ApiError via uiStateForApiError and falls back to
    one generic sentence.
  seen_at: frontend/app/src/hooks/use-connector-configuration-form.ts
- statement: No useFieldArray (react-hook-form) usage exists anywhere in this app;
    the one existing dynamic/repeating section is plain local useState arrays, not
    RHF nested fields.
  seen_at: frontend/app/src/hooks/use-test-connector-panel.ts
must_not_duplicate:
- what: JSON parsing/minifying and the Textarea+Beautify control for JSON-shaped text
  at: frontend/app/src/shared/components/json-textarea-field.tsx
- what: The bare apiFetch-backed useMutation pattern for a registers-nothing, one-off
    POST (mutation.reset() before dispatch, status mapped to an explicit outcome union,
    isDispatchingRef guard)
  at: frontend/app/src/hooks/use-test-connector-panel.ts
- what: The list-then-pick-one control (@tui/ui/select's Select plus a SelectOption[]
    array)
  at: frontend/app/src/routes/connector-test-panel-fields.tsx
- what: The confirmation-dialog markup (@tui/ui/dialog's Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter/DialogClose,
    with a destructive confirm action and a secondary "keep editing" close)
  at: frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
- what: The ApiError-aware failure-message mapping pattern (a Partial<Record<UiErrorStateKind,string>>
    plus a generic fallback, fed through uiStateForApiError)
  at: frontend/app/src/hooks/use-connector-configuration-form.ts
risks:
- risk: The helper's draft-apply path must write only ConfigurationFieldState's local
    onChange, never call the PUT save mutation -- both existing screens' save mutations
    key off the same connector value the helper's Apply must not touch, so any accidental
    wiring into onSubmit/mutation.mutate would additionally register an unintended
    connector configuration.
  consumers:
  - frontend/app/src/hooks/use-connector-configuration-form.ts
  - frontend/app/src/hooks/use-connector-configuration-detail.ts
- risk: ConnectorConfigurationFormFields is a shared, already-tested component (its
    own action-footer spec and the create/detail screens' specs); inserting the helper
    section beneath Configuration inside it changes what every one of those specs
    renders and can shift existing role/label queries.
  consumers:
  - frontend/app/src/routes/connector-configuration-form-fields-action-footer.spec.ts
  - frontend/app/src/routes/connector-configuration-detail-ready-view-order.spec.ts
  - frontend/app/src/routes/connector-configuration-create-screen.spec.ts
  - frontend/app/src/routes/connector-configuration-detail-screen.spec.ts
- risk: The published operation draft-connector-configuration-from-openapi has no
    HTTP route yet in this tree -- its contract is declared but its draft-operation-http-surface
    backend task is not yet delivered, so this frontend plan's calling task depends
    on that backend task existing before it can be delivered and tested end to end.
  consumers:
  - task/connector-configuration-openapi-draft-backend/draft-operation-http-surface
---

## What it is

The connector configuration authoring surface (form fields shared by the create-screen and detail-ready-view), its backing hooks, and the existing apiFetch/TanStack Query, Select and Dialog conventions the Configuration Helper section reuses.

## Notes

The "Discard changes" dialog only exists on ConnectorConfigurationDetailReadyView, not on the create-screen; a helper section reusing that confirmation pattern needs its own dialog instance rather than assuming the detail view's dialog is reachable from the create-screen.
isDirty on the create-screen's form state is undefined (the prop is optional and unset there), while the detail view always supplies a boolean isDirty computed from RHF dirtiness plus a minified-text comparison against a saved baseline -- a helper's own unsaved-edit check needs its own comparison against the field's own initial value on the create-screen, since it cannot rely on a shared isDirty existing identically on both screens.
The two screens duplicate an identical onCancel and an identical PUT-based save mutation between their two hooks; that duplication already exists independent of this scope and is not something the helper needs to add to.
The published operation draft-connector-configuration-from-openapi has no HTTP route yet in this tree -- its draft-operation-http-surface backend task (same work root, epic connector-configuration-openapi-draft-backend) is not yet delivered here.
