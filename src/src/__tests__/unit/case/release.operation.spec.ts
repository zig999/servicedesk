import { expect, it } from 'vitest';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import { ReleaseOperation } from '../../../case/release.operation.js';
import type {
  AssembledCaseVersion,
  CaseCatalogEntry,
  CaseVersionListItem,
  CreateDraftInput,
  DraftVersion,
  HypothesisIdentity,
  HypothesisRevisionInput,
  HypothesisRevisionListItem,
  HypothesisRevisionState,
  ICaseStore,
  PlaceHypothesisInput,
  UpdateDraftInput,
} from '../../../case/case-store.port.js';
import type { IHypothesisRevisionOwnStateQuery } from '../../../case/hypothesis-revision-own-state.port.js';
import { CaseVersionNotReleasableError } from '../../../errors/case-version-not-releasable.error.js';
import type { ConceptResolution, IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import type { TermVocabulary } from '../../../glossary/terms.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

const READ_ONLY = 'read-only';
const SLUG = 'a-case-under-release';
const VERSION = 1;

class AlwaysCoherentGlossary implements IGlossaryQuery {
  public async readVocabularyTerm(_vocabulary: TermVocabulary, name: string): Promise<TermResolution> {
    return { held: true, term: { name } };
  }

  public async readConcept(name: string): Promise<ConceptResolution> {
    return { held: true, concept: { name, accepts: ['a-subject'], ttl: 60, description: 'a fixture concept' } };
  }

  public async listVocabularyTerms(): Promise<never> {
    throw new Error('AlwaysCoherentGlossary.listVocabularyTerms is not scripted for this file');
  }

  public async listConcepts(): Promise<never> {
    throw new Error('AlwaysCoherentGlossary.listConcepts is not scripted for this file');
  }
}

class AlwaysCoherentCapabilities implements ICapabilityQuery {
  public async readCapability(concept: string): Promise<CapabilityResolution> {
    const capability: Capability = {
      name: `${concept}-reader`,
      version: '1.0.0',
      nature: READ_ONLY,
      input_schema: '{}',
      output_schema: '{}',
      timeout: 5_000,
      connector: 'a-connector',
      concept,
    };
    return { held: true, capability };
  }

  public async listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>> {
    return { data: [], total: 0, limit: pagination.limit, offset: pagination.offset, pageCount: 0 };
  }
}

class FakeReleaseStore implements ICaseStore, IHypothesisRevisionOwnStateQuery {
  private readonly assembled: AssembledCaseVersion;
  private readonly ownStates: ReadonlyMap<string, HypothesisRevisionState>;

  public constructor(assembled: AssembledCaseVersion, ownStates: ReadonlyMap<string, HypothesisRevisionState>) {
    this.assembled = assembled;
    this.ownStates = ownStates;
  }

  public async assembleVersion(): Promise<AssembledCaseVersion | undefined> {
    return this.assembled;
  }

  public async readHypothesisRevisionOwnState(
    _slug: string,
    hypothesisName: string,
    revision: number,
  ): Promise<HypothesisRevisionState | undefined> {
    return this.ownStates.get(`${hypothesisName}#${revision}`);
  }

  public async release(): Promise<void> {
    return;
  }

  public async findDraftVersion(): Promise<DraftVersion | undefined> {
    throw new Error('FakeReleaseStore.findDraftVersion is not scripted for this file');
  }

  public async listCases(): Promise<PaginatedResponse<CaseCatalogEntry>> {
    throw new Error('FakeReleaseStore.listCases is not scripted for this file');
  }

  public async listCaseVersions(): Promise<PaginatedResponse<CaseVersionListItem>> {
    throw new Error('FakeReleaseStore.listCaseVersions is not scripted for this file');
  }

  public async listHypotheses(): Promise<PaginatedResponse<HypothesisIdentity>> {
    throw new Error('FakeReleaseStore.listHypotheses is not scripted for this file');
  }

  public async listHypothesisRevisions(): Promise<PaginatedResponse<HypothesisRevisionListItem>> {
    throw new Error('FakeReleaseStore.listHypothesisRevisions is not scripted for this file');
  }

  public async createDraft(_input: CreateDraftInput): Promise<number> {
    throw new Error('FakeReleaseStore.createDraft is not scripted for this file');
  }

  public async insertHypothesisRevision(_input: HypothesisRevisionInput): Promise<number> {
    throw new Error('FakeReleaseStore.insertHypothesisRevision is not scripted for this file');
  }

  public async placeHypothesis(_input: PlaceHypothesisInput): Promise<void> {
    throw new Error('FakeReleaseStore.placeHypothesis is not scripted for this file');
  }

  public async removeManifestEntry(): Promise<void> {
    throw new Error('FakeReleaseStore.removeManifestEntry is not scripted for this file');
  }

  public async discard(): Promise<void> {
    throw new Error('FakeReleaseStore.discard is not scripted for this file');
  }

  public async updateDraft(_slug: string, _version: number, _attributes: UpdateDraftInput): Promise<void> {
    throw new Error('FakeReleaseStore.updateDraft is not scripted for this file');
  }
}

function assembledFixture(): AssembledCaseVersion {
  const resolution = { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } };
  return {
    slug: SLUG,
    version: VERSION,
    title: 'A case',
    when_to_use: 'when this fixture needs a document to assemble',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: resolution,
    state: 'draft',
    manifest: [
      {
        position: 1,
        hypothesis_revision: {
          hypothesis_name: 'h1',
          revision: 1,
          criterion: 'a criterion',
          collects: ['a-concept'],
          resolution,
        },
      },
    ],
  };
}

it(
  'names the hypothesis and states that its manifested revision is not released using "liberada", never the ' +
    'raw lifecycle token, when release finds a manifested revision whose own state is not released',
  async () => {
    const ownStates = new Map<string, HypothesisRevisionState>([['h1#1', 'draft']]);
    const store = new FakeReleaseStore(assembledFixture(), ownStates);
    const operation = new ReleaseOperation(store, new AlwaysCoherentGlossary(), new AlwaysCoherentCapabilities());

    const refusal = await operation.release(SLUG, VERSION).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseVersionNotReleasableError);
    const violations = (refusal as CaseVersionNotReleasableError).context.violations;
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('h1');
    expect(violations[0]).toMatch(/\bliberada\b/);
    expect(violations[0]).not.toMatch(/\breleased\b/i);
    expect(violations[0]).not.toMatch(/\bdraft\b/i);
  },
);

it(
  'names the structural violation and the manifest-own-state violation together, refusing once, when a ' +
    'release attempt fails a structural rule and separately manifests a still-draft hypothesis-revision',
  async () => {
    const assembled: AssembledCaseVersion = { ...assembledFixture(), title: '' };
    const ownStates = new Map<string, HypothesisRevisionState>([['h1#1', 'draft']]);
    const store = new FakeReleaseStore(assembled, ownStates);
    const operation = new ReleaseOperation(store, new AlwaysCoherentGlossary(), new AlwaysCoherentCapabilities());

    const refusal = await operation.release(SLUG, VERSION).catch((error: unknown) => error);

    expect(refusal).toBeInstanceOf(CaseVersionNotReleasableError);
    const violations = (refusal as CaseVersionNotReleasableError).context.violations;
    expect(violations).toHaveLength(2);
    expect(violations.some((violation) => violation.includes('o título') && violation.includes('em branco'))).toBe(
      true,
    );
    expect(violations.some((violation) => violation.includes('h1') && /\bliberada\b/.test(violation))).toBe(true);
  },
);
