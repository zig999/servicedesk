---
title: Proof for making the connector Test Panel's Attribute field read-only
summary: Proves the Attribute field renders disabled/read-only carrying no onChange while the Value field
  stays editable, that it still displays the reconciled name, and that a dispatched change event on it
  has no effect.
implementation: sha256:f79315fc1f161b92c6be6bac167ff92a262a31bfa5575e3c653c9ecade053c88
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-attribute-readonly-make-attribute-field-readonly-suite-2
tests:
- file: src/routes/connector-test-panel-fields.spec.ts
  name: renders the reconciled row's Attribute Input carrying both disabled and readOnly, and its Value
    Input carrying neither
  proves: Each attribute row's Attribute field is rendered non-editable (disabled or read-only), while
    its Value field remains an editable Input exactly as before.
  fails_when: the Attribute Input is missing disabled or missing readOnly, or the Value Input has become
    non-editable (carries disabled).
- file: src/routes/connector-test-panel-fields.spec.ts
  name: displays the name useTestConnectorPanel's own reconciliation already assigned, rather than an
    empty control
  proves: An attribute row's Attribute field still displays the row's current attribute name (the same
    text useTestConnectorPanel's reconciliation already assigns it), rather than an empty or blank control.
  fails_when: the Attribute Input renders blank or any text other than the placeholder name ("account-id")
    the reconciliation assigned this row.
- file: src/routes/connector-test-panel-fields.spec.ts
  name: keeps the row named for its reconciled placeholder once a later render settles, while the Value
    field's own edit still lands
  proves: Typing into the Attribute field's control has no effect on the row's attribute name -- only
    onAttributeChange(row.id, 'value', ...) can still change the row, never the attribute name through
    the UI.
  fails_when: an onChange remains reachable on the Attribute Input (wired, even if guarded by disabled),
    so that after the Value field's own edit forces a fresh render, the Attribute Input's displayed value
    has become "operator-typed-name" instead of staying "account-id" -- or the Value Input stops accepting
    its own edit.
not_applicable:
- edge_case: two rows sharing an attribute name (duplicate)
  why: the dedup/tie-break behavior itself is unchanged by this task (reconcileAttributeRows is untouched)
    and is proven by connector-test-panel-attribute-reconciliation.spec.ts, whose own tie-break test was
    rewritten under a sibling delivery (connector-test-panel-reconciliation-test-rename) once this task
    made the Attribute field non-editable.
- edge_case: a dependency that fails or answers slowly
  why: this task introduces no new network dependency and reads no new state from either of the panel's
    own two existing reads (capabilities, subject-type); the disabled control's value still comes from
    row.attribute, already resolved by the time either read settles.
- edge_case: two operations against one subject at once (concurrent edits)
  why: no new asynchronous operation is introduced; the Attribute field going read-only removes a write
    path rather than adding one for two operations to race over.
- edge_case: absent or empty attribute name displayed
  why: reconcileAttributeRows only ever assigns a row the non-empty placeholder name it parsed, or an
    empty value (never an empty attribute name) for a freshly-added placeholder; there is no code path
    this task reaches that would present a blank Attribute field for an existing row.
untested:
- Whether a real browser blocks keyboard or pointer interaction with the disabled Attribute Input at all
  -- this proof's own test dispatches a change event the same way a script could, which jsdom (like a
  real browser) does not block on a disabled control; it proves the removed-onChange mechanism holds even
  under that bypass, not that a genuine keystroke never reaches the control in the first place (that guarantee
  is the browser's own disabled-input handling, not something this test exercises).
- Whether a second or third row's own Attribute Input independently renders disabled/readOnly and independently
  survives an attempted edit -- only the single-row case (Configuration's own default placeholder) is
  exercised above; the existing reconciliation suite exercises multi-row scenarios for the underlying
  row data, but not this task's disabled/readOnly rendering specifically for a second row.
---

## What it is
Proves ConnectorTestPanelFields' Attribute field renders disabled and read-only, still shows the reconciled name, and stays unaffected by any attempted edit, while the Value field remains fully editable.

## Notes
The first suite attempt for this task failed on a test outside this delivery's own file set (connector-test-panel-attribute-reconciliation.spec.ts, from the closed connector-test-panel-placeholder-attributes initiative), diagnosed as a test an earlier task owns rather than a regression here; that fix landed under a separate corrective delivery (connector-test-panel-reconciliation-test-rename). This record's own run is the suite attempt taken after that fix landed, and it passed clean.
