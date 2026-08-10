/**
 * A business error of the investigation context: the subject being built
 * carries no attribute-value at all, and a subject with none identifies
 * nothing — no capability's connector would have anything to derive its call
 * from (rules/investigation/a-subject-carries-at-least-one-attribute). The
 * same name-message-context shape InvestigationNotBuildableError and
 * CapabilityNotReadOnlyError already establish for their own contexts.
 */
export class SubjectCarriesNoAttributeError extends Error {
  public readonly context: Readonly<{ type: string }>;

  public constructor(type: string) {
    super(`a subject of type "${type}" carries no attribute-value; at least one is required`);
    this.name = 'SubjectCarriesNoAttributeError';
    this.context = { type };
  }
}
