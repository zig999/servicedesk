---
title: Assessment reviewed
summary: An operator's judgement of an assessment, arriving later and from outside.
ddd: domain-event
ownership: consumed
sources:
  - intake/arquitetura-troubleshooting-v5.md
gaps:
  - field: payload
    why: The material names this event as the operator's feedback and does not state what it carries.
  - field: upstream
    why: The material does not say which context publishes the operator's feedback.
---

## What it is

This is a second event only because it arrives after the investigation and from outside it.
It is what labels an assessment as good or bad, and the material states that it is what makes a regression corpus possible at all.

## Rules

None.
