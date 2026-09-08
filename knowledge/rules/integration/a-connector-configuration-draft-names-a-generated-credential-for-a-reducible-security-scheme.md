---
type: invariant
statement: >-
  The security schemes an operation of a fetched OpenAPI 3.x document requires are the schemes
  named by the first requirement object of the security field in effect for that operation —
  the operation's own security field where it declares one, otherwise the document's top-level
  security field — every scheme that one requirement object names and no scheme of any further
  alternative object the same field declares, and no scheme at all where the field in effect is
  an empty array, where that first object names no scheme, or where no security field is
  declared at either level, the draft then generating no credential placeholder and naming no
  security scheme unresolved. An operation's security scheme reducible to one credential value
  — an API key or an HTTP basic or bearer scheme — becomes a ${credential:<name>} placeholder in
  the draft's configuration, with the generated name naming the connector and that scheme
  together, upper-cased; the generated name is always disclosed in the draft's
  generated_credentials, never presented as a value already resolved. A security scheme not
  reducible to one credential value — OAuth2 and OpenID Connect among them — is named in the
  draft's unresolved list instead, with reason security-scheme-not-reducible-to-a-credential,
  and never becomes a placeholder. Where more than one of the schemes required would occupy the
  whole value of the drafted headers key Authorization — an HTTP basic scheme, an HTTP bearer
  scheme, or an API key declaring the header Authorization, by that exact name, as its own
  location — only the first of them in the order the requirement object in effect names its
  schemes becomes a placeholder and holds that key, and every other one of them is named in the
  draft's unresolved list with reason drafted-key-occupied-by-another-security-scheme,
  generating no placeholder and appearing in no generated_credentials.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The connector configuration's own placeholder mechanism resolves ${credential:<name>} to exactly one value read from environment configuration at resolution time; an API key or a basic or bearer scheme asks for exactly that one value, so each becomes exactly one generated placeholder. A multi-step scheme like OAuth2 or OpenID Connect has no single value to substitute — forcing one into the same placeholder would misstate what the mechanism can do, so such a scheme is disclosed as unresolved instead, the same honesty the sibling rule over subject placeholders already holds a name to.

The generated name is the connector's own name and the security scheme's own name from the OpenAPI document, each with every character outside A-Z0-9 replaced by an underscore, joined by an underscore, the whole upper-cased — connector erp-http and scheme apiKeyHeader generate ERP_HTTP_APIKEYHEADER. Disclosing it is never resolving it: the credential's real value still comes only from environment configuration, exactly as a-diagnostic-response-masks-a-resolved-credential already keeps a resolved credential out of what a diagnostic response shows.

Which security field is in effect, and what an empty array means, is read the way OpenAPI 3.x itself already defines it and not as a preference of this specification's: an operation declaring no security field of its own is governed by the document's top-level field, and an empty array at either level declares that no security is required. Reading either differently would be reading a document other than the one the operator named, the same standing a-connector-configuration-draft-places-each-part-where-the-call-carries-it already gives a path item's parameters and a $ref. The first requirement object is the one read because the objects of a security array are alternative ways to satisfy the same operation — any one of them admits the call — and the first is the only one nameable without a preference the document never states, exactly the reading that same rule already gives the servers array's first entry. Within the object read, every scheme it names is required together rather than alternatively, so all of that object's schemes are read and none of another's. No scheme in effect leaves nothing unresolved: the operation asks for no credential, and naming a security scheme in the unresolved list there would disclose a failure that did not happen.

Two schemes can collide on one drafted key because an-http-connector-configuration-declares-its-call fixes headers as one value per key, while a basic scheme, a bearer scheme and an API key located at the header Authorization each claim the whole of that key's value — so no single HTTP call carries two of them, and a document requiring two together declares something no call can satisfy. The draft neither refuses nor drops them in silence: the first scheme the requirement object names holds the key, so the operator keeps a configuration that works for one of them, and every displaced scheme is disclosed by name and by reason, which is what the unresolved list is for. The reason is its own rather than security-scheme-not-reducible-to-a-credential because a displaced basic, bearer or Authorization API key scheme reduces to one credential value perfectly well; reporting it as non-reducible would misstate why it is absent from the configuration. Refusing the whole draft was the alternative and is rejected on the ground a-malformed-or-unsupported-openapi-document-refuses-the-draft already fixes: the draft's refusals are an unfetchable link and an unreadable or unsupported document, and this is neither — it is exactly the kind of gap the reviewing operator closes by hand, with the drafted address, query, headers and body still worth reviewing.
