---
title: Subject identity rework
summary: The subject's shape — a governed type plus its whole set of attribute-values — propagated through observation-source, investigation-factory, the idempotency key and evidence-collection-stage.
rationale: The scope lists these four propagation targets together under one concern; grouping them as one epic follows that grouping, and this epic is the one whose tasks touch the collection/integration side of this plan (observation-source, evidence-collection-stage), which is why the scope's explicit corporate-records-source/guided-diagnosis coverage instruction is answered here rather than under the consolidation or diagnose epics.
sources:
  - intake/scope.md
covers:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/glossary/subject-attribute
  - domain/glossary/subject-type
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - rules/investigation/an-investigation-is-idempotent-within-a-window
  - contracts/investigation/observation-source
  - contracts/integration/concept-observation
  - contracts/investigation/glossary-source
  - scenarios/investigation/a-repeated-request-returns-the-same-investigation
  - scenarios/investigation/no-ticket-reference-never-repeats
  - constraints/the-domain-depends-on-no-infrastructure
  - contracts/integration/corporate-records-source
  - contracts/system/guided-diagnosis
uncovered:
  - node: contracts/integration/corporate-records-source
    why: The real integration with corporate systems behind observation-source's fake adapter; this plan reworks the fake's subject-shape input only and builds no corporate-systems client.
  - node: contracts/system/guided-diagnosis
    why: The system capability the synchronous diagnose flow already substantively realizes, but that neither the investigation-engine nor the case-authoring-mvp plans before this one ever formally claimed in an epic's covers; naming it here closes that gap without building anything new for it.
  - node: scenarios/investigation/a-repeated-request-returns-the-same-investigation
    why: This epic's own tasks build the idempotency key computation alone, never the return/join/start-fresh routing the scenario exercises; every candidate task binding reached this conclusion independently and pointed to epic/diagnose-entry-point's window-dedup task, whose own covers claims and implements this scenario.
  - node: scenarios/investigation/no-ticket-reference-never-repeats
    why: The same split as above — this epic computes the key over the subject's whole attribute-value set, but deciding that no ticket reference means no match at all is the window-dedup task's own objective under epic/diagnose-entry-point, which claims and implements this scenario.
---

## What it is

The domain/investigation/subject rework — a governed type plus a whole set of attribute-values, replacing a bare id — carried into every module that builds, ports or keys off a subject.
The observation-source port and its fake adapter receiving that whole attribute-value set, unfiltered, on every observe-concept call.
investigation-factory assembling and validating a subject against its governing invariants when it builds an investigation.
The idempotency key computed over the subject's whole attribute-value set rather than a bare subject id.
evidence-collection-stage passing the rebuilt subject through to observation-source unchanged in its own per-concept behavior.
Two specification nodes on the collection/integration side — the real corporate-records integration and the guided-diagnosis capability — named here and left explicitly uncovered, per the scope's own instruction.

## Notes

an-investigation-is-idempotent-within-a-window and its two scenarios are also covered by epic/diagnose-entry-point, since the key computation here and the window-dedup decision at the entry point are two separate, independently demonstrable pieces of the same rule.
