---
title: Case publication
summary: A case moves from being edited to being published, and publication is where its contract with the integration context is verified.
subject: definition/knowledge/draft-case
rationale: The material states publication as an act that verifies the contract and distinguishes the case under edit from the published case, and recording that act as a lifecycle is the analysis's reading.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
  - intake/ratificacao-tres-decisoes-2026-08-07.md
states:
  - draft
  - published
initial: draft
transitions:
  - from: draft
    trigger: publish
    to: published
  - from: published
    trigger: publish
    to: published
---

## What it is

Publication is the moment the knowledge context and the integration context negotiate — every concept the case names must have a registered read-only capability, or the case does not publish.
Running that check at publication rather than at execution is deliberate, because otherwise a curator's mistake surfaces during a customer call.
Nobody approves the act: the checks are the whole of what refuses the publish trigger, so this lifecycle records no refusal of it.
Where the registry cannot be consulted at all, the case does not publish and what answers is an unavailable check rather than a refusal.
A case already published publishes again where it stands, and nothing returns it to being edited — the version and the hash are what publication assigns, so the one file the curator keeps editing never carries either and never has to be released.

## Rules

A case whose named concept has no registered read-only capability is unpublishable.
A published version is identified by its content and the index keeps all of them, because an investigation that pinned one must stay replayable.
Nothing approves a publication.
A case does not publish while the contract check cannot be decided.
Publication counts the version it assigns.
