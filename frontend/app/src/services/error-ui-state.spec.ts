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

  it("resolves CaseNotValidError to its own distinct case-not-valid state, no longer the shared generic-error fallback", () => {
    const state = uiStateForApiError(new ApiError("CaseNotValidError", "not valid"));
    expect(state.kind).toBe("case-not-valid");
    expect(state.kind).not.toBe("generic-error");
  });

  it("resolves a code the table does not name to the generic-error state rather than throwing", () => {
    const state = uiStateForApiError(new ApiError("SomeFutureBackendError", "unrecognized"));
    expect(state.kind).toBe("generic-error");
  });

  it("resolves ConceptAlreadyAnsweredError to the concept-already-answered state", () => {
    const state = uiStateForApiError(new ApiError("ConceptAlreadyAnsweredError", "already answered"));
    expect(state.kind).toBe("concept-already-answered");
  });

  it("resolves IncompleteCapabilityContractError to the incomplete-capability-contract state", () => {
    const state = uiStateForApiError(
      new ApiError("IncompleteCapabilityContractError", "incomplete contract"),
    );
    expect(state.kind).toBe("incomplete-capability-contract");
  });

  it("resolves CapabilityNotReadOnlyError to the capability-not-read-only state", () => {
    const state = uiStateForApiError(new ApiError("CapabilityNotReadOnlyError", "not read-only"));
    expect(state.kind).toBe("capability-not-read-only");
  });

  it("resolves CapabilitySchemaNotWellFormedError to the capability-schema-not-well-formed state", () => {
    const state = uiStateForApiError(
      new ApiError("CapabilitySchemaNotWellFormedError", "not well-formed"),
    );
    expect(state.kind).toBe("capability-schema-not-well-formed");
  });

  it("gives each of these four newly mapped classes a kind distinct from the others and from the shared generic-error fallback", () => {
    const codes = [
      "ConceptAlreadyAnsweredError",
      "IncompleteCapabilityContractError",
      "CapabilityNotReadOnlyError",
      "CapabilitySchemaNotWellFormedError",
    ];

    const kinds = codes.map((code) => uiStateForApiError(new ApiError(code, "message")).kind);

    expect(new Set(kinds).size).toBe(4);
    expect(kinds).not.toContain("generic-error");
  });

  it("resolves ConnectorConfigurationNotWellFormedError to its own distinct connector-configuration-not-well-formed state, not the shared generic-error fallback", () => {
    const state = uiStateForApiError(
      new ApiError("ConnectorConfigurationNotWellFormedError", "not well-formed"),
    );
    expect(state.kind).toBe("connector-configuration-not-well-formed");
    expect(state.kind).not.toBe("generic-error");
  });

  it("resolves ConceptDescriptionRequiredError to its own distinct concept-description-required state, not the shared generic-error fallback", () => {
    const state = uiStateForApiError(
      new ApiError("ConceptDescriptionRequiredError", "description required"),
    );
    expect(state.kind).toBe("concept-description-required");
    expect(state.kind).not.toBe("generic-error");
  });

  it("resolves ConceptDescriptionRequiredError to a state carrying only the kind, no wording of its own", () => {
    const state = uiStateForApiError(
      new ApiError("ConceptDescriptionRequiredError", "description required"),
    );
    expect(Object.keys(state)).toEqual(["kind"]);
  });
});
