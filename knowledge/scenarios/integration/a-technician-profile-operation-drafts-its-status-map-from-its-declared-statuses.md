---
subject: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
given:
  - the chosen operation GET /v1/technicians/{userId}/profile declares responses keyed 200, 403, 503 and default
when:
  - a connector configuration draft is generated for connector fsm-http from that operation
then:
  - the draft's configuration declares statusMap {"200":"ok","403":"denied","503":"unavailable"}
  - the draft's status_readings name 200, 403 and 503, each with its ending and the description the document declares it under
  - the draft's reading_notes name default with kind default-response-not-drafted
  - no status is drafted as timeout
involves:
  - domain/integration/connector-configuration-draft
---

## Description

Three declared statuses, three entries; the default response names no status and is disclosed as read past rather than silently dropped.
