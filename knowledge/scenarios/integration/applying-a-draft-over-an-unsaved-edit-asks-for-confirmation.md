---
subject: rules/integration/an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
given:
  - an operator has edited the Configuration field of a connector configuration authoring surface without submitting it
when:
  - the operator requests to apply a freshly generated draft to that same field
then:
  - the surface asks the operator to confirm before replacing the field's content
  - the field's content stands exactly as the operator left it until they confirm
involves:
  - domain/integration/connector-configuration
---

## Description

The unsubmitted edit is destroyed by an apply exactly as it would be by a register-connector submission; the confirmation is the further explicit act that keeps it from vanishing on a first gesture.
