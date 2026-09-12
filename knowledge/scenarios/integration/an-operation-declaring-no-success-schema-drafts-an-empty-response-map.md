---
subject: rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
given:
  - the chosen operation DELETE /v1/sessions/{sessionId} declares a 204 response with no content and a 404 response
when:
  - a connector configuration draft is generated from that operation
then:
  - the draft's configuration declares statusMap {"204":"ok","404":"unavailable"}
  - the draft's configuration declares responseMap {}
  - the draft's response_fields are empty
  - the draft's reading_notes name the operation with kind no-success-response-schema
involves:
  - domain/integration/connector-configuration-draft
---

## Description

Both maps are drafted, the second empty, so that the configuration applied as drafted issues its call rather than ending unavailable for a missing key; the note says why the map is empty.
