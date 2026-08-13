---
title: IInvestigationStore answers from the database
summary: The relational adapter behind the investigation store port, writing one record whole in one transaction, refusing a second write of an id already stored, and reading back every part the record declared.
rationale: One task per port is the planning's cut; write-once moving from a read-before-write to a key the database holds is stated by the inventory as what a unique key would decide instead. The criteria enumerate the record's declared parts because a store that persists an aggregate whole is falsifiable only against what that aggregate declares.
sources:
  - intake/scope.md
depends_on:
  - task/relational-stores/database-access-helper
  - task/relational-substrate/schema-migrations
  - task/relational-substrate/integration-test-isolation
  - task/case-and-investigation-model/investigation-record-shape
objective: IInvestigationStore writes one investigation whole, once, and reads it back exactly as written.
criteria:
  - A write persists the id, requester, ticket reference when one was given, narrative, subject with its whole set of attribute-values, prompt version, model, every evidence item, every evaluation, the assessment, the cost, the durations, written_at and the pinned slug and version, in one transaction.
  - A write that fails part way leaves no part of the record stored.
  - A second write of an id already stored is refused through the existing typed error, decided by a key the database holds rather than by reading before writing.
  - A write of an id not already stored is not refused on that ground.
  - A read answers the record holding one evidence item for each concept the collection plan named and one evaluation for each hypothesis the pinned case required.
  - A read answers each evidence item with its concept, inputs, observation, when it was observed, its ttl, its origin, the result its collection ended in and the detail it carried when it had one.
  - A read answers each evaluation with its hypothesis, its verdict, the citations it carried when decided and the reason it carried when inconclusive.
  - A read answers the assessment with its outcome, its referral, its determining hypothesis when one was named, and its text.
  - A record already stored is altered by no later write.
  - No part of a record is held in a file.
implements:
  - constraints/the-system-persists-to-one-relational-database
  - constraints/the-stored-schema-mirrors-the-declared-model
  - rules/investigation/an-investigation-is-written-once
  - rules/investigation/one-evidence-per-collected-concept
  - rules/investigation/one-evaluation-per-required-hypothesis
  - domain/investigation/investigation
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/investigation/evidence
  - domain/investigation/evidence-result
  - domain/investigation/evaluation
  - domain/investigation/verdict
  - domain/investigation/evaluation-reason
  - domain/investigation/citation
  - domain/investigation/assessment
  - domain/investigation/cost
  - domain/investigation/durations
---

## What it is

The store of the immutable result.
One record per request, written once and never mutated, so an audit reads what actually ran.
What the aggregate declares is what the store persists and what a read gives back, part for part.

## Notes

The port at src/src/investigation/investigation-store.port.ts, with write and read, is implemented rather than replaced.
The inventory reports FileInvestigationStore enforced write-once by reading before writing and computed a digest over the bytes it read, neither of which has an equivalent once the document is rows.
UNDERDETERMINED, from the specification — criterion 6 lists an evidence item's fields exhaustively, but domain/investigation/evidence also declares a required relationship, cardinality 1, to domain/integration/capability ("the capability reference pins which registered capability, at which version, produced this observation"), which neither criterion 1 nor 6 names. An adapter persisting only the eight named fields, with no capability pin, would pass every criterion above as written, and a test must exclude it — constraints/the-stored-schema-mirrors-the-declared-model refuses a required relationship holding no column.
REMAINDER, from the specification — rules/investigation/one-evaluation-per-required-hypothesis's second clause, "inconclusive counts, silence does not," is a totality check the rule's own Description assigns to construction ("the factory refuses an investigation whose evaluations do not cover requires-evaluation-of totally"), not to storage; the store only ever receives an already-complete aggregate. It belongs to the task that constructs and validates the Investigation aggregate before it reaches this store.
