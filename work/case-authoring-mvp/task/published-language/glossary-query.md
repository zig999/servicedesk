---
title: Glossary query
summary: The published synchronous read that resolves a vocabulary term or a concept exactly as the glossary currently holds it.
rationale: Cut as the seam between the glossary's data and its consumers, so case validation consumes a contract rather than a store; the scope stated the reads without cutting them from the data.
objective: read-vocabulary-term and read-concept answer any term or concept exactly as the glossary currently holds it.
criteria:
  - Reading a term the glossary holds answers that term as the glossary holds it.
  - Reading a term the glossary does not hold reports the absence rather than an invented term.
  - Reading a concept answers its accepted subject types and its ttl.
  - A read after the glossary's data changes answers the current holding, never a remembered one.
depends_on:
  - task/published-language/glossary-vocabulary
implements:
  - contracts/glossary/glossary-query
  - domain/glossary/subject-type
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - domain/glossary/concept
  - constraints/the-mvp-persists-to-no-database
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---
## What it is
The glossary-query contract's two operations, the upstream every case-validation term check reads through.

## Notes
REMAINDER, from the specification — rules/glossary/the-non-conclusion-outcomes-precede-the-first-case states a pre-existence this read never seeds and no criterion demonstrates. Belongs: the act that seeds the glossary's outcome vocabulary before the first case validates — the glossary's write side and the case-validation act, not this published read.
REMAINDER, from the specification — neither clause of rules/knowledge/a-collected-concept-declares-a-ttl reaches a criterion here: the collection demand is on collection and the sixty-second default is registration behavior this read never exercises. Belongs: the concept-registration act and the collection and case-validation act where every collected concept must find its ttl defined.
Advisory — the contract declares only the two operation names and that resolution answers exactly as the glossary currently holds it; no candidate fixes a request or response shape nor a named form for the absence criterion 2 requires, so if the business wants a specific absence answer, the analysis states it in the specification rather than the delivery inventing it.
