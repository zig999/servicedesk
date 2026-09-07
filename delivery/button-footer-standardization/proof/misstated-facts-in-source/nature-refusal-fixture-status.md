---
title: Nature-refusal fixture status proof
summary: Tests confirming the capability detail outcome proof's stand-in refusal for a not-read-only nature carries HTTP 422, that no other stand-in under the frontend suite pairs CapabilityNotReadOnlyError with a different status, and that the two pre-existing refusal-message tests still hold the operator-facing distinction unchanged.
implementation: sha256:dee060e518fc0a22bb167f09434521223da7e476e213fff53be867f265283721
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/misstated-facts-in-source-nature-refusal-fixture-status-suite
tests:
- file: src/routes/capability-not-read-only-refusal-status.spec.ts
  name: responds with HTTP 422, the status the registry answers that refusal with
  proves: Criterion 1 — the stand-in refusal carrying CapabilityNotReadOnlyError in the capability detail surface's outcome proof responds with HTTP 422. It reads src/routes/capability-detail-screen-outcome.spec.ts's own content from disk rather than reconstructing a parallel literal, so a reversion in that file is what the test actually observes.
  fails_when: The errorResponse("CapabilityNotReadOnlyError", ...) call inside src/routes/capability-detail-screen-outcome.spec.ts carries any status other than 422, is duplicated with a conflicting value, or is removed from that file entirely.
- file: src/routes/capability-not-read-only-refusal-status.spec.ts
  name: finds every stand-in pairing CapabilityNotReadOnlyError with an HTTP status carrying 422
  proves: Criterion 2 — no stand-in in the frontend suite builds CapabilityNotReadOnlyError with a status other than 422. The criterion states a totality over the suite, so the test scans every file under src, excluding its own, for that exact pairing rather than asserting over a directory this task does not own.
  fails_when: Any file under src pairs CapabilityNotReadOnlyError with an errorResponse(code, status) call whose status literal is not 422, or no such stand-in is found anywhere — the empty-result case, which the test refuses to pass over via its own length assertion.
- file: src/routes/capability-detail-screen-outcome.spec.ts
  name: shows the registry's own distinguishable refusal message when the edit is refused
  proves: Half of criterion 3 — the refusal reaches the operator as a statement naming the read-only condition. Pre-existing and unchanged by this delivery; the test that already exists is what proves this half.
  fails_when: Saving with the PUT handler answering CapabilityNotReadOnlyError stops calling toast.error with the read-only-nature message.
- file: src/routes/capability-detail-screen-outcome.spec.ts
  name: falls back to a generic message for a refusal this surface does not recognise
  proves: The other half of criterion 3 — the read-only refusal is told apart from a refusal whose condition the surface does not recognise. Pre-existing and unchanged by this delivery.
  fails_when: An unrecognised refusal code stops falling back to the generic message, collapsing the distinction criterion 3 requires.
not_applicable:
- edge_case: Absent or empty input
  why: The task corrects a single literal HTTP status in a static test fixture; no user-supplied or empty input is read or produced by anything the criteria assert.
- edge_case: A boundary at each end of a stated range
  why: The status in question is one fixed value the specification states, not a bounded range with two ends to probe.
- edge_case: An operation against state that forbids it
  why: The fix touches a fixture literal, not a state machine or a guarded transition; no criterion here concerns what state a save is attempted against.
- edge_case: A dependency that fails or answers slowly
  why: apiFetch treats every non-2xx response identically regardless of which status or how quickly it arrived; the criteria concern only which literal status value a fixture carries, not timing or failure of a call.
- edge_case: Two operations against one subject at once
  why: The change is a single literal inside a single fixture; no concurrency-sensitive path is touched by any criterion this task states.
untested:
- A stand-in that produced this refusal's HTTP response without going through the shared errorResponse(code, status) calling convention already used throughout this codebase — constructing a Response object inline, or through a differently named helper — would not be caught by the totality scan's pattern, which matches only that one call shape.
- The totality scan is scoped to files under src, matching where every current occurrence of CapabilityNotReadOnlyError in this target actually lives; a stand-in added to a frontend test location outside that tree in the future is not reached by either new test.
---

## What it is
Two new tests over the one fixture the task names, and the two pre-existing tests that already hold the operator-facing distinction criterion 3 requires.

## Notes
Criterion 2 states a totality over the frontend suite, which no test that runs behaviour can establish: a stand-in carrying the wrong status is a fact about the text of files, not about what any screen does.
So the instrument is a static scan of the target's own sources, and the two limits of that instrument are named in `untested` rather than left for a reader to discover — the pattern matches one call shape, and the scan is scoped to the tree where every current occurrence actually lives.
The suite passed on its first run, 1249 tests over 189 files, with every step the registry declares.
