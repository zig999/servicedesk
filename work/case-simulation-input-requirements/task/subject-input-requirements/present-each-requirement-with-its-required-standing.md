---
title: Present every requirement's input with its required standing
summary: The Subject panel's one input per requirement, required and optional alike, each showing what
  the pinned version asks of it.
rationale: Cut on the panel side of the seam the state change opens, so what the curator sees is reviewed
  apart from what the state derives, and the region component keeps recomputing nothing of its own. Criterion
  4 was reworded after a binder found the original wording (asserting a per-attribute input-schema hint
  as a specification fact, singular and without version) self-contradictory against the specification's
  own settled position that such a hint is presentation guidance, never a domain fact -- the human chose
  to reword rather than drop the hint or reopen that decision.
sources:
- work/case-simulation-input-requirements/intake/scope.md
objective: The Subject panel renders one input per requirement the subject state exposes, each showing
  whether the pinned version requires it.
criteria:
- An input is rendered for every requirement the state exposes, required and optional alike.
- A required requirement's own input is shown as required where it is rendered.
- An optional requirement's own input is rendered without that marking.
- Each requirement's input shows every asking capability's own name, version and connector the state exposes
  for it, and the input-schema text the state already carries for it, where the state carries one.
- A pinned version whose read names no requirement at all renders an explicit empty state rather than
  a bare empty list.
- The panel recomputes no requirement, no required flag and no annotation, reading each from the state
  it is passed.
depends_on:
- task/subject-input-requirements/derive-subject-fields-from-input-requirements
implements:
- rules/investigation/a-composed-subject-presents-every-case-input-requirement
- domain/knowledge/case-input-requirement
- domain/integration/capability
---

## What it is
The Subject region's requirement rows: what used to be a list of placeholder-derived fields becomes the version's own requirements, each labelled with the standing the read gave it.
An optional requirement appears here for the same reason a required one does, because the read already names it as something a registered capability asks for.
Where the read names no requirement at all, the panel states that explicitly -- that the pinned case version's own case-input-requirements name no attribute -- rather than rendering a bare, unexplained empty list.

## Notes
The existing panel takes the hook's whole returned state as one `state` prop, which is the convention this rendering keeps.
UNDERDETERMINED, from the specification -- rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses states a simulate-case or simulate-hypothesis call is never refused for a subject omitting a required attribute-value, and the composed subject's own required marking must not become a client-side gate on either dispatch; a passing implementation must not disable or block the dispatch while a required input is empty.
UNDERDETERMINED, from the specification -- the empty state criterion requires the disclosure to state that the pinned case version's own case-input-requirements name no attribute; a passing implementation must not render a generic, contentless empty-state placeholder that does not say this.
REMAINDER, from the specification -- rules/investigation/a-composed-subject-presents-every-case-input-requirement's opening clause, over the interface assembling the subject "before a diagnose ... call", reaches no criterion of this task, whose criteria are stated over the simulation surface's Subject panel alone.
Belongs: the diagnose entry point's own subject-assembling interface.
Advisory: criterion 4's "input-schema text the state already carries for it" answers to no clause of any candidate Rule's statement -- domain/integration/capability's own input_schema is a specification-held fact, but the per-attribute type/description hint the material originally asked for is deliberately not one; the criterion is read as displaying whatever text the state (from the sibling derivation task) happens to carry, verbatim, never asserting its presence, absence or content as a domain fact a record can be held to.
Advisory: a requirement set left empty by a malformed capability is legible only once this task's empty state and the sibling malformed-capability disclosure both exist; rules/investigation/a-composed-subject-presents-every-case-input-requirement's own Description notes the malformed-capability sibling rule "covers only that one reason, which an empty set does not require".
