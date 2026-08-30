---
title: Route Configuration's text to the test panel's hook
summary: ConnectorConfigurationDetailReadyView's own live Configuration text reaches
  useTestConnectorPanel through a new configurationText prop on ConnectorTestPanel.
rationale: 'The scope names the missing prop route as a technical step the new button
  behavior needs, but leaves whether it stands as its own task or folds into the reconciliation
  change to the decomposition. It is cut separately here because its own outcome is
  independently demonstrable -- the value can be shown reaching the hook before any
  reconciliation logic reads it -- and because it implements no specification node
  of its own: it carries an existing value between components without deciding a new
  fact. Confirmed by the binder across the full, grown candidate set (including the
  newly stated placeholder grammar): the task is exclusively prop/argument plumbing,
  and no candidate''s own clause governs it.'
sources:
- intake/scope.md
objective: useTestConnectorPanel receives the connector configuration's current Configuration
  text as an argument, sourced from the one production view that already holds it
  live.
criteria:
- ConnectorConfigurationDetailReadyView passes its own live state.configuration.value
  text into ConnectorTestPanel through a new configurationText prop.
- ConnectorTestPanel forwards configurationText into useTestConnectorPanel(connector,
  configurationText).
- Every existing caller of useTestConnectorPanel's returned state and handlers continues
  to compile and behave exactly as before, aside from the hook now accepting the new
  argument.
- connector-configuration-form-dialog.tsx's own ConnectorTestPanel call site supplies
  a configurationText value so the file continues to type-check and compile.
---

## What it is
A new configurationText prop, threaded from ConnectorConfigurationDetailReadyView through ConnectorTestPanel into useTestConnectorPanel.
The one currently-unreachable ConnectorTestPanel call site inside connector-configuration-form-dialog.tsx, kept compiling against the same new signature.

## Notes
None.
