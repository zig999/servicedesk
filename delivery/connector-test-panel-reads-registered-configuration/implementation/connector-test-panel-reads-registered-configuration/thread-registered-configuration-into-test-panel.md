---
title: Thread the registered configuration into the connector Test Panel
summary: useConnectorConfigurationDetailView's "ready" phase now exposes registeredConfigurationText (the
  most recently loaded-or-saved configuration text), and ConnectorConfigurationDetailReadyView passes
  it, not the live unsaved textarea value, as ConnectorTestPanel's configurationText prop.
task: sha256:23a936c5ec779161ad44f90bae67a51901de350ac076cfcc3a9359a367aab334
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-reads-registered-configuration-thread-registered-configuration-into-test-panel-build
files:
- path: src/hooks/use-connector-configuration-detail-view.ts
  effect: the "ready" phase now carries a new readonly field, registeredConfigurationText, holding the
    most recently loaded-or-saved configuration text -- distinct from configuration.value. The internal
    snapshot this and onDiscard both read (configurationBaseline) moved from a useRef to a useState so
    a value read at render time (this new field) reflects a fresh snapshot rather than a ref update an
    effect made without itself scheduling a re-render; onDiscard's own behavior is unchanged, now reading
    the same state instead of a ref.
- path: src/routes/connector-configuration-detail-ready-view.tsx
  effect: ConnectorTestPanel's own configurationText prop is now state.registeredConfigurationText instead
    of state.configuration.value, so Add attribute reconciles the panel's rows against the connector's
    last registered configuration text rather than an unsaved edit in the Configuration textarea.
criteria:
- criterion: useConnectorConfigurationDetailView's "ready" phase state exposes a field carrying the most
    recently loaded-or-saved configuration text (the same text configurationBaselineRef already snapshots
    for Discard), distinct from configuration.value.
  met: true
  how: the "ready" phase's return object now includes registeredConfigurationText, read from the same
    configurationBaseline snapshot onDiscard already used (re-seeded only when isDirty reads false --
    immediately after load and immediately after a successful save), and it is a distinct field from configuration.value
    in the returned type and the returned object alike.
- criterion: ConnectorConfigurationDetailReadyView passes that new field, not state.configuration.value,
    as ConnectorTestPanel's own configurationText prop.
  met: true
  how: configurationText={state.registeredConfigurationText} replaces the prior configurationText={state.configuration.value}.
- criterion: Editing the Configuration textarea without saving, then clicking "Add attribute", reconciles
    the panel's attribute rows against the connector's last registered configuration text, not the unsaved
    edit.
  met: true
  how: editing Configuration sets isDirty to true, which the baseline-snapshot effect gates on (isDirty
    === false) before re-seeding configurationBaseline, so an unsaved edit never updates the snapshot
    -- registeredConfigurationText stays at the last loaded-or-saved text through the edit, and onAddAttribute
    (unchanged) reconciles against exactly that text.
- criterion: Saving a configuration edit, then clicking "Add attribute", reconciles the panel's attribute
    rows against the just-saved (now registered) configuration text.
  met: true
  how: a successful save drives isDirty back to false (the baseline re-seed on the mutation's onSuccess),
    which re-fires the same effect and re-seeds configurationBaseline -- and so registeredConfigurationText
    -- to the just-saved text, before any subsequent "Add attribute" click reads it.
- criterion: useTestConnectorPanel's own reconciliation logic (onAddAttribute, reconcileAttributeRows)
    is unchanged.
  met: true
  how: use-test-connector-panel.ts was not touched by this delivery; it continues to read whatever configurationText
    string it is given, unaware of which field upstream now supplies that string.
- criterion: The full suite passes.
  met: true
  how: 'this delivery''s own change is confined to which already-typed string feeds an existing prop (configurationText:
    string on both sides), so no signature this delivery touches changed shape; confirmed against the
    captured suite run named in this record''s proof.'
nodes:
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  encoded_at:
  - src/hooks/use-connector-configuration-detail-view.ts
  - src/routes/connector-configuration-detail-ready-view.tsx
  how: this rule's own "the configuration the test exercises is the one currently registered under that
    connector name ... never configuration text an operator holds unsaved in an authoring surface" is
    exactly the fact this delivery moves the app's own single reachable Test Panel call site into conformance
    with -- it now supplies registeredConfigurationText (the most recently loaded-or-saved text, re-seeded
    only at load and at a successful save) rather than the live, unsaved configuration.value. As this
    task's own Notes record (UNDERDETERMINED), the rule's own "read at the moment of the test" is met
    by a client-held snapshot never refreshed against a configuration another operator or session may
    have registered meanwhile; the three clauses this task's own Notes name as REMAINDER reach no file
    this delivery touches and are not answered here.
- node: domain/integration/connector-configuration
  how: this delivery states no new fact about this value object -- it is opaque JSON text held by connector
    name, exactly as this node already describes -- and only changes which already-loaded instance of
    that text (the registered one, rather than an unsaved draft) reaches the Test Panel. The node governs
    the work without a fact of its own newly reaching the code.
inferences:
- inferred: the internal configurationBaseline snapshot in use-connector-configuration-detail-view.ts
    moved from a useRef to a useState, rather than reading configurationBaselineRef.current directly for
    the new field.
  from: onDiscard read that snapshot only inside an event handler, where a ref already holds the latest
    write, but the new registeredConfigurationText field is read at render time -- and a ref written inside
    a useEffect does not itself schedule the re-render that would carry a fresh value into that render.
    Using the same state value for both onDiscard and the new field keeps exactly one piece of history-dependent
    memory rather than a second, duplicate mirror of it, the same reasoning this file's own header comment
    already gives for justSaved.
- inferred: the new field is named registeredConfigurationText.
  from: no node or task text states an exact field name; "registered" is the specification's own word
    for this text, and the task's own title ("registered configuration"), rather than an invented term.
preserved:
- useTestConnectorPanel's own onAddAttribute/reconcileAttributeRows reconciliation logic and its parsesAsConfigurationObject
  gate -- untouched, and still reads whichever configurationText string it is given through its own ref.
- useConnectorConfigurationDetailView's onDiscard behavior -- still resets configuration and the disabled
  connector field back to the same snapshot, now read from state instead of a ref, with no change in what
  it resets to or when.
- The justSaved success-acknowledgement behavior -- untouched, and still derived from isSubmitSuccessful's
  own false-to-true transition.
- The loading/load-error phases of both useConnectorConfigurationDetailView and ConnectorConfigurationDetailScreen,
  and ConnectorConfigurationFormFields' own wiring in the ready view -- none of this delivery's changes
  reach those branches.
deferred:
- what: connector-configuration-form-dialog.tsx's own edit-mode ConnectorTestPanel call site still supplies
    configurationText={state.configuration.value} (the live, unsaved text from useConnectorConfigurationForm,
    a different hook with no equivalent "registered" snapshot of its own).
  why: this task's own criteria name only ConnectorConfigurationDetailReadyView, and that file's own header
    comment already documents this edit-mode branch as unreachable from current production navigation
    -- widening this task to also thread a registered-configuration snapshot through useConnectorConfigurationForm
    reaches outside what was cut here.
---

## What it is
useConnectorConfigurationDetailView's "ready" phase now exposes registeredConfigurationText, the most recently loaded-or-saved configuration text, and ConnectorConfigurationDetailReadyView passes it to ConnectorTestPanel instead of the live, unsaved form value.

## Notes
None.
