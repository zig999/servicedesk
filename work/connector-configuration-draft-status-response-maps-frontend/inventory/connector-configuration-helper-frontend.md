---
title: Configuration Helper screen -- frontend
summary: The existing Configuration Helper screen, its draft-fetching hook, its draft disclosure/rendering,
  its i18n and layering conventions, and what a readiness panel plus a status/response disclosure table
  must reuse.
area:
- frontend/app/src/routes
- frontend/app/src/hooks
- frontend/app/src/services
- frontend/app/src/shared/components
- frontend/app/src/shared/services
sources:
- intake/scope.md
modules:
- name: connector-configuration-create-detail-screens
  path: frontend/app/src/routes/connector-configuration-create-screen.tsx
  role: touched
- name: connector-configuration-detail-screen
  path: frontend/app/src/routes/connector-configuration-detail-screen.tsx
  role: touched
- name: connector-configuration-detail-ready-view
  path: frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
  role: touched
- name: connector-configuration-form-fields
  path: frontend/app/src/routes/connector-configuration-form-fields.tsx
  role: touched
- name: connector-configuration-helper
  path: frontend/app/src/routes/connector-configuration-helper.tsx
  role: touched
- name: connector-configuration-helper-fields
  path: frontend/app/src/routes/connector-configuration-helper-fields.tsx
  role: touched
- name: use-connector-configuration-helper
  path: frontend/app/src/hooks/use-connector-configuration-helper.ts
  role: touched
- name: use-draft-connector-configuration-from-openapi
  path: frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
  role: touched
- name: use-openapi-document-operations
  path: frontend/app/src/hooks/use-openapi-document-operations.ts
  role: touched
- name: connector-configuration-draft-disclosure
  path: frontend/app/src/services/connector-configuration-draft-disclosure.ts
  role: touched
- name: connector-configuration-operations-read-disclosure
  path: frontend/app/src/services/connector-configuration-operations-read-disclosure.ts
  role: touched
- name: use-connector-configuration-form
  path: frontend/app/src/hooks/use-connector-configuration-form.ts
  role: depends-on
- name: json-textarea-field
  path: frontend/app/src/shared/components/json-textarea-field.tsx
  role: depends-on
- name: use-capabilities
  path: frontend/app/src/hooks/use-capabilities.ts
  role: depends-on
- name: use-test-connector-panel
  path: frontend/app/src/hooks/use-test-connector-panel.ts
  role: adjacent
- name: capability-form-fields
  path: frontend/app/src/routes/capability-form-fields.tsx
  role: adjacent
- name: plain-record
  path: frontend/app/src/shared/services/plain-record.ts
  role: depends-on
conventions:
- statement: The Configuration Helper is a sub-panel mounted inside ConnectorConfigurationFormFields,
    reused by both the create screen and the detail screen's ready view.
  seen_at: frontend/app/src/routes/connector-configuration-form-fields.tsx
- statement: use-connector-configuration-helper.ts composes useOpenApiDocumentOperations and useDraftConnectorConfigurationFromOpenApi,
    tracking link/path/method and forwarding the raw draft outcome with no readiness or gating logic today.
  seen_at: frontend/app/src/hooks/use-connector-configuration-helper.ts
- statement: use-draft-connector-configuration-from-openapi.ts declares the current ConnectorConfigurationDraft
    frontend type and a pickConnectorConfigurationDraftFields allow-list that strips any response field
    not in that list.
  seen_at: frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
- statement: connector-configuration-draft-disclosure.ts is a pure service turning the mutation outcome
    into a none/pending/drafted/refused disclosure state, including an UNRESOLVED_REASON_LABEL dictionary.
  seen_at: frontend/app/src/services/connector-configuration-draft-disclosure.ts
- statement: connector-configuration-helper-fields.tsx renders the link input, operation Select, Request
    Draft button, the raw drafted JSON in a <pre> with an Apply button, and Unresolved/Generated credentials/Method
    mismatch sections, all copy in English.
  seen_at: frontend/app/src/routes/connector-configuration-helper-fields.tsx
- statement: connector-configuration-form-fields.tsx owns the Configuration textarea, the helper mount,
    the Apply-over-unsaved-edit confirmation dialog (a plain description, no diff), and the Save button
    disabled only by isSubmitting/isValid/isDirty, with no readiness gate or disabled-reason text.
  seen_at: frontend/app/src/routes/connector-configuration-form-fields.tsx
- statement: use-capabilities.ts is a ready-made, connector-filterable list of Capability (including raw
    output_schema string) already consumed by use-test-connector-panel.ts.
  seen_at: frontend/app/src/hooks/use-capabilities.ts
- statement: The one pt-BR precedent anywhere under frontend/app/src is a static helper paragraph beside
    the Output schema field; no i18n framework, catalog file, or message dictionary exists anywhere --
    every other UI string in this area is an inline English literal.
  seen_at: frontend/app/src/routes/capability-form-fields.tsx
- statement: json-textarea-field.tsx is the shared Beautify/parse/validate textarea used by both Configuration
    and capability input/output schema fields, exposing getJsonTextareaMinifiedValue reused for save payloads.
  seen_at: frontend/app/src/shared/components/json-textarea-field.tsx
- statement: isPlainRecord (shared/services/plain-record.ts) is the shared narrowing helper already used
    by both draft and operations hooks for parsing ApiError.details.
  seen_at: frontend/app/src/shared/services/plain-record.ts
must_not_duplicate:
- what: The connector-filterable Capability list (including output_schema), already read for the detail
    screen's test panel.
  at: frontend/app/src/hooks/use-capabilities.ts
- what: The plain-object narrowing guard used for ApiError.details parsing.
  at: frontend/app/src/shared/services/plain-record.ts
- what: The shared JSON textarea component (Beautify/parse/validate/minify) already used for both Configuration
    and schema fields.
  at: frontend/app/src/shared/components/json-textarea-field.tsx
risks:
- risk: ConnectorConfigurationDraft's frontend type and its pickConnectorConfigurationDraftFields allow-list
    will silently discard status_readings, response_fields and reading_notes unless both are grown to
    admit them, exactly as the backend's own output_schema-unmatched keys are already silently discarded
    server-side.
  consumers:
  - frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
  - frontend/app/src/routes/connector-configuration-helper-fields.tsx
- risk: UNRESOLVED_REASON_LABEL in connector-configuration-draft-disclosure.ts carries the orphaned reason
    no-matching-input-schema-property, which the scope says does not exist in the current three-value
    enumeration.
  consumers:
  - frontend/app/src/services/connector-configuration-draft-disclosure.ts
  - frontend/app/src/routes/connector-configuration-helper-fields.tsx
- risk: use-connector-configuration-helper.ts has no invalidation of drafted state when link/operation/connector
    change and no gate on an empty connector field; both are new behavior the scope names, not extensions
    of an existing guard.
  consumers:
  - frontend/app/src/hooks/use-connector-configuration-helper.ts
  - frontend/app/src/routes/connector-configuration-form-fields.tsx
- risk: No i18n framework or message-catalog module exists anywhere in this codebase; a pt-BR message
    catalog is new infrastructure for the project, not a continuation of an existing convention.
  consumers:
  - frontend/app/src/routes/connector-configuration-helper-fields.tsx
  - frontend/app/src/routes/connector-configuration-form-fields.tsx
---

## What it is
The Configuration Helper is a sub-panel mounted inside ConnectorConfigurationFormFields, reused by both the create screen and the detail-screen's ready view.
use-connector-configuration-helper.ts composes useOpenApiDocumentOperations and useDraftConnectorConfigurationFromOpenApi, tracking link/path/method and forwarding the raw draft outcome with no readiness or gating logic today.
use-draft-connector-configuration-from-openapi.ts declares the current ConnectorConfigurationDraft frontend type and a pickConnectorConfigurationDraftFields allow-list that strips any response field not in that list -- the exact place the three new backend fields are currently dropped.
connector-configuration-draft-disclosure.ts is a pure service turning the mutation outcome into a none/pending/drafted/refused disclosure state, including an UNRESOLVED_REASON_LABEL dictionary that already contains the orphaned reason no-matching-input-schema-property the scope calls out for removal.
connector-configuration-helper-fields.tsx renders the link input, operation Select, Request Draft button, the raw drafted JSON in a pre with an Apply button, and the Unresolved/Generated credentials/Method mismatch sections -- all current copy is English.
connector-configuration-form-fields.tsx owns the Configuration textarea, the helper mount, the Apply-over-unsaved-edit confirmation dialog (a plain description, no diff yet), and the Save button, disabled only by isSubmitting/isValid/isDirty, with no readiness gate or disabled-reason text yet.
use-capabilities.ts is a ready-made, connector-filterable list of Capability (including raw output_schema string) already consumed by use-test-connector-panel.ts.
The one pt-BR precedent found anywhere under frontend/app/src is a static helper paragraph beside the Output schema field in capability-form-fields.tsx; no i18n framework, catalog file, or message dictionary exists -- every other UI string in this area is an inline English literal.
json-textarea-field.tsx is the shared Beautify/parse/validate textarea used by both Configuration and (in capability forms) input/output schema fields; it exposes getJsonTextareaMinifiedValue reused by use-connector-configuration-form.ts for the save payload.

## Notes
No readiness-panel, gate, or disclosure-table component exists anywhere in this area today -- the whole readiness panel, the status/response tables, and the pt-BR message catalog are new surface, not refactors of existing UI.
ConnectorConfigurationDraft's frontend type and its pickConnectorConfigurationDraftFields allow-list must both grow to admit status_readings, response_fields and reading_notes, or the new backend fields are silently discarded exactly as output_schema-unmatched keys are already silently discarded server-side.
UNRESOLVED_REASON_LABEL in connector-configuration-draft-disclosure.ts carries no-matching-input-schema-property, which the scope explicitly says does not exist in the current enumeration and should be removed as part of this change.
The Apply confirmation dialog currently shows only a fixed description string; the scope's per-key diff has no existing implementation or pure-diff service to build on -- it is new.
use-connector-configuration-helper.ts has no invalidation of drafted state when link/operation/connector change and no gate on an empty connector field -- both are named in the scope as new behavior for this hook.
None of the reviewed files import or reference any i18n/translation library -- a pt-BR catalog as the scope describes has no existing module to extend; it would be a new convention for this codebase, not continuation of one.
isPlainRecord (shared/services/plain-record.ts) is already the shared narrowing helper used by both the draft and operations hooks for parsing ApiError.details; any new disclosure-parsing code should reuse it rather than re-implement a record check.
