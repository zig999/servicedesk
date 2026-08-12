/**
 * A business error of the investigation context: the factory is asked to
 * build an investigation with no written_at, and written_at is always
 * required (domain/investigation/investigation's own written_at attribute,
 * task/case-and-investigation-model/investigation-record-shape) — refused
 * before any investigation is constructed, the same
 * refuse-before-constructing-anything convention this factory's other two
 * refusals already keep. The same name-message-context shape
 * RequesterRequiredError and SubjectCarriesNoAttributeError already
 * establish for their own contexts.
 */
export class WrittenAtRequiredError extends Error {
  public readonly context: Readonly<{ given: string | undefined }>;

  public constructor(given: string | undefined) {
    super('an investigation requires a written_at; none was given');
    this.name = 'WrittenAtRequiredError';
    this.context = { given };
  }
}
