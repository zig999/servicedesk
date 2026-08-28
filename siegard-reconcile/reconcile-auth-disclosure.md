---
contract_version: siegard-reconcile/1
title: app-shell.tsx rebind after constraints/no-route-enforces-authentication's own extension
summary: constraints/no-route-enforces-authentication's own statement was just extended (via /analyse)
  to require the frontend disclose this build's no-authentication posture to every user, on every screen
  -- deliberately naming only the disclosure's substance, never a specific wording. app-shell.tsx has
  rendered exactly this disclosure unconditionally since the frontend-bootstrap initiative; the node changed
  to match the code, not the other way around.
target: frontend
files:
- path: src/shared/components/app-shell.tsx
  change: unchanged; the specification node was extended to state a fact this file already implements
nodes:
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: 'Topbar''s unconditional right={<span>No auth in this build</span>} prop, rendered by AppShell
    (wired as the root route''s own component, so RouterProvider renders this shell for every routed screen
    without exception), satisfies the node''s own statement -- "the frontend discloses this posture to
    every user, on every screen" -- and its own Description, which now states explicitly that the disclosure''s
    substance is the fact, never a fixed wording: "the exact copy is the frontend''s own to choose and
    free to change without this statement moving."'
  encoded_at:
  - src/shared/components/app-shell.tsx
notes: One delegation ran, over the one file this node binds. This closes the same finding an earlier
  reconciliation (reconcile-frontend-hooks-screens.md) left unbound over this exact node/file pair, now
  that the node's own text was extended via /analyse to hold what the code already does.
---
