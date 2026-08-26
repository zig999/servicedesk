/**
 * The condition of HttpDeclarativeObservationSource: observe-concept was
 * called for a concept no capability is currently registered for — ordinarily
 * unreachable, since evidence-collection-stage.ts already checks
 * capabilities.readCapability(concept) before ever calling observe-concept
 * and answers 'unavailable' evidence of its own where nothing resolves, but
 * still reachable through a race between that check and this adapter's own
 * later read. Instantiated to read its own `.name` and never thrown from
 * this adapter's own observe-concept path: the adapter answers 'unavailable'
 * with a result_detail naming this class rather than raising it
 * (rules/integration/an-unresolvable-observation-ends-unavailable,
 * domain/investigation/evidence). Still an ordinary thrown Error everywhere
 * else it is used.
 */
export class CapabilityNotResolvedForObservationError extends Error {
  public readonly context: Readonly<{ concept: string }>;

  public constructor(concept: string) {
    super(`observe-concept was called for concept "${concept}", but no capability is currently registered for it`);
    this.name = 'CapabilityNotResolvedForObservationError';
    this.context = { concept };
  }
}
