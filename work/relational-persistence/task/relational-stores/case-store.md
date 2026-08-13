---
title: ICaseStore answers from the database
summary: The relational adapter behind the case store port, reading a case whole in one transaction and refusing a version that was already written.
rationale: The scope states the four stores answer from the database behind the ports that already exist; one task per port is the planning's cut, each port being one behaviour that is demonstrable on its own.
sources:
  - intake/scope.md
depends_on:
  - task/relational-stores/database-access-helper
  - task/relational-substrate/schema-migrations
  - task/relational-substrate/integration-test-isolation
  - task/case-and-investigation-model/case-aggregate-shape
objective: ICaseStore reads and writes case versions against the database, whole and once.
criteria:
  - A read answers the case root together with its hypotheses and their resolutions and referrals, assembled in one transaction.
  - A read answers either a complete aggregate or nothing, and never a case missing a hypothesis, a resolution or a referral.
  - A read for a slug and version nothing was written under answers with absence as data rather than raising.
  - A write of a slug and version already stored is refused through the case store's typed error, and the stored version is left exactly as it was.
  - A write of a slug and version not already stored is not refused on that ground.
  - A version stored earlier remains readable after later versions of the same slug are written, and the version list answers every version ever written under that slug.
  - Every version the store holds under one slug belongs to one case, and no second case is admitted under a slug the store already holds.
implements:
  - constraints/a-case-is-read-whole
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-slug-identifies-one-case
  - rules/knowledge/every-case-version-remains-readable
---

## What it is

The case store, answering the read the knowledge context publishes.
The aggregate boundary that used to be a document is now a transaction, and write-once is decided by a key rather than by looking first.

## Notes

The port at src/src/case/case-store.port.ts, with writeVersion, readVersion and listVersions, is implemented rather than replaced.
The inventory reports FileCaseStore derived the version list from a directory's own entries, which a relation decides instead.
UNDERDETERMINED, from the specification — no criterion holds the write to one transaction; a store whose write inserts the case root, its hypotheses, and their resolutions and referrals in separate transactions would still pass every criterion as written, and a failure between those inserts leaves a version the next read answers as whole, which constraints/a-case-is-read-whole refuses. A test must exclude a non-atomic write.
ADVISORY, from the specification — the attributes this adapter maps to rows are declared by domain/knowledge/case, domain/knowledge/hypothesis, domain/knowledge/resolution and domain/knowledge/referral, none of which this task implements; the mapping is taken from the task that encodes them rather than restated here.
Decision, beyond the covers — stand: domain/knowledge/case, domain/knowledge/hypothesis, domain/knowledge/resolution and domain/knowledge/referral are named only to point at where the mapping's source of truth lives; this task's own criteria assert nothing about any of their attributes.
ADVISORY, from the specification — contracts/knowledge/case-query, the knowledge context's published read, is left out of implements because this task delivers the persistence adapter behind the port and not the context's outward read; reconciled in epic/relational-stores' uncovered, answered by epic/case-and-investigation-model's read-and-replay task instead.
ADVISORY, from the specification — criterion 7's second clause, that no second case is admitted under a held slug, is demonstrable only structurally, since the slug keys one case and versions hang off it; no candidate states what would distinguish a genuine second case from the next version of the one already there.
