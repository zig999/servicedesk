---
title: Case Under Edit
summary: The same case while a curator is still writing it, before publication turns it into a value identified by its content.
ddd: aggregate-root
aggregate: cases
identity:
  - slug
rationale: The material names two models of the same term, one for authoring and one for consumption, with a translation at publication, and recording them as two definitions is the analysis's reading; the consistency boundary is put around the one being edited because that is the only one that changes, and publication emits the other as an immutable value that leaves the boundary.
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: slug
    type: string
    required: true
gaps:
  - field: attributes.[]
    why: The material states the case under edit is a different model of the same term and does not say how its shape differs from the published case.
---

## What it is

While it is being written a case has identity — it is this case being edited, not a value interchangeable with another.
Publication is the translation, and it is where the contract with the integration context is verified.

## Rules

A case under edit becomes a published case only through publication.
