---
subject: rules/integration/a-connector-configuration-surface-states-which-response-map-keys-a-registered-capability-reads
given:
  - a capability tech-profile is registered naming connector fsm-http, its output schema declaring the top-level properties login and installations
  - the Configuration field of the fsm-http authoring surface holds a well-formed configuration whose responseMap keys are id, installations and syncEvents
when:
  - the surface reads the capabilities registered naming fsm-http
then:
  - the surface states that installations is read by tech-profile
  - the surface states that id and syncEvents are read by no capability
  - the surface states that tech-profile expects login and no responseMap key names it
involves:
  - domain/integration/capability
  - domain/integration/connector-configuration
---

## Description

The operator renames id to login, or adds login at the path they choose, before saving — the correction an observation ending ok with an empty field set would never have told them to make.
