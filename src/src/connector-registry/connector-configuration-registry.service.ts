import { ConnectorConfigurationNotFoundError } from '../errors/connector-configuration-not-found.error.js';
import { ConnectorConfigurationNotWellFormedError } from '../errors/connector-configuration-not-well-formed.error.js';
import {
  ConnectorPlaceholderOutsideInputSchemaError,
  type OrphanedPlaceholder,
} from '../errors/connector-placeholder-outside-input-schema.error.js';
import { IncompleteConnectorConfigurationError } from '../errors/incomplete-connector-configuration.error.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ICapabilitiesReader, RegisteredCapabilityForPlaceholderCheck } from './capabilities-reader.port.js';
import { orphanedPlaceholders } from './connector-placeholder-declaration-check.js';
import type {
  ConnectorConfiguration,
  ConnectorConfigurationRegistration,
} from './connector-configuration.js';
import type { IConnectorConfigurationStore } from './connector-configuration-store.port.js';

export type ConnectorConfigurationResolution =
  | { readonly held: true; readonly configuration: ConnectorConfiguration }
  | { readonly held: false; readonly connector: string };

const NO_REGISTERED_CAPABILITIES: ICapabilitiesReader = {
  readCapabilities: () => Promise.resolve([]),
};

export class ConnectorConfigurationRegistryService {
  public constructor(
    private readonly store: IConnectorConfigurationStore,
    private readonly capabilitiesReader: ICapabilitiesReader = NO_REGISTERED_CAPABILITIES,
  ) {}

  public async registerConnector(
    registration: ConnectorConfigurationRegistration,
  ): Promise<ConnectorConfiguration> {
    const configuration = heldConfiguration(registration);
    await this.refuseOrphanedPlaceholders(configuration);
    const held = await this.store.readConnectorConfigurations();
    const kept = held.filter((candidate) => candidate.connector !== configuration.connector);
    await this.store.writeConnectorConfigurations([...kept, configuration]);
    return configuration;
  }

  public async readConnectorConfiguration(connector: string): Promise<ConnectorConfigurationResolution> {
    const held = await this.store.readConnectorConfigurations();
    const configuration = held.find((candidate) => candidate.connector === connector);
    return configuration === undefined ? { held: false, connector } : { held: true, configuration };
  }

  public async readConnectorConfigurationOrThrow(connector: string): Promise<ConnectorConfiguration> {
    const resolution = await this.readConnectorConfiguration(connector);
    if (!resolution.held) {
      throw new ConnectorConfigurationNotFoundError(resolution.connector);
    }
    return resolution.configuration;
  }

  public async listConnectorConfigurations(
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<ConnectorConfiguration>> {
    const held = await this.store.readConnectorConfigurations();
    const total = held.length;
    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);
    return {
      data,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      pageCount: pageCountOf(total, pagination.limit),
    };
  }

  public async readRegisteredCapabilities(): Promise<readonly RegisteredCapabilityForPlaceholderCheck[]> {
    return this.capabilitiesReader.readCapabilities();
  }

  private async refuseOrphanedPlaceholders(configuration: ConnectorConfiguration): Promise<void> {
    const capabilities = (await this.capabilitiesReader.readCapabilities()).filter(
      (capability) => capability.connector === configuration.connector,
    );
    const orphaned = orphanedAcrossEveryCapability(configuration.configuration, capabilities);
    if (orphaned.length > 0) {
      throw new ConnectorPlaceholderOutsideInputSchemaError(orphaned);
    }
  }
}

function orphanedAcrossEveryCapability(
  configurationText: string,
  capabilities: readonly RegisteredCapabilityForPlaceholderCheck[],
): readonly OrphanedPlaceholder[] {
  if (capabilities.length === 0) {
    return [];
  }
  const perCapabilityOrphaned = capabilities.map(
    (capability) => new Set(orphanedPlaceholders(configurationText, capability.input_schema)),
  );
  const [first, ...rest] = perCapabilityOrphaned;
  const orphanedEverywhere = [...first].filter((placeholder) => rest.every((set) => set.has(placeholder)));
  return orphanedEverywhere.map((placeholder) => ({ placeholder, capabilities }));
}

function pageCountOf(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}

type DeclaredRegistration = ConnectorConfigurationRegistration & {
  readonly connector: string;
  readonly configuration: string;
};

function heldConfiguration(registration: ConnectorConfigurationRegistration): ConnectorConfiguration {
  const resolved: ConnectorConfigurationRegistration = {
    connector: registration.connector,
    configuration: wellFormedConfiguration(registration.configuration),
  };
  refuseRegistrationDepartures(resolved);
  return { connector: resolved.connector, configuration: resolved.configuration };
}

function wellFormedConfiguration(configuration: unknown): unknown {
  if (typeof configuration === 'string') {
    return textConfigurationOrThrow(configuration);
  }
  if (isPlainObject(configuration)) {
    return JSON.stringify(configuration);
  }
  if (configuration === null || Array.isArray(configuration)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration is not a JSON object');
  }
  return configuration;
}

function textConfigurationOrThrow(configuration: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configuration);
  } catch {
    throw new ConnectorConfigurationNotWellFormedError('configuration is not syntactically valid JSON');
  }
  if (!isPlainObject(parsed)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration does not parse to a JSON object');
  }
  return configuration;
}

export function parsedConnectorConfiguration(
  configuration: ConnectorConfiguration,
): Readonly<Record<string, unknown>> {
  const parsed: unknown = JSON.parse(configuration.configuration);
  if (!isPlainObject(parsed)) {
    throw new ConnectorConfigurationNotWellFormedError('configuration does not parse to a JSON object');
  }
  return parsed;
}

function refuseRegistrationDepartures(
  registration: ConnectorConfigurationRegistration,
): asserts registration is DeclaredRegistration {
  const problems = registrationProblems(registration);
  if (problems.length > 0) {
    throw new IncompleteConnectorConfigurationError(problems);
  }
}

function registrationProblems(registration: ConnectorConfigurationRegistration): string[] {
  const problems: string[] = [];
  if (isUndeclared(registration.connector)) {
    problems.push('connector is undeclared');
  }
  if (typeof registration.configuration !== 'string') {
    problems.push('configuration is not a plain object');
  }
  return problems;
}

function isUndeclared(value: string | undefined): boolean {
  return value === undefined || value === '';
}

function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
