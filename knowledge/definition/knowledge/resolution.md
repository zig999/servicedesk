---
title: Resolution
summary: What an investigation concluded and what somebody should do about it, taken together.
ddd: value-object
aggregate: cases
rationale: The material states an outcome and a referral appear together in every hypothesis and in the fallback and never names the pair, so recording it as one value object is the analysis's reading.
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: outcome
    type: ref
    target: definition/glossary/outcome
    binding: by-identity
    required: true
  - name: referral
    type: ref
    target: definition/knowledge/referral
    binding: embedded
    required: true
---

## What it is

Every hypothesis carries one, and so does the fallback for when nothing confirms.
The fallback is a default hypothesis in disguise and is written out on purpose, because a fallback asserts nothing about the world and should not look like a claim that does.

## Rules

A resolution is declared by the case and never produced during an investigation.
