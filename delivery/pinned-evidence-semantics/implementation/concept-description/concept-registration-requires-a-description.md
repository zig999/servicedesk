---
title: register-concept refuses a description-less submission
summary: GlossaryService.registerConcept now requires a description, refusing an absent
  or empty one with a typed 422 ConceptDescriptionRequiredError before any read or
  write, and storing one exactly as given on success.
task: sha256:87b7a65283fb2e10847fa2efb0b29a5654a66fc004dd437d49f4accfc3949279
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/concept-description-concept-registration-requires-a-description-build-3
files:
- path: src/glossary/terms.ts
  effect: 'Concept gains a required description: string attribute; ConceptRegistration
    gains an optional description?: string, since a submission may name none and is
    refused rather than defaulted.'
- path: src/errors/concept-description-required.error.ts
  effect: new typed error class (name-message-context shape, same as RequesterRequiredError/WrittenAtRequiredError),
    carrying the concept's own name and whatever description value (if any) was given.
- path: src/glossary/glossary.service.ts
  effect: registerConcept refuses via a new private type-guard helper (namesNoDescription)
    before reading or writing anything, throwing ConceptDescriptionRequiredError for
    an absent or empty-string description; on success it stores the description exactly
    as given. concepts() (the shared read helper registerConcept, readConcept and
    listConcepts all reuse) now also answers description, defaulting an absent stored
    value to the empty string.
- path: src/errors/status-map.ts
  effect: imports and maps ConceptDescriptionRequiredError to HTTP 422 in STATUS_BY_ERROR_CLASS;
    updates the header comment's node/extends counts and citation list.
- path: src/http/dto/register-concept.dto.ts
  effect: 'registerConceptBodySchema gains an optional description: z.string().optional()
    field, deliberately not required at this boundary so an absent description reaches
    GlossaryService.registerConcept for its own typed 422 refusal rather than a generic
    400 VALIDATION_ERROR envelope.'
criteria:
- criterion: A concept registration naming no description is refused with an HTTP
    422 response reporting ConceptDescriptionRequiredError.
  met: true
  how: registerConcept's first statement checks registration.description via namesNoDescription
    (absent or the empty string) and throws new ConceptDescriptionRequiredError(...);
    status-map.ts's STATUS_BY_ERROR_CLASS maps that class to 422, which error-handler.middleware.ts's
    existing statusForError-driven dispatch answers with.
- criterion: A concept registration refused for naming no description leaves the glossary's
    held concepts unchanged.
  met: true
  how: The throw in registerConcept happens before this.concepts() (the read) or this.store.writeConcepts
    (the write) is ever called.
- criterion: A concept registration naming a description succeeds, and the glossary's
    held concept for that name carries exactly that description.
  met: true
  how: 'Once namesNoDescription''s guard passes, the constructed Concept carries description:
    registration.description unmodified, written through store.writeConcepts and returned
    as the call''s own resolution.'
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/glossary/terms.ts
  - src/glossary/glossary.service.ts
  how: Concept's own shape gains description as a required string attribute; GlossaryService
    builds every Concept it answers or writes with that attribute populated.
- node: rules/glossary/a-concept-declares-its-description
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/errors/concept-description-required.error.ts
  - src/errors/status-map.ts
  - src/http/dto/register-concept.dto.ts
  how: The registry (GlossaryService.registerConcept) refuses to register or update
    a concept naming no description, answered as HTTP 422 reporting ConceptDescriptionRequiredError.
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  encoded_at:
  - src/glossary/glossary.service.ts
  - src/errors/concept-description-required.error.ts
  - src/errors/status-map.ts
  how: 'Given a registration naming no description, when register-concept processes
    it: the refusal answers HTTP 422 reporting ConceptDescriptionRequiredError, and
    the glossary''s held concepts stay exactly as they were.'
inferences:
- inferred: A registration "naming no description" is read as an absent value or the
    empty string — not a whitespace-only string.
  from: connector-configuration-registry.service.ts's own isUndeclared helper ('an
    empty identity names nothing'), the one existing codebase convention for a required-string-attribute-absence
    refusal (MNT-03).
- inferred: concepts() (and therefore readConcept/listConcepts) defaults an absent
    stored description to the empty string rather than leaving it undefined.
  from: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone's
    own given clause — 'a concept registered before concepts declared a description
    holds an empty one' — a fact the specification already states.
- inferred: register-concept.dto.ts's description field is Zod-optional rather than
    required, deliberately deferring the refusal to GlossaryService.registerConcept
    itself.
  from: rules/glossary/a-concept-declares-its-description's own literal wording —
    'with an HTTP 422 response reporting a ConceptDescriptionRequiredError' — which
    a boundary-level Zod rejection cannot produce.
preserved:
- register-concept's existing create-or-replace-by-name semantics, its accepts/ttl
  handling and defaulting, and its HTTP route/controller behavior (no authentication
  guard, path/body composition, 200 response, params validation).
- IGlossaryStore's whole-replace/fresh-read shape (writeConcepts/readConcepts) and
  RelationalGlossaryStore's own implementation of it.
deferred:
- what: Several pre-existing test files construct full Concept object literals missing
    description, which fail to type-check against Concept's newly required field.
  why: Resolved by task/concept-literal-fixture-maintenance/concept-literal-typecheck-repair,
    a separate task cut for this exact fallout.
- what: list-concepts' HTTP response starts silently including description, since
    list-concepts.controller.ts answers GlossaryService.listConcepts' own Concept[]
    verbatim with no narrowing response schema.
  why: Narrowing or explicitly exposing it would be deciding whether list-concepts
    should show description, a decision no criterion or specification node assigns
    to this task.
---

## What it is
register-concept now requires a description, refusing a submission naming none with a typed HTTP 422 (ConceptDescriptionRequiredError) before any read or write, and storing one exactly as given on success.
Concept.description is now a required attribute of the domain shape itself, and every read path (concepts(), readConcept, listConcepts) answers it, defaulting an absent stored value to the empty string.

## Notes
The refusal is raised in GlossaryService rather than at the Zod validation boundary (recorded as an inference, not a standard divergence — no standard rule this project declares scopes to a .dto.ts file), because the specification's own literal wording (422, ConceptDescriptionRequiredError) cannot be produced by a generic boundary rejection.
Two items deferred: pre-existing test files broken by the widened Concept shape (now resolved by a separate fixture-maintenance task), and list-concepts' HTTP response silently gaining description (no node assigns narrowing it to this task).
