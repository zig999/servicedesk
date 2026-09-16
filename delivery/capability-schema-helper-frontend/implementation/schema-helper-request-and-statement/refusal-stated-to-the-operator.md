---
target: frontend
title: Refused capability schema draft stated to the operator
summary: Extends the capability schema draft disclosure service with a refusal-specific mapping keyed on the four refusal outcome kinds from useDraftCapabilitySchemaFromOpenApi, and wires CapabilitySchemaHelperFields to render it.
task: sha256:4e1b1f0dd7348efd9230d1593837fc6838534524faa4f338cbfa422c295402e2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/schema-helper-request-and-statement-refusal-stated-to-the-operator-build
files:
- path: src/services/capability-schema-draft-disclosure.ts
  effect: Added CapabilitySchemaDraftRefusalDisclosure and capabilitySchemaDraftRefusalDisclosureFrom(outcome), an exhaustive switch over DraftCapabilitySchemaRequestOutcome['kind'] that returns a { message } disclosure for the three named refusal kinds (openapi-document-not-fetched, openapi-document-not-readable, openapi-operation-not-found) and for unrecognized-failure, and returns undefined for idle, pending and drafted. Left the existing capabilitySchemaDraftDisclosureFrom (drafted-outcome case, delivered by the sibling task) untouched.
- path: src/services/capability-schema-messages.ts
  effect: Added the four refusal message constants/function this helper's disclosure service reads -- CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE, CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE, capabilitySchemaDraftNotGeneratedOperationNotFoundMessage(method, path), and CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE -- each stating 'no draft was generated' plus which condition, mirroring the wording pattern connector-configuration-messages.ts already uses for its own sibling refusals.
- path: src/routes/capability-schema-helper-fields.tsx
  effect: Imported capabilitySchemaDraftRefusalDisclosureFrom, computed refusalDisclosure = capabilitySchemaDraftRefusalDisclosureFrom(state.outcome) once per render, and rendered it (role='alert', inside the component's existing aria-live='polite' region, alongside the operations-read disclosure) only when defined -- i.e. only for the four refusal outcome kinds, never for idle, pending or drafted, and never together with the drafted section (CapabilitySchemaDraftStatement, unchanged) since state.outcome.kind selects exactly one branch.
criteria:
- criterion: Where the answer reports OpenApiDocumentNotFetchedError, the surface states that no draft was generated and states that condition apart from the other two.
  met: true
  how: useDraftCapabilitySchemaFromOpenApi already maps ApiError code OpenApiDocumentNotFetchedError to outcome.kind === 'openapi-document-not-fetched'; capabilitySchemaDraftRefusalDisclosureFrom's own case for that kind returns the dedicated CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE, distinct from the other two named conditions' own messages.
- criterion: Where the answer reports OpenApiDocumentNotReadableError, the surface states that no draft was generated and states that condition apart from the other two.
  met: true
  how: Same mechanism for outcome.kind === 'openapi-document-not-readable', returning CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE.
- criterion: Where the answer reports OpenApiOperationNotFoundError, the surface states that no draft was generated and states that condition apart from the other two.
  met: true
  how: Same mechanism for outcome.kind === 'openapi-operation-not-found', returning capabilitySchemaDraftNotGeneratedOperationNotFoundMessage(outcome.method, outcome.path), interpolating the method and path the outcome itself carries.
- criterion: Where the answer names none of those three conditions, the surface states that the request failed for a reason it does not recognise, and states it neither as one of the three conditions nor as a draft.
  met: true
  how: useDraftCapabilitySchemaFromOpenApi's own refusalKindForError already reduces any ApiError code outside the three named ones (including a generic HTTP 500) to outcome.kind === 'unrecognized-failure'; capabilitySchemaDraftRefusalDisclosureFrom's case for that kind returns CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE, a fourth, distinct message never rendered alongside the drafted section.
- criterion: No input_schema, no output_schema and no unresolved item stands stated beside any of those four statements.
  met: true
  how: state.outcome.kind is a discriminated union; the drafted branch (CapabilitySchemaDraftStatement, which alone renders inputSchema/outputSchema/unresolved) and the four refusal kinds are mutually exclusive values of the same field, so exactly one of the two JSX branches ever renders for a given outcome.
- criterion: While a dispatched request stands unanswered, none of those four statements stands stated.
  met: true
  how: capabilitySchemaDraftRefusalDisclosureFrom returns undefined for outcome.kind === 'pending', so refusalDisclosure is undefined and nothing renders while the mutation is in flight.
- criterion: Where no request has been dispatched, none of those four statements stands stated.
  met: true
  how: capabilitySchemaDraftRefusalDisclosureFrom returns undefined for outcome.kind === 'idle' (the hook's own initial state before requestDraft is ever called), so nothing renders.
- criterion: Each of the four statements is produced from the answer's own error code by this helper's own disclosure service, and the shared generic error-state table is not extended with these codes.
  met: true
  how: All four messages are produced inside capability-schema-draft-disclosure.ts, keyed on the outcome.kind values useDraftCapabilitySchemaFromOpenApi already derives from the ApiError code; frontend/app/src/services/error-ui-state.ts was read and left untouched -- no entry was added to its UI_STATE_BY_ERROR_CODE table.
nodes:
- node: rules/integration/a-refused-schema-draft-states-its-refusal-to-the-operator
  encoded_at:
  - src/services/capability-schema-draft-disclosure.ts
  - src/services/capability-schema-messages.ts
  - src/routes/capability-schema-helper-fields.tsx
  how: The four statements the rule requires (three named conditions plus the unrecognised-failure reading) are each produced and rendered apart from the other three and apart from a draft; input_schema/output_schema/unresolved never stand beside a refusal statement because the two JSX branches are mutually exclusive on state.outcome.kind.
- node: rules/integration/no-schema-draft-refusal-is-stated-before-the-operation-answers
  encoded_at:
  - src/services/capability-schema-draft-disclosure.ts
  how: capabilitySchemaDraftRefusalDisclosureFrom returns undefined for both 'idle' (no request dispatched) and 'pending' (dispatched, unanswered), so no refusal statement is ever produced ahead of the operation's own answer.
inferences:
- inferred: The 'openapi-document-not-fetched' and 'unrecognized-failure' refusal statements read as plain, non-parameterised sentences (no interpolated failure-kind or status detail), unlike the sibling connector-configuration version's fetch-failure message.
  from: DraftCapabilitySchemaRequestOutcome's own type in use-draft-capability-schema-from-openapi.ts -- the refusal-kind branch only spreads DraftCapabilitySchemaFromOpenApiRequest (link, path, method) and carries no OpenApiDocumentFetchFailure-shaped detail, so there is no such detail to interpolate.
- inferred: The refusal statement is placed inside the existing aria-live='polite' region that already announces the operations-read disclosure, rather than a new region of its own.
  from: The inventory's convention 'A refusal is rendered inline, inside an aria-live="polite" region, as role="alert" text', and ACC-07 in the standard, which requires content that updates without navigation to be announced via aria-live.
preserved:
- capabilitySchemaDraftDisclosureFrom and the drafted-outcome rendering path (CapabilitySchemaDraftStatement), delivered by the sibling task, are unchanged.
- frontend/app/src/services/error-ui-state.ts and its UI_STATE_BY_ERROR_CODE table are unchanged, per criterion 8.
- The operations-read disclosure branch (pending/empty/refused) inside the same aria-live region is unchanged in behavior; only a new sibling branch was added ahead of it.
---

## What it is

The four readings an operator may get back when no draft was generated, each stated apart from the other three and apart from a draft, produced by the same disclosure service the sibling task already established.

## Notes

None.
