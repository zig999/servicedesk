---
title: Rewrite the reconciliation tie-break test's collision setup
summary: The test that proves two attribute rows sharing one name reduce to a single kept row
  now induces that collision by editing Configuration's text, rather than by firing a change
  event on the Attribute field.
sources:
- intake/scope.md
objective: The reconciliation tie-break test proves the same outcome it always proved, using a
  setup mechanism the connector Test Panel's now-read-only Attribute field still permits.
criteria:
- connector-test-panel-attribute-reconciliation.spec.ts's tie-break test no longer calls
  fireEvent.change on an Attribute field to induce the collision.
- connector-test-panel-attribute-reconciliation.spec.ts's tie-break test induces the collision
  by editing Configuration's own text so two placeholders resolve to the same subject-attribute
  name, then clicking "Add attribute" again.
- The rewritten test still asserts that the earlier row's own value is kept and the later
  duplicate's is dropped once the two rows share one attribute name.
- Every other test in connector-test-panel-attribute-reconciliation.spec.ts is unchanged.
- The full suite passes.
implements:
- domain/investigation/subject-attribute-value
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- rules/investigation/a-subject-holds-one-value-per-attribute
---

## What it is
Fixes one currently-failing test, broken as the legitimate consequence of another already-delivered corrective task making the Test Panel's Attribute field non-editable: the test's own mechanism for inducing a duplicate-attribute-name scenario (renaming through the UI) is replaced with one that edits Configuration's text instead, leaving the tie-break behavior under test, and every other test in the file, unchanged.

## Notes
UNDERDETERMINED, from the specification -- criterion 2 induces the collision "by editing Configuration's own text" and no criterion says that edited text is the configuration currently registered under the connector name, but rules/integration/a-connector-configuration-is-tested-through-a-registered-capability states that the configuration a test exercises is the one currently registered under that connector name, read at the moment of the test, never configuration text an operator holds unsaved in an authoring surface, and that the subject carries the attributes named by the placeholders embedded in that same registered configuration.
Passes: a rewritten tie-break test that types two ${subject:x} placeholders into the Configuration textarea, never registers that text, clicks "Add attribute" twice against rows the panel derived from the unsaved textarea contents, and asserts the first value survives -- every criterion is met as written, and the specification refuses the panel behavior it thereby pins, since the attribute names a test collects values for are read from the registered configuration's placeholders.
REMAINDER, from the specification -- three clauses of rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's statement reach no criterion here: testing only through a specific, already-registered capability naming it as its connector; the HTTP 404 CapabilityNotRegisteredForTestError refusal; and the HTTP 409 CapabilityConnectorMismatchError refusal. Nothing in this task exercises capability selection or either refusal.
Belongs: the act delivering the connector test action itself -- capability selection and the two refusals of contracts/integration/connector-diagnostics -- not this test-rewrite task.
Decision, beyond the covers — stand: contracts/integration/connector-diagnostics is named only as where that already-delivered act's own refusals are published, not as a node this task answers to; growing this epic's claim to cover it would claim a contract this one-task test-rewrite epic has no criterion reaching.
REMAINDER, from the specification -- of rules/integration/an-http-connector-configuration-declares-its-call, only the ${subject:<attribute-name>} placeholder form reaches this task. Unreached: the required method, responseMap and statusMap and the malformed-configuration ending; the address, query, headers and body well-formedness clauses and the incomplete-descriptor ending; the ${requester} and ${credential:<name>} placeholder forms; the substitution-as-plain-text clause; and the unresolvable-placeholder unavailable ending.
Belongs: the act delivering HTTP connector configuration execution -- the connector's own call construction, placeholder resolution and unavailable endings -- not this test-rewrite task.
Advisory: rules/investigation/a-subject-holds-one-value-per-attribute is the only candidate stating the tie-break direction criterion 3 asserts; rules/integration/a-connector-configuration-is-tested-through-a-registered-capability states only that two placeholders naming one attribute yield one collected value, never which value survives.
