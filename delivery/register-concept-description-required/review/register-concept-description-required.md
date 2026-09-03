---
title: 'Review: RegisterConceptBodyDto''s exported type requires description'
summary: Coverage, specification conformance, standard conformance and failure diagnosis over require-description's
  delivered change against the current main tree.
reviewed:
- src/http/dto/register-concept.dto.ts
- src/http/register-concept.routes.ts
- src/__tests__/unit/http/dto/register-concept.dto.spec.ts
- src/__tests__/unit/http/register-concept.routes.spec.ts
tasks:
- task/register-concept-description-required/require-description
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/register-concept-description-required-review-suite) passed every step
    (install, typecheck, lint, secret-scan, test); there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: RegisterConceptBodyDto's exported type declares description as a required string, not optional,
    matching domain/glossary/concept's required attribute.
  state: covered
  tests:
  - file: src/__tests__/unit/http/dto/register-concept.dto.spec.ts
    name: declares description as a required string on the exported type, matching domain/glossary/concept's
      own required attribute
  - file: src/__tests__/unit/http/dto/register-concept.dto.spec.ts
    name: refuses a value naming no description as RegisterConceptBodyDto, even though registerConceptBodySchema's
      own inference still leaves it optional
- criterion: 'registerConceptBodySchema''s runtime parsing of description is unchanged: a request body
    with the key absent, or with an empty-string value, still passes safeParse and reaches the controller
    and service exactly as it does today.'
  state: partial
  tests:
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: lets a request whose body names no description at all reach registerConcept unmodified, rather
      than refusing it here with a 400
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 422 reporting a ConceptDescriptionRequiredError for a request whose body carries an
      explicit empty-string description, exactly as one naming no description at all
  why: 'The absent-key half is fully exercised: the 200 test asserts registerConcept was called with exactly
    { name, accepts }. The empty-string half is exercised only as far as "not a 400 and the service refused
    it" — no test asserts what value actually reached the controller or service for an explicit empty
    string, so a schema change that stripped description or coerced '''' to undefined before that point
    would leave every test in the set green.'
- criterion: A registration request with no description, or an empty one, is still refused with an HTTP
    422 response reporting ConceptDescriptionRequiredError -- unchanged from today's behavior.
  state: covered
  tests:
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 422 reporting a ConceptDescriptionRequiredError when a request creates a concept at
      a brand-new name with no description
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 422 reporting a ConceptDescriptionRequiredError when a request replaces an already-held
      concept at its own name with no description
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 422 reporting a ConceptDescriptionRequiredError for a request whose body carries an
      explicit empty-string description, exactly as one naming no description at all
  - file: src/__tests__/unit/errors/status-map.spec.ts
    name: resolves ConceptDescriptionRequiredError to 422
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a concept registration naming no description, with a typed ConceptDescriptionRequiredError
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses a concept registration naming an empty-string description exactly as it refuses an absent
      one
- criterion: A registration request carrying a non-empty description continues to validate and register
    exactly as it does today.
  state: partial
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: succeeds for a concept registration naming a description, and the glossary's held concept for
      that name carries exactly that description
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: replaces a concept in place at a name the glossary already holds, rather than creating a second
      entry for it
  why: 'The register half is covered at the service, on both create and replace paths. The validate half,
    which the criterion states of a request, is unexercised over HTTP: every body injected in register-concept.routes.spec.ts
    is built by validBody(), which never names a description, so no test sends a non-empty description
    over HTTP — a schema that stopped accepting one, or stripped it before the controller composed the
    registration, would leave every test in the set green.'
- criterion: ttl remains optional in both the runtime schema and the exported type, unchanged by this
    fix.
  state: covered
  tests:
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 200 with the held concept registerConcept resolved, for a valid registration at the
      name the path names
  - file: src/__tests__/unit/http/dto/register-concept.dto.spec.ts
    name: still assigns a value naming no ttl to RegisterConceptBodyDto, since only description was widened
      to required
findings:
- pass: conformance
  file: src/__tests__/unit/http/register-concept.routes.spec.ts
  where: the third 422 test ("answers 422 reporting a ConceptDescriptionRequiredError for a request whose
    body carries an explicit empty-string description, exactly as one naming no description at all")
  evidence: 'payload: validBody({ description: '''' }),


    expect(response.statusCode).toBe(422);

    expect(response.json()).toMatchObject({ error: { code: ''ConceptDescriptionRequiredError'' } });'
  cost: the rule that an empty-string description is treated exactly as an absent one lives only in this
    test and the code it exercises; the next reader looks for it in rules/glossary/a-concept-declares-its-description,
    finds only "refuses ... a concept with no description", and cannot tell from the specification whether
    an explicit empty string is covered — even though the specification already gives this exact idiom
    (absent-or-empty-string is undeclared) to a capability's contract attributes and a connector's name.
  correction: extend rules/glossary/a-concept-declares-its-description's statement to say a description
    that is absent or an empty string is undeclared, mirroring the same idiom already used elsewhere in
    the specification.
- pass: standard
  file: src/__tests__/unit/http/register-concept.routes.spec.ts
  where: buildTestApp, used by 7 of the file's 10 tests
  cites: TST-03
  evidence: 'const registerConcept: RegisterConceptMock = vi.fn();

    const dependencies: RegisterConceptControllerDependencies = { registerConcept };'
  cost: registerConcept is the domain call GlossaryService.registerConcept answers through — including
    the description-required rule the service enforces — and 7 of the 10 tests replace it outright with
    a vi.fn() rather than standing a stand-in in for the store. A change that broke the actual wiring
    between the route and the real service would still pass every one of those seven tests; only the three
    tests built on buildRealServiceApp would catch it.
  correction: Route the tests through buildRealServiceApp (a real GlossaryService over a stand-in IGlossaryStore),
    the way the 422/200 tests already do, and reserve the stand-in for the store.
- pass: standard
  file: src/http/register-concept.routes.ts
  where: registerConceptHandler, the zod-issue-to-VALIDATION_ERROR mapping
  cites: MNT-03
  evidence: 'const issues = parsedParams.error.issues.map((issue) => `${issue.path.join(''.'')}: ${issue.message}`);'
  cost: The identical block is copied verbatim into roughly thirty other route files in src/http. No shared
    helper exists to call instead; a change to how a validation failure is reported has to be hand-applied
    across every one of those files.
  correction: Extract the zod-issue mapping and the VALIDATION_ERROR reply shape into one shared function
    this route (and the others) calls.
- pass: standard
  file: src/http/register-concept.routes.ts
  where: registerConceptHandler, forwarding parsedBody.data to handleRegisterConceptRequest
  cites: EDG-01
  evidence: 'const parsedBody = registerConceptBodySchema.safeParse(request.body);

    if (!parsedBody.success) { ... }

    const concept = await handleRegisterConceptRequest(dependencies, parsedParams.data, parsedBody.data
    as RegisterConceptBodyDto);'
  cost: registerConceptBodySchema declares description as optional, so a request naming no description,
    or an explicit empty string, passes this boundary and reaches handleRegisterConceptRequest unrefused.
    Description-required is a plain presence/format check, yet it is the service — not this boundary —
    that refuses it, answering 422 rather than the 400 EDG-01 expects at the validation boundary.
  correction: Require description at the schema (e.g. z.string().min(1)) so an absent or empty value is
    refused here with a 400 before handleRegisterConceptRequest is called.
reconciliation: siegard-reconcile/register-concept-description-required.md
---

## What it is

Reviews require-description's delivered change: register-concept.dto.ts and register-concept.routes.ts, plus the two test files that prove it (one new compile-time type-test file, one new runtime test in the existing route spec).
Coverage, specification conformance (via trace.py --stage --review, folded into siegard-reconcile/register-concept-description-required.md), standard conformance and failure diagnosis all ran; the failures pass found nothing to diagnose since every captured step passed.

## Notes

19 rules were in scope for reading: STK-02 through STK-09, STK-11, STK-12, SEC-04, MNT-03, DTO-01, API-04, EDG-01, EDG-07, TST-01 through TST-03 — of which 3 produced findings (TST-03, MNT-03, EDG-01).
The rules a tool decides (20 lint rules, 2 secret-scan rules, 2 typecheck rules) ran as steps of the captured run (run/register-concept-description-required-review-suite) and all exited 0.
Coverage found two criteria partial: the runtime empty-string parse path (criterion 2) and the non-empty-description path over real HTTP (criterion 4) are each proven only at the service layer, never over HTTP in this file set.
The conformance pass surfaced one unstated fact: the specification's own rule for a concept's description does not say whether an empty string counts as absent, though the code (and the specification's own idiom elsewhere — a capability's contract attributes, a connector's name) already treats it that way. This is routed to /analyse, not to a rebind.
The conformance fold cleared 3 node-file bindings and left 1 uncleared (rules/glossary/a-concept-declares-its-description, over register-concept.dto.ts — the schema's own optional description does not itself hold the refusal, which sits in the service) — see siegard-reconcile/register-concept-description-required.md for the per-node judgment.
This review does not re-examine the other four live corrective initiatives' own files, or files whose drift predates this batch and were already read by the prior `review-change: all 9 corrective batch tasks` review (4f885cf) — those stand on their own record.
