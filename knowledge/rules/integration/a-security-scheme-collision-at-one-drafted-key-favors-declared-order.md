---
type: invariant
statement: >-
  Two parts of one chosen operation occupy one and the same drafted key where both would stand
  at one drafted query key, or at one drafted headers key, the two key names equal byte for
  byte, and, within the drafted headers key Cookie, where both would stand at one cookie name —
  an HTTP basic scheme, an HTTP bearer scheme, and an API key declaring the header Authorization,
  by that exact name, as its own location each occupying the whole value of the drafted headers
  key Authorization and so standing at that one key together wherever more than one of them is
  required: where two of the security schemes required occupy one drafted key that way, only the
  first of them in the order the requirement object in effect names its schemes becomes a
  placeholder and holds that key, and every other one of them is named in the draft's unresolved
  list with reason drafted-key-occupied-by-another-security-scheme, generating no placeholder and
  appearing in no generated_credentials; and where one of the security schemes required and one
  parameter the operation declares occupy one drafted key that way, the scheme's generated
  credential placeholder holds that key, whichever of the two the document declares first, and
  the parameter is named in the draft's unresolved list with that same reason, becoming no
  placeholder and standing at no position of its own in the draft — the brace form
  a-connector-configuration-draft-places-each-part-where-the-call-carries-it otherwise leaves at
  an unresolved parameter's position never standing at a key a security scheme holds.
constrains:
  - domain/integration/connector-configuration-draft
---

## Description

Two schemes can collide on one drafted key because an-http-connector-configuration-declares-its-call fixes headers as one value per key, while a basic scheme, a bearer scheme and an API key located at the header Authorization each claim the whole of that key's value — so no single HTTP call carries two of them, and a document requiring two together declares something no call can satisfy. The draft neither refuses nor drops them in silence: the first scheme the requirement object names holds the key, so the operator keeps a configuration that works for one of them, and every displaced scheme is disclosed by name and by reason, which is what the unresolved list is for. The reason is its own rather than security-scheme-not-reducible-to-a-credential because a displaced basic, bearer or Authorization API key scheme reduces to one credential value perfectly well; reporting it as non-reducible would misstate why it is absent from the configuration. Refusing the whole draft was the alternative and is rejected on the ground a-malformed-or-unsupported-openapi-document-refuses-the-draft already fixes: the draft's refusals are an unfetchable link and an unreadable or unsupported document, and this is neither — it is exactly the kind of gap the reviewing operator closes by hand, with the drafted address, query, headers and body still worth reviewing.

Authorization is only the loudest instance of that collision, not a special case of it: an-http-connector-configuration-declares-its-call declares query and headers each as an object of string values, one value per key, so any two parts of one operation sent to one key claim the whole of that same single value, whether the key is Authorization, a second API key scheme's own header, a query key two schemes both name, or a key a scheme and a parameter both name. Two schemes are separated there exactly as the Authorization case already separates them, by the requirement object's own order, which remains the only order either side of that collision has. A scheme colliding with a parameter has no such order to read — a requirement object and a parameters array are two lists nothing in the document relates — so the precedence is stated by what each part is rather than by where it sits, which is the only answer nameable without inventing an order across two lists. The scheme holds the key for two reasons: a document that both requires an API key scheme at a key and declares a parameter of that same name and location is, in the common case, naming one part of the call twice, and the credential placeholder is the honest value for that part; and where the two really are different parts, the credential is the one whose loss costs the entire call — a key holding ${subject:<name>} or the plain brace text where the API expects the credential yields a configuration no call of which is ever authorized, while a key holding the credential yields one an operator completes by hand for the parameter the unresolved item names. That displaced parameter stands at no position rather than at a second key, because the only key it ever had is the one the scheme now holds: this is the single case where the position-keeping a-connector-configuration-draft-places-each-part-where-the-call-carries-it states for an unresolved parameter cannot be honored, and the unresolved item is the whole of the disclosure there. Inside the drafted headers key Cookie the collision is judged per cookie name, because that key's value is a joined list of named segments and that rule already joins every cookie-carried part of one call into it — two cookie-carried parts at two cookie names sit side by side there and collide over nothing.
