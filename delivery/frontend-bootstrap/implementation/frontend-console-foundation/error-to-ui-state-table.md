---
title: Error class to UI-state mapping table
summary: A new src/services/error-ui-state.ts module resolving an ApiError's code, keyed off the exact ten mapped and four unmapped class names in src/src/errors/status-map.ts, to a closed set of UI-state tags with no rendered wording.
task: sha256:2115eb56b62474b8fd64ba3125f3d54d76e565bdaba31a8febe6e7e0360e54cc
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
run: run/frontend-console-foundation-onda-1-full-suite-2
files:
  - path: src/services/error-ui-state.ts
    effect: >-
      exports UiErrorStateKind (an 11-value discriminated-union tag, one per mapped error class
      plus a shared "generic-error" fallback), UiErrorState (a { kind } wrapper), and
      uiStateForApiError(error), which looks up error.code in a fourteen-key table and returns the
      shared fallback state for any of the four unmapped classes or any code the table does not
      name at all -- never throwing
criteria:
  - criterion: CaseNotFoundError, ConceptNotAnsweredError, ConceptNotHeldError and VocabularyTermNotHeldError each map to their own 404-appropriate UI state.
    met: true
    how: each of the four keys resolves to its own distinct kind ("case-not-found", "concept-not-answered", "concept-not-held", "vocabulary-term-not-held"), none shared with another entry
  - criterion: CaseAlreadyHasDraftError, ManifestPositionOccupiedError, CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError each map to their own 409-appropriate UI state.
    met: true
    how: each of the four keys resolves to its own distinct kind ("case-already-has-draft", "manifest-position-occupied", "case-version-not-draft", "case-version-not-draft-at-release"), none shared with another entry
  - criterion: CaseVersionNotReleasableError and ManifestWouldHoldNoHypothesisError each map to their own 422-appropriate UI state.
    met: true
    how: each of the two keys resolves to its own distinct kind ("case-version-not-releasable", "manifest-would-hold-no-hypothesis")
  - criterion: CaseHoldsNoDraftError, ConceptNotInGlossaryError, ConceptRefusesSubjectTypeError and CaseNotValidError all map to the same generic fallback UI state, since the backend returns them as an indistinguishable INTERNAL_ERROR.
    met: true
    how: >-
      all four keys hold the same GENERIC_ERROR_STATE object reference (kind "generic-error");
      their exact spelling was confirmed by reading each error class's own source file
      (case-holds-no-draft.error.ts, concept-not-in-glossary.error.ts,
      concept-refuses-subject-type.error.ts, case-not-valid.error.ts) rather than relying on
      paraphrase
  - criterion: An ApiError.code the table does not name also resolves to the same generic fallback UI state rather than throwing.
    met: true
    how: 'uiStateForApiError() looks up UI_STATE_BY_ERROR_CODE[error.code] and returns `state ?? GENERIC_ERROR_STATE`, so a miss falls back to the same object the four unmapped classes use, and the function never throws'
  - criterion: The table's fourteen named keys match exactly the class names in src/src/errors/status-map.ts, with no re-derived or renamed key.
    met: true
    how: the ten mapped keys are copied verbatim from status-map.ts's own entries; the four unmapped keys were confirmed against the actual `export class` declaration in each one's own file rather than status-map.ts (which does not name them), and match exactly
inferences:
  - inferred: each of the ten mapped classes gets its own distinct UiErrorStateKind rather than one shared kind per HTTP-status family (one for all 404s, one for all 409s, one for all 422s).
    from: the criteria's own repeated wording -- "each map to their own ... UI state" for the 404, 409 and 422 groups, contrasted with "all map to the same ... UI state" for the four unmapped classes -- reads as deliberately distinguishing "own" from "same"
  - inferred: UiErrorState is a { kind } object (a one-field discriminated union) rather than a bare string-literal union.
    from: >-
      TYP-04 in standards/frontend-typescript.yaml (a value with a fixed, known set of shapes is
      modeled as a discriminated union) and the task's own steering note to keep the shape a plain
      data shape with no rendered text/JSX inside it, since any copy would be a domain fact this
      task's own rationale says does not belong here -- a wrapper object leaves room for a later
      screen task to attach non-copy data to a state without widening this module's return type
  - inferred: the literal string values chosen for each kind (e.g. "case-not-found", "manifest-would-hold-no-hypothesis") are kebab-case derivations of the class name, carrying no UI wording of their own.
    from: no node or task names these identifiers; they are a bare tag a later screen task switches on, consistent with the task's rationale that this table states no UI wording
  - inferred: the module sits at src/services/error-ui-state.ts, a sibling of api-client.ts.
    from: the task's own steering note and API-02's applies_to scope, which names src/services explicitly
  - inferred: the lookup function is named uiStateForApiError, mirroring the backend's statusForError() naming.
    from: src/src/errors/status-map.ts's own statusForError() convention -- one table, one resolver function named for what it resolves to, given the file's stated intent as this module's backend-side counterpart
preserved:
  - every other file in the target source root is unchanged -- this task created one new file and modified nothing existing
---

## What it is
The error-to-UI-state table the scope's API-02 line asks for, keyed off the same ten mapped and four unmapped class names as src/src/errors/status-map.ts, stating no UI wording of its own.

## Notes
None.
