export class InvestigationAlreadyStoredError extends Error {
  public readonly context: Readonly<{ id: string }>;

  public constructor(id: string) {
    super(
      `an investigation with id "${id}" is already stored, and an investigation is written once and never mutated`,
    );
    this.name = 'InvestigationAlreadyStoredError';
    this.context = { id };
  }
}
