---
type: aggregate-root
attributes:
  - name: name
    type: string
    required: true
  - name: version
    type: string
    required: true
  - name: nature
    type: capability-nature
    required: true
  - name: input_schema
    type: string
    required: true
  - name: output_schema
    type: string
    required: true
  - name: timeout
    type: integer
    required: true
  - name: connector
    type: string
    required: true
  - name: concept
    type: domain/glossary/concept
    required: true
  - name: payload_notes
    type: string
    required: false
---

## Description

One registered read-only observation the system can perform, identified by name and version (the material's "capacidade").
It answers exactly one concept, the one the registry resolves it by.
Its input schema, once its own shape is declared, names which subject attributes it uses and which it cannot observe without; its output schema, stated in the glossary's vocabulary, bounds every citation over the evidence it produces; its timeout is its own budget inside the collection's global deadline; its connector names the adapter that executes it.
The capability resolves internally whatever derivation its concept needs — an address from a contract, a region from an access — so derivation is never the case's work.
Its payload notes, where an operator declares them, are that operator's own free-text account of what the observation actually returns beneath the shallow, unvalidated shape its output schema states — an omission the schema carries silently, a default the store applies, which of two overlapping meanings a field actually holds. An operator's own hint, exactly as a schema's own field-level description already is, never enforced and never read by anything that resolves a call or admits a citation.

## Responsibility

Declare its contract completely — nature, both schemas, timeout in milliseconds, connector, the concept it answers — so the registry can refuse what departs from it and resolve by it.
Declare, where the operator supplies them, payload notes carrying what the contract's own required fields do not — an absent declaration is a capability that simply has none, never an incomplete one.
