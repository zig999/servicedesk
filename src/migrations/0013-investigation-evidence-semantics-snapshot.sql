-- domain/investigation/evidence gains two required attributes, fields
-- (many domain/investigation/field-semantics) and concept_description
-- (string) (task/evidence-semantics-snapshot/investigation-store-persists-the-snapshot):
-- "fields and concept_description are this item's own snapshotted
-- semantics — the producing capability's own declared field-by-field
-- meaning and the concept's own declared meaning — exactly as the
-- capability registry and the glossary held them at the moment this item
-- was collected, never re-read afterward." evidence-collection-stage.ts
-- already assembles both onto every Evidence item it produces
-- (task/evidence-semantics-snapshot/evidence-collection-snapshots-concept-and-field-semantics);
-- this migration is what lets investigation_evidence carry them through a
-- write and a read.
--
-- fields is stored as one JSONB column holding the whole snapshotted array
-- serialized, rather than a child table decomposing each field-semantics
-- entry's own name/type/description into named columns of its own. This
-- follows the identical decision migrations/0008-connector-configuration.sql
-- already made for a structured value this schema does not otherwise
-- decompose: relational-connector-configuration-store.repository.ts already
-- establishes the read/write shape a JSONB column takes under this
-- project's own driver (an object or array parameter is serialized
-- explicitly before it is sent, and the driver parses the column back into
-- a plain JS value on every read) — the same shape this task's own
-- relational-investigation-store.repository.ts now follows for this
-- column (this task's own inference, recorded in the delivery record).
-- DEFAULT '[]'::jsonb backfills every investigation_evidence row this
-- script finds already stored with an empty array, the same honest-empty
-- snapshot domain/investigation/evidence already sanctions for "a concept
-- whose capability never resolved" — and every row stored before this
-- column existed is exactly such a row, so no read of it is ever refused.
--
-- concept_description is a plain required string, the identical shape
-- migrations/0012-glossary-concept-description.sql already gave
-- concepts.description: TEXT NOT NULL DEFAULT ''. DEFAULT '' backfills
-- every already-stored row with the empty string, the same honest-empty
-- reading domain/investigation/evidence already sanctions for "a concept
-- collected before it declared a description."
--
-- Both DEFAULTs stay on their columns after the backfill rather than being
-- dropped, the same DEFAULT-kept-permanently shape
-- migrations/0009-case-version-lifecycle-schema.sql's own case_versions.state
-- and migrations/0011-investigation-evidence-elapsed-ms.sql's own
-- elapsed_ms already establish, since every row this store writes from here
-- forward always supplies both values explicitly through evidenceStatement().
--
-- Additive only: no column of any other table is touched, no row of
-- investigation_evidence or of any other relation is altered or removed,
-- and every already-stored investigation_evidence row keeps its own
-- existing columns exactly as they were, gaining only these two new ones.

ALTER TABLE investigation_evidence
  ADD COLUMN fields JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE investigation_evidence
  ADD COLUMN concept_description TEXT NOT NULL DEFAULT '';
