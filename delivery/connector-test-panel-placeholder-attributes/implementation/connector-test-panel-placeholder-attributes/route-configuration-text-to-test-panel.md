---
title: Route Configuration's text to the test panel's hook
summary: ConnectorTestPanel gains a required configurationText prop that ConnectorConfigurationDetailReadyView
  fills with its own live state.configuration.value and forwards into useTestConnectorPanel(connector,
  configurationText).
task: sha256:6bd3c962c306cde1ddbd8d059b79a6de365c58343819a07888cf4bf249dad0c9
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-placeholder-attributes-route-configuration-text-to-test-panel-build-3
files:
- path: src/hooks/use-test-connector-panel.ts
  effect: 'useTestConnectorPanel now takes a second required configurationText: string argument, held
    in a ref and deliberately left unread by this task''s own scope, documented in the function''s own
    header comment as plumbing for a later task to consume.'
- path: src/routes/connector-test-panel.tsx
  effect: 'ConnectorTestPanelProps now requires a configurationText: string field, and the component forwards
    it unread into useTestConnectorPanel(connector, configurationText).'
- path: src/routes/connector-configuration-detail-ready-view.tsx
  effect: its <ConnectorTestPanel connector={connector} /> call site now also passes configurationText={state.configuration.value},
    the route's own live Configuration text.
- path: src/routes/connector-configuration-form-dialog.tsx
  effect: its edit-mode (production-unreachable) <ConnectorTestPanel> call site now also passes configurationText={state.configuration.value}
    so the file keeps type-checking and compiling against the new required prop.
criteria:
- criterion: ConnectorConfigurationDetailReadyView passes its own live state.configuration.value text
    into ConnectorTestPanel through a new configurationText prop.
  met: true
  how: connector-configuration-detail-ready-view.tsx's own <ConnectorTestPanel> call site now reads configurationText={state.configuration.value}.
- criterion: ConnectorTestPanel forwards configurationText into useTestConnectorPanel(connector, configurationText).
  met: true
  how: connector-test-panel.tsx destructures configurationText from its props and calls useTestConnectorPanel(connector,
    configurationText).
- criterion: Every existing caller of useTestConnectorPanel's returned state and handlers continues to
    compile and behave exactly as before, aside from the hook now accepting the new argument.
  met: true
  how: no spec file constructs <ConnectorTestPanel> or calls useTestConnectorPanel directly -- every spec
    mounts the panel through the routed detail screen, which now supplies the value; onAddAttribute/onTest/every
    other returned field and handler's own logic is byte-for-byte unchanged, confirmed by the passing
    build run (typecheck/lint/style/build/a11y/secret-scan) over the whole project.
- criterion: connector-configuration-form-dialog.tsx's own ConnectorTestPanel call site supplies a configurationText
    value so the file continues to type-check and compile.
  met: true
  how: its edit-mode <ConnectorTestPanel> call site now also passes configurationText={state.configuration.value},
    and npm run typecheck / npm run build both pass over the whole project.
inferences:
- inferred: connector-configuration-form-dialog.tsx's dead edit-mode branch supplies state.configuration.value
    as its configurationText value.
  from: no criterion or specification node states what that production-unreachable branch should pass;
    state.configuration.value is the same field this file already reads at configuration={state.configuration},
    and it parallels exactly what the one reachable call site (connector-configuration-detail-ready-view.tsx)
    supplies.
preserved:
- useTestConnectorPanel's onAddAttribute still only appends one empty row per click, unchanged.
- TestConnectorPanelState's shape and every other field and handler it returns are unchanged.
deferred:
- what: Reading configurationText inside useTestConnectorPanel to reconcile attributes against Configuration's
    own current subject-attribute placeholders.
  why: this task's own rationale states it carries an existing value between components without deciding
    a new fact; task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows is
    the task that reads it.
---

## What it is
A new required `configurationText: string` prop on `ConnectorTestPanel`, forwarded unread into `useTestConnectorPanel(connector, configurationText)`.
`ConnectorConfigurationDetailReadyView` -- the one production call site -- fills it with its own live `state.configuration.value`.
`connector-configuration-form-dialog.tsx`'s production-unreachable edit-mode call site fills it with `state.configuration.value` too, so the file keeps compiling.
No other behavior of the hook or the panel changed: `onAddAttribute` still only appends one empty row.

## Notes
This task implements no specification node -- its own `rationale` states it "carries an existing value between components without deciding a new fact," and the plan's binder confirmed no candidate node's own clause governs pure prop/argument plumbing.
The worktree's `frontend/tui` git submodule was uninitialized and had to be fetched (`git submodule update --init --recursive`) before `npm run typecheck`/`npm run build` could resolve `@tui/ui/*`/`@tui/lib/*`; its own `frontend/` package also needed its own `npm ci`, and its `react`/`react-dom` were re-symlinked to `../../../app/node_modules/react`(`-dom`) to match the one-React-instance arrangement the project's main checkout already uses -- environment setup, not a change this delivery's `files` list.
