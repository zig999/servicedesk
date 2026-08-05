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
  - name: no_hypothesis_confirmed
    type: ref
    target: definition/knowledge/resolution
    binding: embedded
    required: true
  - name: curator_notes
    type: string
    required: false
  - name: version
    type: string
    required: true
  - name: content_hash
    type: string
    required: true
---

## What it is

A published case is identified by its content rather than by a name, so an investigation that pinned one can always be replayed against exactly what it read.
It is not a structure something else walks — resolving which hypothesis wins is the case's own behaviour, because the precedence is knowledge the case declares.
Given the evaluations of its hypotheses it answers with the first confirmed one in its declared order, its outcome, its referral, and that hypothesis as the determining one, and with the fallback when none confirmed.
It never marks a hypothesis as superseded, because two hypotheses confirming often is the signal that its own order is wrong.

## Rules

A case declares at least one hypothesis, and the fallback for none confirming is written out rather than implied.
The curator notes are for whoever edits the case and never reach any prompt.
Nothing in the notes may change what is collected, and anything that does belongs in the structured part.
