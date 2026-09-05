---
subject: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
given:
  - hypothesis customer-equipment-fault holds one revision, revision 2, itself in draft state
  - the case's draft manifest pins revision 2 of customer-equipment-fault
when:
  - the curator revises customer-equipment-fault three times, each time changing its criterion
then:
  - customer-equipment-fault's highest revision is still numbered 2
  - revision 2's content is the content of the third, most recent revise
  - the draft's manifest entry still pins revision 2
  - the entry does not disclose a higher revision of customer-equipment-fault
involves:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
---

## Description

The ordinary curation loop the rule exists for: adjusting a criterion's wording before publishing never grows the revision history, and the draft's own pin never falls behind what it already points at.
