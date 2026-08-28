---
subject: rules/integration/a-capability-input-schema-holds-a-well-formed-object
given:
  - a capability was registered before this rule existed, its stored input schema holding syntactically valid JSON with no properties object
when:
  - a case version's input requirements are derived over a collection plan this capability answers a concept of
then:
  - the capability is read as declaring no properties and no required attributes
  - it contributes no attribute to the case version's derived requirements
  - the read names the capability separately as not declaring this shape
involves:
  - domain/knowledge/case-input-requirement
  - rules/knowledge/a-case-versions-input-requirements-are-derived
---

## Description

Nothing about this capability's own registration changes on its own — re-registering it, with the shape this rule now demands, is an operator's act this scenario only makes visible, never one this specification performs for them.
