# Corrective increment ask

Stated by the human via this session's own `/implement-task` run over
`task/connector-test-panel-reconciliation-test-rename/rewrite-tie-break-test-collision-setup`: an
independent check by that delivery's own test-author found that the connector Test Panel's
`onAddAttribute` (frontend/app/src/hooks/use-test-connector-panel.ts) reconciles attribute rows
against `configurationText` -- the connector-configuration edit form's own live, unsaved textarea
state -- rather than against the connector's currently *registered* configuration.

That divergence contradicts `rules/integration/a-connector-configuration-is-tested-through-a-registered-capability`,
decided earlier in this same session's own work: "the configuration the test exercises is the one
currently registered under that connector name, read at the moment of the test, never
configuration text an operator holds unsaved in an authoring surface or supplies alongside the
test request." The human decided (choosing among options this session presented) to cut this fix
as its own, separate corrective increment rather than folding it into the test-rewrite task above,
whose own scope was deliberately kept to one test file.

## What is wrong, and where

`ConnectorConfigurationDetailReadyView` (frontend/app/src/routes/connector-configuration-detail-ready-view.tsx)
passes `configurationText={state.configuration.value}` to `ConnectorTestPanel` --
`state.configuration.value` is the live, react-hook-form-adjacent text the operator is currently
editing (from `useConnectorConfigurationDetailView` / `useConnectorConfigurationDetail`), which
drifts from what is registered the instant an operator types an unsaved edit.
`useTestConnectorPanel`'s own `onAddAttribute` (use-test-connector-panel.ts) then reconciles the
panel's attribute rows against that same live text (via `configurationTextRef.current`), so
clicking "Add attribute" derives rows from a draft nothing has committed to.

## What is already available to fix this without a second network read

`useConnectorConfigurationDetailView` (frontend/app/src/hooks/use-connector-configuration-detail-view.ts)
already tracks exactly the fact needed: `configurationBaselineRef`, a ref snapshotting
`configuration.value` (and `isValid`) every time the "ready" phase reports `isDirty === false` --
which happens right after the record loads and right after a save succeeds, and never otherwise.
That ref's own `.value` is already "the most recently loaded-or-saved configuration text" (this
file's own header comment), used today only to play discard back through `configuration.onChange`
-- it is not currently exposed on the hook's own returned "ready" phase state, and is not currently
what `ConnectorTestPanel` is given.

## The fix

Expose `configurationBaselineRef.current.value` as a new field on
`useConnectorConfigurationDetailView`'s own "ready" phase return shape (its own name is this
task's own inference to make, since no criterion states one), and have
`ConnectorConfigurationDetailReadyView` pass that new field -- not `state.configuration.value` --
as `ConnectorTestPanel`'s own `configurationText` prop. `useTestConnectorPanel` itself
(use-test-connector-panel.ts) needs no change: it already reconciles against whatever
`configurationText` it is given, and the fix is entirely in which text that is.
