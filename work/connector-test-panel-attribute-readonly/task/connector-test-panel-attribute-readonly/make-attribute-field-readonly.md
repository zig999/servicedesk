---
title: Make the Test Panel's Attribute field read-only
summary: Each Add attribute row's Attribute field renders read-only (no longer an editable
  Input) while Value stays editable, matching the name the reconciliation logic already
  derives from Configuration's placeholders.
sources:
- intake/scope.md
objective: The connector Test Panel's Add attribute rows show each row's attribute name as
  read-only, so the operator can no longer type a name that contradicts what the
  reconciliation already derived from Configuration's placeholders.
criteria:
- Each attribute row's Attribute field is rendered non-editable (disabled or read-only),
  while its Value field remains an editable Input exactly as before.
- An attribute row's Attribute field still displays the row's current attribute name (the
  same text useTestConnectorPanel's reconciliation already assigns it), rather than an
  empty or blank control.
- Typing into the Attribute field's control has no effect on the row's attribute name --
  only onAttributeChange(row.id, "value", ...) can still change the row, never the
  attribute name through the UI.
- Existing tests covering Add attribute's reconciliation behavior
  (connector-test-panel-subject-and-attributes.spec.ts, connector-test-panel-capability-picker.spec.ts,
  connector-test-panel.test-support.ts's fillTestPanelBasics helper) keep passing, updated
  only as needed for the Attribute field's own control now being read-only rather than
  asserting anything about the reconciliation logic itself.
implements:
- rules/integration/an-http-connector-configuration-declares-its-call
- domain/investigation/subject-attribute-value
- domain/glossary/subject-attribute
---

## What it is
Corrective increment fixing a wrong behavior in the connector Test Panel's own already-delivered Add attribute reconciliation (closed initiative connector-test-panel-placeholder-attributes, task reconcile-test-panel-attribute-rows): ConnectorTestPanelFields renders each attribute row's Attribute field as an editable Input, letting the operator type a name that contradicts the name useTestConnectorPanel's onAddAttribute already derives from Configuration's own placeholders.
The fix makes that field read-only while leaving the Value field editable exactly as today.

## Notes
REMAINDER, from the specification -- rules/integration/an-http-connector-configuration-declares-its-call's statement is answered by this task only in its placeholder clause: a placeholder naming a Subject attribute is written ${subject:<attribute-name>}, with the attribute name as its argument, which is what makes the row's attribute name a derived, governed value rather than one the operator authors.
Its remaining clauses reach no criterion here: the required method, responseMap and statusMap and the MalformedHttpConnectorConfigurationError ending; the address, query, headers and body and their shape refusals; the ${requester} and ${credential:<name>} forms; and the IncompleteConnectorCallDescriptorError and unresolvable-placeholder unavailable endings.
None of them is a condition over the Test Panel's Attribute control.
Belongs: the backend act that assembles and issues the HTTP connector's call from a connector configuration (call-descriptor validation, placeholder resolution and the unavailable endings) -- not this frontend Test Panel task, and not this epic's surface work.
UNDERDETERMINED, from the specification -- criterion 2 fixes the read-only Attribute field's text to whatever useTestConnectorPanel's reconciliation already assigned, and no criterion holds that text to a name the glossary holds.
rules/investigation/a-subject-attribute-is-drawn-from-the-glossary states that every attribute a subject's attribute-values name exists in the glossary, and the Test Panel assembles exactly such attribute-values for the test call, so an implementation meeting every criterion as written can still present, and send, an attribute-value whose name that policy refuses.
The caller settled it by leaving rules/investigation/a-subject-attribute-is-drawn-from-the-glossary uncovered (epic's own Notes) rather than answered by a criterion this corrective increment's own narrow scope does not ask for -- this epic holds no other task to scope it to.
Passes: an Attribute field rendered disabled and populated verbatim from the ${subject:<name>} placeholder argument the reconciliation parsed out of Configuration, with a name domain/glossary/subject-attribute does not hold -- every criterion passes, and rules/investigation/a-subject-attribute-is-drawn-from-the-glossary refuses the attribute-value the panel then submits.
