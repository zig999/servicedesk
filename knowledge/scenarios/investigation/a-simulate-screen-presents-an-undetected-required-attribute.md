---
subject: rules/investigation/a-composed-subject-presents-every-case-input-requirement
given:
  - a case version's collection plan resolves a capability whose input schema names user_id in required
  - that capability's own connector configuration never embeds user_id as a placeholder in its own call
when:
  - the interface assembles the subject before a simulate-case call against that case version
then:
  - an input for user_id is presented
  - the input is marked required
involves:
  - domain/knowledge/case-input-requirement
  - contracts/investigation/case-simulation
---

## Description

user_id reaches the composer even though no connector configuration's own call ever names it literally — the case-input-requirements read, not a connector's own call-assembly detail, is what the interface presents.
