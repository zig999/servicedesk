---
title: Configuration Helper section beneath the Configuration field
summary: Proves the Configuration Helper section renders beneath Configuration on
  both authoring surfaces, offers its three named controls plus a non-submitting Request
  Draft control that dispatches the draft request and never reaches the operator-supplied
  document link or the save path, while every existing field and the Actions footer
  stay reachable.
implementation: sha256:5006f1b6a2ea62293114a5d0a2ca7d66bc1b619c44d9b109ceac71b5320c840b
standard:
  at: ../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/connector-configuration-openapi-draft-frontend-configuration-helper-section-suite-2
tests:
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: places the Configuration Helper heading after the Configuration field in document
    order (create screen)
  proves: On the connector configuration create screen, the Configuration Helper section
    is rendered beneath the Configuration field.
  fails_when: The Configuration Helper heading is removed, rendered before the Configuration
    field in document order, or the create screen stops composing ConnectorConfigurationHelper
    at all.
  demonstrates: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: places the Configuration Helper heading after the Configuration field in document
    order (ready detail view)
  proves: On the ready detail view of a registered connector configuration, the Configuration
    Helper section is rendered beneath the Configuration field.
  fails_when: The Configuration Helper heading is removed, rendered before the Configuration
    field in document order, or the detail ready view stops composing ConnectorConfigurationFormFields
    at all.
  demonstrates: rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: shares the Configuration field's own owning form and opens no dialog, on the
    create screen
  proves: The section is rendered inline within the same form that holds the Configuration
    field, on no screen of its own and in no dialog of its own (create screen).
  fails_when: The OpenAPI document link input's owning form differs from the Configuration
    field's, any dialog role appears once the helper renders, or typing into the helper's
    link control navigates the route away.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: shares the Configuration field's own owning form and opens no dialog, on the
    ready detail view
  proves: Same, on the ready detail view.
  fails_when: The OpenAPI document link input's owning form differs from the Configuration
    field's on the detail view, or any dialog role appears.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: renders an editable OpenAPI document link control that holds what the operator
    types
  proves: The section offers a control in which the operator states the OpenAPI document
    link.
  fails_when: No control labeled 'OpenAPI document link' exists, or it does not reflect
    a typed value.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: renders editable Operation path and Operation method controls that hold what
    the operator types
  proves: The section offers controls in which the operator names one operation by
    its path and its HTTP method.
  fails_when: No control labeled 'Operation path' or 'Operation method' exists, or
    either does not reflect a typed value.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: issues a POST to the draft route carrying the current connector, link, path
    and method, when Request Draft is clicked
  proves: The section offers a control whose act dispatches the draft request with
    the stated link and named operation.
  fails_when: Clicking Request Draft issues no POST to /v1/draft-connector-configuration-from-openapi,
    or the request body omits or misstates connector, link, path or method.
  demonstrates: contracts/integration/connector-configuration-draft
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: never calls fetch with the operator's own link, only with the published draft
    route
  proves: The section itself never fetches the operator-stated OpenAPI document; it
    only ever dispatches to the backend's own published draft route.
  fails_when: A network call is made to the operator's own link URL, or no call reaches
    the draft route.
  demonstrates: constraints/the-openapi-document-is-fetched-by-the-backend
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: issues no PUT request when Request Draft is clicked, even while Save itself
    is enabled
  proves: Nothing the section offers submits the surface's form or invokes its save
    path, so requesting a draft leaves every registered connector configuration exactly
    as it stood.
  fails_when: Clicking Request Draft while Save is enabled issues a PUT to the connector's
    registration route.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: keeps Connector, Configuration and the Actions group's Save control reachable
    by their existing labels on the create screen
  proves: The Connector field, the Configuration field and the form's existing action
    footer remain present and reachable by their existing labels (create screen).
  fails_when: The Connector or Configuration field disappears or loses its label,
    or Save is no longer reachable inside the Actions group.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: keeps Connector, Configuration and the Actions group's Save control reachable
    by their existing labels on the ready detail view
  proves: Same, on the ready detail view.
  fails_when: The Connector or Configuration field disappears or loses its label,
    or Save is no longer reachable inside the Actions group, on the detail view.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: disables Request Draft once clicked, while the draft request is outstanding
  proves: Implementation record's disclosed inference -- the Request Draft control
    is disabled only while outcome.kind === 'pending'.
  fails_when: Request Draft stays enabled while its own request is outstanding, or
    stays disabled after the request resolves.
- file: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  name: re-enables Request Draft after a refused draft request, rather than leaving
    it disabled
  proves: The same disclosed inference holds on the refusal path too -- pending is
    the only state that disables the control.
  fails_when: Request Draft remains disabled once a refused request has settled.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: 'exposes empty strings for link, path and method, and {kind: ''idle''}, before
    any change or dispatch'
  proves: Implementation record's inference that the hook holds its own local link/path/method
    state, starting empty with an idle outcome.
  fails_when: Any of link, path, method starts non-empty, or the initial outcome is
    not {kind:'idle'}.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: updates link, path and method independently through onLinkChange, onPathChange
    and onMethodChange
  proves: Each setter updates only its own field, leaving the others untouched.
  fails_when: Changing one field mutates another, or a setter fails to update its
    own field.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: sends exactly {connector, link, path, method} in the POST body when onRequestDraft
    is called
  proves: onRequestDraft composes the held link/path/method with the bound connector
    into the sibling draft hook's own dispatch.
  fails_when: The dispatched body omits, renames or adds a field beyond connector,
    link, path and method, or carries a stale value.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: reports pending while the request is outstanding and drafted once it resolves
  proves: Implementation record's inference that outcome is read straight through
    from the sibling useDraftConnectorConfigurationFromOpenApi hook, unmodified.
  fails_when: outcome does not report 'pending' while the request is outstanding,
    or does not expose the resolved draft under 'drafted' once it settles.
- file: src/hooks/use-connector-configuration-helper.spec.ts
  name: sends the connector from a later render's argument after the caller re-renders
    with a different connector
  proves: The composed dispatcher tracks the connector value passed on the most recent
    render, rather than binding it once at first render.
  fails_when: A dispatch made after a connector prop change still carries the connector
    value from the hook's first render.
not_applicable:
- edge_case: Absent or empty link, path or method values before Request Draft is clicked
  why: No criterion or the rule node states that the control validates non-empty values
    before dispatching; the implementation record's own stated inference gates the
    button on outcome.kind === 'pending' alone.
- edge_case: A second Request Draft dispatch while the first is still outstanding
    (concurrent dispatch)
  why: Already proven at use-draft-connector-configuration-from-openapi.spec.ts, which
    this task's hook composes unmodified (requestDraft's own in-flight guard).
- edge_case: An empty collection rendered back from a request
  why: This section renders no list or collection at all -- it only offers three input
    controls and one dispatching button.
- edge_case: A duplicate where uniqueness is claimed
  why: No control this section offers claims uniqueness over any set of values.
- edge_case: A boundary at each end of a stated numeric or length range
  why: The three controls are free-text inputs with no stated range; nothing in the
    task or the rule constrains link, path or method length or format.
untested:
- Presenting an answered draft or a refused draft request's own message -- the task's
  own Notes route both to the disclosure task; this proof covers only that the button
  dispatches and re-enables, never what the operator is shown for either outcome.
- Applying a drafted configuration into the Configuration field, and the unsaved-edit
  confirmation before doing so -- routed by the task's own Notes to the apply and
  confirmation tasks; no test here touches either.
---

## What it is

Proof of the operator's way in to the helper, on the one surface they already author or edit a connector configuration from.

## Notes

First suite run failed lint (6 testing-library/no-node-access violations from .closest('form') calls in the new test file); fixed by reading each control's native .form property instead of DOM traversal, no assertion changed. Re-run clean.
