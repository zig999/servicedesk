---
entries:
- field: values
  unstated: The material describes, in prose, why a parameter, a request-body field or a security scheme may be left unresolved -- no capability registered, no matching input schema property, a security scheme the credential mechanism cannot reduce to one value -- but names no closed vocabulary of reason identifiers for a reader or a caller to test against.
  decided: no-capability-registered, no-matching-input-schema-property, security-scheme-not-reducible-to-a-credential.
  why: These are exactly the three distinct causes the connector configuration's own placeholder mechanism (rules/integration/an-http-connector-configuration-declares-its-call, which recognizes only a subject, a requester and a credential placeholder kind) and the material between them name; a closed enumeration is what lets a caller test which of the three applies rather than parse a free-text reason.
---
