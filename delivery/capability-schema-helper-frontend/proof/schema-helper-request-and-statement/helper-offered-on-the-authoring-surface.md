---
target: frontend
title: Schema Helper offer proven on the capability authoring surface
summary: Tests establish that CapabilitySchemaHelperFields and useCapabilitySchemaHelper together place the helper inline beneath the two schema fields on both capability screens, source and render only the document's own listed operations with no free-hand entry, gate the draft-request act on a chosen operation while stating that it waits otherwise, compose and dispatch the draft request from the chosen operation alone, forward its outcome unchanged, touch no OpenAPI document URL directly, and issue no register-capability call.
implementation: sha256:7aa8616a51dbb7b7f6a847b38c2cd084c043f116bd922724606982eabef41036
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-helper-request-and-statement-helper-offered-on-the-authoring-surface-suite-2
tests:
- file: src/hooks/use-capability-schema-helper.spec.ts
  name: useCapabilitySchemaHelper -- lists the operations the shared hook's own read answers for the link, touching no other operations route
  proves: Criterion 3 -- the helper takes an OpenAPI document link and lists that document's own declared operations, read through the existing use-openapi-document-operations hook rather than a second operations reader.
  fails_when: hook.operations stops mirroring exactly what the mocked read-openapi-document-operations route answers for the named link, or a second/different route is hit while sourcing that list.
- file: src/hooks/use-capability-schema-helper.spec.ts
  name: useCapabilitySchemaHelper -- never issues a request whose URL is the operator-named link itself, once that link is named
  proves: 'constraints/the-openapi-document-is-fetched-by-the-backend, as it applies to this task''s own file: the document is fetched by the backend read, never directly by this hook.'
  fails_when: any fetch call this hook issues targets the operator-supplied link URL directly instead of only the backend's own operations-read route.
  demonstrates: constraints/the-openapi-document-is-fetched-by-the-backend
- file: src/hooks/use-capability-schema-helper.spec.ts
  name: useCapabilitySchemaHelper -- issues no network request when onRequestDraft is called with no chosen operation
  proves: Criterion 6 -- where no operation stands chosen, no draft request is dispatched by any act the helper offers.
  fails_when: calling onRequestDraft while chosenOperation is undefined issues any network request or changes outcome away from idle.
- file: src/hooks/use-capability-schema-helper.spec.ts
  name: useCapabilitySchemaHelper -- sends exactly {link, path, method} from the chosen operation, and exposes the drafted outcome once it resolves
  proves: Criterion 7 -- where an operation stands chosen, the act requesting a capability schema draft is offered, and its request is generated from that chosen operation; forwards the depended-on client's outcome unchanged.
  fails_when: the POST body sent to /v1/draft-capability-schema-from-openapi omits or alters the chosen operation's own link/path/method, or the hook's outcome diverges from what the underlying draft mutation answered.
  demonstrates: contracts/integration/capability-schema-draft
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- opens onto exactly one option per entry in state.operations, both entries represented
  proves: Criterion 3 (rendering half) -- the surface lists exactly the document's declared operations the state carries, none dropped and none invented.
  fails_when: the operation Select renders a different count of options than state.operations, or omits an entry the state lists.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- invokes onChooseOperation once with the exact chosen entry, not a distractor sharing the same path
  proves: Criterion 4 -- an operation is named only by choosing one of the listed operations.
  fails_when: choosing an option calls onChooseOperation with the wrong entry, more than once, or not at all.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- renders no textbox whose accessible name refers to a path
  proves: Criterion 4 -- the helper offers no free-hand entry of a path.
  fails_when: a textbox whose accessible name mentions a path is rendered anywhere in the component.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- renders no textbox whose accessible name refers to a method
  proves: Criterion 4 -- the helper offers no free-hand entry of an HTTP method.
  fails_when: a textbox whose accessible name mentions a method is rendered anywhere in the component.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- renders the waiting message and no request button while unchosen, and an enabled request button dispatching onRequestDraft once an operation is chosen
  proves: Criteria 5, 6, 7 -- states in the request act's own place that it waits on a chosen operation while none stands chosen, offers no dispatching act in that state, and offers the enabled draft-request act, wired to the state's own dispatch, once one is chosen.
  fails_when: the waiting message and the request button are both present or both absent in either state, the button renders (or dispatches) while unchosen, or clicking the button while chosen does not call state.onRequestDraft exactly once.
- file: src/routes/capability-form-fields-schema-helper-detail-placement.spec.ts
  name: CapabilityFormFields -- renders the Schema Helper positioned after the Output schema field, with no dialog on the page
  proves: Criterion 2 -- the capability detail screen presents the Schema Helper beneath its Input schema and Output schema fields, on the surface the capability is edited from, never a separate screen or a dialog of its own.
  fails_when: the Schema Helper heading is missing, appears before the Output schema field in document order, or a dialog role is present on the page.
- file: src/routes/capability-form-fields-schema-helper-offer.spec.ts
  name: CapabilityFormFields -- walks from no operation chosen to a dispatched draft request, touching no register-capability call throughout
  proves: 'Criteria 1, 4, 5, 6, 7, 8, end to end on the capability create screen: placement beneath the two schema fields with no dialog present; no free-hand path/method entry; the waiting statement and withheld request act while unchosen; the request act offered and wired once an operation is chosen from the document''s own listing; and no register-capability call at any point.'
  fails_when: the Schema Helper heading appears before the Output schema field or a dialog appears; the waiting message or the withheld request button is wrong while unchosen; a free-hand path/method textbox is rendered; choosing the listed operation does not reveal the request act; clicking it never reaches the draft route; or any PUT call is made to the capability registration route at any point in the flow.
  demonstrates: rules/integration/a-capability-authoring-surface-offers-a-schema-helper
not_applicable:
- edge_case: A second draft request dispatched while one from this helper is already outstanding, or dispatching again the instant an outstanding one ends.
  why: The task's own UNDERDETERMINED note identifies rules/integration/a-pending-schema-draft-request-is-not-dispatched-again as a candidate of a different task; no criterion of this task reaches any clause of that rule's statement, and the note names no implementation for this task to test against.
- edge_case: The document read answering zero operations, or the operations read failing (network failure, unreadable document, unrecognized failure).
  why: No criterion of this task states behavior for these outcomes; the implementation's own record attributes the pending/empty/refused disclosure to a reused module inference, not to a fact this task's criteria decide.
- edge_case: Two operations entries that are exact duplicates (same path and method).
  why: No criterion addresses list-level uniqueness; the surface lists whatever the shared hook answers, unmodified.
- edge_case: An empty or unset OpenAPI document link.
  why: Inherited unchanged from use-openapi-document-operations' own idle behavior; no criterion of this task adds behavior over that state.
- edge_case: The create and detail screens mounted or interacted with concurrently.
  why: No criterion of this task addresses concurrent screens; each screen composes the same shared component and hook independently, with no shared mutable state between mounts.
untested:
- 'UNDERDETERMINED, from the specification -- rules/integration/a-pending-schema-draft-request-is-not-dispatched-again: the task''s own note observes this rule is a candidate of the epic but that no criterion of this task reaches any clause of its statement (withholding a second dispatch while one is outstanding, or dispatching again once one ends). The note names no implementation to test against, so no test is written against it; that a later task must still settle this rule is a finding this proof carries forward rather than one it can close.'
- 'Inference (behavior): the pending/drafted/refused states of the schema-draft mutation itself are not stated to the operator by this task''s files -- only the request button''s disabled-while-pending state reacts to it. This is a fact the specification does not yet hold for this surface; it is not pinned by any test here.'
- 'Inference (behavior): the operations-read refused state''s retry action, wired to the shared hook''s own refetch, is an implementation choice answering the project''s own EDG-01/EDG-02 standard rules rather than a fact any node or criterion of this task states; not tested here.'
- 'Inference (behavior): changing the link does not clear an already-chosen operation. No criterion of this task states this either way, and it is not pinned by any test here.'
---

## What it is

Tests proving the Schema Helper is offered beneath the two schema fields on both capability screens, sources its operation listing from the existing read, offers no free-hand path/method entry, gates the request act on a chosen operation, and issues no register-capability call.

## Notes

The first suite attempt (run/schema-helper-request-and-statement-helper-offered-on-the-authoring-surface-suite) failed at lint on two new test files (`testing-library/no-node-access`, direct DOM traversal instead of a Testing Library method); the test author rewrote both assertions using `compareDocumentPosition` and the suite passed on the second attempt (-suite-2).
