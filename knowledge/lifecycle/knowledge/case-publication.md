---
title: Case publication
summary: A case moves from being edited to being published, and publication is where its contract with the integration context is verified.
subject: definition/knowledge/draft-case
rationale: The material states publication as an act that verifies the contract and distinguishes the case under edit from the published case, and recording that act as a lifecycle is the analysis's reading.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
states:
  - draft
  - published
initial: draft
transitions:
  - from: draft
    trigger: publish
    to: published
gaps:
  - field: transitions.published.publish
    why: The material states the index keeps every published version and that publication counts the next version for a slug, and it does not say how a slug already published becomes editable again — whether the published case returns to being edited or a further publication acts on it where it stands.
    proposal:
      value: A published case publishes again where it stands — the publish trigger applied to a case already published leads to published, and the version that publication assigns is one greater than the greatest already published for that slug. No trigger returns a published case to being edited, and this lifecycle names none.
      why: >-
        rule/knowledge/publication-counts-the-version already states the arithmetic over a slug that
        has published versions, and its second example — a slug whose greatest published version is
        2 publishing at 3 — is reachable only if a case already published can be published again, so
        the material has decided this transition and recorded it somewhere else. The index keeping
        every published version rather than the last says the same thing from the other side, since
        a later publication adds a value beside the earlier one instead of replacing it, which is
        what makes publishing an already published slug the ordinary act. definition/knowledge/draft-case
        settles why nothing has to be released back to being edited — the version and the hash are
        what publication assigns and nothing a curator writes carries either, so the one file under
        version control never stops being the case under edit and is never occupied by the published
        value. The competing reading needs a trigger that ends a publication, and the material names
        no such act anywhere.
---

## What it is

Publication is the moment the knowledge context and the integration context negotiate — every concept the case names must have a registered read-only capability, or the case does not publish.
Running that check at publication rather than at execution is deliberate, because otherwise a curator's mistake surfaces during a customer call.
Nobody approves the act: the checks are the whole of what refuses the publish trigger, so this lifecycle records no refusal of it.
Where the registry cannot be consulted at all, the case does not publish and what answers is an unavailable check rather than a refusal.

## Rules

A case whose named concept has no registered read-only capability is unpublishable.
A published version is identified by its content and the index keeps all of them, because an investigation that pinned one must stay replayable.
Nothing approves a publication.
A case does not publish while the contract check cannot be decided.
Publication counts the version it assigns.
