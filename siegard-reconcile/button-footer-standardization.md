---
contract_version: siegard-reconcile/3
title: ButtonFooter component, as the button-footer-standardization delivery wrote it
summary: The two files the delivery of task/shared-action-footer/button-footer-component wrote under the
  button-footer-standardization initiative, read against the specification nodes the trace binds to them
  and the node that task implements.
target: frontend
files:
- path: src/shared/components/button-footer.spec.ts
  change: written by the delivery of task/shared-action-footer/button-footer-component
- path: src/shared/components/button-footer.tsx
  change: Exports ButtonFooter, a component taking children and rendering them, in received order, inside
    a sticky bottom-0 flex row aligned to the end.
nodes: []
unbound:
- src/shared/components/button-footer.spec.ts
- src/shared/components/button-footer.tsx
notes: 'Judged by 2 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/button-footer-standardization.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) constraints/no-route-enforces-authentication
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 0 opened across 0 of 2 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/button-footer-standardization.returns/`, which are the evidence behind every entry above.
