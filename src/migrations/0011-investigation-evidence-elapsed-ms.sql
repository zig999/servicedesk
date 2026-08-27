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
-- Plain NOT NULL with no DEFAULT: this is a fresh column on a table this
-- delivery finds holding no pre-existing rows in any environment it runs
-- against, so there is nothing to backfill and no legacy-row value to invent
-- as a domain fact. Every row from this migration forward is written only by
-- evidenceStatement() below, which now always supplies it.

ALTER TABLE investigation_evidence
  ADD COLUMN elapsed_ms INTEGER NOT NULL;
