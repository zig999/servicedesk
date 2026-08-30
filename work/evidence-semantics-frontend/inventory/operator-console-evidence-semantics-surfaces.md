---
title: Operator console where the pinned-evidence-semantics surfaces land
summary: One React SPA under frontend/app/src whose glossary browser, capability form and simulation detail panel already exist and none of whose DTOs yet carry description, per-field semantics or the evidence snapshot.
area:
- frontend/app/src/routes
- frontend/app/src/hooks
- frontend/app/src/services
- frontend/app/src/shared/components
- frontend/app/src/design-system
- frontend/app/package.json
- frontend/app/playwright.config.ts
modules:
- name: glossary-browser-screen
  path: frontend/app/src/routes/glossary-browser-screen.tsx
  role: touched
- name: concept-form
  path: frontend/app/src/hooks/use-concept-form.ts
  role: touched
- name: concept-form-schema
  path: frontend/app/src/services/concept-form-schema.ts
  role: touched
- name: concept-form-fields
  path: frontend/app/src/routes/concept-form-fields.tsx
  role: touched
- name: use-glossary-concepts
  path: frontend/app/src/hooks/use-glossary-concepts.ts
  role: touched
- name: capability-form-fields
  path: frontend/app/src/routes/capability-form-fields.tsx
  role: touched
- name: use-capability-form
  path: frontend/app/src/hooks/use-capability-form.ts
  role: touched
- name: use-capability-detail
  path: frontend/app/src/hooks/use-capability-detail.ts
  role: touched
- name: simulation-detail-evidence-tab
  path: frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
  role: touched
- name: simulation-detail-types
  path: frontend/app/src/routes/case-simulation-detail-types.ts
  role: touched
- name: simulation-cockpit-adapters
  path: frontend/app/src/routes/case-simulation-cockpit-adapters.ts
  role: touched
- name: use-simulate-case
  path: frontend/app/src/hooks/use-simulate-case.ts
  role: touched
- name: use-simulate-hypothesis
  path: frontend/app/src/hooks/use-simulate-hypothesis.ts
  role: touched
- name: api-client
  path: frontend/app/src/services/api-client.ts
  role: depends-on
- name: error-ui-state
  path: frontend/app/src/services/error-ui-state.ts
  role: touched
- name: json-textarea-field
  path: frontend/app/src/shared/components/json-textarea-field.tsx
  role: depends-on
- name: status-table
  path: frontend/app/src/shared/components/status-table.tsx
  role: depends-on
- name: use-concept-options
  path: frontend/app/src/hooks/use-concept-options.ts
  role: adjacent
- name: design-tokens
  path: frontend/app/src/design-system/tokens.css
  role: depends-on
conventions:
- statement: 'Every backend call goes through apiFetch, which turns a non-2xx response''s `{ error: { code, message, details? } }` envelope into a thrown ApiError carrying the backend error class name verbatim in `code`.'
  seen_at: frontend/app/src/services/api-client.ts
- statement: A typed backend refusal reaches the UI through the one central error-code-to-UiErrorState table, which gains one named kind per error class and never wording; wording stays with the consuming screen.
  seen_at: frontend/app/src/services/error-ui-state.ts
- statement: A form's client-side zod schema is this app's own hand-mirrored copy of the backend DTO, with the mirroring and any deliberate stricter-than-wire departure disclosed in the module's header comment.
  seen_at: frontend/app/src/services/concept-form-schema.ts
- statement: A create/edit form is a hook (react-hook-form + zodResolver + useMutation) with a `loading`/`load-error`/`ready` phase union, a create(null)/edit(identity) target, query-key invalidation on success, and a sonner toast on a failure no criterion names.
  seen_at: frontend/app/src/hooks/use-concept-form.ts
- statement: Form field markup lives in its own `*-form-fields.tsx` file apart from the dialog composing it, each label wrapping its control with error text linked via role="alert".
  seen_at: frontend/app/src/routes/capability-form-fields.tsx
- statement: input_schema and output_schema are edited as raw JSON text through the shared JsonTextareaField, tracked as plain component state outside react-hook-form with an isValid flag gating Save, never as zod-validated fields.
  seen_at: frontend/app/src/hooks/use-capability-form.ts
- statement: List screens render loading, typed-error-with-retry and explicit-empty branches over StatusTable, read only a page's `data` array with pagination fields deliberately unread, and render no pagination control.
  seen_at: frontend/app/src/routes/glossary-browser-screen.tsx
- statement: A hook narrows a wire response to exactly the fields its criteria read, under its own query key, and two hooks narrowing the same endpoint to two shapes keep distinct query keys and cross-invalidate on mutation.
  seen_at: frontend/app/src/hooks/use-glossary-concepts.ts
- statement: Simulation wire types (snake_case, e.g. `capability_name`, `elapsed_ms`) live in the simulate hooks and are camelCase-normalized into the Detail region's own render types by adapter functions, never read raw by components.
  seen_at: frontend/app/src/routes/case-simulation-cockpit-adapters.ts
- statement: A field added after fixtures existed is declared optional with the absent reading stated at the read site, so legacy fixtures and records degrade honestly rather than fail.
  seen_at: frontend/app/src/routes/case-simulation-detail-types.ts
- statement: Status-like values render through a token-colored dot with the color choice disclosed as inference, keyed to the semantic tokens in tokens.css.
  seen_at: frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
- statement: Tests are vitest + @testing-library/react `.spec.ts` files beside the module, one file per concern, often with a sibling `.test-support.ts` fixture module; playwright + @axe-core/playwright is configured against an `e2e/` dir that currently holds no tests.
  seen_at: frontend/app/src/routes/case-simulation-detail-evidence-tab.spec.ts
- statement: Every module opens with a header comment naming the task it delivers, the specification nodes it narrows, and each disclosed inference.
  seen_at: frontend/app/src/hooks/use-simulate-case.ts
must_not_duplicate:
- what: The typed fetch wrapper and ApiError envelope parsing — the one non-2xx-to-typed-error path.
  at: frontend/app/src/services/api-client.ts
- what: The central ApiError-code-to-UI-state table, where a new 422 class such as ConceptDescriptionRequiredError gets its named kind.
  at: frontend/app/src/services/error-ui-state.ts
- what: The shared JSON textarea with beautify/minify/inline-error and its exported getJsonTextareaMinifiedValue — the home for any output_schema per-field guidance.
  at: frontend/app/src/shared/components/json-textarea-field.tsx
- what: The shared StatusTable, which already renders a React element in a cell for row actions and would render a legacy-concept marker the same way.
  at: frontend/app/src/shared/components/status-table.tsx
- what: The existing concept form hook, schema and fields — description is one more field on this form, not a second form.
  at: frontend/app/src/hooks/use-concept-form.ts
- what: The toDetailEvidence adapter and SimulationEvidenceItem type — the snapshot fields extend these, not a parallel evidence pipeline.
  at: frontend/app/src/routes/case-simulation-cockpit-adapters.ts
- what: The observation pretty-print-with-fallback pattern already rendering raw evidence data collapsibly.
  at: frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
risks:
- risk: GET /v1/glossary/concepts is narrowed twice under two query keys (concepts-with-ttl and concepts); adding `description` to one shape without deciding the other leaves the two cache entries disagreeing about the concept shape.
  consumers:
  - frontend/app/src/hooks/use-glossary-concepts.ts
  - frontend/app/src/hooks/use-concept-options.ts
  - frontend/app/src/hooks/use-hypothesis-revision-form.ts
- risk: use-concept-form's onError currently assumes register-concept throws no domain error and shows only a generic toast; once the backend returns 422 ConceptDescriptionRequiredError that assumption is false and the refusal would be swallowed as a generic failure.
  consumers:
  - frontend/app/src/hooks/use-concept-form.ts
  - frontend/app/src/routes/concept-form-dialog.tsx
- risk: Widening SimulateEvidenceItem or SimulationEvidenceItem ripples through the adapter, the evidence tab and every fixture-driven spec that constructs these shapes; a required (rather than optional) snapshot field breaks existing fixtures and legacy responses.
  consumers:
  - frontend/app/src/routes/case-simulation-cockpit-adapters.ts
  - frontend/app/src/routes/case-simulation-detail-evidence-tab.tsx
  - frontend/app/src/routes/case-simulation-detail-panel.tsx
  - frontend/app/src/hooks/use-simulate-case.ts
  - frontend/app/src/hooks/use-simulate-hypothesis.ts
- risk: JsonTextareaField is shared by four consumers (capability input/output schemas, connector configuration, test-connector sample input); building output_schema field guidance into the control itself instead of the capability form changes surfaces the other consumers own.
  consumers:
  - frontend/app/src/routes/capability-form-fields.tsx
  - frontend/app/src/routes/connector-configuration-form-fields.tsx
  - frontend/app/src/hooks/use-test-connector-panel.ts
- risk: The capability form is composed twice — the browser dialog (use-capability-form) and the routed detail screen (use-capability-detail / capability-detail-ready-view) — so output_schema guidance added to only one leaves the other editing the same field without it.
  consumers:
  - frontend/app/src/routes/capability-form-dialog.tsx
  - frontend/app/src/routes/capability-detail-screen.tsx
sources:
- intake/scope.md
- intake/material.md
---

## What it is
One React 19 + Vite single-page operator console under frontend/app/src, organized as routes (screens), hooks (queries, mutations, form state), services (api client, zod form schemas, error mapping) and shared components.
All three scope surfaces already exist as delivered screens: the glossary browser's Concepts tab with a create/edit concept dialog, the capability form in both a dialog and a routed detail screen, and the simulation cockpit's detail panel with an Evidence tab.
No DTO in the tree yet carries the new facts: GlossaryConcept holds only name/accepts/ttl, the concept form submits only accepts and ttl, capabilityFormSchema omits both JSON schemas from zod, and the evidence wire types carry no `fields` or `concept_description`.
The three surfaces share one api client, one error-state table, one design-token vocabulary and one testing convention, so they are one territory rather than three.

## Notes
The error-ui-state table's UiErrorState was deliberately shaped as an object "so a later task can grow a state with data (e.g. which field a 422 named)" — the 422 surfacing this scope needs is the case that comment anticipated.
The simulation detail Evidence tab skips a collected concept with no matching evidence entry rather than rendering a placeholder, which is the existing degradation precedent the snapshot's legacy tolerance will sit next to.
The `stale?: boolean` field on SimulationEvaluation is the tree's one worked example of adding an optional field that legacy fixtures lack, with the absent reading documented at the read site.
The playwright a11y suite is configured (`testDir: "./e2e"`, @axe-core/playwright installed) but the e2e directory does not exist yet; `test:a11y` passes with no tests.
Wire evidence types are duplicated between use-simulate-case.ts (SimulateEvidenceItem) and use-simulate-hypothesis.ts (Evidence); a snapshot field added to one and not the other splits the two simulate paths.
