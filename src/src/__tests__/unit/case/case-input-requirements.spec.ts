import { expect, it } from 'vitest';
import type {
  CapabilityResolution,
  ICapabilityQuery,
} from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import { deriveCaseInputRequirements, everyRegisteredCapability } from '../../../case/case-input-requirements.js';
import type { Case } from '../../../case/case.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

const READ_ONLY = 'read-only';

function caseWithCollects(concepts: readonly string[]): Case {
  return {
    slug: 'a-case',
    title: 'a-title',
    when_to_use: 'a-when-to-use',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject-type',
    fallback: { outcome: 'a-fallback-outcome', referral: { action: 'a-fallback-action', recipient: 'a-fallback-recipient' } },
    state: 'draft',
    manifest: [
      {
        position: 1,
        hypothesis_revision: {
          hypothesis: { name: 'h1' },
          revision: 1,
          criterion: 'a-criterion',
          collects: [...concepts],
          resolution: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } },
        },
      },
    ],
    hypotheses: [],
  };
}

function capability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: READ_ONLY,
    input_schema: '{"properties":{}}',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

it('returns one entry per distinct subject attribute the sole answering capability declares in its own input schema properties', () => {
  const capA = capability({ name: 'cap-a', concept: 'concept-a', input_schema: '{"properties":{"x":{},"y":{}}}' });
  const theCase = caseWithCollects(['concept-a']);

  const result = deriveCaseInputRequirements(theCase, [capA]);

  expect(result.requirements.map((requirement) => requirement.attribute)).toEqual(['x', 'y']);
});

it("dedupes an attribute two different concepts' own sole answerers both declare into the one entry, naming every asking capability on it", () => {
  const capA = capability({ name: 'cap-a', concept: 'concept-a', input_schema: '{"properties":{"x":{},"y":{}}}' });
  const capB = capability({ name: 'cap-b', concept: 'concept-b', input_schema: '{"properties":{"y":{},"z":{}}}' });
  const theCase = caseWithCollects(['concept-a', 'concept-b']);

  const result = deriveCaseInputRequirements(theCase, [capA, capB]);

  expect(result.requirements).toEqual([
    { attribute: 'x', required: false, capabilities: [{ name: 'cap-a', version: '1.0.0' }] },
    { attribute: 'y', required: false, capabilities: [{ name: 'cap-a', version: '1.0.0' }, { name: 'cap-b', version: '1.0.0' }] },
    { attribute: 'z', required: false, capabilities: [{ name: 'cap-b', version: '1.0.0' }] },
  ]);
});

it("marks an attribute required when any answering capability's own input schema names it in required, and not required when none do", () => {
  const capA = capability({ name: 'cap-a', concept: 'concept-a', input_schema: '{"properties":{"x":{},"y":{}},"required":["x"]}' });
  const capB = capability({ name: 'cap-b', concept: 'concept-b', input_schema: '{"properties":{"y":{},"w":{}},"required":["y"]}' });
  const theCase = caseWithCollects(['concept-a', 'concept-b']);

  const result = deriveCaseInputRequirements(theCase, [capA, capB]);

  const requiredByAttribute = Object.fromEntries(result.requirements.map((requirement) => [requirement.attribute, requirement.required]));
  expect(requiredByAttribute).toEqual({ x: true, y: true, w: false });
});

it('names every currently registered capability that answers a plan concept and declares the attribute, not only the first one seen', () => {
  const capA = capability({ name: 'cap-a', concept: 'concept-a', input_schema: '{"properties":{"shared":{}}}' });
  const capB = capability({ name: 'cap-b', concept: 'concept-b', input_schema: '{"properties":{"shared":{}}}' });
  const theCase = caseWithCollects(['concept-a', 'concept-b']);

  const result = deriveCaseInputRequirements(theCase, [capA, capB]);

  expect(result.requirements).toEqual([
    { attribute: 'shared', required: false, capabilities: [{ name: 'cap-a', version: '1.0.0' }, { name: 'cap-b', version: '1.0.0' }] },
  ]);
});

it('contributes no attribute for a concept the collection plan holds that no registered capability currently answers', () => {
  const capA = capability({ name: 'cap-a', concept: 'concept-a', input_schema: '{"properties":{"x":{}}}' });
  const theCase = caseWithCollects(['concept-a', 'concept-unanswered']);

  const result = deriveCaseInputRequirements(theCase, [capA]);

  expect(result.requirements.map((requirement) => requirement.attribute)).toEqual(['x']);
});

it('contributes no attribute for a concept more than one registered capability currently answers, even though each declares its own attribute', () => {
  const capA = capability({ name: 'cap-a', concept: 'concept-dup', input_schema: '{"properties":{"x":{}}}' });
  const capB = capability({ name: 'cap-b', concept: 'concept-dup', input_schema: '{"properties":{"y":{}}}' });
  const theCase = caseWithCollects(['concept-dup']);

  const result = deriveCaseInputRequirements(theCase, [capA, capB]);

  expect(result.requirements).toEqual([]);
  expect(result.capabilities_with_malformed_input_schema).toEqual([]);
});

it('contributes no attribute and names the capability apart, for a sole answerer whose stored input schema does not currently hold a well-formed properties object', () => {
  const legacy = capability({ name: 'legacy-cap', concept: 'concept-legacy', input_schema: '{"properties":"not-an-object"}' });
  const theCase = caseWithCollects(['concept-legacy']);

  const result = deriveCaseInputRequirements(theCase, [legacy]);

  expect(result.requirements).toEqual([]);
  expect(result.capabilities_with_malformed_input_schema).toEqual([{ name: 'legacy-cap', version: '1.0.0' }]);
});

it('still derives the attributes of a well-formed capability while naming a different, currently malformed one apart', () => {
  const legacy = capability({ name: 'legacy-cap', concept: 'concept-legacy', input_schema: '{"properties":"not-an-object"}' });
  const good = capability({ name: 'good-cap', concept: 'concept-good', input_schema: '{"properties":{"g":{}}}' });
  const theCase = caseWithCollects(['concept-legacy', 'concept-good']);

  const result = deriveCaseInputRequirements(theCase, [legacy, good]);

  expect(result.requirements).toEqual([{ attribute: 'g', required: false, capabilities: [{ name: 'good-cap', version: '1.0.0' }] }]);
  expect(result.capabilities_with_malformed_input_schema).toEqual([{ name: 'legacy-cap', version: '1.0.0' }]);
});

it('contributes no attribute, and does not name the capability as malformed, for a sole answerer whose stored input schema simply omits properties — the reused declaredInputSchemaShape convention that an absent properties key declares it empty rather than departs from it', () => {
  const noProperties = capability({ name: 'no-properties-cap', concept: 'concept-no-properties', input_schema: '{}' });
  const theCase = caseWithCollects(['concept-no-properties']);

  const result = deriveCaseInputRequirements(theCase, [noProperties]);

  expect(result.requirements).toEqual([]);
  expect(result.capabilities_with_malformed_input_schema).toEqual([]);
});

it('answers no requirements and no malformed capability for a case version whose collection plan holds no concept at all', () => {
  const theCase = caseWithCollects([]);

  const result = deriveCaseInputRequirements(theCase, []);

  expect(result).toEqual({ requirements: [], capabilities_with_malformed_input_schema: [] });
});

it('answers identically regardless of the case version state, since nothing here reads it at all', () => {
  const capA = capability({ name: 'cap-a', concept: 'concept-a', input_schema: '{"properties":{"x":{}},"required":["x"]}' });
  const draft = caseWithCollects(['concept-a']);
  const released: Case = { ...draft, state: 'released', released_at: '2024-06-01T00:00:00.000Z' };

  const draftResult = deriveCaseInputRequirements(draft, [capA]);
  const releasedResult = deriveCaseInputRequirements(released, [capA]);

  expect(releasedResult).toEqual(draftResult);
});

it('throws when a sole answering capability\'s own stored input_schema is not syntactically valid JSON at all, since this derivation trusts the registration invariant rather than guarding the parse itself', () => {
  const brokenJson = capability({ name: 'broken-cap', concept: 'concept-broken', input_schema: 'not valid json at all' });
  const theCase = caseWithCollects(['concept-broken']);

  expect(() => deriveCaseInputRequirements(theCase, [brokenJson])).toThrow(SyntaxError);
});

class PaginatedFakeCapabilityQuery implements ICapabilityQuery {
  public constructor(private readonly all: readonly Capability[]) {}

  public async readCapability(): Promise<CapabilityResolution> {
    throw new Error('PaginatedFakeCapabilityQuery.readCapability is not scripted for this file');
  }

  public async listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>> {
    const page = this.all.slice(pagination.offset, pagination.offset + pagination.limit);
    return {
      data: page,
      total: this.all.length,
      limit: pagination.limit,
      offset: pagination.offset,
      pageCount: pagination.limit > 0 ? Math.ceil(this.all.length / pagination.limit) : 0,
    };
  }
}

it('reads every currently registered capability rather than truncating at a typical page size, so a concept only the 200th-registered capability answers still contributes its attribute', async () => {
  const many: Capability[] = Array.from({ length: 200 }, (_, index) =>
    capability({ name: `cap-${index}`, concept: `concept-${index}`, input_schema: `{"properties":{"attr-${index}":{}}}` }),
  );
  const query = new PaginatedFakeCapabilityQuery(many);
  const theCase = caseWithCollects(many.map((_, index) => `concept-${index}`));

  const registered = await everyRegisteredCapability(query);
  const result = deriveCaseInputRequirements(theCase, registered);

  expect(result.requirements.map((requirement) => requirement.attribute)).toContain('attr-199');
});

it("answers exactly the data page listCapabilities resolves, changing nothing about it", async () => {
  const capA = capability({ name: 'cap-a' });
  const query: ICapabilityQuery = {
    readCapability: async () => {
      throw new Error('not scripted for this test');
    },
    listCapabilities: async () => ({ data: [capA], total: 1, limit: Number.MAX_SAFE_INTEGER, offset: 0, pageCount: 1 }),
  };

  const result = await everyRegisteredCapability(query);

  expect(result).toEqual([capA]);
});
