---
title: connector-capability-detail-editing-frontend, first review
summary: 'What four passes found over the frontend half of the connector-capability-detail-editing initiative:
  pretty-print-on-load, the two detail hooks, and the two detail routes.'
reviewed:
- src/shared/components/json-textarea-field.tsx
- src/shared/components/json-textarea-field.spec.ts
- src/routes/connector-configurations-screen-form.spec.ts
- src/routes/capabilities-browser-screen-detail.spec.ts
- src/hooks/use-capability-detail.ts
- src/hooks/use-capability-detail.spec.ts
- src/hooks/use-capability-detail-save.spec.ts
- src/hooks/use-capability-detail-load-error.spec.ts
- src/hooks/use-connector-configuration-detail.ts
- src/hooks/use-connector-configuration-detail.spec.ts
- src/hooks/use-capability-detail-view.ts
- src/routes/capability-detail-screen.tsx
- src/routes/capability-detail-ready-view.tsx
- src/routes/capability-form-fields.tsx
- src/routes/capabilities-browser-screen.tsx
- src/routes/route-tree.tsx
- src/routes/route-tree.spec.ts
- src/routes/capability-detail-screen.spec.ts
- src/routes/capability-detail-screen-invalid-schema.spec.ts
- src/routes/capability-detail-screen-save.spec.ts
- src/routes/capability-detail-screen-discard.spec.ts
- src/routes/capabilities-browser-screen-navigation.spec.ts
- src/hooks/use-capability-detail-view.spec.ts
- src/hooks/use-connector-configuration-detail-view.ts
- src/routes/connector-configuration-detail-screen.tsx
- src/routes/connector-configuration-detail-ready-view.tsx
- src/routes/connector-configurations-screen.tsx
- src/routes/connector-configuration-form-fields.tsx
- src/hooks/use-connector-configuration-detail-view.spec.ts
- src/routes/connector-configuration-detail-screen.spec.ts
- src/routes/connector-configuration-detail-screen-save.spec.ts
- src/routes/connector-configuration-detail-screen-discard.spec.ts
- src/routes/connector-configurations-screen-navigation.spec.ts
tasks:
- task/connector-capability-detail-editing/json-textarea-pretty-print-on-load
- task/connector-capability-detail-editing/capability-detail-hook
- task/connector-capability-detail-editing/connector-configuration-detail-hook
- task/connector-capability-detail-editing/capability-detail-route
- task/connector-capability-detail-editing/connector-configuration-detail-route
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run had no failed step to diagnose -- every step of the frontend suite passed
    (77 test files, 538 tests)
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: Given a syntactically valid JSON value, the textarea's displayed text is pretty-printed rather
    than left in the minified form it was passed, immediately on mount.
  state: covered
  tests:
  - file: src/shared/components/json-textarea-field.spec.ts
    name: reports a compact valid JSON value reformatted as pretty-printed text and marked valid immediately
      on mount, before any interaction (criterion 1)
  - file: src/shared/components/json-textarea-field.spec.ts
    name: 'never calls onChange on mount when the loaded value is already in its own pretty-printed form
      (edge case: a value at criterion 1''s own boundary)'
  - file: src/shared/components/json-textarea-field.spec.ts
    name: pretty-prints a second, externally-loaded value too, not only the component's very first render
      (disclosed inference)
- criterion: Given a value that is not valid JSON, the textarea shows the value as-is, so the existing
    inline "Invalid JSON" error behavior is unchanged.
  state: covered
  tests:
  - file: src/shared/components/json-textarea-field.spec.ts
    name: leaves the value exactly as passed and never calls onChange for it, when it is not valid JSON,
      on mount (criterion 2)
  - file: src/shared/components/json-textarea-field.spec.ts
    name: shows an inline error message linked to the control when the current text does not parse as
      JSON
- criterion: The configuration field in the connector-configuration create/edit dialog shows its loaded
    value pretty-printed.
  state: uncovered
  why: The connector-configuration dialog in this delivery is create-only -- its edit path (where a loaded
    value would ever appear) was removed by the sibling task connector-configuration-detail-route, which
    replaced in-dialog editing with the routed screen. connector-configurations-screen-form.spec.ts only
    opens the dialog blank ("New connector configuration") and asserts an empty configuration field; no
    test in the set opens that dialog with a loaded value. The equivalent behavior is exercised only at
    connector-configuration-detail-screen.spec.ts, the routed screen the criterion does not name, not
    the dialog it does.
- criterion: The input_schema and output_schema fields in the capability create/edit dialog show their
    loaded values pretty-printed.
  state: uncovered
  why: The capability dialog in this delivery is create-only -- its edit path was removed by the sibling
    task capability-detail-route, replaced by the routed screen. capabilities-browser-screen-detail.spec.ts
    only opens the dialog blank ("New capability") with every field empty; no test opens that dialog with
    a loaded record. The equivalent behavior is exercised only at capability-detail-screen.spec.ts, the
    routed screen the criterion does not name, not the dialog it does.
- criterion: The hook issues its own GET for the capability identified by both name and version, independent
    of any list screen having already fetched it.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: resolves the ready phase from its own direct GET, not from a capabilities list query the caller's
      cache already held for this same (name, version)
- criterion: The hook exposes a loading | load-error | ready phase union, mirroring use-edit-draft-version-form.ts's
    shape.
  state: partial
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: reports "loading" before the GET resolves, then "ready" once it does
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reports the load-error phase, with a retryLoad function, when the GET fails
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: reports "loading" before the GET resolves, then "ready" once it does
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: reports the load-error phase, with a retryLoad function, when the GET fails
  why: 'The three phases (loading, load-error, ready) are each observed, but nothing in the set checks
    the stated mirroring of use-edit-draft-version-form.ts''s shape -- no test compares this hook''s phase-union
    shape against that reference hook''s. Also: The three phases are each observed, but nothing in the
    set checks the stated mirroring of use-edit-draft-version-form.ts''s shape -- no test compares this
    hook''s phase-union shape against that reference hook''s.'
- criterion: In the ready phase, isDirty is true only when at least one form field, input_schema, or output_schema
    differs from the values most recently loaded or saved.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: is false immediately after load, before any edit
  - file: src/hooks/use-capability-detail.spec.ts
    name: becomes true once the input_schema text is edited to a materially different value
  - file: src/hooks/use-capability-detail.spec.ts
    name: becomes true once the output_schema text is edited to a materially different value
  - file: src/hooks/use-capability-detail.spec.ts
    name: becomes true once a form field is edited away from its loaded value, even while both JSON fields
      stay unchanged -- proving isDirty also reads react-hook-form's own dirty tracking rather than only
      the two schema comparisons
- criterion: Returning every field, including input_schema and output_schema, to its most recently loaded
    or saved value flips isDirty back to false.
  state: partial
  tests:
  - file: src/hooks/use-capability-detail.spec.ts
    name: clears isDirty once the input_schema text is edited back to its exact loaded value
  - file: src/hooks/use-capability-detail.spec.ts
    name: clears isDirty once the output_schema text is edited back to its exact loaded value
  - file: src/hooks/use-capability-detail.spec.ts
    name: clears isDirty once a form field is edited back to its exact loaded value
  why: Only the return-to-the-pre-save-loaded-value half is exercised through onChange. No test edits
    a field again after a successful save and then edits it back to that just-saved value (through onChange,
    as distinct from onDiscard) to confirm isDirty clears against the saved baseline -- the "or saved"
    half of this criterion goes unexercised for this hook.
- criterion: A successful save re-baselines the originally loaded values, including both JSON schema fields,
    to what was just saved, so isDirty is false immediately after a save with no further edits.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-save.spec.ts
    name: clears isDirty right after a successful save, with no further edits
  - file: src/hooks/use-capability-detail-save.spec.ts
    name: re-baselines both JSON fields to the values just submitted, not whatever the PUT response body's
      own schema fields carry
- criterion: A successful save invalidates or updates both the "capabilities" list query and this hook's
    own single-record query so neither screen is left reading stale data.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-save.spec.ts
    name: invalidates both the capabilities list query and its own capability query once the save succeeds
- criterion: The hook reports a load-error phase, with a typed retry action, when the GET fails or the
    identified (name, version) capability does not exist.
  state: covered
  tests:
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reports the load-error phase, with a retryLoad function, when the GET fails
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reports the load-error phase when the identified (name, version) capability does not exist
  - file: src/hooks/use-capability-detail-load-error.spec.ts
    name: reissues the GET when retryLoad is called, resolving to ready once the failure clears
- criterion: The hook issues its own GET for the connector configuration identified by connector, independent
    of any list screen having already fetched it.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: resolves the ready phase from its own direct GET, not from a connector-configurations list query
      the caller's cache already held for this same connector
- criterion: In the ready phase, isDirty is true only when at least one form field or the configuration
    JSON text differs from the values most recently loaded or saved.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: is false immediately after load, before any edit
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: becomes true once the configuration JSON text is edited to a materially different value
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: becomes true once the connector form field is edited away from its loaded value, even while
      the configuration text stays unchanged -- proving isDirty also reads react-hook-form's own dirty
      tracking rather than only the configuration comparison
- criterion: Returning every field, including configuration, to its most recently loaded or saved value
    flips isDirty back to false.
  state: partial
  tests:
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: clears isDirty once the configuration text is edited back to its exact loaded value
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: clears isDirty once the connector form field is edited back to its exact loaded value
  why: Only the return-to-the-pre-save-loaded-value half is exercised through onChange. No test edits
    the configuration again after a successful save and then edits it back to that just-saved value (through
    onChange, as distinct from onDiscard) to confirm isDirty clears against the saved baseline -- the
    "or saved" half goes unexercised for this hook.
- criterion: A successful save re-baselines the originally loaded values, including configuration, to
    what was just saved, so isDirty is false immediately after a save with no further edits.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: clears isDirty right after a successful save, with no further edits
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: keeps the submitted configuration text as the new baseline even when the PUT response answers
      configuration as an object rather than the submitted string
- criterion: A successful save invalidates or updates both the "connector-configurations" list query and
    this hook's own single-record query so neither screen is left reading stale data.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: invalidates both the connector-configurations list query and its own connector-configuration
      query once the save succeeds
- criterion: The hook reports a load-error phase, with a typed retry action, when the GET fails or the
    identified connector configuration does not exist.
  state: covered
  tests:
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: reports the load-error phase, with a retryLoad function, when the GET fails
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: reports the load-error phase when the identified connector configuration does not exist
  - file: src/hooks/use-connector-configuration-detail.spec.ts
    name: reissues the GET when retryLoad is called, resolving to ready once the failure clears
- criterion: Navigating to /capabilities/<name>/<version> for an existing capability shows that capability's
    full record, loaded through the new hook by both name and version.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen.spec.ts
    name: renders the capability's own identity and every declared field, all read from the GET this route's
      own hook issues by both name and version
- criterion: Clicking a row on the capabilities list screen navigates to that capability's /capabilities/<name>/<version>
    route.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-navigation.spec.ts
    name: navigates to /capabilities/<name>/<version>, by both identity fields, when a row is clicked
- criterion: The route offers a control that returns the operator to the capabilities list.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen.spec.ts
    name: navigates back to the capabilities list when Back to capabilities is clicked
  - file: src/routes/capability-detail-screen.spec.ts
    name: 'keeps the same control available when the load fails (edge case: a dependency that fails)'
- criterion: The Save button is disabled until the form, including input_schema and output_schema, differs
    from its originally loaded values, and re-disables once every field is returned to that value.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-save.spec.ts
    name: disables Save immediately after load, before any edit
  - file: src/routes/capability-detail-screen-save.spec.ts
    name: enables Save once input_schema is edited to a materially different value
  - file: src/routes/capability-detail-screen-save.spec.ts
    name: enables Save once output_schema is edited to a materially different value
  - file: src/routes/capability-detail-screen-save.spec.ts
    name: enables Save once a plain form field (Connector) is edited
  - file: src/routes/capability-detail-screen-save.spec.ts
    name: re-disables Save once the edited input_schema is returned to its exact originally loaded value
  - file: src/hooks/use-capability-detail.spec.ts
    name: clears isDirty once the output_schema text is edited back to its exact loaded value
  - file: src/hooks/use-capability-detail.spec.ts
    name: clears isDirty once a form field is edited back to its exact loaded value
- criterion: A discard-changes control resets every field, including both JSON schema fields, back to
    the originally loaded values and re-disables Save.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-discard.spec.ts
    name: disables the Discard control while there is nothing to discard
  - file: src/routes/capability-detail-screen-discard.spec.ts
    name: enables Discard once either schema or a form field is edited, and resets every one of them back
      to its originally loaded value when clicked, re-disabling Save
- criterion: The existing capability-form-fields.tsx markup is reused unchanged inside the new route.
  state: partial
  tests:
  - file: src/routes/capability-detail-screen.spec.ts
    name: renders every field capability-form-dialog.tsx already composes through CapabilityFormFields,
      plus the Save button
  why: This test only checks that fields with matching labels (Name, Version, Nature, Input schema, Output
    schema, Timeout (ms), Concept) and a Save button are present. It cannot distinguish literal reuse
    of capability-form-fields.tsx from an independent reimplementation that happens to render fields with
    matching labels -- nothing in the set imports or otherwise ties the rendered markup back to that specific
    module.
- criterion: A successful save shows a success acknowledgement and the screen visibly reflects the just-saved
    values.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-save.spec.ts
    name: shows an inline success acknowledgement and keeps the screen showing the just-saved values
  - file: src/routes/connector-configuration-detail-screen-save.spec.ts
    name: shows an inline success acknowledgement and keeps the screen showing the just-saved value
- criterion: If the loaded input_schema or output_schema value does not parse as valid JSON, the screen
    shows a plain warning that the stored value is invalid and must be corrected before Save can succeed,
    instead of rendering it silently.
  state: covered
  tests:
  - file: src/routes/capability-detail-screen-invalid-schema.spec.ts
    name: shows a plain warning that the stored input schema is not valid JSON when the loaded value does
      not parse, without hiding the stored value itself
  - file: src/routes/capability-detail-screen-invalid-schema.spec.ts
    name: shows the same plain warning once a valid loaded input_schema is edited into invalid JSON, and
      blocks Save while it stays that way
  - file: src/routes/capability-detail-screen-invalid-schema.spec.ts
    name: shows a plain warning that the stored output schema is not valid JSON when the loaded value
      does not parse, without hiding the stored value itself
  - file: src/routes/capability-detail-screen-invalid-schema.spec.ts
    name: shows the same plain warning once a valid loaded output_schema is edited into invalid JSON,
      and blocks Save while it stays that way
- criterion: Editing an existing capability from the list screen opens the new route instead of the popup
    dialog.
  state: covered
  tests:
  - file: src/routes/capabilities-browser-screen-navigation.spec.ts
    name: offers no separate per-row Edit action that would open the popup dialog
  - file: src/routes/capabilities-browser-screen-navigation.spec.ts
    name: opens no popup dialog when a row is clicked, only the routed navigation
- criterion: Navigating to /connectors/<connector> for an existing connector shows that connector configuration's
    full record, loaded through the new hook.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: renders the connector's own identity and its configuration, both read from the GET this route's
      own hook issues
- criterion: Clicking a row on the connector-configurations list screen navigates to that connector's
    /connectors/<connector> route.
  state: covered
  tests:
  - file: src/routes/connector-configurations-screen-navigation.spec.ts
    name: navigates to /connectors/<connector> when a row is clicked
- criterion: The route offers a control that returns the operator to the connector-configurations list.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: navigates back to the connector-configurations list when Back to connector configurations is
      clicked
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: 'keeps the same control available when the load fails (edge case: a dependency that fails)'
- criterion: The Save button is disabled until the form, including configuration, differs from its originally
    loaded values, and re-disables once every field is returned to that value.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-save.spec.ts
    name: disables Save immediately after load, before any edit
  - file: src/routes/connector-configuration-detail-screen-save.spec.ts
    name: enables Save once the configuration is edited to a materially different value
  - file: src/routes/connector-configuration-detail-screen-save.spec.ts
    name: re-disables Save once the edited configuration is returned to its exact originally loaded value
- criterion: A discard-changes control resets every field, including configuration, back to the originally
    loaded values and re-disables Save.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen-discard.spec.ts
    name: disables the Discard control while there is nothing to discard
  - file: src/routes/connector-configuration-detail-screen-discard.spec.ts
    name: enables Discard once the configuration is edited, and resets the field back to its originally
      loaded value when clicked, re-disabling Save
- criterion: The existing connector-configuration-form-fields.tsx markup and the existing ConnectorTestPanel
    are reused unchanged inside the new route.
  state: partial
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: renders the shared Connector/Configuration/Save fields and mounts the real ConnectorTestPanel,
      which issues its own two independent reads
  why: The ConnectorTestPanel half is strongly exercised -- the test observes the real panel's own two
    independent fetches firing on mount, behavior a stand-in would be unlikely to reproduce. The connector-configuration-form-fields.tsx
    half rests only on matching field labels (Connector, Configuration) and a Save button being present,
    which an independent reimplementation with the same labels would also satisfy -- nothing ties the
    rendered fields back to that specific module.
- criterion: If the loaded configuration value does not parse as valid JSON, the screen shows a plain
    warning that the stored value is invalid and must be corrected before Save can succeed, instead of
    rendering it silently.
  state: covered
  tests:
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: shows a plain warning that the stored configuration is not valid JSON when the loaded value
      does not parse
  - file: src/routes/connector-configuration-detail-screen.spec.ts
    name: shows the same plain warning once a valid loaded configuration is edited into invalid JSON,
      and disables Save while it stays that way
- criterion: Editing an existing connector configuration from the list screen opens the new route instead
    of the popup dialog.
  state: covered
  tests:
  - file: src/routes/connector-configurations-screen-navigation.spec.ts
    name: offers no separate per-row Edit action that would open the popup dialog
  - file: src/routes/connector-configurations-screen-navigation.spec.ts
    name: opens no popup dialog when a row is clicked, only the routed navigation
findings:
- file: src/hooks/use-connector-configuration-detail.ts
  where: lines 168-172, the load effect's configurationValid derivation
  evidence: setConfigurationValid(getJsonTextareaMinifiedValue(query.data.configuration) !== null);
  cost: 'rules/integration/a-connector-configuration-holds-a-well-formed-object states the registry refuses
    a configuration whose text is not syntactically valid JSON OBJECT text -- getJsonTextareaMinifiedValue
    only checks that JSON.parse does not throw, so a value that is syntactically valid JSON but not an
    object (an array, a bare string, a number, true, null) reads configurationValid: true here. That flag
    gates both the invalid-JSON warning and the Save-disable, so an operator can leave a non-object value
    in the field with no warning shown and Save enabled, submit it, and have the registry refuse it for
    a reason this screen never told them about.'
  correction: Derive configurationValid from a check that also rejects a syntactically valid non-object
    JSON value (e.g. typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) on top of
    the existing parse check), so this reads as invalid before the operator ever submits it.
  pass: conformance
- file: src/routes/connector-configuration-detail-ready-view.tsx
  where: lines 24-37, the INVALID_CONFIGURATION_WARNING banner and its citation
  evidence: "const INVALID_CONFIGURATION_WARNING =\n  \"This connector configuration's stored value is\
    \ not valid JSON. Correct it before Save can succeed.\";"
  cost: A header comment names rules/integration/a-connector-configuration-holds-a-well-formed-object
    as what this banner answers to, but the banner is gated on !state.configuration.isValid, which (per
    use-connector-configuration-detail.ts) is only does-not-parse-as-JSON, never is-not-a-JSON-object
    -- the half of the rule that actually distinguishes it from a capability's own schema-validity rule.
    A reader who trusts this citation will believe the banner covers the rule it names when a whole class
    of refusals (non-object JSON) passes through it silently.
  correction: Gate this banner (and Save) on a validity flag that checks the parsed value is a JSON object,
    not merely that it parses, so the citation and the behavior agree.
  pass: conformance
- file: src/routes/capability-detail-ready-view.tsx
  where: lines 83-90, the Discard changes button
  cites: EDG-04
  evidence: "<Button\n  type=\"button\"\n  variant=\"secondary\"\n  onClick={state.onDiscard}\n  disabled={!state.isDirty\
    \ || state.isSubmitting}\n>\n  Discard changes\n</Button>"
  cost: onClick runs state.onDiscard directly -- which resets both JSON schema fields and every react-hook-form
    field back to the last loaded-or-saved values in one call, with nothing between the click and the
    reset. This control sits in the same button row the form's own Save action ends in, so a slightly-off
    click between the two throws away typed-but-unsaved edits with no step to catch it and no way to recover
    them.
  correction: Insert an explicit confirmation step between the click and the call to state.onDiscard,
    or record the departure against this rule with the reasoning for skipping it.
  pass: standard
- file: src/routes/connector-configuration-detail-ready-view.tsx
  where: lines 74-81, the Discard changes button
  cites: EDG-04
  evidence: "<Button\n  type=\"button\"\n  variant=\"secondary\"\n  onClick={state.onDiscard}\n  disabled={!state.isDirty\
    \ || state.isSubmitting}\n>\n  Discard changes\n</Button>"
  cost: 'The same one-click, no-confirmation reset as the capability screen''s own Discard control --
    confirmed directly by this task''s own sibling proof (connector-configuration-detail-screen-discard.spec.ts):
    "shows no confirmation step before discarding". An edited configuration an operator has not yet saved
    is lost on a single click next to the form''s own Save action.'
  correction: Insert an explicit confirmation step between the click and the call to state.onDiscard,
    or record the departure against this rule with the reasoning for skipping it.
  pass: standard
---

## What it is

The first review of the frontend half of connector-capability-detail-editing: five tasks -- pretty-print-on-load, the capability and connector-configuration detail hooks, and the two detail routes -- over four independent passes plus one captured run of the project's own suite.

## Notes

The failures pass did not run: every step of the captured suite passed (install, typecheck, lint, style, build, a11y, secret-scan, test -- 77 test files, 538 tests), so there was no failure to diagnose.
Both uncovered criteria are the same shape: they name the create/edit dialog showing a loaded value pretty-printed, but that dialog's edit path was removed by this same initiative's own route tasks, replacing it with the new routed screens -- the equivalent behavior is proven at the routed screens instead, which the criteria's own wording does not name.
Both specification-conformance findings trace to one gap: the frontend's configurationValid check accepts any syntactically valid JSON, where rules/integration/a-connector-configuration-holds-a-well-formed-object requires a JSON object specifically -- the capability side's own schema-validity rule carries no such object requirement, so the equivalent capability-side code has no matching finding.
Both standard-conformance findings cite the same rule (EDG-04) against the same pattern on both detail screens' Discard control -- a one-click, no-confirmation reset of unsaved edits, deliberately built this way per each route's own disclosed inference that no confirmation step was needed, now read against the standard's own rule for a destructive control.
The trace over the frontend target (frontend/app) was not re-checked in this review beyond what accompanied the last task's own delivery; see the backend review's own Notes for context on the initiative's overall drift picture, which spans both targets.
