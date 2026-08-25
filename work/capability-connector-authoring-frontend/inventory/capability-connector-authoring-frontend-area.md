---
title: Frontend routes, hooks and shared form conventions for capability/connector/concept authoring
summary: The existing read-only Capabilities and Glossary screens, the app's one create/edit form pair (Version Editor and Hypothesis Revision), and the shared services (api-client, error-ui-state, form-schema-with-zod) the new create/edit and test-connector screens must extend.
area:
  - src/routes
  - src/hooks
  - src/services
  - src/shared/components
sources:
  - work/capability-connector-authoring-frontend/intake/scope.md
modules:
  - name: capabilities-browser-screen
    path: src/routes/capabilities-browser-screen.tsx
    role: touched
  - name: glossary-browser-screen
    path: src/routes/glossary-browser-screen.tsx
    role: touched
  - name: use-capabilities
    path: src/hooks/use-capabilities.ts
    role: touched
  - name: use-glossary-concepts
    path: src/hooks/use-glossary-concepts.ts
    role: touched
  - name: use-concept-options
    path: src/hooks/use-concept-options.ts
    role: depends-on
  - name: use-glossary-vocabulary
    path: src/hooks/use-glossary-vocabulary.ts
    role: depends-on
  - name: case-version-editor-screen-and-form
    path: src/routes/case-version-editor-screen.tsx
    role: adjacent
  - name: use-edit-draft-version-form
    path: src/hooks/use-edit-draft-version-form.ts
    role: adjacent
  - name: use-new-draft-version-form
    path: src/hooks/use-new-draft-version-form.ts
    role: adjacent
  - name: hypothesis-revision-screen
    path: src/routes/hypothesis-revision-screen.tsx
    role: adjacent
  - name: new-hypothesis-screen
    path: src/routes/new-hypothesis-screen.tsx
    role: adjacent
  - name: case-version-form-schema
    path: src/services/case-version-form-schema.ts
    role: adjacent
  - name: error-ui-state
    path: src/services/error-ui-state.ts
    role: depends-on
  - name: api-client
    path: src/services/api-client.ts
    role: depends-on
  - name: route-tree
    path: src/routes/route-tree.tsx
    role: touched
  - name: route-placeholders
    path: src/routes/route-placeholders.tsx
    role: depends-on
  - name: app-shell
    path: src/shared/components/app-shell.tsx
    role: adjacent
  - name: status-table
    path: src/shared/components/status-table.tsx
    role: depends-on
conventions:
  - statement: A create/edit pair for one resource is one shared hook plus one shared field-markup component, parametrized by a nullable identity (null selects create-mode/POST, a real identity selects edit-mode/PATCH); the create screen and the edit screen are each a thin wrapper that resolves params and renders the shared piece.
    seen_at: src/hooks/use-new-draft-version-form.ts
  - statement: The same create/null-vs-edit-identity pattern repeats for a second resource (hypothesis revision), confirming it as this app's established shape rather than one file's local choice.
    seen_at: src/routes/new-hypothesis-screen.tsx
  - statement: Business logic (form state, mutations, save state machine) lives entirely in a hook; the route/screen component only reads what the hook returns and renders it.
    seen_at: src/hooks/use-edit-draft-version-form.ts
  - statement: Client-side validation schemas are zod schemas mirroring the backend's own request-body DTO field-for-field, wired to react-hook-form via zodResolver.
    seen_at: src/services/case-version-form-schema.ts
  - statement: A domain error thrown by the backend is mapped, by ApiError.code, to a UI state kind through one central registry; a code the table does not name falls back to a shared generic-error state rather than throwing.
    seen_at: src/services/error-ui-state.ts
  - statement: A list-reading hook returns exactly a list field plus isLoading/isError/refetch, reads only a page's data array via apiFetch, and is a thin, one-purpose sibling rather than a widened shared hook when a second screen needs a different narrowing of the same endpoint.
    seen_at: src/hooks/use-glossary-concepts.ts
  - statement: A load failure degrades to a typed error state with an explicit Retry button; an empty list gets its own explicit empty-state message, never conflated with loading or error.
    seen_at: src/routes/capabilities-browser-screen.tsx
  - statement: A form field's label wraps its control rather than using htmlFor/id, because the UI kit's Select only spreads caller props onto its outer wrapper, not its inner interactive element.
    seen_at: src/routes/case-version-editor-form-fields.tsx
  - statement: One mutation per terminal, independent action (e.g. release, discard), each with its own onSuccess/onError branch, kept separate from the shared save state machine rather than folded into one combined dirty flag.
    seen_at: src/hooks/use-edit-draft-version-form.ts
  - statement: New screens are wired into route-tree.tsx as a flat child of the root route, replacing an existing entry in route-placeholders.tsx left in place but unused.
    seen_at: src/routes/route-tree.tsx
  - statement: The UI kit supplies Input, Textarea, Label, Select, Button, Panel, Tabs and StatusTable; no JSON-aware or code-editor-styled textarea, and no multi-select control, exists anywhere in this app today.
    seen_at: src/routes/case-version-editor-form-fields.tsx
must_not_duplicate:
  - what: The typed fetch wrapper (apiFetch) and its ApiError, the one path every backend call must go through
    at: src/services/api-client.ts
  - what: The domain-error-to-UI-state mapping registry a new refusal (e.g. the read-only-nature refusal) must add its own entry to rather than a screen hand-checking error.code itself
    at: src/services/error-ui-state.ts
  - what: The create(null)/edit(identity) shared-hook-plus-shared-field-markup shape already proven twice (version editor, hypothesis revision)
    at: src/hooks/use-edit-draft-version-form.ts
  - what: StatusTable's row-click-to-detail-panel composition, the one precedent for augmenting a read-only list with a client-side selection interaction
    at: src/routes/capabilities-browser-screen.tsx
  - what: The Tabs-based screen composition (each tab's child owns its own query, firing only when active) the Concept editor should extend rather than re-derive for the Glossary screen's Concepts tab
    at: src/routes/glossary-browser-screen.tsx
  - what: The list-reading hook shape (apiFetch, read only the page's data, return list plus isLoading/isError/refetch) for any new list read the create/edit screens need (e.g. connector configurations)
    at: src/hooks/use-glossary-concepts.ts
risks:
  - risk: No JSON-aware, pretty-print/minify/beautify textarea component exists anywhere in this codebase; the capability schemas, connector configuration, and test-connector sample-input editors all need one, so whichever task builds it first fixes its contract (props, minify-on-submit behavior, malformed-JSON inline error) for every other consumer that follows.
    consumers:
      - Capability editor's input_schema/output_schema fields
      - Connector Configuration editor's configuration field
      - Test-connector panel's sample-input editor
  - risk: No multi-select control exists in this app's UI-kit usage today; the Concept editor's accepts field (a multi-select of subject types) has no established pattern to follow and may need a new composition over Select or a different primitive.
    consumers:
      - Concept create/edit editor (added to glossary-browser-screen.tsx's Concepts tab)
  - risk: use-capabilities.ts's Capability type and capabilities-browser-screen.tsx's read-only detail panel are both built around a registry that today never mutates; turning the browser into a create/edit surface changes their contract (adding mutations, a selected-row edit mode) in a screen and hook that existing specs already assert against in read-only terms.
    consumers:
      - src/routes/capabilities-browser-screen.spec.ts
      - src/routes/capabilities-browser-screen-detail.spec.ts
      - src/routes/capabilities-browser-screen.test-support.ts
  - risk: error-ui-state.ts's registry is asserted exhaustively by its own spec (every mapped code enumerated, one test asserting all kinds distinct); adding the read-only-nature refusal's mapping touches that same file and its spec together.
    consumers:
      - src/services/error-ui-state.spec.ts
  - risk: The debug test-connector panel is explicitly told to show full technical detail (headers, elapsed time, raw body) and issues a live call to a registered capability's own connector — no existing screen in this app issues a call whose purpose is to surface raw transport detail rather than a parsed domain result, so its request/response rendering has no reuse point and must be built from nothing (api-client.ts's apiFetch deliberately unwraps/parses responses, the opposite of what this panel needs to show).
    consumers:
      - Connector Configuration editor's Test section
---

## What it is

The area the scope lands in: the frontend app's routes, hooks, services and shared components under `src/`, where two existing read-only screens (Capabilities, Glossary) must gain create/edit and a Connector Configuration editor plus a debug test-connector panel must be built new.

## Notes

No task or component today performs a JSON beautify/minify textarea, a multi-select control, or a raw-request/response debug rendering — these three are the areas with no established convention to extend, and the plan should expect original design work there, not reuse.
The create(null)/edit(identity) shared-hook-plus-field-markup shape, the zod-schema-mirrors-backend-dto convention, and the central error-ui-state registry are strong, twice-proven reuse points the new editors should follow rather than re-derive.
