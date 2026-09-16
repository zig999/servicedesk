# Scope

Corrective increment (one wrong behavior, human-named, in code already delivered).

Wrong behavior: `frontend/app/src/routes/cases-list-screen.tsx` renders a "Create case" button
that is permanently disabled, with `title="Case creation is not built yet in this plan"`. The
code's own comment above it says case creation was left out of scope, with no case-creation
screen built anywhere. The frontend route tree
(`frontend/app/src/routes/route-tree.tsx`) declares no `/cases/new` route at all — only
`/cases/$slug/versions/new` (a new version of an already-existing case) and
`/cases/$slug/versions/$version/manifest/hypotheses/new` (a new hypothesis on an existing
case version). By contrast, `/capabilities/new` and `/connectors/new` both exist for their own
resources. A user of the service desk system has no way to create a new case at all.

Found by the user asking directly whether the system has a button or route to create a new case,
answered by reading `frontend/app/src/routes/cases-list-screen.tsx` and
`frontend/app/src/routes/route-tree.tsx` directly.

File: `frontend/app/src/routes/cases-list-screen.tsx`

Correction: build the missing case-creation capability — a screen, a `/cases/new` route, and
wiring the existing "Create case" button to it — so a user can actually create a new case, in
place of the disabled placeholder.

Project root: `/home/siegfriedneto/projects/servicedeskn1`
Target: frontend
Initiative slug: `case-creation-screen-corrective` (new slug — no live initiative covers this
scope)
