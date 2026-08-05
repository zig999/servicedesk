---
title: Case publication
summary: A case moves from being edited to being published, and publication is where its contract with the integration context is verified.
subject: definition/knowledge/draft-case
rationale: The material states publication as an act that verifies the contract and distinguishes the case under edit from the published case, and recording that act as a lifecycle is the analysis's reading.
sources:
  - intake/arquitetura-troubleshooting-v5.md
states:
  - draft
  - published
initial: draft
transitions:
  - from: draft
    trigger: publish
    to: published
gaps:
  - field: rejections
    why: The seventh lacuna is open — the material asks who approves a case's publication and does not answer, so the refusals of the publish trigger beyond the contract checks are unknown.
  - field: transitions.published.publish
    why: The material states the index keeps every published version and does not say how a further version begins from a published one.
---

## What it is

Publication is the moment the knowledge context and the integration context negotiate — every concept the case names must have a registered read-only capability, or the case does not publish.
Running that check at publication rather than at execution is deliberate, because otherwise a curator's mistake surfaces during a customer call.

## Rules

A case whose named concept has no registered read-only capability is unpublishable.
A published version is identified by its content and the index keeps all of them, because an investigation that pinned one must stay replayable.
