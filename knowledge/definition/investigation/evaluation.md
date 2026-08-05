---
title: Evaluation
summary: The verdict on one hypothesis, with what it rested on or why it could not decide.
ddd: value-object
identity:
  - hypothesis
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: hypothesis
    type: ref
    target: definition/knowledge/hypothesis
    binding: by-identity
    required: true
  - name: verdict
    type: enum
    required: true
    values:
      - confirmed
      - refuted
      - inconclusive
  - name: reason
    type: enum
    required: false
    values:
      - no-data
      - judgment-failure
      - deadline-exhausted
  - name: citations
    type: list
    of: definition/investigation/citation
    binding: embedded
    required: false
---

## What it is

Every hypothesis a case declares gets one, and an inconclusive verdict counts while silence does not.
Judging each hypothesis alone gives three things — a small input, no ordering bias between hypotheses, and an error contained to one hypothesis.
Precedence never marks a hypothesis as superseded, so an evaluation keeps the verdict it received even when an earlier hypothesis already won.

## Rules

An evaluation that confirms or refutes cites at least one concept and field.
An evaluation that is inconclusive says which of the three reasons it has, because a technical failure, a queue and an absent fact must never be indistinguishable.
What cannot be deduced from the evidence given is inconclusive and never inferred.
