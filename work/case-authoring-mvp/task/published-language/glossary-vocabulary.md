---
title: Glossary vocabulary
summary: The four vocabularies and the concepts, held exactly once each as plain JSON data.
rationale: The scope stated the glossary reads as one deliverable without cutting it; holding the vocabulary data is cut apart from answering the read because the data's shape and the read's contract change for different reasons.
objective: Every term a case may name — subject type, outcome, action, recipient, concept — exists exactly once in a glossary persisted as plain JSON files, with the two non-conclusion outcomes present before any case validates.
criteria:
  - No vocabulary holds two entries with the same name.
  - A concept declares its name, the subject types it accepts and its ttl in seconds.
  - A concept whose registration states no ttl holds the default of sixty seconds.
  - The glossary holds the outcomes inconclusive-no-data and inconclusive-hypotheses-exhausted before the first case validates.
  - The glossary's records persist as plain JSON files and the dependency manifest declares no database driver.
  - The vocabulary modules import no framework, no driver and no provider client.
implements:
  - domain/glossary/subject-type
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - domain/glossary/concept
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - constraints/the-mvp-persists-to-no-database
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---
## What it is
The published language as data: pure values with no behavior, each term existing exactly once so spelling cannot drift.

## Notes
UNDERDETERMINED, from the specification — constraints/the-domain-depends-on-no-infrastructure states infrastructure reaches the domain only through ports, but the criteria only forbid framework, driver and provider-client imports while requiring JSON-file persistence; nothing as written requires the file persistence to reach the vocabulary through a port, and an import audit would not catch the standard library. Passes as written: a vocabulary module that opens, reads and writes the JSON files itself through the standard library, which the constraint's statement refuses.
REMAINDER, from the specification — rules/knowledge/a-collected-concept-declares-a-ttl's clause that every concept a case collects has a ttl defined in the glossary reaches this task only on the glossary side; the case side reaches no criterion here. Belongs: case validation — the act that holds a case's collected concepts to resolve in the glossary.
REMAINDER, from the specification — constraints/the-domain-depends-on-no-infrastructure names four domain areas and this task's criterion 6 answers only the vocabulary clause. Belongs: the tasks implementing case behavior, the investigation factory and evaluation, each over its own modules.
REMAINDER, from the specification — constraints/the-mvp-persists-to-no-database's clause that everything the system records persists as plain JSON files reaches this task only for the glossary's records, and the deployment half of the fitness reaches no criterion here. Belongs: the tasks that persist the system's other records, and the review over the deployed tree for the deployment clause.
Advisory — contracts/glossary/glossary-query is not implemented by this task; its operations are a published synchronous API no criterion here exercises, so the epic's read task names it instead.
Advisory — the description of rules/glossary/the-non-conclusion-outcomes-precede-the-first-case says recipients and actions also exist before the first case, while its statement and criterion 4 demand only the two non-conclusion outcomes; whichever task registers a case's recipients and actions, or validates the first case, carries that expectation.
