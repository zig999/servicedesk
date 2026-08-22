import { describe, it, expect } from "vitest";

import { ApiError } from "./api-client";
import { uiStateForApiError } from "./error-ui-state";

describe("uiStateForApiError", () => {
  it("resolves CaseNotFoundError to the case-not-found state", () => {
    const state = uiStateForApiError(new ApiError("CaseNotFoundError", "not found"));
    expect(state.kind).toBe("case-not-found");
  });

  it("resolves ConceptNotAnsweredError to the concept-not-answered state", () => {
    const state = uiStateForApiError(new ApiError("ConceptNotAnsweredError", "not answered"));
    expect(state.kind).toBe("concept-not-answered");
  });

  it("resolves ConceptNotHeldError to the concept-not-held state", () => {
    const state = uiStateForApiError(new ApiError("ConceptNotHeldError", "not held"));
    expect(state.kind).toBe("concept-not-held");
  });

  it("resolves VocabularyTermNotHeldError to the vocabulary-term-not-held state", () => {
    const state = uiStateForApiError(new ApiError("VocabularyTermNotHeldError", "not held"));
    expect(state.kind).toBe("vocabulary-term-not-held");
  });

  it("resolves CaseAlreadyHasDraftError to the case-already-has-draft state", () => {
    const state = uiStateForApiError(new ApiError("CaseAlreadyHasDraftError", "already has draft"));
    expect(state.kind).toBe("case-already-has-draft");
  });

  it("resolves ManifestPositionOccupiedError to the manifest-position-occupied state", () => {
    const state = uiStateForApiError(new ApiError("ManifestPositionOccupiedError", "position occupied"));
    expect(state.kind).toBe("manifest-position-occupied");
  });

  it("resolves CaseVersionNotDraftError to the case-version-not-draft state", () => {
    const state = uiStateForApiError(new ApiError("CaseVersionNotDraftError", "not draft"));
    expect(state.kind).toBe("case-version-not-draft");
  });

  it("resolves CaseVersionNotDraftAtReleaseError to the case-version-not-draft-at-release state", () => {
    const state = uiStateForApiError(
      new ApiError("CaseVersionNotDraftAtReleaseError", "not draft at release"),
    );
    expect(state.kind).toBe("case-version-not-draft-at-release");
  });

  it("resolves CaseVersionNotReleasableError to the case-version-not-releasable state", () => {
    const state = uiStateForApiError(new ApiError("CaseVersionNotReleasableError", "not releasable"));
    expect(state.kind).toBe("case-version-not-releasable");
  });

  it("resolves ManifestWouldHoldNoHypothesisError to the manifest-would-hold-no-hypothesis state", () => {
    const state = uiStateForApiError(
      new ApiError("ManifestWouldHoldNoHypothesisError", "would hold no hypothesis"),
    );
    expect(state.kind).toBe("manifest-would-hold-no-hypothesis");
  });

  it("gives each of the ten mapped classes a kind distinct from every other one", () => {
    const codes = [
      "CaseNotFoundError",
      "ConceptNotAnsweredError",
      "ConceptNotHeldError",
      "VocabularyTermNotHeldError",
      "CaseAlreadyHasDraftError",
      "ManifestPositionOccupiedError",
      "CaseVersionNotDraftError",
      "CaseVersionNotDraftAtReleaseError",
      "CaseVersionNotReleasableError",
      "ManifestWouldHoldNoHypothesisError",
    ];

    const kinds = codes.map((code) => uiStateForApiError(new ApiError(code, "message")).kind);

    expect(new Set(kinds).size).toBe(10);
  });

  it("resolves CaseHoldsNoDraftError to the shared generic-error state", () => {
    const state = uiStateForApiError(new ApiError("CaseHoldsNoDraftError", "holds no draft"));
    expect(state.kind).toBe("generic-error");
  });

  it("resolves ConceptNotInGlossaryError to the shared generic-error state", () => {
    const state = uiStateForApiError(new ApiError("ConceptNotInGlossaryError", "not in glossary"));
    expect(state.kind).toBe("generic-error");
  });

  it("resolves ConceptRefusesSubjectTypeError to the shared generic-error state", () => {
    const state = uiStateForApiError(
      new ApiError("ConceptRefusesSubjectTypeError", "refuses subject type"),
    );
    expect(state.kind).toBe("generic-error");
  });

  it("resolves CaseNotValidError to the shared generic-error state", () => {
    const state = uiStateForApiError(new ApiError("CaseNotValidError", "not valid"));
    expect(state.kind).toBe("generic-error");
  });

  it("resolves a code the table does not name to the generic-error state rather than throwing", () => {
    const state = uiStateForApiError(new ApiError("SomeFutureBackendError", "unrecognized"));
    expect(state.kind).toBe("generic-error");
  });
});
