---
title: The error-code mapping keys on CaseVersionNotValidError
summary: The frontend's error-code mapping table now keys the case-not-valid UI state on the wire code
  the backend actually sends, CaseVersionNotValidError, instead of the stale CaseNotValidError name.
task: sha256:dcb861afa2db402d76773ae28179d4397b7647cb369412a2c71c79f0da1ed67a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-not-valid-error-code-error-code-mapping-keys-on-the-current-name-build
files:
- path: src/services/error-ui-state.ts
  effect: 'The one entry in UI_STATE_BY_ERROR_CODE previously keyed "CaseNotValidError" is now keyed "CaseVersionNotValidError",
    the name case-version-not-valid.error.ts''s constructor sets and error-handler.middleware.ts''s domainEnvelope()
    serializes as the wire error.code; uiStateForApiError() now resolves that code to { kind: "case-not-valid"
    } instead of falling through to GENERIC_ERROR_STATE, with every other mapping entry, the generic fallback
    and the UiErrorStateKind union left untouched.'
criteria:
- criterion: An API error whose code is CaseVersionNotValidError resolves through the frontend's error-code
    mapping to the case-not-valid user-facing state, and not to the state the surface shows for a read
    that did not complete.
  met: true
  how: 'uiStateForApiError() looks up error.code in UI_STATE_BY_ERROR_CODE (src/services/error-ui-state.ts:64);
    the table now holds CaseVersionNotValidError mapped to { kind: "case-not-valid" }, so that exact code
    resolves to case-not-valid rather than falling through to GENERIC_ERROR_STATE (the kind use-case-current-version-validity.ts:49-51
    maps to phase "read-failed", the read-that-did-not-complete state).'
- criterion: An API error whose code the frontend's mapping holds no presentation of its own for resolves
    to the state the surface shows for a read that did not complete, and the surface discloses neither
    that error code, nor the refusal's own message, nor any value the refusal carries.
  met: true
  how: Pre-existing and unchanged by this fix. uiStateForApiError() returns GENERIC_ERROR_STATE (src/services/error-ui-state.ts:65)
    for any code the table holds no entry for; UiErrorState carries only kind, no code, message or details
    field, so none of those three ever reach a caller. use-case-current-version-validity.ts maps every
    kind other than "case-not-valid" to phase "read-failed" (lines 49-51), and case-detail-screen.tsx
    renders that phase as the fixed text "Unable to load this case's version timeline." (lines 108-110)
    with nothing from the error interpolated into it.
- criterion: A case-keyed surface that meets a CaseVersionNotValidError refusal for the case's current
    version states that the case's current version does not read back as a case.
  met: true
  how: With the mapping now resolving CaseVersionNotValidError to kind "case-not-valid", useCaseCurrentVersionValidity's
    check errorStateKind(versionQuery.error) === "case-not-valid" (use-case-current-version-validity.ts:49)
    now succeeds for that code and returns phase "not-valid"; case-detail-screen.tsx's VersionsPanel renders
    that phase as "This case's current version does not read back as a case." (case-detail-screen.tsx:105-107),
    unchanged by this delivery.
- criterion: What a case-keyed surface states for a current version that fails validation, what it states
    for a read of that case that did not complete, and what it states for a case currently holding no
    version are three statements, no two of which are presented alike.
  met: true
  how: 'Pre-existing and unchanged. case-detail-screen.tsx''s VersionsPanel renders three distinct, mutually
    exclusive texts keyed on three distinct conditions: "This case''s current version does not read back
    as a case." for phase "not-valid" (lines 105-107), "Unable to load this case''s version timeline."
    for phase "read-failed" (lines 108-110, the same text also used for the outer isError branch at lines
    76-85), and "This case currently holds no version." for an empty version list (lines 100-102). This
    fix is what makes the "not-valid" branch reachable at all for the code the backend actually sends;
    before it, that branch was dead and every CaseVersionNotValidError refusal fell into the read-failed
    text instead.'
- criterion: A case-keyed surface meeting a CaseVersionNotValidError refusal presents no attribute of
    the non-validating version — its title, when_to_use, subject, fallback, consolidation_register, state
    or manifest, nor anything derived from them — as the case's current content.
  met: true
  how: Pre-existing and unchanged. The "not-valid" branch (case-detail-screen.tsx:105-107) renders only
    the fixed statement; it never reads or interpolates versionQuery.error or its details. The version-list
    table shown alongside it (StatusTable, line 111) is populated from useCaseVersions(slug), a separate,
    always-successful /v1/cases/{slug}/versions call returning only each version's own number and workflow
    state as a browsing index of what versions exist — never the failing version's own content record,
    which is what the rule's prohibited-attribute list names and what only the failed /v1/cases/{slug}/versions/{version}
    fetch would have carried.
- criterion: A case whose current version reads back with every validator rule holding is presented with
    none of the statement that its current version does not read back as a case.
  met: true
  how: Pre-existing and unchanged. When useCaseCurrentVersionValidity resolves phase "valid" (use-case-current-version-validity.ts:56),
    neither the "not-valid" nor the "read-failed" conditional in case-detail-screen.tsx (lines 105-110)
    matches, so neither statement renders — only the version table.
nodes:
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/routes/case-detail-screen.tsx
  - src/hooks/use-case-current-version-validity.ts
  how: The rule's three-way distinction — current version fails validation, read did not complete, case
    holds no version, no two presented alike, no attribute of the failing version shown — was already
    encoded in these two pre-existing files; this task's fix is what makes the current-version-fails-validation
    branch actually reachable for the code the backend sends, by correcting the key the mapping in services/error-ui-state.ts
    resolves that code through.
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  encoded_at:
  - src/services/error-ui-state.ts
  how: This task addresses only the fact the task's notes identify as reached here — the error name the
    frontend keys on. The mapping now keys its case-not-valid presentation on CaseVersionNotValidError,
    the exact name the backend's error-handler.middleware.ts serializes from error.name for this refusal.
    The node's other two clauses, the HTTP 409 status and that this read is never answered with the generic
    fallback or with CaseNotFoundError, are wire-side facts this task's criteria take as given and do
    not address; they are recorded as a REMAINDER in the task's own Notes.
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  encoded_at:
  - src/services/error-ui-state.ts
  - src/routes/case-detail-screen.tsx
  how: Pre-existing and unchanged by this fix. An unrecognised code falls through uiStateForApiError()
    to GENERIC_ERROR_STATE, a value carrying only kind, so no code, message or detail crosses into UiErrorState
    at all; case-detail-screen.tsx renders that kind's resulting phase, read-failed, as the same fixed
    text used for a read that did not complete, and nothing else. The task's Notes flag as UNDERDETERMINED
    that the rule's full text also forbids showing any attribute of the case or of any version of it alongside
    that fallback statement, a clause criterion 2 does not literally bound; this delivery introduces no
    such attribute display in the read-failed branch, which renders only the fixed text, so the stronger
    reading the rule states is honored in what was written.
inferences:
- inferred: The wire code the mapping must key on is exactly CaseVersionNotValidError, with no dual mapping
    kept for the retired CaseNotValidError name.
  from: src/errors/case-version-not-valid.error.ts sets this.name to 'CaseVersionNotValidError'; src/errors/status-map.ts
    imports and maps only CaseVersionNotValidError, to 409; src/errors/case-not-valid.error.ts is a bare
    re-export of CaseVersionNotValidError, defining no class of its own named CaseNotValidError; and a
    repository-wide search found no backend error class still named CaseNotValidError. error-handler.middleware.ts's
    domainEnvelope() serializes error.name as the wire code, so CaseVersionNotValidError is the only code
    this refusal can ever carry.
deferred:
- what: Updating the three existing test files that still stub the retired CaseNotValidError code — hooks/use-case-current-version-validity.spec.ts,
    routes/case-detail-screen-current-version-validity.spec.ts and services/error-ui-state.spec.ts — to
    the wire code this delivery now requires.
  why: Writing what proves this delivery is the test author's judgment, in its own context, never the
    implementer's; these three spec files sit outside what this implementation touched.
---

## What it is
The one-line correction that makes the frontend's error-code mapping key on CaseVersionNotValidError, the name the backend's refusal has carried since it was renamed, so a case whose current version fails a validator rule reaches the curator as itself.

## Notes
Five of the six criteria were already satisfied by source this delivery did not touch: the three-way distinction, the no-attribute prohibition, the bounding to a failing read and the disclosure limits were all encoded by the case-detail-screen and use-case-current-version-validity files delivered earlier.
What was wrong was one key, and what the wrong key cost was reachability: the not-valid branch was dead for the code the backend actually sends, so every refusal of this kind fell into the read-failed text and the rule's three-way distinction collapsed to two in practice.
The implementer recorded one inference — that no dual mapping is kept for the retired name — resting on there being no backend class still named CaseNotValidError, src/errors/case-not-valid.error.ts being a bare re-export, and the envelope serializing error.name as the wire code.
Three existing spec files still stub the retired name and were deliberately left to the test author, whose context is where what proves this delivery is written.
