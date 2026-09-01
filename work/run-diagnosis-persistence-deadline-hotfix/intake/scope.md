Corrective increment (behavioral drift found by /reconcile, not a task's criteria — the task
that wrote run-diagnosis.ts was delivered and reviewed before this reading occurred).

Source: siegard-reconcile/diagnosis-pipeline-status-map-wave-3.md, findings against
constraints/the-deadline-is-an-absolute-propagated-instant and
rules/investigation/no-stage-aborts-on-its-deadline (both left unbound by that reconciliation —
the node is right, the behavior is wrong).

Wrong behavior observed, in src/investigation/run-diagnosis.ts's writeWithinDeadline (lines
217-224):

  async function writeWithinDeadline(args: WriteWithinDeadlineArgs): Promise<void> {
    const { store, investigation, now, deadline } = args;
    const boundMs = Math.min(PERSISTENCE_STAGE_BUDGET_MS, Math.max(0, deadline - now));
    const outcome = await racePersist(store.write(investigation), boundMs);
    if (outcome === WRITE_TIMED_OUT) {
      throw new InvestigationWriteDeadlineExceededError(investigation.id, boundMs);
    }
  }

`now` here is `options.now` (run-diagnosis.ts:154), the whole call's own entry instant, propagated
unchanged from runDiagnosis's own top — the same value collection's and judgment's own stage
ceilings are computed from at the very start of the call, before any stage has run. By the time
writeWithinDeadline executes, collection, judgment and consolidation have already run and consumed
however much of the declared total they took. `deadline - now` is therefore not what remains when
persistence actually begins — it is (deadline - entry instant), i.e. approximately the whole
declared total, however much of it earlier stages already spent.

constraints/the-deadline-is-an-absolute-propagated-instant states: "A request records one absolute
deadline at entry, every stage receives the minimum of its nominal budget and the remaining time,
and the internal total stays below the caller's timeout with margin." Its Description: "a stage
finishing early returns its balance to the next, a late one takes from those that follow, and the
last to run pays." Persistence is the last stage, and as written it never pays for what the earlier
stages spent — a run that has already consumed most of the twenty-second total still opens a
further ~2-second window for persistence and can answer later than the declared deadline.

Second, coupled defect in the same function: exactly one `store.write` attempt is made; its first
overrun raises `InvestigationWriteDeadlineExceededError` directly, with nothing retried.
rules/investigation/no-stage-aborts-on-its-deadline's own Description states: "Persistence cannot
degrade because no response exists without a record, which is why it holds its own budget and
retries within what remains." No retry is attempted anywhere in this file.

Both facts are stated fully, with quoted evidence, in
siegard-reconcile/diagnosis-pipeline-status-map-wave-3.md under these two nodes' entries.

Corrective fix to cut as this task:

- Compute the bound `writeWithinDeadline` races its first write attempt against using the time
  actually remaining before the propagated `deadline` at the moment persistence begins — not
  `deadline` minus the original request-entry `now` still carried in `options.now`. The
  discipline that this module and every stage it composes "never reads the system clock
  internally" (run-diagnosis.ts's own header comment,
  constraints/the-deadline-is-an-absolute-propagated-instant) stays intact: whatever the fix
  needs to know how much wall-clock time has actually elapsed since entry must reach it the same
  way every other instant-shaped value already does here — propagated in, not read fresh off the
  clock inside this module. (The pipeline's own already-measured `durations` — collection,
  judgment, and the writing stage's own elapsed_ms — are one candidate source for that elapsed
  figure, already computed by the time writeWithinDeadline runs; another is threading a fresher
  instant through from wherever it is legitimately read. Which mechanism to use is
  /implement-task's decision, not this scope's.)
- After that fix, retry a write once — within whatever of the corrected remaining time is left
  after the first attempt's own overrun — before raising
  InvestigationWriteDeadlineExceededError. A write that settles on the first attempt is
  unaffected; no retry is attempted and no behavior changes for it.
- InvestigationWriteDeadlineExceededError is raised only once neither the first attempt nor the
  retry has settled before the (corrected) propagated deadline elapses.

Out of scope: `written_at`'s own value (buildInvestigationOptions, run-diagnosis.ts:196) and
`ticket_ref`'s empty-string coercion in the relational store — both separate findings recorded
under domain/investigation/investigation in the same reconciliation record, not part of this
scope. No change to PERSISTENCE_STAGE_BUDGET_MS's own value, to any other stage's deadline
handling, or to the declared twenty-second total.

State this as a single corrective task, no survey, no decomposition, bound to whichever deadline
and persistence-retry specification nodes govern it once read fresh.
