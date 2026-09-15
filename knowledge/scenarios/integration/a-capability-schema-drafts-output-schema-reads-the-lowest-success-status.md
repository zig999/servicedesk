---
subject: rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
given:
- an operation declares a 200 response and a 201 response, both under application/json, each declaring a top-level properties object naming id, the 200 response declaring id typed string and the 201 response declaring id typed integer
when:
- an operator requests a capability schema draft generated from that operation
then:
- the draft's output_schema properties object holds exactly one entry named id, typed string
---

## Description

Two success response schemas declaring one field name under differing declarations is the case a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses settles by keeping the lowest success status's own declaration, 200 before 201.
