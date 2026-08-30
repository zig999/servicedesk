---
title: Reconciliation of the test panel's attribute rows against Configuration's placeholders
summary: Proves useTestConnectorPanel's reconciled onAddAttribute (add/preserve/remove/exclude/dedupe/invalid-JSON,
  and its three disclosed row-identity/tie-break/order inferences) and brings the five named spec/fixture
  files back to green against that behavior, by seeding one shared subject-attribute placeholder into
  the mount fixture's own configuration text and, for the reconciliation-specific cases, editing the same
  "Configuration" textarea the production route itself feeds into ConnectorTestPanel.
implementation: sha256:7b88db065836d5a6478f80216a9b6bb9d2103ef5a52acfccff17691030d201b0
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/connector-test-panel-placeholder-attributes-reconcile-test-panel-attribute-rows-suite
tests:
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — "Add attribute" adds one row per placeholder with no existing row (criterion
    1) > adds exactly one empty-valued row for each subject-attribute placeholder Configuration's current
    text names, when no row exists yet
  proves: Clicking "Add attribute" adds exactly one row, with an empty value, for each subject-attribute
    name found in Configuration's current text that has no existing row.
  fails_when: onAddAttribute stops adding a fresh, empty-valued row per placeholder name that has no existing
    row -- e.g. it drops a newly-introduced placeholder, seeds fewer rows than there are distinct names,
    or seeds a row with a non-empty default value.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — "Add attribute" preserves an existing row's value while its placeholder is
    still present (criterion 2) > keeps the value already typed into a row whose attribute still names
    a current placeholder, and does not duplicate it
  proves: Clicking "Add attribute" preserves the value already entered in a row whose attribute name matches
    a subject-attribute placeholder still present in Configuration's current text.
  fails_when: onAddAttribute blanks or regenerates the row for an attribute name still present among Configuration's
    own current placeholders, or a second click appends a duplicate row for a name already represented.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — "Add attribute" removes a row whose placeholder is no longer present (criterion
    3) > drops the account-id row and adds the region row once Configuration's text no longer names account-id
  proves: Clicking "Add attribute" removes any row whose attribute name matches no subject-attribute placeholder
    currently present in Configuration's text.
  fails_when: onAddAttribute keeps the account-id row after Configuration's text no longer names it, or
    fails to add the newly-named region row in the same reconciliation.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: 'ConnectorTestPanel — "Add attribute" removes a row whose placeholder is no longer present (criterion
    3) > removes every row, leaving none, once Configuration''s text names no placeholder at all (edge
    case: an empty collection where one previously existed)'
  proves: Clicking "Add attribute" removes any row whose attribute name matches no subject-attribute placeholder
    currently present in Configuration's text -- the boundary where the current placeholder set is empty.
  fails_when: onAddAttribute leaves the stale account-id row in place once Configuration's text names
    no subject-attribute placeholder at all.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — "Add attribute" excludes ${requester} and ${credential:...} placeholders
    (criterion 4) > adds a row only for the ${subject:...} placeholder, never for ${requester} or ${credential:...}
    in the same text
  proves: Clicking "Add attribute" excludes ${requester} and ${credential:...} placeholders from the rows
    it adds, keeping only a placeholder naming a Subject attribute.
  fails_when: onAddAttribute adds a row for ${requester} or ${credential:api-key} alongside (or instead
    of) the ${subject:account-id} row.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — "Add attribute" collapses one placeholder name repeated across sections to
    a single row (criterion 5) > adds exactly one row for account-id even though its placeholder repeats
    in the address, the query, the headers and the body
  proves: Clicking "Add attribute" produces at most one row per distinct attribute name even where that
    name's placeholder appears more than once across address, query, headers and body.
  fails_when: onAddAttribute adds more than one row for account-id when its placeholder repeats across
    the four sections.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — "Add attribute" leaves existing rows untouched when Configuration's text
    does not parse as a JSON object (criterion 6) > leaves the existing row's own attribute and value
    exactly as they were, when Configuration's text fails to parse as JSON at all
  proves: Clicking "Add attribute" when Configuration's current text does not parse as a valid JSON object
    leaves the existing rows exactly as they were before the click -- the syntactically-invalid case.
  fails_when: onAddAttribute reconciles anyway against unparseable Configuration text, altering or removing
    the existing account-id row instead of leaving it untouched.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — "Add attribute" leaves existing rows untouched when Configuration's text
    does not parse as a JSON object (criterion 6) > leaves the existing row untouched when Configuration's
    text parses to a JSON array rather than an object
  proves: Clicking "Add attribute" when Configuration's current text does not parse as a valid JSON object
    leaves the existing rows exactly as they were before the click -- the parses-but-not-an-object case
    (a JSON array).
  fails_when: onAddAttribute treats a parsed JSON array as a valid configuration object and reconciles
    against it, altering the existing row.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: 'ConnectorTestPanel — "Add attribute" leaves existing rows untouched when Configuration''s text
    does not parse as a JSON object (criterion 6) > leaves rows exactly as they were when Configuration''s
    text is empty (edge case: empty input)'
  proves: Clicking "Add attribute" when Configuration's current text does not parse as a valid JSON object
    leaves the existing rows exactly as they were before the click -- the empty-input edge case.
  fails_when: onAddAttribute treats an empty Configuration text as parseable and reconciles against it,
    altering or removing the existing row.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — a still-matching row keeps its own identity across a reconciliation (disclosed
    inference) > keeps rendering the very same Value input for a row whose placeholder is still present,
    rather than replacing it with a new element
  proves: the implementation's disclosed inference -- "A row whose attribute name still matches a currently-present
    placeholder keeps its own existing id, rather than being assigned a freshly generated one."
  fails_when: reconcileAttributeRows mints a fresh id for a row whose attribute still matches a current
    placeholder, so React replaces rather than reuses the Value input's own DOM element (connector-test-panel-fields.tsx's
    own key={row.id} changing under it).
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — the first row keeps a name two rows come to share (disclosed inference) >
    keeps the earlier row's own value and drops the later duplicate's, once two rows share one attribute
    name
  proves: the implementation's disclosed inference -- "Where two existing rows already share one attribute
    name ... the first occurrence (in currentRows' own array order ...) is the one kept."
  fails_when: reconcileAttributeRows keeps the later row's own value ("222") instead of the earlier row's
    ("111") once two rows come to share one attribute name, or drops both instead of keeping either.
- file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  name: ConnectorTestPanel — reconciled rows follow Configuration's own current placeholder order (disclosed
    inference) > re-orders the rows to match the placeholder order Configuration's text currently declares,
    even though that order differs from the rows' own prior order
  proves: the implementation's disclosed inference -- "The reconciled row order follows placeholderNames'
    own declared order ... rather than preserving currentRows' prior order."
  fails_when: reconcileAttributeRows preserves the rows' own prior array order (alpha, beta) instead of
    the freshly read placeholder order (beta, alpha) once Configuration's text changes which section names
    which attribute.
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: ConnectorTestPanel — attribute-values are typed by hand, never selected from an existing subject
    (criterion 2) > adds a row already named for Configuration's own placeholder, and lets the operator
    type its value (reconciliation)
  proves: connector-test-panel-subject-and-attributes.spec.ts ... pass[es] against this reconciliation
    behavior in place of the old append-one-empty-row behavior (this task's own criterion 7).
  fails_when: '"Add attribute" stops seeding a row already named "account-id" for Configuration''s own
    placeholder (e.g. reverts to appending a blank-named row), or the added row''s Value field can no
    longer be edited afterward.'
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: ConnectorTestPanel — attribute-values are typed by hand, never selected from an existing subject
    (criterion 2) > removes exactly the row whose own Remove action was clicked, leaving the other rows'
    own values intact (stable-row-identity inference)
  proves: connector-test-panel-subject-and-attributes.spec.ts ... pass[es] against this reconciliation
    behavior in place of the old append-one-empty-row behavior (this task's own criterion 7), together
    with onRemoveAttribute's preserved by-id filtering.
  fails_when: '"Add attribute" fails to reconcile all three declared placeholders (first-attribute, second-attribute,
    third-attribute) into rows in one click, or Remove attribute''s own by-id filtering stops leaving
    the other two rows'' own values intact.'
- file: src/routes/connector-test-panel-subject-and-attributes.spec.ts
  name: ConnectorTestPanel — attribute-values are typed by hand, never selected from an existing subject
    (criterion 2) > issues no network request beyond the panel's own two dependent reads while a subject
    is assembled by hand
  proves: connector-test-panel-subject-and-attributes.spec.ts ... pass[es] against this reconciliation
    behavior in place of the old append-one-empty-row behavior (this task's own criterion 7).
  fails_when: onAddAttribute or a subsequent Value-field edit issues a network call -- e.g. if reconciliation
    were ever wired to a read it does not need.
not_applicable:
- edge_case: A dependency that fails or answers slowly, reached while "Add attribute" reconciles.
  why: onAddAttribute reads only configurationTextRef.current (a plain string already held in local state)
    synchronously through parsesAsConfigurationObject and subjectPlaceholderNamesInConfiguration -- both
    pure, synchronous functions with no network or timer involved -- so there is no dependency this reconciliation
    could observe failing or answering slowly.
- edge_case: Two "Add attribute" clicks in quick succession (an operation against one subject at once).
  why: unlike onTest (guarded by isDispatchingRef against a genuine async race), onAddAttribute's own
    reconciliation is a synchronous, idempotent read-then-setAttributes call with no async gap between
    reads; two clicks against an unchanged Configuration text produce the identical result twice rather
    than a corrupted one, and no criterion of this task states a debounce or disabled-state guard for
    this button the way criterion 7 of the sibling debug-panel task states one for Test.
- edge_case: Configuration text that parses as valid JSON but is null or a bare primitive (not an array),
    as a further instance of criterion 6.
  why: parsesAsConfigurationObject's own boolean expression (typeof parsed === "object" && parsed !==
    null && !Array.isArray(parsed)) is already exercised on two of its three failing branches by the syntactically-invalid-JSON
    test (throws before the check) and the JSON-array test (fails Array.isArray); a null or primitive
    input trips the same parsed !== null / typeof parsed === "object" branches the array case already
    falsifies through the same single expression, so a further test would repeat the array case's own
    code path rather than reach a branch nothing else exercises.
- edge_case: '"Add attribute" rendered in a disabled state under some condition.'
  why: connector-test-panel-fields.tsx's own "Add attribute" Button carries no disabled prop at all, and
    no criterion of this task (or of the sibling debug-panel task its own Notes point to) states one;
    there is no forbidding state to construct a test against.
untested:
- 'connector-test-panel-capability-picker.spec.ts was read in full and left unmodified: none of its own
  tests click "Add attribute" or otherwise touch the attribute rows, so its own continued passing under
  the new default configuration text rests on that reading rather than on a test added or changed by this
  proof.'
divergences:
- cites: TST-04
  file: src/routes/connector-test-panel-attribute-reconciliation.spec.ts
  departure: This new file's own name does not read as "the unit's own name plus .spec" for a single unit
    -- it is one of five topic-suffixed spec files (connector-test-panel-subject-and-attributes.spec.ts,
    -capability-picker.spec.ts, -dispatch-safety.spec.ts, -request-response.spec.ts, and now -attribute-reconciliation.spec.ts)
    that together cover connector-test-panel.tsx and use-test-connector-panel.ts, each named for the slice
    of behavior it proves rather than for the file it covers.
  why: This split is the codebase's own established, already-shipped convention for this exact component
    (all four sibling files predate this task), continued here rather than introduced by it; splitting
    reconciliation's own six criteria and three disclosed inferences into connector-test-panel-subject-and-attributes.spec.ts's
    existing describe blocks (about a different task's criterion 2) would have crammed a new task's proof
    into describe blocks about something else, which the task's own scope explicitly discourages. Disclosed
    regardless, since the rule is stated per-file and this file is new.
---

## What it is
Tests proving useTestConnectorPanel's reconciled onAddAttribute against every criterion of task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows and its three disclosed inferences, plus the five named spec/fixture files updated to pass against that reconciliation behavior in place of the old append-one-empty-row behavior.

## Notes
The suite run this record pins ran after two earlier build attempts against this same delivery's implementation failed for an environment cause disclosed in the implementation record's own Notes (the target source root's frontend/tui git submodule, and that submodule's own dependencies, were absent from this worktree) -- resolved before this proof's own suite run, so this run's own pass reflects this task's source and tests alone.
