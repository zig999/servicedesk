---
target: frontend
title: Per-row removal control for glossary concepts, gated by a further explicit
  confirmation
summary: Adds a per-row Remove control to the glossary concepts listing that opens
  a no-typing confirmation dialog and issues the DELETE only when the operator confirms.
task: sha256:34c08c5f3038e01514c3e85ee629b50d09f18f494c5d92207595b7e531cfb5b4
files:
- path: src/hooks/use-glossary-concepts.ts
  effect: Adds useRemoveGlossaryConcept(), a useMutation-backed hook whose mutationFn
    issues DELETE /v1/glossary/concepts/:name through apiFetch<void>, returning {remove,
    isRemoving}.
- path: src/routes/concept-removal-confirmation-dialog.tsx
  effect: New component ConceptRemovalConfirmationDialog(concept, onOpenChange, onConfirm)
    — a Dialog controlled by concept !== null, offering Cancel (no handler) and a
    destructive Remove (onClick=onConfirm); no name-typing input.
- path: src/routes/glossary-concepts-panel.tsx
  effect: toConceptRow() now takes onRemove and isRemoveDisabled and renders a destructive
    Remove button beside Edit; ConceptsPanel holds removeTarget state, wires useRemoveGlossaryConcept(),
    and renders ConceptRemovalConfirmationDialog.
criteria:
- criterion: Each row of the concepts listing offers a removal control for that row's
    concept.
  met: true
  how: toConceptRow() renders a per-row Remove button in every row StatusTable renders.
- criterion: Taking a row's removal control asks whether that concept's removal is
    to be performed.
  met: true
  how: The Remove button's onClick sets removeTarget, opening ConceptRemovalConfirmationDialog.
- criterion: Taking a row's removal control issues no DELETE request.
  met: true
  how: The Remove button's onClick only calls setRemoveTarget; no apiFetch call is
    made.
- criterion: Confirming the removal in the further act issues one DELETE request to
    /v1/glossary/concepts/:name carrying that row's concept name.
  met: true
  how: The dialog's destructive button's onClick calls remove(removeTarget.name);
    mutationFn issues DELETE against /v1/glossary/concepts/:name (URI-encoded).
- criterion: Declining the further act issues no DELETE request.
  met: true
  how: Cancel is a bare DialogClose with no onClick handler.
- criterion: After the further act is declined, the concept's row is still listed
    unchanged under the same name.
  met: true
  how: Declining never calls remove() or touches the query cache.
- criterion: The further act does not ask the operator to type the concept's name.
  met: true
  how: ConceptRemovalConfirmationDialog carries no text input.
nodes:
- node: rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
  encoded_at:
  - src/routes/glossary-concepts-panel.tsx
  - src/routes/concept-removal-confirmation-dialog.tsx
  - src/hooks/use-glossary-concepts.ts
  how: The row's Remove control offers the control the rule requires; taking it only
    asks; remove-concept is issued only from the dialog's confirm act; where the operator
    does not so state, the concept stands unchanged — no mutation call is ever made
    on that path.
- node: domain/glossary/concept
  encoded_at:
  - src/hooks/use-glossary-concepts.ts
  - src/routes/glossary-concepts-panel.tsx
  - src/routes/concept-removal-confirmation-dialog.tsx
  how: The removal control and its confirmation are addressed by the concept's own
    identity attribute, name.
inferences:
- inferred: The DELETE request targets /v1/glossary/concepts/:name (method DELETE,
    204 on success).
  from: The task's own ADVISORY note plus the delivered backend route remove-concept.routes.ts.
- inferred: Dismissing the confirmation with no explicit choice is treated as declining.
  from: The task's own UNDERDETERMINED note, resolved by the convention of the reused
    analogue (connector-configuration-apply-confirmation-dialog.tsx).
- inferred: The removal control sits on the concepts listing as a per-row control,
    beside the existing Edit button.
  from: The inventory's evidenced convention that glossary-concepts-panel.tsx already
    renders one row per concept with an inline Edit action.
- inferred: The Remove button is disabled while a removal is already pending.
  from: The same double-dispatch guard pattern used elsewhere in this codebase.
preserved:
- The existing Edit per-row control and its wiring.
- useGlossaryConcepts()'s query key, queryFn and return shape.
- The concepts listing's row identity.
deferred:
- what: Stating the outcome of a submitted remove-concept to the operator.
  why: REMAINDER — belongs to the outcome-disclosure task.
- what: Deciding where the operator stands and whether the listing refreshes after
    success.
  why: REMAINDER — this task stops at issuing the DELETE.
- what: The server-side remove-concept behavior itself.
  why: REMAINDER — belongs to the backend route, already delivered.
run: run/concept-removal-concept-row-removal-control-build
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
A per-row removal control on the glossary concepts listing, gated behind a Cancel/destructive-confirm dialog with no name typing.

## Notes
None.
