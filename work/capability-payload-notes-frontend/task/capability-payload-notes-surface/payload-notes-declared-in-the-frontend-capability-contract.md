---
title: payload_notes declared in the capability read type and the form schema
summary: Add payload_notes as an optional free-text attribute to the Capability read type and to the single
  Zod form schema both capability form hooks resolve against.
rationale: The type and the schema are the one declaration every other layer resolves against, so they
  are cut ahead of their consumers rather than edited inside each consumer's task; the scope stated no
  cut, and this seam is mine.
sources:
- work/capability-payload-notes-frontend/intake/scope.md
objective: The frontend's shared capability declarations carry payload_notes as an optional free-text
  attribute, so a read answer and a form value may each hold it or leave it undeclared.
criteria:
- capabilityFormSchema parses a form value object carrying a payload_notes string and yields that same
  string on the parsed result.
- capabilityFormSchema parses a form value object carrying no payload_notes and reports no validation
  issue for that field.
- capabilityFormSchema reports no validation issue for a payload_notes value that is an empty string.
- The Capability read type declares payload_notes, and a read answer carrying a payload_notes string typechecks
  against it.
- A read answer carrying no payload_notes typechecks against the Capability read type.
implements:
- domain/integration/capability
- rules/integration/a-capability-declares-its-contract
---
## What it is

capability-form-schema.ts holds the single Zod object both use-capability-form and use-capability-detail resolve against, and payload_notes is declared there as the optional scalar precedent timeout already is.
Capability in use-capabilities.ts is the read type the detail view and the listing consume, and it gains payload_notes as an optional string.

## Notes

The attribute's optionality is domain/integration/capability's own, where payload_notes is the one attribute declared with required false.

REMAINDER, from the specification -- rules/integration/a-capability-declares-its-contract's clauses on the required attributes' declaration, the timeout's positive-integer/sixty-second default, and the HTTP 422 IncompleteCapabilityContractError refusal reach no criterion of this task; only the reading of an absent or empty-string attribute as undeclared is answered here, for payload_notes alone. These clauses belong to the capability registration work that decides the timeout default and the positive-integer bound, at the register-capability operation itself.
ADVISORY, from the specification -- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them requires the surface presenting a capability read by identity to state payload_notes exactly as the read answered it; no criterion of this task states anything about a presentation, only the read type's and form schema's declarations that make such a presentation expressible. Left as the seam a sibling task closes.
ADVISORY, from the specification -- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface requires the discard act to return every field, payload_notes included, to the content of the registration the surface last read; no criterion of this task covers the discard, so this stays a neighbouring obligation for the sibling task implementing that act.
