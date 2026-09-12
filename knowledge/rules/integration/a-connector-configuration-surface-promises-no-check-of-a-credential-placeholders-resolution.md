---
type: invariant
statement: >-
  A surface presenting or editing a connector configuration states, for each
  ${credential:<name>} placeholder the well-formed JSON object text of its Configuration field
  embeds, that the credential it names is resolved from the server's own configuration at the
  moment of a test or an observation and is checked by nothing on that surface.
constrains:
  - domain/integration/connector-configuration
---

## Description

A credential placeholder resolves against environment configuration the surface cannot see, and an-unresolvable-observation-ends-unavailable is where one that resolves to nothing is met.
Beside a surface that states every other thing it can judge about the text, silence over the one thing it cannot reads as a check that passed; naming the credential and saying where it is checked keeps the operator from submitting a configuration believing the surface confirmed it.
