# Bind the specification's own staleness fact to the already-delivered cockpit

Two nodes were just written via `/analyse`, promoting a fact ("D8") that already lived only in a
closed initiative's own intake material into the specification:

- `rules/investigation/a-simulation-result-is-stale-once-its-source-changes` — a case-simulation
  result (its evaluations and, where one was produced, its assessment) is stale once the case
  version it was produced from, or a hypothesis-revision that version manifests, changes after
  the result was produced.
- `scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result` — the concrete case:
  a curator returns to the cockpit from editing the version or a hypothesis-revision it manifests,
  and the shown result is marked stale.

`frontend/app/src/hooks/use-case-simulation-cockpit.ts` already implements this: its own return-
from-editing effect invalidates the version's query and calls `history.markLastRunStale()`
unconditionally on return (`CaseVersionRecord` carries no hash/`updated_at` to compare against, so
the delivered code always marks stale — the coarsest safe reading the rule's own Description
explicitly allows). The file's own header comment previously cited only "D8" (from
`work/case-simulation-frontend/intake/scope.md`, a closed initiative) as its authority; that
citation is now stale in the same sense a code comment can be, since the fact itself has a proper
home.

## What this scope asks for

No behavior change is expected. The task is to:
1. Reread both nodes fresh against the already-delivered `use-case-simulation-cockpit.ts`, and
   record which nodes the file implements.
2. Where the file's own comments still cite "D8" as authority rather than the two nodes now
   written, update the citation (a comment fix, not a behavior change).
3. Add whatever test this specification-level fact still lacks — the file's own criterion-6
   coverage today proves only that `markLastRunStale` is called on return, not that it is called
   *because* the case version or a hypothesis-revision changed (the delivered code cannot
   distinguish the two, by the rule's own coarsest-reading allowance, but a test should still prove
   the observable behavior the rule and scenario state: returning from editing marks the shown
   result stale).
4. Bind the two nodes to the file once delivered.

## Human authorization

The human confirmed proceeding with this bind after the two `/analyse`-written nodes were
committed and after two cheaper `/reconcile` passes closed the two findings that could be closed
without new tasks (see `siegard-reconcile/reconcile-assessment-consolidator-widening.md` and
`siegard-reconcile/reconcile-auth-disclosure.md`) — this is the one remaining fact that `/reconcile`
could not close, because the two nodes it names were never delivered by any task.
