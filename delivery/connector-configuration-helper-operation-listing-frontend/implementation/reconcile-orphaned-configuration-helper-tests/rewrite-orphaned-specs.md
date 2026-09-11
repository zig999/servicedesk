---
target: frontend
title: Rewrite the three orphaned Configuration Helper specs to drive the operation Select
summary: Rewrites the Configuration Helper interactions in the three pre-existing spec files so each drives
  the helper by choosing a fetched operation from the Select, stubbing the operations-read route the same
  way the sibling task's own spec does, while leaving every other assertion and all production code untouched.
task: sha256:9122d4c4e2a0b3ad6dcaaf7430bfc5b06e926755909f10e66877529ffef46a6d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/reconcile-orphaned-configuration-helper-tests-rewrite-orphaned-specs-build
files:
- path: src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  effect: Adds a HELPER_OPERATION fixture, an operationsReadRoute/operationsReadJsonResponse pair and
    a chooseHelperOperation helper; wires the operations-read stub into mountCreateScreenWithHelper, mountDetailScreenWithHelper
    and the two inline fetch stubs that set the OpenAPI link; rewrites criterion 5's test from asserting
    free-text Operation path/method inputs to asserting an Operation Select whose value reflects the chosen
    entry; rewrites criterion 6's test to choose the operation from the Select instead of typing into
    path/method inputs, keeping the same POST-body assertion. Every other describe block (criteria 1-4,
    7, 8, the constraints test, the disclosed-inference pair) is unchanged.
- path: src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  effect: Adds the same OPERATOR_LINK/HELPER_OPERATION fixtures and operations-read stub helpers; wires
    the stub into mountDetailReady and mountCreateReady; rewrites offerDraft to set the link and choose
    the fixture operation from the Select instead of typing into Operation path/method inputs. No other
    function or assertion in the file changed.
- path: src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  effect: Adds the same fixtures and operations-read stub helpers; wires the stub into applyAnsweredDraft's
    fetch stub and the last test's own inline fetch stub; rewrites fillHelperRequestFields to set the
    link and choose the fixture operation from the Select instead of typing into Operation path/method
    inputs. No other function or assertion in the file changed.
criteria:
- criterion: connector-configuration-form-fields-configuration-helper.spec.ts drives the helper by choosing
    an entry from the operations Select, never by typing into a path or a method field.
  met: true
  how: Every test in the file that advances the helper (criteria 5, 6, the constraints test, criterion
    7) now sets the OpenAPI document link and, where an operation is needed, calls chooseHelperOperation,
    which opens the Select via its "Operation" label and mouseDowns the matching option — the same open/select
    mechanics connector-configuration-helper-fields-operation-select.spec.ts already established. No fireEvent.change
    targets an "Operation path" or "Operation method" label anywhere in the file (verified by grep).
- criterion: connector-configuration-form-fields-apply-confirmation.spec.ts drives the helper the same
    way, and every assertion about the apply-confirmation behavior it already held is unchanged.
  met: true
  how: Only offerDraft's own body changed (link change + chooseHelperOperation instead of typing into
    path/method inputs), plus the operations-read handler added to mountDetailReady and mountCreateReady's
    fetch stubs so the new query the production hook issues on link-change resolves. Every describe/it
    block, every dialog/confirm/decline assertion and every PUT-count assertion is byte-for-byte the same
    as before.
- criterion: connector-configuration-create-screen-apply-draft.spec.ts drives the helper the same way,
    and every assertion about the create-screen apply-draft behavior it already held is unchanged.
  met: true
  how: Only fillHelperRequestFields' own body changed (link change + chooseHelperOperation), plus the
    operations-read handler added to applyAnsweredDraft's fetch stub and the last test's own inline fetch
    stub. Every describe/it block and its assertions (Configuration text, PUT count, router pathname,
    Connector field, Save disabled/enabled) is unchanged.
- criterion: The full frontend suite (npm test) passes with these three files included.
  met: true
  how: 'Verified by the suite run captured for this delivery (run/reconcile-orphaned-configuration-helper-tests-rewrite-orphaned-specs-suite):
    all three files now stub every route the production hook touches once the link is set (draft route
    and the new operations-read route), so no fetch stub throws for a URL the current production code
    actually requests.'
nodes:
- node: rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing
  encoded_at:
  - src/routes/connector-configuration-form-fields-configuration-helper.spec.ts
  - src/routes/connector-configuration-form-fields-apply-confirmation.spec.ts
  - src/routes/connector-configuration-create-screen-apply-draft.spec.ts
  how: Every place these three files previously named a path or a method by typing into a free-text field
    now names it by choosing one of the fetched document's own operations from the Select (via chooseHelperOperation),
    matching the invariant that an operator names an operation by choosing it, never by typing it. The
    offering-every-operation and chosen-pair-naming clauses of this same invariant are exercised by the
    sibling task's own spec (connector-configuration-helper-fields-operation-select.spec.ts and use-connector-configuration-helper.spec.ts),
    not re-proven here, per the task's own REMAINDER note.
inferences:
- inferred: The fixture operation these three files stub the Select's single offered entry with is { path
    "/v2/translate", method "POST" } — upper-cased, matching the sibling delivery's own casing rather
    than the document's raw lower-case path-item keys.
  from: The task's own UNDERDETERMINED note, which permits any upper-cased fixture and forbids only a
    lower-case one; "/v2/translate" and "POST" were already the literal values these three files typed
    into the old free-text fields, so reusing them keeps every downstream body/text assertion (which already
    expected exactly those two literals) unchanged.
- inferred: The exact URL key each fetch stub must carry for the operations-read route is /v1/read-openapi-document-operations?link=<encoded-link>,
    built by a small operationsReadRoute helper duplicated in each of the three files rather than exported
    from a shared module.
  from: use-openapi-document-operations.ts's own apiFetch call, which builds exactly that URL; and the
    existing convention in these three files (and their siblings) of each spec file owning its own small
    local response-shaping helpers rather than importing them from a shared test-support module.
- inferred: Opening the Select and waiting for its option via await screen.findByRole("option", ...) is
    safe to call immediately after firing the link change, without a separate intermediate wait for the
    operations-read fetch to resolve.
  from: 'Reading the shared Select component: the trigger''s own open/closed state is local and independent
    of the options prop, so a click before data arrives opens an empty listbox that repopulates once the
    parent re-renders with the loaded operations, and findByRole''s own retry loop is what waits for that
    repopulation.'
---

## What it is

Rewrote only the three orphaned spec files' Configuration Helper interactions, reusing the operations-read stubbing and Select-selection pattern the sibling task's own spec already established; no production code was touched.

## Notes

None.
