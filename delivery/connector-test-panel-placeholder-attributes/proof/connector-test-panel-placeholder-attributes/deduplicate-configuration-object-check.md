---
title: Add-attribute reconciliation coverage in the capability-picker spec
summary: Adds one test to connector-test-panel-capability-picker.spec.ts proving Add attribute reconciles
  a row already named for a Configuration placeholder in this file's own context, closing this task's
  criterion 2; criterion 1 is a pure internal deduplication needing no new test.
implementation: sha256:c13a00ffa44d37ee49bf9346637f99e73a447404f256110743051e77d754ff13
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-placeholder-attributes-deduplicate-configuration-object-check-suite
tests:
- file: src/routes/connector-test-panel-capability-picker.spec.ts
  name: ConnectorTestPanel — Add attribute reconciles to a row already named for Configuration's own placeholder
    (task/connector-test-panel-placeholder-attributes/deduplicate-configuration-object-check, criterion
    2) > adds a row already named for Configuration's own placeholder, not an empty row
  proves: connector-test-panel-capability-picker.spec.ts contains at least one test that clicks "Add attribute"
    against a Configuration text embedding a subject-attribute placeholder and asserts the resulting row
    reflects that placeholder, so the file would fail if the reconciliation behavior regressed to the
    old append-one-empty-row behavior.
  fails_when: 'onAddAttribute regresses to the old append-one-empty-row behavior (or any behavior that
    does not reconcile the panel''s rows against the ${subject:<attribute>} placeholders Configuration''s
    own current text embeds): the row this test finds would then carry an empty Attribute value (or a
    name other than "picker-panel-subject-id") instead of the placeholder''s own name, and the toBe assertion
    fails.'
not_applicable:
- edge_case: Multiple placeholders, stable-row-identity, no-extra-network-request, and free-typed Value
    edge cases raised by the same reconciliation behavior.
  why: already exercised in full by the sibling connector-test-panel-subject-and-attributes.spec.ts, which
    this task's own criterion 2 does not ask this file to duplicate -- it asks only that this file's own
    context (capability-picker fixtures, this file's own mount) reach the behavior at all, closing the
    specific coverage gap named by reconcile-test-panel-attribute-rows's own criterion 7 for this file.
- edge_case: Criterion 1 -- the shared isPlainRecord extraction -- needing a test of its own.
  why: 'a pure internal-structure deduplication with no new externally observable behavior, per the task''s
    own framing: parsesAsConfigurationObject''s and the placeholder-derivation functions'' existing specs
    (use-test-connector-panel''s own onAddAttribute tests and simulation-subject-derivation.spec.ts) already
    cover the behavior isPlainRecord gates, and stay untouched; a test over the call graph itself (which
    module calls which) would bind to the code''s internal shape rather than to observable behavior.'
untested:
- no observable behavior of parsesAsConfigurationObject or the placeholder-derivation functions changed
  by this task's own extraction, so nothing new is left unproven beyond what the pre-existing specs for
  those functions already leave unproven
---

## What it is
One new test in connector-test-panel-capability-picker.spec.ts, proving this task's own criterion 2: a click on "Add attribute" against a Configuration text embedding a subject-attribute placeholder reconciles to a row already named for that placeholder, in this file's own context (its own fixtures and its own mount), rather than the old append-one-empty-row behavior.
Criterion 1 (the shared isPlainRecord extraction) is a pure internal deduplication with no new externally observable behavior; it is proved by the existing specs for parsesAsConfigurationObject and the placeholder-derivation functions, left untouched and still passing, so no new test was written for it.

## Notes
None beyond what `not_applicable` and `untested` above already state.
