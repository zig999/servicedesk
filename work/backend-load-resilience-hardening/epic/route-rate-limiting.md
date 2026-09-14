---
title: Rate limiting on the diagnosis and simulation routes
summary: The per-caller request limit the diagnose, simulate-case and simulate-hypothesis routes enforce,
  and the limiter idiom they enforce it with.
rationale: The scope handed two pieces of work; this epic is the one that answers a committed specification
  node about the HTTP route surface, kept apart from the pool tuning because the two change for different
  reasons and neither's delivery is shown by the other's.
sources:
- work/backend-load-resilience-hardening/intake/scope.md
covers:
- constraints/the-diagnosis-and-simulation-routes-are-rate-limited
- constraints/the-capability-identity-read-is-rate-limited
- constraints/no-route-enforces-authentication
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/diagnosis-answers-synchronously
- constraints/the-deadline-is-an-absolute-propagated-instant
- constraints/every-screen-discloses-that-authentication-is-unenforced
- constraints/listings-are-paged
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/the-concept-read-refuses-an-unanswered-concept
- constraints/the-openapi-document-is-fetched-by-the-backend
- constraints/consolidation-runs-behind-a-port
- constraints/judgment-runs-behind-a-port
- constraints/hypotheses-are-judged-in-isolated-parallel-calls
- constraints/evidence-normalization-is-an-anticorruption-layer
- constraints/the-consolidation-prompt-is-closed
- constraints/the-judgment-prompt-is-closed
- constraints/the-evidence-cache-admits-only-ok-results
- contracts/investigation/diagnosis
- contracts/investigation/case-simulation
- contracts/system/guided-diagnosis
- scenarios/investigation/a-draft-case-version-is-simulated
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
- scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
- scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
- scenarios/investigation/a-simulation-never-enters-the-cache
- scenarios/investigation/a-single-hypothesis-is-simulated
- scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
uncovered:
- node: constraints/the-capability-identity-read-is-rate-limited
  why: The 60-per-minute limiter already delivered on that route is the idiom this plan reads and mirrors;
    the plan changes neither that route's threshold nor its wiring, and its delivered refusal stands untouched.
- node: constraints/no-route-enforces-authentication
  why: The source address is the caller identity precisely because this constraint holds that nothing
    verifies a claimed one; no route in this plan gains, loses or invokes an authentication check.
- node: constraints/a-malformed-request-is-refused-with-a-validation-error
  why: The VALIDATION_ERROR refusal is already delivered on each of the three routes and this plan neither
    changes its shape nor adds a route that decides it anew.
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  why: A refusal past the limit is not a domain error the status map resolves, so the INTERNAL_ERROR fallback
    is left exactly as delivered.
- node: constraints/diagnosis-answers-synchronously
  why: Answering inside the request is the reason a limit is needed at all, and nothing in this plan queues,
    defers or polls for a diagnosis.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  why: Deadline recording and stage budgeting are untouched; a refused request never reaches the stage
    that records a deadline.
- node: constraints/every-screen-discloses-that-authentication-is-unenforced
  why: The disclosure is the frontend own, and this scope changes no frontend module.
- node: constraints/listings-are-paged
  why: No listing route is among the three this plan limits, and no paging behavior changes.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  why: That route's own refusal is delivered and this plan touches neither its handler nor its registry
    read.
- node: constraints/the-concept-read-refuses-an-unanswered-concept
  why: The concept read is not among the routes this plan limits and its refusal is unchanged.
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  why: The connector-configuration fetch path is a different surface this plan does not reach.
- node: constraints/consolidation-runs-behind-a-port
  why: The work a limited route drives is unchanged; the limiter refuses before the engine is entered
    and no port arrangement moves.
- node: constraints/judgment-runs-behind-a-port
  why: The work a limited route drives is unchanged; the limiter refuses before the engine is entered
    and no port arrangement moves.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  why: How judgment fans out is engine-internal and this plan changes nothing inside the run.
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  why: Collection and normalization are untouched; the limit sits at the route entry, not inside collection.
- node: constraints/the-consolidation-prompt-is-closed
  why: No prompt is read, written or widened by this plan.
- node: constraints/the-judgment-prompt-is-closed
  why: No prompt is read, written or widened by this plan.
- node: constraints/the-evidence-cache-admits-only-ok-results
  why: The cache's admission rule is engine-internal and a refused request writes nothing to it.
- node: contracts/investigation/diagnosis
  why: The operation's own request, response and freshness are delivered and unchanged; the plan adds
    a refusal ahead of the operation rather than altering what the operation answers.
- node: contracts/investigation/case-simulation
  why: Both simulate operations keep the request and response they already publish; only a pre-dispatch
    refusal is added ahead of them.
- node: contracts/system/guided-diagnosis
  why: What the system promises the attendant is unchanged; a caller within the limit is answered exactly
    as before.
- node: scenarios/investigation/a-draft-case-version-is-simulated
  why: The simulation behavior the scenario states is delivered and this plan changes no simulation outcome.
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  why: Staling a shown result is the frontend's behavior and no part of this backend plan reaches it.
- node: scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute
  why: The screen's presentation is the frontend's own and this scope changes no frontend module.
- node: scenarios/investigation/a-simulated-subject-omitting-a-required-attribute-degrades
  why: Degradation inside a simulation run is delivered and unchanged; a refused request never starts
    a run.
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  why: What a simulation writes is unchanged, and a request refused at the limit writes nothing at all.
- node: scenarios/investigation/a-single-hypothesis-is-simulated
  why: The narrowed run's own behavior is delivered and unchanged by a limit at the route's entry.
- node: scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
  why: Staling a shown result is the frontend's behavior and no part of this backend plan reaches it.
---
## What it is
The per-route, per-source-address request limit the diagnose, simulate-case and simulate-hypothesis routes must enforce, and the hook idiom that counts it.
It claims the route-surface slice of the impact set, of which one node is implemented and the rest are context this plan leaves standing.

## Notes
The delivered read-capability-by-identity limiter is the reference for the idiom, not a thing this epic rewrites.
The three routes carry a threshold different from that one's, so the counting shape and the thresholds are separate concerns within this epic.
