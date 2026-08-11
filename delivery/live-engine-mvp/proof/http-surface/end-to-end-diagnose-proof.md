---
title: End-to-end proof of the diagnose flow with faked LLM ports — test cases
summary: 'The two test cases inside diagnose-e2e.spec.ts, individually: the ordered write-then-respond
  assertion, and the static no-Anthropic-import scan paired with the deliberately-unset credential across
  the whole suite run.'
implementation: sha256:17b5aad928f7c03ba47aadd2bcb20455c054f0a6c84301b3799f13290b0c7bc7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/http-surface-end-to-end-diagnose-proof-suite
tests:
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: writes an investigation to the file-backed store for the request, readable back through createInvestigationStore,
    before asserting anything about the HTTP response — and the response then carries the fixture case's
    own resolved fallback assessment
  proves: criteria 1 and 4 together — the HTTP response carries the assessment, and the investigation
    was written and readable before that response assertion runs
  fails_when: the request does not write a readable investigation to the file-backed store, the written
    investigation's own assessment does not match the fixture case's resolved fallback, the read-back
    assertion is moved after the response assertion, or the HTTP response stops carrying that same assessment
- file: src/__tests__/integration/http/diagnose-e2e.spec.ts
  name: imports @anthropic-ai/sdk nowhere across every file this test's own composition reaches, so the
    run never made or could make a call to the Anthropic API
  proves: criteria 2 and 3 together — fakes stand behind both LLM ports so no Anthropic call is made,
    and no ANTHROPIC_API_KEY is needed, proven both by static scan and by running the whole suite with
    the credential deliberately deleted
  fails_when: any file the test's own composition reaches is rewired to import '@anthropic-ai/sdk'
not_applicable:
- edge_case: absent/empty narrative or subject with no attributes
  why: already proven at build-app.spec.ts's own criterion-6 edge-case tests; this task's scope is the
    whole-flow proof over valid input
- edge_case: two requests naming the same case, subject, narrative and requester
  why: already proven at diagnose-server.factory.spec.ts against the real production wiring; repeating
    it here against the faked-port wiring would prove the same fact about a different seam nobody asked
    this task to re-establish
- edge_case: a dependency that fails, times out, or answers slowly
  why: already proven at the unit level (evidence-collection-stage.spec.ts, judgment-stage.spec.ts); this
    task's objective is one successful synchronous run wiring the pieces together
- edge_case: a numeric boundary at either end of a stated range
  why: none of this task's four criteria state a range
- edge_case: an empty collection answered where one is expected
  why: the run does produce an empty narrowed-evidence array incidentally, but that is not itself a criterion
    this task states or independently asserts
untested:
- the confirmed-hypothesis path end to end through this exact faked-port wiring is not exercised — the
  deterministic choice (both hypotheses inconclusive, matching the fixture's own declared fallback) keeps
  the consolidator's fixture-key prediction tractable without pinning evidence bytes for a non-empty narrowed-evidence
  set; the confirmed path is exercised at the unit level elsewhere
- the exact bytes of the investigation's own evidence array are not asserted here — only the assessment
  is checked in the read-back document — since asserting them would require pinning now end to end through
  the whole HTTP-to-controller-to-runner path, which this composition does not expose a seam for; that
  shape is already proven at the unit level
---

## What it is

Two assertions inside the same test file: the ordered write-then-respond behavior, and the no-Anthropic-import, no-credential-needed guarantee.

## Notes

None.
