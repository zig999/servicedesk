---
subject: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
given:
  - case version 1 of a case is released, its manifest referencing revision 2 of hypothesis
    customer-equipment-fault
when:
  - the curator revises customer-equipment-fault
then:
  - revision 3 of customer-equipment-fault is created
  - revision 2's own content is unchanged
  - version 1's manifest still references revision 2, unchanged
involves:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/case-version
---

## Description

Complements `a-released-version-keeps-its-original-revision`: the same released reference that keeps version 1 reading revision 2 forever is what turns this revise into a create instead of an overwrite — the two rules read one fact from opposite ends.
