---
title: evidence-collection-stage passes the whole subject through
summary: evidence-collection-stage dispatches every concept's observe-concept call with the investigation's whole subject, unfiltered.
objective: Every observe-concept call evidence-collection-stage makes for a concept in the collection plan carries the investigation's whole subject, with no attribute selected out beforehand.
criteria:
  - Each concept's observe-concept call in a collection run receives the subject's governed type and its whole attribute-value set.
  - No attribute is filtered from the subject before any concept's call is dispatched.
  - Existing per-concept collection results untouched by the shape change — one evidence per concept, current deadline behavior — are unaffected.
depends_on:
  - task/subject-identity-rework/subject-value-object
  - task/subject-identity-rework/observation-source-subject-shape
rationale: evidence-collection-stage is the port's consumer; the one-seam rule keeps it a separate task from the port-and-fake task it depends on, demonstrable once both the subject type and the port signature exist.
implements:
  - domain/investigation/subject
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

evidence-collection-stage's per-concept dispatch, updated to pass the whole rebuilt subject to observation-source.

## Notes

REMAINDER, from the specification — rules/investigation/a-subject-attribute-is-drawn-from-the-glossary is a subject-construction/validation fact; per domain/investigation/subject's own description, the entry point resolves and assembles the attribute-values at request time, and this task only forwards an already-assembled subject unfiltered. Belongs to task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
REMAINDER, from the specification — rules/investigation/a-subject-carries-at-least-one-attribute is likewise a subject-construction invariant, checked when the subject is built, not when evidence-collection-stage dispatches an already-built subject to each concept's call. Belongs to task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject.
REMAINDER, from the specification — rules/investigation/an-investigation-is-idempotent-within-a-window's clauses (window match on subject type/whole attribute-value set/case/ticket reference; completed returns, in-progress joins, neither starts another; no ticket reference never matches) are all repeat-request/key-computation and window-dedup facts, unrelated to evidence-collection-stage's per-call subject payload. Belongs to task/subject-identity-rework/idempotency-key-subject-attributes for key computation and epic/diagnose-entry-point's window-dedup task for the completed/in-progress/neither decision.
UNDERDETERMINED, from the specification — constraints/the-domain-depends-on-no-infrastructure binds evidence-collection-stage as a domain-layer module this task rewrites, but none of the three stated criteria demonstrate import-freedom. Passes: an evidence-collection-stage implementation that passes the whole, unfiltered subject to every observe-concept call, satisfying all three criteria, but imports a framework, driver or provider-client package directly rather than reaching infrastructure only through a port.
