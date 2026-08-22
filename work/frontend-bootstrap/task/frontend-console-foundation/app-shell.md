---
title: AppShell sidebar, topbar breadcrumb and no-auth indicator
summary: The persistent shell composing a sidebar (Cases, Glossary, Capabilities, no top-level Hypotheses) and a topbar with a route-derived breadcrumb through TUI's Breadcrumb primitive and a fixed "No auth in this build" indicator.
rationale: >-
  Split from the router-skeleton task because the shell's sidebar links and breadcrumb consume
  the route tree rather than define it; demonstrating that the breadcrumb reflects the current
  route and that sidebar entries link to real routes requires the router already in place,
  which the dependency edge on router-skeleton records.
objective: Every routed screen renders inside one AppShell exposing sidebar navigation to Cases, Glossary and Capabilities, a route-derived breadcrumb, and a permanently visible no-auth indicator.
criteria:
  - The sidebar lists exactly three top-level entries -- Cases, Glossary, Capabilities -- and no Hypotheses entry, per the proposal's section 2.10 decision.
  - Each sidebar entry links to its screen's route from the router skeleton task.
  - The topbar renders a breadcrumb through TUI's Breadcrumb primitive reflecting the currently matched route, not a hand-derived path string.
  - The topbar displays a fixed, always-visible "No auth in this build" indicator regardless of which route is active.
  - The AppShell wraps every route the router skeleton defines, so no screen renders outside it.
depends_on:
  - task/frontend-console-foundation/router-skeleton
implements:
  - constraints/no-route-enforces-authentication
sources:
  - intake/onda-1-scope.md
---

## What it is
The sidebar, topbar breadcrumb and no-auth indicator the scope's section 0 and 2.10 decisions ask for, composed over TUI's Breadcrumb primitive rather than a hand-rolled path string.
It wraps every route the router-skeleton task defines.
The no-auth indicator encodes `constraints/no-route-enforces-authentication`, decided into the specification this session via the material's own explicit statement (docs/frontend-triage-console-proposal.md, section 0).

## Notes
None.
