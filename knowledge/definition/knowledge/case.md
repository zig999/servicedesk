---
title: Case
summary: A published diagnostic procedure — its hypotheses in order of precedence, and what to do when none of them confirms.
ddd: value-object
identity:
  - slug
  - version
  - content_hash
aliases:
  - procedure
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/perguntas-2026-08-05.md
  - intake/decisoes-seis-perguntas-2026-08-05.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
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
  - name: version
    type: integer
    min: 1
    required: true
  - name: content_hash
    type: string
    required: true
---

## What it is

A published case is identified by its content rather than by a name, so an investigation that pinned one can always be replayed against exactly what it read.
Its version is what orders those publications and is legible to a person, which is the one thing a digest is not.
It is not a structure something else walks — resolving which hypothesis wins is the case's own behaviour, because the precedence is knowledge the case declares.
Given the evaluations of its hypotheses it answers with the first confirmed one in its declared order, its outcome, its referral, and that hypothesis as the determining one, and with the fallback when none confirmed.
It never marks a hypothesis as superseded, because two hypotheses confirming often is the signal that its own order is wrong.

## Rules

A case declares at least one hypothesis, and it declares two fallbacks for none confirming — one for having reached no data, one for having exhausted its hypotheses — each written out rather than implied.
The content hash covers the bytes of the whole file, the curator prose included, so correcting a sentence of prose publishes a new case and an investigation that pinned the old one keeps pointing at the old one.
The content hash is a SHA-256 written with the algorithm's name inside the value.
Publication counts the version — one greater than the greatest already published for the slug, and 1 where none has been.
The curator notes are for whoever edits the case and never reach any prompt.
Nothing in the notes may change what is collected, and anything that does belongs in the structured part.
