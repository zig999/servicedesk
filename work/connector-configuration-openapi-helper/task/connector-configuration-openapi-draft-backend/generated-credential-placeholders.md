---
title: Generate a credential placeholder for a reducible security scheme
summary: An API key (header, query or cookie), HTTP basic or HTTP bearer scheme becomes one ${credential:<name>} placeholder at its own position under the stated composed name and is disclosed in generated_credentials; any scheme not reducible to one credential value, and any scheme that would collide with another on the same drafted key, is named unresolved instead.
rationale: The scope names credential-placeholder generation as its own concern; it is a separate task from subject resolution because it reads the operation's security schemes rather than a capability, and because the name composition is a rule of its own that would change independently.
sources:
  - intake/scope.md
depends_on:
  - task/connector-configuration-openapi-draft-backend/draft-domain-shape
  - task/connector-configuration-openapi-draft-backend/openapi-3x-operation-reading
objective: Every security scheme required by the first requirement object of the security field in effect for the chosen operation reaches exactly one outcome -- one ${credential:<name>} placeholder at its own position disclosed in generated_credentials, or an unresolved item with reason security-scheme-not-reducible-to-a-credential or drafted-key-occupied-by-another-security-scheme.
criteria:
  - An API key scheme carried in a header becomes a ${credential:<name>} placeholder at a drafted headers key named by that header -- an API key in header X-Api-Key places that placeholder under the headers key X-Api-Key.
  - An API key scheme carried in a query parameter becomes a ${credential:<name>} placeholder at a drafted query key named by that parameter.
  - An API key scheme carried in a cookie becomes a ${credential:<name>} placeholder inside the value of the drafted headers key Cookie, as that cookie's own name, an equals sign and the placeholder, joined by "; " to any other cookie-carried part of the same call.
  - An HTTP basic scheme becomes exactly one ${credential:<name>} placeholder, drafted as the whole value of the headers key Authorization, prefixed by the literal text "Basic ", unless that key is already claimed per the collision criterion below.
  - An HTTP bearer scheme becomes exactly one ${credential:<name>} placeholder, drafted as the whole value of the headers key Authorization, prefixed by the literal text "Bearer ", unless that key is already claimed per the collision criterion below.
  - Where more than one required scheme would occupy the whole value of the drafted headers key Authorization (an HTTP basic scheme, an HTTP bearer scheme, or an API key declaring header Authorization as its own location), only the first of them in the order the requirement object names its schemes becomes a placeholder and holds that key; every other one is named unresolved with reason drafted-key-occupied-by-another-security-scheme, generating no placeholder and no generated_credentials entry.
  - The generated name is the connector's own name and the scheme's own name, each with every character outside A-Z0-9 replaced by an underscore, joined by an underscore, and upper-cased -- connector erp-http with scheme apiKeyHeader generates ERP_HTTP_APIKEYHEADER.
  - Every generated name is disclosed in the draft's generated_credentials paired with the security scheme's own name from the document.
  - No credential value read from environment configuration appears anywhere in the generated placeholder or in generated_credentials.
  - Any security scheme not reducible to one credential value -- an OAuth2 scheme and an OpenID Connect scheme among them -- is named unresolved with reason security-scheme-not-reducible-to-a-credential and generates no placeholder.
  - Where the security field in effect for the operation is an empty array, names no scheme, or is declared at neither the operation nor the document's top level, no placeholder is generated and no security scheme is named unresolved.
  - The placeholder text emitted is the existing ${credential:<name>} form, produced through the existing placeholder token vocabulary rather than a second one.
implements:
  - domain/integration/connector-configuration-draft
  - domain/integration/connector-configuration-draft-generated-credential
  - domain/integration/connector-configuration-draft-unresolved-item
  - domain/integration/connector-configuration-draft-unresolved-reason
  - rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme
  - rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  - scenarios/integration/an-api-key-scheme-becomes-a-generated-credential
---

## What it is

The security-scheme half of what a draft can honestly resolve, and the disclosure of every name it generated.
Disclosing a generated name is never resolving it: the value still comes only from environment configuration at resolution time.

## Notes

The inventory records that domain/integration/capability carries no security-scheme field, so the scheme read here comes from the document reading rather than from a registered capability.
Which security field is in effect (operation-level overriding document top-level), which alternative requirement object is read when more than one exists, and the Authorization-key collision rule are all decided in rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme's own statement; this task's criteria transcribe that decision rather than deciding it independently.
REMAINDER, from the specification — the drafted address composition and the parameter/field placement of subject placeholders reach no criterion here. Belongs to the task assembling the draft's configuration text and to the subject-placeholder-resolution task respectively.
ADVISORY, from the specification — the criterion composing the generated name (A-Z0-9 replacement, then join, then upper-case) should be read as: fold case first, then replace whatever is still outside A-Z0-9 — the literal stated order would replace every lower-case letter of "erp-http" before upper-casing, contradicting the worked example ERP_HTTP_APIKEYHEADER that both the rule and this criterion also state. Nothing is blocked since the worked example is unambiguous, but implementers should read the example as authoritative over the literal transform order.
