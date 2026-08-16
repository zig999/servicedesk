---
subject: rules/knowledge/a-case-version-is-written-once
given:
  - case version 1 of a case is released, its manifest referencing revision 1 of hypothesis customer-equipment-fault
  - a new draft, version 2, is created and revision 2 of customer-equipment-fault replaces revision 1 in version 2's own manifest
  - version 2 is released
when:
  - version 1 is read again
then:
  - version 1's manifest still references revision 1 of customer-equipment-fault, unchanged
  - version 1's own hypothesis-revision content still reads exactly as it did before version 2 ever existed
involves:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
---

## Description

The revision a released version's manifest already adopted never moves, however many later drafts revise that same hypothesis — this is what lets slug and version keep naming one content without a digest over it.
