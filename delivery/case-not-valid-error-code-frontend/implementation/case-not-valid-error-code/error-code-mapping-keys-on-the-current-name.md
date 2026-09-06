---
title: The error-code mapping keys on CaseVersionNotValidError
summary: The frontend's error-code mapping table keys the case-not-valid UI state on the wire code the
  backend actually sends, CaseVersionNotValidError, instead of the stale CaseNotValidError name.
task: sha256:dcb861afa2db402d76773ae28179d4397b7647cb369412a2c71c79f0da1ed67a
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/case-not-valid-error-code-error-code-mapping-keys-on-the-current-name-build-2
files:
- path: src/services/error-ui-state.ts
  effect: 'The one entry in UI_STATE_BY_ERROR_CODE previously keyed "CaseNotValidError" is keyed "CaseVersionNotValidError",
    the name case-version-not-valid.error.ts''s constructor sets and error-handler.middleware.ts''s domainEnvelope()
    serializes as the wire error.code; uiStateForApiError() resolves that code to { kind: "case-not-valid"
    } instead of falling through to GENERIC_ERROR_STATE, with every other mapping entry, the generic fallback
    and the UiErrorStateKind union left untouched.'
criteria:
- criterion: An API error whose code is CaseVersionNotValidError resolves through the frontend's error-code
    mapping to the case-not-valid user-facing state, and not to the state the surface shows for a read
    that did not complete.
  met: true
  how: error-ui-state.ts's UI_STATE_BY_ERROR_CODE table maps CaseVersionNotValidError to kind case-not-valid;
    use-case-current-version-validity.ts branches on that exact kind to produce phase not-valid, which
    case-detail-screen.tsx renders as a statement distinct from the read-failed text.
- criterion: An API error whose code the frontend's mapping holds no presentation of its own for resolves
    to the state the surface shows for a read that did not complete, and the surface discloses neither
    that error code, nor the refusal's own message, nor any value the refusal carries.
  met: true
  how: Every branch of the errored versionQuery in use-case-current-version-validity.ts other than errorStateKind
    === case-not-valid resolves to phase read-failed; case-detail-screen.tsx renders that phase as the
    fixed text "Unable to load this case's version timeline.", reading no field off the ApiError — no
    code, no message, no details — anywhere in that branch.
- criterion: A case-keyed surface that meets a CaseVersionNotValidError refusal for the case's current
    version states that the case's current version does not read back as a case.
  met: true
  how: case-detail-screen.tsx's VersionsPanel renders "This case's current version does not read back
    as a case." exactly when currentVersion.phase === not-valid, which the hook only reaches on a CaseVersionNotValidError
    refusal for the highest-numbered version.
- criterion: What a case-keyed surface states for a current version that fails validation, what it states
    for a read of that case that did not complete, and what it states for a case currently holding no
    version are three statements, no two of which are presented alike.
  met: true
  how: The three fixed strings the panel renders — the not-valid statement, the read-failed statement,
    and "This case currently holds no version." for an empty version list — are three distinct literals
    rendered from three mutually exclusive branches, so no reader sees two alike.
- criterion: A case-keyed surface meeting a CaseVersionNotValidError refusal presents no attribute of
    the non-validating version — its title, when_to_use, subject, fallback, consolidation_register, state
    or manifest, nor anything derived from them — as the case's current content.
  met: true
  how: The hook's not-valid phase carries only a version number, never the failed CaseVersionRecord; the
    not-valid branch in case-detail-screen.tsx renders only the fixed statement text, and the table rows
    beside it come from CaseVersionListItem — id, version, state — fetched from the versions list endpoint,
    never from the failing detail read, so no title, when_to_use, subject, fallback, consolidation_register,
    state or manifest of that version is ever in scope to render.
- criterion: A case whose current version reads back with every validator rule holding is presented with
    none of the statement that its current version does not read back as a case.
  met: true
  how: The hook reports phase valid once the version detail read succeeds, and case-detail-screen.tsx's
    Versions panel has no branch rendering either the not-valid or the read-failed statement for phase
    valid, pending or checking — only the version table shows.
nodes:
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  encoded_at:
  - src/hooks/use-case-current-version-validity.ts
  - src/routes/case-detail-screen.tsx
  how: The hook derives the three-way outcome over the case's highest-numbered version, and the screen
    renders the three case-facing statements as mutually exclusive, textually distinct literals with no
    attribute of the non-validating version alongside any of them, matching the rule's three-way distinction
    and its no-attribute clause.
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  encoded_at:
  - src/services/error-ui-state.ts
  how: This node states the wire-side name the refusal carries; the frontend mapping keys its own presentation
    on that same name, CaseVersionNotValidError, per the task's own bound — the HTTP status and the two
    exclusions are the backend act's, out of this task's reach, per the task's REMAINDER note.
- node: rules/knowledge/a-refusal-a-case-keyed-surface-cannot-name-is-presented-as-a-read-that-did-not-complete
  encoded_at:
  - src/hooks/use-case-current-version-validity.ts
  - src/routes/case-detail-screen.tsx
  how: Any error code other than case-not-valid resolves to the same read-failed phase and the same fixed
    statement the panel shows for any other incomplete read, disclosing no code, message or carried value
    — matching the rule as bounded by the task's UNDERDETERMINED note.
inferences:
- inferred: The wire code the mapping must key on is exactly CaseVersionNotValidError, with no dual mapping
    kept for the retired CaseNotValidError name.
  from: src/errors/case-version-not-valid.error.ts sets this.name to 'CaseVersionNotValidError'; src/errors/status-map.ts
    imports and maps only CaseVersionNotValidError, to 409; src/errors/case-not-valid.error.ts is a bare
    re-export of CaseVersionNotValidError, defining no class of its own named CaseNotValidError; and a
    repository-wide search found no backend error class still named CaseNotValidError. error-handler.middleware.ts's
    domainEnvelope() serializes error.name as the wire code, so CaseVersionNotValidError is the only code
    this refusal can ever carry.
---

## What it is
The one-line correction that makes the frontend's error-code mapping key on CaseVersionNotValidError, the name the backend's refusal has carried since it was renamed, so a case whose current version fails a validator rule reaches the curator as itself.

## Notes
This record was rewritten whole for a re-delivery, and the re-delivery changed no source: a review of the first delivery returned three findings, all three of them in spec files, which are the proof's and not this record's.
The implementer re-read src/services/error-ui-state.ts, src/hooks/use-case-current-version-validity.ts and src/routes/case-detail-screen.tsx in full against the six criteria and found the source already satisfying each; `files` therefore still names only the one path this delivery ever modified, and the two read-but-unmodified files appear under the nodes whose facts they encode, where they belong.
Five of the six criteria were satisfied by source this delivery did not touch — the three-way distinction, the no-attribute prohibition and the bounding to a failing read were all encoded earlier.
What was wrong was one key, and what the wrong key cost was reachability: the not-valid branch was dead for the code the backend actually sends, so every refusal of this kind fell into the read-failed text and the rule's three-way distinction collapsed to two in practice.
