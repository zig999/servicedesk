---
title: Remove the Attributes tab's modules and their dedicated tests
summary: The tab component, its data hook and the three test files written solely for them taken out of
  the tree, with every shared module they imported left standing.
rationale: 'Cut as its own task because the modules'' removal is a different outcome from the screen''s
  wiring and is demonstrable on its own; it builds on the unwiring, since while case-detail-screen.tsx
  still imports the tab the module and its consumer would change together, and it now also builds on the
  relocation task, since the modules removed here hold the only existing implementation of the disclosure
  that task relocates onto the Versions panel — deleting them first would be deleting the fact rather
  than a duplicate of it. It implements no specification node: rebinding it after both siblings were cut
  found every clause of a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  and a-presented-case-version-states-its-own-declared-attributes already answered — the first by the
  relocation task this one depends on, the second by the pre-existing Version Editor screen this task
  does not touch — leaving this task pure dead-code removal, ungoverned by the specification.'
sources:
- work/case-detail-attributes-tab-removal/intake/scope.md
objective: The frontend tree holds no module or test that existed only for the Attributes tab, and every
  shared module those files imported is still present and still serving its other consumers.
criteria:
- frontend/app/src/routes/case-attributes-tab.tsx is absent from the tree.
- frontend/app/src/hooks/use-case-attributes-at-a-glance.ts is absent from the tree.
- No file under frontend/app/src names the identifier CaseAttributesTab.
- No file under frontend/app/src names the identifier useCaseAttributesAtAGlance.
- frontend/app/src/routes/case-attributes-tab.test-support.ts is absent from the tree.
- frontend/app/src/routes/case-attributes-tab.spec.ts is absent from the tree.
- frontend/app/src/hooks/use-case-attributes-at-a-glance.spec.ts is absent from the tree.
- frontend/app/src/services/case-version-record.ts is unchanged by this task's delivery.
- frontend/app/src/hooks/use-edit-draft-version-form.ts, errorStateKind included, is unchanged by this
  task's delivery.
- frontend/app/src/hooks/use-case-versions.ts is unchanged by this task's delivery.
- frontend/app/src/routes/case-hypotheses-tab.test-support.ts is present in the tree and unchanged by
  this task's delivery.
- The frontend type-check reports no unresolved module reference.
- The frontend suite passes with no spec edited to accommodate the deleted files.
depends_on:
- task/case-detail-attributes-tab/unwire-attributes-tab-from-case-detail
- task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
---

## What it is
frontend/app/src/routes/case-attributes-tab.tsx and frontend/app/src/hooks/use-case-attributes-at-a-glance.ts exist only for this tab, the hook having no other consumer in the tree.
Three test files exist only to prove them: case-attributes-tab.test-support.ts, case-attributes-tab.spec.ts and use-case-attributes-at-a-glance.spec.ts.
The removed files import errorStateKind from use-edit-draft-version-form.ts, CaseVersionRecord from services/case-version-record.ts and useCaseVersions from use-case-versions.ts, each of which several unrelated hooks and services also import.

## Notes
The inventory names use-new-draft-version-form.ts, use-manifest-builder.ts, use-hypothesis-revision-release.ts, use-case-simulation-version.ts, use-case-simulation-cockpit.ts and services/release-checklist.ts as the consumers a deletion of those shared modules would break.
case-hypotheses-tab.test-support.ts is the shared helper whole-screen specs mount Case Detail through and is not one of the tab's own test files.
Criterion 3 (no file names the identifier CaseAttributesTab) depends on the dependency task's own criterion 8 (no spec asserts Case Detail presents an Attributes tab) having already removed or rewritten case-detail-screen-attributes-tab.spec.ts and case-detail-screen.tsx's own reference; this task's deletion list does not repeat those two files, and criterion 3 is not satisfiable by this task's deletions alone without that dependency already having run.
