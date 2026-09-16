---
target: frontend
title: Refused capability schema draft stated to the operator -- proof
summary: Tests capabilitySchemaDraftRefusalDisclosureFrom's four refusal readings and idle/pending suppression at the disclosure-service level, CapabilitySchemaHelperFields' rendering of each reading as a distinct alert never beside a drafted schema, the surface's silence before an answer arrives, and that the shared generic error-state table gained no entry for the three OpenAPI refusal codes.
implementation: sha256:98b7ba48ded9760a00d7f70889ec44b5300776f1f15e3e1b376fef32dd167e31
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-helper-request-and-statement-refusal-stated-to-the-operator-suite
tests:
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftRefusalDisclosureFrom -- an unfetchable-link refusal states its own fixed message (criterion 1) > returns the not-fetched message for an openapi-document-not-fetched outcome
  proves: Criterion 1 -- the disclosure service produces the fixed not-fetched message from an openapi-document-not-fetched outcome.
  fails_when: capabilitySchemaDraftRefusalDisclosureFrom stops returning CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE for that outcome kind.
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftRefusalDisclosureFrom -- an unreadable-document refusal states its own fixed message (criterion 2) > returns the not-readable message for an openapi-document-not-readable outcome
  proves: Criterion 2 -- the disclosure service produces the fixed not-readable message from an openapi-document-not-readable outcome.
  fails_when: capabilitySchemaDraftRefusalDisclosureFrom stops returning CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE for that outcome kind.
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftRefusalDisclosureFrom -- an operation-not-found refusal names the operation's own method and path (criterion 3) > returns a message naming the outcome's own method and path
  proves: Criterion 3 -- the disclosure service's message for an openapi-operation-not-found outcome names that operation's own method and path.
  fails_when: The returned message stops containing the outcome's own method or its own path.
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftRefusalDisclosureFrom -- an unrecognised failure states its own fixed fallback message, reusing none of the three named refusals (criterion 4) > returns the unrecognized-failure message, matching none of the three named conditions
  proves: Criterion 4 -- an outcome naming none of the three conditions resolves to its own fallback message, distinct from the not-fetched and not-readable messages and from the operation-not-found template's own fixed fragment.
  fails_when: The unrecognized-failure message equals either named-condition constant, or contains the operation-not-found template's own fixed wording.
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftRefusalDisclosureFrom -- the four refusal kinds are pairwise distinguishable from one another (criteria 1, 2, 3, 4) > produces four pairwise-distinct messages, one per refusal outcome kind
  proves: Criteria 1-4 collectively, at the disclosure-service boundary -- no two of the four refusal outcome kinds resolve to the same message.
  fails_when: Any two of the four refusal outcome kinds resolve to an identical message string.
- file: src/services/capability-schema-draft-disclosure.spec.ts
  name: capabilitySchemaDraftRefusalDisclosureFrom -- no refusal is produced for a request the operation has not answered (criteria 6, 7) > returns undefined for an idle outcome and for a pending outcome
  proves: Criteria 6 and 7, at the disclosure-service boundary -- an idle or a pending outcome produces no refusal disclosure.
  fails_when: capabilitySchemaDraftRefusalDisclosureFrom returns a defined disclosure for an idle or a pending outcome.
- file: src/services/error-ui-state.spec.ts
  name: the error-code mapping resolves an API error's own code to a user-facing state > resolves OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError to the shared generic-error state rather than a code of their own
  proves: Criterion 8's second clause -- the shared generic error-state table is not extended with the three OpenAPI refusal codes this helper reads.
  fails_when: uiStateForApiError resolves any of the three codes to a kind other than the shared generic-error fallback.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- an unfetchable OpenAPI link's refusal states that no draft was generated, distinctly from the other two named conditions (criterion 1) > renders the not-fetched refusal as an alert stating no draft was generated
  proves: Criterion 1 -- the surface states, as an alert, that no draft was generated and that the fetch condition answered the request.
  fails_when: The rendered alert stops containing either the shared no-draft-generated phrase or the not-fetched condition's own wording.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- an unreadable OpenAPI document's refusal states that no draft was generated, distinctly from the other two named conditions (criterion 2) > renders the not-readable refusal as an alert stating no draft was generated
  proves: Criterion 2 -- the surface states, as an alert, that no draft was generated and that the not-readable condition answered the request.
  fails_when: The rendered alert stops containing either the shared no-draft-generated phrase or the not-readable condition's own wording.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- an operation-not-found refusal states that no draft was generated and names the operation's own method and path, distinctly from the other two named conditions (criterion 3) > renders the operation-not-found refusal as an alert stating no draft was generated and naming the method and path
  proves: Criterion 3 -- the surface states, as an alert, that no draft was generated and names the operation's own method and path.
  fails_when: The rendered alert stops containing the shared no-draft-generated phrase, the outcome's own method, or its own path.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- an answer naming none of the three conditions states an unrecognised failure, reusing none of the three named refusal sentences (criterion 4) > renders a fallback alert stating no draft was generated for a reason the surface does not recognise
  proves: Criterion 4 -- the surface states, as an alert, that no draft was generated for an unrecognised reason, reusing none of the three named conditions' own wording.
  fails_when: The rendered alert stops containing the shared no-draft-generated phrase, or comes to contain any of the three named conditions' own distinguishing wording.
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- each of the four refusal readings is stated apart from the other three, and none of them renders any part of a draft beside it (criterion 5; rule rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator) > renders a pairwise-distinct alert for each of the four refusal outcomes, none of them alongside a drafted input schema, output schema or unresolved-item section
  proves: Criterion 5 and the whole of rule a-refused-schema-draft-states-its-refusal-to-the-operator -- across all four refusal outcome kinds, the surface states the shared no-draft-generated phrase, gives each reading a message no other one repeats, and renders none of them beside the drafted input-schema label, output-schema label or unresolved-items label.
  fails_when: For any of the four refusal outcomes, the alert stops stating the no-draft-generated phrase, two of the four alerts read identically, or any of the four renders alongside the drafted input-schema label, output-schema label or unresolved-items label.
  demonstrates: rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
- file: src/routes/capability-schema-helper-fields.spec.ts
  name: CapabilitySchemaHelperFields -- no refusal is stated while a schema draft request stands unanswered, whether none has been dispatched or one is in flight (criteria 6, 7; rule rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers) > renders no alert for an idle outcome and none for a pending outcome
  proves: Criteria 6 and 7, and the whole of rule no-schema-draft-refusal-is-stated-before-the-operation-answers -- across both states in which the operation has not answered (idle, pending), the surface states none of the four refusal readings.
  fails_when: An alert renders for an idle outcome, or one renders for a pending outcome.
  demonstrates: rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
not_applicable:
- edge_case: capabilitySchemaDraftRefusalDisclosureFrom fed a 'drafted' outcome, or the surface rendering one
  why: No criterion or node this task implements requires that a refusal be suppressed because the answer was drafted -- criterion 5 states only that no schema stands beside a refusal, which is exhaustively covered by testing each of the four refusal kinds. The reverse direction is the sibling rule an-answered-schema-draft-request-states-its-draft-to-the-operator's own concern.
- edge_case: Two draft requests dispatched at once, or a second request overlapping a pending one
  why: No criterion of this task states anything about request concurrency; the dispatch guard is the sibling helper-offered-on-the-authoring-surface task's own hook behavior, unrelated to which reading a refusal states once an answer arrives.
untested:
- The implementation's own inference that the 'openapi-document-not-fetched' and 'unrecognized-failure' messages read as plain, non-parameterised sentences is an inference about behavior that no node or criterion of this task states; either a plain sentence or one carrying further detail would equally satisfy every stated criterion, so this is left unpinned by any test.
- That the four refusal statements are produced only inside capability-schema-draft-disclosure.ts, and not reimplemented independently anywhere the component could read from instead, is an architectural fact (ARC-03, decided by reading) that no test can distinguish from a component that duplicates the same mapping inline with identical output.
---

## What it is

Tests proving the four refusal readings (three named conditions plus an unrecognised failure), each stated apart from the other three and never beside a drafted schema, and that the shared generic error-state table gained no entry for the three OpenAPI refusal codes.

## Notes

None.
