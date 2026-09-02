One wrong behavior observed in delivered code, found by this session's /reconcile over
corrective-batch-hotfixes-post-closure-drift: src/investigation/run-diagnosis.ts stamps
written_at from a pre-write clock read instead of the store's own settle confirmation, for both
the first write attempt and the retry.

Specifically:
- buildInvestigationOptions sets written_at: new Date(readClockMs()).toISOString() before
  writeWithinDeadline is ever called -- i.e. before persistence is even attempted.
- investigationForRetry sets written_at the same way, again from a fresh readClockMs() read, taken
  immediately before the retry's own write is dispatched, not after it settles.

rules/investigation/written-at-records-when-the-write-settled states: "An investigation's
written_at holds the instant the store settled the write that persisted that investigation's
record -- never the instant the diagnose request arrived, and never the instant a write attempt
was issued against the store." Both of run-diagnosis.ts's readings are exactly the kind the rule
excludes: one at record-assembly time, one at retry-issue time -- neither is the store's own
confirmation that the write settled.

Reconciliation's own finding: "written_at is read from the local clock at record-assembly time --
before persistence is even attempted -- and, on a retry, again from the local clock immediately
before that second write is dispatched; neither reading is the store's own confirmation that a
write settled. Persisted this way, an audit reading written_at to learn when the record came into
being instead reads the moment the response pipeline finished assembling the investigation (or the
moment the retry was issued), drifting from the true persist instant by however long that write
actually took to settle."

Full reconciliation record: siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.md --
the specific return is at
siegard-reconcile/corrective-batch-hotfixes-post-closure-drift.returns/src__investigation__run-diagnosis.ts.yaml.

The specification node already states this fact
(rules/investigation/written-at-records-when-the-write-settled) -- this is source drifting from an
already-stated spec, not a specification gap.
