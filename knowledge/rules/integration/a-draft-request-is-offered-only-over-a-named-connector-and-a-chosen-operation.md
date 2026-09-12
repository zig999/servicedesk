---
type: invariant
statement: >-
  The Configuration Helper offers the act requesting a connector configuration draft only while
  the surface's Connector field holds a non-empty connector name and an operation stands chosen
  from the fetched document's listing, stating in the act's place, while either is missing, which
  of the two the request waits on.
constrains:
  - domain/integration/connector-configuration
---

## Description

A draft resolves its subject placeholders by the capabilities registered against the connector name, so a request made under an empty name names every parameter unresolved with reason no-capability-registered, a true statement about the wrong cause.
A request made before an operation is chosen names no path and no method, and the only answer it can have is the refusal an-openapi-document-declaring-no-such-operation-refuses-the-draft states for a pairing the operator never chose.
Withholding the act until both stand, and saying which is missing, follows a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed: an act whose outcome is already known on the surface is not offered to fail.
