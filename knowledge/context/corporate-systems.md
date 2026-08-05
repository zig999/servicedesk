---
title: Corporate Systems
summary: The systems of record every capability ultimately reads from, upstream of the normaliser.
rationale: The material draws the corporate systems as one box upstream of the connectors and names four connectors without saying what any one of them supplies, so the analysis records one upstream context rather than one per connector.
sources:
  - intake/arquitetura-troubleshooting-v5.md
relationships:
  - with: integration
    pattern: anti-corruption-layer
    role: upstream
gaps:
  - field: strategic
    why: The material classifies the access to these systems as generic and says nothing about the systems themselves.
---

## What it is

These are the systems every fact an investigation collects ultimately comes from, and the material draws them as one thing upstream of the connectors.
It names four connectors and does not say which capability any one of them answers, so nothing here names a system by what it supplies.
They own their own vocabulary, and none of that vocabulary is allowed past the normaliser, because a technology leak happens in the answer rather than in the call.

## Rules

None.
