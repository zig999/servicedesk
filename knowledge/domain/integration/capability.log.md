---
entries:
- field: type
  unstated: The material classifies capability as a value object while also registering it, versioning it and referencing it from evidence.
  decided: aggregate-root
  why: Registration is identity plus lifecycle — the domain cares which capability answered — and evidence must reference it across aggregates, which only a root admits.
- field: attributes.version.type
  unstated: The material shows a capability version without a format.
  decided: string
  why: Versions of an integration contract follow the provider's scheme, which the material does not constrain.
- field: attributes.input_schema.type
  unstated: The material says a capability declares schemas without saying how a schema is held.
  decided: string
  why: A schema is carried as its serialized declaration; what reads it is the citation check, not the domain record.
- field: attributes.output_schema.type
  unstated: Same as input_schema.
  decided: string
  why: Same as input_schema.
- field: attributes.timeout.type
  unstated: The material demands a timeout per capability without a unit.
  decided: integer
  why: Milliseconds, consistent with durations, since capability budgets are fractions of the collection stage.
- field: attributes.connector.type
  unstated: The context map draws connectors beside capabilities without ever linking one to the other.
  decided: string
  why: A capability must say which adapter executes it or the registration cannot be run; the name is configuration, so an opaque string keeps vendors out of the model.
- field: attributes
  unstated: rules/integration/one-capability-answers-one-concept states that each concept resolves to exactly one capability, and domain/integration/capability-registry's own resolve-concept operation looks a capability up by the concept it answers, but no attribute of the capability itself ever named which concept that is — the element's own Description already spoke of "its concept" in prose, an operative fact with nowhere to be held.
  decided: A capability declares concept, a required reference to domain/glossary/concept.
  why: The lookup resolve-concept performs and the one-to-one invariant one-capability-answers-one-concept states both presuppose a fact readable off the capability itself; leaving it unstated left a column no attribute would declare, which constraints/the-stored-schema-mirrors-the-declared-model refuses, and left an operative claim living only in the element's own Description, which SPEC-001 R7 refuses. The reference is singular, not many, since the existing resolution reads one capability as answering one concept.
---
