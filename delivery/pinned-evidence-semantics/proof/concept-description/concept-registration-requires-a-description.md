---
title: Proof for register-concept refusing a description-less submission
summary: Confirms this task's three criteria and its three disclosed inferences are
  each covered by an existing, already-passing test, and adds the one test that was
  missing — that the DTO's own optional description field lets a description-less
  request reach GlossaryService.registerConcept rather than refusing it at 400.
implementation: sha256:7412705dac21704f3727ea504899481b76bf19494d6e355cba399e5c465f494f
run: run/pinned-evidence-semantics-full-suite-post-evidence-snapshot-4
tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a concept registration naming no description, with a typed ConceptDescriptionRequiredError (criterion 1)
    proves: A concept registration naming no description is refused with an HTTP 422 response reporting ConceptDescriptionRequiredError.
    fails_when: registerConcept stops throwing ConceptDescriptionRequiredError for an absent description, throws any other error or value, or throws without the { name, given } context this test asserts.
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a concept registration naming an empty-string description exactly as it refuses an absent one (criterion 1)
    proves: A concept registration naming no description is refused with an HTTP 422 response reporting ConceptDescriptionRequiredError.
    fails_when: registerConcept stops refusing an empty-string description (e.g. accepts and stores it), or refuses it with anything other than ConceptDescriptionRequiredError carrying context { name, given -> the empty string }.
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: leaves the glossary's held concepts unchanged when a registration naming no description is refused (criterion 2)
    proves: A concept registration refused for naming no description leaves the glossary's held concepts unchanged.
    fails_when: registerConcept reads or writes through the store before (or despite) throwing ConceptDescriptionRequiredError, so store.readConcepts() answers anything other than exactly the pre-existing held concept.
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: succeeds for a concept registration naming a description, and the glossary's held concept for that name carries exactly that description (criterion 3)
    proves: A concept registration naming a description succeeds, and the glossary's held concept for that name carries exactly that description.
    fails_when: registerConcept refuses a registration that names a description, or stores/returns a description different from the one given (trimmed, defaulted, dropped, or otherwise altered).
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: does not treat a whitespace-only description as naming none, it is stored exactly as given, with no trimming and no refusal
    proves: 'inference: A registration "naming no description" is read as an absent value or the empty string, not a whitespace-only string.'
    fails_when: registerConcept starts refusing a whitespace-only description as if it named none, or trims or otherwise normalizes it before storing it.
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: answers a concept with its name, its accepted subject types and its ttl in seconds
    proves: 'inference: concepts() (and therefore readConcept/listConcepts) defaults an absent stored description to the empty string rather than leaving it undefined.'
    fails_when: concepts() stops defaulting an absent stored description to the empty string, e.g. answers description as undefined or omits the field for a stored registration that carries none.
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConceptDescriptionRequiredError to 422
    proves: A concept registration naming no description is refused with an HTTP 422 response reporting ConceptDescriptionRequiredError.
    fails_when: STATUS_BY_ERROR_CLASS stops mapping ConceptDescriptionRequiredError to 422, whether removed entirely or remapped to a different status.
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: lets a request whose body names no description at all reach registerConcept unmodified, rather than refusing it here with a 400
    proves: 'inference: register-concept.dto.ts''s description field is Zod-optional rather than required, deliberately deferring the refusal to GlossaryService.registerConcept itself.'
    fails_when: registerConceptBodySchema is changed to require description (or otherwise reject a body naming none), so a description-less request is refused with a generic 400 VALIDATION_ERROR before registerConcept is ever called.
not_applicable:
  - edge_case: Two registrations submitted concurrently, whether at the same name or at different names
    why: No specification node or criterion this task implements states concurrent registerConcept behavior, and the store port (IGlossaryStore) is exercised here as a single async call each test awaits in sequence; asserting an ordering guarantee would assert something nobody stated.
  - edge_case: A registration that names no description alongside some other invalid field, such as an absent accepts array
    why: Which refusal takes priority between the description guard and any other boundary- or service-level validation is not stated by any of this task's own criteria, and belongs to whichever task owns that other field's own validation.
untested:
  - The full HTTP round trip for a description-less registerConcept call — a live request reaching GlossaryService.registerConcept's real throw, passed through error-handler.middleware.ts's real dispatch, answering a wire response whose body reports "ConceptDescriptionRequiredError" at 422 — is not exercised as one integrated test in this task's own tests. It is established only by composing three separately-tested facts (registerConcept's own typed throw, status-map.ts's own mapping of that class to 422, and error-handler.middleware.ts's own generic status-map-driven dispatch, proved with other error classes by a prior task's own tests) — the same composition this codebase already relies on for every other status-mapped domain error, and not a gap specific to this task.
---

## What it is
Reads the existing suite against this task's three stated criteria and its three disclosed inferences, finds each already covered by a test that already passes in the cited full-suite run (glossary.service.spec.ts's own concept-description block, and status-map.spec.ts's ConceptDescriptionRequiredError entry), and adds the one test that was missing: that register-concept.dto.ts's own optional description field lets a description-less request clear the route/DTO boundary rather than being refused there with a generic 400, which is the inference the implementation record disclosed for that file and which no existing test exercised.

## Notes
The one newly added test (in src/__tests__/unit/http/register-concept.routes.spec.ts) is confirmed passing in the cited run — register-concept.routes.spec.ts now counts 8 tests there, 7 pre-existing plus this one. Every other test listed here was independently confirmed already present and unchanged.
