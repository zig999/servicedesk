---
title: observation-source receives the whole attribute-value set
summary: The observation-source port and its fake adapter accept a subject's whole attribute-value set on every observe-concept call, unfiltered.
objective: observe-concept, on both the port interface and its fake adapter, takes the canonical Subject and passes its whole attribute-value set through untouched.
criteria:
  - observe-concept's parameter carries the subject's governed type and its whole attribute-value set, not a bare id.
  - No attribute is selected or dropped before the call reaches the port; the whole set the caller supplied is what the port receives.
  - The fake adapter's fixture key is composed from every attribute-value pair, following the existing '::'-joined composite-key convention, rather than from a bare id.
  - Exactly one concrete class implements the port, matching the existing hypothesis-evaluator-modules.spec.ts fitness pattern.
depends_on:
  - task/subject-identity-rework/subject-value-object
rationale: The port-plus-fake pair is one interface artifact and its one implementation, not an interface and a consumer, so it stands as its own task ahead of evidence-collection-stage, which consumes it.
implements:
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - contracts/investigation/observation-source
  - contracts/integration/concept-observation
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

observe-concept's signature and its fake adapter's fixture-key composition, both rebuilt around the subject's whole attribute-value set.

## Notes

observation-source-modules.spec.ts already sweeps every file directly under src/investigation/ for forbidden imports, so no separate fitness-test edit is needed for this rework to stay covered.
REMAINDER, from the specification — rules/investigation/a-subject-attribute-is-drawn-from-the-glossary's statement reaches none of this task's criteria: observe-concept and its fake adapter only pass the whole attribute-value set through untouched, performing no glossary lookup or validation. Belongs to task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
REMAINDER, from the specification — rules/investigation/a-subject-carries-at-least-one-attribute's statement reaches none of this task's criteria: the port and its fake adapter are required to pass the whole set through unfiltered, never to select, drop, or count-check attributes before the call. Belongs to task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
REMAINDER, from the specification — rules/investigation/an-investigation-is-idempotent-within-a-window and its two scenarios (a-repeated-request-returns-the-same-investigation, no-ticket-reference-never-repeats) constrain the repeat-request key, not observe-concept's parameter or the fake adapter's fixture key. Belongs to task/subject-identity-rework/idempotency-key-subject-attributes for the key-computation piece and epic/diagnose-entry-point's window-dedup task for the return/join/start-fresh piece.
