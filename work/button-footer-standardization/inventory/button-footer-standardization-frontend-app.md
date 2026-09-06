---
title: ButtonFooter target area in frontend/app
summary: The routes and shared components under frontend/app/src that the ButtonFooter migration touches, plus the AppShell scroll region it must fix inside without editing.
sources:
- work/button-footer-standardization/intake/scope.md
area:
- frontend/app/src/shared/components
- frontend/app/src/routes
modules:
- name: shared-components
  path: frontend/app/src/shared/components
  role: touched
- name: app-shell
  path: frontend/app/src/shared/components/app-shell.tsx
  role: depends-on
- name: capability-form-fields
  path: frontend/app/src/routes/capability-form-fields.tsx
  role: touched
- name: capability-create-screen
  path: frontend/app/src/routes/capability-create-screen.tsx
  role: touched
- name: capability-detail-screen
  path: frontend/app/src/routes/capability-detail-screen.tsx
  role: touched
- name: capability-detail-ready-view
  path: frontend/app/src/routes/capability-detail-ready-view.tsx
  role: touched
- name: connector-configuration-form-fields
  path: frontend/app/src/routes/connector-configuration-form-fields.tsx
  role: touched
- name: connector-configuration-create-screen
  path: frontend/app/src/routes/connector-configuration-create-screen.tsx
  role: touched
- name: connector-configuration-detail-screen
  path: frontend/app/src/routes/connector-configuration-detail-screen.tsx
  role: touched
- name: connector-configuration-detail-ready-view
  path: frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
  role: touched
- name: hypothesis-revision-form-fields
  path: frontend/app/src/routes/hypothesis-revision-form-fields.tsx
  role: touched
- name: hypothesis-revision-screen
  path: frontend/app/src/routes/hypothesis-revision-screen.tsx
  role: touched
- name: new-hypothesis-screen
  path: frontend/app/src/routes/new-hypothesis-screen.tsx
  role: adjacent
- name: revise-hypothesis-screen
  path: frontend/app/src/routes/revise-hypothesis-screen.tsx
  role: adjacent
- name: hypothesis-revision-history
  path: frontend/app/src/routes/hypothesis-revision-history.tsx
  role: adjacent
- name: case-version-editor-form-fields
  path: frontend/app/src/routes/case-version-editor-form-fields.tsx
  role: depends-on
- name: case-version-editor-ready-view
  path: frontend/app/src/routes/case-version-editor-ready-view.tsx
  role: touched
- name: case-version-editor-screen
  path: frontend/app/src/routes/case-version-editor-screen.tsx
  role: adjacent
- name: new-case-draft-screen
  path: frontend/app/src/routes/new-case-draft-screen.tsx
  role: adjacent
conventions:
- statement: 'A form''s own action row is a plain flex row aligned to the end, never sticky or fixed: `<div className="flex items-center justify-end gap-3">` around the Save button.'
  seen_at: frontend/app/src/routes/capability-form-fields.tsx:203
- statement: The same end-aligned flex row pattern repeats with a 4-unit gap when it holds more than a Save button (Release/Discard/Save/Cancel).
  seen_at: frontend/app/src/routes/case-version-editor-ready-view.tsx:128
- statement: 'A *-form-fields component exposes an optional `trailingActions?: ReactNode` prop that its own action row renders after the Save button, letting the owning screen inject extra buttons without editing the form-fields file.'
  seen_at: frontend/app/src/routes/capability-form-fields.tsx:24
- statement: Where a Cancel button must navigate rather than submit, it is a `<Button variant="secondary" asChild><Link to=...>Cancel</Link></Button>` — TanStack Router's own Link wrapped by the design system's Button.
  seen_at: frontend/app/src/routes/case-version-editor-ready-view.tsx:240
- statement: Screens with a create/detail split render a plain, unstyled `<Link to="...">Back to X</Link>` at the very top of the section, above the heading, once per phase (loading/load-error/ready).
  seen_at: frontend/app/src/routes/capability-detail-screen.tsx:14
- statement: A destructive or consequential action (Release, Discard) is confirmed through `@tui/ui/dialog`'s Dialog/DialogTrigger/DialogFooter with a Cancel-labelled DialogClose beside the confirming button, never a bare confirm().
  seen_at: frontend/app/src/routes/case-version-editor-ready-view.tsx:169
- statement: AppShell's only scrollable region is `<main className="relative flex-1 overflow-y-auto p-4">`; nothing inside it is sticky or fixed today — every screen's content, including its action row, scrolls with the rest.
  seen_at: frontend/app/src/shared/components/app-shell.tsx:99
- statement: A shared component under shared/components/ ships with a co-located `<name>.spec.ts` beside it.
  seen_at: frontend/app/src/shared/components/status-table.tsx
must_not_duplicate:
- what: 'The `trailingActions?: ReactNode` slot already threaded through capability-form-fields and connector-configuration-form-fields for injecting extra buttons beside Save — a new ButtonFooter should be reached through (or replace) this slot rather than adding a second, parallel way to append buttons.'
  at: frontend/app/src/routes/capability-form-fields.tsx and frontend/app/src/routes/connector-configuration-form-fields.tsx
- what: The form-id-plus-external-submit-button pattern (`CASE_VERSION_EDITOR_FORM_ID` passed to a `<Button type="submit" form={...}>` that lives outside the `<form>` element) — the only existing case of a Save button already living outside its form-fields component, which any ButtonFooter housing Save/Cancel for this screen must keep working.
  at: frontend/app/src/routes/case-version-editor-form-fields.tsx and frontend/app/src/routes/case-version-editor-ready-view.tsx:234
- what: The Cancel-as-styled-Link composition (`<Button variant="secondary" asChild><Link>...</Link></Button>`) already proven for case-version-editor-ready-view's Cancel — the pattern the new default Cancel button should reuse rather than re-deriving.
  at: frontend/app/src/routes/case-version-editor-ready-view.tsx:240
risks:
- risk: Removing the top-of-screen "Back to X" links, as the scope calls for, breaks existing tests that query them by role and accessible name.
  consumers:
  - frontend/app/src/routes/capability-create-screen.spec.ts
  - frontend/app/src/routes/capability-detail-screen.spec.ts
  - frontend/app/src/routes/connector-configuration-create-screen.spec.ts
  - frontend/app/src/routes/connector-configuration-detail-screen.spec.ts
- risk: case-version-editor-ready-view's action row (Release dialog, Discard dialog, Save, Cancel) is shared by two screens; moving it into a sticky ButtonFooter changes markup both depend on.
  consumers:
  - frontend/app/src/routes/case-version-editor-screen.tsx
  - frontend/app/src/routes/case-version-editor-screen.spec.ts
  - frontend/app/src/routes/new-case-draft-screen.tsx
  - frontend/app/src/routes/new-case-draft-screen.spec.ts
- risk: capability-detail-ready-view and connector-configuration-detail-ready-view pass a Dialog-triggered Discard button plus a conditional "Saved." status line through trailingActions; folding these into a sticky footer must keep the Dialog's trigger/portal behavior and the status text working the same way under test.
  consumers:
  - frontend/app/src/routes/capability-detail-screen.spec.ts
  - frontend/app/src/routes/connector-configuration-detail-screen.spec.ts
- risk: AppShell's `<main>` already carries `p-4` padding around the whole scroll area; a footer sticky at the bottom of that same element must not be clipped by, or double up, that padding — and the scope forbids touching app-shell.tsx itself to fix it.
  consumers:
  - frontend/app/src/shared/components/app-shell.tsx
  - frontend/app/src/shared/components/app-shell.spec.ts
- risk: hypothesis-revision-form-fields has no Cancel/Back today and its Save button sits inside a single-item `flex items-center justify-end` row with no trailingActions slot; adding a default Cancel here is new plumbing, not a slot reuse, and any test asserting the current single-button row will need to move with it.
  consumers:
  - frontend/app/src/routes/hypothesis-revision-screen.tsx
---

## What it is
The one frontend/app source tree the scope lands in: shared/components (home for the new ButtonFooter and the existing AppShell) and routes (the four form-fields families, their screens, and the case-version-editor's ready view).
AppShell renders the single scrollable `<main>` every screen sits inside, and the scope requires the new footer to stick to that region's bottom without editing app-shell.tsx.
Three of the four form-fields families place their Save button in a plain end-aligned flex row with no Cancel; the fourth, case-version-editor-ready-view, already renders Cancel as a Link-styled Button beside Release/Discard/Save.
Two form-fields components already expose a `trailingActions` slot that screens use to inject Discard-dialog buttons and a "Saved." status line next to Save.
Four screens carry a standalone "Back to X" link above their heading that the scope calls for removing once Cancel becomes the default return path.

## Notes
hypothesis-revision-history.tsx's own "Back to hypotheses" button is out of scope by the scope's own statement, because it toggles local state inside the case's hypotheses tab rather than navigating between screens, and this survey left it untouched.
