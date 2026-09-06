---
title: Review of Case Detail's Attributes tab withdrawal
summary: 'What four passes found over the three tasks of epic/case-detail-attributes-tab: coverage over
  their 31 combined criteria, specification conformance staged over every trace binding, the project''s
  own reading rules, and a clean captured run.'
reviewed:
- src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
- src/hooks/use-case-current-version-validity.spec.ts
- src/hooks/use-case-current-version-validity.ts
- src/routes/case-attributes-tab-removed.spec.ts
- src/routes/case-detail-screen-attributes-tab-removed.spec.ts
- src/routes/case-detail-screen-current-version-validity.spec.ts
- src/routes/case-detail-screen-manifest-action.spec.ts
- src/routes/case-detail-screen-simulate-action.spec.ts
- src/routes/case-detail-screen-versions-retry.spec.ts
- src/routes/case-detail-screen-view-released-action.spec.ts
- src/routes/case-detail-screen.tsx
tasks:
- task/case-detail-attributes-tab/unwire-attributes-tab-from-case-detail
- task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
- task/case-detail-attributes-tab/remove-attributes-tab-modules
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/case-detail-attributes-tab-removal) passed in full; there was no failure
    to diagnose
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
coverage:
- criterion: Case Detail renders exactly two tab triggers, labelled Versions and Hypotheses.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
    name: renders exactly the Versions and Hypotheses tab triggers, with no third trigger
- criterion: case-detail-screen.tsx renders no tab trigger with the value "attributes".
  state: covered
  tests:
  - file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
    name: renders exactly the Versions and Hypotheses tab triggers, with no third trigger
- criterion: case-detail-screen.tsx renders no tab content with the value "attributes".
  state: uncovered
  why: 'No test reads case-detail-screen.tsx for a tab-content element, and none can reach one at runtime:
    a TabsContent whose value no trigger selects mounts nothing, so the Consolidation-register absence
    checks would pass even if such a content were still declared in the file. The imports test inspects
    only import specifiers, and the tree-wide identifier scan in the sibling spec applies only to *.spec.ts/*.spec.tsx
    files, never to case-detail-screen.tsx itself.'
- criterion: case-detail-screen.tsx imports nothing from routes/case-attributes-tab.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
    name: imports nothing from routes/case-attributes-tab
- criterion: Versions is the tab selected on Case Detail's first render.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
    name: renders exactly the Versions and Hypotheses tab triggers, with no third trigger
- criterion: Selecting the Hypotheses tab on Case Detail mounts the hypotheses tab content.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
    name: renders no content associated with the case's declared attributes while switching between Versions
      and Hypotheses
- criterion: Selecting the Versions tab on Case Detail mounts the same version-listing panel it mounted
    before this task.
  state: uncovered
  why: The only test that re-selects Versions after leaving it stubs the versions list empty, so what
    it observes on return is the no-version statement alone -- never the table, a version number, or a
    row action. The specs asserting the table and its row actions (manifest/simulate/view-released) observe
    it only on first render and never re-select the tab, so nothing would fail if re-selecting Versions
    mounted a different or emptier panel than before this task.
- criterion: No spec file in the tree asserts that Case Detail presents an Attributes tab.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
    name: contains no other spec asserting a tab trigger named or valued Attributes
- criterion: Every Case Detail spec other than the one asserting the Attributes tab passes without being
    edited.
  state: uncovered
  why: 'No test compares any spec file against its pre-delivery content -- whether a spec was edited is
    a fact of the delivery''s diff, not of a suite run, and nothing in the test set could establish it
    either way. The proof records themselves report the opposite of a literal reading: four pre-existing
    Case Detail specs had their fetch stubs extended and, in three cases, one assertion corrected, attributable
    to the sibling versions-panel task''s own new read.'
- criterion: Where the highest-numbered version a case currently holds does not read back as a case at
    that reading, the Versions panel renders a statement that the case's current version does not read
    back as a case.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the current-version statement when reading the case's only version as a case fails validation
- criterion: The version whose reading that statement answers is the highest-numbered version among those
    the case currently holds, including where the case also holds a lower-numbered draft.
  state: covered
  tests:
  - file: src/hooks/use-case-current-version-validity.spec.ts
    name: reads the case's highest-numbered version, never the lower-numbered draft, to decide the outcome
- criterion: While that statement is rendered, the Versions panel presents no title, when_to_use, subject,
    fallback, consolidation_register, state or manifest of that version, nor any fact derived from them,
    as the content the case currently stands at.
  state: partial
  why: The one test aimed at this criterion plants and denies exactly three of the seven enumerated fields
    (title, when_to_use, subject) in the failing read's own error details; it plants no fallback, consolidation_register,
    state or manifest, so a panel surfacing any of those four -- or a fact derived from them -- would
    pass every test in the set.
- criterion: The text the Versions panel renders for a current version that does not read back as a case
    differs from the text it renders where the case's version timeline could not be read.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the current-version statement when reading the case's only version as a case fails validation
- criterion: The text the Versions panel renders for a current version that does not read back as a case
    differs from the text it renders where the case currently holds no version.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the current-version statement when reading the case's only version as a case fails validation
- criterion: The text the Versions panel renders where the case's version timeline could not be read differs
    from the text it renders where the case currently holds no version.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders only the no-version statement, neither the current-version statement nor the read-did-not-complete
      statement
- criterion: Where the read of the case's highest-numbered version does not complete for a reason other
    than that version failing validation, the Versions panel renders its read-did-not-complete statement
    and not the current-version-does-not-read-back-as-a-case statement.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders the read-did-not-complete statement, not the current-version statement, when the current
      version's own read fails for any other reason
- criterion: Where the highest-numbered version the case currently holds reads back as a case at that
    reading, the Versions panel renders none of that statement.
  state: covered
  tests:
  - file: src/routes/case-detail-screen-current-version-validity.spec.ts
    name: renders neither statement once the case's highest-numbered version reads back as a case
- criterion: The Versions panel still lists every version the case currently holds with its version number
    and the actions it offered before this task, where the case's versions were read.
  state: partial
  why: 'The listing half is proven (row count, version number, state). The actions half is not: the test
    proving the listing asserts no row action at all, and every test asserting a row''s View/Continue
    editing/Simulate/Manifest links stubs the current version''s own read as succeeding -- so a panel
    that dropped or disabled the row actions while the current-version statement is rendered would fail
    nothing in the set.'
- criterion: frontend/app/src/routes/case-attributes-tab.tsx is absent from the tree.
  state: covered
  tests:
  - file: src/routes/case-attributes-tab-removed.spec.ts
    name: no longer holds the tab component's own file
- criterion: frontend/app/src/hooks/use-case-attributes-at-a-glance.ts is absent from the tree.
  state: covered
  tests:
  - file: src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
    name: no longer holds the hook's own implementation file
- criterion: No file under frontend/app/src names the identifier CaseAttributesTab.
  state: covered
  tests:
  - file: src/routes/case-attributes-tab-removed.spec.ts
    name: contains no reference to the literal identifier CaseAttributesTab anywhere in the tree
- criterion: No file under frontend/app/src names the identifier useCaseAttributesAtAGlance.
  state: covered
  tests:
  - file: src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
    name: contains no reference to useCaseAttributesAtAGlance anywhere in the tree
- criterion: frontend/app/src/routes/case-attributes-tab.test-support.ts is absent from the tree.
  state: covered
  tests:
  - file: src/routes/case-attributes-tab-removed.spec.ts
    name: no longer holds the tab's own test-support helper
- criterion: frontend/app/src/routes/case-attributes-tab.spec.ts is absent from the tree.
  state: covered
  tests:
  - file: src/routes/case-attributes-tab-removed.spec.ts
    name: no longer holds the tab's own content-level spec
- criterion: frontend/app/src/hooks/use-case-attributes-at-a-glance.spec.ts is absent from the tree.
  state: covered
  tests:
  - file: src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
    name: no longer holds the hook's own spec file
- criterion: frontend/app/src/services/case-version-record.ts is unchanged by this task's delivery.
  state: uncovered
  why: No file in the set names, reads, or compares services/case-version-record.ts against any pre-delivery
    content; unchangedness is a diff-level fact no runtime spec can assert.
- criterion: frontend/app/src/hooks/use-edit-draft-version-form.ts, errorStateKind included, is unchanged
    by this task's delivery.
  state: uncovered
  why: Nothing in the set names use-edit-draft-version-form.ts or the identifier errorStateKind, and no
    test compares that file to its pre-delivery content.
- criterion: frontend/app/src/hooks/use-case-versions.ts is unchanged by this task's delivery.
  state: uncovered
  why: No test in the set reads use-case-versions.ts or pins its content; nothing distinguishes a changed
    file from an unchanged one.
- criterion: frontend/app/src/routes/case-hypotheses-tab.test-support.ts is present in the tree and unchanged
    by this task's delivery.
  state: uncovered
  why: Presence is exercised only incidentally (two specs import mountCaseDetailScreen from it, so its
    absence would fail those imports), but no test asserts presence in its own right, and the unchanged
    half is unexercised entirely.
- criterion: The frontend type-check reports no unresolved module reference.
  state: uncovered
  why: No file in the set invokes the type-check or asserts anything about its output; evidence for this
    criterion lives in the captured run record, not in the test set.
- criterion: The frontend suite passes with no spec edited to accommodate the deleted files.
  state: uncovered
  why: A suite cannot assert its own green run, and no file in the set compares any spec against its pre-delivery
    content; the proof records report four pre-existing specs edited during this delivery, attributed
    to the sibling versions-panel task's own new read rather than to this task's deletions.
findings:
- pass: conformance
  file: src/hooks/use-case-current-version-validity.spec.ts
  where: the errorResponse helper (lines 18-20) and its use to simulate the current version failing validation,
    lines 52 and 74
  evidence: '[versionPath(4)]: () => errorResponse("CaseNotValidError"),'
  cost: A reader trusting this test as documentation of the read-refusal's shape learns HTTP 422 with
    error code CaseNotValidError for a case version that fails validation at read; the specification's
    own decided answer is HTTP 409 reporting CaseVersionNotValidError, so the two disagree on both the
    status and the name a caller would branch on.
  correction: Simulate the refusal as errorResponse("CaseVersionNotValidError", 409), matching the node's
    decided HTTP 409 / CaseVersionNotValidError shape for a read naming a stored, currently-invalid case
    version.
- pass: conformance
  file: src/routes/case-detail-screen-current-version-validity.spec.ts
  where: the errorResponse helper (lines 15-17) and its uses simulating a failing-validation read, e.g.
    lines 28, 47, 63 and 151
  evidence: '[versionDetailPath(2)]: () => errorResponse("CaseNotValidError"),'
  cost: A reader trusting this test to encode the API's own wire contract learns that a current version
    failing validation is signaled by HTTP 422 and error code CaseNotValidError; the node governing that
    read fixes it as HTTP 409 reporting CaseVersionNotValidError, so the fixture teaches the wrong contract
    to whoever next writes against it.
  correction: The errorResponse calls simulating a not-valid current version should use code "CaseVersionNotValidError"
    with status 409, not "CaseNotValidError" with the default 422.
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: line 105, the not-valid/read-failed conditional
  evidence: '{currentVersion.phase === "not-valid" && (<p>This case&apos;s current version does not read
    back as a case.</p>)} {currentVersion.phase === "read-failed" && (<p>Unable to load this case&apos;s
    version timeline.</p>)}'
  cost: The two distinct failure phases are turned into displayed text directly at the render site rather
    than through a named mapping (the file already has this shape for state labels, e.g. STATE_CELL);
    the "read-failed" string is even a byte-for-byte duplicate of the unrelated VersionsPanel load-failure
    message at line 80.
  cites: API-02
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: line 105, the not-valid/read-failed conditional
  evidence: '{currentVersion.phase === "not-valid" && (<p>This case&apos;s current version does not read
    back as a case.</p>)}'
  cost: Each of the two failure branches degrades to a typed error state with no retry offered, unlike
    the sibling isError branch of VersionsPanel (lines 76-86), which does render a Retry button; a reader
    who lands on either message has no control to re-attempt the failed per-version read.
  cites: EDG-02
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: line 104, before the not-valid/read-failed conditional
  evidence: '{currentVersion.phase === "not-valid" && (...)} / {currentVersion.phase === "read-failed"
    && (...)} followed directly by <StatusTable ... />'
  cost: useCaseCurrentVersionValidity exposes a "checking" phase for while its own version-detail request
    is in flight, but no branch renders anything for it (or "pending"), so the view awaiting that network
    response shows no explicit loading state at all while in flight.
  cites: EDG-01
- pass: standard
  file: src/routes/case-detail-screen.tsx
  where: line 81, the Retry button, and the Versions/Hypotheses tab switch
  evidence: <Button type="button" onClick={() => void refetch()}>Retry</Button>
  cost: Clicking Retry swaps the whole error section for the loaded table once the retry resolves, and
    the tab switch between Versions and Hypotheses likewise replaces panel content; neither transition
    is wrapped in an aria-live region or followed by explicit focus management, so assistive technology
    has no cue that content changed without a page navigation.
  cites: ACC-07
reconciliation: siegard-reconcile/case-detail-attributes-tab-removal.md
---

## What it is
Four passes over the three delivered tasks of epic/case-detail-attributes-tab: a coverage audit against all 31 criteria combined, a specification-conformance pass staged over every file the trace binds (11 of 17 changed files still exist to be read; the six deleted files were confirmed gone and excluded, as trace.py refuses to stage a path that no longer resolves), a standard-conformance pass against the 24 reading rules this file set brings into scope, and a captured run of the whole registry that passed in full, so the failures pass had nothing to diagnose.

## Notes
The registry's own run (run/case-detail-attributes-tab-removal) passed in full over every step; it is captured on disk but not referenced by this record, since the failures pass runs only over a run that failed and there was none to diagnose.
Two conformance findings and the case-detail-screen.tsx standard findings all sit on files this review's own tasks wrote; none reach an earlier task's own file.
The reconciliation bind restamped 10 nodes over the 11 files this pass read; 43 other bindings of those same 10 nodes, over files outside this review's set, are now reported stale by trace.py -- the route for those is /reconcile, over paths this review's file set does not name, and is not this record's to take.
Six files this change deleted (case-attributes-tab.tsx, use-case-attributes-at-a-glance.ts, case-attributes-tab.test-support.ts, case-attributes-tab.spec.ts, use-case-attributes-at-a-glance.spec.ts, case-detail-screen-attributes-tab.spec.ts) are not in `reviewed`: a deleted file states nothing, and trace.py --stage, --fold and the delivery validator itself all refuse a path that does not resolve on disk, so there is nothing a conformance pass or this record could hold them to. Their removal is confirmed instead by the coverage pass (the tree-wide existence/identifier checks in case-attributes-tab-removed.spec.ts and use-case-attributes-at-a-glance-removed.spec.ts) and by the implementation records' own `files` entries.
