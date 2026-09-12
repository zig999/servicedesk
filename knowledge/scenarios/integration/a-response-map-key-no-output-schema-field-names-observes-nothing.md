---
subject: rules/integration/an-observation-carries-only-the-output-schema-fields-its-response-map-reaches
given:
  - a capability tech-profile is registered naming connector fsm-http, its output schema declaring the top-level properties login and installations
  - the fsm-http connector configuration declares statusMap {"200":"ok"} and responseMap {"id":"data.id","installations":"data.installations"}
  - the call answers 200 with the body {"data":{"id":"u1","installations":["a","b"]}}
when:
  - an investigation collects tech-profile's concept
then:
  - the evidence records result ok
  - the observation carries installations with the value ["a","b"]
  - the observation carries no field named id and no field named login
involves:
  - domain/integration/capability
  - domain/integration/connector-configuration
  - domain/investigation/evidence
---

## Description

The key id was read from the body and carried nowhere, because tech-profile reads no field by that name; the field login the capability does read had no key to reach it.
Nothing refused the configuration and nothing degraded the ending — the observation is ok and thinner than the operator meant it to be.
