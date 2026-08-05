---
title: Assessment
summary: What the investigation concluded, what to do about it, which hypothesis decided it, and the text written for the recipient.
ddd: value-object
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: resolution
    type: ref
    target: definition/knowledge/resolution
    binding: embedded
    required: true
  - name: determining_hypothesis
    type: ref
    target: definition/knowledge/hypothesis
    binding: by-identity
    required: false
  - name: text
    type: string
    required: true
gaps:
  - field: attributes.text.audience
    why: The fifth lacuna is open — the material does not say what an assessment may expose to the end customer.
---

## What it is

The resolution is the case's, not the assessment's — the assessment carries what the case resolved and adds only the text.
There is a determining hypothesis when one confirmed and none when the fallback applied.
Nothing stops a text from contradicting the outcome except not giving it the material to do so, which is why what the writing receives is narrowed to what its outcome allows.

## Rules

When a hypothesis confirmed, the writing receives the report, that hypothesis, its own evidence, the outcome and the referral.
When none confirmed, the writing receives the report, every hypothesis with its verdict and reason, and the referral, because saying what was ruled out and why is the whole value of that assessment.
The writing never receives the case's curator prose.
