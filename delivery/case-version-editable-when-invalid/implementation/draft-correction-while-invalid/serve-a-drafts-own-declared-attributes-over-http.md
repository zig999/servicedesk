---
target: backend
title: HTTP route serving a case version's own declared attributes
summary: Adds a GET /v1/cases/:slug/versions/:version/declared-attributes route that exposes CaseQueryService.readCaseVersion
  over HTTP, separate from read-case's own route, reusing the same read-case dependency wiring.
task: sha256:586d07dd04fd77e2aa88a9e895f2c606e9bbde0575f36c70e2143c9889117865
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/draft-correction-while-invalid-serve-a-drafts-own-declared-attributes-over-http-build
files:
- path: src/http/dto/read-case-version.dto.ts
  effect: declares readCaseVersionParamsSchema (slug + coerced positive integer version) and readCaseVersionResponseSchema
    (title, when_to_use, subject, fallback as {outcome, referral}, optional consolidation_register), with
    their inferred Dto types -- no manifest, no state, no slug/version echo
- path: src/http/read-case-version.controller.ts
  effect: handleReadCaseVersionRequest calls ICaseQuery.readCaseVersion(slug, version) and toReadCaseVersionResponse
    flattens the returned CaseVersionAttributes into the response DTO, including consolidation_register
    only when present
- path: src/http/read-case-version.routes.ts
  effect: registers GET /v1/cases/:slug/versions/:version/declared-attributes; safeParses the path params,
    answers 400 VALIDATION_ERROR on a malformed segment, otherwise answers 200 with the attributes body;
    a CaseNotFoundError is not caught locally and propagates to the app's centrally registered handler,
    mapped to 404 by status-map.ts
- path: src/http/build-app.ts
  effect: registers createReadCaseVersionRoutesPlugin(dependencies.readCase) in routePluginFactories,
    immediately after the existing readCase registration; no new field was added to BuildAppDependencies,
    reusing the existing readCase dependency bag
criteria:
- criterion: A request to the route over a draft whose manifest holds no entry is answered HTTP 200.
  met: true
  how: readCaseVersion never calls structuralCase or refuseIncoherence, so an empty-manifest draft never
    throws CaseVersionNotValidError; the route falls through to reply.code(200).send(attributes)
- criterion: The 200 body carries the declared attributes exactly as the draft's own-record read answered
    them.
  met: true
  how: toReadCaseVersionResponse copies title, when_to_use, subject and fallback verbatim from the returned
    CaseVersionAttributes, with no field renamed, recomputed or substituted
- criterion: Where the draft declares no consolidation_register, the 200 body carries no consolidation_register
    value.
  met: true
  how: toReadCaseVersionResponse's conditional spread omits the key entirely when absent, and the schema's
    z.enum(...).optional() accepts its absence
- criterion: The 200 body carries no manifest entry.
  met: true
  how: CaseVersionAttributes and readCaseVersionResponseSchema both declare no manifest field, so the
    body cannot structurally carry one
- criterion: A request naming a slug and version that no case version answers is answered HTTP 404 reporting
    a CaseNotFoundError whose details carry that slug and version.
  met: true
  how: readCaseVersion's heldVersion helper throws CaseNotFoundError(slug, version) when the store answers
    undefined; the route sets no local handling, so it reaches the app's centrally registered handler,
    which maps it to 404 via status-map.ts and serializes {slug, version} as details
- criterion: A request whose version path segment is not an integer is answered HTTP 400 with code VALIDATION_ERROR
    and a message naming the path.
  met: true
  how: readCaseVersionParamsSchema.safeParse fails on a non-integer version (z.coerce.number().int().positive());
    the handler replies 400 with code VALIDATION_ERROR, a message naming the request path, and a details
    list of the zod issues
nodes:
- node: contracts/knowledge/case-query
  how: exposes the already-published read-case-version operation over its own HTTP surface, distinct from
    read-case's route, matching the contract's own description of the two calls as separate
  encoded_at:
  - src/http/read-case-version.controller.ts
  - src/http/read-case-version.routes.ts
- node: constraints/a-successful-case-version-own-record-read-answers-with-http-200
  how: the route answers 200 whenever readCaseVersion resolves, and readCaseVersion never runs validation-runs-at-every-read's
    checks, so a version failing any validator rule -- or one released -- still answers 200 with the same
    attributes body
  encoded_at:
  - src/http/read-case-version.routes.ts
  - src/http/read-case-version.controller.ts
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  how: a path-shape failure is refused with HTTP 400, code VALIDATION_ERROR, a message naming the request
    path, and a details list of the zod issues found, mirroring the codebase's one existing inline realization
    of this constraint
  encoded_at:
  - src/http/read-case-version.routes.ts
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  how: an unwritten slug/version pair is refused with CaseNotFoundError, mapped to 404 by the project's
    one status map, carrying {slug, version} in details -- answered by readCaseVersion/heldVersion, unchanged
  encoded_at:
  - src/http/read-case-version.routes.ts
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  how: 'this route is the HTTP surface the invariant presupposes: it presents v''s title, when_to_use,
    subject, fallback and consolidation_register exactly as v''s own stored record carries them, reading
    none of them through case-query''s whole-case assembly, on exactly the reading where validation-runs-at-every-read
    does not hold; the manifest and update-draft-accepting clauses are deferred to sibling tasks'
  encoded_at:
  - src/http/read-case-version.controller.ts
  - src/http/read-case-version.routes.ts
- node: domain/knowledge/case-version
  how: the route's response carries exactly the subset of the version's own declared attributes this task's
    own-record read publishes -- never version, state, manifest or authored_at, which CaseVersionAttributes
    already excludes
  encoded_at:
  - src/http/dto/read-case-version.dto.ts
inferences:
- inferred: the route's path segment is /declared-attributes, appended after /v1/cases/:slug/versions/:version
  from: the task's own Notes leave the route path to implementation; I followed the sibling case-input-requirements.routes.ts
    precedent of a kebab-case suffix, named after the specification's own vocabulary ("declared attributes")
- inferred: the 200 response body is flat -- title, when_to_use, subject, fallback, consolidation_register?
    -- with no wrapping envelope, no slug/version echo and no manifest/state field
  from: the task's Notes leave the DTO layout to implementation, and criterion 2 requires the body to
    carry the attributes exactly as the read answered them; flattened rather than nested, matching read-case.controller.ts's
    own precedent
- inferred: the new route reuses dependencies.readCase for its dependency bag instead of a new readCaseVersion
    field on BuildAppDependencies
  from: 'ReadCaseVersionControllerDependencies and ReadCaseControllerDependencies are both structurally
    { caseQuery: ICaseQuery }; adding a new required field would have broken src/__tests__/unit/http/build-app.spec.ts''s
    existing dependency-object literal, which this task may not edit'
preserved:
- read-case's own route still calls ICaseQuery.readCase, still throws CaseVersionNotValidError on a validator-rule
  failure, and still answers 409 for it -- untouched by this task
- every other entry in build-app.ts's routePluginFactories array, and every other field of BuildAppDependencies,
  is unchanged
- build-app.factory.ts's readDependencies and every other exported function in that file is unchanged
deferred:
- what: presenting or accepting an update-draft over the manifest, or over these same five attributes,
    on this reading
  why: the editing-surface rule's update-draft-accepting clause and the manifest surface belong to the
    update-draft act's own task and to the manifest-surface task, per this task's own Notes REMAINDER
    entries
- what: update-draft.controller.ts's second readCase() call throwing CaseVersionNotValidError from inside
    its own response path when the updated draft still fails validation
  why: out of this task's scope -- the inventory names it as a risk on update-draft.controller.ts, not
    on the route this task adds, and update-draft's own correction belongs to a different task
---

## What it is

A new HTTP route, GET /v1/cases/:slug/versions/:version/declared-attributes, separate from read-case's own route, that exposes CaseQueryService.readCaseVersion over HTTP: a well-formed request answers 200 with the draft's own stored title, when_to_use, subject, fallback and optional consolidation_register, no manifest; an unwritten slug/version answers 404 CaseNotFoundError; a malformed version segment answers 400 VALIDATION_ERROR.

## Notes

None.
