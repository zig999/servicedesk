---
title: State a refused operations read to the operator
summary: A disclosure for the operations read's outcome, mirroring connector-configuration-draft-disclosure.ts, rendered in the helper's existing alert shape.
objective: A Configuration Helper whose operations read was refused states to the operator that no operations were read and which of the answer's two named conditions refused it.
criteria:
  - An unfetchable-link outcome is stated as a message naming that the link named in the helper could not be fetched.
  - That message names which of network-failure, timeout or status-outside-2xx the answer carried, and names the answered status where it carried status-outside-2xx.
  - An unreadable-document outcome is stated as a message naming that the fetched document could not be read as an OpenAPI 3.x document.
  - The unfetchable-link message and the unreadable-document message are different messages, and neither is stated for the other's outcome.
  - An outcome naming neither of those two conditions is stated as neither of them.
  - While the operations read has not answered, no refusal of it is stated.
  - The refusal is rendered inside the helper's aria-live container, in an element carrying role=alert and the same text-sm text-destructive classes the draft's refusal already uses.
  - Every message connector-configuration-draft-disclosure.ts states for a draft outcome is unchanged by this task.
depends_on:
  - task/connector-configuration-helper-operation-listing/helper-operation-choice-state
implements:
  - rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator
  - rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers
  - rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
sources:
  - work/connector-configuration-helper-operation-listing-frontend/intake/scope.md
---

## What it is

A pure function over the operations read's outcome returns either nothing to state or one refusal message, exactly as disclosureStateForOutcome does for the draft.
The helper's fields call it once and render its refusal branch beside the draft's own, so an operator sees which of the two reads was refused.
The draft's disclosure module is reused as the pattern, not edited into a second responsibility.

## Notes

The two conditions this states are the same two error values the draft's own refusals report, so the fetch-failure wording already in the draft disclosure is the wording to follow.
No unstated note survives this pass: rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator now states the operator-facing disclosure criteria 1-5 describe, and rules/integration/no-operations-read-refusal-is-stated-before-the-operation-answers states criterion 6; the decision log records both, located on those two files' statement fields.
UNDERDETERMINED, from the specification — criterion 5 carries only the negative half of the unrecognised-refusal clause of rules/integration/a-refused-operations-read-states-its-refusal-to-the-operator. That rule requires the surface to state, for an answer naming neither condition, that no operations were listed and that the read failed for a reason it does not recognise; criterion 5 requires only that such an outcome "is stated as neither of them", which a helper rendering nothing at all for that outcome would also satisfy.
UNDERDETERMINED, from the specification — the clause of the same rule that the surface "states to that operator that no operations were listed" reaches no criterion; criteria 1-4 require only that the condition be named, not that the operator also be told no operations were listed alongside it.
REMAINDER, from the specification — the HTTP-422 clause of rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document reaches no criterion of this task; this task implements only the surface's branch on the two error values that rule states. Belongs to: the task implementing read-openapi-document-operations of contracts/integration/openapi-document-operations in the backend.
REMAINDER, from the specification — the whole statement of rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read (refusal before any parsing, the 60000-millisecond timeout, no operations read from a document never received) reaches no criterion here. Belongs to: the backend task implementing read-openapi-document-operations' fetch stage.
REMAINDER, from the specification — the whole statement of rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read (JSON/YAML parsing, the three-way version naming) reaches no criterion here; criterion 3 states only what a-refused-operations-read-states-its-refusal-to-the-operator asks of the surface. Belongs to: the backend task implementing read-openapi-document-operations' parse and version check.
REMAINDER, from the specification — rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document governs draft-connector-configuration-from-openapi and reaches no criterion of this task; it is the mirror this task's summary names, not a rule this task implements. Belongs to: the already-delivered act implementing that sibling contract's refusals.
Decision, beyond the covers — stand: the note above located that sibling contract only to say where the mirrored rule's own referent already lives, not to claim any part of it here; the contract is already-delivered work this epic does not touch, and no task of this epic implements it.
REMAINDER, from the specification — rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing and rules/integration/an-openapi-operations-method-is-upper-cased reach no criterion of this task, which renders only the refusal branch. Belongs to: the sibling task rendering the Configuration Helper's operations listing and its choice.
REMAINDER, from the specification — rules/integration/a-connector-configuration-authoring-surface-offers-a-configuration-helper's statement locates the surface this rule's expression refers to; this task adds a statement inside a helper that already stands. Belongs to: the already-delivered task offering the Configuration Helper on the connector configuration authoring surface.
ADVISORY, from the specification — constraints/the-openapi-document-is-fetched-by-the-backend binds the frontend module this task edits; it stays satisfied only while the refusal rendered here is read from read-openapi-document-operations' own answer rather than from any fetch the helper makes itself.
ADVISORY, from the specification — criteria 7 and 8 rest on no candidate and need none: both new rules leave which control carries a statement, its wording and its placement to the interface, so the aria-live container, role=alert and text-sm text-destructive classes are form; criterion 8 is a non-regression guard over connector-configuration-draft-disclosure.ts, checked as "unchanged", never re-derived.
ADVISORY, from the specification — no candidate states the answer's own payload for a refused operations read the way a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document states the draft's details; a-refused-operations-read-states-its-refusal-to-the-operator speaks of the sub-kind and the answered status, so this is a seam rather than a gap — the disclosure implemented here depends on the backend task carrying those fields on the OpenApiDocumentNotFetchedError answer.
ADVISORY, from the specification — no candidate scenario exercises a refused operations read reaching the operator; scenarios/integration/a-swagger-2-document-refuses-the-operations-read stops at the answer to the caller, not what the helper states.
