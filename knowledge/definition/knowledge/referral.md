---
title: Referral
summary: The action somebody takes and the role that takes it.
ddd: value-object
aggregate: cases
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: action
    type: ref
    target: definition/glossary/action
    binding: by-identity
    required: true
  - name: recipient
    type: ref
    target: definition/glossary/recipient
    binding: by-identity
    required: true
---

## What it is

The referral is the part of an assessment somebody acts on, which is why it may not be seen before the investigation has a record.
Both of its parts come from global vocabularies, so a referral is comparable across every case.

## Rules

A referral names an action and a recipient, both from the glossary.
