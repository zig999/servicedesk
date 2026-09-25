---
title: Concept row removal control behind a further explicit act
summary: A removal control on each concept row that asks for confirmation and issues
  remove-concept only when the operator confirms.
rationale: Cut as its own task because the gate the removal-control rule states can
  be shown met without any outcome disclosed or any landing taken, and the disclosure
  and the landing build on the DELETE this task issues.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: Each concept row in the glossary's concepts listing offers a removal whose
  DELETE request is issued only on a further explicit act by the operator.
criteria:
- Each row of the concepts listing offers a removal control for that row's concept.
- Taking a row's removal control asks whether that concept's removal is to be performed.
- Taking a row's removal control issues no DELETE request.
- Confirming the removal in the further act issues one DELETE request to /v1/glossary/concepts/:name
  carrying that row's concept name.
- Declining the further act issues no DELETE request.
- After the further act is declined, the concept's row is still listed unchanged under
  the same name.
- The further act does not ask the operator to type the concept's name.
implements:
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
- domain/glossary/concept
---


## What it is
A per-row removal control in frontend/app/src/routes/glossary-concepts-panel.tsx, with its mutation in frontend/app/src/hooks/use-glossary-concepts.ts.

## Notes
ADVISORY, from the specification — No node states the HTTP method or path for remove-concept (DELETE /v1/glossary/concepts/:name); the glossary's own publishing api names it only as the operation remove-concept. A decided entry on that api's operations field records that the material named this route while only the operation name was decided, the same precedent the capability and connector-configuration removal-control tasks rest their own route criteria on. Confirm the path against the delivered backend route rather than treat it as specified.
UNDERDETERMINED, from the specification — The rule requires the removal to be issued only where the operator, having asked for it, states in a further explicit act that it is to be performed, and requires the concept to stand unchanged otherwise. The criteria check only explicit confirmation (issues one DELETE) and explicit declining (issues none); they say nothing about a dismissal with no explicit choice (Escape, clicking outside it, closing it) or an auto-confirm after a delay. A reading that would still pass every criterion: A confirmation that treats dismissing the question with no explicit choice as confirmation and issues the DELETE then, or auto-confirms after a countdown; every stated criterion still passes.
ADVISORY, from the specification — Where the control sits is not settled by the rule's own statement, which puts it on "a surface presenting exactly one registered concept ... addressed by its own identity"; no candidate describes such a surface for a concept specifically. The only support for placing the control on a listing row instead is the Description of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing ("the concept's own listing is the surface remove-concept is issued from in the first place"), which is prose rather than a statement, and no decided entry records that reading.
REMAINDER, from the specification — Two clauses of rules/integration/a-submitted-removal-states-its-outcome-to-the-operator reach no criterion here: stating the outcome the api answered (success or the named refusal, apart from every other condition and from an unrecognised one), and stating neither outcome before the api has answered. It belongs to: The task that states a remove-concept's outcome to the operator on the concepts listing, including ConceptInUseError and the reference it names.
REMAINDER, from the specification — The clause of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing sending a successful removal to the concepts listing and never to the removed identity's surface reaches no criterion here; this task stops at issuing the DELETE. It belongs to: The task that decides where the operator stands after a remove-concept succeeds on the concepts listing.
REMAINDER, from the specification — Every clause of rules/glossary/a-registered-concept-is-never-removed reaches no criterion here: registering never removes a concept; removal succeeds unless a capability, an evidence item, a citation or a hypothesis-revision's collects names it; otherwise the HTTP 409 ConceptInUseError reports its reference (capability-concept, evidence-concept, citation-concept, hypothesis-revision-collects); and a removal takes the concept's accepted subject types with it and removes no subject-type term. This task only issues the removal and does not decide its result. It belongs to: The act of the glossary's remove-concept route itself, on the server side; showing its ConceptInUseError refusal to the operator belongs to the task that states the removal's outcome.
