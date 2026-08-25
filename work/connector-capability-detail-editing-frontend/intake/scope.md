# Scope — connector-capability-detail-editing (frontend)

Frontend-target half of a paired initiative (backend counterpart:
`connector-capability-detail-editing-backend`). Requested by the human running the delivered
system at http://localhost:5173, evaluated by the assistant against the source before this
scope was written.

## 1. Dedicated connector configuration detail/edit route

Today, editing a connector configuration on http://localhost:5173/connectors opens a popup
Dialog (`src/routes/connector-configuration-form-dialog.tsx`, driven by
`src/hooks/use-connector-configuration-form.ts`).

**Required change:** replace that popup with a dedicated route at `/connectors/<connector>`
(the connector configuration's own identity, `domain/integration/connector-configuration` — a
single required string attribute, `connector`) that shows the full connector configuration and
lets the operator edit it on that same screen — folding in the existing fields
(`connector-configuration-form-fields.tsx`) and the existing `ConnectorTestPanel` debug section,
rather than a Dialog.

The Save button must only enable when the form's current values differ from the originally
loaded values (`isDirty`) — including the `configuration` JSON field, which lives outside
react-hook-form's own state (tracked as plain component state in
`use-connector-configuration-form.ts`) and needs its own current-vs-original comparison, not
just "has onChange fired at least once." Returning a field to its original value must
re-disable Save.

The connector identity (`connector`, a single string) already has a backend read endpoint,
`GET /v1/connectors/{connector}` — the new route should load directly from it (through a new
hook mirroring the existing list/edit hooks' conventions) rather than depending only on the
list screen's already-fetched cache, so the route also works on direct navigation or a page
refresh.

## 2. Dedicated capability detail/edit route

Today, editing a capability on http://localhost:5173/capabilities opens a popup Dialog
(`src/routes/capability-form-dialog.tsx`, driven by `src/hooks/use-capability-form.ts`).

**Required change:** replace that popup with a dedicated route at `/capabilities/<name>/<version>`
— the capability's real identity per `domain/integration/capability` (`name` and `version` are
both required attributes; a name alone is not guaranteed unique across versions) — that shows
the full capability and lets the operator edit it on that same screen, folding in the existing
fields (`capability-form-fields.tsx`).

Same Save-button `isDirty` behavior as item 1, including `input_schema` and `output_schema`,
which also live outside react-hook-form's state in `use-capability-form.ts` (each paired with
its own validity flag from the shared `JsonTextareaField`).

The backend counterpart initiative is adding a new read route resolving a capability by
`(name, version)` — mirroring `read-connector-configuration`'s own shape — so this route can
load directly on first navigation or refresh, the same way item 1 does for connectors, rather
than depending only on `list-capabilities` having already been fetched.

## 3. Erro reported: input_schema showing as plain text for one capability

While testing item 2's screen, an existing capability ("perfil-mobile-tecnico-reader") was
found holding an `input_schema` that is not valid JSON. This is a data problem being
diagnosed and corrected by the backend counterpart initiative (its root cause is not yet
established as a frontend concern), but this frontend screen's own behavior when it encounters
an already-invalid schema value on load matters for the UX item below — this task's own
concern is display, not correction of the underlying rule enforcement.

## UX/UI improvements to fold into items 1 and 2

- Both routes are reachable by clicking a row on their respective list screens (not only
  through a separate "Edit" action), and offer a way back to the list.
- Every JSON textarea (`configuration`, `input_schema`, `output_schema`) pretty-prints the
  loaded value rather than showing minified JSON, on both the existing create/edit dialogs and
  the new detail routes.
- A "discard changes" affordance sitting beside the isDirty-gated Save button, resetting every
  field (including the JSON ones) back to the originally loaded values.
- A save-success acknowledgement (the forms today only toast on error) and, on the detail
  routes, visible confirmation that the shown data reflects what was just saved.
- Where a detail route loads a JSON field (`configuration`, `input_schema`, `output_schema`)
  that does not parse as valid JSON (an already-invalid stored value, such as item 3 above),
  show the operator a plain warning that the stored value is not valid JSON and must be
  corrected before Save can succeed, instead of silently rendering a broken or garbled value.

## Notes

- Backend target: `src` (paired initiative, not this one).
- Frontend target: `frontend/app`.
- Existing conventions to follow for anything new here: the header comments on
  `use-capability-form.ts`, `use-connector-configuration-form.ts`,
  `connector-configuration-form-dialog.tsx`, `capability-form-dialog.tsx`, and
  `json-textarea-field.tsx` document the established shape and reasoning for this app's
  create/edit forms.
