---
title: Deduplicate the well-formed-configuration-object check and close the reconciliation
  coverage gap in the capability picker
summary: A new shared, exported well-formed-JSON-object-check primitive replaces the
  private, duplicated copies in use-test-connector-panel.ts and simulation-subject-derivation.ts,
  and connector-test-panel-capability-picker.spec.ts gains a test that actually exercises
  Add attribute reconciliation.
sources:
- intake/reconcile-review-findings-fix.md
objective: The well-formed-configuration-object check that use-test-connector-panel.ts
  and simulation-subject-derivation.ts each currently declare privately is extracted
  into one shared, exported primitive both call, and criterion 7 of task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows
  stops being vacuous for connector-test-panel-capability-picker.spec.ts.
criteria:
- A single, exported well-formed-JSON-object-check primitive exists under frontend/app/src/shared/services/,
  and both use-test-connector-panel.ts's parsesAsConfigurationObject and simulation-subject-derivation.ts's
  own equivalent private check are replaced by calls to it, rather than each declaring
  its own private typeof/null/Array.isArray expression.
- connector-test-panel-capability-picker.spec.ts contains at least one test that clicks
  "Add attribute" against a Configuration text embedding a subject-attribute placeholder
  and asserts the resulting row reflects that placeholder, so the file would fail
  if the reconciliation behavior regressed to the old append-one-empty-row behavior.
implements:
- domain/integration/connector-configuration
- rules/integration/a-connector-configuration-holds-a-well-formed-object
---

## What it is
Corrective increment fixing two findings from review/reconcile-test-panel-attribute-rows.md over the already-delivered reconcile-test-panel-attribute-rows task.
A shared, exported well-formed-JSON-object-check primitive, replacing the private duplicate copies use-test-connector-panel.ts and simulation-subject-derivation.ts each declared.
A new test in connector-test-panel-capability-picker.spec.ts proving Add attribute reconciliation actually holds in that file's own context.

## Notes
The backend's own connector-request-resolver.ts (src/http-connector/) also declares a private equivalent (isPlainObject), but it sits in a different target from this initiative's own frontend scope and is not touched by this task.
None beyond the above.
