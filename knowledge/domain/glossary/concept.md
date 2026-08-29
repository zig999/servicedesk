---
type: value-object
attributes:
  - name: name
    type: string
    required: true
  - name: accepts
    type: subject-type
    required: true
    many: true
  - name: ttl
    type: integer
    required: true
  - name: description
    type: string
    required: true
---

## Description

A named observation a hypothesis may collect (the material's "conceito").
It declares which subject types it accepts and its ttl — the strictest freshness tolerance among the cases that use it, in seconds.
Deliberately thin on shape — the shape of the data it names belongs to the producing capability's output schema, never to the concept — but not on meaning: its description states what the named observation means, which is exactly what a published language owes the speakers who read it.

## Responsibility

Publish the name every collection, evidence and citation uses, and the two constraints the glossary must guarantee for it.
