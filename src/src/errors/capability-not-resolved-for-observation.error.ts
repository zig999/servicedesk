export class CapabilityNotResolvedForObservationError extends Error {
  public readonly context: Readonly<{ concept: string }>;

  public constructor(concept: string) {
    super(`observe-concept was called for concept "${concept}", but no capability is currently registered for it`);
    this.name = 'CapabilityNotResolvedForObservationError';
    this.context = { concept };
  }
}
