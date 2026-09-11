---
title: Connector Configuration Helper — frontend surfaces for the operations-listing read
summary: The Configuration Helper's fields component, its two composing hooks, its draft-disclosure service, and the sibling test-support/spec files a new operations-read hook and its disclosure must sit beside and follow.
sources:
  - work/connector-configuration-helper-operation-listing-frontend/intake/scope.md
area:
  - frontend/app/src/routes/connector-configuration-helper-fields.tsx
  - frontend/app/src/routes/connector-configuration-helper.tsx
  - frontend/app/src/routes/connector-configuration-helper-fields.spec.ts
  - frontend/app/src/routes/connector-configuration-helper-fields-apply.spec.ts
  - frontend/app/src/routes/connector-configuration-form-fields.tsx
  - frontend/app/src/hooks/use-connector-configuration-helper.ts
  - frontend/app/src/hooks/use-connector-configuration-helper.spec.ts
  - frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
  - frontend/app/src/services/connector-configuration-draft-disclosure.ts
  - frontend/app/src/services/api-client.ts
  - frontend/app/src/routes/connector-test-panel-fields.tsx
  - frontend/app/src/hooks/use-test-connector-panel.ts
  - frontend/app/src/hooks/use-capabilities.ts
  - frontend/app/src/routes/capability-form-fields.tsx
modules:
  - name: connector-configuration-helper-fields
    path: frontend/app/src/routes/connector-configuration-helper-fields.tsx
    role: touched
  - name: use-connector-configuration-helper
    path: frontend/app/src/hooks/use-connector-configuration-helper.ts
    role: touched
  - name: use-draft-connector-configuration-from-openapi
    path: frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
    role: touched
  - name: connector-configuration-draft-disclosure
    path: frontend/app/src/services/connector-configuration-draft-disclosure.ts
    role: touched
  - name: connector-configuration-helper
    path: frontend/app/src/routes/connector-configuration-helper.tsx
    role: adjacent
  - name: connector-configuration-form-fields
    path: frontend/app/src/routes/connector-configuration-form-fields.tsx
    role: adjacent
  - name: api-client
    path: frontend/app/src/services/api-client.ts
    role: depends-on
  - name: use-test-connector-panel
    path: frontend/app/src/hooks/use-test-connector-panel.ts
    role: adjacent
  - name: use-capabilities
    path: frontend/app/src/hooks/use-capabilities.ts
    role: adjacent
  - name: tui-ui-select
    path: "@tui/ui/select"
    role: depends-on
---

## What it is

There is no "connector-configuration-detail-screen route that composes the helper" — the scope names this loosely; the actual composition chain is connector-configuration-form-fields.tsx rendering ConnectorConfigurationHelper (connector-configuration-helper.tsx), which renders ConnectorConfigurationHelperFields with the state returned by useConnectorConfigurationHelper.
useConnectorConfigurationHelper (frontend/app/src/hooks/use-connector-configuration-helper.ts) holds link, path and method as plain useState strings and composes them into a request to the sibling hook useDraftConnectorConfigurationFromOpenApi on onRequestDraft; path and method are exposed only as free-text setters (onPathChange, onMethodChange) that ConnectorConfigurationHelperFields renders as two plain Input fields.
useDraftConnectorConfigurationFromOpenApi (frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts) is a @tanstack/react-query useMutation wrapping apiFetch("/v1/draft-connector-configuration-from-openapi", POST), translating ApiError.code values (OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError, OpenApiOperationNotFoundError) into a closed DraftConnectorConfigurationRequestOutcome union via a switch, defaulting unrecognised codes/shapes to {kind:"unrecognized-failure"}.
connector-configuration-draft-disclosure.ts (frontend/app/src/services/connector-configuration-draft-disclosure.ts) is the exact pattern the scope says the new read's refusals must mirror: a pure disclosureStateForOutcome(outcome) function switching over every DraftConnectorConfigurationRequestOutcome kind and returning either {kind:"none"|"pending"|"drafted",...} or {kind:"refused", message: <one composed sentence stating what was not produced and why, plus one line per failure sub-kind such as network-failure/timeout/status-outside-2xx>}.
ConnectorConfigurationHelperFields (frontend/app/src/routes/connector-configuration-helper-fields.tsx) calls disclosureStateForOutcome(state.outcome) once at the top and renders three mutually exclusive branches inside a single aria-live="polite" container: pending text, `<p role="alert" className="text-sm text-destructive">` for refused, and a drafted sub-render for success — this is the exact refusal-disclosure DOM shape (role="alert", same class names) a new refusal branch must reuse.
api-client.ts (frontend/app/src/services/api-client.ts) is the one fetch wrapper: apiFetch<T>(input, init) throws ApiError(code, message, details) built from the backend's {error:{code,message,details}} envelope on any non-2xx response; every hook that calls the backend (use-draft-connector-configuration-from-openapi.ts, use-test-connector-panel.ts, use-capabilities.ts) goes through this same function, never a raw fetch.
Two hook shapes exist for calling the backend: a useMutation-wrapped apiFetch for a POST that dispatches on demand (use-draft-connector-configuration-from-openapi.ts, use-test-connector-panel.ts's test dispatch), and a useQuery-wrapped apiFetch for a GET read that fires on mount/dependency change (use-capabilities.ts), exposing {data/isLoading/isError} rather than mutation status.
The selection/dropdown control this app already has is `Select` from `@tui/ui/select`, taking `options: SelectOption[]` (each `{value, label}`), `value: string`, `onChange: (value: string) => void`; connector-test-panel-fields.tsx and capability-form-fields.tsx both wrap it in a `<Label className="flex flex-col gap-1">` with the label text as a direct child, exactly the shape used for the two free-text Operation path/method Inputs today.
use-test-connector-panel.ts (frontend/app/src/hooks/use-test-connector-panel.ts) is the closest existing precedent for a listing read feeding a Select: it derives `capabilityOptions: SelectOption[]` from useCapabilities()'s data, exposes `isLoadingCapabilities`/`isCapabilitiesError` booleans read directly off the query, and keeps the selected key in its own useState rather than deriving it from the fetched list.
Spec files connector-configuration-helper-fields.spec.ts and connector-configuration-helper-fields-apply.spec.ts both build a `baseState(outcome)` object literal matching `ConnectorConfigurationHelperState` by hand (link/onLinkChange/path/onPathChange/method/onMethodChange/onRequestDraft/outcome) and drive the component purely through that state prop, never through the real hook or a network stub — any field this scope adds to that state type will need the same hand-built literal updated in both files.
use-connector-configuration-helper.spec.ts mounts the real hook under a QueryClientProvider and stubs global fetch keyed by URL (`/v1/draft-connector-configuration-from-openapi`), throwing on any other URL — a new operations-read call from this hook would need its own URL branch added to that stub or a like-named sibling stub.

## Notes

The scope's phrase "the connector-configuration-detail-screen route that composes the helper" does not name an existing file; the real composer sits two levels up (connector-configuration-form-fields.tsx → connector-configuration-helper.tsx → connector-configuration-helper-fields.tsx), so a task naming that composition should point at connector-configuration-helper.tsx, not a nonexistent detail-screen file.
No existing hook in this survey performs a GET keyed by a caller-supplied argument (link) the way the new operations read must (useCapabilities and useGlossaryVocabularyOptions are unparameterized or vocabulary-keyed, not link-keyed) — the query-key shape for a link-parameterized useQuery has no direct precedent in the surveyed files.
A change to DraftConnectorConfigurationRequestOutcome's discriminated union or to ConnectorConfigurationHelperState's field names is observed by both spec files' hand-built baseState literals and by use-connector-configuration-helper.spec.ts's fetch stub, all three of which sit outside the files this scope names directly.
The frontend/app/src tree also holds an unrelated connector-configuration-detail-screen family (frontend/app/src/routes/connector-configuration-detail-screen*.tsx, use-connector-configuration-detail*.ts) that the scope's own file list does not reach; it was not walked beyond confirming it shares no import with the Configuration Helper files above.
