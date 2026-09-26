---
title: Concept removal from the glossary's concepts listing
summary: A removal on each concept row of the glossary, gated behind a further explicit
  act, with the outcome the api answered disclosed and the listing left without the
  removed concept.
rationale: The scope names three surfaces and no grouping; each surface is its own
  epic because a surface, its removal route and the refusal its registry names change
  together and apart from the other two.
sources:
- work/delete-gaps-ui/intake/scope.md
covers:
- domain/glossary/concept
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
- rules/glossary/a-registered-concept-is-never-removed
- constraints/a-successful-concept-removal-answers-with-no-content
- rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
uncovered:
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  why: A concept's removal is issued from the concepts listing itself, so nothing
    in this plan reads a concept by name, and the read's refusal belongs to the backend,
    which the scope leaves unchanged.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  why: It fixes the words in the message text the api's response carries, which this
    plan does not change because the scope leaves the backend unchanged.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  why: It binds the language of the message text the api's response carries and nothing
    about how a screen renders it, and the scope leaves the backend unchanged.
---

## What it is
The glossary's concepts panel gains a removal on each concept row, reaching the existing DELETE /v1/glossary/concepts/:name.
The removal is gated behind a further explicit act, its answered outcome is disclosed, and the operator is left on the concepts listing without the removed concept.

## Notes
The concept row already carries an inline Edit action (`toConceptRow` in frontend/app/src/routes/glossary-concepts-panel.tsx), so the removal control here belongs to a row rather than to the screen.
