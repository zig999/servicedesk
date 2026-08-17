/**
 * Not a business error of the glossary itself: contracts/glossary/glossary-query's own
 * read-vocabulary-term answer states the absence as ordinary data — `{ held: false, vocabulary,
 * name }` — never an invented term and never a failure of the read (glossary-query.port.ts's own
 * TermResolution). This is a distinct class from ConceptNotHeldError
 * (concept-not-held.error.ts): that one names a concept the glossary does not currently hold,
 * resolved through readConcept's own ConceptResolution, which carries only a name; this one names
 * a term of one of the five vocabularies (subject-type, subject-attribute, outcome, action,
 * recipient), resolved through readVocabularyTerm's own TermResolution, whose held:false branch
 * carries the vocabulary alongside the name — a fact ConceptNotHeldError's context has no field
 * for and a reuse of that class would either drop or invent.
 *
 * GET /v1/glossary/{vocabulary}/{name} raises this typed error only at the HTTP boundary, once it
 * has read the ordinary `held: false` answer, so the shared status map (COR-04,
 * src/errors/status-map.ts) can resolve the refusal to a transport status in the one place that
 * table lives, rather than a status chosen inline in the route or its controller.
 */
export class VocabularyTermNotHeldError extends Error {
  public readonly context: Readonly<{ vocabulary: string; name: string }>;

  public constructor(vocabulary: string, name: string) {
    super(`the ${vocabulary} vocabulary does not currently hold a term named "${name}"`);
    this.name = 'VocabularyTermNotHeldError';
    this.context = { vocabulary, name };
  }
}
