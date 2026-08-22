/**
 * The eight-event telemetry catalog
 * (task/frontend-console-foundation/telemetry-catalog-hook, section 3 of the
 * proposal) exposed as one hook, each event its own typed callable. No real
 * telemetry endpoint exists yet, so every call sinks to console.info,
 * namespaced "telemetry:<event-name>", per the decision recorded in
 * temp/frontend-console-decisions.md.
 *
 * A direct console call is what PRH-01 of this project's standard
 * (frontend-typescript.yaml) forbids -- "production code emits through the
 * project's configured logger" -- and this hook departs from it on purpose,
 * because no configured logger exists in this app yet and the task's own
 * criteria and the decision above name console.info as the sink
 * deliberately. The suppression PRH-03 requires sits on the one line in
 * emit() that actually calls console.info, with the reason stated inline, so
 * the departure is visible exactly where it happens rather than silenced for
 * the whole file.
 */

/** case_draft.created -- a curator started a new draft for a case. */
export interface CaseDraftCreatedPayload {
  readonly slug: string;
  readonly version: number;
  readonly source_version?: number;
}

/** case_draft.updated -- a draft's own attributes or manifest changed. */
export interface CaseDraftUpdatedPayload {
  readonly slug: string;
  readonly version: number;
}

/** case_draft.discarded -- a draft was discarded before release. */
export interface CaseDraftDiscardedPayload {
  readonly slug: string;
  readonly version: number;
}

/** case.released -- a draft was released and is now immutable. */
export interface CaseReleasedPayload {
  readonly slug: string;
  readonly version: number;
}

/** manifest.hypothesis_placed -- a hypothesis revision was placed (or moved) at a position. */
export interface ManifestHypothesisPlacedPayload {
  readonly slug: string;
  readonly version: number;
  readonly hypothesis_name: string;
  readonly position: number;
  readonly moved: boolean;
}

/** manifest.hypothesis_removed -- a hypothesis was removed from a draft's manifest. */
export interface ManifestHypothesisRemovedPayload {
  readonly slug: string;
  readonly version: number;
  readonly hypothesis_name: string;
}

/** hypothesis.revised -- a hypothesis's content changed, originating a new revision. */
export interface HypothesisRevisedPayload {
  readonly slug: string;
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly is_new_identity: boolean;
}

/** ui.stale_conflict_detected -- an attempted action met data staler than what the UI held. */
export interface UiStaleConflictDetectedPayload {
  readonly slug: string;
  readonly version: number;
  readonly action: string;
}

/** Every callable useTelemetry() exposes, one per cataloged event, exactly eight. */
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

/**
 * Sinks one event to console.info, namespaced "telemetry:<eventName>" so a
 * reader of the console can tell a telemetry line from a bare message. This
 * is the one place the namespacing and the sink are applied -- every
 * callable below calls this and nothing else, so no two callables can drift
 * onto two different prefixes or a second sink.
 */
function emit(eventName: string, payload: unknown): void {
  // Telemetry has no real endpoint yet; console.info is the sink this
  // task's own criteria and temp/frontend-console-decisions.md name
  // deliberately (PRH-01 departure, disclosed in the delivery record for
  // this file).
  // eslint-disable-next-line no-console -- PRH-01 departure: no configured logger exists yet, sink is deliberate
  console.info(`telemetry:${eventName}`, payload);
}

/**
 * Exposes the eight-event telemetry catalog as typed callables. Each
 * callable is its own closure over emit() with its own fixed event name and
 * its own payload type, so calling one can never emit any of the other
 * seven.
 */
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
