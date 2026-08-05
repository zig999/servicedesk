---
title: Subject Type
summary: The kind of thing a case investigates, drawn from a closed vocabulary.
ddd: value-object
identity:
  - name
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: name
    type: string
    required: true
gaps:
  - field: attributes.name.values
    why: The fourth decision is open — the material states this vocabulary is discovered with the first cases and names a contract, a customer, a network device and a region only as illustrations.
---

## What it is

A case declares which kind of thing it investigates, and that declaration is what makes the subject a dimension of the case rather than a fixed choice for the whole system.
A case about a customer without internet investigates a contract, one about a customer not receiving an invoice investigates a customer, and one about a neighbourhood incident investigates a region.
Deriving one subject from another — an address from a contract, a region from an access — is the anticorruption layer's work and never the case's.

## Rules

Every concept a case collects must accept the type of subject that case declares.
