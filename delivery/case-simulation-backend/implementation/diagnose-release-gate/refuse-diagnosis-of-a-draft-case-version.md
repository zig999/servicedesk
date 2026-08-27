---
title: diagnose refuses a draft-state case version
summary: A new CaseVersionNotReleasedError refuses POST /v1/diagnose against a draft-state pinned case
  version, registered in status-map.ts's STATUS_BY_ERROR_CLASS as 409, checked in the controller before
  the pipeline is ever called.
task: sha256:659fdfc8ba52b57cf73605bd3f0f1ce929f1e3fd5e4893086c8c97c45b190179
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/diagnose-release-gate-refuse-diagnosis-of-a-draft-case-version-build
files:
- path: src/errors/case-version-not-released.error.ts
  effect: New CaseVersionNotReleasedError class (name, constructor(slug, version, state), readonly context)
    — a business error of the investigation context naming that a pinned case version is in draft state
    and cannot be diagnosed against, distinct from CaseVersionNotDraftError (a composition-time refusal
    for the opposite state) and CaseVersionNotDraftAtReleaseError (release's own refusal), following the
    same CaseVersion*Error shape both already establish.
- path: src/errors/status-map.ts
  effect: Imports CaseVersionNotReleasedError and registers it in STATUS_BY_ERROR_CLASS mapped to 409,
    alongside the other refusals over a resource's own current state; extends the header comment's 409-group
    enumeration and corrects the "twenty" class count to "twenty-one" now that a class was added.
- path: src/http/diagnose.controller.ts
  effect: handleDiagnoseRequest now checks pinnedCase.state after reading the pinned case and, where it
    is not 'released', throws CaseVersionNotReleasedError(pinnedCase.slug, pinnedCase.version, pinnedCase.state)
    before assembling or calling dependencies.runDiagnose — so collection, judgment and writing never
    start for a draft-pinned request. A released-state version falls through this check unchanged and
    proceeds exactly as before. Header and function doc comments updated to describe the gate.
criteria:
- criterion: A diagnose request naming a case version in draft state is refused with a new named domain
    error, following the CaseVersion*Error pattern in src/src/errors/, before collection, judgment or
    writing runs.
  met: true
  how: 'handleDiagnoseRequest reads the pinned case through ICaseQuery.readCase, then — before it ever
    calls dependencies.runDiagnose, which is the sole entry into collection, judgment and writing — checks
    pinnedCase.state and throws the new CaseVersionNotReleasedError (src/errors/case-version-not-released.error.ts)
    where it is not ''released''. The new class follows the existing CaseVersionNotDraftError/CaseVersionNotDraftAtReleaseError/CaseVersionNotReleasableError
    shape: a name, a constructor taking exactly the identifying arguments, a readonly context field, and
    a doc comment stating why it is not a reuse of a sibling error.'
- criterion: The new error is registered in status-map.ts's STATUS_BY_ERROR_CLASS table, mapped to a status
    this project decides as its own engineering choice.
  met: true
  how: status-map.ts imports CaseVersionNotReleasedError and adds [CaseVersionNotReleasedError, 409] to
    STATUS_BY_ERROR_CLASS, grouped with the table's other "an operation the named resource's own current
    state forbids" entries (CaseAlreadyHasDraftError, CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError,
    ConceptAlreadyAnsweredError, CapabilityConnectorMismatchError) — no specification node fixes this
    refusal's status, so 409 is this project's own engineering choice, following the table's documented
    convention and the inventory's own note that this status belongs in this same table.
- criterion: A diagnose request naming a case version in released state is unaffected and proceeds exactly
    as before.
  met: true
  how: 'The added `if (pinnedCase.state !== ''released'')` branch is a pure early-exit: for a released
    version it is false, control falls straight through to the unchanged `return dependencies.runDiagnose({...})`
    call with every field assembled exactly as before this task. No other line of handleDiagnoseRequest''s
    existing behavior was touched.'
nodes:
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  encoded_at:
  - src/http/diagnose.controller.ts
  - src/errors/case-version-not-released.error.ts
  how: The rule's "an investigation may only be pinned to a case version in released state" half is encoded
    as the controller's state check ahead of runDiagnose; the refusal it requires is CaseVersionNotReleasedError,
    whose own message states the version is not released. The rule's "a draft version may be read but
    never diagnosed against" other half is not touched by this task — see the task's own REMAINDER note
    and this record's `deferred` below.
- node: scenarios/investigation/a-draft-case-version-refuses-diagnosis
  encoded_at:
  - src/http/diagnose.controller.ts
  - src/errors/case-version-not-released.error.ts
  how: given a draft-state case version, when a new investigation (diagnose) attempts to pin it, then
    the request is refused naming that it is not released — exactly the handleDiagnoseRequest branch and
    the new error's message. The scenario's own "a draft may already validate ... and still be refused
    here" is honored by placing the check after readCase's own full structural/coherence validation succeeds,
    never skipping or replacing that validation.
- node: domain/knowledge/case-version
  how: 'Only constrains the work: this task reads the aggregate''s own `state` attribute (CaseVersionState)
    as the pinned case already carries it through ICaseQuery.readCase; no new attribute, operation or
    shape is added to the aggregate by this task.'
- node: domain/knowledge/case-version-state
  how: 'Only constrains the work: the check compares pinnedCase.state against the literal ''released'',
    one of the enumeration''s own two named values, the same bare-literal comparison convention release.operation.ts
    already uses for ''draft''. No new state or transition is introduced.'
- node: domain/investigation/investigation
  how: 'Only constrains the work: the task''s own "What it is" and the domain node''s own reasoning ("coherence
    and release are two different questions") are honored by placing the gate after readCase''s coherence
    validation, not instead of it — a structurally and coherently valid draft version is still refused.
    No attribute or operation of the investigation aggregate itself is touched.'
inferences:
- inferred: The new error class is named CaseVersionNotReleasedError.
  from: the task's own objective and criterion 1 ("naming that the version is not released") and the scenario's
    own `then` clause ("naming that the version is not released"), following the CaseVersion*Error naming
    pattern the sibling classes (CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError, CaseVersionNotReleasableError)
    already establish for a state-named refusal.
- inferred: The new error maps to HTTP 409 Conflict rather than 404, 422 or any other status.
  from: the status-map.ts header comment's own grouping rule — "an operation the named resource's own
    current state forbids ... answers 409 Conflict" — which every existing case-version state-based refusal
    (CaseVersionNotDraftError, CaseVersionNotDraftAtReleaseError) already falls under, together with the
    inventory's own note that this status is "this project's own engineering decision" belonging in this
    same table "following its documented convention."
- inferred: The gate sits in diagnose.controller.ts's handleDiagnoseRequest rather than in a service or
    the case-query layer.
  from: the inventory's own "What it is" section — "diagnose.controller.ts writes hard-coded UNMEASURED_COST/UNMEASURED_DURATIONS
    today and holds no case-state check — both the release gate and the switch to real cost/durations
    land here" — and its risks entry naming handleDiagnoseRequest and status-map.ts as exactly the two
    files the release gate changes.
preserved:
- 'A diagnose request naming a case version in released state proceeds exactly as it did before this task:
  the same ProductionDiagnoseCall assembly, the same runDiagnose call, the same Assessment answer.'
- case-query.service.ts's readCase is untouched — it still runs full structural/coherence validation regardless
  of a version's state and still raises no error for a draft version on its own; the release gate in diagnose.controller.ts
  is additive, layered on top of its unchanged answer.
- Every other entry already in STATUS_BY_ERROR_CLASS keeps its existing status; only one entry was added.
deferred:
- what: rules/investigation/only-a-released-case-version-is-diagnosed's "may be read" clause — that a
    draft version may still be read, just never diagnosed against.
  why: 'Not reached by this task''s criteria, which answer only the diagnose-refusal half (the task''s
    own REMAINDER note). This belongs to the case-version read path, already delivered and unaffected
    by this task: case-query.service.ts''s readCase reads a draft version today and this change does not
    touch that file.'
---

## What it is

A new CaseVersionNotReleasedError refuses POST /v1/diagnose the moment the pinned case version is not in released state, checked in diagnose.controller.ts's handleDiagnoseRequest before dependencies.runDiagnose is ever called — so collection, judgment and writing never start for a draft-pinned request. The error is registered in status-map.ts's STATUS_BY_ERROR_CLASS as 409, this project's own engineering choice, following the table's existing convention for a refusal grounded in the named resource's own current state. A released-state version falls through the new check unchanged.

## Notes

An inference worth a reader's eye: the new class's name (CaseVersionNotReleasedError) and its 409 status were not stated verbatim anywhere and were drawn from the task's own wording and the status-map.ts header comment's documented grouping rule, both recorded above under `inferences`.
This task answers only the diagnose-refusal half of rules/investigation/only-a-released-case-version-is-diagnosed; its "may be read" half is deferred, unreached, and recorded above.
