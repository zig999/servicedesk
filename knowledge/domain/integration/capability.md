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
---

## Description

One registered read-only observation the system can perform, identified by name and version (the material's "capacidade").
Its output schema, stated in the glossary's vocabulary, bounds every citation over the evidence it produces; its timeout is its own budget inside the collection's global deadline; its connector names the adapter that executes it.
The capability resolves internally whatever derivation its concept needs — an address from a contract, a region from an access — so derivation is never the case's work.

## Responsibility

Declare its contract completely — nature, both schemas, timeout in milliseconds, connector — so the registry can refuse what departs from it.
