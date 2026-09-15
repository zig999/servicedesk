---
title: The Schema Helper offered beneath the two schema fields
summary: The helper panel placed beneath the Input schema and Output schema fields of the shared capability authoring form, taking a link, listing the fetched document's own operations, and offering the draft request only over a chosen one.
rationale: I cut the panel and its placement apart from the statements it later carries because placing a control on a form shared by two screens is one decision with one way to be wrong, and because the offer rule is falsifiable with no answer from the operation at all.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/capability-schema-helper-frontend/intake/scope.md
objective: An operator authoring or editing a capability is offered, on that same surface beneath its two schema fields, a Schema Helper that names a document link, chooses one of that document's declared operations, and requests a draft only once an operation stands chosen.
criteria:
- The capability create screen presents the Schema Helper beneath its Input schema and Output schema fields, on the surface the capability is authored from and not on a separate screen or a dialog of its own.
- The capability detail screen presents the Schema Helper beneath its Input schema and Output schema fields, on the surface the capability is edited from and not on a separate screen or a dialog of its own.
- The helper takes an OpenAPI document link from the operator and lists that document's own declared operations, read through the existing use-openapi-document-operations hook rather than through a second operations reader.
- The helper offers no free-hand entry of a path and no free-hand entry of an HTTP method; an operation is named only by choosing one of the listed operations.
- Where no operation stands chosen, the helper states in the request act's own place that it waits on a chosen operation.
- Where no operation stands chosen, no draft request is dispatched by any act the helper offers.
- Where an operation stands chosen, the act requesting a capability schema draft is offered.
- Requesting a draft issues no register-capability call, and the capability registry stands exactly as it stood.
depends_on:
- task/schema-helper-request-and-statement/draft-request-outcome
reference:
- frontend/app/src/hooks/use-openapi-document-operations.ts
- frontend/app/src/routes/connector-configuration-helper-fields.tsx
- frontend/app/src/routes/capability-form-fields.tsx
- frontend/app/src/routes/capability-create-screen.tsx
- frontend/app/src/routes/capability-detail-ready-view.tsx
implements:
- rules/integration/a-capability-authoring-surface-offers-a-schema-helper
- constraints/the-openapi-document-is-fetched-by-the-backend
- contracts/integration/capability-schema-draft
---

## What it is

The helper's own local state -- the link, the chosen operation -- and the component that renders it inside CapabilityFormFields, which both capability screens already share.
The operations listing is the existing connector-agnostic hook, reused rather than rebuilt, which is also what keeps the document's fetch on the backend.

## Notes

The inventory records that anything added inside CapabilityFormFields reaches the create screen and the detail screen at once; that is why one placement criterion is written for each rather than one for the component.
UNDERDETERMINED, from the specification -- rules/integration/a-pending-schema-draft-request-is-not-dispatched-again is a candidate of this task's epic, and no criterion of this task reaches any clause of its statement: nothing here withholds dispatch while a request from this helper is outstanding, nor requires the helper to request again the instant an outstanding request ends.
REMAINDER, from the specification -- rules/integration/an-answered-schema-draft-request-states-its-draft-to-the-operator's whole statement is about what the surface states once the operation answers with a draft; no criterion here addresses it.
REMAINDER, from the specification -- rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator's whole statement is about what the surface states once the operation refuses; no criterion here addresses it.
REMAINDER, from the specification -- rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers bounds when a refusal may be stated; this task's nearest criterion (no request dispatched while no operation stands chosen) is backed by the offer rule's own gating clause, not by this one.
ADVISORY, from the specification -- constraints/the-openapi-document-is-fetched-by-the-backend names the listing case as read for the Configuration Helper's own listing by name; this helper's own reuse of that same read rests on the offer rule's own text rather than on the constraint's own wording naming this helper.
