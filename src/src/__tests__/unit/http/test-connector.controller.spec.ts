// Proof for task/stale-specification-citations-round-two/citations-corrected-again, criterion 6:
// the header comment's masking paragraph in test-connector.controller.ts cites
// rules/integration/a-diagnostic-response-masks-a-resolved-credential by identity for the
// credential-masking behavior it describes, rather than framing that behavior as this
// controller's own unattributed inference. handleTestConnectorRequest's own masking behavior is
// proven separately, on the wire, in test-connector.routes.spec.ts — this file proves only the
// citation.
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

// Added for task/case-input-requirements-and-diagnose-gate/refuse-diagnose-missing-required-attribute,
// whose own criterion 5 states: "test-connector's own diagnostic call is not held to this gate."
// This module's TestConnectorControllerDependencies declares no case-input-requirements read at
// all, and handleTestConnectorRequest above calls neither refuseSubjectMissingRequiredCaseInputs
// nor handleDiagnoseRequest — proved here by scanning this module's own import specifiers, the same
// convention diagnose-e2e.spec.ts already keeps for proving one composition cannot reach a named
// module it never imports.
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

it('imports neither the new required-case-inputs gate function nor the diagnose controller, so its own diagnostic call has no path into the gate', async () => {
  const source = await readFile(MODULE_PATH, 'utf8');
  const specifiers = [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1] ?? '');

  expect(specifiers).not.toContain('../investigation/subject-covers-case-input-requirements.js');
  expect(specifiers).not.toContain('./diagnose.controller.js');
});

// ------------------------------------------------------------------ task/connector-configuration-and-placeholder-contract/degrade-unresolved-connector-call-to-unavailable, criterion 6
//
// The sibling adapter (http-declarative-observation-source.adapter.ts) now
// catches both typed assembly failures connector-request-resolver.ts's own
// resolveConnectorRequest can throw and degrades each to an unavailable
// evidence outcome. This controller's own two direct calls to the same
// resolveConnectorRequest sit entirely outside that adapter and are left
// untouched by that fix: each test below drives handleTestConnectorRequest
// into exactly one of the two typed failures and asserts the returned
// promise rejects with it, uncaught — never resolving into a response DTO of
// any shape, and never reaching the injected httpClient at all.

/** A capability as readCapabilityByIdentity would resolve it, held — every field defaulted so a test states only what it is about. */
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

/** A connector configuration resolution whose stored text parses to the minimum HTTP shape this controller requires, overridable per test. */
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

/** A valid request body, every field defaulted so a test states only what it is about — the subject carries exactly one attribute, "id". */
function aRequestBody(overrides: Record<string, unknown> = {}): TestConnectorRequestDto {
  return {
    capability: { name: 'a-name', version: '1.0.0' },
    connector: 'a-connector',
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'id', value: 'a-subject-value' }] },
    requester: 'a-requester',
    ...overrides,
  } as TestConnectorRequestDto;
}

/** One dependency set resolving a held capability and a held connector configuration by default, so a test overrides only what it is about. */
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
