---
title: Capability payload notes
summary: The whole backend path of the payload_notes attribute, from a capability's
  registration and identity read, through the evidence snapshot taken at collection,
  to the judgment call and the prompt it assembles.
rationale: The scope names one attribute crossing one thread of the backend with no
  branch that could be delivered against a different specification slice, so the plan
  holds one epic and cuts the work into tasks at the seams between the registry, the
  collection snapshot, the evaluator port and the prompt.
sources:
- work/capability-payload-notes/intake/scope.md
covers:
- domain/integration/capability
- domain/investigation/evidence
- domain/investigation/hypothesis-evaluator
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them
- rules/investigation/judgment-reads-the-evidence-snapshot
- rules/investigation/one-evidence-per-collected-concept
- rules/investigation/presentation-reads-the-evidence-snapshot
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
uncovered:
- node: rules/investigation/one-evidence-per-collected-concept
  why: The new attribute changes nothing about how evidence is identified or how many
    items an investigation holds; no task in this plan touches the collection plan
    or the concept-keyed identity of an evidence item.
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  why: This rule states what an operator-facing surface shows of an evidence item's
    snapshot, and it names concept_description and field semantics only; the scope's
    target is the backend and no task here changes what any surface shows of a collected
    item.
---

## What it is

The epic holds every backend change the optional payload_notes attribute of a capability requires, in the five places the attribute has to stand for it to reach a hypothesis's judgment.
It covers the capability's own declaration and persistence, the identity-keyed read that answers it, the snapshot evidence takes of it at collection, the evaluator port that carries that snapshot into the judgment call, and the prompt the production evaluator assembles from it.

## Notes

The presentation rule covered here is answered in this plan only on the backend side, as the answer the identity read carries; the operator-facing surface that renders that answer lives outside the scope's declared target.
The two relations this epic touches are already shipped, so each schema change it needs arrives as its own additive script rather than as an edit to a script already applied.
