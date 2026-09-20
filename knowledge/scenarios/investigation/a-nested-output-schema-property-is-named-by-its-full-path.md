---
subject: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
given:
  - a capability tech-profile's output schema declares a top-level properties object holding login and installations, installations' own items an object whose own properties hold state
when:
  - an investigation collects tech-profile's concept
then:
  - the evidence item's fields carries a field named login
  - the evidence item's fields carries a field named installations
  - the evidence item's fields carries a field named installations[].state
  - the evidence item's fields carries no field named state alone
involves:
  - domain/integration/capability
  - domain/investigation/evidence
---

## Description

A field state declared only beneath installations' own items is a field-semantics element of its own, named installations[].state rather than state, exactly as a field declared at the schema's own root always was.
