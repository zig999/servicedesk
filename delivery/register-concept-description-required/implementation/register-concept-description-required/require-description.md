---
title: RegisterConceptBodyDto's exported type requires description
summary: Widens RegisterConceptBodyDto's exported TypeScript type to state description as a required string,
  matching domain/glossary/concept, while leaving registerConceptBodySchema's runtime parsing of description
  untouched.
task: sha256:b49b4a21c2ad402fa51ca98be5f98368a50d80336cd67542c3271ad22e9d153f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/register-concept-description-required-require-description-build
files:
- path: src/http/dto/register-concept.dto.ts
  effect: 'registerConceptBodySchema is unchanged, keeping description as z.string().optional() and ttl
    as z.number().int().positive().optional(). The exported RegisterConceptBodyDto type is redeclared
    as Omit<z.infer<typeof registerConceptBodySchema>, ''description''> & { description: string }, so
    description is a required string on the exported type while every other field (accepts, ttl) keeps
    exactly the shape the schema infers.'
- path: src/http/register-concept.routes.ts
  effect: Imports the RegisterConceptBodyDto type and asserts parsedBody.data (the schema's own, still-permissive
    parse output) as RegisterConceptBodyDto at the one call into handleRegisterConceptRequest. No branch,
    refusal, status code or validator changed; this is the type-only adjustment needed so the widened
    export still type-checks at its one call site under the project's strict compiler configuration.
criteria:
- criterion: RegisterConceptBodyDto's exported type declares description as a required string, not optional,
    matching domain/glossary/concept's required attribute.
  met: true
  how: 'register-concept.dto.ts now exports RegisterConceptBodyDto as Omit<z.infer<typeof registerConceptBodySchema>,
    ''description''> & { description: string }, so the exported type''s description field is string (required),
    not string | undefined.'
- criterion: 'registerConceptBodySchema''s runtime parsing of description is unchanged: a request body
    with the key absent, or with an empty-string value, still passes safeParse and reaches the controller
    and service exactly as it does today.'
  met: true
  how: registerConceptBodySchema's own declaration was not edited at all -- only the separately-declared
    exported type was changed. safeParse still succeeds for an absent or empty-string description, and
    parsedBody.data still carries whatever value the request sent unmodified into the controller.
- criterion: A registration request with no description, or an empty one, is still refused with an HTTP
    422 response reporting ConceptDescriptionRequiredError -- unchanged from today's behavior.
  met: true
  how: No file in the chain that produces this behavior (glossary.service.ts's registerConcept, the ConceptDescriptionRequiredError
    class, or status-map.ts's mapping to 422) was touched. The type assertion added in register-concept.routes.ts
    is erased at compile time and has no runtime effect.
- criterion: A registration request carrying a non-empty description continues to validate and register
    exactly as it does today.
  met: true
  how: The schema still accepts a non-empty description string exactly as before, and the compile-time-only
    type assertion changes nothing about what value flows through for this case either.
- criterion: ttl remains optional in both the runtime schema and the exported type, unchanged by this
    fix.
  met: true
  how: 'registerConceptBodySchema''s ttl: z.number().int().positive().optional() is untouched. The new
    exported type only applies Omit/override to the description key; ttl is carried through from z.infer<typeof
    registerConceptBodySchema> unchanged.'
nodes:
- node: domain/glossary/concept
  encoded_at:
  - src/http/dto/register-concept.dto.ts
  how: The node states description as a required attribute of the concept value object. RegisterConceptBodyDto's
    exported TypeScript type is widened to require description as a string, so a type-level reader of
    the registration DTO now sees the same required attribute the domain model states, while the runtime
    refusal for an absent or empty description continues to be enforced exactly as before, downstream
    in the service.
inferences:
- inferred: The widened RegisterConceptBodyDto type needed a compensating type assertion at its one call
    site (register-concept.routes.ts) to keep the project type-checking under its strict compiler configuration.
    Without it, TypeScript refuses to assign a value with an optional property to a parameter typed with
    the same property as required.
  from: TypeScript's structural assignability rules for optional-vs-required properties under strictNullChecks,
    read against tsconfig.json's strict configuration and the single place RegisterConceptBodyDto is consumed
    as a parameter type.
- inferred: The compensating assertion belongs at the routes.ts call site rather than by loosening handleRegisterConceptRequest's
    own body parameter type back to the schema's raw inferred shape, so that the controller boundary keeps
    stating the domain's required-description contract in its signature.
  from: DTO-01's statement that a service receives a typed DTO at the route/controller boundary, and criterion
    1's own wording that the exported type should match domain/glossary/concept's required attribute.
divergences:
- cites: DTO-02
  file: src/http/dto/register-concept.dto.ts
  departure: DTO-02 states a DTO schema is "a Zod object plus the type inferred from it"; RegisterConceptBodyDto
    is no longer the bare z.infer<typeof registerConceptBodySchema> -- it is that inferred type with one
    field (description) overridden to be required rather than optional.
  why: This task's objective is exactly to make the exported type diverge from the schema's own permissive
    inference for this one field, while leaving the schema's runtime parsing untouched -- the two are
    required to disagree by the task itself, since making the schema itself require description would
    turn an absent description into a generic 400 at parse time instead of the domain's own 422 ConceptDescriptionRequiredError.
    The type is still built from z.infer<typeof registerConceptBodySchema> via Omit, minimizing the departure
    to the one field the task names.
- cites: TYP-02
  file: src/http/register-concept.routes.ts
  departure: TYP-02 requires a type assertion to be accompanied by a guard that narrows it; the `parsedBody.data
    as RegisterConceptBodyDto` assertion has no local narrowing guard beside it.
  why: The actual narrowing this assertion assumes -- that description is present -- is not enforced at
    this boundary at all; it is enforced downstream, in glossary.service.ts's registerConcept, which throws
    ConceptDescriptionRequiredError when description is absent or empty. Adding a local guard here would
    either duplicate that check or be a no-op assertion function written only to silence the lint concern.
    Given the task's explicit bar on adding any new refusal or error path, the assertion is left bare
    and disclosed here instead.
preserved:
- registerConceptBodySchema accepts a request body with description absent or an empty string; safeParse
  still succeeds for both.
- registerConceptBodySchema's ttl stays optional and its accepts array validation is unchanged.
- glossary.service.ts's registerConcept still throws ConceptDescriptionRequiredError for an absent or
  empty description, mapped by status-map.ts to HTTP 422.
- A registration with a non-empty description still validates at the route and registers through the service
  exactly as before.
- handleRegisterConceptRequest still composes { ...params, ...body } into the ConceptRegistration passed
  to registerConcept, unchanged.
---

## What it is

Widens RegisterConceptBodyDto's exported type to require description, matching
domain/glossary/concept's own required attribute, while leaving registerConceptBodySchema's
runtime parsing -- and therefore every HTTP response the registry already gives -- unchanged.

## Notes

Divergence: DTO-02 (a DTO schema is a Zod object plus the type inferred from it) -- the exported
type now overrides one field, deliberately, so the type states more than the permissive runtime
schema without changing the schema itself.
Divergence: TYP-02 (a type assertion is accompanied by a guard that narrows it) -- the assertion
at register-concept.routes.ts is bare; the actual narrowing is enforced downstream by the service.
