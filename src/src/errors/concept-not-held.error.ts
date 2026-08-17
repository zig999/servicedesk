/**
 * Not a business error of the glossary itself: contracts/glossary/glossary-query's own read-concept
 * answer states the absence as ordinary data — `{ held: false, name }` — never an invented concept
 * and never a failure of the read (glossary-query.port.ts's own ConceptResolution). This is a
 * distinct bounded context from capability-registry's own read-capability
 * (contracts/integration/capability-registry, src/errors/concept-not-answered.error.ts's own
 * ConceptNotAnsweredError): that error names a capability nothing currently *answers* a concept
 * with, while this one names a concept the glossary itself does not currently *hold* — a different
 * question over a different resolution type, so it is a distinct class rather than a reuse of that
 * one. It is also distinct from ConceptNotInGlossaryError, which is this same glossary context's
 * own write-side refusal for a hypothesis-revision naming one or more concepts the glossary does
 * not hold (concept-not-in-glossary.error.ts) — a different criterion, a different caller and a
 * different context shape (several offending names, a slug and a hypothesis name, rather than the
 * one name a single read resolves).
 *
 * GET /v1/glossary/concepts/{name} raises this typed error only at the HTTP boundary, once it has
 * read the ordinary `held: false` answer, so the shared status map (COR-04,
 * src/errors/status-map.ts) can resolve the refusal to a transport status in the one place that
 * table lives, rather than a status chosen inline in the route or its controller.
 */
export class ConceptNotHeldError extends Error {
  public readonly context: Readonly<{ name: string }>;

  public constructor(name: string) {
    super(`the glossary does not currently hold a concept named "${name}"`);
    this.name = 'ConceptNotHeldError';
    this.context = { name };
  }
}
