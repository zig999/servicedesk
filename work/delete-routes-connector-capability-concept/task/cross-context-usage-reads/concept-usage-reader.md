---
title: A reader answering whether anything still names a concept
summary: A port in the glossary, with its implementation, answering whether a registered capability answers
  a concept, a collected evidence item or an evaluation citation names it, or any hypothesis-revision's
  collects lists it.
rationale: Cut as one task rather than one per source because the port mirrors the governing rule's own
  condition, so it changes for exactly one reason — that condition changing — whereas a task per store
  would put one rule's condition in three places and leave the composition with no home. Cut ahead of
  the operation that consumes it because it introduces an interface the glossary does not have today.
sources:
- intake/scope.md
objective: Whether anything the governing rule names still names a given concept is readable from the
  glossary through a port, without the glossary owning the capability, case or investigation stores.
criteria:
- Given a registered capability whose own concept is the queried name, the reader answers that the concept
  is named.
- Given a stored evidence item recording the queried concept, the reader answers that the concept is named.
- Given a stored evaluation citation recording the queried concept and no stored evidence item recording
  it, the reader answers that the concept is named.
- Given a hypothesis-revision whose own collects lists the queried concept and which no case version manifests,
  the reader answers that the concept is named.
- Given nothing that answers, records, cites or collects the queried name, the reader answers that the
  concept is not named.
- The reader reports which of the four kinds of reference it found, so a caller can refuse for a stated
  reason rather than for an unexplained one.
- The port is declared in the glossary module and the glossary module imports no database driver to obtain
  the answer.
- The adapter is constructible from the same composition point that already builds the other cross-module
  readers.
reference:
- inventory/refusal-guard-rule-evidence.md
- src/src/glossary/glossary.service.ts
- src/src/capability-registry/connector-configurations-reader.port.ts
- src/src/persistence/relational-investigation-store.repository.ts
- src/src/persistence/relational-case-store.repository.ts
- src/src/factories/build-app.factory.ts
implements:
- domain/integration/capability
- domain/investigation/evidence
- domain/investigation/citation
- domain/knowledge/hypothesis-revision
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is
The missing read the concept removal's guard needs, covering all four references the rule names in one port.
It answers what still names a concept and decides nothing about whether that refuses a removal.

## Notes
ADVISORY, from the specification — the enumeration of the four reference kinds, and that an unmanifested hypothesis-revision's own collects counts, is held by rules/glossary/a-registered-concept-is-never-removed, outside this task's candidate set; the executor reads the enumeration from this task's own text rather than from the specification as cut.
Decision, beyond the covers — stand: rules/glossary/a-registered-concept-is-never-removed is implemented by task/concept-removal/remove-concept-operation, this reader's own consumer, so the enumeration is governed there; growing this reader task's claim would duplicate that node's coverage rather than close a real gap.
UNDERDETERMINED, from the specification — constraints/the-domain-depends-on-no-infrastructure forbids the domain layer a framework, driver or provider client; an implementation satisfying every criterion by having the glossary module import a web/DI framework or a provider client (never a database driver) would still violate that constraint.
REMAINDER, from the specification — constraints/the-domain-depends-on-no-infrastructure's reach over case behavior, the investigation factory and evaluation belongs to the tasks that build those modules, not to this reader.
ADVISORY, from the specification — whether a citation can name a concept no collected evidence item names (criterion 3's given state) is not shown reachable by the candidates; the criterion is implementable regardless, but the demonstrating fixture may construct a state the specification does not say can occur.
