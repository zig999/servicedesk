---
title: Case simulation subject derivation and composition
summary: The cluster of frontend modules that derive, hold, and render the simulation cockpit's Subject
  region -- the exact area the scope moves from connector-placeholder scanning to the authoritative input-requirements
  read.
sources:
- work/case-simulation-input-requirements/intake/scope.md
area:
- frontend/app/src/routes/case-simulation-screen.tsx
- frontend/app/src/routes/case-simulation-ready-view.tsx
- frontend/app/src/routes/case-simulation-subject-panel.tsx
- frontend/app/src/services/simulation-subject-derivation.ts
- frontend/app/src/services/case-version-record.ts
- frontend/app/src/services/api-client.ts
- frontend/app/src/hooks/use-simulation-subject.ts
- frontend/app/src/hooks/use-case-simulation-cockpit.ts
- frontend/app/src/hooks/use-capabilities.ts
- frontend/app/src/hooks/use-connector-configurations.ts
- frontend/app/src/hooks/use-test-connector-panel.ts
- frontend/app/src/hooks/use-glossary-vocabulary.ts
- frontend/app/src/shared/services/connector-placeholder-token.ts
- frontend/app/src/shared/services/plain-record.ts
modules:
- name: simulation-subject-derivation
  path: frontend/app/src/services/simulation-subject-derivation.ts
  role: touched
- name: use-simulation-subject
  path: frontend/app/src/hooks/use-simulation-subject.ts
  role: touched
- name: case-simulation-subject-panel
  path: frontend/app/src/routes/case-simulation-subject-panel.tsx
  role: touched
- name: use-case-simulation-cockpit
  path: frontend/app/src/hooks/use-case-simulation-cockpit.ts
  role: depends-on
- name: use-capabilities
  path: frontend/app/src/hooks/use-capabilities.ts
  role: depends-on
- name: use-connector-configurations
  path: frontend/app/src/hooks/use-connector-configurations.ts
  role: depends-on
- name: use-test-connector-panel
  path: frontend/app/src/hooks/use-test-connector-panel.ts
  role: depends-on
- name: use-glossary-vocabulary
  path: frontend/app/src/hooks/use-glossary-vocabulary.ts
  role: depends-on
- name: api-client
  path: frontend/app/src/services/api-client.ts
  role: depends-on
- name: case-version-record
  path: frontend/app/src/services/case-version-record.ts
  role: depends-on
- name: connector-placeholder-token
  path: frontend/app/src/shared/services/connector-placeholder-token.ts
  role: adjacent
- name: plain-record
  path: frontend/app/src/shared/services/plain-record.ts
  role: adjacent
conventions:
- statement: A new read-only registry/list hook is built as apiFetch<PageType>, a query key naming the
    resource, reading only the fields the caller needs from the page's `data` array, and returning {list-field,
    isLoading, isError, refetch} with refetch already wrapped void-returning.
  seen_at: frontend/app/src/hooks/use-capabilities.ts:59-73
- statement: The same list-hook shape is followed exactly by its sibling, down to the wrapped refetch.
  seen_at: frontend/app/src/hooks/use-connector-configurations.ts:49-63
- statement: A cross-registry reference is carried by bare identity -- name and version only -- never
    the referenced entity's whole registration, both on the wire and in the frontend types that read it.
  seen_at: src/src/http/dto/case-input-requirements.dto.ts:38-49
- statement: An assembled-subject/one-shot-dispatch hook holds its editable values as plain component
    state (useState), not react-hook-form, because the assembled value is never itself a stored, validated
    resource.
  seen_at: frontend/app/src/hooks/use-simulation-subject.ts:144-147
- statement: A presentational region component takes its owning hook's whole returned state as one `state`
    prop and recomputes nothing itself.
  seen_at: frontend/app/src/routes/case-simulation-subject-panel.tsx:95-97
- statement: A curator-added attribute row's name is chosen from useGlossaryVocabularyOptions("subject-attribute")
    through a Select, never typed free text, where the governing criterion requires a glossary-drawn name.
  seen_at: frontend/app/src/routes/case-simulation-subject-panel.tsx:63-70,192-196
- statement: A hook composing more than one registry read is the one place that walk happens; callers
    never re-derive a registry read it already composes.
  seen_at: frontend/app/src/hooks/use-simulation-subject.ts:118-142
must_not_duplicate:
- what: The read-only registry list-hook shape (apiFetch<PageType>, queryKey, `data`-only read, {list-field,
    isLoading, isError, refetch}) any new endpoint-reading hook (e.g. for GET /v1/cases/{slug}/versions/{version}/input-requirements)
    must follow rather than inventing a new fetch/react-query shape.
  at: frontend/app/src/hooks/use-capabilities.ts
- what: useCapabilities(), the one existing read of the capability registry -- the {name, version} cross-reference
    the scope's item 4 asks for resolves against this hook's already-composed capabilities, never a second,
    ad hoc capability fetch.
  at: frontend/app/src/hooks/use-capabilities.ts
- what: The SubjectAttributeRow/SubjectAttributeValue pair type (attribute, value, and a locally generated
    `id` for stable keying) that use-simulation-subject.ts's curator-added rows already reuse rather than
    redeclare.
  at: frontend/app/src/hooks/use-test-connector-panel.ts:55-71
- what: useGlossaryVocabularyOptions, the one hook that reads a glossary vocabulary's options, already
    composed directly inside case-simulation-subject-panel.tsx for both the subject-type and subject-attribute
    vocabularies.
  at: frontend/app/src/hooks/use-glossary-vocabulary.ts
risks:
- risk: useSimulationSubject's returned shape (requiredFields, isReady, subject, isLoadingRegistries,
    isRegistriesError) is read directly by the cockpit's dispatch gate and by both the full-case and per-hypothesis
    simulate calls; replacing the placeholder-scan derivation with the input-requirements read changes
    what populates requiredFields/isReady and must keep that returned shape intact or update every reader
    in step.
  consumers:
  - frontend/app/src/hooks/use-case-simulation-cockpit.ts
  - frontend/app/src/routes/case-simulation-subject-panel.tsx
- risk: use-simulation-subject.ts currently composes useConnectorConfigurations() (and useCapabilities())
    to derive required fields by scanning connector configuration text; if the new endpoint hook replaces
    that scan, dropping the useConnectorConfigurations() composition changes this hook's isLoadingRegistries/isRegistriesError
    semantics, which the Subject panel's loading/error branches read verbatim.
  consumers:
  - frontend/app/src/routes/case-simulation-subject-panel.tsx
- risk: deriveRequiredFields, collectionPlanFromManifest and the placeholder-scanning functions in simulation-subject-derivation.ts
    are this hook's only current call site; removing or bypassing them without deleting them leaves dead
    exports a later reviewer could mistake for still-authoritative, and simulation-subject-derivation.ts's
    own header comment documents the placeholder mechanism as the derivation's basis -- a stale comment
    would misstate how the field set is now derived.
  consumers:
  - frontend/app/src/hooks/use-simulation-subject.ts
- risk: The "+ATTRIBUTE" control's Select already reads its full option list from useGlossaryVocabularyOptions("subject-attribute")
    with no existing exclusion of attributes already present in the derived set; adding the scope's exclusion
    (item 6) changes what that Select offers without changing the vocabulary hook itself, so the filtering
    must sit in the panel or a state layer, not in use-glossary-vocabulary.ts (which other screens use
    unfiltered).
  consumers:
  - frontend/app/src/routes/case-simulation-subject-panel.tsx
---

## What it is
The Subject region of the case-simulation cockpit: a service module deriving required subject fields, a hook holding and merging derived-plus-curator-added attribute state, and a presentational panel rendering both, one subject shared by the cockpit's full-case and per-hypothesis dispatches.
Today this derivation scans registered connector configuration text for `${subject:<name>}` placeholders, cross-referencing the collection plan against useCapabilities() and useConnectorConfigurations(); the scope replaces that scan with a direct read of GET /v1/cases/{slug}/versions/{version}/input-requirements, which already returns each requirement's own `required` flag and the capabilities asking for it, plus any capability whose input schema is malformed.
No hook or DTO for that endpoint exists yet in this frontend; the established convention for a new registry-reading hook is the apiFetch<PageType>/query-key/`data`-only-read/{list-field, isLoading, isError, refetch} shape use-capabilities.ts and use-connector-configurations.ts already both follow.
The response names each capability only by {name, version}, mirroring domain/knowledge/case-input-requirement's own restraint against restating a full registration, so resolving `connector` and the `input_schema` hint means cross-referencing that identity against useCapabilities()'s already-composed list, exactly as the scope's item 4 states.

## Notes
The panel's curator-added-attribute row already draws its attribute name from the glossary's subject-attribute vocabulary through a Select, not free text, which is the same control the scope's item 6 exclusion must filter rather than replace.
useSimulationSubject is composed exactly once, by the cockpit hook, and its returned isReady/subject/requiredFields are load-bearing for both dispatch paths -- any change to what counts as "required" (scope item 3: only a requirement's own `required` flag blocks, never mere presence) has to be threaded through that one shared return value.
The shared/services/connector-placeholder-token.ts and shared/services/plain-record.ts modules the current derivation imports are also consumed elsewhere (use-test-connector-panel.ts, and a not-yet-written connector-authoring test panel per simulation-subject-derivation.ts's own header comment), so removing this module's own usage does not orphan them -- they stay in place for their other consumers.
