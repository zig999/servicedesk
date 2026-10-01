---
entries:
- field: statement
  unstated: a-connector-configuration-authoring-surface-offers-a-configuration-helper says an operator names an OpenAPI document link and one of its operations through the helper, but not how the operation is named once the document answers — typed as a path and a method, or chosen from what the document itself declares.
  decided: The operator names an operation by choosing an entry from every operation the fetched document declares, never by typing a path or a method; the chosen entry's own path and method are what the draft request then names. Recorded as a new invariant over domain/integration/connector-configuration, and a new read, domain/integration/openapi-document-operations, exposed through contracts/integration/openapi-document-operations.md.
  why: A pairing typed free-hand can name a path or a method the document never declares, which an-openapi-document-declaring-no-such-operation-refuses-the-draft exists to catch; choosing only from what the document lists leaves that refusal nothing to catch through this route, and it also spares the operator retyping a path and a method the document already states on its own account, the same reasoning a-connector-configuration-draft-states-the-chosen-operations-method already gives the method itself.
---
