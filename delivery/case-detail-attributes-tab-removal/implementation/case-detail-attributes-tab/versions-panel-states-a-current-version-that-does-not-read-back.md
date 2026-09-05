---
title: Versions panel discloses a current version that does not read back as a case
summary: The Versions panel on Case Detail now reads the case's highest-numbered version and states, distinctly
  from a load failure and from a case holding no version, when that version does not read back as a case.
task: sha256:ce4062d9eefc04226922313dd6d847c6ed61b3fcba87a8301f4489e90e7b8ed2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-detail-attributes-tab-versions-panel-states-a-current-version-that-does-not-read-back-build
files:
- path: src/hooks/use-case-current-version-validity.ts
  effect: new hook composing the shared useCaseVersions hook with a per-version GET (/v1/cases/{slug}/versions/{version})
    against the highest-numbered version among those the case currently holds; classifies the outcome
    via the shared errorStateKind classifier into a discriminated union (pending, no-version, checking,
    not-valid, read-failed, valid) so the caller renders without holding any fetch or decision logic itself
- path: src/routes/case-detail-screen.tsx
  effect: VersionsPanel now calls useCaseCurrentVersionValidity(slug) alongside its existing useCaseVersions(slug)
    call and, once the version list has rendered its rows, additionally renders "This case's current version
    does not read back as a case." when the outcome is not-valid, or reuses the existing "Unable to load
    this case's version timeline." text when the per-version read fails for any other reason; renders
    neither when the current version reads back cleanly. The version list, its loading/error/empty states,
    the New draft link and every row's actions are otherwise unchanged.
criteria:
- criterion: Where the highest-numbered version a case currently holds does not read back as a case at
    that reading, the Versions panel renders a statement that the case's current version does not read
    back as a case.
  met: true
  how: useCaseCurrentVersionValidity resolves the case's error-classified read of that version to phase
    "not-valid" (errorStateKind === "case-not-valid"), and VersionsPanel renders "This case's current
    version does not read back as a case." exactly when that phase holds.
- criterion: The version whose reading that statement answers is the highest-numbered version among those
    the case currently holds, including where the case also holds a lower-numbered draft.
  met: true
  how: highestNumbered() in the new hook selects strictly by version number across the whole list, with
    no draft preference (unlike the pre-existing draft-first resolution in use-case-attributes-at-a-glance.ts),
    so a lower-numbered draft never overrides a higher-numbered released version as the one read.
- criterion: While that statement is rendered, the Versions panel presents no title, when_to_use, subject,
    fallback, consolidation_register, state or manifest of that version, nor any fact derived from them,
    as the content the case currently stands at.
  met: true
  how: The hook only inspects whether the per-version read errored and, if so, its error kind; it never
    reads a field off the fetched CaseVersionRecord for display, and VersionsPanel's not-valid branch
    renders only the fixed statement text — no attribute of the record reaches the DOM. The pre-existing
    State column in the version-timeline table is unaffected but is not this criterion's target per the
    task's own Notes.
- criterion: The text the Versions panel renders for a current version that does not read back as a case
    differs from the text it renders where the case's version timeline could not be read.
  met: true
  how: '"This case''s current version does not read back as a case." (not-valid) is a distinct string
    from "Unable to load this case''s version timeline." (the list-read failure and, reused, the per-version
    read-failed branch).'
- criterion: The text the Versions panel renders for a current version that does not read back as a case
    differs from the text it renders where the case currently holds no version.
  met: true
  how: '"This case''s current version does not read back as a case." differs from the existing, unaltered
    "This case currently holds no version." text, which only renders when rows.length === 0 (current is
    then undefined, so the new hook resolves to no-version, never not-valid).'
- criterion: The text the Versions panel renders where the case's version timeline could not be read differs
    from the text it renders where the case currently holds no version.
  met: true
  how: 'This distinction pre-dates this task and is unchanged: "Unable to load this case''s version timeline."
    (isError || !data) and "This case currently holds no version." (rows.length === 0) remain the two
    distinct, pre-existing texts this task''s Notes say it must not alter.'
- criterion: Where the read of the case's highest-numbered version does not complete for a reason other
    than that version failing validation, the Versions panel renders its read-did-not-complete statement
    and not the current-version-does-not-read-back-as-a-case statement.
  met: true
  how: Any error on the per-version read whose errorStateKind is not "case-not-valid" resolves to phase
    read-failed, which renders the existing "Unable to load this case's version timeline." text and never
    the not-valid text — the two phases (not-valid, read-failed) are mutually exclusive branches of the
    same isError check.
- criterion: Where the highest-numbered version the case currently holds reads back as a case at that
    reading, the Versions panel renders none of that statement.
  met: true
  how: A successful read resolves to phase valid (and an in-flight read to checking/pending); VersionsPanel's
    conditional renders check only for phase === "not-valid" and phase === "read-failed", so neither text
    appears for valid, checking or pending.
- criterion: The Versions panel still lists every version the case currently holds with its version number
    and the actions it offered before this task, where the case's versions were read.
  met: true
  how: toRow, actionsForRow, STATE_CELL, CASE_VERSIONS_COLUMNS and the <StatusTable> render are untouched;
    the table renders unconditionally whenever rows.length > 0, alongside — never instead of — either
    new conditional statement.
nodes:
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-case-current-version-validity.ts
  - src/routes/case-detail-screen.tsx
  how: The hook reads the highest-numbered version among those the case currently holds and classifies
    its read outcome (not-valid / read-failed / no-version / valid) via the same errorStateKind classifier
    the specification's backend invariant (a-case-version-failing-validation-at-a-read-is-refused-by-name)
    is already answered against; VersionsPanel renders the three-way disclosure the node requires — a
    distinct statement for a current version that does not read back as a case, a distinct, pre-existing
    statement for a read that did not complete, and the distinct, pre-existing statement for a case holding
    no version, never two of the three alike, and no attribute of the unreadable version presented alongside.
inferences:
- inferred: The exact wording "This case's current version does not read back as a case." for the new
    statement
  from: The task's own Notes leave the wording, control and placement to the interface; the text mirrors
    the rule's own statement phrasing ("the case's current version does not read back as a case") and
    the punctuation/apostrophe-escaping style of the two sibling texts already in the file, so the three
    read as one family.
- inferred: The per-version validity read and its classification live in a new dedicated hook (use-case-current-version-validity.ts)
    rather than inline in case-detail-screen.tsx
  from: The inventory's own precedent — use-case-attributes-at-a-glance.ts already composes useCaseVersions
    with a direct apiFetch call and the errorStateKind classifier as a standalone hook returning a phase-keyed
    discriminated union, which the task's own Notes point to as the equivalent logic to reuse.
deferred:
- what: case-detail-screen-manifest-action.spec.ts, case-detail-screen-simulate-action.spec.ts and case-detail-screen-view-released-action.spec.ts
    each assert fetchMock was called exactly once for a case holding one version; case-detail-screen-versions-retry.spec.ts
    additionally asserts "Unable to load this case's version timeline." is absent once the table renders
    after a successful retry.
  why: This task's objective requires a new GET against the case's highest-numbered version whenever the
    panel renders a non-empty list, which these four pre-existing specs' fetch stubs do not register;
    the version-detail request then fails unmocked and, in the retry spec, surfaces the reused read-did-not-complete
    text the assertion expects absent. Updating or re-stubbing these specs is the test-authoring pass's
    task, not this delegation's — it writes no test and the four files are not named in this task's own
    scope.
- what: routes/case-attributes-tab.tsx and hooks/use-case-attributes-at-a-glance.ts still stand in the
    tree, unreached from case-detail-screen.tsx.
  why: Explicitly named by this task's own preamble as a different task's job, and this delegation holds
    no shell to delete or rename a file in any case.
preserved:
- The Versions panel's loading placeholder ("Loading version timeline…") while the version list is in
  flight.
- The version-list load-failure state ("Unable to load this case's version timeline." plus its Retry button
  re-issuing GET /v1/cases/{slug}/versions) exactly as it behaved before this task.
- The no-versions empty state ("This case currently holds no version.") and the New draft link's visibility
  rule (rendered only where no version is currently a draft).
- Every version row's version number, State cell, and its actions (Continue editing / View, Simulate,
  Manifest) exactly as toRow/actionsForRow already built them.
---

## What it is
A new hook, use-case-current-version-validity.ts, resolves a case's highest-numbered version and classifies a per-version read of it (via the shared errorStateKind classifier) into a discriminated outcome. VersionsPanel in case-detail-screen.tsx consumes it and renders, alongside the unchanged version-list table, a distinct statement for a current version that fails validation and the existing statement for a read that did not complete, never both and never neither.
The version list itself — its loading, load-failure and empty states, the New draft link and every row's actions — is untouched.

## Notes
This task's own dependency (unwire-attributes-tab-from-case-detail) has already been delivered; the Attributes tab component and its hook are unreached from case-detail-screen.tsx but still stand in the tree, left for the task that removes them.
A real regression surfaces at suite time and is disclosed in `deferred`: four pre-existing specs (case-detail-screen-manifest-action.spec.ts, case-detail-screen-simulate-action.spec.ts, case-detail-screen-view-released-action.spec.ts, case-detail-screen-versions-retry.spec.ts) do not stub the new per-version GET this task introduces, so their fetch mocks now leave that call unhandled — the prove step's own tests must account for this alongside proving this task's own criteria.
