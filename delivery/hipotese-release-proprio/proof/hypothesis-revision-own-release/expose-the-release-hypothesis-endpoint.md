---
title: Release-hypothesis HTTP surface proof
summary: Integration tests dispatching real HTTP requests through the release-hypothesis route (standalone
  and via the built app) proving all six task criteria, its stated inferences, and the pre-existing
  build-app fixture repaired to compile again.
implementation: sha256:a1068fff041beca7a6b4b7b084c73f3678b2ee7ecb52455e8bf187ebfc2824fb
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-release-expose-the-release-hypothesis-endpoint-suite
tests:
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "releases a draft revision and answers 204 with a wholly empty body, calling releaseHypothesisRevision with exactly the path slug, name and revision"
    proves: "Criterion 2 — a well-formed request naming a draft-state revision is not refused, and the operation is invoked to release it."
    fails_when: "the route refuses (any status but 204), returns a non-empty body, or fails to call releaseHypothesisRevision with exactly the path's slug/name/revision triple."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "releases a draft revision and answers 204 with a wholly empty body, calling releaseHypothesisRevision with exactly the path slug, name and revision"
    proves: "The inferred path/field convention — the hypothesis-name segment is :name (matching list-hypothesis-revisions' own convention), not :hypothesis_name."
    fails_when: "the route were registered under a differently-named path segment (e.g. :hypothesis_name) — this exact URL would then 404 instead of reaching the dependency call the test asserts on."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "refuses with 409 and HypothesisRevisionNotDraftAtReleaseError's own code and message, carrying no details field at all, when the named revision is already released"
    proves: "Criterion 3 — a request naming an already-released revision answers HTTP 409 with error identity HypothesisRevisionNotDraftAtReleaseError and no further value."
    fails_when: "the status differs from 409, the error code differs from HypothesisRevisionNotDraftAtReleaseError, or the body carries any field beyond code and message (e.g. a details or context key)."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "calls releaseHypothesisRevision with only slug, name and revision — no case-version or manifest identifier — and succeeds even when naming a hypothesis no manifest has ever referenced"
    proves: "Criterion 4 — a request naming no case version and no manifest entry is not refused for their absence, and the route introduces no case-version/manifest lookup of its own."
    fails_when: "the request is refused for naming an unreferenced revision, or the call to releaseHypothesisRevision carries any argument beyond the three-element [slug, name, revision] tuple."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "ignores any request body sent, since the route declares no body schema and parses only its params"
    proves: "The inference that the route declares no body schema at all rather than an empty-object schema."
    fails_when: "a body schema were added that rejects an unrecognized field, or the payload were threaded into the dependency call."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "answers 400 with VALIDATION_ERROR naming the path and a non-empty details array, for a non-numeric revision segment, without ever reaching releaseHypothesisRevision"
    proves: "Criterion 5 (primary case) — a malformed path answers HTTP 400 with VALIDATION_ERROR, a message naming that the path failed, and a non-empty details list."
    fails_when: "the status differs from 400, the code differs from VALIDATION_ERROR, the message omits 'path', details is empty, or releaseHypothesisRevision is called despite the malformed segment."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: 'answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the route with an empty string param for this segment, and releaseHypothesisRevisionParamsSchema (z.string().min(1)) is what refuses it'
    proves: "Criterion 5, edge case — an absent/empty slug segment is refused with 400 rather than passed through or answered 404."
    fails_when: "the status is not 400 (e.g. a 404 route-not-found or a 500), or releaseHypothesisRevision is called with an empty slug."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: 'answers 400 via validation for a request with an empty :name segment, never 404 "route not found", since releaseHypothesisRevisionParamsSchema requires a non-empty name exactly as it requires a non-empty slug'
    proves: "Criterion 5, edge case — an absent/empty name segment is refused with 400."
    fails_when: "the status is not 400, or releaseHypothesisRevision is called with an empty name."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "answers 400 for a revision of zero, which fails releaseHypothesisRevisionParamsSchema's positive-integer requirement, without ever reaching releaseHypothesisRevision"
    proves: "Criterion 5, boundary case — the lower boundary of the revision schema (zero, the first non-positive integer) is refused with 400."
    fails_when: "revision 0 is accepted (status not 400), or releaseHypothesisRevision is called with 0."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "reaches the handler and answers a real 204 response, not a 401 or 403, for a request carrying no credential header at all"
    proves: "Criterion 6 — the route refuses no request for want of a credential."
    fails_when: "a request with no credential header is answered 401/403, or the handler/dependency is never reached for lack of one."
  - file: src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
    name: "answers the unchanged generic envelope, never a partial body or leaked detail, when releaseHypothesisRevision rejects with a generic, non-domain error"
    proves: "Edge case — a dependency failure with an untyped error is answered by the app's existing generic error handler, leaking no internal detail, matching every sibling route's own coverage of this path."
    fails_when: "the status differs from 500, or the response body contains the rejected error's own message text."
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: "reaches its own controller rather than answering 404, for the release-hypothesis-revision route"
    proves: "Criterion 1 — the route is registered on the built application (build-app.ts's route-plugin-factories array and BuildAppDependencies), reachable via buildApp with no further wiring beyond what this task's files supply."
    fails_when: "release-hypothesis-revision is not wired into routePluginFactories/BuildAppDependencies (the request answers 404), or the stub added for releaseHypothesisRevision no longer satisfies BuildAppDependencies (the file fails to typecheck)."
untested:
  - "build-app.factory.ts's lifecycleDependencies/buildAppDependencies — the real, database-backed assembly path that threads the live caseLifecycle.releaseHypothesisRevision into the controller's dependency — is proven only by TypeScript's structural typing (Pick<BuildAppDependencies, ...>), not by a dedicated unit or integration test. This is not a gap this task introduces: no sibling lifecycle dependency (release, discard, reviseHypothesis, placeHypothesis, removeHypothesis) has such a test in this codebase either — build-app.spec.ts always exercises routing through a hand-stubbed BuildAppDependencies, never through the real buildAppDependencies() factory, and no dedicated build-app.factory.spec.ts or case-lifecycle.factory.spec.ts exists to extend."
  - "The inference that releaseHypothesisRevision is placed inside the existing lifecycleDependencies helper rather than a new top-level helper function has no externally observable difference from the alternative — both produce an identical BuildAppDependencies value and an identical HTTP behavior — so no black-box test over the built app can discriminate between them. This is a code-organization choice this proof cannot exercise."
  - "Two requests racing to release the same hypothesis-revision concurrently: a route-level test with a mocked dependency cannot exercise real concurrency or locking behavior. Whatever guarantee exists there belongs to the underlying store/operation and is the sibling task's own proof (release-a-revision-directly.md), not this route wrapper's, since the route adds no concurrency handling of its own."
  - "constraints/no-route-enforces-authentication's second clause (the frontend disclosing this posture to every user, on every screen) is out of scope for this backend task, exactly as the task's own REMAINDER note states; no test here addresses it."
not_applicable:
  - edge_case: An empty-collection response
    why: this route never returns a collection — a successful call answers 204 with no body at all.
  - edge_case: A duplicate/uniqueness violation
    why: no uniqueness constraint exists at this route's own boundary; the only state conflict it can surface (already-released) is covered by the 409 test above.
  - edge_case: An upper boundary on the revision path segment
    why: releaseHypothesisRevisionParamsSchema declares only z.coerce.number().int().positive() with no configured ceiling, so no upper boundary exists to test.
  - edge_case: A slow-answering dependency
    why: the route awaits its single dependency call directly with no timeout logic of its own; any such behavior would be Fastify/Node's own default and is not something this task's files add or could falsify.
---

## What it is

Integration tests dispatching real HTTP requests through the release-hypothesis route (standalone and via the built app) prove all six task criteria; the pre-existing `build-app.spec.ts` fixture was repaired to typecheck against the widened `BuildAppDependencies`.

## Notes

None.
