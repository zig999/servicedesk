---
contract_version: siegard-reconcile/3
title: Remove ButtonFooter's inherited horizontal margin
summary: 'ButtonFooter (frontend/app/src/shared/components/button-footer.tsx) inherited AppShell main''s
  horizontal p-4 padding, leaving a visible gap between the action bar and the page edges. -mx-4 cancels
  that inherited margin and px-4 restores inner breathing room for the buttons, so the bar spans edge-to-edge
  inside main. Purely presentational spacing; no behavior changed.

  '
target: frontend
files:
- path: src/shared/components/button-footer.tsx
  change: 'Changed the group div''s className from "sticky bottom-0 flex flex-wrap items-center justify-end
    gap-4 border-t border-border bg-surface py-4" to "sticky bottom-0 -mx-4 flex flex-wrap items-center
    justify-end gap-4 border-t border-border bg-surface px-4 py-4".

    '
nodes: []
unbound:
- src/shared/components/button-footer.tsx
notes: 'Judged by 0 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/button-footer-horizontal-margin-fix.returns/.

  Candidates: 0 opened across 0 of 0 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/button-footer-horizontal-margin-fix.returns/`, which are the evidence behind every entry above.
