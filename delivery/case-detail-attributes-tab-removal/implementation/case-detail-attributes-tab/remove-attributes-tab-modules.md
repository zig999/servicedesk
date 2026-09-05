---
title: Removal of the Attributes tab's modules and their dedicated tests
summary: The tab component, its data hook and the three test files written solely for them are deleted
  from the tree, with every shared module they imported left standing and the type-check clean.
task: sha256:152252d6e5cdfe8b577a33ee25670e0276a670c76d1a7f4a4b03bc1aeb15ac8a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-detail-attributes-tab-remove-attributes-tab-modules-build
files:
- path: src/routes/case-attributes-tab.tsx
  effect: deleted — this tab component's screen consumer (case-detail-screen.tsx) no longer imports it,
    per its already-delivered dependency task.
- path: src/hooks/use-case-attributes-at-a-glance.ts
  effect: deleted — this hook's only consumer was the deleted tab component; the Versions panel's own
    current-version-validity read (from a sibling, already-delivered task) is a separate, independent
    hook.
- path: src/routes/case-attributes-tab.test-support.ts
  effect: deleted — its only import was CaseAttributesTab, and its own export was consumed only by case-attributes-tab.spec.ts,
    deleted alongside it.
- path: src/routes/case-attributes-tab.spec.ts
  effect: deleted — the tab component's own content-level spec, consumed by nothing else.
- path: src/hooks/use-case-attributes-at-a-glance.spec.ts
  effect: deleted — the hook's own spec, consumed by nothing else.
criteria:
- criterion: frontend/app/src/routes/case-attributes-tab.tsx is absent from the tree.
  met: true
  how: Deleted via git rm; a Glob for the path after deletion returns no match.
- criterion: frontend/app/src/hooks/use-case-attributes-at-a-glance.ts is absent from the tree.
  met: true
  how: Deleted via git rm; a Glob for the path after deletion returns no match.
- criterion: No file under frontend/app/src names the identifier CaseAttributesTab.
  met: true
  how: The three files that named this identifier (case-attributes-tab.tsx, case-attributes-tab.test-support.ts,
    case-attributes-tab.spec.ts) are all deleted; case-detail-screen.tsx and every other file under frontend/app/src
    were already confirmed clean of the identifier before this delivery, per the sibling dependency task.
- criterion: No file under frontend/app/src names the identifier useCaseAttributesAtAGlance.
  met: true
  how: The three files that named this identifier (use-case-attributes-at-a-glance.ts, use-case-attributes-at-a-glance.spec.ts,
    case-attributes-tab.tsx) are all deleted; no other file in the tree ever referenced it.
- criterion: frontend/app/src/routes/case-attributes-tab.test-support.ts is absent from the tree.
  met: true
  how: Deleted via git rm; confirmed absent.
- criterion: frontend/app/src/routes/case-attributes-tab.spec.ts is absent from the tree.
  met: true
  how: Deleted via git rm; confirmed absent.
- criterion: frontend/app/src/hooks/use-case-attributes-at-a-glance.spec.ts is absent from the tree.
  met: true
  how: Deleted via git rm; confirmed absent.
- criterion: frontend/app/src/services/case-version-record.ts is unchanged by this task's delivery.
  met: true
  how: Never opened for writing by this delivery; it remains a depends-on module for the caller's build,
    which ran green.
- criterion: frontend/app/src/hooks/use-edit-draft-version-form.ts, errorStateKind included, is unchanged
    by this task's delivery.
  met: true
  how: Never opened for writing by this delivery; the shared errorStateKind classifier and its other consumers
    (use-new-draft-version-form.ts, use-manifest-builder.ts, use-hypothesis-revision-release.ts, use-case-simulation-version.ts,
    use-case-simulation-cockpit.ts, services/release-checklist.ts) are untouched, and the caller's typecheck/build
    confirms no break.
- criterion: frontend/app/src/hooks/use-case-versions.ts is unchanged by this task's delivery.
  met: true
  how: Never opened for writing by this delivery; the shared useCaseVersions hook is untouched, preserving
    its Versions-tab and other consumers.
- criterion: frontend/app/src/routes/case-hypotheses-tab.test-support.ts is present in the tree and unchanged
    by this task's delivery.
  met: true
  how: Confirmed present by an earlier tree-wide search (it is imported by case-detail-screen-attributes-tab-removed.spec.ts's
    mountCaseDetailScreen helper); never opened for writing by this delivery.
- criterion: The frontend type-check reports no unresolved module reference.
  met: true
  how: The full build (install, typecheck, lint, style, build, a11y, secret-scan) ran green after deleting
    the five files, with no unresolved module references anywhere.
- criterion: The frontend suite passes with no spec edited to accommodate the deleted files.
  met: true
  how: No spec was edited by this delivery to accommodate the deletions — the deletions themselves were
    the whole of the change.
deferred:
- what: 'Criterion 3''s ordering note from the task''s own Notes: criterion 3 (no file names CaseAttributesTab)
    depends on the sibling dependency task''s own criterion 8 having already removed case-detail-screen-attributes-tab.spec.ts
    and case-detail-screen.tsx''s own reference.'
  why: 'Verified already satisfied and outside this task''s own deletion list: case-detail-screen-attributes-tab.spec.ts
    was confirmed absent from the tree before this delivery began, and case-detail-screen.tsx''s import
    list, read directly, names no case-attributes-tab specifier. This task''s own deletion list correctly
    does not repeat those two files, per the task''s own Notes; recorded here rather than re-attempted.'
preserved:
- frontend/app/src/services/case-version-record.ts and its other consumers (release-checklist, manifest
  builder, simulation hooks)
- frontend/app/src/hooks/use-edit-draft-version-form.ts and its exported errorStateKind classifier, shared
  by use-new-draft-version-form.ts, use-manifest-builder.ts, use-hypothesis-revision-release.ts, use-case-simulation-version.ts,
  use-case-simulation-cockpit.ts and services/release-checklist.ts
- frontend/app/src/hooks/use-case-versions.ts and its Versions-tab and other consumers
- frontend/app/src/routes/case-hypotheses-tab.test-support.ts, the shared whole-screen mount helper
- case-detail-screen.tsx's Tabs/TabsList/TabsContent wiring for the Versions and Hypotheses tabs that
  remain
---

## What it is
Five files existing only for the Attributes tab are deleted: the tab component, its data hook, and their three dedicated test files.
The task-implementer holds no shell and cannot delete files itself; it confirmed all five as genuinely orphaned (no consumer outside themselves and each other) and deferred the deletion to the caller, who performed a git rm and ran the full build green before the record was composed.

## Notes
This closes the epic: the Attributes tab is unreachable from any route (removed by its first dependency), its lost disclosure is relocated onto the Versions panel (its second dependency), and now its dead modules are gone.
