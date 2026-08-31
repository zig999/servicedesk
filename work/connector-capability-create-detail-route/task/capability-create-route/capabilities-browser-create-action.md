---
title: Capabilities browser opens the create route
summary: The capabilities browser's "New capability" action navigates to the create route instead of opening the popup dialog.
rationale: The planning cut the consumer change apart from the screen it consumes -- the browser screen and the create route are two sides of one seam, and changing both in one task would leave neither demonstrable on its own.
sources:
- intake/scope.md
objective: The capabilities browser's create action takes the operator to the routed create screen.
criteria:
- Activating "New capability" on the capabilities browser navigates to the create route.
- Activating "New capability" opens no dialog over the capabilities browser.
- The capabilities browser screen holds no create/edit form-target state of its own.
- The "New capability" action renders while the list is loading, while it has failed to load, and while it is empty, as it does today.
- Clicking a row on the capabilities browser still navigates to that capability's own detail route.
depends_on:
- task/capability-create-route/capability-create-screen
implements:
- contracts/integration/capability-registry
---

## What it is
One change to the capabilities browser screen: its create action becomes a navigation, and the state that used to host the dialog goes away with it.
The row-click navigation the screen already performs is untouched.

## Notes
REMAINDER, from the specification -- no clause of rules/integration/one-capability-answers-one-concept's statement reaches a criterion of this task: its three clauses all concern registration and concept resolution outcomes, while every criterion here concerns where the capabilities browser's create action and its rows navigate.
Belongs: the task delivering the routed create screen's submission of register-capability and what the operator is told when registration is refused, and the backend act holding the concept read's duplicate refusal -- neither is this navigation-only task.
Advisory: criteria on navigating to the create route and on rows navigating to the detail route both presuppose those two routes already exist and are reachable; no candidate names a route, a screen or a dialog, so the create route is a seam with whichever task introduces it.
Advisory: the criterion on the "New capability" action rendering through loading/failed/empty states is anchored to current implementation behavior rather than to any candidate; the reviewer should confirm that "as it does today" is the intended authority for it.
