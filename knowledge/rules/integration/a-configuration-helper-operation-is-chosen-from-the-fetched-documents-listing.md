---
type: invariant
statement: The Configuration Helper offers, once its named OpenAPI document link is fetched and parses as OpenAPI 3.x, every operation that document declares as one path and one HTTP method pair for the operator to choose from; the operator names one of the document's operations by choosing one of those pairs, never by typing a path or a method, and the draft request the helper then issues names the chosen pair's own path and its own method.
constrains:
  - domain/integration/connector-configuration
---

## Description

a-connector-configuration-authoring-surface-offers-a-configuration-helper already holds that an operator names an OpenAPI document link and one of its operations through the helper; this is how that naming happens once the link answers — from the document's own declared operations, never from a path or a method the operator types free-hand. A pairing typed rather than chosen could name a path or a method the document never declares, which an-openapi-document-declaring-no-such-operation-refuses-the-draft would then have to refuse; choosing from what the document itself lists leaves nothing for that refusal to catch through this route.
