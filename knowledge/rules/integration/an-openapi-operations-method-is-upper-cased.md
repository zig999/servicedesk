---
type: invariant
statement: An operation the Configuration Helper lists states its method upper-cased, whatever case the fetched OpenAPI document's own path-item key names it under.
constrains:
  - domain/integration/openapi-operation
---

## Description

a-connector-configuration-draft-states-the-chosen-operations-method already upper-cases the method a chosen operation is drafted under, since the executing connector's own vocabulary — GET, POST, PUT, PATCH, DELETE — is upper-case while an OpenAPI 3.x document names its operations under lower-case path-item keys. Listing the document's own lower-case spelling instead would show an operator a value the draft they choose it into never states, and a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing already carries the chosen entry's method straight to that draft request.
