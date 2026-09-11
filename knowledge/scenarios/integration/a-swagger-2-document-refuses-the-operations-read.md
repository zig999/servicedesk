---
subject: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
given:
  - an OpenAPI document link answers a document declaring swagger 2.0
when:
  - the Configuration Helper reads that document's operations
then:
  - the request is refused, naming the declared version
  - no operations are read
---

## Description

A 2.0 document names its operations differently from 3.x; listing them as though they were 3.x operations would misname what the operator chooses from rather than refuse honestly.
