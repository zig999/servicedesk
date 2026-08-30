---
title: Proof for rewriting the reconciliation tie-break test's collision setup
summary: Confirms the rewritten tie-break test proves criteria 1-3 through Configuration-text edits rather
  than an Attribute-field rename, and that every other test in the file is unchanged; the full suite passes.
implementation: sha256:2bb01728ad45e379fb916c1ee59ae6adf1df9c707c4d4f53c1d43ff48a948d53
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-reconciliation-test-rename-rewrite-tie-break-test-collision-setup-suite-2
tests:
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — the first row keeps a name two rows come to share > keeps the earlier row's
    own value and drops the later duplicate's, once two rows share one attribute name
  proves: connector-test-panel-attribute-reconciliation.spec.ts's tie-break test no longer calls fireEvent.change
    on an Attribute field to induce the collision.
  fails_when: the test's collision step targets an Attribute input again (e.g. fireEvent.change on getAllByLabelText("Attribute"))
    -- the only remaining reference to "Attribute" anywhere in the file is the read-only attributeValues()
    query used solely for assertions.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — the first row keeps a name two rows come to share > keeps the earlier row's
    own value and drops the later duplicate's, once two rows share one attribute name
  proves: connector-test-panel-attribute-reconciliation.spec.ts's tie-break test induces the collision
    by editing Configuration's own text so two placeholders resolve to the same subject-attribute name,
    then clicking "Add attribute" again.
  fails_when: the second setConfigurationText call stops making both the address's and the body's placeholders
    resolve to the same name ("account-id"), or the clickAddAttribute(dialog) call immediately following
    that edit is removed, reordered before the edit, or replaced with a click against a different control.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — the first row keeps a name two rows come to share > keeps the earlier row's
    own value and drops the later duplicate's, once two rows share one attribute name
  proves: The rewritten test still asserts that the earlier row's own value is kept and the later duplicate's
    is dropped once the two rows share one attribute name -- and the disclosed inference of which shared
    name and which surviving value the test exercises ("account-id"/"111", the first-declared placeholder
    and the first-typed row).
  fails_when: reconcileAttributeRows (use-test-connector-panel.ts) stops keeping the row typed first ("111")
    for the collapsed "account-id" name, keeps or resurrects the value typed into the row whose own name
    ("region") no placeholder still names ("222"), or leaves more than one row after the second "Add attribute"
    click.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: every describe/it block in the file other than the tie-break test (criteria 1-6 of the sibling
    reconciliation task, the still-matching-row-keeps-its-id test, and the placeholder-order test)
  proves: Every other test in connector-test-panel-attribute-reconciliation.spec.ts is unchanged.
  fails_when: a line-by-line reading of the file outside the tie-break test shows any difference from
    what stood before this task -- confirmed absent by reading the whole file end to end after the edit.
not_applicable:
- edge_case: two clicks of "Add attribute" racing each other, or two collision-inducing Configuration
    edits arriving concurrently
  why: no criterion this task states, and no specification node it implements, describes concurrent-click
    or concurrent-edit behavior; the tie-break test induces its collision through two sequential, awaited
    edits and clicks, and a race test here would assert a guarantee nothing bound to this task makes.
- edge_case: the collision-inducing Configuration edit itself being malformed or empty JSON
  why: already proven, independently of this task and unmodified by it, by the file's own criterion-6
    describe block ("leaves existing rows untouched... does not parse as a JSON object"); asserting it
    again under the tie-break test's own name would prove the same fact twice under a different label
    rather than proving anything new.
- edge_case: shared state or ordering dependence across this file's own tests
  why: every test calls mountTestPanelInEditMode to stand up a fresh router, QueryClient and render, and
    the file's own afterEach(() => vi.unstubAllGlobals()) tears down the one piece of state any test sets
    globally (the stubbed fetch) -- both unchanged by this task and already relied on by every other test
    in the file.
divergences:
- from: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  departure: This proof does not add a test holding onAddAttribute (use-test-connector-panel.ts) to that
    rule's own requirement that a test exercises the registered configuration, never unsaved authoring
    text -- an independent check by this task's own test-author found production code violates that requirement,
    and the caller (human-directed) moved that finding to a new, separate corrective increment rather
    than folding a production fix into this test-only task.
  why: This task was cut narrowly as a rewrite of one existing test's own setup mechanism, with no production
    (non-test) source in scope; the caller's own decision was to keep that scope intact and cut the production
    fix as its own increment, tracked separately, rather than widen this one.
---

## What it is
Proof that the rewritten tie-break test induces its collision through Configuration-text edits rather than an Attribute-field rename, still proves the tie-break outcome, and leaves every other test in the file untouched; the full suite passes.

## Notes
An independent check by this task's own test-author found that onAddAttribute (use-test-connector-panel.ts) does not yet honor rules/integration/a-connector-configuration-is-tested-through-a-registered-capability's own requirement that a test exercises the registered configuration rather than unsaved authoring text; the test proving that requirement was moved to a new corrective increment (connector-test-panel-attribute-reconciliation-uses-registered-configuration) rather than folded into this test-only task, per the human's own decision.
Two suite runs stand for this delivery: the first (run/connector-test-panel-reconciliation-test-rename-rewrite-tie-break-test-collision-setup-suite) failed on the now-relocated test above and on one unrelated flake (case-version-editor-screen-save.spec.ts, diagnosed cause: setup); this record's own run is the second attempt, after the relocated test was removed, and it passed clean including that previously-flaky test.
