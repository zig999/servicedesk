---
entries:
- field: attributes.declared_as.required
  unstated: The material shows every drafted status beside the description the document declares its response under, without saying what the reading carries where a document omits that description.
  decided: declared_as is not required; a status whose response declares no description carries none.
  why: OpenAPI 3.x requires a description on a response object and documents in the wild omit it, and inventing one would put text the document never stated beside the very status the operator is asked to judge by it.
---
