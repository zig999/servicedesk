---
type: invariant
statement: >-
  The Configuration Helper offers the act requesting a connector configuration draft only while
  the surface's Connector field holds a connector name that is neither empty nor whitespace
  alone and an operation stands chosen from the fetched document's listing, stating in the act's
  place, while either is missing, which of the two the request waits on.
constrains:
  - domain/integration/connector-configuration
---

## Description

A draft resolves its subject placeholders by the capabilities registered against the connector name, so a request made under an empty name names every parameter unresolved with reason no-capability-registered, a true statement about the wrong cause.
A field holding whitespace alone holds no name and lands in that same wrong cause: nothing is registered under whitespace, so the capabilities looked up under it are none, and the operator who typed a space would be told the connector has no capability rather than that they have named no connector — the reading a-connector-configuration-names-its-connector already gives an empty string, carried to the one content that looks filled on the surface and is not.
A request made before an operation is chosen names no path and no method, and the only answer it can have is the refusal an-openapi-document-declaring-no-such-operation-refuses-the-draft states for a pairing the operator never chose.
Withholding the act until both stand, and saying which is missing, follows a-connector-configuration-surface-offers-no-submission-while-its-content-is-not-well-formed: an act whose outcome is already known on the surface is not offered to fail.
