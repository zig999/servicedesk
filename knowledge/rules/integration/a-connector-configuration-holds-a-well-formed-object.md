---
type: invariant
statement: The registry refuses to register or update a connector configuration whose configuration is not syntactically valid JSON object text — a null value and an array included — with an HTTP 422 response reporting a ConnectorConfigurationNotWellFormedError; a registration whose configuration is entirely absent, or is present but neither a string nor a plain object (a boolean or a number, among others), is refused instead with an HTTP 422 response reporting an IncompleteConnectorConfigurationError; a registration may supply a well-formed configuration as that text or as the object it parses to, and the registry holds and answers it as text either way.
constrains:
  - domain/integration/connector-configuration
---

## Description

The same discipline a-capability-declares-well-formed-schemas holds for a capability's two schemas, held here for the one field a connector configuration carries: a human authoring this text directly can now write something a runtime call would fail on, and the registry is where that gets caught, not the call.
A null value and an array are both syntactically valid JSON, but neither is an object, so both are not well-formed the same way unparsable text is not. An entirely absent configuration is a different failure — there is no syntax to judge at all — and is refused as incomplete instead, the same distinction a-connector-configuration-names-its-connector already draws for the connector name. A present value that is neither a string nor a plain object — a boolean, a number, or anything else the registration's own shape could carry there — is the same kind of failure as absence: there is no text and no object to judge the syntax of, only a value of the wrong shape entirely, so it is incomplete rather than not well-formed too.
