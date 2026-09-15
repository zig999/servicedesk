---
subject: rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields
given:
- an operation declares a required path parameter cpf of type string and an optional query parameter includeHistory of type boolean
when:
- an operator requests a capability schema draft generated from that operation
then:
- the draft's input_schema declares a properties object holding cpf typed string and includeHistory typed boolean
- the draft's input_schema declares a required array holding exactly cpf
---

## Description

The ordinary case a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields states in the abstract: two parameters, one required and one not, neither colliding with anything else the operation declares, each reducing to a single JSON Schema type.
