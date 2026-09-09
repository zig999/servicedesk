---
type: invariant
statement: A connector configuration draft's configuration declares a method, beside the address, query, headers and body derived from the same operation, and its value is the chosen operation's own HTTP method as the OpenAPI document names it, upper-cased — an operation the document names under get is drafted as method GET.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Method is the one key an-http-connector-configuration-declares-its-call requires that an OpenAPI document states on its own account: the document names each operation under the very verb the call would issue. That is why it is drafted where a-connector-configuration-draft-never-states-a-responsemap-or-a-statusmap leaves its two keys absent — no OpenAPI construct names an evidence-result ending for a status or a field path a response is read by, while the operation's verb is already there to read. A draft that omitted it would leave the operator to retype a fact the document had given, and would leave a-connector-configuration-drafts-method-is-compared-against-what-is-currently-registered comparing an operation's method against a registration on behalf of a draft carrying no method of its own to submit.

Whether that value is ever taken from what is currently registered instead is `a-drafted-method-is-never-taken-from-the-registered-configuration`'s own.

The case is raised because upper-case is the vocabulary the executing connector holds a method to — GET, POST, PUT, PATCH or DELETE — while an OpenAPI 3.x document names its operations under lower-case path-item keys. Drafting the document's spelling verbatim would generate a configuration that issues no call and ends unavailable the moment it were registered and observed, reporting a MalformedHttpConnectorConfigurationError over a method the draft itself had miscased. Only the case is changed: the verb is never substituted, defaulted or dropped.
