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
gaps:
  - field: attributes.version.derivation
    why: The material states a case is one markdown file versioned in git and that the published case is identified by slug, version and hash, and does not say what sets the version — whether it is the git reference, a number the curator raises, or something publication counts.
  - field: attributes.content_hash.derivation
    why: The material states the published case is identified by its content and that an investigation replays against exactly what it read, and does not say what the hash is computed over — the whole file, the structured part alone, or the structured part with the curator prose excluded.
  - field: attributes.no_hypothesis_confirmed.selection
    why: The material requires both outcomes of non-conclusion to exist before the first case, because an investigation confirming nothing still has to say which kind of nothing it reached, while giving the case exactly one fallback resolution and forbidding any outcome produced outside the case — so nothing states which of the two a case's fallback carries, nor what would select between them.
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
