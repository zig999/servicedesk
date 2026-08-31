---
title: Subject composition from the case's own input requirements
summary: The simulate cockpit's Subject region, read and derived and presented from the authoritative
  case-input-requirements read instead of from connector-configuration placeholder text.
rationale: 'One epic rather than one per layer: the scope states a single change to a single region of
  a single screen, and the endpoint read, the subject state and the Subject panel are the two sides of
  one seam whose coverage would otherwise have to reconcile across a boundary the scope never draws.'
sources:
- work/case-simulation-input-requirements/intake/scope.md
covers:
- domain/investigation/subject
- domain/knowledge/case-input-requirement
- domain/integration/capability
- contracts/knowledge/case-input-requirements
- contracts/investigation/case-simulation
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
- rules/investigation/a-composed-subjects-interface-discloses-a-malformed-capability
- rules/investigation/a-simulation-carries-its-requester
- rules/investigation/a-pending-simulation-call-is-not-dispatched-again
- rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
- rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
- rules/investigation/a-subject-carries-at-least-one-attribute
- rules/investigation/a-subject-holds-one-value-per-attribute
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/knowledge/a-case-versions-input-requirements-are-derived
- scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
- scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
- scenarios/investigation/a-malformed-capability-is-disclosed-to-the-composing-curator
- scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
- scenarios/integration/a-legacy-capability-declares-no-input-attributes
uncovered:
- node: contracts/investigation/case-simulation
  why: This plan consumes the already-published simulate-case and simulate-hypothesis operations from
    the frontend's own Subject region; no task here delivers either operation itself.
- node: scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
  why: Its own evidence-recording outcome (a concept's evidence marked unavailable, every other
    concept's collection unaffected) is the backend engine's collection behavior, already delivered;
    only the "the call itself is not refused" half of what it demonstrates is this plan's, and that half
    is covered through the rule itself, not this scenario.
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  why: This rule governs the diagnose's own door refusal, which no task here writes; the screen this scope
    changes dispatches simulate-case and simulate-hypothesis only.
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  why: It demonstrates that same diagnose door, whose refusal and its response no task in this plan produces.
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: The unavailable ending is recorded per capability during collection by the engine, and no task
    here writes collection or an evidence result.
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  why: The derivation itself is the read's own, already implemented and plugged in behind GET /v1/cases/{slug}/versions/{version}/input-requirements
    per the scope; every task here consumes that read rather than deriving requirements.
- node: scenarios/integration/a-legacy-capability-declares-no-input-attributes
  why: It demonstrates how that same backend derivation reads a capability whose stored input schema holds
    no properties object; the frontend tasks here read only what the response already names.
---

## What it is
The whole of the change the scope states: a new read of the case version's own input requirements, the subject state derived from it, the dispatch gate over it, and the Subject region that presents it.
It claims the nodes that decide what the composing interface presents, what it may refuse, what it discloses, and what a subject attribute may be, and it leaves the diagnose door and the collection-time endings to the engine that already holds them.

## Notes
The impact set spans four contexts, and the five uncovered entries are all on the far side of the wire from this screen: they are what makes the requirements read authoritative in the first place, and nothing in this plan writes them.
