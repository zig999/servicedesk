---
title: Report orphaned placeholders in the connector test response
summary: test-connector's response names, for the pair under test, any placeholder
  the tested capability's input schema does not declare, without refusing the test.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
objective: Testing a connector configuration through a registered capability reports,
  in its own response, every Subject-attribute placeholder the configuration's call
  text embeds that the tested capability's input-schema properties does not declare,
  and never refuses the test on that account.
criteria:
- Testing a connector configuration through a capability whose input schema does not
  declare a Subject-attribute placeholder the configuration's call text embeds reports
  that placeholder in the response.
- Testing a connector configuration through a capability whose input schema declares
  every Subject-attribute placeholder the configuration's call text embeds reports
  none.
- The test is not refused on account of an orphaned placeholder its own response reports.
depends_on:
- task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check
rationale: The scope states this reporting as a distinct outcome ("test-connector
  reporta a mesma checagem no seu próprio response") from either registration refusal
  — it never refuses, only surfaces — so it is cut as its own task, reusing the same
  shared check rather than re-deriving it.
implements:
- rules/integration/a-connector-placeholder-is-declared-by-its-capability
---

## What it is
test-connector's response names, for the pair under test, any placeholder the tested capability's input schema does not declare, without refusing the test.

## Notes
REMAINDER, from the specification — The write-time clauses of a-connector-placeholder-is-declared-by-its-capability's own statement — refusing a connector-configuration registration or edit whose call text embeds a Subject-attribute placeholder absent from the currently-registered capability's input schema, refusing a capability registration likewise against an already-registered connector configuration, and the shared HTTP 422 ConnectorPlaceholderOutsideInputSchemaError response that names the refusal — are not reached by any criterion of this task, which addresses only the test-connector diagnostic's own reporting behavior for an already-existing pairing. Belongs: the tasks that implement those write-time refusals (refuse-connector-registration-with-orphaned-placeholder, refuse-capability-registration-with-orphaned-placeholder), worked in scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused.
