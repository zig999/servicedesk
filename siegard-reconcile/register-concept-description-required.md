---
contract_version: siegard-reconcile/3
title: RegisterConceptBodyDto's exported type requires description
summary: require-description widened RegisterConceptBodyDto's exported TypeScript type to require description,
  matching domain/glossary/concept's own attribute, without changing registerConceptBodySchema's runtime
  parsing, under the register-concept-description-required initiative.
target: backend
files:
- path: src/__tests__/unit/http/dto/register-concept.dto.spec.ts
  change: 'Proof: new compile-time type-test file asserting description is required on the exported type
    and that ttl remains optional.'
- path: src/__tests__/unit/http/register-concept.routes.spec.ts
  change: 'Proof: one new test added, closing the one runtime gap (an explicit empty-string description)
    no pre-existing test exercised — asserting it is refused with 422 ConceptDescriptionRequiredError
    exactly as an absent description is.'
- path: src/http/dto/register-concept.dto.ts
  change: 'registerConceptBodySchema is unchanged, keeping description as z.string().optional(). The exported
    RegisterConceptBodyDto type is redeclared as Omit<z.infer<typeof registerConceptBodySchema>, ''description''>
    & { description: string }, so description is a required string on the exported type.'
- path: src/http/register-concept.routes.ts
  change: Imports the RegisterConceptBodyDto type and asserts parsedBody.data as RegisterConceptBodyDto
    at the one call into handleRegisterConceptRequest. No branch, refusal, status code or validator changed;
    this is the type-only adjustment needed so the widened export still type-checks.
nodes:
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: "src/http/register-concept.routes.ts: held at the route registration in registerConceptRoutesPlugin\
    \ — no authentication middleware, guard or check runs before dispatch — app.put(`${API_PREFIX}/glossary/concepts/:name`,\
    \ (request, reply) =>\n      registerConceptHandler(dependencies, request, reply),\n    );\n"
  encoded_at:
  - src/http/register-concept.routes.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: "src/http/dto/register-concept.dto.ts: held at registerConceptParamsSchema and registerConceptBodySchema,\
    \ which shape the register-concept operation's request — export const registerConceptParamsSchema\
    \ = z.object({\n  name: z.string().min(1),\n});\n\nexport const registerConceptBodySchema = z.object({\n\
    \  accepts: z.array(z.string().min(1)),\n  ttl: z.number().int().positive().optional(),\n  description:\
    \ z.string().optional(),\n});\n\nsrc/http/register-concept.routes.ts: held at the PUT handler that\
    \ validates the named path segment and the body, then calls handleRegisterConceptRequest and returns\
    \ its result — the register-concept operation this contract publishes — const concept = await handleRegisterConceptRequest(dependencies,\
    \ parsedParams.data, parsedBody.data as RegisterConceptBodyDto);\n  return reply.code(200).send(concept);\n"
  encoded_at:
  - src/http/dto/register-concept.dto.ts
  - src/http/register-concept.routes.ts
- node: domain/glossary/concept
  conforms: true
  how: 'src/http/dto/register-concept.dto.ts: held at registerConceptParamsSchema (name) together with
    registerConceptBodySchema (accepts, ttl, description) declare the value object''s four attributes
    for the register operation — name: z.string().min(1)

    src/http/register-concept.routes.ts: held at the body-validation call, which enforces registerConceptBodySchema
    (the concept''s declared attributes) before the request reaches the domain — const parsedBody = registerConceptBodySchema.safeParse(request.body);'
  encoded_at:
  - src/http/dto/register-concept.dto.ts
  - src/http/register-concept.routes.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: false
  how: 'no named file holds this fact now: src/http/dto/register-concept.dto.ts read `nowhere` — description:
    z.string().optional()'
  observed_at:
  - src/http/dto/register-concept.dto.ts
unstated:
- file: src/__tests__/unit/http/register-concept.routes.spec.ts
  where: the third 422 test, lines 200-211 ("answers 422 reporting a ConceptDescriptionRequiredError for
    a request whose body carries an explicit empty-string description, exactly as one naming no description
    at all")
  evidence: 'payload: validBody({ description: '''' }),


    expect(response.statusCode).toBe(422);

    expect(response.json()).toMatchObject({ error: { code: ''ConceptDescriptionRequiredError'' } });

    '
  cost: the rule that an empty-string description is treated exactly as an absent one lives only in this
    test and the code it exercises; the next reader looks for it in rules/glossary/a-concept-declares-its-description,
    finds only "refuses ... a concept with no description", and cannot tell from the specification whether
    an explicit empty string is covered — even though the specification already gives this exact idiom
    (absent-or-empty-string is undeclared) to a capability's contract attributes, a connector's name and
    an investigation's ticket_ref
unbound:
- src/__tests__/unit/http/dto/register-concept.dto.spec.ts
- src/__tests__/unit/http/register-concept.routes.spec.ts
notes: 'Judged by 4 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/register-concept-description-required.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/glossary/concept were
  read on every file and answered for, and bound from nowhere here — a binding this record writes is one
  the trace already held.

  Candidates: 13 opened across 4 of 4 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/register-concept-description-required.returns/`, which are the evidence behind every entry above.
