---
target: frontend
title: Proof that the manifest screen routes to the version's editor on every reading
summary: One test walks the manifest screen through all five readings its four phases distinguish -- pending,
  failed-to-complete, refused with CaseVersionNotValidError, answered draft, answered released -- and
  asserts the Edit version link's href is /cases/$slug/versions/$version, keyed to the screen's own path
  params, on each.
implementation: sha256:ece2199080bca5b482efc41a9e9503c4dc4b4d614b2a9b13f516f0cb35033dce
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-route-the-manifest-screen-to-the-version-editor-full
tests:
- file: src/routes/version-manifest-screen-editor-link.spec.ts
  name: renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest screen's
    own path version, while the read is still pending, once it has failed to complete, once it has been
    refused with CaseVersionNotValidError, once it has answered a draft version and once it has answered
    a released version
  proves: criteria 1 through 6 together -- while the read has not answered, where it did not complete,
    where it was refused with CaseVersionNotValidError, on a reading that answered a draft version, on
    a reading that answered a released version, and that the route's version number is the version number
    in the manifest screen's own path
  fails_when: CaseVersionEditorLink stops rendering in any of the four phases, its href stops being /cases/$slug/versions/$version,
    or the version threaded into it stops matching the manifest screen's own path version
  demonstrates: rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading
untested:
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name -- this task did not
  implement the refusal itself (computed upstream in use-manifest-builder), only honored it by keeping
  the route present on the not-valid phase's own presentation; the test above exercises that phase but
  the refusal's own correctness is proven elsewhere, not by this task's proof.
---

## What it is

One test, walking the manifest screen through five distinct readings inside one test body, asserting the Edit version link's href on each.

## Notes

run/draft-editor-correction-while-invalid-route-the-manifest-screen-to-the-version-editor-suite did not pass: `npm test` failed with 8 pre-existing assertion failures in capability-form-fields-output-schema-guidance.spec.ts, an unrelated file this task never touched, caused by a prior commit (f3d4778a) having removed that file's expected Output schema guidance paragraph -- routed to and closed by the separate corrective increment delivered at delivery/output-schema-guidance-test-mismatch-hotfix, after which this suite passed.

run/draft-editor-correction-while-invalid-route-the-manifest-screen-to-the-version-editor-suite-2 did not pass: `npm test` failed with a single `Test timed out in 5000ms` in version-manifest-screen-remove-refusal-telling.spec.ts, an unrelated file this task never touched; confirmed a pre-existing flake under full-suite parallel load by re-running that file alone, where it passed in 3.96s.
