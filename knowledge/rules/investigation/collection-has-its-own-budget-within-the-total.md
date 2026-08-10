---
type: policy
statement: The collection stage carries its own nominal budget of seven seconds inside the declared total deadline; a capability's own declared timeout governs a single call, but never past whatever of that seven-second budget the propagated remaining time still allows.
constrains:
  - domain/investigation/investigation
---

## Description

Decision 3 asked for two figures, not one: a capability's own timeout (a-capability-declares-its-contract) bounds one call, and this is the other — the ceiling the collection stage itself never exceeds, whichever capability is slowest. Without this second figure, a capability that never declares a timeout shorter than its own generous default still holds the whole stage hostage to that default, and the propagation constraint has no nominal budget left to clamp against.
