---
subject: rules/integration/an-unfetchable-openapi-link-refuses-the-draft
given:
  - an OpenAPI document link answers an HTTP 404
when:
  - a connector configuration draft is requested from that link
then:
  - the request is refused, naming the fetch failure
  - no parsing is attempted
---

## Description

A link nothing answered has no content yet to hold a parse failure against.
