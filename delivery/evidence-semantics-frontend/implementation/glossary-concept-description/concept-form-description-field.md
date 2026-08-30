---
title: Concept form authors and validates the description, and its refusal reaches the operator by name
summary: The existing concept create/edit form gains a required description field through create and edit, submits it in the registration body, and its failure path renders the concept-description-required UiErrorState with its own wording while every other failure still falls through to the generic toast.
task: sha256:50d9839d3d091b0afb425d0850a90b88712b16bc6381b111491a16bd134bc4ff
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/glossary-concept-description-concept-form-description-field-build
files:
- path: src/services/concept-form-schema.ts
  effect: conceptFormSchema now also requires description as a non-empty string (domain/glossary/concept's fourth required attribute), ConceptFormValues widened accordingly; header comment discloses the mirroring of registerConceptBodySchema (backend leaves description optional there so GlossaryService.registerConcept can raise its own typed ConceptDescriptionRequiredError) and this form's stricter-than-the-wire requirement, the same reasoning already disclosed there for ttl.
- path: src/hooks/use-concept-form.ts
  effect: defaultValues now seeds description from existing?.description ?? "" so edit mode pre-fills it; the PUT /v1/glossary/concepts/{name} mutation body now carries description; a new SAVE_FAILURE_MESSAGE_BY_KIND table and saveFailureMessage(error) helper resolve a thrown ApiError through uiStateForApiError and render this screen's own wording for the concept-description-required kind, falling back to GENERIC_SAVE_FAILURE_MESSAGE for every other failure; onError now calls saveFailureMessage(error) instead of unconditionally toasting the generic message.
- path: src/routes/concept-form-fields.tsx
  effect: ConceptFormFields renders a fourth FormField, "Description", using @tui/ui/textarea's Textarea, wired through register("description") with the same disabled/aria-invalid/aria-describedby convention every other field in this file already follows, placed after TTL and before the Save button.
criteria:
- criterion: The concept form shows a description field populated with the concept's current description when editing.
  met: true
  how: ConceptFormFields renders a Description Textarea bound to the form's description field; useConceptForm's defaultValues seeds it from existing?.description ?? "" the same way name/accepts/ttl are already seeded.
- criterion: A submitted registration carries the description in the request body.
  met: true
  how: useConceptForm's mutationFn now serializes { accepts, ttl, description } as the PUT /v1/glossary/concepts/{name} request body, description coming from the same react-hook-form state the Description field writes to.
- criterion: conceptFormSchema requires a non-empty description, with the mirroring of the backend DTO disclosed in the module's header comment.
  met: true
  how: 'conceptFormSchema now declares description: z.string().min(1); the module''s header comment discloses that registerConceptBodySchema leaves description optional at the wire and that this form requires it anyway, the same stricter-than-the-wire disclosure already given for ttl.'
- criterion: A 422 ConceptDescriptionRequiredError response renders the screen's own wording for the missing description rather than the generic failure toast.
  met: true
  how: 'error-ui-state.ts resolves ApiError code ConceptDescriptionRequiredError to UiErrorState { kind: "concept-description-required" }. SAVE_FAILURE_MESSAGE_BY_KIND maps that kind to its own wording, and saveFailureMessage(error) — called from the mutation''s onError — resolves any thrown ApiError through uiStateForApiError and returns that specific message instead of the generic one.'
- criterion: A failure no criterion names still falls through to the existing generic toast.
  met: true
  how: saveFailureMessage returns GENERIC_SAVE_FAILURE_MESSAGE whenever the resolved UiErrorState's kind has no entry in SAVE_FAILURE_MESSAGE_BY_KIND, and whenever the thrown value is not an ApiError at all — unchanged from the previous unconditional generic toast for every other case.
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/services/concept-form-schema.ts
  - src/hooks/use-concept-form.ts
  - src/routes/concept-form-fields.tsx
  how: 'The concept''s fourth attribute, description (required: true), is now present end to end in the one existing concept form: required in conceptFormSchema, carried through useConceptForm''s defaultValues/submission body, and editable through ConceptFormFields'' new Description control.'
- node: rules/glossary/a-concept-declares-its-description
  encoded_at:
  - src/services/concept-form-schema.ts
  - src/hooks/use-concept-form.ts
  how: The console never dispatches a registration with an empty description (conceptFormSchema's z.string().min(1) blocks submission before the request is sent), and on the one path that rule still reaches the operator through, use-concept-form.ts's saveFailureMessage renders the console's own specific wording rather than the generic fallback.
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  encoded_at:
  - src/hooks/use-concept-form.ts
  how: The scenario's third then-clause — the operator console tells the operator specifically that the description is missing, never only a generic failure notice — is answered by SAVE_FAILURE_MESSAGE_BY_KIND's concept-description-required entry and saveFailureMessage. The scenario's first two then-clauses (the HTTP 422 refusal itself, and the glossary's held concepts staying unchanged) are the registry's own behavior, already delivered elsewhere; this task only reaches the console's own telling-apart of that outcome.
- node: contracts/glossary/glossary-authoring
  encoded_at:
  - src/hooks/use-concept-form.ts
  how: The register-concept operation this contract publishes is dispatched by useConceptForm's mutationFn; this task widens the request body it sends (now including description) and widens how a refusal from that same operation is told apart on failure.
- node: contracts/glossary/glossary-query
  how: 'This task reaches this contract only by consuming what it already exposes: edit mode''s description pre-fill reads existing.description off the GlossaryConcept the Concepts tab''s own list-concepts read already supplies — that field was added to the read shape by this task''s dependency, not by this task. No file this task wrote encodes a new fact of this contract.'
inferences:
- inferred: The exact wording shown for the concept-description-required refusal — "A concept must state what it means; add a description before saving."
  from: The same SAVE_FAILURE_MESSAGE_BY_KIND convention use-capability-form.ts and use-connector-configuration-form.ts already established for their own domain refusals.
- inferred: description is required client-side (z.string().min(1)) even though registerConceptBodySchema leaves it optional at the wire.
  from: 'domain/glossary/concept declaring description required: true, and concept-form-schema.ts''s own already-established precedent of requiring ttl client-side stricter than the wire for the identical reason.'
- inferred: Textarea (@tui/ui/textarea) rather than Input is the right control for a free-text, potentially multi-line description.
  from: hypothesis-revision-form-fields.tsx's own Criterion field, this app's only existing precedent for a free-text (non-JSON) form field of comparable nature.
- inferred: The Description field sits after TTL and before the Save button.
  from: domain/glossary/concept's own attribute order (name, accepts, ttl, description), and this form's own existing top-to-bottom field order.
preserved:
- The name field's disabled-in-edit-mode behavior and the create(null)/edit(existing) mode selection.
- The accepts multi-select's Controller-driven toggle behavior and its own validation error rendering.
- The isDispatchingRef double-submit guard around form.handleSubmit.
- onSuccess's invalidation of both query keys, and the onSaved callback.
- The generic failure toast for every failure this task's criteria do not name, including a non-ApiError thrown value.
- ConceptFormDialog's composition of ConceptFormFields over useConceptForm's returned state, unchanged by this task.
---

## What it is
The write side of the concept's description on the one existing concept form — one more field on that form, never a second form.

## Notes
The inventory's risk is that use-concept-form's onError assumes register-concept throws no domain error; this task is where that assumption stops being load-bearing.
