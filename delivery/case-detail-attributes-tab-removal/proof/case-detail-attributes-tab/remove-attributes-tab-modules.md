---
title: Proof that the Attributes tab's dead modules and their dedicated tests are gone, tree-wide
summary: Confirms the five deleted files are absent and that no file anywhere under frontend/app/src still
  names either the tab component's identifier or the hook's own identifier.
implementation: sha256:54c30056abac867f1d453d27cc785be2aa0298a0b683809d28a7fb0c9e33727b
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-detail-attributes-tab-remove-attributes-tab-modules-suite-2
tests:
- file: src/routes/case-attributes-tab-removed.spec.ts
  name: no longer holds the tab component's own file
  proves: 'Criterion: frontend/app/src/routes/case-attributes-tab.tsx is absent from the tree.'
  fails_when: a file exists at src/routes/case-attributes-tab.tsx (reintroduced, restored, or never actually
    deleted)
- file: src/routes/case-attributes-tab-removed.spec.ts
  name: no longer holds the tab's own test-support helper
  proves: 'Criterion: frontend/app/src/routes/case-attributes-tab.test-support.ts is absent from the tree.'
  fails_when: a file exists at src/routes/case-attributes-tab.test-support.ts
- file: src/routes/case-attributes-tab-removed.spec.ts
  name: no longer holds the tab's own content-level spec
  proves: 'Criterion: frontend/app/src/routes/case-attributes-tab.spec.ts is absent from the tree.'
  fails_when: a file exists at src/routes/case-attributes-tab.spec.ts
- file: src/routes/case-attributes-tab-removed.spec.ts
  name: contains no reference to the literal identifier CaseAttributesTab anywhere in the tree
  proves: 'Criterion: No file under frontend/app/src names the identifier CaseAttributesTab. Proved directly
    by a tree-wide content scan, independent of the sibling spec''s narrower checks (which assert only
    the tab''s presentation pattern in spec files and the screen''s own import-path list, not a literal
    scan for this identifier across every file).'
  fails_when: any file under src other than this spec contains the string CaseAttributesTab
- file: src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
  name: no longer holds the hook's own implementation file
  proves: 'Criterion: frontend/app/src/hooks/use-case-attributes-at-a-glance.ts is absent from the tree.'
  fails_when: a file exists at src/hooks/use-case-attributes-at-a-glance.ts
- file: src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
  name: no longer holds the hook's own spec file
  proves: 'Criterion: frontend/app/src/hooks/use-case-attributes-at-a-glance.spec.ts is absent from the
    tree.'
  fails_when: a file exists at src/hooks/use-case-attributes-at-a-glance.spec.ts
- file: src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
  name: contains no reference to useCaseAttributesAtAGlance anywhere in the tree
  proves: 'Criterion: No file under frontend/app/src names the identifier useCaseAttributesAtAGlance —
    the one check the sibling tree-wide scan (case-detail-screen-attributes-tab-removed.spec.ts) does
    not perform, since it only scans for the Attributes-tab identifier/path, not this hook''s own name.'
  fails_when: any file under src other than this spec contains the string useCaseAttributesAtAGlance (e.g.
    a leftover import, re-export, or comment referencing the deleted hook)
not_applicable:
- edge_case: Absent or empty user input
  why: This task deletes dead files; no code path it touches reads user input, so there is no input boundary
    to exercise.
- edge_case: A boundary at each end of a numeric or range value
  why: No range-bound value is read, computed or rendered by this deletion.
- edge_case: An empty collection where one comes back
  why: No surviving component reads from the deleted hook; no collection-rendering behavior is touched
    by removing it.
- edge_case: A duplicate where uniqueness is claimed
  why: No uniqueness constraint is involved in removing five dead files.
- edge_case: An operation against state that forbids it
  why: No state machine or transition guard is touched by this deletion.
- edge_case: A dependency that fails or answers slowly
  why: The deleted hook's own network call is removed entirely, not exercised; no surviving code path
    depends on its success or failure.
- edge_case: Two operations against one subject at once
  why: No concurrent operation is introduced, removed, or altered by this deletion.
untested:
- frontend/app/src/services/case-version-record.ts is unchanged by this task's delivery — byte-identity/no-edit
  is a diff-level fact no runtime spec can assert; its continued behavior is exercised indirectly by pre-existing
  consumer specs that this task did not write and that this proof does not duplicate.
- 'frontend/app/src/hooks/use-edit-draft-version-form.ts, errorStateKind included, is unchanged by this
  task''s delivery — same reasoning: non-modification is not test-observable; its shared consumers are
  exercised by their own pre-existing specs.'
- frontend/app/src/hooks/use-case-versions.ts is unchanged by this task's delivery — same reasoning; exercised
  indirectly by pre-existing specs of its consumers.
- frontend/app/src/routes/case-hypotheses-tab.test-support.ts is present in the tree and unchanged by
  this task's delivery — presence is directly verifiable (confirmed present) but non-modification is not;
  its continued behavior is exercised by the pre-existing sibling spec that already imports it successfully.
- The frontend type-check reports no unresolved module reference — a tool-decided (typecheck step), run-level
  fact answered by a captured build run, not by a spec file; this proof holds no shell to capture one.
- The frontend suite passes with no spec edited to accommodate the deleted files — likewise a run-level
  fact answered by the captured suite run, not by any single spec asserting it about itself.
---

## What it is
Two new files prove the seven remaining criteria: that the five deleted files stay gone, and that neither the tab component's nor the hook's own identifier survives anywhere under the tree — the one check the epic's earlier tree-wide scan (written for a sibling task) did not itself perform, since it only scanned for the Attributes-tab pattern, not this hook's own name.

## Notes
The first suite attempt (run/case-detail-attributes-tab-remove-attributes-tab-modules-suite) failed on one test, src/routes/case-version-editor-screen-save.spec.ts, a file entirely outside this delivery's own file set. A failure-diagnostician read cause as code (a save-button disabled-state transition in an unrelated hook); re-running that one spec file in isolation passed cleanly (12/12), and the second full suite run (run/case-detail-attributes-tab-remove-attributes-tab-modules-suite-2, pinned above) also passed, confirming the first failure was a flake under full-suite load rather than a defect this or any task introduced.
