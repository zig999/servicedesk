---
subject: rules/integration/an-answered-draft-request-states-its-draft-to-the-operator
given:
  - the Configuration Helper of the fsm-http authoring surface has requested a draft for GET /v1/technicians/{userId}/profile
  - the answer carries status readings for 200, 403 and 503, seven response fields each read through the envelope data, one reading note of kind default-response-not-drafted with subject default, and no method mismatch
when:
  - the answer arrives
then:
  - the surface states the drafted configuration text
  - the surface states each of the three status readings with its status, its ending and what the document declared it as
  - the surface states each of the seven response fields with its name, its path, its status and the envelope data
  - the surface states the note with its kind and its subject default, apart from every other note kind
  - the surface states no method mismatch
  - the content of the Configuration field is what it was before the answer arrived
involves:
  - domain/integration/connector-configuration-draft
---

## Description

Every part the answer carries reaches the operator, nothing it does not carry is stated, and the field waits for the operator's own act.
