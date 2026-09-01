type CapabilityIdentity = Readonly<{ name: string; version: string }>;

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
