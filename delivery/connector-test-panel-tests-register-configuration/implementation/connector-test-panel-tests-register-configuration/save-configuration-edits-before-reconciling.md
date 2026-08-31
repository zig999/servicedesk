---
title: Save Configuration edits before reconciling in the affected tests
summary: The seven tests across three spec files that edit Configuration and then rely on "Add attribute"
  reconciling against that edit now save the edit through the real Save action and await it settling first,
  matching the production route the sibling corrective delivery already changed "Add attribute" to read
  from.
task: sha256:6709bf488fa0e753a36bbf5ee3ca355f61393827e31dd513b9be400f3b46189a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-tests-register-configuration-save-configuration-edits-before-reconciling-build
files:
- path: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  effect: adds a local saveConfiguration(dialog) helper (clicks the "Save" button and awaits a real timer
    tick) beside the file's own existing setConfigurationText/clickAddAttribute helpers, and calls it
    immediately after every Configuration edit that a subsequent "Add attribute" click in the five affected
    tests depends on. No other test in the file changed.
- path: src/routes/connector-test-panel-capability-picker.spec.ts
  effect: inserts an inline Save click plus a real-timer-tick await, between the Configuration edit and
    the "Add attribute" click, in the one affected test. No other test in the file changed.
- path: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  effect: inserts the same inline Save click plus real-timer-tick await, between the Configuration edit
    and the "Add attribute" click, in the one affected test. No other test in the file changed.
criteria:
- criterion: Each of the five affected tests in connector-test-panel-attribute-reconciliation.spec.ts
    (adds one row per placeholder with no existing row; removes a row whose placeholder is no longer present
    -- both the drops-and-adds case and the removes-every-row case; keeps the earlier row's own value
    in a tie; reconciled rows follow Configuration's own current placeholder order) saves each Configuration
    edit (clicking the "Save" button and awaiting the save settling) before the "Add attribute" click
    that depends on that edit having taken effect.
  met: true
  how: Each of the five tests now calls the file's own new saveConfiguration(dialog) helper -- fireEvent.click
    on the "Save" button followed by a real timer-tick await -- immediately after every setConfigurationText
    call that precedes an Add-attribute click depending on it. The tie test and the placeholder-order
    test each edit Configuration twice and each edit is followed by its own save.
- criterion: The affected test in connector-test-panel-capability-picker.spec.ts ("adds a row already
    named for Configuration's own placeholder, not an empty row") saves its Configuration edit before
    the "Add attribute" click that depends on it.
  met: true
  how: The test now clicks "Save" and awaits the same real-timer-tick flush directly after fireEvent.change
    on the Configuration textarea, before the pre-existing fireEvent.click on "Add attribute".
- criterion: The affected test in connector-test-panel-subject-and-attributes.spec.ts ("removes exactly
    the row whose own Remove action was clicked, leaving the other rows' own values intact") saves its
    Configuration edit before the "Add attribute" click that depends on it.
  met: true
  how: The test now clicks "Save" and awaits the same real-timer-tick flush directly after fireEvent.change
    on the Configuration textarea, before the pre-existing fireEvent.click on "Add attribute".
- criterion: Every one of the seven tests still asserts exactly the outcome it asserted before this task
    -- only its own setup steps change.
  met: true
  how: No assertion in any of the seven tests was touched; every insertion sits strictly between an existing
    Configuration edit and an existing Add-attribute click, and no other line in any of the seven test
    bodies changed.
- criterion: No test outside these seven, in these three files or any other, is changed.
  met: true
  how: Read all three files in full before editing and touched only the seven named it blocks -- every
    other test in all three files is byte-for-byte unchanged; none of them edits Configuration against
    a value differing from the already-registered default, so none needed a save.
- criterion: The full suite passes.
  met: true
  how: Each inserted save clicks a button enabled at that point (the edited Configuration text is a valid,
    non-empty JSON object differing from the current baseline) and is stubbed to resolve successfully;
    the mutation's onSuccess re-baselines configurationBaseline to the just-submitted text regardless
    of the response body, which is what the sibling delivery threads to ConnectorTestPanel as registeredConfigurationText.
    Confirmed against the captured suite run named in this record's proof.
nodes:
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  how: This task adds no production source; the rule's own requirement -- that the test's subject is assembled
    from the configuration currently registered under the connector's name, never an unsaved edit -- was
    encoded into production code by the sibling corrective delivery connector-test-panel-reads-registered-configuration.
    This task's own contribution is bringing the seven affected tests' setup back into agreement with
    that already-encoded behavior.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  how: Only the ${subject:<attribute-name>} placeholder clause of this rule is exercised by these seven
    tests, per the task's own REMAINDER note; no production source changed here, and the seven tests'
    own Configuration text (bearing ${subject:...} placeholders) is now saved before the reconciliation
    read that this rule's placeholder mechanism ultimately feeds.
- node: rules/investigation/a-subject-holds-one-value-per-attribute
  how: 'The tie test is one of the seven affected: both its Configuration edits are now saved before their
    respective Add-attribute clicks, so the test actually exercises the first-occurrence-wins reconciliation
    this rule states, against the registered configuration rather than a stale unsaved edit. No production
    source changed by this task.'
- node: domain/integration/connector-configuration
  how: The configuration attribute this value object declares -- opaque JSON text, replaced whole on every
    edit -- is exactly what each inserted Save click submits through the PUT the mutation issues; this
    task exercises that replace-whole-on-save behavior through the existing tests rather than adding any
    new encoding of it.
- node: domain/investigation/subject-attribute-value
  how: The attribute/value pairs the reconciled rows hold are this value object's own shape, encoded elsewhere
    and unchanged by this task; this task only corrects when the seven tests' own setup saves the Configuration
    text those rows reconcile against.
inferences:
- inferred: The save is awaited with a real timer tick (await new Promise((resolve) => setTimeout(resolve,
    0))) rather than waitFor/findByText on a save-acknowledgement element.
  from: mountTestPanelInEditMode's own final flush (connector-test-panel.test-support.ts) is the example
    named to match, and the save mutation settles asynchronously on the same kind of schedule that flush
    already exists to drain -- matching the file's own established async convention rather than introducing
    a new one.
- inferred: A shared saveConfiguration(dialog) helper was added to connector-test-panel-attribute-reconciliation.spec.ts
    (used across its five affected tests), while the same two-line save step was written inline in the
    other two files.
  from: connector-test-panel-attribute-reconciliation.spec.ts already establishes a convention of small,
    named local helpers that its tests compose; the other two files each need the step only once and had
    established no such helper-extraction convention, so inlining there stays consistent with each file's
    own existing shape.
preserved:
- connector-test-panel-attribute-reconciliation.spec.ts's own criterion-2, criterion-4, criterion-5 and
  criterion-6 (all three cases) tests, and its still-matching-row-identity test -- untouched.
- connector-test-panel-capability-picker.spec.ts's own capability-picker, input-schema-fallback and Test-section-edit-mode
  tests, all four untouched.
- connector-test-panel-subject-and-attributes.spec.ts's own subject-type-vocabulary, plain-hand-typed-attribute,
  no-extra-network-request, plain-text-input and requester-free-text tests, all five untouched.
- Every one of the seven affected tests' own existing assertions -- only the setup preceding the dependent
  "Add attribute" click changed.
---

## What it is
The seven pre-existing tests (three files) that edit Configuration and rely on "Add attribute" reconciling against that edit now save it first through the real Save action, matching the sibling delivery that made the panel read the registered configuration rather than an unsaved edit.

## Notes
None.
