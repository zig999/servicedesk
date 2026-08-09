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
---

## Description

A named observation a hypothesis may collect (the material's "conceito").
It declares which subject types it accepts and its ttl — the strictest freshness tolerance among the cases that use it, in seconds.
Deliberately thin: the shape of the data it names belongs to the producing capability's output schema, never to the concept.

## Responsibility

Publish the name every collection, evidence and citation uses, and the two constraints the glossary must guarantee for it.
