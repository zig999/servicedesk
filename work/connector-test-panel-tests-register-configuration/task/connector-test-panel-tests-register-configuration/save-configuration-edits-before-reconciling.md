---
title: Save Configuration edits before reconciling in the affected tests
summary: Seven tests across three spec files now save an edit to Configuration before clicking
  "Add attribute", so their setup matches the corrected production behavior of reconciling against
  the registered configuration.
sources:
- intake/scope.md
objective: Every test that edits Configuration and then relies on "Add attribute" reconciling
  against that edit first saves it, and the full suite passes.
criteria:
- Each of the five affected tests in connector-test-panel-attribute-reconciliation.spec.ts (adds
  one row per placeholder with no existing row; removes a row whose placeholder is no longer
  present -- both the drops-and-adds case and the removes-every-row case; keeps the earlier row's
  own value in a tie; reconciled rows follow Configuration's own current placeholder order) saves
  each Configuration edit (clicking the "Save" button and awaiting the save settling) before the
  "Add attribute" click that depends on that edit having taken effect.
- The affected test in connector-test-panel-capability-picker.spec.ts ("adds a row already named
  for Configuration's own placeholder, not an empty row") saves its Configuration edit before the
  "Add attribute" click that depends on it.
- The affected test in connector-test-panel-subject-and-attributes.spec.ts ("removes exactly the
  row whose own Remove action was clicked, leaving the other rows' own values intact") saves its
  Configuration edit before the "Add attribute" click that depends on it.
- Every one of the seven tests still asserts exactly the outcome it asserted before this task --
  only its own setup steps change.
- No test outside these seven, in these three files or any other, is changed.
- The full suite passes.
implements:
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/investigation/a-subject-holds-one-value-per-attribute
- domain/integration/connector-configuration
- domain/investigation/subject-attribute-value
---

## What it is
Corrects seven currently-failing tests, broken as the legitimate consequence of a sibling corrective delivery (connector-test-panel-reads-registered-configuration) that made the Test Panel reconcile against the connector's registered configuration rather than an unsaved edit: each test's own setup now saves its Configuration edit before the "Add attribute" click that depends on it, leaving every assertion's own expected outcome unchanged.

## Notes
REMAINDER, from the specification -- rules/integration/an-http-connector-configuration-declares-its-call's clauses beyond the ${subject:<attribute-name>} placeholder form (method/responseMap/statusMap and its malformed-configuration ending; address/query/headers/body; the ${requester} and ${credential:<name>} placeholder kinds; the incomplete-descriptor and unresolvable-placeholder unavailable endings) reach no criterion here -- this task's seven tests touch only the subject-attribute placeholder form, as the source of the rows reconciled in the panel.
Belongs: the backend act that executes an HTTP connector configuration's call and records how the observation ended, not this frontend connector-panel epic.
REMAINDER, from the specification -- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's two refusal clauses (HTTP 404 CapabilityNotRegisteredForTestError, HTTP 409 CapabilityConnectorMismatchError) reach no criterion here; this task's seven tests only save a Configuration edit before the "Add attribute" click.
Belongs: the backend connector-diagnostics test action that answers the test request, not this task and not this frontend epic's panel work.
Advisory: one of the five affected tests in connector-test-panel-attribute-reconciliation.spec.ts asserts that reconciled rows follow Configuration's own current placeholder order; no candidate node states any order among a test's attribute-values (a-connector-configuration-is-tested-through-a-registered-capability states the set, a-subject-holds-one-value-per-attribute speaks of order only to settle a duplicate). This task preserves that assertion unchanged rather than introducing it, and the order it asserts is not required by any node this task implements.
