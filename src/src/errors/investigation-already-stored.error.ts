/**
 * A business error of the investigation store: the given investigation's
 * identity already has a stored record, and an investigation is written
 * once and never mutated (rules/investigation/an-investigation-is-written-once)
 * — the write refuses rather than overwriting the earlier file, and refuses
 * before any write is attempted, the same before-any-write refusal shape
 * ConceptAlreadyAnsweredError already establishes for the capability
 * registry's own duplicate refusal.
 */
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
