---
title: Simulate entry links
summary: Adds the "Simulate" entry control to the version screen and to the Versions tab of the case screen.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: A curator on the version screen (/cases/$slug/versions/$version) or on the Versions tab of the case screen (/cases/$slug) can reach the simulation cockpit for that exact version through a "Simulate" entry control, on a version in either draft or released state.
criteria:
  - The version screen shows a "Simulate" control that navigates to /cases/$slug/versions/$version/simulate for the version currently shown, in both draft and released state.
  - The Versions tab of the case screen shows, for each listed version, a "Simulate" control that navigates to that version's own /cases/$slug/versions/$version/simulate, in both draft and released state.
depends_on:
  - task/simulation-cockpit/case-simulation-route
implements:
  - contracts/investigation/case-simulation
  - domain/knowledge/case-version-state
---

## What it is

The two entry points the scope's "Route and entry (6.1)" section names.

## Notes

None.
