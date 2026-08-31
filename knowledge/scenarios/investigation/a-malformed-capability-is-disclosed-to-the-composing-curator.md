---
subject: rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
given:
  - a case version's collection plan resolves a capability whose own stored input schema does not currently hold a well-formed shape
when:
  - the interface assembles the subject before a diagnose or a simulate call against that case version
then:
  - that capability's identity is disclosed to the person composing the subject
involves:
  - domain/integration/capability
  - domain/knowledge/case-input-requirement
---

## Description

The concept this capability answers asks the composer for nothing at all; without this disclosure nothing would tell them why, and the capability would stay malformed until someone happened to notice on their own.
