---
title: AppShell sidebar, topbar breadcrumb and no-auth indicator
summary: AppShell composes a three-entry sidebar (Cases, Glossary, Capabilities), a topbar over TUI's StatusBar carrying a route-derived Breadcrumb and a fixed no-auth indicator, and wraps every route by becoming the root route's own component.
task: sha256:232f9002fb0af95fff6156235939cf707ec85ae49f9c0e0fb1862026490e0d08
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
run: run/frontend-console-foundation-onda-1-full-suite-2
nodes:
  - node: constraints/no-route-enforces-authentication
    encoded_at:
      - src/shared/components/app-shell.tsx
    how: >-
      Topbar renders the literal, unconditional "No auth in this build" text this constraint's own
      statement describes ("no route... is guarded by an authentication mechanism in this build"),
      permanently visible regardless of route -- the UI-side acknowledgment of a perimeter fact the
      constraint says is the backend's, never a claim that this frontend enforces or checks
      authentication itself.
files:
  - path: src/shared/components/app-shell.tsx
    effect: exports AppShell, composing a Sidebar (three @tanstack/react-router Link entries -- Cases, Glossary, Capabilities, new construction since TUI has no sidebar/nav primitive) and a Topbar (TUI's StatusBar with a route-derived Breadcrumb in its center slot, built from useMatches(), and a fixed "No auth in this build" span in its right slot), wrapping an Outlet where routed content renders
  - path: src/routes/route-tree.tsx
    effect: >-
      adds an AppShell component assignment to the root route created by createRootRoute(), so
      RouterProvider now renders AppShell (sidebar + topbar + Outlet) around every one of the ten
      leaf routes rather than a bare, componentless Outlet
criteria:
  - criterion: The sidebar lists exactly three top-level entries -- Cases, Glossary, Capabilities -- and no Hypotheses entry, per the proposal's section 2.10 decision.
    met: true
    how: Sidebar's SIDEBAR_ENTRIES constant is a fixed three-item array (Cases -> /cases, Glossary -> /glossary, Capabilities -> /capabilities); no fourth entry exists, and no entry names Hypotheses
  - criterion: Each sidebar entry links to its screen's route from the router skeleton task.
    met: true
    how: each entry's `to` is one of the exact leaf paths route-tree.tsx registers (/cases, /glossary, /capabilities), passed through @tanstack/react-router's own typed `Link`, so a path not registered in the router would be a compile-time type error rather than a silent dead link
  - criterion: The topbar renders a breadcrumb through TUI's Breadcrumb primitive reflecting the currently matched route, not a hand-derived path string.
    met: true
    how: Topbar renders `<Breadcrumb items={items} />` from @tui/ui/breadcrumb, where `items` comes from useBreadcrumbItems() -- built by calling the router's own useMatches() and filtering out the root match, never by splitting or parsing window.location or any path string by hand
  - criterion: The topbar displays a fixed, always-visible "No auth in this build" indicator regardless of which route is active.
    met: true
    how: Topbar's JSX always passes the same literal `<span>No auth in this build</span>` as StatusBar's `right` prop, unconditionally -- there is no branch, route check or prop that could omit it for any route
  - criterion: The AppShell wraps every route the router skeleton defines, so no screen renders outside it.
    met: true
    how: AppShell is now createRootRoute()'s own `component` (route-tree.tsx); every one of the ten leaf routes is an unparented direct child of the root, so TanStack Router renders AppShell for all ten, with each leaf's own placeholder reaching the screen only through AppShell's <Outlet />
inferences:
  - inferred: the breadcrumb shows exactly one entry (the currently matched leaf route's own label), not a multi-segment trail built from the URL's path segments.
    from: >-
      the route tree is flat by the router-skeleton task's own explicit design (every leaf is a
      direct, unparented child of the root -- "the nesting a real case/version/manifest layout will
      need is left to the wave that builds it"), so useMatches() itself never returns more than the
      root match plus exactly one leaf match; a multi-segment trail is not obtainable from this
      route tree's shape without inventing path-segment splitting this task's criteria do not ask for
  - inferred: each route's breadcrumb label is a short human-readable string (e.g. "Case Detail", "Manifest Builder") drawn from the proposal's own screen names, kept in a small lookup table keyed by route id, rather than derived from the path pattern.
    from: >-
      the criterion says the breadcrumb must reflect the matched route "not a hand-derived path
      string" -- read as ruling out deriving the *label itself* from path-string manipulation, while
      still requiring some label; the proposal's own section numbering (2.1 Cases List, 2.2 Case
      Detail, etc.) is the only named source for what each route should be called
  - inferred: StatusBar's ARIA role is left at its own default ("status", implying aria-live="polite") rather than overridden to "contentinfo" or "none".
    from: no criterion or specification node states a landmark role for the topbar; TUI's own default is left standing rather than picking a role this task has no stated reason to prefer
  - inferred: the sidebar's active-route highlighting (`activeProps`) and `aria-current="page"` are additional to what the criteria state.
    from: >-
      @tanstack/react-router's typed Link exposes `activeProps` as part of its own ordinary API for
      exactly this purpose; leaving a sidebar with no visible indication of the current screen would
      be a usability gap adjacent to, but not a business fact beyond, "each sidebar entry links to
      its screen's route" -- no domain fact is added, only which one is presently active
divergences:
  - from: >-
      task/frontend-console-foundation/router-skeleton's own proof
      (delivery/frontend-bootstrap/proof/frontend-console-foundation/router-skeleton.md), whose test
      "leaves the root route without a layout component of its own" asserted
      `router.routeTree.options.component` is `undefined`
    departure: >-
      route-tree.tsx's root route now has `component: AppShell`, making that assertion false. This
      is this task's own fifth criterion ("The AppShell wraps every route... so no screen renders
      outside it") being satisfied the only way TanStack Router supports wrapping every leaf route
      in one shell: a component on their shared parent (the root route, since the tree is flat).
    why: >-
      router-skeleton's own four stated criteria never claim the root stays componentless forever --
      only that "no route composes a layout beyond its own placeholder content in this task", which
      is scoped to that task and stays true. The proof's stronger, unscoped assertion was the test
      author's own addition, not a stated criterion, and it is exactly what this task's criteria
      require to become false. Per implement-task's narrower re-delivery mode, router-skeleton's own
      implementation record is left untouched (it is still accurate) and only its proof is rewritten
      to drop that one now-false test, with a Notes entry naming this task as what falsified it.
preserved:
  - every placeholder component's own content (route-placeholders.tsx) -- untouched; AppShell wraps them but renders none of their content itself
  - the ten leaf routes' own paths and component assignments -- unchanged; only the root route gained a component
---

## What it is
The sidebar, topbar breadcrumb and no-auth indicator the scope's section 0 and 2.10 decisions ask for, composed over TUI's Breadcrumb and StatusBar primitives rather than a hand-rolled path string or a bespoke topbar. It wraps every route the router-skeleton task defines by becoming the root route's own component.
The no-auth indicator encodes `constraints/no-route-enforces-authentication`.

## Notes
None.
