---
subject: rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order
given:
- an operation declares a query parameter named status and a request-body field also named status
when:
- an operator requests a capability schema draft generated from that operation
then:
- the draft's input_schema properties object holds exactly one entry named status, holding the query parameter's own type
- the draft's unresolved list names status with reason name-claimed-by-another-parameter
---

## Description

A query parameter and a request-body field of one operation sharing one name is the collision a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order settles by declared order, the parameter standing ahead of the body in that order.
