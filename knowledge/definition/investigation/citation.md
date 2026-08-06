---
title: Citation
summary: The concept and the field an evaluation rested on.
ddd: value-object
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-cinco-perguntas-2026-08-06.md
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

A citation is what makes traceability checkable rather than promised — the field it names must be one the cited concept declares, and a machine can decide whether it is.
Citations are by name and never by identifier.

## Rules

A cited concept must be one the hypothesis collects, because nothing else was in front of the judgement.
A cited field must be one the cited concept declares.
