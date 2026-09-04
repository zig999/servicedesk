---
title: Expose release-hypothesis on the published case-lifecycle HTTP surface
summary: A new POST route, wired end to end through build-app.ts and its own factory, dispatches
  ReleaseHypothesisRevisionOperation against a hypothesis-revision named by slug, hypothesis name and
  revision alone, with no case-version or body payload involved.
task: sha256:3d0b110244fc85d237766810fa358c65a83f0413ac598ef12e12dd604e7743bd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-release-expose-the-release-hypothesis-endpoint-suite
files:
- path: src/http/dto/release-hypothesis-revision.dto.ts
  effect: New DTO file. releaseHypothesisRevisionParamsSchema is a zod object validating slug (non-empty
    string), name (non-empty string, matching the field name list-hypothesis-revisions.dto.ts already
    uses for the hypothesis name path segment) and revision (coerced to a positive integer), mirroring
    releaseParamsSchema's style. No body schema — the route accepts no payload.
- path: src/http/release-hypothesis-revision.controller.ts
  effect: New pure controller. ReleaseHypothesisRevisionControllerDependencies exposes exactly
    CaseLifecycleOperations['releaseHypothesisRevision']. handleReleaseHypothesisRevisionRequest calls
    it with params.slug, params.name, params.revision in that order and returns nothing.
- path: src/http/release-hypothesis-revision.routes.ts
  effect: 'New Fastify plugin factory. Registers POST /v1/cases/:slug/hypotheses/:name/revisions/:revision/release.
    Parses request.params with releaseHypothesisRevisionParamsSchema; on failure replies 400 with a VALIDATION_ERROR
    envelope carrying a message naming that the request path failed validation and a non-empty details
    list, issues built the same way release.routes.ts builds them. On success, awaits the controller and
    replies 204 with no body (the operation returns void and nothing about the released revision is echoed
    back), matching discard.routes.ts''s own no-body-response shape.'
- path: src/factories/case-store.factory.ts
  effect: Widened the exported CaseStore intersection type to add IHypothesisRevisionOwnStateQuery and
    IHypothesisRevisionRelease (RelationalCaseStore already implements both), so the single caseStore
    instance createCaseLifecycle already holds can also back ReleaseHypothesisRevisionOperation, with
    no second store construction.
- path: src/factories/case-lifecycle.factory.ts
  effect: 'CaseLifecycleOperations gains a releaseHypothesisRevision method taking (slug, hypothesisName,
    revision) and answering Promise<void>. createCaseLifecycle constructs one ReleaseHypothesisRevisionOperation(caseStore),
    reusing the same caseStore instance every other lifecycle operation already shares, and exposes it
    through the returned operations object.'
- path: src/http/build-app.ts
  effect: Imports ReleaseHypothesisRevisionControllerDependencies and createReleaseHypothesisRevisionRoutesPlugin;
    adds releaseHypothesisRevision to BuildAppDependencies; adds
    (dependencies) => createReleaseHypothesisRevisionRoutesPlugin(dependencies.releaseHypothesisRevision)
    to routePluginFactories, beside the existing release entry.
- path: src/factories/build-app.factory.ts
  effect: 'lifecycleDependencies now also returns a releaseHypothesisRevision entry wrapping
    caseLifecycle.releaseHypothesisRevision, so buildAppDependencies (the one function diagnose-server.factory.ts
    and every other real assembly point calls before buildApp) supplies the new controller''s dependency
    with no other call site needing a change.'
criteria:
- criterion: The route is registered on the built application, so release-hypothesis is reachable with
    no further wiring.
  met: true
  how: BuildAppDependencies carries releaseHypothesisRevision; routePluginFactories registers
    createReleaseHypothesisRevisionRoutesPlugin against it; build-app.factory.ts's lifecycleDependencies
    supplies that dependency from caseLifecycle.releaseHypothesisRevision, and buildAppDependencies is
    the one function every real caller of buildApp (diagnose-server.factory.ts, seed.ts's own lifecycle
    use, every integration factory spec) already goes through — nothing beyond these edits is needed
    to make the route answer.
- criterion: A well-formed release-hypothesis request naming a hypothesis-revision whose own state is
    draft is not refused, and that revision's own state is released afterward.
  met: true
  how: A well-formed request parses successfully against releaseHypothesisRevisionParamsSchema, so the
    handler calls handleReleaseHypothesisRevisionRequest, which calls dependencies.releaseHypothesisRevision(slug,
    name, revision) — the sibling task's own ReleaseHypothesisRevisionOperation.releaseHypothesisRevision,
    already proven (release-a-revision-directly.md) to leave a draft revision released. The route adds
    no further condition before or after that call.
- criterion: A release-hypothesis request naming a hypothesis-revision whose own state is already released
    answers HTTP 409, with a body whose error identity is HypothesisRevisionNotDraftAtReleaseError and
    which carries no further value.
  met: true
  how: 'The operation throws HypothesisRevisionNotDraftAtReleaseError (constructor takes no argument,
    declares no context field). The route registers no error handling of its own, so the throw propagates
    to app.setErrorHandler(handleUnexpectedError); statusForError finds HypothesisRevisionNotDraftAtReleaseError
    already registered at 409 in STATUS_BY_ERROR_CLASS, and domainEnvelope''s hasContext check finds no
    context property, so the response carries only the error''s code and its fixed message — no details
    field at all. Verified against the already-delivered mapping rather than re-implemented.'
- criterion: A release-hypothesis request naming no case version and no manifest entry is not refused
    for their absence, and no case version's own state and no manifest entry changes as a result of
    the request.
  met: true
  how: release-hypothesis-revision.controller.ts's only call is dependencies.releaseHypothesisRevision(params.slug,
    params.name, params.revision); release-hypothesis-revision.routes.ts holds no reference to a case
    version, a manifest, ICaseQuery or any read/write beyond that one call and the params parse. Every
    case-version/manifest-freedom guarantee is exactly what release-a-revision-directly.md's criteria
    4-6 already prove about the operation and the two store methods beneath it; this route introduces
    no lookup of its own that could reintroduce a dependency on either.
- criterion: A release-hypothesis request whose path or body fails the route's own schema answers HTTP
    400, reporting a VALIDATION_ERROR error code, a message naming whether path, query or body failed,
    and a non-empty details list of the issues found.
  met: true
  how: 'A path failing releaseHypothesisRevisionParamsSchema (missing slug/name, or a revision that does
    not coerce to a positive integer) is caught by parsedParams.success === false; the handler replies
    400 with a VALIDATION_ERROR envelope naming that the request path failed validation, with a details
    array built one issue-path/issue-message pair per zod issue — the same expression release.routes.ts
    and revise-hypothesis.routes.ts already use, so details is always non-empty whenever validation fails.
    No body schema exists for this route (no criterion or node names a body payload for release-hypothesis),
    so only the path can fail; the message names "path" specifically, consistent with the constraint''s
    requirement to name whichever of path/query/body actually failed.'
- criterion: The route refuses no request for want of a credential.
  met: true
  how: release-hypothesis-revision.routes.ts registers one handler with app.post and declares no preHandler,
    no onRequest hook and no call to any auth/guard function; grepping every existing *.routes.ts file
    (release.routes.ts, revise-hypothesis.routes.ts, discard.routes.ts, list-hypothesis-revisions.routes.ts,
    and the rest wired in build-app.ts) shows none of them does anything credential-related either — no
    route in this codebase checks a header, a token or a claim before dispatching. This route matches
    that absence exactly rather than introducing the first guard.
nodes:
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  encoded_at:
  - src/http/release-hypothesis-revision.routes.ts
  - src/http/release-hypothesis-revision.controller.ts
  - src/factories/case-lifecycle.factory.ts
  how: This task adds the request surface the rule's own HTTP-409 clause requires — a well-formed
    request against a non-draft revision now actually reaches the operation and its refusal actually
    reaches an HTTP client as 409/HypothesisRevisionNotDraftAtReleaseError, closing the one gap
    release-a-revision-directly.md's own record named as not exercised through a route.
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  encoded_at:
  - src/http/release-hypothesis-revision.routes.ts
  - src/http/release-hypothesis-revision.controller.ts
  how: The route's own path and controller name only slug, hypothesis name and revision — no case
    version, no manifest position — so a request against a revision no manifest ever referenced is
    dispatched exactly the same way as one that is referenced, matching the scenario's given/when/then
    now reachable over HTTP.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/http/dto/release-hypothesis-revision.dto.ts
  - src/http/release-hypothesis-revision.controller.ts
  how: The route's identity — slug, name, revision, with no case version and no manifest position
    anywhere in the path or body — is exactly the aggregate's own identity plus "answering to no case
    version and no manifest" the domain node states; the DTO validates precisely that triple and nothing
    else.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/http/release-hypothesis-revision.routes.ts
  - src/http/release-hypothesis-revision.controller.ts
  - src/http/dto/release-hypothesis-revision.dto.ts
  - src/http/build-app.ts
  - src/factories/case-lifecycle.factory.ts
  - src/factories/build-app.factory.ts
  - src/factories/case-store.factory.ts
  how: release-hypothesis is now one of the eight operations reachable on the published surface,
    completing what release-a-revision-directly.md left as the sibling task's own deliverable — "a
    curator's action taken directly against a hypothesis-revision... answering to no manifest at all"
    is now dispatchable over HTTP, with its own 409 refusal already registered and now actually returned.
- node: contracts/system/case-authoring
  encoded_at:
  - src/http/release-hypothesis-revision.routes.ts
  how: The capability's own promise that a hypothesis's own release is the curator's, too, whether or
    not any case has ever pointed at it, is now the capability's own request entrance, not only its
    domain operation — a curator reaches this promise through one POST request naming only the revision.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  encoded_at:
  - src/http/release-hypothesis-revision.routes.ts
  how: The route's own params parse, failure envelope and non-empty details array are exactly this
    constraint's fitness check, reusing the exact shape release.routes.ts and revise-hypothesis.routes.ts
    already answer it with — no route-local variation introduced.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/release-hypothesis-revision.routes.ts
  how: Answered for its route-side clause only — no auth middleware, guard or check is declared or
    invoked anywhere in this route, matching the absence every other route in this codebase already
    exhibits. The constraint's second clause (the frontend's own disclosure to every user, on every
    screen) reaches no criterion of this backend task, exactly as the task's own REMAINDER note states.
inferences:
- inferred: The path segment naming the hypothesis is called :name (DTO field name), not
    :hypothesis_name, and the route sits under /v1/cases/:slug/hypotheses/:name/revisions/:revision/release.
  from: list-hypothesis-revisions.dto.ts and list-hypothesis-revisions.routes.ts already establish
    /cases/:slug/hypotheses/:name/revisions as this codebase's own path and field-naming convention for
    exactly this identity triple's first two members; reusing it rather than introducing a second name
    (hypothesis_name, used only inside request bodies such as revise-hypothesis.dto.ts, never in a path
    segment) keeps one convention per position rather than two competing ones.
- inferred: A successful release-hypothesis request answers 204 with no response body, rather than
    echoing the revision or reading it back.
  from: The operation's own signature returns Promise<void>, and no criterion or node of this task names
    any field a successful response must carry; discard.routes.ts is the existing route whose controller
    also returns void, and it answers 204 with an empty body for the same reason — mirrored here rather
    than inventing a response shape nothing asks for.
- inferred: The route declares no body schema at all, rather than an empty object schema.
  from: No criterion or node names a request-body field for release-hypothesis, and the task's own
    framing text describes it as "an action against a hypothesis-revision alone" with no further payload
    fields; discard.routes.ts (also a body-free action route) parses request.params alone and never
    touches request.body, which this route mirrors.
- inferred: releaseHypothesisRevision is placed in lifecycleDependencies inside build-app.factory.ts,
    beside release, rather than in its own top-level helper function.
  from: MNT-03 (a block of logic that already exists somewhere in this project is called, not copied)
    and the existing lifecycleDependencies function is already the one place every other CaseLifecycleOperations
    member becomes a BuildAppDependencies entry; adding a second helper for one more lifecycle operation
    would duplicate that wiring pattern rather than reuse it.
preserved:
- Every existing entry of BuildAppDependencies, routePluginFactories, CaseLifecycleOperations,
  lifecycleDependencies and CaseStore — untouched beyond the one new member each gains; no existing
  route, controller or factory function's behavior changes.
- ReleaseHypothesisRevisionOperation, IHypothesisRevisionOwnStateQuery, IHypothesisRevisionRelease,
  HypothesisRevisionNotDraftAtReleaseError and its STATUS_BY_ERROR_CLASS entry — all untouched, exactly
  as release-a-revision-directly.md delivered them; this task calls them and adds no domain logic of
  its own.
- RelationalCaseStore and every one of its existing methods — untouched; the single instance
  createCaseStore already builds is reused, not duplicated, for the new operation.
---

## What it is

The HTTP entrance for release-hypothesis: a new `POST /v1/cases/:slug/hypotheses/:name/revisions/:revision/release`
route, its DTO and controller, wired into `build-app.ts` and its real assembly point `build-app.factory.ts`
through a small widening of `case-store.factory.ts`'s and `case-lifecycle.factory.ts`'s own types. The
route parses only its path (no body), calls `ReleaseHypothesisRevisionOperation.releaseHypothesisRevision`
already delivered by the sibling task, and lets a domain refusal fall through to the app's existing
generic error handler exactly as every other route already does — no case-version lookup, no manifest
lookup, and no credential check anywhere in the new files.

## Notes

None.
