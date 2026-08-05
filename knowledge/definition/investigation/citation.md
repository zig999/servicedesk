---
title: Citation
summary: The concept and the field an evaluation rested on.
ddd: value-object
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: concept
    type: ref
    target: definition/glossary/concept
    binding: by-identity
    required: true
  - name: field
    type: string
    required: true
---

## What it is

A citation is what makes traceability checkable rather than promised — the field it names must exist in the output schema of the capability that produced that evidence, and a machine can decide whether it does.
Citations are by name and never by identifier.

## Rules

A cited concept must be one the hypothesis collects, because nothing else was in front of the judgement.
A cited field must exist in the output schema of the capability that produced that evidence.
