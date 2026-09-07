---
title: Output-schema entry guidance
summary: The text beside the capability output-schema entry, rewritten to state what the system reads out of what is entered there, bounded to the claims the specification already holds and carrying no worked example at all.
rationale: The scope stated the correction as a removal of copy that reproduces two nodes; the blind decision that closed the silence behind it holds that stating the substance at the entry is owed, and that the worked example is what made the screen a second home — so the task is a rewrite bounded to the claims the specification holds, not a deletion.
sources:
- intake/scope-review-corrections.md
objective: The capability output-schema entry states, at that entry, what the system reads out of what is entered there, and states nothing beyond the claims the specification already holds.
criteria:
- Text stating what the system reads out of an entered output schema renders wherever the capability output-schema entry stands.
- That text states that what is entered is JSON.
- That text states that the field names read from the entered schema are the keys of its own top-level `properties` object.
- That text states that such a key's own declared `type` and `description`, where the entered schema states them, are read as that field's declared semantics.
- That text states that nothing else in the entered schema is read or validated.
- That text states that a `description` entered there states what its value means and names no decision.
- That text carries no worked example, whether composed for the surface or reproduced from anywhere else.
- That text states no further claim about what an entered output schema is read for.
- That text promises no check beyond the ones `rules/integration/a-capability-declares-its-contract` and `rules/integration/a-capability-declares-well-formed-schemas` state a submitted registration is checked for.
- The surface refuses no entry and checks no entered content on any of the grounds that text states.
implements:
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
- domain/investigation/field-semantics
- rules/glossary/a-description-states-meaning-never-policy
---

## What it is
The one prose paragraph under the output-schema field of the capability form, today reproducing two nodes' substance together with the node's own worked example.
Rewritten to state the five claims the specification holds about what is read out of an entered schema, and to carry no worked example at all.

## Notes
Decision, beyond the covers — this task stands as cut, and the epic's claim is not grown to hold `domain/glossary/concept`: the note below names it only to say which half of `rules/glossary/a-description-states-meaning-never-policy` this task does not reach, and no criterion here delivers anything against it.

UNDERDETERMINED, from the specification — criterion 9 was written as "promises no check that the registry does not perform" and bound the text wider than the node does.
`rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it` bounds it to the checks `a-capability-declares-its-contract` and `a-capability-declares-well-formed-schemas` state, leaving what a registration is refused for to those two alone, so a check the registry does perform but neither of them states — the refusal `rules/integration/a-capability-is-read-only` states — would pass the criterion as first written and the rule refuses it.
The criterion was narrowed to the node's own bound after the bind that decided this task's `implements`, and it was not rebound: the narrowing names no node the bind did not already weigh and can only tighten what the text may claim.

ADVISORY, from the specification — the two nodes `rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it` names as the sole home of what a registration is refused for are not among this task's candidates, so the boundary criteria 9 and 10 are written against cannot be read from this task's node set.
Either the epic's claim grows to hold them or the boundary is checked at review from nodes this task may not name; it is recorded rather than resolved, because growing the claim over two nodes no task implements would owe an `uncovered` declaration for each and buy nothing the review does not already reach.

ADVISORY, from the specification — `domain/investigation/field-semantics` is named because criteria 3, 4 and 5 state its content: one field per key of the schema's own top-level `properties` object, that key's own `type` and `description` as the field's declared semantics, and nothing else read or validated.
Its Responsibility, carrying that field snapshotted onto the evidence item that names it, is reached by no criterion of this task, which states those facts to the operator at the entry and carries no schema content anywhere.

ADVISORY, from the specification — `rules/integration/a-capability-is-read-only` states a registry refusal over a capability's nature and `rules/integration/a-submitted-registration-states-its-outcome-to-the-operator` states what a surface tells the operator after a submission the registry answered; the output-schema rule's Description cites the latter only as precedent for refusing a silence at a surface.
Neither governs this objective or any criterion here, and both are named by this epic's nature-refusal task.

REMAINDER, from the specification — `rules/glossary/a-description-states-meaning-never-policy` states its rule of a concept's or a field's declared description, and criterion 6 reaches only the field half, at the capability output-schema entry.
The concept half — what a concept's own declared description states, over `domain/glossary/concept` — belongs to the glossary work governing where a concept's description is authored, not to this task.
