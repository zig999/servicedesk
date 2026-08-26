// Proof for task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation:
// handleReadCapabilityByIdentityRequest itself, exercised directly as a plain function call rather
// than through Fastify — the one seam this task's own relocation touches. Proves the controller now
// performs no held-check-and-throw of its own (criterion 2): it returns exactly whatever its one
// injected readCapabilityByIdentity dependency resolves, and propagates exactly whatever it rejects
// with, unaltered — never branching on a resolution shape of its own. The dependency itself is a
// stand-in (TST-03 — a stand-in replaces a boundary, never business logic): the real service-level
// wrapper it is wired to in production, CapabilityRegistryService.readCapabilityByIdentityOrThrow,
// is proved separately in capability-registry.service.spec.ts.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import { CapabilityIdentityNotFoundError } from '../../../errors/capability-identity-not-found.error.js';
import {
  handleReadCapabilityByIdentityRequest,
  type ReadCapabilityByIdentityControllerDependencies,
} from '../../../http/read-capability-by-identity.controller.js';

/** A capability exactly as the service-level wrapper's held branch would resolve it, every declared attribute present. */
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

// ------------------------------------------------------------------ criterion 2

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

// ------------------------------------------------------------------ task/stale-specification-citations/citations-corrected, criterion 3

// Strips every line's own leading comment marker (a line-comment slash pair, or a block-comment
// opener, closer or continuation star) and collapses what remains to one line of prose, so a
// comment wrapped across several source lines compares the same as its own single-line paraphrase.
function proseOf(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

it('the dependency comment states read-capability-by-identity is one of the published capability-registry contract\'s four operations, not a wrapper standing outside it', async () => {
  const source = await readFile(fileURLToPath(new URL('../../../http/read-capability-by-identity.controller.ts', import.meta.url)), 'utf8');
  const prose = proseOf(source);

  expect(prose).not.toMatch(/outside (?:the|this) (?:published )?capability-registry contract/i);
  expect(prose).toContain('though the operation it serves is');
  expect(prose).toContain(
    'contracts/integration/capability-registry names read-capability, by concept, read-capability-by-identity, list-capabilities and register-capability',
  );
});

it("the transport-status comment cites constraints/the-capability-identity-read-refuses-an-unregistered-identity as the specification's own HTTP 404 decision, rather than claiming it undecided", async () => {
  const source = await readFile(fileURLToPath(new URL('../../../http/read-capability-by-identity.controller.ts', import.meta.url)), 'utf8');
  const prose = proseOf(source);

  expect(prose).not.toMatch(/undecided by the specification/i);
  expect(prose).toContain(
    "specification's own decision (constraints/the-capability-identity-read-refuses-an-unregistered-identity)",
  );
  expect(prose).toContain('is where that decision is enacted rather than chosen inline');
});
