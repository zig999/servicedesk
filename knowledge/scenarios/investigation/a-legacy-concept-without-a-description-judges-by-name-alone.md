---
subject: rules/investigation/judgment-reads-the-evidence-snapshot
given:
  - a concept registered before concepts declared a description holds an empty one
when:
  - a hypothesis collecting that concept is judged
then:
  - the evidence item's concept_description snapshots empty
  - the judgment prompt names that item by its concept alone, with no stated meaning
involves:
  - domain/glossary/concept
  - domain/investigation/evidence
---

## Description

A legacy concept degrades to exactly what it always showed the judgment before this proposal — a name and an observation — never an invented meaning.
