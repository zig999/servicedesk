---
title: Description-required DTO widening — compile-time proof plus the runtime gap it left uncovered
summary: A new compile-time type-test file falsifies criterion 1 (and the ttl half of criterion 5) directly
  against RegisterConceptBodyDto, one new HTTP-level test closes the one runtime gap (an explicit empty-string
  description) no existing test exercised, and the rest of criteria 2-5 are already fully proven by pre-existing
  tests this delivery did not need to duplicate.
implementation: sha256:f00fa49b3a62056f4f6db4a64ba48de5500898d4d59bbc20e4b669d451ec2148
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/register-concept-description-required-require-description-suite
tests:
- file: src/__tests__/unit/http/dto/register-concept.dto.spec.ts
  name: declares description as a required string on the exported type, matching domain/glossary/concept's
    own required attribute
  proves: Criterion 1 -- RegisterConceptBodyDto's exported type declares description as a required string,
    not optional.
  fails_when: RegisterConceptBodyDto's description field type were `string | undefined` -- e.g. the export
    were left as the bare z.infer<typeof registerConceptBodySchema> instead of the Omit-and-override --
    npm run typecheck would then report the toEqualTypeOf<string>() assertion false.
- file: src/__tests__/unit/http/dto/register-concept.dto.spec.ts
  name: refuses a value naming no description as RegisterConceptBodyDto, even though registerConceptBodySchema's
    own inference still leaves it optional
  proves: Criterion 1, its assignability half -- a value omitting description is not assignable to RegisterConceptBodyDto.
  fails_when: RegisterConceptBodyDto still allowed an object literal without a description key -- the
    @ts-expect-error directive would then have nothing to suppress, and npm run typecheck reports an unused
    @ts-expect-error directive at that line.
- file: src/__tests__/unit/http/dto/register-concept.dto.spec.ts
  name: still assigns a value naming no ttl to RegisterConceptBodyDto, since only description was widened
    to required
  proves: Criterion 5, its type half -- ttl remains optional on the exported type, unchanged by this fix.
  fails_when: the widening had also made ttl required on the exported type -- this literal, which omits
    ttl, would then fail to type-check.
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 422 reporting a ConceptDescriptionRequiredError for a request whose body carries an explicit
    empty-string description, exactly as one naming no description at all
  proves: Criteria 2 and 3, the empty-string half neither existing test exercised end-to-end -- registerConceptBodySchema
    still lets an explicit empty-string description reach the real GlossaryService, which still refuses
    it with a 422 ConceptDescriptionRequiredError.
  fails_when: registerConceptBodySchema rejected an empty-string description at the schema/route boundary
    (answering 400 instead of reaching the service), or the service/status-map chain stopped surfacing
    that refusal as HTTP 422 with error.code 'ConceptDescriptionRequiredError'.
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: lets a request whose body names no description at all reach registerConcept unmodified, rather
    than refusing it here with a 400
  proves: Criterion 2, the absent-description half -- the schema still passes an absent description through
    to the controller and service unmodified.
  fails_when: 'registerConceptBodySchema rejected a body with no description key (answering 400), or the
    route stopped calling registerConcept with exactly { name: ''a-name'', accepts: [''a-subject-type'']
    }.'
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 422 reporting a ConceptDescriptionRequiredError when a request creates a concept at a
    brand-new name with no description
  proves: Criterion 3, the absent-description / new-name half.
  fails_when: the absent-description request stopped reaching the real service unmodified, or the service/status-map
    chain stopped answering 422 with error.code 'ConceptDescriptionRequiredError' for a brand-new name.
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: answers 422 reporting a ConceptDescriptionRequiredError when a request replaces an already-held
    concept at its own name with no description
  proves: Criterion 3, the absent-description / existing-name (replace) half.
  fails_when: the same refusal stopped firing when the request targets an already-held name.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ConceptDescriptionRequiredError to 422
  proves: Criterion 3's status mapping -- ConceptDescriptionRequiredError maps to 422 in status-map.ts,
    unchanged.
  fails_when: statusForError(new ConceptDescriptionRequiredError(...)) stopped returning 422.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses a concept registration naming no description, with a typed ConceptDescriptionRequiredError
  proves: Criterion 3's service-level refusal for an absent description.
  fails_when: registerConcept({ name, accepts }) with no description stopped throwing ConceptDescriptionRequiredError,
    or threw with the wrong context.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses a concept registration naming an empty-string description exactly as it refuses an absent
    one
  proves: Criterion 3's service-level refusal for an empty-string description.
  fails_when: 'registerConcept(...{ description: '''' }) stopped throwing ConceptDescriptionRequiredError
    with context.given === ''''.'
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: succeeds for a concept registration naming a description, and the glossary's held concept for
    that name carries exactly that description
  proves: Criterion 4 -- a non-empty description continues to validate and register exactly as today,
    at the service level.
  fails_when: registerConcept with a non-empty description stopped succeeding, or the resolved/persisted
    concept's description no longer matched exactly what was given.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: replaces a concept in place at a name the glossary already holds, rather than creating a second
    entry for it
  proves: Criterion 4's replace-at-an-existing-name path, with a non-empty description.
  fails_when: registering a described concept at an existing name stopped replacing it in place, dropped
    an unrelated concept, or altered the description.
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  name: composes the path-carried name with the body into one registration, calling registerConcept with
    it exactly
  proves: Criterion 4's route-level composition -- whatever the body carries (including a non-empty description)
    reaches registerConcept unmodified.
  fails_when: the route stopped composing { name, ...body } exactly before calling registerConcept.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: holds the default of sixty seconds for a concept whose registration states no ttl
  proves: Criterion 5, runtime half -- ttl stays optional and defaults on read.
  fails_when: a stored registration with no ttl stopped defaulting to sixty seconds on read.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: defaults a newly created concept's ttl to sixty seconds when its registration states none, the
    same default a read already applies
  proves: Criterion 5, runtime half -- registerConcept itself still accepts a registration with no ttl
    and defaults it.
  fails_when: registerConcept with no ttl in the registration stopped defaulting the resolved concept's
    ttl to sixty seconds.
not_applicable:
- edge_case: A boundary at each end of a stated numeric or length range.
  why: This task widens a type only; it introduces and alters no numeric or length boundary. ttl's own
    bound is pre-existing and untouched by this change.
- edge_case: An empty collection where one comes back.
  why: registerConcept resolves a single Concept, not a list; no collection-returning behavior is touched
    by this task.
- edge_case: A duplicate where uniqueness is claimed.
  why: The replace-at-an-existing-name path is pre-existing and unaffected by a type-only widening; this
    task's criteria assert nothing new about it.
- edge_case: An operation attempted against state that forbids it.
  why: No new forbidden-state transition is introduced; the existing refusal (no/empty description) is
    the one this task's own criterion 3 already names and is tested above.
- edge_case: A dependency that fails or answers slowly.
  why: This task touches no I/O, network or external dependency; the type widening and its one compensating
    assertion have no runtime effect at all.
- edge_case: Two operations against one subject at once.
  why: No concurrency behavior is introduced or altered by a type-only widening, and no criterion of this
    task states anything about concurrent registration.
untested:
- A full HTTP round trip through the real GlossaryService succeeding end-to-end with a non-empty description
  was never itself asserted in one test -- the 200/success path through the real service is only exercised
  via the mocked-dependency route tests plus the service-level unit tests separately. This is an absence
  in the pre-existing suite, not one this task introduced or one its criteria specifically demand closed.
---

## What it is

Proves RegisterConceptBodyDto's exported type requires description (by compile-time type test)
and that every runtime behavior of the registration route -- the 422 refusal for an absent or
empty description, and successful registration for a non-empty one -- stays exactly what it was,
closing the one gap (an explicit empty-string description) no pre-existing test exercised.

## Notes

None.
