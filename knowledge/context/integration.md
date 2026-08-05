---
title: Integration
summary: The read-only capabilities that answer a concept, and the normalisation that keeps a corporate system's vocabulary out of the domain.
strategic: generic
sources:
  - intake/arquitetura-troubleshooting-v5.md
relationships:
  - with: investigation
    pattern: open-host-service
    role: upstream
  - with: knowledge
    pattern: customer-supplier
    role: upstream
  - with: corporate-systems
    pattern: anti-corruption-layer
    role: downstream
  - with: glossary
    pattern: open-host-service
    role: downstream
---

## What it is

A capability answers exactly one concept, reads and never writes, and declares the schema of what it returns and the deadline it answers within.
The normaliser between a corporate system and the domain is an anticorruption layer, and it is the only thing keeping a vendor's vocabulary from becoming the domain's.
The registry is where the read-only nature is enforced, so nothing depends on discipline to hold it.

## Rules

A capability whose nature is not read-only is refused by the registry.
An observation reaches the domain in the glossary's vocabulary and never in the vocabulary of the system that produced it.
