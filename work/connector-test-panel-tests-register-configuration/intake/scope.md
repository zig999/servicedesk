# Corrective increment ask

Stated by the human via this session's own `/implement-task` run over
`task/connector-test-panel-reads-registered-configuration/thread-registered-configuration-into-test-panel`:
the `failure-diagnostician` found seven pre-existing tests, across three files, all delivered under
the now-closed `connector-test-panel-placeholder-attributes` initiative, that now fail against the
corrected production behavior -- diagnosed cause `test` on every one, never `code`. The human's own
established decision for this exact situation (chosen twice already this session) is to cut a fresh
corrective increment rather than reopen the closed initiative.

## Why these tests broke, and why it is not a regression

`thread-registered-configuration-into-test-panel` corrected `ConnectorConfigurationDetailReadyView`
to pass `state.registeredConfigurationText` (the connector's last *registered* configuration) to
`ConnectorTestPanel`, instead of `state.configuration.value` (the live, unsaved textarea) -- per
`rules/integration/a-connector-configuration-is-tested-through-a-registered-capability`'s own
statement that the configuration a test exercises, and the placeholders the subject it assembles
reads, are "never configuration text an operator holds unsaved in an authoring surface".

Every one of the seven failing tests edits the "Configuration" textarea by hand
(`fireEvent.change`) and then clicks "Add attribute" *without ever saving that edit* --
asserting that the reconciliation follows the unsaved edit, which is now specification-refused. The
reconciliation logic itself (`onAddAttribute`, `reconcileAttributeRows`,
`use-test-connector-panel.ts`) is untouched and correct; only these tests' own setup (never
registering the edited text before expecting the panel to reconcile against it) is stale.

## The seven failing tests, by file

`frontend/app/src/routes/connector-test-panel-attribute-reconciliation.spec.ts` (five failures):
- `"Add attribute" adds one row per placeholder with no existing row (criterion 1) > adds exactly one empty-valued row for each subject-attribute placeholder Configuration's current text names, when no row exists yet"`
- `"Add attribute" removes a row whose placeholder is no longer present (criterion 3) > drops the account-id row and adds the region row once Configuration's text no longer names account-id"`
- `"Add attribute" removes a row whose placeholder is no longer present (criterion 3) > removes every row, leaving none, once Configuration's text names no placeholder at all"`
- `"the first row keeps a name two rows come to share ... > keeps the earlier row's own value and drops the later duplicate's, once two rows share one attribute name"`
- `"reconciled rows follow Configuration's own current placeholder order ... > re-orders the rows to match the placeholder order Configuration's text currently declares, even though that order differs from the rows' own prior order"`

`frontend/app/src/routes/connector-test-panel-capability-picker.spec.ts` (one failure):
- `"ConnectorConfigurationFormDialog — the Test section renders only in edit mode > adds a row already named for Configuration's own placeholder, not an empty row"`

`frontend/app/src/routes/connector-test-panel-subject-and-attributes.spec.ts` (one failure):
- `"removes exactly the row whose own Remove action was clicked, leaving the other rows' own values intact (stable-row-identity inference)"`

## The fix

Each failing test's own edit to Configuration must be *saved* (clicking "Save" -- role `button`,
accessible name `"Save"`, rendered by `ConnectorConfigurationFormFields`) before the following "Add
attribute" click that expects the reconciliation to reflect it. `mountTestPanelInEditMode`'s own
fixture (`connector-test-panel.test-support.ts`) already stubs `connectorPutPath(target.connector)`
to resolve successfully, and `useConnectorConfigurationDetail`'s own save `onSuccess` re-baselines
to the just-submitted text regardless of the stubbed response body (that hook's own header comment:
"the values just submitted, not whatever the response body happens to carry") -- so no fixture
change is needed, only driving each test through a save before the assertion that now depends on
registration. Every assertion's own expected outcome stays exactly what it already is; only the
setup steps that produce it change.
