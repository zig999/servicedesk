---
subject: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
given:
  - hypothesis customer-equipment-fault holds one revision, revision 2, itself in released
    state, referenced by no case version at all
when:
  - the curator revises customer-equipment-fault
then:
  - revision 3 of customer-equipment-fault is created, in draft state
  - revision 2's own content is unchanged
involves:
  - domain/knowledge/hypothesis-revision
---

## Description

Demonstrates the decoupling this specification now holds: revision 2 is released by the hypothesis's own action, whether or not any case version's manifest ever adopted it, and that alone — its own state, read directly — is what turns this revise into a create instead of an overwrite.
