---
title: Thread the registered configuration into the connector Test Panel
summary: ConnectorConfigurationDetailReadyView passes the connector's registered configuration
  text to ConnectorTestPanel, instead of the edit form's live, unsaved textarea state.
sources:
- intake/scope.md
objective: The connector Test Panel's Add attribute reconciliation always derives attribute rows
  from the connector's currently registered configuration, never from unsaved edits in the
  Configuration textarea.
criteria:
- useConnectorConfigurationDetailView's "ready" phase state exposes a field carrying the most
  recently loaded-or-saved configuration text (the same text configurationBaselineRef already
  snapshots for Discard), distinct from configuration.value.
- ConnectorConfigurationDetailReadyView passes that new field, not state.configuration.value, as
  ConnectorTestPanel's own configurationText prop.
- Editing the Configuration textarea without saving, then clicking "Add attribute", reconciles
  the panel's attribute rows against the connector's last registered configuration text, not the
  unsaved edit.
- Saving a configuration edit, then clicking "Add attribute", reconciles the panel's attribute
  rows against the just-saved (now registered) configuration text.
- useTestConnectorPanel's own reconciliation logic (onAddAttribute, reconcileAttributeRows) is
  unchanged.
- The full suite passes.
implements:
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- domain/integration/connector-configuration
---

## What it is
Corrective increment fixing a wrong behavior in already-delivered code: ConnectorConfigurationDetailReadyView threads the connector-configuration edit form's own live, unsaved configuration text into ConnectorTestPanel, so Add attribute reconciles against a draft rather than against what is actually registered under the connector's name.
The fix exposes useConnectorConfigurationDetailView's own existing configurationBaselineRef (already snapshotting the most recently loaded-or-saved configuration text for Discard) as a new field on its "ready" phase, and has ConnectorConfigurationDetailReadyView pass that field to ConnectorTestPanel instead.

## Notes
UNDERDETERMINED, from the specification -- criterion 1 pins the new field to "the most recently loaded-or-saved configuration text", a client-held snapshot re-seeded only at load and at save, and criteria 3 and 4 reconcile against that snapshot rather than against a fresh read taken at the moment "Add attribute" is clicked. rules/integration/a-connector-configuration-is-tested-through-a-registered-capability states the configuration a test exercises is read "at the moment of the test", so every criterion here is met by an implementation that never refreshes the snapshot against a configuration another operator or session registered in the meantime.
Passes: a panel whose "ready" state field is set only at initial load and at save, reconciling attribute rows against that text indefinitely after the configuration registered under the same connector name has been replaced by another operator or session -- producing rows, and a submitted test subject, carrying an attribute the currently registered configuration's placeholders do not name.
REMAINDER, from the specification -- three clauses of rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement reach no criterion here: testing only through a specific, already-registered capability naming it as its connector; the HTTP 404 CapabilityNotRegisteredForTestError refusal; and the HTTP 409 CapabilityConnectorMismatchError refusal. This task changes only which text feeds the panel's attribute-row reconciliation before dispatch.
Belongs: the backend connector-diagnostics act that owns the capability lookup and both test-action refusals.
REMAINDER, from the specification -- the subject clause of rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement (one attribute-value per distinct attribute the placeholders name, each name read from those placeholders rather than stated by the operator) is not answered by this task's criteria: criterion 5 holds onAddAttribute and reconcileAttributeRows unchanged, so the derivation itself is out of scope here and only the text it derives from moves.
Belongs: the already-delivered connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows task, whose behavior criterion 5 of this task holds unchanged.
