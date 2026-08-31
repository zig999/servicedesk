---
type: policy
statement: Where the pinned case version's own case-input-requirements name a capability apart from its requirements because that capability's own stored input schema does not currently hold a well-formed shape, the interface assembling the subject before a diagnose, simulate-case, or simulate-hypothesis call discloses that capability's identity to the person composing the subject.
constrains:
  - domain/integration/capability
  - domain/knowledge/case-input-requirement
consistency: eventual
---

## Description

The case-input-requirements read already names such a capability separately exactly so an operator can find and re-register it; withholding that same fact from the person actually composing the subject would waste the one read that already computed it, and the composer is ordinarily the same person who could act on it.
This is a disclosure, not a refusal: nothing about the call or the composed subject is blocked by a malformed capability's presence, the same restraint a-simulated-subject-missing-a-requirement-degrades-not-refuses and an-unresolvable-observation-ends-unavailable already hold elsewhere in this specification.
