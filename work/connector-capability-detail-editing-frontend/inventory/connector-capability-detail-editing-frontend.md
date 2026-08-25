---
title: Connectors and capabilities admin screens — dialog forms, JSON textareas and routing
summary: The area the connector/capability detail-editing scope lands in — the two admin list screens, their popup-dialog forms and hooks, the shared JsonTextareaField, and the code-based @tanstack/react-router route tree that must grow two new detail routes.
area:
  - frontend/app/src/routes
  - frontend/app/src/hooks
  - frontend/app/src/shared/components
sources:
  - intake/scope.md
modules:
  - name: connector-configurations-screen
    path: frontend/app/src/routes/connector-configurations-screen.tsx
    role: touched
  - name: capabilities-browser-screen
    path: frontend/app/src/routes/capabilities-browser-screen.tsx
    role: touched
  - name: connector-configuration-form-dialog
    path: frontend/app/src/routes/connector-configuration-form-dialog.tsx
    role: touched
  - name: capability-form-dialog
    path: frontend/app/src/routes/capability-form-dialog.tsx
    role: touched
  - name: use-connector-configuration-form
    path: frontend/app/src/hooks/use-connector-configuration-form.ts
    role: touched
  - name: use-capability-form
    path: frontend/app/src/hooks/use-capability-form.ts
    role: touched
  - name: connector-configuration-form-fields
    path: frontend/app/src/routes/connector-configuration-form-fields.tsx
    role: touched
  - name: capability-form-fields
    path: frontend/app/src/routes/capability-form-fields.tsx
    role: touched
  - name: route-tree
    path: frontend/app/src/routes/route-tree.tsx
    role: touched
  - name: json-textarea-field
    path: frontend/app/src/shared/components/json-textarea-field.tsx
    role: depends-on
  - name: use-connector-configurations
    path: frontend/app/src/hooks/use-connector-configurations.ts
    role: depends-on
  - name: use-capabilities
    path: frontend/app/src/hooks/use-capabilities.ts
    role: depends-on
  - name: connector-test-panel
    path: frontend/app/src/routes/connector-test-panel.tsx
    role: depends-on
  - name: use-edit-draft-version-form
    path: frontend/app/src/hooks/use-edit-draft-version-form.ts
    role: adjacent
  - name: case-detail-screen
    path: frontend/app/src/routes/case-detail-screen.tsx
    role: adjacent
  - name: case-version-editor-screen
    path: frontend/app/src/routes/case-version-editor-screen.tsx
    role: adjacent
conventions:
  - statement: Every route is a createRoute object built with getParentRoute pointing at rootRoute, and registered by being listed in rootRoute.addChildren([...]) inside route-tree.tsx, this app's one route registry.
    seen_at: frontend/app/src/routes/route-tree.tsx
  - statement: A routed detail screen reads its params with useParams({ from "<path>" }), delegates to a hook returning a "loading" | "load-error" | "ready" phase union, and renders each phase explicitly with a typed retry action on load-error.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: A routed single-record edit hook uses a useQuery keyed [<resource>, ...identity], a useEffect that calls form.reset(...) and marks state clean on load, form.watch with type === "change" to flip clean to dirty, an isSubmittingRef guard against double-submit, and a navigate escape on a not-found load error.
    seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - statement: A JSON field pairs its current text with the validity flag JsonTextareaField's onChange reports in the same call, and getJsonTextareaMinifiedValue(text) is the pure function used to derive the value dispatched on save.
    seen_at: frontend/app/src/shared/components/json-textarea-field.tsx
  - statement: >-
      JsonTextareaField already renders its own inline "Invalid JSON" error text (naming the
      parse message) and a disabled-when-invalid Beautify button, but does not pretty-print on
      mount — whatever text a caller passes as value is shown as-is.
    seen_at: frontend/app/src/shared/components/json-textarea-field.tsx
  - statement: Today's Save button is disabled only by isSubmitting || !json.isValid, never by an isDirty comparison against the originally loaded values.
    seen_at: frontend/app/src/routes/connector-configuration-form-fields.tsx
  - statement: An edit dialog's hook takes the already-loaded record straight from the list screen's already-fetched cache rather than issuing its own GET for one record.
    seen_at: frontend/app/src/hooks/use-connector-configuration-form.ts
  - statement: No toast.success call exists anywhere in this app; every existing mutation hook only toasts on error, and a save's own success feedback today is silent beyond the dialog closing or, in the one routed hook that exists, a savedAt timestamp state field the ready view renders.
    seen_at: frontend/app/src/hooks/use-capability-form.ts
  - statement: Both existing dialog field components accept an isEditingIdentity prop that disables the identity field(s) once a record exists, rather than merely pre-filling them.
    seen_at: frontend/app/src/routes/connector-configuration-form-fields.tsx
  - statement: StatusTable's row cells already render arbitrary ReactNode, so making a row itself navigate is a markup change to each screen's own toRow function, not a change to StatusTable itself.
    seen_at: frontend/app/src/routes/capabilities-browser-screen.tsx
must_not_duplicate:
  - what: JSON parse/beautify/inline-error/minify logic for a JSON textarea field
    at: frontend/app/src/shared/components/json-textarea-field.tsx
  - what: The loading/load-error/ready phase shape, dirty tracking via form.watch, isSubmittingRef double-submit guard, and reset-on-load/reset-on-save convention for a routed single-record edit screen
    at: frontend/app/src/hooks/use-edit-draft-version-form.ts
  - what: The connector-configuration and capability field markup (Input/Select/JsonTextareaField layout, isEditingIdentity wiring)
    at: frontend/app/src/routes/connector-configuration-form-fields.tsx and frontend/app/src/routes/capability-form-fields.tsx
  - what: The connector debug Test section
    at: frontend/app/src/routes/connector-test-panel.tsx
  - what: List reads of connector configurations and capabilities, and their query-invalidation keys ("connector-configurations", "capabilities")
    at: frontend/app/src/hooks/use-connector-configurations.ts and frontend/app/src/hooks/use-capabilities.ts
risks:
  - risk: Both edit hooks currently read the record passed in from the list screen's already-fetched cache rather than issuing their own GET; a route reached by direct navigation or a page refresh has no such cache to read from, so the new per-record hooks must add a real GET, and every existing "no identity-loading query of its own" assumption stated in both hooks' header comments needs re-reading rather than copying verbatim.
    consumers:
      - frontend/app/src/hooks/use-connector-configuration-form.ts
      - frontend/app/src/hooks/use-capability-form.ts
  - risk: Neither hook's onSuccess currently distinguishes "just saved, values now match server" from "loaded fresh" for isDirty purposes; wiring isDirty against the JSON textarea fields without also re-baselining their original value on a successful save would leave Save permanently enabled, or disabled against a stale baseline, immediately after saving.
    consumers:
      - frontend/app/src/hooks/use-connector-configuration-form.ts
      - frontend/app/src/hooks/use-capability-form.ts
  - risk: Query invalidation on save ("connector-configurations", "capabilities") refetches the list screens but not any single-record query the new routes add; a route left reading a stale single-record cache after its own save would show data that has already changed underneath it unless its own mutation's onSuccess also invalidates or updates that query key.
    consumers:
      - frontend/app/src/routes/connector-configurations-screen.tsx
      - frontend/app/src/routes/capabilities-browser-screen.tsx
  - risk: A capability's row identity is name plus version because a name alone is not unique; a /capabilities/$name/$version route must carry both path params, or a name-only route will resolve the wrong or an ambiguous record.
    consumers:
      - frontend/app/src/routes/capabilities-browser-screen.tsx
      - frontend/app/src/routes/route-tree.tsx
---

## What it is

Routing is code-based @tanstack/react-router (not react-router): every route is registered in route-tree.tsx, this app's one route registry.
A routed detail screen already exists to imitate: the case-version editor route wires a screen that reads params, delegates to a hook returning a loading/load-error/ready phase union, and renders each phase explicitly.
connector-configurations-screen.tsx and capabilities-browser-screen.tsx currently open their edit form by setting local formTarget state from a row's own Edit button, passing the already-loaded row straight into the dialog's hook rather than issuing a second fetch; rows carry no Link today.
use-connector-configuration-form.ts tracks configuration as plain useState text plus a separate useState validity flag, both replaced together only through JsonTextareaField's own onChange; use-capability-form.ts does the same for input_schema and output_schema.
Neither hook reads react-hook-form's own formState.isDirty, and neither hook compares the JSON field's current text against its originally loaded value.
Neither use-connector-configurations.ts nor use-capabilities.ts exposes a single-record GET; both are list-only reads returned as {list-field, isLoading, isError, refetch}, and both existing edit dialogs rely entirely on that already-fetched list rather than reading one record by identity.

## Notes

connector-test-panel.tsx is rendered only in the connector configuration dialog's edit mode, scoped to the connector being edited; the new /connectors/$connector route must fold this same component in rather than dropping it, per the scope's own item 1.
The identity fields (connector, or name and version) stay disabled once a record exists in every existing form, and the new routed screens' fields are expected to keep that same rule.
