---
title: Investigation
summary: One run of one case against one subject, written once and never changed.
ddd: entity
identity:
  - id
rationale: The material also records an investigation's cost in calls and tokens and its duration per stage, and the analysis left both out as measurement of the implementation rather than facts the business decided, while keeping the pins that make a replay possible because the material states reproducibility as a guarantee.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-cinco-perguntas-2026-08-06.md
attributes:
  - name: id
    type: string
    required: true
  - name: requester
    type: string
    required: true
  - name: subject
    type: ref
    target: definition/investigation/subject
    binding: embedded
    required: true
  - name: report
    type: string
    required: true
  - name: case_ref
    type: ref
    target: definition/knowledge/case
    binding: by-identity
    required: true
  - name: judge_model
    type: string
    required: true
  - name: judge_prompt_version
    type: string
    required: true
  - name: evidences
    type: list
    of: definition/investigation/evidence
    binding: embedded
    required: true
  - name: evaluations
    type: list
    of: definition/investigation/evaluation
    binding: embedded
    min_items: 1
    required: true
  - name: assessment
    type: ref
    target: definition/investigation/assessment
    binding: embedded
    required: true
  - name: ticket_ref
    type: string
    required: false
gaps:
  - field: attributes.ticket_ref.required
    why: The second lacuna is open — the material asks whether an investigation is born from a ticket and does not answer, so whether that reference is mandatory is undecided.
---

## What it is

An investigation guards no invariant between changes, because it never changes — what it guards is completeness, checked once when it is built.
It is written once, at the end, so no intermediate state of the domain ever persists.
It pins the case it read by content, the model and the prompt version that judged, and the evidence it saw, because a replay that cannot reach exactly those is not a replay.
Two requests sharing subject, case and ticket inside the window get the same investigation — the concluded one if it finished, and the one in progress otherwise.

## Rules

An investigation carries exactly one evaluation for every hypothesis its case declares.
An investigation records exactly one evidence for every concept its case's hypotheses collect.
The response to the requester leaves only after the investigation is written.
The marker for an investigation in progress lives outside the investigation, so being written once stays true.
