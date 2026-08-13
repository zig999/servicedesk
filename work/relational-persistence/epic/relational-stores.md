---
title: The four stores answer from the database
summary: The relational adapters behind ICaseStore, IGlossaryStore, ICapabilityStore and IInvestigationStore, and the one shared access helper they issue statements and open transactions through.
rationale: The scope states the four ports stay and their implementations change, so one epic holds the four adapters; the shared helper is cut out of them because the absence-is-data answer, the typed-error raise and the transaction boundary are one decision the four would otherwise each make. The claim reaches the investigation, capability and glossary elements because an adapter that reads or writes a record whole rests on which attributes that record declares, which no port node states on its own.
sources:
  - intake/scope.md
covers:
  - constraints/a-case-is-read-whole
  - constraints/the-system-persists-to-one-relational-database
  - constraints/the-stored-schema-mirrors-the-declared-model
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-slug-identifies-one-case
  - rules/knowledge/every-case-version-remains-readable
  - rules/investigation/an-investigation-is-written-once
  - rules/investigation/one-evidence-per-collected-concept
  - rules/investigation/one-evaluation-per-required-hypothesis
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-capability-is-read-only
  - rules/integration/one-capability-answers-one-concept
  - domain/integration/capability-registry
  - domain/integration/capability
  - domain/integration/capability-nature
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
  - domain/glossary/concept
  - domain/glossary/subject-type
  - domain/glossary/subject-attribute
  - domain/glossary/action
  - domain/glossary/outcome
  - domain/glossary/recipient
  - contracts/knowledge/case-query
  - contracts/glossary/glossary-query
  - contracts/integration/capability-registry
uncovered:
  - node: contracts/knowledge/case-query
    why: The published read is answered by epic/case-and-investigation-model's replay-and-read task, which reaches it together with the validation the read runs; the case store adapter under this epic serves the port beneath that read rather than the published operation itself.
---

## What it is

Four adapters, each implementing a port that already exists, and the helper they share.
What a file repository decided by reading a directory — that a version exists, that an id was already written, that a term is held once — a key or a transaction decides here.
The reads these adapters answer are the published contracts of the knowledge, glossary and integration contexts, and what they write whole is the investigation aggregate as it is declared.

## Notes

The investigation, capability and glossary elements are claimed here and by epic/relational-substrate, which encodes them as columns; the read-whole constraint, the case-query contract and every-case-version-remains-readable are claimed here and by epic/case-and-investigation-model.
The four ports at src/src/case/case-store.port.ts, src/src/glossary/glossary-store.port.ts, src/src/capability-registry/capability-store.port.ts and src/src/investigation/investigation-store.port.ts are implemented rather than replaced, as the inventory requires.
The typed store errors already declared per module under src/src/errors are reused, including src/src/errors/investigation-already-stored.error.ts.
The inventory reports seven module-audit specs that forbid a driver import inside their own directory by scanning source text, so where an adapter sits decides whether they pass.
