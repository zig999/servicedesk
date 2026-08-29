---
title: read-concept returns a concept's description
summary: GET /v1/glossary/concepts/{name} now answers a held concept's description
  alongside its name, accepts and ttl, empty for a legacy concept holding none.
task: sha256:7b65de6d0d3c9075d91b4bc1ae072f169640112b962b3a8c8e83de97d9afa408
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/concept-description-read-concept-returns-description-build
files:
- path: src/http/dto/read-concept.dto.ts
  effect: readConceptResponseSchema gains a required description z.string() field
    (never optional — a legacy concept answers the empty string, not an absent
    key), and the header comment is widened to say why.
- path: src/http/read-concept.controller.ts
  effect: handleReadConceptRequest's response object now carries description
    (resolution.concept.description) alongside name, accepts and ttl.
criteria:
- criterion: Reading a held concept by name answers its description alongside
    its name, accepts and ttl.
  met: true
  how: handleReadConceptRequest's return object now includes description resolution.concept.description
    beside the three existing fields, and readConceptResponseSchema requires a
    description key so the DTO type and the controller's literal agree.
- criterion: Reading a held concept with no stored description answers the empty
    string for description, never a refusal.
  met: true
  how: GlossaryService.concepts() (reused by readConcept, delivered by the sibling
    task/concept-description/concept-registration-requires-a-description) already
    defaults an absent stored description to '' before this controller ever sees
    it; readConceptResponseSchema's description field is a plain, non-optional
    z.string(), so an empty string is a valid answer and nothing here raises for
    it — the read path never distinguishes a legacy concept from any other.
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/http/dto/read-concept.dto.ts
  - src/http/read-concept.controller.ts
  how: description was already made a required attribute of the domain shape by
    the sibling registration task; this task's own contribution is exposing that
    same attribute at the read-concept HTTP boundary, so a caller of GET /v1/glossary/concepts/{name}
    sees exactly the domain shape rather than a narrower wire projection of it.
- node: scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone
  encoded_at:
  - src/http/dto/read-concept.dto.ts
  - src/http/read-concept.controller.ts
  how: This task does not reach the scenario's own investigation-pipeline half
    (the evidence item's concept_description snapshot and the judgment prompt,
    which belong to the evidence-collection and judgment tasks of this same plan)
    — it is untouched here. What this task does encode is the same never-refuses,
    answers-empty-string guarantee at a second, independent read surface (the HTTP
    read-concept route) built directly on GlossaryService.readConcept, so a legacy
    concept read through this route degrades to its name and observation alone
    exactly as the scenario requires of any read of it, rather than a shape only
    the investigation pipeline happens to honor.
preserved:
- read-concept.routes.ts's existing path-parameter validation (DTO-01/EDG-01),
  its 400 response for an empty :name segment, and its unconditional 200/never-500
  pass-through of whatever the controller resolves.
- The controller's existing ConceptNotHeldError propagation for an unheld concept
  (left to the shared status map, COR-04) and its case-preserving, unnormalized
  pass-through of the concept's name, accepts and ttl.
---

## What it is
The read-concept response carries the concept's own description.
A legacy concept with no stored description answers empty rather than refusing the read.

## Notes
src/src/__tests__/unit/http/read-concept.routes.spec.ts (a pre-existing, untouched test file) already asserted the full DTO shape including description, via heldConcept()'s fixture and a toEqual(concept)/Object.keys check against readConceptResponseSchema.shape; that spec was red before this change (the fixture already carried description while the controller/DTO did not) and is now consistent with the source as written.
