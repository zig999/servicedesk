export class ConceptNotAnsweredError extends Error {
  public readonly context: Readonly<{ concept: string }>;

  public constructor(concept: string) {
    super(`no capability currently answers the concept "${concept}"`);
    this.name = 'ConceptNotAnsweredError';
    this.context = { concept };
  }
}
