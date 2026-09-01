export interface CaseDraftCreatedPayload {
  readonly slug: string;
  readonly version: number;
  readonly source_version?: number;
}

export interface CaseDraftUpdatedPayload {
  readonly slug: string;
  readonly version: number;
}

export interface CaseDraftDiscardedPayload {
  readonly slug: string;
  readonly version: number;
}

export interface CaseReleasedPayload {
  readonly slug: string;
  readonly version: number;
}

export interface ManifestHypothesisPlacedPayload {
  readonly slug: string;
  readonly version: number;
  readonly hypothesis_name: string;
  readonly position: number;
  readonly moved: boolean;
}

export interface ManifestHypothesisRemovedPayload {
  readonly slug: string;
  readonly version: number;
  readonly hypothesis_name: string;
}

export interface HypothesisRevisedPayload {
  readonly slug: string;
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly is_new_identity: boolean;
}

export interface UiStaleConflictDetectedPayload {
  readonly slug: string;
  readonly version: number;
  readonly action: string;
}

export interface Telemetry {
  readonly caseDraftCreated: (payload: CaseDraftCreatedPayload) => void;
  readonly caseDraftUpdated: (payload: CaseDraftUpdatedPayload) => void;
  readonly caseDraftDiscarded: (payload: CaseDraftDiscardedPayload) => void;
  readonly caseReleased: (payload: CaseReleasedPayload) => void;
  readonly manifestHypothesisPlaced: (payload: ManifestHypothesisPlacedPayload) => void;
  readonly manifestHypothesisRemoved: (payload: ManifestHypothesisRemovedPayload) => void;
  readonly hypothesisRevised: (payload: HypothesisRevisedPayload) => void;
  readonly uiStaleConflictDetected: (payload: UiStaleConflictDetectedPayload) => void;
}

function emit(eventName: string, payload: unknown): void {

  // eslint-disable-next-line no-console -- PRH-01 departure: no configured logger exists yet, sink is deliberate
  console.info(`telemetry:${eventName}`, payload);
}

export function useTelemetry(): Telemetry {
  return {
    caseDraftCreated: (payload: CaseDraftCreatedPayload) => emit("case_draft.created", payload),
    caseDraftUpdated: (payload: CaseDraftUpdatedPayload) => emit("case_draft.updated", payload),
    caseDraftDiscarded: (payload: CaseDraftDiscardedPayload) =>
      emit("case_draft.discarded", payload),
    caseReleased: (payload: CaseReleasedPayload) => emit("case.released", payload),
    manifestHypothesisPlaced: (payload: ManifestHypothesisPlacedPayload) =>
      emit("manifest.hypothesis_placed", payload),
    manifestHypothesisRemoved: (payload: ManifestHypothesisRemovedPayload) =>
      emit("manifest.hypothesis_removed", payload),
    hypothesisRevised: (payload: HypothesisRevisedPayload) =>
      emit("hypothesis.revised", payload),
    uiStaleConflictDetected: (payload: UiStaleConflictDetectedPayload) =>
      emit("ui.stale_conflict_detected", payload),
  };
}
