type CapabilityIdentity = Readonly<{ name: string; version: string }>;

export class ConceptAlreadyAnsweredError extends Error {
  public readonly context: Readonly<{
    concept: string;
    answeredBy: CapabilityIdentity;
    registering: CapabilityIdentity;
  }>;

  public constructor(concept: string, answeredBy: CapabilityIdentity, registering: CapabilityIdentity) {
    super(
      `the registry refuses "${registering.name}" version "${registering.version}" for the concept ` +
        `"${concept}": "${answeredBy.name}" version "${answeredBy.version}" already answers it, ` +
        `and each concept resolves to exactly one capability`,
    );
    this.name = 'ConceptAlreadyAnsweredError';
    this.context = {
      concept,
      answeredBy: { name: answeredBy.name, version: answeredBy.version },
      registering: { name: registering.name, version: registering.version },
    };
  }
}
