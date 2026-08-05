---
title: Subject
summary: The one thing an investigation is about, named by its type and its identifier.
ddd: value-object
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: type
    type: ref
    target: definition/glossary/subject-type
    binding: by-identity
    required: true
  - name: id
    type: string
    required: true
---

## What it is

The attendant has a customer on the line, and the case says which identifier it needs — resolving the customer into the subject the case requires happens before an investigation starts.
The type travels with the identifier because identifiers of different types collide.

## Rules

The subject's type must be the one the case declares.
