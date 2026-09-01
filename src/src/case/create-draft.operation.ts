import type { CreateDraftInput, ICaseStore } from './case-store.port.js';

export type CreatedDraft = {
  readonly slug: string;
  readonly version: number;
};

export interface ICreateDraft {

  createDraft(input: CreateDraftInput): Promise<CreatedDraft>;
}

export class CreateDraftOperation implements ICreateDraft {
  public constructor(private readonly caseStore: ICaseStore) {}

  public async createDraft(input: CreateDraftInput): Promise<CreatedDraft> {
    const version = await this.caseStore.createDraft(input);
    return { slug: input.slug, version };
  }
}
