---
entries:
- field: statement
  unstated: No node states whether a path a fetched OpenAPI document's paths object declares as a $ref to a reusable path item, rather than as an inline path item, contributes the operations that path item declares to the operations the document declares, or contributes none.
  decided: 'A path declared in the paths object as a $ref is read through to the path item it targets, including one under #/components/pathItems, before the operations under that path are read, so those operations are among the ones the document declares exactly as if the path item stood inline.'
  why: OpenAPI 3.x itself fixes a $ref as the declaration it targets read as though written where the reference sits, so a paths entry read as its literal keys is a reading of a document other than the one the operator named -- the same standing already given a $ref at a parameter, a request-body schema and a security scheme.
---
