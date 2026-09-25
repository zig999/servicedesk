---
target: backend
title: Proof — update-draft answers from the draft's own stored record
summary: Integration tests against a real Postgres-backed store prove the manifest-empty-draft acceptance
  and write/answer shape criteria, and unit tests prove the controller's DTO-mapping and its acceptance
  of a glossary-absent submitted subject, while the pre-existing refusal/validation coverage was kept
  valid under the renamed readCaseVersion dependency.
implementation: sha256:aeca4b98cb77055eb28bc6687c66a86d27fac569756b8f6f2ca531434e78d5e3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/draft-correction-while-invalid-answer-update-draft-from-the-drafts-own-record-full-2
tests:
- file: src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
  name: accepts a well-formed update-draft over a draft whose manifest holds no entry, answering HTTP
    200, and the store then holds the submitted title
  proves: Criteria 1 (a well-formed update-draft over a draft whose manifest holds no entry is answered
    HTTP 200) and 2 (after that update-draft, the draft's own stored record carries the submitted title),
    against a real, freshly-created manifest-empty draft and a real store read taken independently of
    the HTTP response
  fails_when: the response status is not 200 for a manifest-empty draft, or the store's own record (read
    independently via store.assembleVersion after the HTTP call) does not carry the submitted title
- file: src/__tests__/integration/http/update-draft-answers-from-the-drafts-own-record.routes.spec.ts
  name: the 200 answer's body carries the stored record's own declared attributes exactly, carrying no
    manifest entry and no consolidation_register defaulted in place of the one the write left absent
  proves: Criteria 3 (the 200 answer carries the declared attributes the draft's own stored record carries
    after the write) and 4 (the 200 answer carries no manifest entry), and the task's own UNDERDETERMINED
    entry -- that a consolidation_register omitted from the submission and absent from the stored record
    is never filled with an adapter default or a prior version's register
  fails_when: the response body, compared by strict equality against the independently-read stored record's
    own four present attributes, differs in any field, carries a manifest key, or carries a consolidation_register
    key where the stored record and the submission both left it absent
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: answers 200 with the body built from caseQuery.readCaseVersion's own stored-record read, dropping
    none of its five declared attributes and carrying no manifest field
  proves: Criteria 3 and 4 at the controller's own wiring level -- that update-draft's answer is built
    exclusively from caseQuery.readCaseVersion's returned attributes (never a manifest, never any field
    caseQuery.readCase would have carried), and that the write (caseStore.updateDraft) and the read (caseQuery.readCaseVersion)
    each receive the correct slug and version
  fails_when: the response status or body stops matching the five-or-fewer-key shape readCaseVersion answered,
    or the controller stops forwarding the submitted body to updateDraft or the correct slug/version to
    readCaseVersion
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: answers 200 for a well-formed update-draft whose submitted subject names a subject type the glossary
    does not hold, since this route never checks glossary coherence
  proves: 'Criterion 5 (a well-formed update-draft whose submitted subject names a subject type the glossary
    does not hold, over a draft, is answered HTTP 200). Tested at the controller level because case_versions.subject
    carries a NOT NULL FOREIGN KEY to subject_types(name): a real Postgres-backed write of an unregistered
    subject would be refused by the database itself before any answer could be built, so this obligation
    is decidable only by proving the controller never gates its answer on caseQuery.readCaseVersion''s
    own coherence (which case-query.service.ts''s readCaseVersion structurally never calls)'
  fails_when: the response stops answering 200 when caseQuery.readCaseVersion (mocked, as any real implementation
    of it would) answers attributes carrying a subject the glossary does not hold
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: refuses with the status the status map assigns CaseVersionNotDraftError, and never reads the version
    back, when the named version is not draft
  proves: the pre-write refusal over a released version, preserved unchanged by this task, continues to
    answer 409 with the error's own details and never reaches the (renamed) readCaseVersion call
  fails_when: the refusal status, code or details change, or readCaseVersion is invoked despite the write
    having been refused
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: refuses with the status the status map assigns CaseNotFoundError, and never reads the version
    back, when no version answers the named slug and version
  proves: the pre-write refusal over an unknown slug/version, preserved unchanged by this task, continues
    to answer 404 with the error's own details and never reaches readCaseVersion
  fails_when: the refusal status, code or details change, or readCaseVersion is invoked despite the write
    having been refused
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: answers 400 for a body missing a required attribute, without ever reaching caseStore.updateDraft
  proves: body validation, unchanged by this task, still refuses before any write is attempted
  fails_when: a body missing a required attribute stops being refused with 400, or updateDraft is called
    despite the missing attribute
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: names VALIDATION_ERROR, the body as the part that failed, and a non-empty details list, on that
    same missing-attribute refusal
  proves: the validation refusal's envelope shape (code, message naming the body, non-empty details),
    unchanged by this task
  fails_when: the envelope's code, message or details list stop matching that shape
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: answers 400 for a non-numeric version segment, without ever reaching caseStore.updateDraft
  proves: path validation on the version segment, unchanged by this task, still refuses before any write
  fails_when: a non-numeric version segment stops being refused with 400, or updateDraft is called despite
    it
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: answers 400 via validation for a request with an empty version segment, without ever reaching
    caseStore.updateDraft
  proves: path validation's boundary at an empty version segment, unchanged by this task
  fails_when: an empty version segment stops being refused with 400, or updateDraft is called despite
    it
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: succeeds when consolidation_register is omitted from the body entirely, calling updateDraft with
    it absent rather than defaulted to some value
  proves: the pre-existing, unchanged request-forwarding behavior that an omitted consolidation_register
    reaches caseStore.updateDraft as absent, never defaulted
  fails_when: updateDraft is called with a consolidation_register key present after the submission omitted
    it
- file: src/__tests__/unit/http/update-draft.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body or leaked detail, when updateDraft
    rejects with a generic, non-domain error
  proves: the unchanged fallback to a generic 500 envelope for a non-domain error, and that readCaseVersion
    is never reached when the write itself failed
  fails_when: a generic write failure stops answering the fixed INTERNAL_ERROR envelope, or leaks detail,
    or readCaseVersion is invoked despite the write having failed
not_applicable:
- edge_case: concurrent update-draft requests against the same draft version
  why: no criterion or node this task implements addresses concurrency; the write path (caseStore.updateDraft)
    is preserved unchanged by this task, and its own concurrency behavior is not this task's claim
- edge_case: a submitted body's when_to_use, or a fallback outcome/action/recipient, naming a glossary-absent
    term (rather than the subject)
  why: the task's own criterion 5 names only the submitted subject; no criterion or node here names any
    other attribute for this behavior, and the mechanism (readCaseVersion consults no coherence check
    regardless of which field would have failed it) is a structural fact of the code, not a claim this
    task's stated criteria ask a test to enumerate per field
- edge_case: a draft failing more than one validator rule at once (e.g. both a manifest-empty and a glossary-absent-subject
    condition simultaneously)
  why: the obligation (accepted regardless of which rule, or how many, are failing) does not vary with
    how many rules are failing at once; this dimension does not alter what any criterion or node requires,
    so it does not multiply the test set
untested:
- rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes -- its
  expression is universally quantified over 'whichever validator rule is failing', an open set no node
  enumerates closed; no finite test decides that quantifier whole. The task's own two representative instances
  (a manifest-empty draft, and a submitted subject the glossary does not hold) are each tested by name
  above, but a test over those two instances asserts only part of the node's claim as though it were the
  whole, which the framework here refuses to certify as `demonstrates`.
- rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  -- this node's fact spans both the surface's presentation (frontend) and update-draft's acceptance (backend);
  this task's own Notes place the presentation half outside this backend delivery (REMAINDER, belongs
  to the editing-surface frontend task). No test in this backend proof can exercise the presentation half,
  so no test here decides this node whole.
- domain/knowledge/case-version -- an aggregate-root node describing the whole CaseVersion entity across
  many operations (collection-plan, requires-evaluation-of, resolve-outcome, place-hypothesis, remove-hypothesis,
  update-draft, release, discard); this task touches only the 'own declared attributes may be corrected
  while in draft' facet through update-draft's answer path. No finite test decides the entire aggregate
  node whole.
- scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing -- its then-steps include two
  surface-facing assertions (the surface states the version does not read back as a case; the surface
  presents the stored attributes) this task's own Notes mark ADVISORY and defer to the editing-surface
  frontend task. The integration tests above exercise only the scenario's curator-submits-and-it-is-accepted
  then-step, which is part of the scenario, not its whole; per the framework's own rule, a test exercising
  a node only in part demonstrates nothing, so no test here claims this node.
---

## What it is

Two new integration tests over a real manifest-empty draft prove acceptance and the answer's own shape; unit tests prove the controller's readCaseVersion-based wiring and the glossary-absent-subject acceptance; the pre-existing spec's stale readCase-based assertions were rewritten to match the new behavior, and its refusal/validation coverage was kept unchanged.

## Notes

None.
