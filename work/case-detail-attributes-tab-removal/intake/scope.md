# Scope

Remove the Case Attributes tab entirely from the Case Detail screen
(`http://localhost:5173/cases/$slug`).

This removes the "case-attributes-at-a-glance" capability delivered under the closed
`frontend-bootstrap` plan
(`work/frontend-bootstrap/task/cases-list-and-detail/case-attributes-at-a-glance.md`): the third
tab on Case Detail, alongside Versions and Hypotheses, that surfaces the case's current version's
declared attributes (title, when_to_use, subject, fallback outcome/referral,
consolidation_register) with its state-sensitive navigation action ("Continue editing" / "View
released vX" + "New draft from vX"), including its explicit case-not-valid refusal state.

Affected frontend code (for the surveyor's own inventory, not prescribing the task cut):
- frontend/app/src/routes/case-attributes-tab.tsx
- frontend/app/src/hooks/use-case-attributes-at-a-glance.ts
- the `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` wiring in
  frontend/app/src/routes/case-detail-screen.tsx that renders this tab alongside Versions and
  Hypotheses

This is a capability's-surface removal — a screen/interaction the specification already holds —
not a change to any domain fact. The underlying domain nodes this tab read from (case,
case-version, case-summary, resolution, referral, consolidation-register and the rules governing
how a case-summary is derived and how a case is read) state nothing about a UI tab's existence;
they stay true and stay used elsewhere (the case listing/catalog, the Version Editor screen)
regardless of this tab being removed. No specification node names this tab as a required surface,
confirmed by reading the full impact-set closure over case/case-version/case-summary and every
architecture constraint before this scope was persisted.
