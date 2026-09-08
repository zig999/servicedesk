---
title: Resolve subject placeholders against the registered capability
summary: Each parameter and request-body field name either becomes a ${subject:<name>} placeholder at its own position, on byte-for-byte equality with a property every currently-registered capability naming the connector declares in its input schema, or is named unresolved with one of the two capability-side reasons.
rationale: The scope names exact-match subject resolution as its own concern, and I keep it apart from credential generation because the two read different sources -- a capability's input schema against an operation's security schemes -- and would change for different reasons.
sources:
  - intake/scope.md
depends_on:
  - task/connector-configuration-openapi-draft-backend/draft-domain-shape
  - task/connector-configuration-openapi-draft-backend/openapi-3x-operation-reading
objective: Every parameter and request-body field name the chosen operation declares reaches exactly one outcome -- a ${subject:<name>} placeholder at its own position, or an unresolved item naming it with reason no-capability-registered or no-matching-input-schema-property.
criteria:
  - Where no capability is currently registered naming the draft's connector, every parameter and request-body field name is named unresolved with reason no-capability-registered.
  - Where no capability is currently registered naming the draft's connector, no ${subject:...} placeholder is generated at all.
  - Where every capability currently registered for the connector declares an input-schema property whose key equals the name byte-for-byte, ${subject:<name>} is placed at that name's own position (inside the address for a path parameter, a query key for a query parameter, a headers key for a header parameter, inside the Cookie header's value for a cookie parameter, a body key for a top-level request-body field), where at least one capability is currently registered for the connector.
  - Where at least one capability is currently registered for the connector and any one of them declares no input-schema property key equal to the name, the name is named unresolved with reason no-matching-input-schema-property.
  - A name differing from a declared property only by case or by separator -- customerId against a declared customer_id -- is named unresolved with reason no-matching-input-schema-property and generates no placeholder.
  - No name reaches two outcomes -- each parameter and request-body field name is either placed as a placeholder or named exactly once in the unresolved list.
  - The resolution names every capability currently registered for the connector it read, and names none where none is registered.
  - The resolution reads the registered capabilities through the existing capability read and the existing declared-input-schema-shape reader, introducing no second lookup or second schema reader.
  - The placeholder text emitted is the existing ${subject:<name>} form, produced through the existing placeholder token vocabulary rather than a second one.
  - An unresolved parameter or field still stands at its own position, holding its own name in the document's brace form {name}.
implements:
  - rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
  - rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  - domain/integration/capability
  - domain/integration/connector-configuration-draft
  - domain/integration/connector-configuration-draft-unresolved-item
  - domain/integration/connector-configuration-draft-unresolved-reason
  - scenarios/integration/a-mismatched-parameter-name-stays-unresolved
  - scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
---

## What it is

The capability-side half of what a draft can honestly resolve.
It never guesses at a name a capability does not already declare, so a draft built from it cannot introduce an orphaned placeholder.

## Notes

The existing placeholder vocabulary and extractor at src/src/http-connector/connector-request-resolver.ts and the declared-input-schema-shape reader at src/src/capability-registry/capability-input-schema-shape.ts are the reuse points the inventory names as not to duplicate.
Capability registration order is not a precondition here: a draft still generates with every name unresolved.
REMAINDER, from the specification — the drafted address composition (servers array, path joining) reaches no criterion here. Belongs to the task assembling the draft's configuration text.
REMAINDER, from the specification — the generated-credential placement clauses (header/query/cookie API key, Basic/Bearer Authorization) reach no criterion here. Belongs to the task implementing rules/integration/a-connector-configuration-draft-names-a-generated-credential-for-a-reducible-security-scheme.
UNDERDETERMINED, from the specification — no criterion states that two cookie-carried parts of the same call are joined by "; " inside the single Cookie header value (the rule already fixes this); an implementation writing only the last cookie segment, or two separate Cookie-like keys, would satisfy the criteria as written. Implementation: join every cookie-carried segment (parameters and any cookie-carried credential) into one Cookie header value with "; " as the rule states.
ADVISORY, from the specification — criterion 3's "where every capability... declares" should be read with the "at least one capability is currently registered" guard criterion 1 states explicitly, to avoid a vacuously-true reading when no capability is registered; worded in this composed version to include that guard.
ADVISORY, from the specification — the unresolved-reason value security-scheme-not-reducible-to-a-credential and drafted-key-occupied-by-another-security-scheme are reached by the credential-generation task, not here; this node is implemented in part here and in part there.
