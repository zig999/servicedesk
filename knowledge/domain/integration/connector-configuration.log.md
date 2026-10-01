---
entries:
- field: type
  unstated: The material states a connector configuration's identity (its connector name) and that editing replaces the whole configuration, without stating which DDD construct records it.
  decided: value-object
  why: Editing replaces the whole record rather than modifying part of it — two configurations holding equal attributes are interchangeable — and nothing elsewhere in the specification ever needs to reference a past connector configuration by identity the way a citation pins to a specific capability registration, so no aggregate-root consistency boundary is needed; the same reasoning that already typed domain/glossary/concept a value object.
- field: attributes.configuration.type
  unstated: Whether the configuration attribute is the JSON object text or the object, given the delivered registry holds a parsed object and the delivered read answers text.
  decided: string — the JSON object text.
  why: The material is the reconciliation record siegard-reconcile/connector-capability-corrections-post-closure-drift.md, whose findings report the delivered backend stating this fact while no node held it. The published read answers text and the value object already declared string; what the registry holds internally is representation, and the well-formed-object rule now admits an object on input while holding the answer to text.
---
