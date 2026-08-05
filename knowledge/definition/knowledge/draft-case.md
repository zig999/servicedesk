---
title: Case Under Edit
summary: The same case while a curator is still writing it, holding everything the case declares and not yet the version and hash publication assigns.
ddd: aggregate-root
aggregate: cases
identity:
  - slug
rationale: The material names two models of the same term, one for authoring and one for consumption, with a translation at publication, and recording them as two definitions is the analysis's reading; the consistency boundary is put around the one being edited because that is the only one that changes, and publication emits the other as an immutable value that leaves the boundary. The attributes are read from the material's own structure of a case as a curator writes it, together with its statement that the published case is identified by slug, version and hash — so what publication adds is those two and nothing else.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/perguntas-2026-08-05.md
  - intake/decisoes-seis-perguntas-2026-08-05.md
attributes:
  - name: slug
    type: string
    required: true
  - name: title
    type: string
    required: true
  - name: when_to_use
    type: string
    required: true
  - name: subject_type
    type: ref
    target: definition/glossary/subject-type
    binding: by-identity
    required: true
  - name: hypotheses
    type: list
    of: definition/knowledge/hypothesis
    binding: embedded
    min_items: 1
    required: true
  - name: no_data_fallback
    type: ref
    target: definition/knowledge/resolution
    binding: embedded
    required: true
  - name: hypotheses_exhausted_fallback
    type: ref
    target: definition/knowledge/resolution
    binding: embedded
    required: true
  - name: curator_notes
    type: string
    required: false
---

## What it is

While it is being written a case has identity — it is this case being edited, not a value interchangeable with another.
It holds everything a case declares, which is what makes it the thing every publication check reads.
Publication is the translation, and it is where the contract with the integration context is verified.
What publication adds is the version and the content hash that identify the published value; nothing a curator writes carries either.

## Rules

A case under edit becomes a published case only through publication.
A case under edit is what a publication check refuses, because a published case is one that already holds.
It declares both fallbacks for none confirming, and publication adds the version and the hash that identify the value it becomes.
