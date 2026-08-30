# Corrective increment ask

Stated by the human via this session's own `/implement-task` run over
`task/connector-test-panel-attribute-readonly/make-attribute-field-readonly`: that delivery's suite
turned up exactly one red test, in a file delivered under a different, now-closed initiative
(`connector-test-panel-placeholder-attributes`, which holds `closure.md` and cannot be reopened or
re-delivered against directly).

## What broke, and why it is not a regression

`frontend/app/src/routes/connector-test-panel-attribute-reconciliation.spec.ts`'s own test —
"ConnectorTestPanel — the first row keeps a name two rows come to share > keeps the earlier row's
own value and drops the later duplicate's, once two rows share one attribute name" (around lines
204-227) — induces its duplicate-attribute-name tie-break scenario by firing a change event on the
second row's Attribute input, renaming it into a collision with the first row's own name.

`task/connector-test-panel-attribute-readonly/make-attribute-field-readonly` made the connector
Test Panel's Attribute field non-editable (disabled, no `onChange` at all), per
`domain/investigation/subject-attribute-value` and `domain/glossary/subject-attribute` — the
attribute name is a governed value drawn from the glossary, never operator-typed. That is exactly
the interaction the older test's own setup depends on, so the `fireEvent.change` it fires is now a
no-op: the second row never actually renames, and the test's own tie-break assertion fails.

The reconciliation logic under test (`reconcileAttributeRows` / `useTestConnectorPanel`'s
`onAddAttribute`) is unaffected and still correct; only this one test's own mechanism for setting up
the duplicate-name scenario is obsolete.

## The fix

Rewrite this one test's setup to induce the shared-attribute-name collision through
`Configuration`'s own text — editing `Configuration` so two placeholders resolve to the same
subject-attribute name before clicking "Add attribute" a second time — rather than through
`fireEvent.change` on the Attribute field. The test's own assertions (the tie-break outcome) and
every other test in the file stay untouched.
