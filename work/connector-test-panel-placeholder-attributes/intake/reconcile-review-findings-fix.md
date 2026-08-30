# Corrective increment scope

Origin: two findings from the review record
`delivery/connector-test-panel-placeholder-attributes/review/reconcile-test-panel-attribute-rows.md`
over the already-delivered task
`task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows`, corrected
now by the human's own explicit request ("corrija os achados seguindo o caminho do framework").

## Behavior to correct (one task, two criteria)

1. `frontend/app/src/hooks/use-test-connector-panel.ts` declares its own
   `parsesAsConfigurationObject` function, re-declaring the same "well-formed JSON object" check
   that already exists in `frontend/app/src/services/simulation-subject-derivation.ts`
   (`isPlainRecord`) — a specification-conformance finding: the domain fact "what counts as a
   well-formed configuration object" (`domain/integration/connector-configuration`) now has 3-4
   copies in the code. Fix: export the existing check and have `parsesAsConfigurationObject`
   reuse it instead of re-declaring the same `typeof`/`null`/`Array.isArray` expression.

2. Criterion 7 of the already-delivered task ("connector-test-panel-subject-and-attributes.spec.ts,
   connector-test-panel-capability-picker.spec.ts, connector-test-panel-dispatch-safety.spec.ts,
   connector-test-panel-request-response.spec.ts and connector-test-panel.test-support.ts's
   fillTestPanelBasics helper pass against this reconciliation behavior in place of the old
   append-one-empty-row behavior") was marked "partial" by the review's coverage-auditor:
   `connector-test-panel-capability-picker.spec.ts` contains no call to "Add attribute" and no use
   of `fillTestPanelBasics` — nothing there would fail if reconciliation regressed to the old
   behavior. Fix: add a test to `connector-test-panel-capability-picker.spec.ts` (or wherever
   technically most appropriate) proving "Add attribute" reconciliation actually works in that
   file/context, so criterion 7 stops being vacuous there.

Target: frontend (`frontend/app`). Initiative: `connector-test-panel-placeholder-attributes`.

## Note, not part of this task

A third finding from the same review (1 failing test in `case-version-editor-screen-save.spec.ts`
during the captured suite run) was investigated and confirmed as pre-existing suite
order/concurrency flakiness — the file was run in isolation three times and passed 12/12 each
time. It is not a wrong behavior in this initiative's own code (it belongs to
`task/version-editor/edit-draft-version`, a different initiative), so it does not become a
corrective task here.
