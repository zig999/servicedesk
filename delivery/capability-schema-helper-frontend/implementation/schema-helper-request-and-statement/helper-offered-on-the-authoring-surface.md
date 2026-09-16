---
target: frontend
title: Capability Schema Helper offered beneath the two schema fields
summary: CapabilityFormFields now renders a Schema Helper (link input plus an operation picker read through the existing operations hook) beneath Input schema and Output schema, offering a capability-schema draft request only once an operation is chosen, on both the create and detail surfaces that already share that component.
task: sha256:8a53f88f946520d16a107e10b9accffaba4759ae580ae0f77beeba98b25887de
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-helper-request-and-statement-helper-offered-on-the-authoring-surface-build
files:
- path: src/hooks/use-capability-schema-helper.ts
  effect: New hook. Composes useOpenApiDocumentOperations(link) with the already-delivered useDraftCapabilitySchemaFromOpenApi() to expose CapabilitySchemaHelperState -- link/onLinkChange, the operations offered for that link plus their read outcome and a retry, the chosen operation and its setter, and onRequestDraft, which dispatches requestDraft({link, path, method}) only when chosenOperation is defined and is a no-op otherwise.
- path: src/routes/capability-schema-helper-fields.tsx
  effect: New presentation component. Renders the link Input and an operation Select built only from state.operations (never a free-hand path/method field); renders the waiting-on-operation message in the request act's own place when no operation is chosen, and the request button (disabled while state.outcome.kind is 'pending') once one is; renders the operations-read pending/empty/refused disclosure (reusing operationsReadDisclosureStateForOutcome and its messages) inside an aria-live region, with a retry action wired to the hook's refetch.
- path: src/routes/capability-form-fields.tsx
  effect: Touched. Imports and calls useCapabilitySchemaHelper, and renders <CapabilitySchemaHelperFields state={schemaHelper} /> immediately after the Input schema/Output schema grid and before ButtonFooter -- the one insertion point both CapabilityCreateScreen and CapabilityDetailReadyView pick up automatically since both already render this shared component. No existing prop, registration, or gating logic in this file was changed.
criteria:
- criterion: The capability create screen presents the Schema Helper beneath its Input schema and Output schema fields, on the surface the capability is authored from and not on a separate screen or a dialog of its own.
  met: true
  how: capability-create-screen.tsx renders CapabilityFormFields unchanged; CapabilityFormFields now mounts CapabilitySchemaHelperFields directly beneath the Input schema/Output schema grid and above ButtonFooter, inline in the same form and the same route, never a separate route or a Dialog.
- criterion: The capability detail screen presents the Schema Helper beneath its Input schema and Output schema fields, on the surface the capability is edited from and not on a separate screen or a dialog of its own.
  met: true
  how: capability-detail-ready-view.tsx renders the same CapabilityFormFields, so the same insertion point beneath the schema grid reaches this screen as well, inline in the same form, with no separate route or Dialog introduced.
- criterion: The helper takes an OpenAPI document link from the operator and lists that document's own declared operations, read through the existing use-openapi-document-operations hook rather than through a second operations reader.
  met: true
  how: useCapabilitySchemaHelper holds link as local state and calls useOpenApiDocumentOperations(link) directly -- the same hook the Configuration Helper already uses -- deriving the offered operations list from its 'operations' outcome; no second fetch or operations reader was written.
- criterion: The helper offers no free-hand entry of a path and no free-hand entry of an HTTP method; an operation is named only by choosing one of the listed operations.
  met: true
  how: CapabilitySchemaHelperFields renders no path or method text input at all -- only a Link Input and an operation Select built solely from state.operations; onOperationSelected resolves the chosen value back to one of those listed OpenApiOperation entries via onChooseOperation, and the hook's onRequestDraft reads path/method only off the stored chosenOperation object, never off a typed value.
- criterion: Where no operation stands chosen, the helper states in the request act's own place that it waits on a chosen operation.
  met: true
  how: In CapabilitySchemaHelperFields, the div that otherwise holds the request Button renders, in that same place, the waiting-on-operation message whenever state.chosenOperation is undefined.
- criterion: Where no operation stands chosen, no draft request is dispatched by any act the helper offers.
  met: true
  how: The only dispatching act CapabilitySchemaHelperFields offers is the request button, which the fields component does not even render while chosenOperation is undefined; onRequestDraft itself also returns immediately without calling requestDraft when chosenOperation is undefined.
- criterion: Where an operation stands chosen, the act requesting a capability schema draft is offered.
  met: true
  how: Once state.chosenOperation is defined, CapabilitySchemaHelperFields renders the request Button wired to state.onRequestDraft, which calls the depended-on useDraftCapabilitySchemaFromOpenApi's requestDraft with the chosen operation's link/path/method.
- criterion: Requesting a draft issues no register-capability call, and the capability registry stands exactly as it stood.
  met: true
  how: onRequestDraft calls only the already-delivered useDraftCapabilitySchemaFromOpenApi().requestDraft, which POSTs to /v1/draft-capability-schema-from-openapi -- a read, per contracts/integration/capability-schema-draft. Neither of this task's two new files, nor the touched capability-form-fields.tsx, imports or calls the capability-registration service.
nodes:
- node: rules/integration/a-capability-authoring-surface-offers-a-schema-helper
  encoded_at:
  - src/routes/capability-form-fields.tsx
  - src/routes/capability-schema-helper-fields.tsx
  - src/hooks/use-capability-schema-helper.ts
  how: The helper lives inside CapabilityFormFields, the one surface both the create and detail screens already author/edit a capability from, beneath its two schema fields -- never a separate screen or dialog. It takes a link and lists that link's declared operations through use-openapi-document-operations (never a second reader), names an operation only by choosing one of that list (no free-hand path or method), and offers requestDraft -- which issues no register-capability call -- only once chosenOperation is set, stating in that same place that it waits on one otherwise.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  encoded_at:
  - src/hooks/use-capability-schema-helper.ts
  how: use-capability-schema-helper.ts issues no direct fetch to any OpenAPI document URL; the document behind the operations listing is fetched by useOpenApiDocumentOperations's own backend-side read, reused rather than duplicated, and the document behind the draft itself is fetched by the backend operation draft-capability-schema-from-openapi that the depended-on hook already calls.
- node: contracts/integration/capability-schema-draft
  encoded_at:
  - src/hooks/use-capability-schema-helper.ts
  how: This task composes with the contract's already-delivered client (useDraftCapabilitySchemaFromOpenApi) rather than re-implementing it -- useCapabilitySchemaHelper calls its requestDraft with the {link, path, method} the chosen operation names, and forwards its outcome unchanged.
inferences:
- inferred: The pending/drafted/refused states of the schema draft mutation itself are not rendered by this task's files -- only the request button's disabled state reacts to state.outcome.kind === 'pending', purely to guard against a rapid double click.
  from: This task's own REMAINDER notes reserve stating an answered draft and stating a refusal to their own future tasks, and its UNDERDETERMINED note leaves a-pending-schema-draft-request-is-not-dispatched-again to a later task; the pending state of that same outcome union was read as belonging to that same later 'stating the outcome' concern rather than to this task's narrower 'offering the act'.
- inferred: Reused operationsReadDisclosureStateForOutcome and the OPERATIONS_READ_PENDING_MESSAGE/OPERATIONS_READ_EMPTY_MESSAGE constants from the connector-configuration-named modules for the Schema Helper's own operations-read pending/empty/refused states, rather than writing a second copy of that mapping.
  from: The inventory's must_not_duplicate entry for useOpenApiDocumentOperations and its own risk note that this hook's outcome type is already shared across a connector-configuration-named file boundary.
- inferred: Wired the hook's existing refetch as a retry action on the operations-read refused state.
  from: EDG-01 and EDG-02 of the standard (an explicit loading state before data arrives; a failed load degrading to a typed error state offering a retry) apply to this new .tsx file; useOpenApiDocumentOperations already exposes refetch for exactly this purpose.
- inferred: Changing the link does not clear an already-chosen operation.
  from: ConnectorConfigurationHelperFields/useConnectorConfigurationHelper's identical behavior -- onLinkChange there does not reset the chosen path/method either, and no criterion of this task states otherwise.
preserved:
- CapabilityFormFields' existing field registrations (concept, name, version, nature, timeout, connector), its isSaveDisabled gating, and the (value, isValid) onChange contract for inputSchema/outputSchema are untouched.
- capability-create-screen.tsx and capability-detail-ready-view.tsx continue to pass the same props to CapabilityFormFields and were not modified; both pick up the new helper solely because they already render this shared component.
deferred:
- what: Stating the schema draft's own outcome to the operator -- the drafted input_schema/output_schema and unresolved items once answered, and the refusal's own message once refused (including staleness once what a stated draft was generated for changes).
  why: Reserved by this task's own REMAINDER notes to the sibling rules stating a draft/refusal, each named as a whole statement no criterion here addresses.
- what: Withholding a second dispatch while one request from this helper is outstanding, and requesting again the instant an outstanding request ends.
  why: This task's own UNDERDETERMINED note identifies rules/integration/a-pending-schema-draft-request-is-not-dispatched-again as a candidate of a different task; no criterion here reaches any clause of its statement.
- what: Applying a drafted schema into the Input schema / Output schema fields' own (value, isValid) contract.
  why: Out of this task's scope (offering and dispatching the request act only); belongs with the future work that states the drafted schema.
---

## What it is

The helper's own local state -- the link, the chosen operation -- and the component that renders it inside CapabilityFormFields, which both capability screens already share. The operations listing is the existing connector-agnostic hook, reused rather than rebuilt.

## Notes

None.
