---
title: Connector configuration persists in the relational store, outside the domain
summary: Wherever a connector's own call configuration is kept persists in the system's one relational database and stays a dependency no domain module imports.
rationale: The scope's own registerConnector validation (an allowed-method vocabulary, a non-empty request address, response-mapping coverage of every output_schema property, and tying a descriptor to a Subject's glossary attribute) is its own explicitly non-binding technical suggestion; no specification node states any of it. domain/investigation/subject states the opposite design deliberately — "every capability's connector receives the whole set and resolves, on its own, which of the attributes it needs and how to derive its call from them" — and the decision log records capability.connector itself as a deliberately opaque string "to keep vendors out of the model." This task therefore narrows to the two architecture constraints that do bind wherever this configuration is stored, and leaves the descriptor's shape, its validation predicates and its replace-on-reregister semantics entirely to the implementing task's own technical design.
sources:
  - intake/scope.md
objective: Whatever configuration a connector needs to reach its external system at call time is written to and read from the system's single relational store, never a file, and is never a dependency the domain layer imports.
criteria:
  - The connector's call configuration is written to and read from the system's one transactional relational store, never a file the deployment ships or writes.
  - No module under the domain layer (case behavior, investigation factory, evaluation, vocabulary) imports the connector-configuration store, its persistence driver, or any HTTP client package directly.
implements:
  - constraints/the-domain-depends-on-no-infrastructure
  - constraints/the-system-persists-to-one-relational-database
---

## What it is

The persistence boundary for a connector's own call configuration: one relational store, reached the same way every other record is reached, never imported by domain code.

## Notes

The descriptor's exact shape, its validation and any replace-on-reregister behavior are the implementer's free technical choice, per the scope's own non-binding framing of that mechanism.
None of the rules this scope's illustration touched on (glossary membership of a cited field, glossary membership of a subject attribute) are enforced here — the specification does not state that a connector's own registration is where either check happens.
This task was re-cut once already: an earlier cut (as connector-descriptor-registration) asserted an allowed-method vocabulary, a non-empty request-address shape, response-mapping coverage of a capability's output_schema, and a tie between a descriptor and the glossary's subject-attribute vocabulary, none of which any specification node states; domain/investigation/subject and the decision log's opaque-connector entry state the opposite — this derivation is deliberately opaque to the domain.
Decision, beyond the covers — stand: domain/investigation/subject is named only to explain why this task claims no glossary/subject-attribute check, never as a fact this task implements; the epic's covers were deliberately not grown for it, since nothing here reads or changes Subject's own shape.
The execution-contract-binder also flagged the first version of criterion 1 for naming the constraint's own closed four-thing enumeration (cases, published vocabularies, capability registrations, investigations) by name, which would have claimed a connector's configuration as an undeclared fifth member of that closed set; the criterion now restates only the constraint's own general statement.
constraints/the-system-persists-to-one-relational-database's own Description still enumerates only four kinds of persisted record; once this task ships, that description will read as an incomplete inventory of what the store now holds — a fact for whoever next touches that constraint's prose, not something this task's criteria can fix.
