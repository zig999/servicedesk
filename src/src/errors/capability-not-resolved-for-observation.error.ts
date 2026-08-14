/**
 * A configuration fault of HttpDeclarativeObservationSource: observe-concept
 * was called for a concept no capability is currently registered for — a
 * caller-contract fault, ordinarily unreachable, since
 * evidence-collection-stage.ts already checks
 * capabilities.readCapability(concept) before ever calling observe-concept
 * and answers 'unavailable' evidence of its own where nothing resolves.
 * Never one of the four evidence-result endings this adapter answers
 * (domain/investigation/evidence-result): a genuine unexpected fault,
 * propagated as a rejection rather than degraded to one of the four, the
 * same posture evidence-collection-stage.ts's own raceObservation already
 * documents and lets through uncaught.
 */
export class CapabilityNotResolvedForObservationError extends Error {
  public readonly context: Readonly<{ concept: string }>;

  public constructor(concept: string) {
    super(`observe-concept was called for concept "${concept}", but no capability is currently registered for it`);
    this.name = 'CapabilityNotResolvedForObservationError';
    this.context = { concept };
  }
}
