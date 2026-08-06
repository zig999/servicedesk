---
title: Action
summary: What the recipient of a referral does, drawn from a global vocabulary.
ddd: value-object
identity:
  - name
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-cinco-perguntas-2026-08-06.md
attributes:
  - name: name
    type: string
    required: true
gaps:
  - field: attributes.name.values
    why: The fourth decision is open — the material states the actions of the first case must exist before it and does not name them.
---

## What it is

An action says what somebody does when an investigation reaches its outcome, and it is global rather than per case.
A new term enters this vocabulary when what somebody does changes, and never when the reason they do it changes.

## Rules

An action a case names must exist in the glossary.
A term looked up in the glossary is answered as published only where it equals a published name of its kind under exact character comparison.
