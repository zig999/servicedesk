---
title: Observation Field
summary: One named part of what the answer to a concept carries, and what a citation points at.
ddd: value-object
identity:
  - name
sources:
  - intake/decisoes-seis-perguntas-2026-08-05.md
attributes:
  - name: name
    type: string
    required: true
---

## What it is

A concept declares which fields its answer carries, and a citation names one of them together with the concept.
The fields are the concept's own rather than a vocabulary closed for the whole system, because what an answer about one fact carries has nothing to do with what an answer about another carries.
This is what a citation is checked against, and checking it needs nothing outside the glossary.

## Rules

A field a citation names must be one the cited concept declares.
