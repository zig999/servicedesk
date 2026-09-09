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
  and never becomes a placeholder. Two parts of one chosen operation occupy one and the same
  drafted key where both would stand at one drafted query key, or at one drafted headers key,
  the two key names equal byte for byte, and, within the drafted headers key Cookie, where both
  would stand at one cookie name — an HTTP basic scheme, an HTTP bearer scheme, and an API key
  declaring the header Authorization, by that exact name, as its own location each occupying
  the whole value of the drafted headers key Authorization and so standing at that one key
  together wherever more than one of them is required. Where two of the security schemes
  required occupy one drafted key that way, only the first of them in the order the requirement
  object in effect names its schemes becomes a placeholder and holds that key, and every other
  one of them is named in the draft's unresolved list with reason
  drafted-key-occupied-by-another-security-scheme, generating no placeholder and appearing in
  no generated_credentials. Where one of the security schemes required and one parameter the
  operation declares occupy one drafted key that way, the scheme's generated credential
  placeholder holds that key, whichever of the two the document declares first, and the
  parameter is named in the draft's unresolved list with that same reason, becoming no
  placeholder and standing at no position of its own in the draft — the brace form
  a-connector-configuration-draft-places-each-part-where-the-call-carries-it otherwise leaves
  at an unresolved parameter's position never standing at a key a security scheme holds.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

The connector configuration's own placeholder mechanism resolves ${credential:<name>} to exactly one value read from environment configuration at resolution time; an API key or a basic or bearer scheme asks for exactly that one value, so each becomes exactly one generated placeholder. A multi-step scheme like OAuth2 or OpenID Connect has no single value to substitute — forcing one into the same placeholder would misstate what the mechanism can do, so such a scheme is disclosed as unresolved instead, the same honesty the sibling rule over subject placeholders already holds a name to.

The generated name is the connector's own name and the security scheme's own name from the OpenAPI document, each with every character outside A-Z0-9 replaced by an underscore, joined by an underscore, the whole upper-cased — connector erp-http and scheme apiKeyHeader generate ERP_HTTP_APIKEYHEADER. Disclosing it is never resolving it: the credential's real value still comes only from environment configuration, exactly as a-diagnostic-response-masks-a-resolved-credential already keeps a resolved credential out of what a diagnostic response shows.

Which security field is in effect, and what an empty array means, is read the way OpenAPI 3.x itself already defines it and not as a preference of this specification's: an operation declaring no security field of its own is governed by the document's top-level field, and an empty array at either level declares that no security is required. Reading either differently would be reading a document other than the one the operator named, the same standing a-connector-configuration-draft-places-each-part-where-the-call-carries-it already gives a path item's parameters and a $ref. The first requirement object is the one read because the objects of a security array are alternative ways to satisfy the same operation — any one of them admits the call — and the first is the only one nameable without a preference the document never states, exactly the reading that same rule already gives the servers array's first entry. Within the object read, every scheme it names is required together rather than alternatively, so all of that object's schemes are read and none of another's. No scheme in effect leaves nothing unresolved: the operation asks for no credential, and naming a security scheme in the unresolved list there would disclose a failure that did not happen.

Two schemes can collide on one drafted key because an-http-connector-configuration-declares-its-call fixes headers as one value per key, while a basic scheme, a bearer scheme and an API key located at the header Authorization each claim the whole of that key's value — so no single HTTP call carries two of them, and a document requiring two together declares something no call can satisfy. The draft neither refuses nor drops them in silence: the first scheme the requirement object names holds the key, so the operator keeps a configuration that works for one of them, and every displaced scheme is disclosed by name and by reason, which is what the unresolved list is for. The reason is its own rather than security-scheme-not-reducible-to-a-credential because a displaced basic, bearer or Authorization API key scheme reduces to one credential value perfectly well; reporting it as non-reducible would misstate why it is absent from the configuration. Refusing the whole draft was the alternative and is rejected on the ground a-malformed-or-unsupported-openapi-document-refuses-the-draft already fixes: the draft's refusals are an unfetchable link and an unreadable or unsupported document, and this is neither — it is exactly the kind of gap the reviewing operator closes by hand, with the drafted address, query, headers and body still worth reviewing.

Authorization is only the loudest instance of that collision, not a special case of it: an-http-connector-configuration-declares-its-call declares query and headers each as an object of string values, one value per key, so any two parts of one operation sent to one key claim the whole of that same single value, whether the key is Authorization, a second API key scheme's own header, a query key two schemes both name, or a key a scheme and a parameter both name. Two schemes are separated there exactly as the Authorization case already separates them, by the requirement object's own order, which remains the only order either side of that collision has. A scheme colliding with a parameter has no such order to read — a requirement object and a parameters array are two lists nothing in the document relates — so the precedence is stated by what each part is rather than by where it sits, which is the only answer nameable without inventing an order across two lists. The scheme holds the key for two reasons. A document that both requires an API key scheme at a key and declares a parameter of that same name and location is, in the common case, naming one part of the call twice, and the credential placeholder is the honest value for that part; and where the two really are different parts, the credential is the one whose loss costs the entire call — a key holding ${subject:<name>} or the plain brace text where the API expects the credential yields a configuration no call of which is ever authorized, while a key holding the credential yields one an operator completes by hand for the parameter the unresolved item names. That displaced parameter stands at no position rather than at a second key, because the only key it ever had is the one the scheme now holds: this is the single case where the position-keeping a-connector-configuration-draft-places-each-part-where-the-call-carries-it states for an unresolved parameter cannot be honored, and the unresolved item is the whole of the disclosure there. Inside the drafted headers key Cookie the collision is judged per cookie name, because that key's value is a joined list of named segments and that rule already joins every cookie-carried part of one call into it — two cookie-carried parts at two cookie names sit side by side there and collide over nothing.
