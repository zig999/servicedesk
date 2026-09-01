import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it, vi } from 'vitest';
import type { CapabilityIdentityResolution } from '../../../capability-registry/capability-registry.service.js';
import type { Capability } from '../../../capability-registry/capability.js';
import type { ConnectorConfigurationResolution } from '../../../connector-registry/connector-configuration-registry.service.js';
import { ConnectorPlaceholderNotResolvedError } from '../../../errors/connector-placeholder-not-resolved.error.js';
import { IncompleteConnectorCallDescriptorError } from '../../../errors/incomplete-connector-call-descriptor.error.js';
import { handleTestConnectorRequest, type TestConnectorControllerDependencies } from '../../../http/test-connector.controller.js';
import type { TestConnectorRequestDto } from '../../../http/dto/test-connector.dto.js';

const MODULE_PATH = fileURLToPath(new URL('../../../http/test-connector.controller.ts', import.meta.url));

function proseOf(source: string): string {
  return source
    .split('\n')
    .map((line) => line.replace(/^\s*(\/\*\*|\*\/|\*|\/\/)\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

it("the header comment's masking paragraph cites rules/integration/a-diagnostic-response-masks-a-resolved-credential, rather than framing the masking as this controller's own unattributed inference", async () => {
  const source = await readFile(MODULE_PATH, 'utf8');
  const header = proseOf(source.slice(0, source.indexOf('import type')));

  expect(header).not.toContain("this controller's own inference");
  expect(header).toContain('rules/integration/a-diagnostic-response-masks-a-resolved-credential');
  expect(header).toContain(
    "a connector configuration's diagnostic call masks whatever value a credential placeholder in its own call resolves to, so the response echoing that call back never carries a credential's real value",
  );
  expect(header).toContain("this project's own standard (SEC-03, SEC-04) independently forbids a credential reaching a client response too");
});

const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

it('imports neither the new required-case-inputs gate function nor the diagnose controller, so its own diagnostic call has no path into the gate', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');
  const specifiers = [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1] ?? '');

  expect(specifiers).not.toContain('../investigation/subject-covers-case-input-requirements.js');
  expect(specifiers).not.toContain('./diagnose.controller.js');
});

function heldCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'a-name',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{"type":"object"}',
    output_schema: '{"type":"object"}',
    timeout: 5_000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

function heldConnectorConfigurationResolution(
  configurationOverrides: Readonly<Record<string, unknown>> = {},
): ConnectorConfigurationResolution {
  return {
    held: true,
    configuration: {
      connector: 'a-connector',
      configuration: JSON.stringify({
        address: 'https://api.example.com/records',
        method: 'GET',
        headers: {},
        responseMap: {},
        statusMap: {},
        ...configurationOverrides,
      }),
    },
  };
}

function aRequestBody(overrides: Record<string, unknown> = {}): TestConnectorRequestDto {
  return {
    capability: { name: 'a-name', version: '1.0.0' },
    connector: 'a-connector',
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'a-subject-value' }] },
    requester: 'a-requester',
    ...overrides,
  } as TestConnectorRequestDto;
}

function aDependencies(overrides: Partial<TestConnectorControllerDependencies> = {}): TestConnectorControllerDependencies {
  return {
    readCapabilityByIdentity: vi
      .fn<(name: string, version: string) => Promise<CapabilityIdentityResolution>>()
      .mockResolvedValue({ held: true, capability: heldCapability() }),
    readConnectorConfiguration: vi
      .fn<(connector: string) => Promise<ConnectorConfigurationResolution>>()
      .mockResolvedValue(heldConnectorConfigurationResolution()),
    httpClient: vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>() as unknown as typeof fetch,
    ...overrides,
  };
}

it('propagates ConnectorPlaceholderNotResolvedError uncaught, issuing no HTTP call, when the named connector configuration embeds a Subject-attribute placeholder the given Subject does not carry', async () => {
  const httpClient = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
  const dependencies = aDependencies({
    readConnectorConfiguration: vi
      .fn<(connector: string) => Promise<ConnectorConfigurationResolution>>()
      .mockResolvedValue(
        heldConnectorConfigurationResolution({
          address: 'https://api.example.com/${subject:an-attribute-the-subject-does-not-carry}',
        }),
      ),
    httpClient: httpClient as unknown as typeof fetch,
  });

  await expect(handleTestConnectorRequest(dependencies, aRequestBody())).rejects.toBeInstanceOf(ConnectorPlaceholderNotResolvedError);
  expect(httpClient).not.toHaveBeenCalled();
});

it("propagates IncompleteConnectorCallDescriptorError uncaught, issuing no HTTP call, when the named connector configuration is missing its address", async () => {
  const httpClient = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
  const dependencies = aDependencies({
    readConnectorConfiguration: vi
      .fn<(connector: string) => Promise<ConnectorConfigurationResolution>>()
      .mockResolvedValue(heldConnectorConfigurationResolution({ address: undefined })),
    httpClient: httpClient as unknown as typeof fetch,
  });

  await expect(handleTestConnectorRequest(dependencies, aRequestBody())).rejects.toBeInstanceOf(IncompleteConnectorCallDescriptorError);
  expect(httpClient).not.toHaveBeenCalled();
});

it('still issues its call and returns its ordinary response outcome for a subject missing "contract-number" — an attribute-value a case-input requirement would mark required and that would refuse a diagnose before collection were this call held to that gate', async () => {
  const httpClient = vi
    .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
    .mockResolvedValue(new Response(null, { status: 200 }));
  const dependencies = aDependencies({ httpClient: httpClient as unknown as typeof fetch });
  const body = aRequestBody({
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'a-subject-value' }] },
  });

  const outcome = await handleTestConnectorRequest(dependencies, body);

  expect(httpClient).toHaveBeenCalledTimes(1);
  expect(outcome.response).toMatchObject({ kind: 'response', status: 200 });
});
