// Proof for the published capability-registry contract: read-capability
// answers the one capability currently answering a concept, whole and as
// registered, states an unanswered concept as data naming what was asked,
// and refuses — at registration and at read alike — anything that would let
// one concept resolve to more than one capability, so no priority chain has
// anywhere to live. The store boundary is an in-memory stand-in; no test
// here touches a file.
import { expect, it } from 'vitest';
import type { ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import { CapabilityRegistryService } from '../../../capability-registry/capability-registry.service.js';
import type { ICapabilityStore } from '../../../capability-registry/capability-store.port.js';
import type { Capability, CapabilityRegistration } from '../../../capability-registry/capability.js';
import { ConceptAlreadyAnsweredError } from '../../../errors/concept-already-answered.error.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';

/** The one nature that registers, spelled here rather than imported so a drift in the source fails. */
const READ_ONLY = 'read-only';

/** A stated timeout, so the answered contract carries a value the test chose rather than a default. */
const STATED_TIMEOUT_MS = 5_000;

/**
 * Stands in for the store boundary: a holding a test can change between two
 * reads, and an injectable failure, so the resolution is exercised without
 * any filesystem while its one-to-one logic stays real.
 */
class MutableCapabilityStore implements ICapabilityStore {
  private records: readonly Capability[] = [];
  private failure: Error | undefined;

  public hold(records: readonly Capability[]): void {
    this.records = records;
  }

  public failWith(failure: Error): void {
    this.failure = failure;
  }

  public async readCapabilities(): Promise<readonly Capability[]> {
    if (this.failure !== undefined) {
      throw this.failure;
    }
    return this.records;
  }

  public async writeCapabilities(capabilities: readonly Capability[]): Promise<void> {
    this.records = capabilities;
  }
}

/** The subject under test, held as the published contract rather than as the class behind it. */
function queryOver(store: MutableCapabilityStore): ICapabilityQuery {
  return new CapabilityRegistryService(store);
}

/** A capability as the registry would already hold it, for seeding the stand-in store. */
function heldCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: READ_ONLY,
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: STATED_TIMEOUT_MS,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

/** A registration declaring the whole contract, as a caller would submit it. */
function completeRegistration(overrides: CapabilityRegistration = {}): CapabilityRegistration {
  return { ...heldCapability(), ...overrides };
}

it('answers the one capability currently answering a concept, whole with its declared contract', async () => {
  const store = new MutableCapabilityStore();
  store.hold([
    heldCapability(),
    heldCapability({ name: 'another-capability', concept: 'another-concept', connector: 'another-connector' }),
  ]);
  const query = queryOver(store);

  const resolution = await query.readCapability('another-concept');

  expect(resolution).toEqual({
    held: true,
    capability: {
      name: 'another-capability',
      version: '1.0.0',
      nature: READ_ONLY,
      input_schema: 'an-input-schema',
      output_schema: 'an-output-schema',
      timeout: STATED_TIMEOUT_MS,
      connector: 'another-connector',
      concept: 'another-concept',
    },
  });
});

it('reports a concept no capability currently answers as an absence naming what was asked', async () => {
  const store = new MutableCapabilityStore();
  store.hold([heldCapability()]);
  const query = queryOver(store);

  const resolution = await query.readCapability('an-absent-concept');

  expect(resolution).toEqual({ held: false, concept: 'an-absent-concept' });
});

it('refuses to resolve a concept the holding answers twice rather than choosing among the answers', async () => {
  const store = new MutableCapabilityStore();
  store.hold([heldCapability(), heldCapability({ name: 'another-capability' })]);
  const query = queryOver(store);

  const refusal = await query.readCapability('a-concept').catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(DuplicateConceptAnswerError);
  expect(refusal).toMatchObject({
    context: {
      concept: 'a-concept',
      answers: [
        { name: 'a-capability', version: '1.0.0' },
        { name: 'another-capability', version: '1.0.0' },
      ],
    },
  });
});

it('refuses a registration naming a concept a different capability already answers', async () => {
  const store = new MutableCapabilityStore();
  store.hold([heldCapability()]);
  const registry = new CapabilityRegistryService(store);

  const refusal = await registry
    .registerCapability(completeRegistration({ name: 'another-capability' }))
    .catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(ConceptAlreadyAnsweredError);
  expect(refusal).toMatchObject({
    context: {
      concept: 'a-concept',
      answeredBy: { name: 'a-capability', version: '1.0.0' },
      registering: { name: 'another-capability', version: '1.0.0' },
    },
  });
});

it('lets a re-registration under its own name and version move its concept', async () => {
  const store = new MutableCapabilityStore();
  store.hold([heldCapability()]);
  const registry = new CapabilityRegistryService(store);

  await registry.registerCapability(completeRegistration({ concept: 'another-concept' }));

  expect(await registry.readCapability('a-concept')).toEqual({ held: false, concept: 'a-concept' });
  expect(await registry.readCapability('another-concept')).toEqual({
    held: true,
    capability: heldCapability({ concept: 'another-concept' }),
  });
});

it('no longer answers a concept the holding no longer carries, even after answering it once', async () => {
  const store = new MutableCapabilityStore();
  store.hold([heldCapability()]);
  const query = queryOver(store);
  await query.readCapability('a-concept'); // arranged to bait a remembered holding
  store.hold([]);

  const resolution = await query.readCapability('a-concept');

  expect(resolution).toEqual({ held: false, concept: 'a-concept' });
});

it('lets a failing store read reach the caller instead of answering an absence', async () => {
  const store = new MutableCapabilityStore();
  const failure = new Error('the store could not be read');
  store.failWith(failure);
  const query = queryOver(store);

  await expect(query.readCapability('a-concept')).rejects.toBe(failure);
});
