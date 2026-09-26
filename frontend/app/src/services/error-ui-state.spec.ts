import { describe, it, expect } from "vitest";

import { ApiError } from "./api-client";
import { uiStateForApiError } from "./error-ui-state";

const stateFor = (code: string, message = "message") =>
  uiStateForApiError(new ApiError(code, message));

const kindFor = (code: string, message = "message"): string => stateFor(code, message).kind;

const expectDistinctKind = (code: string, message: string, otherCodes: string[]): void => {
  const targetKind = kindFor(code, message);
  const otherKinds = otherCodes.map((otherCode) => kindFor(otherCode));
  expect(otherKinds).not.toContain(targetKind);
  expect(targetKind).not.toBe("generic-error");
};

describe("the error-code mapping resolves an API error's own code to a user-facing state", () => {
  it("resolves CaseNotFoundError to the case-not-found state", () => {
    expect(kindFor("CaseNotFoundError", "not found")).toBe("case-not-found");
  });

  it("resolves CaseHoldsVersionsError to a kind no other named code resolves to, distinct from the generic fallback", () => {
    expectDistinctKind("CaseHoldsVersionsError", "holds versions", [
      "CaseNotFoundError",
      "ConceptNotAnsweredError",
      "ConceptNotHeldError",
      "VocabularyTermNotHeldError",
      "CaseAlreadyHasDraftError",
      "ManifestPositionOccupiedError",
      "CaseVersionNotDraftError",
      "CaseVersionNotDraftAtReleaseError",
      "HypothesisRevisionNotDraftAtReleaseError",
      "ConceptAlreadyAnsweredError",
      "ConceptInUseError",
      "CaseVersionNotReleasableError",
      "ManifestWouldHoldNoHypothesisError",
      "IncompleteCapabilityContractError",
      "CapabilityNotReadOnlyError",
      "CapabilitySchemaNotWellFormedError",
      "CapabilityCitedByEvidenceError",
      "ConnectorConfigurationNotWellFormedError",
      "ConceptDescriptionRequiredError",
      "CaseVersionNotValidError",
    ]);
  });

  it("resolves ConceptNotAnsweredError to the concept-not-answered state", () => {
    expect(kindFor("ConceptNotAnsweredError", "not answered")).toBe("concept-not-answered");
  });

  it("resolves ConceptNotHeldError to the concept-not-held state", () => {
    expect(kindFor("ConceptNotHeldError", "not held")).toBe("concept-not-held");
  });

  it("resolves VocabularyTermNotHeldError to the vocabulary-term-not-held state", () => {
    expect(kindFor("VocabularyTermNotHeldError", "not held")).toBe("vocabulary-term-not-held");
  });

  it("resolves CaseAlreadyHasDraftError to the case-already-has-draft state", () => {
    expect(kindFor("CaseAlreadyHasDraftError", "already has draft")).toBe(
      "case-already-has-draft",
    );
  });

  it("resolves ManifestPositionOccupiedError to the manifest-position-occupied state", () => {
    expect(kindFor("ManifestPositionOccupiedError", "position occupied")).toBe(
      "manifest-position-occupied",
    );
  });

  it("resolves CaseVersionNotDraftError to the case-version-not-draft state", () => {
    expect(kindFor("CaseVersionNotDraftError", "not draft")).toBe("case-version-not-draft");
  });

  it("resolves CaseVersionNotDraftAtReleaseError to the case-version-not-draft-at-release state", () => {
    expect(kindFor("CaseVersionNotDraftAtReleaseError", "not draft at release")).toBe(
      "case-version-not-draft-at-release",
    );
  });

  it("resolves HypothesisRevisionNotDraftAtReleaseError to the hypothesis-revision-not-draft-at-release state", () => {
    expect(kindFor("HypothesisRevisionNotDraftAtReleaseError", "not draft at release")).toBe(
      "hypothesis-revision-not-draft-at-release",
    );
  });

  it("resolves HypothesisRevisionNotDraftAtReleaseError to a kind no other listed code resolves to, distinct from the generic fallback", () => {
    expectDistinctKind("HypothesisRevisionNotDraftAtReleaseError", "not draft at release", [
      "CaseNotFoundError",
      "ConceptNotAnsweredError",
      "ConceptNotHeldError",
      "VocabularyTermNotHeldError",
      "CaseAlreadyHasDraftError",
      "ManifestPositionOccupiedError",
      "CaseVersionNotDraftError",
      "CaseVersionNotDraftAtReleaseError",
      "ConceptAlreadyAnsweredError",
      "CaseVersionNotReleasableError",
      "ManifestWouldHoldNoHypothesisError",
      "IncompleteCapabilityContractError",
      "CapabilityNotReadOnlyError",
      "CapabilitySchemaNotWellFormedError",
      "ConnectorConfigurationNotWellFormedError",
      "ConceptDescriptionRequiredError",
      "CaseHoldsNoDraftError",
      "ConceptNotInGlossaryError",
      "ConceptRefusesSubjectTypeError",
      "CaseVersionNotValidError",
    ]);
  });

  it("resolves CaseVersionNotReleasableError to the case-version-not-releasable state", () => {
    expect(kindFor("CaseVersionNotReleasableError", "not releasable")).toBe(
      "case-version-not-releasable",
    );
  });

  it("resolves ManifestWouldHoldNoHypothesisError to the manifest-would-hold-no-hypothesis state", () => {
    expect(kindFor("ManifestWouldHoldNoHypothesisError", "would hold no hypothesis")).toBe(
      "manifest-would-hold-no-hypothesis",
    );
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

    expect(new Set(codes.map((code) => kindFor(code))).size).toBe(10);
  });

  it("resolves CaseHoldsNoDraftError to the shared generic-error state", () => {
    expect(kindFor("CaseHoldsNoDraftError", "holds no draft")).toBe("generic-error");
  });

  it("resolves ConceptNotInGlossaryError to the shared generic-error state", () => {
    expect(kindFor("ConceptNotInGlossaryError", "not in glossary")).toBe("generic-error");
  });

  it("resolves ConceptRefusesSubjectTypeError to the shared generic-error state", () => {
    expect(kindFor("ConceptRefusesSubjectTypeError", "refuses subject type")).toBe(
      "generic-error",
    );
  });

  it("resolves CaseVersionNotValidError, the name the backend's refusal actually carries, to its own distinct case-not-valid state, not the shared generic-error fallback", () => {
    const kind = kindFor("CaseVersionNotValidError", "not valid");
    expect(kind).toBe("case-not-valid");
    expect(kind).not.toBe("generic-error");
  });

  it("resolves CaseNotValidError, the retired name the mapping no longer keys on, to the shared generic-error state rather than case-not-valid", () => {
    expect(kindFor("CaseNotValidError", "not valid")).toBe("generic-error");
  });

  it("resolves a code the table does not name to the generic-error state rather than throwing", () => {
    expect(kindFor("SomeFutureBackendError", "unrecognized")).toBe("generic-error");
  });

  it("resolves ConceptAlreadyAnsweredError to the concept-already-answered state", () => {
    expect(kindFor("ConceptAlreadyAnsweredError", "already answered")).toBe(
      "concept-already-answered",
    );
  });

  it("resolves ConceptInUseError to a state kind other than the shared generic-error fallback", () => {
    expect(kindFor("ConceptInUseError", "concept in use")).not.toBe("generic-error");
  });

  it("resolves ConceptInUseError to a kind no other named code resolves to, distinct from the generic fallback", () => {
    expectDistinctKind("ConceptInUseError", "concept in use", [
      "CaseNotFoundError",
      "ConceptNotAnsweredError",
      "ConceptNotHeldError",
      "VocabularyTermNotHeldError",
      "CaseAlreadyHasDraftError",
      "ManifestPositionOccupiedError",
      "CaseVersionNotDraftError",
      "CaseVersionNotDraftAtReleaseError",
      "HypothesisRevisionNotDraftAtReleaseError",
      "ConceptAlreadyAnsweredError",
      "CaseVersionNotReleasableError",
      "ManifestWouldHoldNoHypothesisError",
      "IncompleteCapabilityContractError",
      "CapabilityNotReadOnlyError",
      "CapabilitySchemaNotWellFormedError",
      "ConnectorConfigurationNotWellFormedError",
      "ConceptDescriptionRequiredError",
      "CaseHoldsNoDraftError",
      "ConceptNotInGlossaryError",
      "ConceptRefusesSubjectTypeError",
      "CaseVersionNotValidError",
    ]);
  });

  it("resolves IncompleteCapabilityContractError to the incomplete-capability-contract state", () => {
    expect(kindFor("IncompleteCapabilityContractError", "incomplete contract")).toBe(
      "incomplete-capability-contract",
    );
  });

  it("resolves CapabilityNotReadOnlyError to the capability-not-read-only state", () => {
    expect(kindFor("CapabilityNotReadOnlyError", "not read-only")).toBe(
      "capability-not-read-only",
    );
  });

  it("resolves CapabilitySchemaNotWellFormedError to the capability-schema-not-well-formed state", () => {
    expect(kindFor("CapabilitySchemaNotWellFormedError", "not well-formed")).toBe(
      "capability-schema-not-well-formed",
    );
  });

  it("gives each of these four newly mapped classes a kind distinct from the others and from the shared generic-error fallback", () => {
    const codes = [
      "ConceptAlreadyAnsweredError",
      "IncompleteCapabilityContractError",
      "CapabilityNotReadOnlyError",
      "CapabilitySchemaNotWellFormedError",
    ];

    const kinds = codes.map((code) => kindFor(code));

    expect(new Set(kinds).size).toBe(4);
    expect(kinds).not.toContain("generic-error");
  });

  it("resolves CapabilityCitedByEvidenceError to a kind no other named code resolves to, distinct from the generic fallback", () => {
    expectDistinctKind("CapabilityCitedByEvidenceError", "cited by evidence", [
      "CaseNotFoundError",
      "ConceptNotAnsweredError",
      "ConceptNotHeldError",
      "VocabularyTermNotHeldError",
      "CaseAlreadyHasDraftError",
      "ManifestPositionOccupiedError",
      "CaseVersionNotDraftError",
      "CaseVersionNotDraftAtReleaseError",
      "HypothesisRevisionNotDraftAtReleaseError",
      "ConceptAlreadyAnsweredError",
      "ConceptInUseError",
      "CaseVersionNotReleasableError",
      "ManifestWouldHoldNoHypothesisError",
      "IncompleteCapabilityContractError",
      "CapabilityNotReadOnlyError",
      "CapabilitySchemaNotWellFormedError",
      "ConnectorConfigurationNotWellFormedError",
      "ConceptDescriptionRequiredError",
      "CaseHoldsNoDraftError",
      "ConceptNotInGlossaryError",
      "ConceptRefusesSubjectTypeError",
      "CaseVersionNotValidError",
    ]);
  });

  it("leaves every error code named before CapabilityCitedByEvidenceError was added resolving to the exact kind it resolved to before", () => {
    const previouslyNamedCodeKinds: Record<string, string> = {
      CaseNotFoundError: "case-not-found",
      ConceptNotAnsweredError: "concept-not-answered",
      ConceptNotHeldError: "concept-not-held",
      VocabularyTermNotHeldError: "vocabulary-term-not-held",
      CaseAlreadyHasDraftError: "case-already-has-draft",
      ManifestPositionOccupiedError: "manifest-position-occupied",
      CaseVersionNotDraftError: "case-version-not-draft",
      CaseVersionNotDraftAtReleaseError: "case-version-not-draft-at-release",
      HypothesisRevisionNotDraftAtReleaseError: "hypothesis-revision-not-draft-at-release",
      ConceptAlreadyAnsweredError: "concept-already-answered",
      ConceptInUseError: "concept-in-use",
      CaseVersionNotReleasableError: "case-version-not-releasable",
      ManifestWouldHoldNoHypothesisError: "manifest-would-hold-no-hypothesis",
      IncompleteCapabilityContractError: "incomplete-capability-contract",
      CapabilityNotReadOnlyError: "capability-not-read-only",
      CapabilitySchemaNotWellFormedError: "capability-schema-not-well-formed",
      ConnectorConfigurationNotWellFormedError: "connector-configuration-not-well-formed",
      ConceptDescriptionRequiredError: "concept-description-required",
      CaseHoldsNoDraftError: "generic-error",
      ConceptNotInGlossaryError: "generic-error",
      ConceptRefusesSubjectTypeError: "generic-error",
      CaseVersionNotValidError: "case-not-valid",
    };

    const resolvedKinds = Object.fromEntries(
      Object.keys(previouslyNamedCodeKinds).map((code) => [code, kindFor(code)]),
    );

    expect(resolvedKinds).toEqual(previouslyNamedCodeKinds);
  });

  it("resolves ConnectorConfigurationNotWellFormedError to its own distinct connector-configuration-not-well-formed state, not the shared generic-error fallback", () => {
    const kind = kindFor("ConnectorConfigurationNotWellFormedError", "not well-formed");
    expect(kind).toBe("connector-configuration-not-well-formed");
    expect(kind).not.toBe("generic-error");
  });

  it("resolves ConceptDescriptionRequiredError to its own distinct concept-description-required state, not the shared generic-error fallback", () => {
    const kind = kindFor("ConceptDescriptionRequiredError", "description required");
    expect(kind).toBe("concept-description-required");
    expect(kind).not.toBe("generic-error");
  });

  it("resolves ConceptDescriptionRequiredError to a state carrying only the kind, no wording of its own", () => {
    const state = stateFor("ConceptDescriptionRequiredError", "description required");
    expect(Object.keys(state)).toEqual(["kind"]);
  });

  it("resolves a code the table does not name to a fallback state carrying only the kind, not the refusal's own message", () => {
    const state = stateFor("SomeFutureBackendError", "some future message");
    expect(Object.keys(state)).toEqual(["kind"]);
  });

  it("resolves OpenApiDocumentNotFetchedError, OpenApiDocumentNotReadableError and OpenApiOperationNotFoundError to the shared generic-error state rather than a code of their own (capability schema helper's refusal-stated-to-the-operator criterion 8)", () => {
    const kinds = [
      "OpenApiDocumentNotFetchedError",
      "OpenApiDocumentNotReadableError",
      "OpenApiOperationNotFoundError",
    ].map((code) => kindFor(code));

    expect(kinds).toEqual(["generic-error", "generic-error", "generic-error"]);
  });
});
