---
contract_version: siegard-reconcile/1
title: Migration 0011 backfills a legacy row's elapsed_ms to 0 instead of failing
summary: >-
  Applying migrations/0011-investigation-evidence-elapsed-ms.sql against production failed because
  the table already held real rows collected before elapsed_ms existed, contradicting the
  migration's own original comment ("no environment holds a pre-existing row"). Edited by hand to
  ALTER TABLE ... ADD COLUMN elapsed_ms INTEGER NOT NULL DEFAULT 0, backfilling those rows, after
  the specification's own decided reading for this exact case was added to
  domain/investigation/evidence.md and disclosed in decision-log.md: a legacy row's elapsed_ms is
  0, meaning not measured. Confirmed correct by applying it against production (4 rows, all now
  elapsed_ms=0) and against the test schema.
target: backend
files:
  - path: migrations/0011-investigation-evidence-elapsed-ms.sql
    change: >-
      ADD COLUMN elapsed_ms INTEGER NOT NULL, with no DEFAULT, becomes ADD COLUMN elapsed_ms
      INTEGER NOT NULL DEFAULT 0 — a pre-existing row now backfills to 0 instead of the migration
      refusing to apply.
nodes:
  - node: domain/investigation/evidence
    conforms: true
    how: >-
      The node's own Description now states: "An evidence item collected before this attribute
      existed reads elapsed_ms as 0, meaning not measured, never a read failure and never an
      invented duration." The migration's DDL (ALTER TABLE investigation_evidence ADD COLUMN
      elapsed_ms INTEGER NOT NULL DEFAULT 0;) is exactly that reading's mechanism, and its own
      comment attributes the reading to the specification and decision-log rather than asserting
      it as an independent rule. No value, rule or refusal in the file departs from or duplicates
      as its own authority anything domain/investigation/evidence holds.
    encoded_at:
      - migrations/0011-investigation-evidence-elapsed-ms.sql
notes: >-
  One delegation, one file — the trace binds exactly one node (domain/investigation/evidence) to
  this file, and the specification-conformance-reviewer's judgment ran over that single pair.
  The fact this migration encodes was decided in this same session, in the same commit range, by
  /analyse (commit 297e597) — before this file was edited (commit 3b846bf) — so this is a case
  where the specification moved first and the source was corrected to match it, not the reverse.
---
