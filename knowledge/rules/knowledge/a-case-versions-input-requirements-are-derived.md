---
type: policy
statement: A case version's input requirements are one case-input-requirement per subject attribute that the input schema of a capability answering a concept in its collection plan names in properties; that entry's required is true where any such capability's own input schema names the attribute in required, and its capabilities are every capability currently answering such a concept and naming the attribute in properties. A concept the collection plan holds that no registered capability currently answers, or that more than one currently answers, contributes no attribute to this set, and neither does a capability whose own stored input schema does not currently hold a well-formed shape; the read naming these requirements names such a capability separately, since it never appears among any entry's own capabilities.
constrains:
  - domain/knowledge/case-version
  - domain/integration/capability
  - domain/knowledge/case-input-requirement
consistency: eventual
---

## Description

This is where the knowledge and integration contexts negotiate for input, the same as every-collected-concept-has-a-read-only-capability already negotiates for output: a case version's collection plan is knowledge's own fact; which capability currently answers each of its concepts, and what that capability's input schema currently declares (a-capability-input-schema-holds-a-well-formed-object), are integration's. Neither side stores the other's answer — the set is recomputed at every read, never persisted, the same as every other projection this specification derives.
A concept the collection plan reaches that no registered capability currently answers, or that more than one currently answers, is already a fact an observation of it degrades on its own (an-unresolvable-observation-ends-unavailable); this derivation reads the same absence the same way, contributing nothing rather than guessing.
Available for a case version in either state, draft or released: a curator composing a draft wants the same read a diagnose will one day be held to, and only the diagnose itself, never this read, refuses a draft (only-a-released-case-version-is-diagnosed).
