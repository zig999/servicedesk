One wrong behavior observed in delivered code, found by this session's /reconcile over
corrective-batch-hotfixes-post-closure-drift: a hypothesis evaluation's own call record
(usage, elapsed_ms, prompt) is lost end-to-end for the judgment-failure outcome, even though an
evaluator call actually ran, in two places that must be fixed together for the fix to have any
effect a reader can observe.

1. src/investigation/judgment-stage.ts's judgmentFailureEvaluation constructs a bare
   { hypothesis, verdict: 'inconclusive', reason: 'judgment-failure', citations: [] } and discards
   the completed outcome (the rejected `first` in runIsolatedCall, or the rejected `retry` in
   retryOrFail) that produced it -- both are full EvaluationOutcome values already carrying their
   own usage/elapsed_ms/prompt before citation validation runs.
2. src/persistence/relational-investigation-store.repository.ts's IEvaluationRow, its
   INVESTIGATION_EVALUATIONS_TABLE insert (evaluationStatement) and its read-side reconstruction
   (evaluationOf) never carry usage/elapsed_ms/prompt at all, for any evaluation of any reason --
   so even if judgment-stage.ts is fixed alone, the persisted-and-reread record still loses the
   fields on the next round trip.

domain/investigation/evaluation states: "usage, elapsed_ms and prompt are the call's own record ...
present exactly when a call happened, absent when reason `no-data` means judgment was never called
at all" -- the absence is tied specifically to reason no-data, not to every inconclusive reason,
and a judgment-failure evaluation is only ever reached after a call already completed.

Reconciliation's own finding on judgment-stage.ts: "Anyone reading an investigation's evaluations
to account for provider spend or call latency will see every judgment-failure hypothesis as if no
call had been made for it, even though one -- sometimes two -- actually ran; cost and duration are
silently understated exactly where a call did happen." On the repository: "An evaluation's own
usage, elapsed_ms and prompt ... are never inserted and never selected back; a stored
investigation's evaluations always come back with none of these, even for a hypothesis a call was
actually run for, so an audit replaying a persisted record from this store cannot recover the
per-hypothesis call facts the aggregate is supposed to hold complete."

Full reconciliation record: siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.md --
the specific returns are at
siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.returns/src__investigation__judgment-stage.ts.yaml
and
siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.returns/src__persistence__relational-investigation-store.repository.ts.yaml.

The specification node already states this fact (domain/investigation/evaluation) -- this is
source drifting from an already-stated spec, not a specification gap. Both files must change
together: fixing judgment-stage.ts alone produces a value the repository still drops on write, and
fixing the repository alone has nothing to persist since judgment-stage.ts never constructs the
data.
