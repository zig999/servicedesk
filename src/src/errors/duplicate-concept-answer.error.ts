/** The identity of a capability, by name and version, as the refusal names it. */
type CapabilityIdentity = Readonly<{ name: string; version: string }>;

/**
 * A business error of the capability registry: its holding answers one
 * concept with more than one capability, where each concept resolves to
 * exactly one (rules/integration/one-capability-answers-one-concept). The
 * resolution refuses rather than choosing among the answers, because any
 * choice would be the fallback chain the lookup does not have.
 */
export class DuplicateConceptAnswerError extends Error {
  public readonly context: Readonly<{
    concept: string;
    answers: readonly CapabilityIdentity[];
  }>;

  public constructor(concept: string, answers: readonly CapabilityIdentity[]) {
    super(
      `the registry holds ${answers.length} capabilities answering the concept "${concept}", ` +
        `where each concept resolves to exactly one capability`,
    );
    this.name = 'DuplicateConceptAnswerError';
    this.context = {
      concept,
      answers: answers.map((answer) => ({ name: answer.name, version: answer.version })),
    };
  }
}
