/**
 * Not a business error of the registry itself: contracts/integration/capability-registry's
 * own read-capability answer states the absence as ordinary data — `{ held: false, concept }`
 * — never an invented capability and never a failure of the read
 * (capability-query.port.ts's own CapabilityResolution). GET /v1/capabilities/{concept} raises
 * this typed error only at the HTTP boundary, once it has read that ordinary `held: false`
 * answer, so the shared status map (COR-04, src/errors/status-map.ts) can resolve the refusal
 * to a transport status in the one place that table lives, rather than a status chosen inline
 * in the route or its controller.
 */
export class ConceptNotAnsweredError extends Error {
  public readonly context: Readonly<{ concept: string }>;

  public constructor(concept: string) {
    super(`no capability currently answers the concept "${concept}"`);
    this.name = 'ConceptNotAnsweredError';
    this.context = { concept };
  }
}
