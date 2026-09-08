---
subject: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
given:
  - an OpenAPI document link answers a document declaring swagger 2.0
when:
  - a connector configuration draft is requested from that link
then:
  - the request is refused, naming the declared version
  - no draft is generated
---

## Description

A 2.0 document names its operations, parameters and security schemes differently from 3.x; reading it as though it were 3.x would misname what the draft resolves rather than refuse honestly.
