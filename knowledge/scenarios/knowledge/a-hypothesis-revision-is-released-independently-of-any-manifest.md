---
subject: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
given:
  - hypothesis customer-equipment-fault holds one revision, revision 1, in draft state
  - no case version's manifest holds an entry for customer-equipment-fault
when:
  - the curator releases revision 1
then:
  - revision 1's state becomes released
  - no case version is affected
involves:
  - domain/knowledge/hypothesis-revision
---

## Description

A hypothesis-revision's own release answers to no case: a curator may release one that has never been placed in any manifest at all, and nothing about any case version changes when they do.
