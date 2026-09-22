import type { ConceptUsageReference } from '../glossary/concept-usage-reader.port.js';

export class ConceptInUseError extends Error {
  public readonly context: Readonly<{ concept: string; reference: ConceptUsageReference }>;

  public constructor(concept: string, reference: ConceptUsageReference) {
    super(`the glossary refuses to remove concept "${concept}": it is still named by ${describe(reference)}`);
    this.name = 'ConceptInUseError';
    this.context = { concept, reference };
  }
}

function describe(reference: ConceptUsageReference): string {
  switch (reference) {
    case 'capability':
      return 'a registered capability that answers it';
    case 'evidence':
      return 'a collected evidence item';
    case 'citation':
      return 'an evaluation citation';
    case 'hypothesis-revision-collects':
      return "a hypothesis-revision's own collects";
  }
}
