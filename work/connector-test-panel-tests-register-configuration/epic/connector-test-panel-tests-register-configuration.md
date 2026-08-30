---
title: Connector test panel tests register configuration before reconciling
summary: Seven pre-existing tests across three files are corrected to save an edit to Configuration
  before clicking "Add attribute", matching the now-corrected production behavior of reconciling
  against the registered configuration rather than an unsaved edit.
sources:
- intake/scope.md
covers:
- rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
- domain/integration/connector-configuration
- domain/investigation/subject-attribute-value
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/investigation/a-subject-holds-one-value-per-attribute
---

## What it is
Corrects seven currently-failing tests, broken as the legitimate consequence of a sibling corrective delivery (connector-test-panel-reads-registered-configuration) that made the Test Panel reconcile against the connector's registered configuration rather than an unsaved edit: each test's own setup now saves its Configuration edit before the "Add attribute" click that depends on it, leaving every assertion's own expected outcome unchanged.

## Notes
None.
