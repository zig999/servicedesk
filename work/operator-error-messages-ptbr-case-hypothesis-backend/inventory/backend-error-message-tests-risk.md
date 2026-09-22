---
title: Where tests assert on literal error message text
summary: A targeted check of src/src/__tests__ for hard-coded English message assertions
  that a PT-br translation would break.
sources:
- /home/siegfriedneto/projects/servicedeskn1/work/operator-error-messages-ptbr-case-hypothesis-backend/intake/scope.md
area:
- /home/siegfriedneto/projects/servicedeskn1/src/src/__tests__
risks:
- risk: HypothesisRevisionNotDraftAtReleaseError — one of the 19 named case/hypothesis
    errors — has a test that hard-codes the full English message as a FIXED_MESSAGE
    constant and asserts error.message equals it verbatim; translating this class
    message to PT-br will fail this test unless the constant is updated in the same
    change.
  consumers:
  - src/src/__tests__/unit/errors/hypothesis-revision-not-draft-at-release.error.spec.ts
- risk: HTTP route-level tests for the case/hypothesis errors (release/revise-hypothesis
    routes) assert response.json() equals an envelope built from error.message where
    error is constructed by the test itself in the same test — safe against translation,
    but confirm the envelope's message field is asserted on directly.
  consumers:
  - src/src/__tests__/unit/http/release-hypothesis-revision.routes.spec.ts
  - src/src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
---
## What it is
Only one test in the tree pins a literal English message for a scoped error class (HypothesisRevisionNotDraftAtReleaseError); the other 18 named case/hypothesis error classes have no dedicated errors/*.spec.ts file and no other test in src/src/__tests__ was found asserting their literal message text.
Route-level tests that touch case/hypothesis errors (release-hypothesis-revision, revise-hypothesis) derive their expected envelope from error.message on a locally-constructed instance of the same class, so they do not pin English text independently of the class itself.

## Notes
None.
