---
title: Case Detail's Attributes tab and its supporting hook
summary: The third tab on Case Detail (routes/case-attributes-tab.tsx), its data hook (hooks/use-case-attributes-at-a-glance.ts),
  the Tabs wiring that mounts it in routes/case-detail-screen.tsx, and their dedicated test files, all
  isolated from the shared modules they depend on.
area:
- frontend/app/src/routes
- frontend/app/src/hooks
- frontend/app/src/services
modules:
- name: case-attributes-tab
  path: frontend/app/src/routes/case-attributes-tab.tsx
  role: touched
- name: use-case-attributes-at-a-glance
  path: frontend/app/src/hooks/use-case-attributes-at-a-glance.ts
  role: touched
- name: case-detail-screen
  path: frontend/app/src/routes/case-detail-screen.tsx
  role: touched
- name: case-attributes-tab-test-support
  path: frontend/app/src/routes/case-attributes-tab.test-support.ts
  role: touched
- name: case-attributes-tab-spec
  path: frontend/app/src/routes/case-attributes-tab.spec.ts
  role: touched
- name: case-detail-screen-attributes-tab-spec
  path: frontend/app/src/routes/case-detail-screen-attributes-tab.spec.ts
  role: touched
- name: use-case-attributes-at-a-glance-spec
  path: frontend/app/src/hooks/use-case-attributes-at-a-glance.spec.ts
  role: touched
- name: case-version-record
  path: frontend/app/src/services/case-version-record.ts
  role: depends-on
- name: use-edit-draft-version-form
  path: frontend/app/src/hooks/use-edit-draft-version-form.ts
  role: depends-on
- name: use-case-versions
  path: frontend/app/src/hooks/use-case-versions.ts
  role: depends-on
- name: case-hypotheses-tab
  path: frontend/app/src/routes/case-hypotheses-tab.tsx
  role: adjacent
- name: case-hypotheses-tab-test-support
  path: frontend/app/src/routes/case-hypotheses-tab.test-support.ts
  role: adjacent
conventions:
- statement: A Case Detail tab is a standalone component taking a {slug} prop, mounted via TabsContent
    inside case-detail-screen.tsx's single Tabs block alongside its sibling tabs.
  seen_at: frontend/app/src/routes/case-detail-screen.tsx
- statement: Each tab component ships its own <tab-name>.test-support.ts with a mountCase<Tab>Tab helper,
    a createFetchStub, and reusable path/slug constants, separate from the shared case-hypotheses-tab.test-support.ts's
    mountCaseDetailScreen helper used by whole-screen specs.
  seen_at: frontend/app/src/routes/case-attributes-tab.test-support.ts
- statement: A tab's data hook returns a discriminated union keyed by a phase field (loading / no-version
    / load-error / a domain-specific refusal / ready) rather than separate booleans.
  seen_at: frontend/app/src/hooks/use-case-attributes-at-a-glance.ts
- statement: Screen-level tab-strip behavior (which tabs render, selection, re-mounting) is proven in
    a dedicated case-detail-screen-<tab>.spec.ts file per tab, separate from the tab's own content spec.
  seen_at: frontend/app/src/routes/case-detail-screen-attributes-tab.spec.ts
must_not_duplicate:
- what: Shared error-classification helper errorStateKind (maps a query error, e.g. CaseNotValidError,
    to a UI error-state kind) — used by multiple hooks beyond the Attributes tab
  at: frontend/app/src/hooks/use-edit-draft-version-form.ts
- what: CaseVersionRecord type (title, when_to_use, subject, fallback.outcome/referral, consolidation_register)
    — the shape read by the whole-version GET, consumed elsewhere (e.g. release-checklist, manifest builder,
    simulation hooks)
  at: frontend/app/src/services/case-version-record.ts
- what: useCaseVersions hook resolving the case's version list, shared with the Versions tab and other
    screens
  at: frontend/app/src/hooks/use-case-versions.ts
risks:
- risk: case-detail-screen.tsx's Tabs/TabsList/TabsContent wiring must drop only the Attributes trigger/content
    pair; removing the wrong markup or leaving a dangling TabsTrigger value="attributes" without content
    (or vice versa) breaks the Versions/Hypotheses tabs that remain.
  consumers:
  - frontend/app/src/routes/case-detail-screen.spec.ts
  - frontend/app/src/routes/case-detail-screen-hypotheses-tab.spec.ts
  - frontend/app/src/routes/case-detail-screen-versions-retry.spec.ts
  - frontend/app/src/routes/case-detail-screen-manifest-action.spec.ts
  - frontend/app/src/routes/case-detail-screen-simulate-action.spec.ts
  - frontend/app/src/routes/case-detail-screen-view-released-action.spec.ts
- risk: The removed hook imports errorStateKind from use-edit-draft-version-form.ts and the removed tab
    imports CaseVersionRecord from services/case-version-record.ts; deleting those shared modules instead
    of only the tab-specific files would break every other consumer of them.
  consumers:
  - frontend/app/src/hooks/use-new-draft-version-form.ts
  - frontend/app/src/hooks/use-manifest-builder.ts
  - frontend/app/src/hooks/use-hypothesis-revision-release.ts
  - frontend/app/src/hooks/use-case-simulation-version.ts
  - frontend/app/src/hooks/use-case-simulation-cockpit.ts
  - frontend/app/src/services/release-checklist.ts
sources:
- work/case-detail-attributes-tab-removal/intake/scope.md
---

## What it is
The Attributes tab is one of three siblings wired into a single `Tabs` block in `frontend/app/src/routes/case-detail-screen.tsx`, alongside Versions (inline `VersionsPanel`) and Hypotheses (`CaseHypothesesTab`).
`frontend/app/src/routes/case-attributes-tab.tsx` renders the tab's content and delegates state resolution to `frontend/app/src/hooks/use-case-attributes-at-a-glance.ts`, a hook with no other consumer found in the tree.
The hook composes the already-shared `useCaseVersions` hook with a direct `apiFetch` call to `GET /v1/cases/{slug}/versions/{version}`, reusing the `CaseVersionRecord` type and the `errorStateKind` classifier that other, unrelated hooks also import.
Three test files exist solely for this tab: `case-attributes-tab.test-support.ts`, `case-attributes-tab.spec.ts` (content-level), and `case-detail-screen-attributes-tab.spec.ts` (tab-strip-level, using the separate shared `case-hypotheses-tab.test-support.ts`'s `mountCaseDetailScreen` helper).
`use-case-attributes-at-a-glance.spec.ts` proves the hook directly and has no reference to any other tab.

## Notes
No other route, spec, or test-support file in `frontend/app/src` mentions "Attributes" or references `CaseAttributesTab` / `useCaseAttributesAtAGlance` outside the six files named above as touched.
`errorStateKind`, `CaseVersionRecord`, and `useCaseVersions` are each consumed by multiple hooks/services unrelated to this tab and must survive the removal untouched.
No entry for `case-attributes-tab.tsx` or `use-case-attributes-at-a-glance.ts` was found in `siegard-trace.json` at the repository root, searched directly rather than assumed.
