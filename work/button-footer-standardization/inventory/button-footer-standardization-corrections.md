---
title: Registration-authoring footers, cancel-destination specs, a nature-refusal fixture, and one help copy in frontend/app
summary: Where the four capability and connector authoring screens compose their action footer today, the abandon-via-router-history pattern already used on the knowledge surfaces, the four specs asserting a fixed listing destination for Cancel, and the help copy under output schema that reproduces two specification nodes.
sources:
- intake/scope-review-corrections.md
area:
- frontend/app/src/routes
- frontend/app/src/hooks
- frontend/app/src/shared/components
modules:
- name: capability-create-screen
  path: frontend/app/src/routes/capability-create-screen.tsx
  role: touched
- name: capability-detail-ready-view
  path: frontend/app/src/routes/capability-detail-ready-view.tsx
  role: touched
- name: capability-detail-screen
  path: frontend/app/src/routes/capability-detail-screen.tsx
  role: touched
- name: connector-configuration-create-screen
  path: frontend/app/src/routes/connector-configuration-create-screen.tsx
  role: touched
- name: connector-configuration-detail-ready-view
  path: frontend/app/src/routes/connector-configuration-detail-ready-view.tsx
  role: touched
- name: connector-configuration-detail-screen
  path: frontend/app/src/routes/connector-configuration-detail-screen.tsx
  role: touched
- name: capability-form-fields
  path: frontend/app/src/routes/capability-form-fields.tsx
  role: touched
- name: use-capability-form
  path: frontend/app/src/hooks/use-capability-form.ts
  role: touched
- name: use-connector-configuration-form
  path: frontend/app/src/hooks/use-connector-configuration-form.ts
  role: touched
- name: capability-detail-screen-outcome-spec
  path: frontend/app/src/routes/capability-detail-screen-outcome.spec.ts
  role: touched
- name: button-footer
  path: frontend/app/src/shared/components/button-footer.tsx
  role: depends-on
- name: use-hypothesis-revision-form
  path: frontend/app/src/hooks/use-hypothesis-revision-form.ts
  role: adjacent
- name: use-edit-draft-version-form
  path: frontend/app/src/hooks/use-edit-draft-version-form.ts
  role: adjacent
conventions:
- statement: ButtonFooter is a plain layout wrapper — role="group" with aria-label="Actions" around children — carrying no navigation or abandon logic of its own; every screen composes its own buttons inside it.
  seen_at: frontend/app/src/shared/components/button-footer.tsx
- statement: In all four authoring screens today a single Button variant="secondary" asChild wrapping a Link to the listing is labelled Cancel and is the only control besides Save or Retry.
  seen_at: frontend/app/src/routes/capability-detail-ready-view.tsx:89-91
- statement: capability-create-screen renders that same Cancel-as-listing-link three times, once per phase, each an independent literal rather than one shared control — the file holds no single source of truth for it.
  seen_at: frontend/app/src/routes/capability-create-screen.tsx:34-36,47-49,63-66
- statement: The two detail screens render their own ButtonFooter with the same fixed Link for the loading and load-error phases before delegating the ready phase to their ready-view, so a control owed on every reading has to land in the screen and not only in the ready-view.
  seen_at: frontend/app/src/routes/capability-detail-screen.tsx:18-22,35-37
- statement: The abandon-to-opening-surface pattern is a useRouter() call whose onCancel body is exactly router.history.back(), exposed on the ready-phase state and wired by the consumer to a plain Button rather than a Link; no destination is computed or passed in.
  seen_at: frontend/app/src/hooks/use-edit-draft-version-form.ts:87,285-287
- statement: The two hooks backing the four registration screens expose no onCancel and hold no useRouter() call; their screens call useNavigate alone, so the abandon-via-history pattern is not present on either registration hook.
  seen_at: frontend/app/src/hooks/use-capability-form.ts
- statement: Each of the three cancel specs that already test return-to-origin defines its own local mount-with-history function inline, building a two-route createMemoryHistory tree and asserting the router's pathname returns to the first entry; no shared test utility for this exists and the pattern is duplicated three times.
  seen_at: frontend/app/src/routes/case-version-editor-screen-cancel.spec.ts
- statement: The connector-configuration side already states the correct HTTP status for its analogous refusal, calling errorResponse with 422, while the capability side's own fixture passes 409 as a literal of that one call; the errorResponse helper itself defaults to 500 and imposes neither.
  seen_at: frontend/app/src/routes/connector-configuration-detail-screen-outcome.spec.ts:44
- statement: The help paragraph under review is the only prose paragraph in capability-form-fields outside labels and error text, styled text-sm text-muted-foreground inside a div beside the output-schema field, so no other help copy in that file exists for a rewrite to match its form against.
  seen_at: frontend/app/src/routes/capability-form-fields.tsx:183-190
must_not_duplicate:
- what: The abandon-to-opening-surface pattern — useRouter() plus router.history.back() exposed as onCancel on the ready-phase state.
  at: frontend/app/src/hooks/use-edit-draft-version-form.ts and frontend/app/src/hooks/use-hypothesis-revision-form.ts
- what: The ButtonFooter layout wrapper for a screen's action row.
  at: frontend/app/src/shared/components/button-footer.tsx
- what: The connector-configuration side's already-correct HTTP-status-for-refusal convention, 422 for a refusal of a registration's own declared content.
  at: frontend/app/src/routes/connector-configuration-detail-screen-outcome.spec.ts
risks:
- risk: Splitting Cancel into an abandon control plus a listing route changes the accessible name and the role of the existing Cancel control, today a link, which four specs assert directly by role and by href or pathname.
  consumers:
  - frontend/app/src/routes/capability-create-screen-actions.spec.ts
  - frontend/app/src/routes/capability-detail-screen-cancel.spec.ts
  - frontend/app/src/routes/connector-configuration-detail-ready-view-cancel.spec.ts
  - frontend/app/src/routes/connector-configuration-create-screen-cancel.spec.ts
- risk: Adding a listing route to the detail screens' loading and load-error phases changes what those phases render, which those screens' own specs assert against today's single-control footer.
  consumers:
  - frontend/app/src/routes/capability-detail-screen.spec.ts
  - frontend/app/src/routes/capability-detail-screen-route.spec.ts
  - frontend/app/src/routes/connector-configuration-detail-screen.spec.ts
  - frontend/app/src/routes/connector-configuration-detail-screen-listing-route.spec.ts
- risk: Wiring the registration screens' abandon through the router's own history requires useRouter() on hooks that today call useNavigate alone, and every test that mounts these screens on a single-entry history exercises a different abandon path than the cancel specs' two-entry history.
  consumers:
  - frontend/app/src/routes/capability-create-screen.test-support.ts
  - frontend/app/src/routes/connector-configuration-create-screen.test-support.ts
  - frontend/app/src/routes/capability-detail-screen.test-support.ts
  - frontend/app/src/routes/connector-configuration-detail-screen.test-support.ts
- risk: Every file this correction touches was already read and bound by the reconciliation the previous review folded, so editing them again meets bindings that pass already stamped.
  consumers:
  - siegard-reconcile/button-footer-standardization-full-scope.md
  - frontend/app/src/routes/capability-form-fields-action-footer.spec.ts
---

## What it is
The four registration-authoring screens of the two registries, the two detail screens that host their loading and error phases, the shared ButtonFooter, the two hooks backing the registration forms, the two knowledge-surface hooks that already implement history-based abandonment, the form-fields component holding the help copy under review, and the fixture that states the wrong status for a nature refusal.

## Notes
The survey found three things the scope did not name, and each widens the work.
Four specs assert the fixed listing destination for Cancel, not the one the scope named.
Neither registration hook holds a useRouter() call today, so the abandonment pattern the knowledge surfaces already use has to reach them.
The two-entry-history mount that the three existing return-to-origin specs rely on is duplicated three times and factored out nowhere, so a fourth and fifth use of it is a choice between a fourth copy and extracting it.
