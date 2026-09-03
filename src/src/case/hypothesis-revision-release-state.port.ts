export type HighestRevisionReleaseState =
  | { readonly revision: undefined }
  | { readonly revision: number; readonly released_referenced: boolean };

export interface IHighestRevisionReleaseStateQuery {

  readHighestRevisionReleaseState(slug: string, hypothesisName: string): Promise<HighestRevisionReleaseState>;
}
