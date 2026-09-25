---
target: backend
title: update-draft answers from the draft's own stored record
summary: update-draft.controller.ts now builds its 200 answer from caseQuery.readCaseVersion's own stored-record
  read instead of caseQuery.readCase's whole-case, validated read, so a write that leaves the draft failing
  validation is still accepted and answered.
task: sha256:712631db1ff3427a770ef974d2709fd6d13b75b93ed89216c5a0394e4ca19d6f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/draft-correction-while-invalid-answer-update-draft-from-the-drafts-own-record-full-2
files:
- path: src/http/update-draft.controller.ts
  effect: replaced the post-write answer path -- dropped the caseQuery.readCase() call and toReadCaseResponse
    import, added caseQuery.readCaseVersion() and toReadCaseVersionResponse (reused from read-case-version.controller.ts)
    -- and changed the handler's return type from ReadCaseResponseDto to ReadCaseVersionResponseDto; the
    store write (caseStore.updateDraft) and its pre-write refusals are untouched
criteria:
- criterion: A well-formed update-draft over a draft whose manifest holds no entry is answered HTTP 200.
  met: true
  how: the answer path no longer calls readCase, which is the only source of a manifest-emptiness (or
    any coherence) refusal on this route; readCaseVersion reads the stored record via store.assembleVersion
    with no coherence check, so a manifest-empty draft's update-draft reaches the route's unconditional
    reply.code(200) in update-draft.routes.ts
- criterion: After that update-draft, the draft's own stored record carries the submitted title.
  met: true
  how: unchanged -- caseStore.updateDraft(params.slug, params.version, body) is still awaited first and
    still performs the write via updateDraftVersion in relational-case-store.repository.ts before any
    read is attempted
- criterion: The 200 answer carries the declared attributes the draft's own stored record carries after
    the write.
  met: true
  how: readCaseVersion is called after the write settles and reads the same store row via store.assembleVersion;
    toReadCaseVersionResponse(version) maps title, when_to_use, subject, fallback and (when present) consolidation_register
    straight from that read, with no other version's data and no adapter default filled in for an absent
    register
- criterion: The 200 answer carries no manifest entry.
  met: true
  how: CaseVersionAttributes (case-query.port.ts) and toReadCaseVersionResponse's DTO shape hold only
    title, when_to_use, subject, fallback and an optional consolidation_register -- no manifest field
    exists to carry
- criterion: A well-formed update-draft whose submitted subject names a subject type the glossary does
    not hold, over a draft, is answered HTTP 200.
  met: true
  how: readCaseVersion's implementation (case-query.service.ts) calls only heldVersion (store.assembleVersion)
    and returns attributesOf(assembled) -- it never calls caseCoherenceViolations or glossaryCoherenceViolations,
    so a subject absent from the glossary raises no CaseVersionNotValidError on this path, unlike readCase
    which still runs refuseIncoherence
nodes:
- node: rules/knowledge/an-accepted-update-draft-answers-its-versions-own-stored-declared-attributes
  encoded_at:
  - src/http/update-draft.controller.ts
  how: the controller's answer is now built exclusively from caseQuery.readCaseVersion's stored-record
    read taken after the write settles, never from contracts/knowledge/case-query's whole-case assembly
    (readCase), matching the rule's expression that no validator rule of validation-runs-at-every-read
    can turn an accepted write into a CaseVersionNotValidError answer; the manifest is absent from the
    answer's DTO by construction, and an absent consolidation_register is left absent rather than defaulted
    (unchanged in read-case-version.controller.ts's toReadCaseVersionResponse, which this task reuses
    without modifying)
- node: rules/knowledge/an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case
  encoded_at:
  - src/http/update-draft.controller.ts
  how: this task delivers the backend half the rule requires for the surface to function -- update-draft
    is accepted and answered on a reading where the draft's whole-case read is refused. The surface itself
    (presenting the fields, stating the version does not read back as a case) is frontend scope this task's
    Notes explicitly place outside this backend delivery
- node: domain/knowledge/case-version
  encoded_at:
  - src/http/update-draft.controller.ts
  how: preserves the aggregate's stated freedom that while in draft, its own declared attributes may likewise
    be corrected, as many times as curation needs -- the correction (update-draft's write) is no longer
    coupled to the version currently reading back as a coherent case, so the freedom holds even mid-correction
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-open-for-editing
  encoded_at:
  - src/http/update-draft.controller.ts
  how: answers the scenario's curator-facing then-step (the curator submits an update-draft correcting
    the title and it is accepted) for a case whose only draft version's manifest holds no hypothesis;
    the scenario's surface-facing then-steps (stating the version does not read back as a case, presenting
    the stored attributes) are left to the editing-surface (frontend) task per this task's own Notes
preserved:
- update-draft's pre-write refusals (CaseVersionNotDraftError over a released version, CaseNotFoundError
  over an unknown one), raised by caseStore.updateDraft/updateDraftVersion before the write, untouched
  by this change
- 'the write itself: caseStore.updateDraft(params.slug, params.version, body) is still called first, unconditionally,
  before any read'
- readCaseVersion's and toReadCaseVersionResponse's existing behavior of omitting an absent consolidation_register
  rather than defaulting it (in read-case-version.controller.ts and case-query.service.ts's attributesOf),
  reused as-is and not modified
deferred:
- what: the frontend editing surface that states the version does not read back as a case and presents
    the stored attributes on this same reading
  why: named in the task's own Notes as REMAINDER -- belongs to the editing-surface (frontend) task in
    this initiative, outside this backend task's scope
---

## What it is

update-draft.controller.ts's post-write answer now comes from caseQuery.readCaseVersion (the draft's own stored record, unvalidated) instead of caseQuery.readCase (a validated whole-case read), so a write that leaves the draft failing validation is still accepted and answered.

## Notes

None.
