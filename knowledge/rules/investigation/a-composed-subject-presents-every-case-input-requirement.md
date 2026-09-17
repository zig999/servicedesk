---
type: policy
statement: Before a diagnose, simulate-case, or simulate-hypothesis call, the interface assembling the subject presents one attribute input per the pinned case version's own case-input-requirements, required and optional alike, each carrying that requirement's own required flag through unchanged; only a required flag, never an attribute's mere presence in this set, gates whether its own input blocks the call from proceeding.
constrains:
  - domain/investigation/subject
  - domain/knowledge/case-input-requirement
  - domain/integration/capability
consistency: eventual
---

## Description

The case-input-requirements read already computes the authoritative set once, for a diagnose's own door refusal (a-diagnosed-subject-covers-its-cases-required-attributes) to hold a subject to; this rule is the same set reaching the person composing that subject in the first place, before either call, so what blocks a diagnose was already visible rather than discovered at the door.
An optional requirement is presented the same as a required one because the case-input-requirements read already names it as something a currently-registered capability asks for — the composer benefits from knowing that without first learning the attribute's name any other way.
This set is the whole of what the interface presents; the composer adds no attribute beyond it, so what identifies the subject is exactly what a currently-registered capability asked for. What the interface does where this set names no requirement at all is `a-composed-subjects-interface-discloses-an-empty-requirement-set`'s own.
Which capabilities are named alongside each input is `a-composed-subjects-input-names-every-capability-that-asks-for-it`'s own.
