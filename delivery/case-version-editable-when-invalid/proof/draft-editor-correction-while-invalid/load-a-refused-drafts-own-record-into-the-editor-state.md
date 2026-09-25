---
target: frontend
title: Proof for loading a refused draft's own record into the editor state
summary: Hook-level tests against the public useEditDraftVersionForm, exercised directly via renderHook
  with a minimal router context provider, covering all 19 criteria and the specification nodes a finite
  test can decide whole within this task's own implemented scope.
implementation: sha256:5fb3657efb931435250cbe6eb8cd0a6605582039a9a95dfe4643a66c8827dfd7
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-correction-while-invalid-load-a-refused-drafts-own-record-into-the-editor-state-full-5
tests:
- file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
  name: calls read-case-version for the named draft and populates the form with exactly the title, when_to_use,
    subject, fallback and consolidation_register it answers
  proves: Criteria 1-8 -- on the reading where read-case refuses a named draft with CaseVersionNotValidError,
    the editor's state reads that version through read-case-version and carries an editable form whose
    title, when_to_use, subject, fallback outcome, fallback referral and consolidation_register are exactly
    what read-case-version answered
  fails_when: the hook stops calling GET .../declared-attributes for a draft read-case refused with CaseVersionNotValidError,
    or the resulting form's title, when_to_use, subject, fallback or consolidation_register stops matching
    exactly what that call answered
- file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
  name: leaves the form's consolidation_register unset when the draft's own record answers none
  proves: Criterion 9 -- where read-case-version answers no consolidation_register, the form holds no
    consolidation_register value
  fails_when: the form's consolidation_register carries any value when read-case-version's own record
    for the draft carries no consolidation_register field
- file: src/hooks/use-edit-draft-version-form-not-valid-load.spec.ts
  name: shows the named version's own title even where a different version of the same case carries a
    different one
  proves: Criterion 10 -- the form's content on this reading is the exact named version's own, never another
    version of the same case, even where another version's declared attributes differ
  fails_when: the form shows a title other than the exact named version's own read-case-version answer,
    or the hook ever reads a different version's declared-attributes endpoint
- file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
  name: resolves to phase not-valid for a draft read-case refuses with CaseVersionNotValidError, and to
    phase ready carrying no such mark once read-case answers the version
  proves: Criteria 11-12 -- the not-valid phase marks a version failing validation, distinct from the
    ready phase's shape a version that reads back cleanly carries
  fails_when: a draft refused for validation resolves under the ready phase's shape, or a cleanly-read
    version's state carries the not-valid mark
- file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
  name: 'reports exactly { phase: loading }, with no release, discard or update-draft offer, while read-case-version
    is still pending for a draft read-case refused'
  proves: Criterion 13, and UNDERDETERMINED entry 5 -- while read-case-version has not answered for a
    draft read-case refused, the state is exactly the bare loading phase, offering no release, discard
    or update-draft act
  fails_when: the state carries any field beyond phase while read-case-version's own read for the draft
    is still pending -- in particular a release or discard control appearing before the record has arrived
- file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
  name: resolves to exactly { phase, retryLoad }, carrying neither the refusal's error code nor its own
    message, when read-case-version fails for a draft read-case refused
  proves: Criterion 14, and UNDERDETERMINED entry 4 -- where read-case-version does not answer the version's
    record, the state is the load-error phase, disclosing neither the refusal's error code nor its message
  fails_when: the state carries any property beyond phase and retryLoad when read-case-version fails with
    a code this hook holds no presentation of its own for -- in particular the refusal's own error code
    or message
  demonstrates: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
- file: src/hooks/use-edit-draft-version-form-not-valid-marking.spec.ts
  name: resolves to the bare not-valid phase with no other field, never reading read-case-version, for
    a released version, and to a distinct load-error phase when the prerequisite read instead fails to
    complete
  proves: Criterion 15 -- where read-case refuses a released version with CaseVersionNotValidError, the
    state carries none of that version's declared attributes
  fails_when: the state for a released version failing validation carries any field beyond phase, read-case-version
    is ever called for it, or that state becomes indistinguishable from the state for a read that failed
    to complete
  demonstrates: rules/knowledge/a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case
- file: src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
  name: carries isBlocked -- false once the draft's own record has loaded and nothing has been edited
  proves: Criterion 16 -- on this reading of a draft whose form is unchanged, the state is not blocked
  fails_when: isBlocked is true immediately after the draft's own record has loaded and before any field
    has been edited or any save/conflict has occurred
- file: src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
  name: issues no PATCH request and navigates back to the entry the editor was opened from when onCancel
    is invoked
  proves: Criteria 17-18 -- cancelling a refused draft's edit issues no update-draft and returns the curator
    to the previous history entry
  fails_when: invoking onCancel issues a PATCH request, or fails to move the router's history back to
    the entry the editor was opened from
- file: src/hooks/use-edit-draft-version-form-not-valid-actions.spec.ts
  name: carries no release field on the not-valid phase, for a draft refused for validation or for a released
    version refused for validation alike
  proves: Criterion 19 -- the not-valid phase never offers release on this reading, so no release condition
    is ever stated as met, unmet or undecided without having been decided
  fails_when: a release field appears on the not-valid phase's state for either a draft or a released
    version refused for validation
not_applicable:
- edge_case: Two operations attempted against the same not-valid reading at once (e.g. cancel invoked
    twice, or cancel racing a background refetch).
  why: No mutation is wired on this reading at all (no onSubmit, no release, no discard), and onCancel
    is a pure, idempotent navigation call with no server-side effect to duplicate; no criterion here addresses
    concurrency
- edge_case: A malformed or absent version parameter (version === null) reaching this reading.
  why: Every one of the 19 criteria presupposes a named version read-case has already refused; the null-version
    case is pre-existing logic this task did not touch, and no criterion here names it
- edge_case: read-case-version answering a malformed or empty response body.
  why: apiFetch already funnels a failed or unparseable response through the same isError path the load-error
    test (criterion 14) exercises; no criterion distinguishes a malformed body from any other read-case-version
    failure
- edge_case: A dependency (declared-attributes, or the versions list) answering slowly, or the two racing
    each other.
  why: React Query dedupes by query key on one shared QueryClient; no criterion states behavior for concurrent
    identical reads, and the loading test already covers a slow dependency held pending
untested:
- rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  -- its own statement also requires the surface to accept an update-draft over these attributes on this
  same reading; the delivered hook offers no onSubmit at all on the not-valid phase -- per the task's
  own deferred list, submission is explicitly cut to the dependent tasks save-a-correction-on-the-refused-reading
  and offer-discard-on-the-refused-reading. No test here can decide this node whole without asserting
  a behavior the implementation deliberately does not carry.
- scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing -- its own then clause ends
  with the curator submits an update-draft correcting the title and it is accepted, the same unimplemented
  submission path; not decidable whole for the same reason as the editing-surface rule above.
- rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name -- states the backend
  read-case operation's own wire answer (HTTP 409, the message naming slug/version/failing rules); this
  frontend hook only ever consumes that answer through a mocked fetch, so no test here decides what the
  actual backend answers -- per the task's own Notes this belongs to the backend read-case refusal.
- rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record -- its own expression
  is scoped to a case version v created through create-draft, the interval between creation and that version's
  first read. This task's not-valid reading applies uniformly to any draft failing validation at any later
  read; a test confirming the bare-loading-then-populated-form shape is analogous evidence at best, never
  a decision of this node's own create-draft-scoped fact.
- rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives -- the same create-draft
  scoping gap as the node above -- its own withholding clause explicitly turns on which existing version
  the draft's manifest was copied from and the surface the creation was reached from, neither of which
  has any analog in a refused-validation reading of an already-existing draft.
- rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets -- its own
  met/unmet/undecided disclosure is never exercised on this reading, since the not-valid phase never offers
  release here (criterion 19 is satisfied vacuously); the node's actual disclosure behavior belongs, per
  the task's own Notes, to a release-offering surface that has read the draft's manifest and pinned revisions,
  which this task does not cover.
- rules/knowledge/an-abandoned-case-version-edit-writes-nothing -- its own fact requires returning the
  curator to the surface the editing was reached from, universally, whichever surface that is. This hook's
  cancel mechanism is router.history.back(), which the task's own UNDERDETERMINED entry already flags
  as not always equivalent to the true origin surface. The cancel test proves the literal mechanism (moves
  back one history entry, issues no write) but does not decide this node's universal claim, so it is not
  tagged as demonstrating this node.
- contracts/knowledge/case-query -- an api-contract identity naming every operation this whole context
  publishes; it spans an interface far broader than this task implements, and no single frontend hook
  test decides a contract's own published-operations identity.
- domain/knowledge/case-version -- the aggregate-root's full declaration spans attributes and operations
  well outside this task's reading; no finite test here decides the whole aggregate.
- constraints/a-successful-case-version-own-record-read-answers-with-http-200 -- its own stated fitness
  is a backend/integration test calling read-case-version over a live case version and asserting HTTP
  200. This frontend hook only ever consumes a mocked fetch, so no test here decides what the actual backend
  answers.
---

## What it is

Hook-level tests, exercised via renderHook against a minimal router context, covering all 19 of the task's criteria over the not-valid reading's load, marking and action behaviors.

## Notes

run/draft-editor-correction-while-invalid-load-a-refused-drafts-own-record-into-the-editor-state-full-2 did not pass: `npm test` failed with 2 pre-existing assertion failures in case-version-editor-screen-not-valid.spec.ts, caused by the implementation's new useCaseVersions(slug) call (added to tell a refused draft from a refused released version) hitting an endpoint case-version-editor-screen.test-support.ts's shared baseHandlers() had never needed to mock before this task -- fixed by adding a default GET /v1/cases/{slug}/versions handler there (answering the fixture's version as released, preserving every pre-existing not-valid.spec.ts assertion unchanged).
