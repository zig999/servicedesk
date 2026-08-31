---
type: api
direction: published
operations:
  - read-case-input-requirements
---

## Description

The read a curator composing a case version, and the interface assembling a subject before a diagnose, simulate-case, or simulate-hypothesis call, all need: which subject attributes the version's own collection plan reaches, which of those it cannot be diagnosed without, and which currently-registered capabilities ask for each (rules/knowledge/a-case-versions-input-requirements-are-derived).
Answers for a case version in either state, draft included; a draft still under composition is read here the same as a released one, though only a diagnose itself ever refuses one for being a draft.
Names, apart from the attributes themselves, every capability the collection plan resolves whose own input schema does not currently hold a well-formed shape (rules/integration/a-capability-input-schema-holds-a-well-formed-object) — one that answers a concept the plan reaches but currently declares no attribute at all, so an operator can find and re-register it.
