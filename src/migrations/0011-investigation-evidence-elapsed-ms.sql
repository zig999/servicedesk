-- domain/investigation/evidence gains a required elapsed_ms attribute (task/
-- investigation-telemetry/evidence-collection-measures-elapsed-ms): "How long
-- one concept's own collection attempt took, in milliseconds, whatever the
-- result — the same unit domain/investigation/durations already keeps its
-- own stage totals in." evidence-collection-stage.ts's own evidenceOf() now
-- supplies this on every branch (ok, unavailable, denied, timeout), so this
-- table gains a sibling numeric column the same way investigations already
-- carries cost_calls, durations_collection and their siblings as flattened
-- per-item numeric columns (0005-investigation.sql).
--
-- DEFAULT 0 backfills every investigation_evidence row this script finds
-- already stored: this migration's own first attempt assumed no environment
-- held a pre-existing row, and that assumption was wrong — a real deployment
-- already held rows collected before this attribute existed. The
-- specification's own decided reading (domain/investigation/evidence.md,
-- decision-log.md) is that such a row's elapsed_ms is 0, meaning not
-- measured, never a read failure and never an invented real duration.
-- Every row evidenceStatement() writes from here forward always supplies a
-- real value explicitly, so the default is never read for a new row; it
-- stays on the column rather than being dropped after the backfill, the same
-- as every other DEFAULT this project's own migrations add for exactly this
-- reason (migrations/0009-case-version-lifecycle-schema.sql's own
-- case_versions.state).

ALTER TABLE investigation_evidence
  ADD COLUMN elapsed_ms INTEGER NOT NULL DEFAULT 0;
