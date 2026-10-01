---
entries:
- field: attributes.operations.many
  unstated: Whether a fetched document's operations are answered as one page of a paginated listing — constraints/listings-are-paged.md's own default for a published api's list operation — or as everything the document declares, answered whole.
  decided: Answered whole, as one unpaged read; recorded as the read-openapi-document-operations operation of contracts/integration/openapi-document-operations.md rather than as a list operation.
  why: constraints/listings-are-paged.md pages a persisted collection that can grow without the caller controlling it; a document's operation set is bounded by, and fetched fresh from, the one link the operator themselves named, the same bounded, one-document shape domain/integration/connector-configuration-draft's own unresolved and generated_credentials attributes already take unpaged.
---
