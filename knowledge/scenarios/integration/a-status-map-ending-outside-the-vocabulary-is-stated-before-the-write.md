---
subject: rules/integration/a-connector-configuration-surface-states-what-the-http-connector-would-refuse-in-its-configuration-fields-content
given:
  - the Configuration field of a connector configuration authoring surface holds a well-formed object whose statusMap declares "200" as "OK"
when:
  - the surface judges the field's content
then:
  - the surface states that the statusMap entry for 200 names an ending outside the vocabulary and names ok, denied, timeout and unavailable as the endings admitted
  - the act submitting the registration stays offered
involves:
  - domain/integration/connector-configuration
---

## Description

The registry would accept this text and the HTTP connector would end every observation through it unavailable; the surface says so while the operator can still change one letter, and withholds nothing the registry would take.
