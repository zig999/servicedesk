---
title: Proof for seeding New Draft's blank form from the case's latest released version
summary: Nine new tests across two spec files prove the four criteria of task/version-editor/seed-new-draft-from-latest-released
  and the delivery's own disclosed inferences (highest-numbered released version, no premature blank-form
  flash), plus a required compatibility fix -- a default "no released version" GET .../versions response
  added to new-case-draft-screen.test-support.ts's own baseHandlers(), and two pre-existing new-case-draft-screen-conflict.spec.ts
  fixtures updated to also answer the seeding read the widened hook now issues unconditionally on mount
  -- without which the pre-existing NewCaseDraftScreen suite (written for new-draft-creation, not touched
  by this task's own implementation record) would fail under the widened hook.
implementation: sha256:21e99c74256dfb2aaa48a588b73a4f54776d868fae88b540bd2ffda0dfada713
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/version-editor-seed-new-draft-from-latest-released-suite-2
tests:
- file: src/routes/new-case-draft-screen-seed.spec.ts
  name: pre-populates title, when_to_use, subject, fallback outcome/referral and consolidation register
    from the case's own latest released version, read via GET /v1/cases/{slug}/versions/{version}
  proves: Opening "New draft" on a case whose versions include at least one released version pre-populates
    the form's title, when_to_use, subject, fallback outcome/referral and consolidation_register fields
    from that case's latest released version, read via GET /v1/cases/{slug}/versions/{version}.
  fails_when: the form renders blank, renders a different value than the released version's own record
    for any of the five fields, or the version's own record is read from any endpoint other than GET /v1/cases/{slug}/versions/{version}
- file: src/routes/new-case-draft-screen-seed.spec.ts
  name: treats the case's own latest released version as the highest-numbered released entry, not the
    last entry the version list names nor a higher-numbered draft
  proves: the implementation's own disclosed inference that "the case's own latest released version" is
    the highest-numbered entry among the case's version list carrying state "released" -- not the last
    entry in list order, and not a higher-numbered entry that is still a draft
  fails_when: the hook seeds from the first released entry in list order, from the highest-numbered entry
    regardless of state, or from any version other than the highest-numbered released one
- file: src/routes/new-case-draft-screen-seed.spec.ts
  name: leaves the form blank with the subject pre-set from the glossary and shows first-version copy
    when the case's version history holds no released version
  proves: Opening "New draft" on a case with no released version yet leaves the form exactly as new-draft-creation
    already renders it -- blank, subject pre-set to the one glossary value -- with copy stating this is
    the case's first version.
  fails_when: the title/when_to_use fields render pre-populated, the subject field is not pre-set from
    the glossary, or the "This is the case's first version." copy is absent for a case whose version history
    holds versions but none released
- file: src/routes/new-case-draft-screen-seed.spec.ts
  name: keeps the loading placeholder shown while the case's own latest released version is still being
    read, rather than flashing the blank form first
  proves: the implementation's own disclosed inference that the blank form must not render before it is
    known whether a released version exists to seed it from, and (once one is found) before that version's
    own record has loaded
  fails_when: the blank, unseeded form (or its Title field) becomes visible before the pending GET of
    the found released version's own record has resolved
- file: src/routes/new-case-draft-screen-seed.spec.ts
  name: shows the load-error phase with a retry action when reading the case's own version list fails
  proves: the widened loading/error gate described in the implementation's own files entry for use-new-draft-version-form.ts
    ("Loading/error gating ... widened to also cover the version-list read"), exercising the edge case
    of a failing dependency
  fails_when: the screen gets stuck loading indefinitely, throws, or reaches the "ready" phase instead
    of "load-error" when GET /v1/cases/{slug}/versions fails, or Retry issues no further request
- file: src/routes/new-case-draft-screen-seed.spec.ts
  name: shows the load-error phase when reading the found released version's own record fails
  proves: the same widened gate's other half ("and, once one is found, the source-version read"), exercising
    the edge case of a failing dependency once a released version has been located
  fails_when: the screen gets stuck loading indefinitely, throws, or reaches the "ready" phase instead
    of "load-error" when GET /v1/cases/{slug}/versions/{version} fails for the found released version
- file: src/routes/new-case-draft-screen-seed-post.spec.ts
  name: issues POST /v1/cases with consolidation_register and source_version set to the released version's
    own number when Save is clicked on a form seeded from it
  proves: Clicking Save on a form pre-populated from a released version issues POST /v1/cases with a body
    that additionally includes consolidation_register and source_version set to that released version's
    own version number.
  fails_when: the POST body omits consolidation_register or source_version, sets source_version to any
    number other than the seeded released version's own number, or carries any field other than the five
    new-draft-creation already sent plus these two
- file: src/routes/new-case-draft-screen-seed-post.spec.ts
  name: omits consolidation_register from the POST body, while still sending source_version, when the
    seeded released version itself carries no consolidation_register
  proves: the edge case of an optional field the seeded source record does not itself carry, over the
    same criterion 3 body-widening behavior
  fails_when: the POST body carries a consolidation_register key (even null) when the source record held
    none, or omits source_version in this same case
- file: src/routes/new-case-draft-screen-seed-post.spec.ts
  name: issues POST /v1/cases with a body carrying neither consolidation_register nor source_version when
    Save is clicked on a first-ever draft's blank form
  proves: Clicking Save on a first-ever draft's blank form issues POST /v1/cases with a body that includes
    neither consolidation_register nor source_version, exactly as new-draft-creation's own POST does today.
  fails_when: the POST body carries a consolidation_register or source_version key for a case whose version
    history holds versions but none released, or otherwise differs from new-draft-creation's own five-field
    body
not_applicable:
- edge_case: a 404 specifically (rather than any other failure) on the found released version's own record
    read, distinguishing a version removed between the list read and the detail read
  why: use-new-draft-version-form.ts's own code treats every failure of that read identically through
    isVersionSourceError -- unlike edit-draft-version's own 404-redirects-to-Cases-List branch for its
    own version read, no branch here singles out a 404 -- so the generic "source-version-record read fails"
    test already exercises the resulting behavior; a 404-specific variant would assert the same code path
    twice under different fixture noise.
- edge_case: two case-version entries sharing one version number
  why: domain/knowledge/case's own next_version guarantee makes version numbers monotonic and never reused
    -- a duplicate would be a backend defect this frontend consumes the guarantee of rather than re-validates,
    and no criterion of this task asks it to guard against one.
- edge_case: a bounded numeric range for a version number (an upper or lower limit)
  why: case-version numbers are monotonic domain identifiers with no stated range this screen enforces
    or bounds; there is no boundary for a test to sit at either end of.
- edge_case: two operations against one subject at once (double-clicking Save on the seeded form)
  why: the concurrency guard (isSubmittingRef) is unchanged by this task, already proven by new-case-draft-screen-save.spec.ts's
    own pre-existing "issues exactly one POST when Save is clicked twice" test, and this task's own widening
    only adds two fields inside the same mutationFn that guard already wraps.
- edge_case: whether a case's subject type may be changed once a draft already exists, once seeded from
    a released version's own subject
  why: the task's own Notes state this stays exactly as undecided as the onda-7 scope found it, and no
    criterion of this task asserts either answer -- a test here would assert a guess the plan's own blind
    judge deliberately declined to make, per the implementation's own matching deferred entry.
untested:
- a seeded fallback outcome/referral value that no longer exists in the current glossary vocabulary (drifted
  between when the released version was authored and when the new draft is opened) -- resetFormFrom still
  carries that value into react-hook-form's own state and the widened POST would still send it, but no
  test here exercises the Select rendering no matching label for it; the mechanism is the same one case-version-editor-screen.spec.ts
  already proves for consolidation_register's own "Not set" fallback, but not for fallback outcome/action/recipient
  specifically
- a load-error phase actually recovering into the seeded "ready" phase after Retry succeeds on a second
  attempt -- the two retry tests here only prove Retry re-issues the failed request, not that a subsequent
  success completes the seeding flow
- editing a seeded field before clicking Save still carries the correct source_version and the current
  (possibly re-edited) consolidation_register alongside it -- proven only for the unedited, immediately-saved
  case and for the case where the source record itself carries no consolidation_register
divergences:
- from: new-case-draft-screen.test-support.ts and new-case-draft-screen-conflict.spec.ts as new-draft-creation
    delivered them
  departure: baseHandlers() now answers GET /v1/cases/{slug}/versions with an empty list by default (overridable),
    and two of new-case-draft-screen-conflict.spec.ts's own pre-existing tests gained an added mock handler
    for GET /v1/cases/{slug}/versions/{version} on the released version their own fixture already names.
  why: 'use-new-draft-version-form.ts now issues GET /v1/cases/{slug}/versions unconditionally on every
    mount to find the case''s own latest released version, and reads that version''s own record once one
    is found -- so every existing test that renders NewCaseDraftScreen needs an answer for these calls
    to reach any phase other than perpetual loading, whether or not that test''s own purpose concerns
    seeding. No assertion in either file changed: this only supplies the mock responses the widened, mandatory
    network calls need to resolve, the same way baseHandlers() already answers the glossary endpoints
    new-draft-creation''s own hook always calls.'
---

## What it is
The tests proving task/version-editor/seed-new-draft-from-latest-released's four criteria, against its own implementation record.

## Notes
run/version-editor-seed-new-draft-from-latest-released-suite failed at its `test` step with 33 failures, none in a file this delivery's own implementation or tests name; a failure-diagnostician read that run's own output and returned `cause: setup` for all 33, tracing the identical stack trace across every failure into frontend/tui/frontend's own separately-installed React (a version mismatch between frontend/app/package-lock.json, pinning react@19.2.8, and frontend/tui/frontend/package-lock.json, pinning react@19.2.7 -- the exact duplicate-React failure mode vite.config.ts's own comment documents), not to anything this task wrote; the rerun this same diagnosis authorizes, run/version-editor-seed-new-draft-from-latest-released-suite-2, passed all 317 tests with no code or test changed in between.
