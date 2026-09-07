---
title: Shared ButtonFooter component
summary: The new shared component that renders a screen's primary action buttons pinned to the bottom of the AppShell's scrollable content area.
rationale: I cut the component away from the screens that consume it because it is the one interface four families depend on, and defining an interface and rewriting its consumers in the same task is the seam this decomposition keeps apart.
sources:
- intake/scope.md
objective: A shared ButtonFooter component exists under frontend/app/src/shared/components and renders the action buttons a screen gives it, pinned to the bottom of the AppShell's scrollable content area.
criteria:
- ButtonFooter renders every button passed to it as children, in the order it received them, in a row aligned to the end.
- The footer stays visible at the bottom of the AppShell's scrollable region while its screen's content is scrolled.
- Content scrolled to its end stays fully readable above the footer rather than covered by it.
- The footer sits inside the AppShell's existing `<main>` scroll region and frontend/app/src/shared/components/app-shell.tsx is left unmodified by this task.
- A screen rendering the footer still shows the shell's own statement that this build enforces no authentication, visibly and not merely rendered.
implements:
- constraints/no-route-enforces-authentication
---

## What it is
The one component the four screen families in this plan render their action buttons through.
It carries no knowledge of which buttons a screen gives it, the scope having made the children configurable per screen.

## Notes
UNDERDETERMINED, from the specification — a footer pinned over the region carrying the shell's no-authentication disclosure satisfies a criterion that asks only for the statement to be present, while constraints/no-route-enforces-authentication requires the posture disclosed to every user on every screen, and a disclosure a pinned element covers is not disclosed.
The implementation that passes is a ButtonFooter pinned to the bottom of the AppShell's scroll region that overlaps and visually obscures that disclosure while the statement is still in the DOM and the scrolled content ends above the footer.
REMAINDER, from the specification — the two perimeter clauses of constraints/no-route-enforces-authentication, that no backend route is guarded and that every request is accepted on the identity it claims, and its `fitness` over route handlers, reach no criterion of this task.
They belong to the backend API-layer work that delivers the service's route handlers, and are demonstrable only there.
ADVISORY, from the specification — criteria 1 through 4 answer to no specification node, and need none: constraints/no-route-enforces-authentication expressly cedes the register, leaving the exact copy to the frontend, so the footer's shape is form rather than a silence.
The only specification governance this task carries is the disclosure criterion.
The three binders that read the consuming tasks each reported that a single control cannot carry both the abandonment and the route to a listing, because the two have different destinations; this component must therefore not fix either destination in itself.
