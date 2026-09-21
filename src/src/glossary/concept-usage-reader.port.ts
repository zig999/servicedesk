export type ConceptUsageReference = 'capability' | 'evidence' | 'citation' | 'hypothesis-revision-collects';

export type ConceptUsageResolution =
  | { readonly named: true; readonly reference: ConceptUsageReference }
  | { readonly named: false };

export interface IConceptUsageReader {

  readConceptUsage(concept: string): Promise<ConceptUsageResolution>;
}
