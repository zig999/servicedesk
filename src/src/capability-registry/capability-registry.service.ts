import { orphanedPlaceholders } from '../connector-registry/connector-placeholder-declaration-check.js';
import { CapabilityIdentityNotFoundError } from '../errors/capability-identity-not-found.error.js';
import { CapabilityNotReadOnlyError } from '../errors/capability-not-read-only.error.js';
import { CapabilitySchemaNotWellFormedError } from '../errors/capability-schema-not-well-formed.error.js';
import { ConceptAlreadyAnsweredError } from '../errors/concept-already-answered.error.js';
import {
  ConnectorPlaceholderOutsideInputSchemaError,
  type OrphanedPlaceholder,
} from '../errors/connector-placeholder-outside-input-schema.error.js';
import { DuplicateConceptAnswerError } from '../errors/duplicate-concept-answer.error.js';
import { IncompleteCapabilityContractError } from '../errors/incomplete-capability-contract.error.js';
import { MalformedCapabilityInputSchemaError } from '../errors/malformed-capability-input-schema.error.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import { inputSchemaShapeProblems } from './capability-input-schema-shape.js';
import type { CapabilityResolution, ICapabilityQuery } from './capability-query.port.js';
import type { ICapabilityStore } from './capability-store.port.js';
import type {
  IConnectorConfigurationsReader,
  RegisteredConnectorConfigurationForPlaceholderCheck,
} from './connector-configurations-reader.port.js';
import {
  DEFAULT_CAPABILITY_TIMEOUT_MS,
  READ_ONLY_NATURE,
  REQUIRED_REGISTRATION_ATTRIBUTES,
  SCHEMA_ATTRIBUTES,
  type Capability,
  type CapabilityRegistration,
} from './capability.js';

export type CapabilityIdentityResolution =
  | { readonly held: true; readonly capability: Capability }
  | { readonly held: false; readonly name: string; readonly version: string };

const NO_REGISTERED_CONNECTOR_CONFIGURATIONS: IConnectorConfigurationsReader = {
  readConnectorConfigurations: () => Promise.resolve([]),
};

export class CapabilityRegistryService implements ICapabilityQuery {
  public constructor(
    private readonly store: ICapabilityStore,
    private readonly connectorConfigurationsReader: IConnectorConfigurationsReader = NO_REGISTERED_CONNECTOR_CONFIGURATIONS,
  ) {}

  public async registerCapability(registration: CapabilityRegistration): Promise<Capability> {
    const capability = heldCapability(registration);
    await this.refuseOrphanedPlaceholders(capability);
    const held = await this.store.readCapabilities();
    const kept = held.filter((candidate) => !sameIdentity(candidate, capability));
    refuseAnsweredConcept(kept, capability);
    await this.store.writeCapabilities([...kept, capability]);
    return capability;
  }

  public async readCapability(concept: string): Promise<CapabilityResolution> {
    const held = await this.store.readCapabilities();
    const answers = held.filter((candidate) => candidate.concept === concept);
    if (answers.length > 1) {
      throw new DuplicateConceptAnswerError(concept, answers);
    }
    const capability = answers[0];
    return capability === undefined ? { held: false, concept } : { held: true, capability };
  }

  public async readCapabilityByIdentity(name: string, version: string): Promise<CapabilityIdentityResolution> {
    const held = await this.store.readCapabilities();
    const capability = held.find((candidate) => candidate.name === name && candidate.version === version);
    return capability === undefined ? { held: false, name, version } : { held: true, capability };
  }

  public async readCapabilityByIdentityOrThrow(name: string, version: string): Promise<Capability> {
    const resolution = await this.readCapabilityByIdentity(name, version);
    if (!resolution.held) {
      throw new CapabilityIdentityNotFoundError(resolution.name, resolution.version);
    }
    return resolution.capability;
  }

  public async listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>> {
    const held = await this.store.readCapabilities();
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

  public async readRegisteredConnectorConfigurations(): Promise<
    readonly RegisteredConnectorConfigurationForPlaceholderCheck[]
  > {
    return this.connectorConfigurationsReader.readConnectorConfigurations();
  }

  private async refuseOrphanedPlaceholders(capability: Capability): Promise<void> {
    const configurations = (await this.connectorConfigurationsReader.readConnectorConfigurations()).filter(
      (configuration) => configuration.connector === capability.connector,
    );
    const orphaned = orphanedAcrossEveryConfiguration(capability, configurations);
    if (orphaned.length > 0) {
      throw new ConnectorPlaceholderOutsideInputSchemaError(orphaned);
    }
  }
}

function orphanedAcrossEveryConfiguration(
  capability: Capability,
  configurations: readonly RegisteredConnectorConfigurationForPlaceholderCheck[],
): readonly OrphanedPlaceholder[] {
  const names = new Set<string>();
  for (const configuration of configurations) {
    for (const name of orphanedPlaceholders(configuration.configuration, capability.input_schema)) {
      names.add(name);
    }
  }
  return [...names].map((placeholder) => ({
    placeholder,
    capabilities: [{ connector: capability.connector, input_schema: capability.input_schema }],
  }));
}

type DeclaredRegistration = CapabilityRegistration & {
  readonly name: string;
  readonly version: string;
  readonly nature: string;
  readonly input_schema: string;
  readonly output_schema: string;
  readonly connector: string;
  readonly concept: string;
};

function heldCapability(registration: CapabilityRegistration): Capability {
  refuseContractDepartures(registration);
  refuseMalformedSchemas(registration);
  refuseMalformedInputSchemaShape(registration);
  if (registration.nature !== READ_ONLY_NATURE) {
    throw new CapabilityNotReadOnlyError(registration.nature);
  }
  return {
    name: registration.name,
    version: registration.version,
    nature: registration.nature,
    input_schema: registration.input_schema,
    output_schema: registration.output_schema,
    timeout: registration.timeout ?? DEFAULT_CAPABILITY_TIMEOUT_MS,
    connector: registration.connector,
    concept: registration.concept,
  };
}

function refuseContractDepartures(
  registration: CapabilityRegistration,
): asserts registration is DeclaredRegistration {
  const problems = contractProblems(registration);
  if (problems.length > 0) {
    throw new IncompleteCapabilityContractError(problems);
  }
}

function contractProblems(registration: CapabilityRegistration): string[] {
  return REQUIRED_REGISTRATION_ATTRIBUTES.filter((attribute) => isUndeclared(registration[attribute])).map(
    (attribute) => `${attribute} is undeclared`,
  );
}

function isUndeclared(value: string | undefined): boolean {
  return value === undefined || value === '';
}

function refuseMalformedSchemas(registration: DeclaredRegistration): void {
  const malformed = SCHEMA_ATTRIBUTES.filter((attribute) => !isWellFormedJson(registration[attribute]));
  if (malformed.length > 0) {
    throw new CapabilitySchemaNotWellFormedError(malformed);
  }
}

function isWellFormedJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function refuseMalformedInputSchemaShape(registration: DeclaredRegistration): void {
  const parsed: unknown = JSON.parse(registration.input_schema);
  const problems = inputSchemaShapeProblems(parsed);
  if (problems.length > 0) {
    throw new MalformedCapabilityInputSchemaError(problems);
  }
}

function pageCountOf(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}

function sameIdentity(held: Capability, registered: Capability): boolean {
  return held.name === registered.name && held.version === registered.version;
}

function refuseAnsweredConcept(kept: readonly Capability[], registering: Capability): void {
  const answering = kept.find((candidate) => candidate.concept === registering.concept);
  if (answering !== undefined) {
    throw new ConceptAlreadyAnsweredError(registering.concept, answering, registering);
  }
}
