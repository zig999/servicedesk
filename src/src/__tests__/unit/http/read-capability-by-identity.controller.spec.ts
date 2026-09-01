import { expect, it } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import { CapabilityIdentityNotFoundError } from '../../../errors/capability-identity-not-found.error.js';
import {
  handleReadCapabilityByIdentityRequest,
  type ReadCapabilityByIdentityControllerDependencies,
} from '../../../http/read-capability-by-identity.controller.js';

function heldCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

it('returns exactly the capability its readCapabilityByIdentity dependency resolves, unwrapped and untransformed', async () => {
  const capability = heldCapability({ name: 'a-known-capability', version: '2.0.0' });
  const dependencies: ReadCapabilityByIdentityControllerDependencies = {
    readCapabilityByIdentity: async () => capability,
  };

  const result = await handleReadCapabilityByIdentityRequest(dependencies, { name: 'a-known-capability', version: '2.0.0' });

  expect(result).toBe(capability);
});

it('propagates exactly the CapabilityIdentityNotFoundError its readCapabilityByIdentity dependency rejects with, raising none of its own', async () => {
  const refusal = new CapabilityIdentityNotFoundError('an-absent-capability', '9.9.9');
  const dependencies: ReadCapabilityByIdentityControllerDependencies = {
    readCapabilityByIdentity: async () => {
      throw refusal;
    },
  };

  await expect(
    handleReadCapabilityByIdentityRequest(dependencies, { name: 'an-absent-capability', version: '9.9.9' }),
  ).rejects.toBe(refusal);
});

it('calls its readCapabilityByIdentity dependency with exactly the given name and version, performing no held-check or transformation of the params itself', async () => {
  let received: readonly [string, string] | undefined;
  const dependencies: ReadCapabilityByIdentityControllerDependencies = {
    readCapabilityByIdentity: async (name, version) => {
      received = [name, version];
      return heldCapability({ name, version });
    },
  };

  await handleReadCapabilityByIdentityRequest(dependencies, { name: 'Mixed-Case', version: '1.0.0-RC.1' });

  expect(received).toEqual(['Mixed-Case', '1.0.0-RC.1']);
});

