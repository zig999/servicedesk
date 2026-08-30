---
title: Evidence tab renders the snapshotted concept_description and field semantics
summary: Two new render helpers show each evidence item's snapshotted concept_description and per-field semantics, distinguishing a pre-snapshot record (renders nothing new) from an honestly empty one (renders a stated absence), reading only from the simulation response already in hand.
task: sha256:520f00e96001cfa8860f2f992d49b23633f438f2af07136b2c81968b1f43316d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-evidence-snapshot-evidence-tab-snapshot-rendering-build
files:
- path: src/routes/case-simulation-detail-evidence-tab.tsx
  effect: Two new functions, renderConceptDescription and renderFieldSemantics, render an item's conceptDescription and fields between the resultDetail line and the Observation details block; both distinguish undefined (renders nothing, matching this tab's prior behavior) from a present-but-empty value (renders a stated-absence sentence). Each present field renders its own name, and its type/description only where the snapshot states them.
criteria:
- criterion: An evidence item whose snapshot is present renders its concept_description with the item.
  met: true
  how: renderConceptDescription renders item.conceptDescription as a paragraph beside the item whenever it is a non-empty string.
- criterion: The item renders each snapshotted field's name, and its type and description where the snapshot states them.
  met: true
  how: renderFieldSemantics maps a non-empty fields array to one list item per field, always rendering field.name, and conditionally rendering (type) and — description only when each is present.
- criterion: A field lacking type or description renders without invented values.
  met: true
  how: Both the (type) span and the — description span are gated on field.type !== undefined / field.description !== undefined respectively — neither is ever rendered as a placeholder or empty string for a field that lacks it.
- criterion: An item whose concept_description is empty renders a stated absence of meaning, never invented text.
  met: true
  how: renderConceptDescription renders the literal sentence "No description recorded for this concept." when conceptDescription === "", never the empty string itself or any derived text.
- criterion: An item whose fields snapshot is empty renders a stated absence of field semantics and the tab still renders.
  met: true
  how: renderFieldSemantics renders "No field semantics recorded for this observation." when fields.length === 0; this sits alongside the item's own existing rendering (capability line, Observation details), which is untouched and still renders around it.
- criterion: A legacy response carrying no snapshot fields at all renders the tab as delivered today, without error.
  met: true
  how: Both render functions return null when their own argument is undefined, so an item whose response never carried conceptDescription/fields at all (both undefined, the pre-snapshot wire shape) renders exactly what this tab rendered before this task — no new element, no error.
- criterion: The semantics rendered are read only from the simulation response, with no glossary or capability-registry request issued to enrich them.
  met: true
  how: Both new functions are pure, reading only the conceptDescription/fields values already present on the item prop this component already received; neither this file nor either new function issues a fetch, a hook call, or any other request.
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: The node's own honest-degradation statement for a snapshot value absent because it predates the attribute, versus present-but-empty because the concept or capability itself held none, is the exact distinction renderConceptDescription and renderFieldSemantics draw between undefined and an empty value.
- node: domain/investigation/field-semantics
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: 'renderFieldSemantics renders exactly this node''s own three attributes per field: name always, type and description only where the snapshot states them.'
- node: rules/investigation/presentation-reads-the-evidence-snapshot
  encoded_at:
  - src/routes/case-simulation-detail-evidence-tab.tsx
  how: Both render functions read only the item prop this component already received from the simulation response; neither issues a glossary or capability-registry read to enrich, refresh or substitute for the snapshot, honoring the rule's own no-second-read clause.
- node: contracts/investigation/case-simulation
  how: This task changes no operation of this contract; it renders more of what a completed simulate-case response's own evidence array already carries once the wire-types task widened it.
preserved:
- 'Every existing rendering in this tab: the concept/status-dot/capability/elapsed line, resultDetail, the collapsible Observation block, and the judgment-call summary line — none of their markup or logic changed.'
- The per-collected-concept filtering (collects.map(...).filter(...)) and its own skip-rather-than-phantom-row behavior for a concept with no matching evidence entry.
---

## What it is
The curator-facing rendering of the pinned semantics, sitting next to the tab's existing degradation precedent of skipping rather than inventing.

## Notes
ADVISORY, from the specification — rules/investigation/judgment-reads-the-evidence-snapshot and scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone read closely against this task's wording but govern a different consumer, a hypothesis's judgment and its prompt, not this operator-facing surface; neither is named in implements.
