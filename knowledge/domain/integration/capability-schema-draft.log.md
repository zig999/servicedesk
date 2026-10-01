---
entries:
- field: attributes
  unstated: The material sketched a draft carrying candidate input_schema and output_schema text and named as open whether one shared draft-request produces both together or two independent ones, but never the element's own shape — whether the two schemas sit on one element as two attributes, on two separate elements, or nested inside a further object — and never whether the element carries any relationship to domain/integration/capability itself.
  decided: One value-object carrying input_schema and output_schema as two independent required string attributes, plus unresolved, and declaring no relationship to capability or to any other aggregate.
  why: Unlike domain/integration/connector-configuration-draft, nothing this draft resolves depends on which capabilities or connector configurations are currently registered — it reads only the OpenAPI document named in the request — so there is nothing here for a relationship to name; and the two schemas are drafted, disclosed and applied independently of one another (see the entry over applying-a-drafted-capability-schema-changes-only-the-local-edit.md), so one element with two attributes reads truer than two elements or a nested shape neither disclosure nor application ever needs to cross.
---
