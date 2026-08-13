---
title: IGlossaryStore answers from the database
summary: The relational adapter behind the glossary store port, answering the five vocabularies and the concepts exactly as the database holds them.
rationale: "One task per port is the planning's cut, each port being one behaviour demonstrable on its own. The read states only what it answers, because the specification describes a read resolving a term exactly as the glossary currently holds it and states no read that creates one. Duplicate-write refusal and the unmatched-read shape are dropped from the criteria for the same reason capability-store's were: no citable node states either as a domain fact, and \"absence as data rather than raising\" is treated here as the implementation convention this plan already treats it as on database-access-helper, not as something a criterion tests against a specification node."
sources:
  - intake/scope.md
depends_on:
  - task/relational-stores/database-access-helper
  - task/relational-substrate/schema-migrations
  - task/relational-substrate/integration-test-isolation
objective: IGlossaryStore reads the published vocabularies and concepts from the database exactly as it holds them, and writes what it is given.
criteria:
  - A term read answers the five vocabularies — subject types, subject attributes, outcomes, actions and recipients — as the database holds them at that read.
  - A concept read answers each concept with its name, the subject types it accepts and its ttl.
  - A read answers a term exactly as the glossary currently holds it and adds no term the glossary does not hold.
  - A term write stores the term.
implements:
  - constraints/the-system-persists-to-one-relational-database
  - constraints/the-stored-schema-mirrors-the-declared-model
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/glossary/action
  - domain/glossary/outcome
  - domain/glossary/recipient
  - contracts/glossary/glossary-query
---

## What it is

The store behind the published language.
Every other context translates into it, so a term exists exactly once here and its spelling cannot drift.
A read answers; it does not decide what the vocabulary should contain.

## Notes

The inventory reports that today src/src/glossary/glossary.service.ts writes the two non-conclusion outcomes back through the port when a read finds them missing; no node of the specification states a read that writes, so no criterion here states one.
Where the specification does put those two outcomes is before the first case validates, which task/case-authoring/curated-data-seeded already states as a criterion.
Whether a read that seeds them should exist at all is a question for /analyse and a person, not for this plan to decide by writing it into a criterion.
Dropped: "a term already held is not duplicated by a second write of it." The only citable statement of term uniqueness in the candidate set is domain/glossary/subject-type's own Responsibility, "Name one subject kind exactly once," which covers one of the five vocabularies and not the other four; domain/glossary/_context's Responsibility states the fact for all five but its path fails the plan contract's specNodeRef pattern and cannot be cited at all. No criterion here asserts what the write does on a term already held; that the store's writeTerms does not duplicate is left as this adapter's own implementation, not a tested criterion.
Decision, beyond the covers — stand: domain/glossary/_context is named only to explain why the wider fact it states cannot ground a criterion here — its own identity cannot be cited in any task's implements — not to claim it.
Dropped: "a read for a concept the glossary does not hold answers with absence as data rather than raising." No node states this shape for the glossary read, matching the finding on database-access-helper, whose identical assertion stands there as an advisory convention under the project's own standard rather than a criterion — treated the same way here, so nothing in this task's criteria tests it, and the adapter follows the same absence-is-data convention the shared helper follows without a criterion asserting it as a domain fact.
The port at src/src/glossary/glossary-store.port.ts, with readTerms, writeTerms and readConcepts, is implemented rather than replaced.
ADVISORY, from the specification — no candidate names an explicit write operation for the glossary; contracts/glossary/glossary-query declares only read-vocabulary-term and read-concept, and criterion 4 is backed only by the general system-wide persistence and schema-mirroring constraints, neither of which names a write operation for the glossary specifically. A plain adapter mirroring the five vocabulary elements' and concept's declared attributes into rows is admitted and contradicts nothing, so this is a seam rather than a missing fact.
