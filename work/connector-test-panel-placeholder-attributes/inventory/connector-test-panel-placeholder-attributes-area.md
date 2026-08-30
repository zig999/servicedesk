---
title: Connector test panel and subject-placeholder parsing
summary: The connector test panel's "Add attribute" button, its hook, the Configuration
  text it must read, and the subject-placeholder parsing logic already proven correct
  elsewhere in the simulation feature.
area:
- frontend/app/src/routes
- frontend/app/src/hooks
- frontend/app/src/services
- frontend/app/src/shared
modules:
- name: connector-test-panel-fields
  path: frontend/app/src/routes/connector-test-panel-fields.tsx
  role: touched
- name: use-test-connector-panel
  path: frontend/app/src/hooks/use-test-connector-panel.ts
  role: touched
- name: connector-test-panel
  path: frontend/app/src/routes/connector-test-panel.tsx
  role: touched
- name: connector-configuration-detail-ready-view
  path: frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
  role: touched
- name: use-connector-configuration-detail
  path: frontend/app/src/hooks/use-connector-configuration-detail.ts
  role: depends-on
- name: simulation-subject-derivation
  path: frontend/app/src/services/simulation-subject-derivation.ts
  role: depends-on
- name: use-simulation-subject
  path: frontend/app/src/hooks/use-simulation-subject.ts
  role: adjacent
- name: connector-configuration-form-dialog
  path: frontend/app/src/routes/connector-configuration-form-dialog.tsx
  role: adjacent
- name: use-connector-configuration-form
  path: frontend/app/src/hooks/use-connector-configuration-form.ts
  role: adjacent
- name: shared-components
  path: frontend/app/src/shared/components
  role: adjacent
conventions:
- statement: A test/debug panel's presentation component reads only what its own hook
    returns (ARC-02/ARC-03); every value and handler comes from useTestConnectorPanel,
    never derived in the component itself.
  seen_at: frontend/app/src/routes/connector-test-panel-fields.tsx
- statement: A row list that needs stable React keys carries a locally generated `id`
    that never leaves the hook and is never sent over the wire; only `attribute`/`value`
    reach the request body.
  seen_at: frontend/app/src/hooks/use-test-connector-panel.ts
- statement: A pure derivation/parsing module holds no React state and is composed
    by a hook separately, so the walk can be read and tested without a render lifecycle.
  seen_at: frontend/app/src/services/simulation-subject-derivation.ts
- statement: The subject-placeholder token grammar (regex /\$\{([^}]+)\}/g, kind split
    at the first ':', only a 'subject' kind names a required field) is mirrored exactly
    from the backend's connector-request-resolver.ts, confirmed by reading that file
    rather than re-derived.
  seen_at: frontend/app/src/services/simulation-subject-derivation.ts
- statement: Configuration text that fails to parse as JSON (or does not parse as
    a plain object) is read defensively as embedding no placeholders, never thrown
    -- one connector's malformed text should not fail a derivation for every other
    connector.
  seen_at: frontend/app/src/services/simulation-subject-derivation.ts (subjectPlaceholderNamesInConfiguration)
- statement: A shared derivation/parsing module used by more than one feature composes
    registry hooks (useCapabilities, useConnectorConfigurations) rather than re-deriving
    either read -- an established must_not_duplicate convention this codebase already
    names explicitly.
  seen_at: frontend/app/src/hooks/use-simulation-subject.ts
- statement: frontend/app/src/shared/ holds only a components/ subdirectory today;
    no shared/services/ exists yet -- a module placed there would be new territory,
    not an existing one.
  seen_at: frontend/app/src/shared
must_not_duplicate:
- what: 'The subject-placeholder parsing primitives: the placeholder regex, the kind/argument
    split at the first '':'', the filter keeping only kind === "subject", and the
    whole-configuration walk across address/query/headers/body (subjectAttributeNameOf,
    subjectPlaceholderNamesInString/StringRecord/Value, subjectPlaceholderNamesInConfiguration)
    -- already confirmed identical to the backend''s own connector-request-resolver.ts.'
  at: frontend/app/src/services/simulation-subject-derivation.ts
- what: The locally-generated, stable row-id pattern for keying an editable attribute-value
    row list (id never sent over the wire, only attribute/value are).
  at: frontend/app/src/hooks/use-test-connector-panel.ts (onAddAttribute) and frontend/app/src/hooks/use-simulation-subject.ts
    (onAddAttribute)
risks:
- risk: Changing useTestConnectorPanel's onAddAttribute from "append one empty row"
    to "reconcile rows against Configuration's own current placeholders" changes TestConnectorPanelState's
    observable click behavior that existing specs assert (a single click currently
    appends exactly one empty attribute/value row, nothing more).
  consumers:
  - frontend/app/src/routes/connector-test-panel-subject-and-attributes.spec.ts
  - frontend/app/src/routes/connector-test-panel.test-support.ts (fillTestPanelBasics
    clicks "Add attribute" expecting exactly one new empty row)
  - frontend/app/src/routes/connector-test-panel-capability-picker.spec.ts
  - frontend/app/src/routes/connector-test-panel-dispatch-safety.spec.ts
  - frontend/app/src/routes/connector-test-panel-request-response.spec.ts
- risk: Extracting the placeholder-parsing primitives out of simulation-subject-derivation.ts
    into a new shared module changes that file's own exports and internals.
  consumers:
  - frontend/app/src/hooks/use-simulation-subject.ts (the only import consumer of
    simulation-subject-derivation.ts's deriveRequiredFields)
  - frontend/app/src/services/simulation-subject-derivation.spec.ts
  - frontend/app/src/hooks/use-simulation-subject.spec.ts
- risk: Adding a new (required) configurationText prop/argument to ConnectorTestPanel
    and useTestConnectorPanel changes both signatures, and connector-configuration-form-dialog.tsx
    still constructs <ConnectorTestPanel connector={...} /> with no configuration
    text available in its edit-mode branch -- unreachable from production navigation
    today (connector-configurations-screen.tsx only ever opens that dialog in create
    mode) but still type-checked and still compiled.
  consumers:
  - frontend/app/src/routes/connector-configuration-form-dialog.tsx
  - frontend/app/src/routes/connector-configuration-detail-ready-view.tsx (the one
    production call site; has state.configuration.value available to route through)
- risk: connector-test-panel.test-support.ts's mountTestPanelInEditMode and fillTestPanelBasics
    helpers hard-code the current manual "Add attribute" semantics and mount the panel
    through the routed detail screen only (not the form dialog); every spec importing
    them would observe stale fixtures if the reconciliation behavior lands without
    updating this shared support module.
  consumers:
  - frontend/app/src/routes/connector-test-panel-capability-picker.spec.ts
  - frontend/app/src/routes/connector-test-panel-dispatch-safety.spec.ts
  - frontend/app/src/routes/connector-test-panel-request-response.spec.ts
  - frontend/app/src/routes/connector-test-panel-subject-and-attributes.spec.ts
sources:
- intake/scope.md
---

## What it is
The territory the connector-test-panel placeholder-attributes scope lands in: the "Add attribute" button and its hook in the connector authoring feature, the Configuration text those must read from the connector-configuration detail route, and the subject-placeholder parsing logic already built and proven for the unrelated case-simulation feature.
ConnectorTestPanel (connector-test-panel.tsx) composes useTestConnectorPanel(connector) and renders ConnectorTestPanelFields, which owns the "Add attribute"/"Remove attribute" buttons and the attribute/value row inputs; today onAddAttribute only appends one empty row, with no read of Configuration's own text at all.
ConnectorConfigurationDetailReadyView is the one production call site that both holds the live Configuration text (state.configuration.value, sourced from useConnectorConfigurationDetail's own configurationValue state) and renders ConnectorTestPanel -- today only passing connector, not that text.
ConnectorConfigurationFormDialog also renders ConnectorTestPanel in an edit-mode branch that is unreachable from current production navigation (the list screen only opens that dialog in create mode since the routed detail screen replaced its edit path), but the branch still compiles and would need a configurationText source too, or a deliberate decision about what it passes.
simulation-subject-derivation.ts already implements, and use-simulation-subject.spec.ts and its own spec already prove, exactly the placeholder-parsing walk this scope needs (subject-kind filter, requester/credential exclusion, dedup, whole-configuration walk across address/query/headers/body, defensive empty read on invalid JSON) -- mirrored from the backend's connector-request-resolver.ts and confirmed identical against it; use-simulation-subject.ts is its one existing consumer.
No frontend/app/src/shared/services/ directory exists yet; a shared placeholder-parsing module the scope proposes there is new territory, not an existing one.

## Notes
The scope's own "Contexto técnico já levantado" section already states most of this survey's findings (the extraction recommendation, the missing configurationText prop route, that this is not a new business fact) -- read here as data confirming what the survey independently found in the files, not as an instruction followed on faith.
connector-test-panel.test-support.ts's own header comment records that ConnectorTestPanel used to mount only inside the form dialog's edit mode and now mounts only through the routed detail screen in every current spec -- worth knowing when deciding whether the form-dialog's own dead edit-mode branch is touched, removed, or left exactly as it is by this change.
None beyond what risks and must_not_duplicate above already state.
