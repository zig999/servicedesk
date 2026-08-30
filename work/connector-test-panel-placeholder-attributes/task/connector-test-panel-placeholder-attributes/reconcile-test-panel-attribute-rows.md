---
title: Reconcile the test panel's attribute rows with Configuration's placeholders
summary: Clicking Add attribute reconciles the panel's attribute/value rows against
  every subject-attribute placeholder Configuration's own text currently holds, in
  place of appending one empty row.
rationale: The scope states this reconciliation behavior and requires updating, in
  the same work, the specs and fixtures that assert the old behavior; cutting it as
  its own task, after the extraction and the prop route, is the decomposition's choice,
  so this task builds on the parsing primitives and the Configuration text access
  those two tasks already establish rather than repeating either.
sources:
- intake/scope.md
objective: Clicking "Add attribute" reconciles the panel's attribute/value rows against
  every subject-attribute placeholder currently present in Configuration's text, rather
  than appending one empty row.
criteria:
- Clicking "Add attribute" adds exactly one row, with an empty value, for each subject-attribute
  name found in Configuration's current text that has no existing row.
- Clicking "Add attribute" preserves the value already entered in a row whose attribute
  name matches a subject-attribute placeholder still present in Configuration's current
  text.
- Clicking "Add attribute" removes any row whose attribute name matches no subject-attribute
  placeholder currently present in Configuration's text.
- Clicking "Add attribute" excludes ${requester} and ${credential:...} placeholders
  from the rows it adds, keeping only a placeholder naming a Subject attribute.
- Clicking "Add attribute" produces at most one row per distinct attribute name even
  where that name's placeholder appears more than once across address, query, headers
  and body.
- Clicking "Add attribute" when Configuration's current text does not parse as a valid
  JSON object leaves the existing rows exactly as they were before the click.
- connector-test-panel-subject-and-attributes.spec.ts, connector-test-panel-capability-picker.spec.ts,
  connector-test-panel-dispatch-safety.spec.ts, connector-test-panel-request-response.spec.ts
  and connector-test-panel.test-support.ts's fillTestPanelBasics helper pass against
  this reconciliation behavior in place of the old append-one-empty-row behavior.
depends_on:
- task/connector-test-panel-placeholder-attributes/extract-connector-placeholder-parsing
- task/connector-test-panel-placeholder-attributes/route-configuration-text-to-test-panel
implements:
- rules/integration/an-http-connector-configuration-declares-its-call
- domain/integration/connector-configuration
- domain/glossary/subject-attribute
- domain/investigation/subject-attribute-value
---

## What it is
useTestConnectorPanel's onAddAttribute, changed from appending one empty row to reading Configuration's text and reconciling the rows against its subject-attribute placeholders.
The five existing spec/fixture files whose assertions depend on the old append-only behavior, updated to assert the reconciliation behavior instead.

## Notes
REMAINDER, from the specification -- rules/integration/an-http-connector-configuration-declares-its-call.md's statement carries several clauses this task's criteria never reach: the method/responseMap/statusMap well-formedness requirement and its MalformedHttpConnectorConfigurationError ending, the IncompleteConnectorCallDescriptorError ending for a malformed address/query/headers or an unrecognized or argument-missing placeholder kind, and the ConnectorPlaceholderNotResolvedError ending for a Subject-attribute or credential placeholder that resolves to nothing.
None of those clauses concerns the test panel's client-side "Add attribute" reconciliation this task states; they govern the HTTP connector's own call assembly and observation-ending behavior, already implemented in src/http-connector/connector-call-descriptor.ts and connector-request-resolver.ts.
Belongs: the backend HTTP connector's own call-assembly and observation-ending implementation (connector-call-descriptor.ts / connector-request-resolver.ts), not this frontend test-panel task.
