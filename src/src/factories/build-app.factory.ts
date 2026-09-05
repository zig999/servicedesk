import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { CapabilityRegistryService } from '../capability-registry/capability-registry.service.js';
import type { ICaseInputRequirementsQuery } from '../case/case-input-requirements.port.js';
import type { ICaseQuery } from '../case/case-query.port.js';
import type { ICaseStore } from '../case/case-store.port.js';
import type { Env } from '../config/env.js';
import type {
  ConnectorConfigurationRegistryService,
  ConnectorConfigurationResolution,
} from '../connector-registry/connector-configuration-registry.service.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { GlossaryService } from '../glossary/glossary.service.js';
import type { BuildAppDependencies } from '../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../http/diagnose.controller.js';
import type { SimulateCaseControllerDependencies } from '../http/simulate-case.controller.js';
import type { SimulateHypothesisControllerDependencies } from '../http/simulate-hypothesis.controller.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilitiesReader, createCapabilityRegistry } from './capability-registry.factory.js';
import { createCaseInputRequirementsQuery } from './case-input-requirements.factory.js';
import { createCaseLifecycle, type CaseLifecycleOperations } from './case-lifecycle.factory.js';
import { createCaseStore } from './case-store.factory.js';
import {
  createConnectorConfigurationRegistry,
  createConnectorConfigurationsReader,
} from './connector-configuration-registry.factory.js';
import { createGlossary } from './glossary.factory.js';

export type BuildAppDependenciesInputs = {
  readonly env: Env;
  readonly connection: DatabaseConnection;
  readonly caseQuery: ICaseQuery;
  readonly diagnose: DiagnoseControllerDependencies;

  readonly simulateCase: SimulateCaseControllerDependencies;

  readonly simulateHypothesis: SimulateHypothesisControllerDependencies;
};

type ComposedResources = {
  readonly caseQuery: ICaseQuery;
  readonly caseInputRequirementsQuery: ICaseInputRequirementsQuery;
  readonly caseStore: ICaseStore;
  readonly capabilityQuery: ICapabilityQuery;
  readonly registerCapability: CapabilityRegistryService['registerCapability'];
  readonly readCapabilityByIdentity: CapabilityRegistryService['readCapabilityByIdentity'];
  readonly readCapabilityByIdentityOrThrow: CapabilityRegistryService['readCapabilityByIdentityOrThrow'];
  readonly glossaryQuery: IGlossaryQuery;
  readonly registerConcept: GlossaryService['registerConcept'];
  readonly registerConnector: ConnectorConfigurationRegistryService['registerConnector'];
  readonly readConnectorConfiguration: (connector: string) => Promise<ConnectorConfigurationResolution>;
  readonly readConnectorConfigurationOrThrow: ConnectorConfigurationRegistryService['readConnectorConfigurationOrThrow'];
  readonly listConnectorConfigurations: ConnectorConfigurationRegistryService['listConnectorConfigurations'];
  readonly caseLifecycle: CaseLifecycleOperations;
  readonly pagination: { readonly defaultLimit: number; readonly maxLimit: number };
};

function composeResources(env: Env, connection: DatabaseConnection, caseQuery: ICaseQuery): ComposedResources {
  const capabilityRegistry = createCapabilityRegistry(connection, createConnectorConfigurationsReader(connection));
  const glossary = createGlossary(connection);
  const connectorConfigurationRegistry = createConnectorConfigurationRegistry(
    connection,
    createCapabilitiesReader(connection),
  );
  return {
    caseQuery,
    caseInputRequirementsQuery: createCaseInputRequirementsQuery(connection),
    caseStore: createCaseStore(connection),
    capabilityQuery: capabilityRegistry,
    registerCapability: (registration) => capabilityRegistry.registerCapability(registration),
    readCapabilityByIdentity: (name, version) => capabilityRegistry.readCapabilityByIdentity(name, version),
    readCapabilityByIdentityOrThrow: (name, version) => capabilityRegistry.readCapabilityByIdentityOrThrow(name, version),
    glossaryQuery: glossary,
    registerConcept: (registration) => glossary.registerConcept(registration),
    registerConnector: (registration) => connectorConfigurationRegistry.registerConnector(registration),
    readConnectorConfiguration: (connector) => connectorConfigurationRegistry.readConnectorConfiguration(connector),
    readConnectorConfigurationOrThrow: (connector) => connectorConfigurationRegistry.readConnectorConfigurationOrThrow(connector),
    listConnectorConfigurations: (pagination) => connectorConfigurationRegistry.listConnectorConfigurations(pagination),
    caseLifecycle: createCaseLifecycle(connection),
    pagination: { defaultLimit: env.PAGINATION_DEFAULT_LIMIT, maxLimit: env.PAGINATION_MAX_LIMIT },
  };
}

function readDependencies(
  resources: ComposedResources,
): Pick<BuildAppDependencies, 'readCapability' | 'readCapabilityByIdentity' | 'readCase' | 'readCaseInputRequirements' | 'readVocabularyTerm' | 'readConcept' | 'readConnectorConfiguration'> {
  return {
    readCapability: { capabilityQuery: resources.capabilityQuery },
    readCapabilityByIdentity: { readCapabilityByIdentity: resources.readCapabilityByIdentityOrThrow },
    readCase: { caseQuery: resources.caseQuery },
    readCaseInputRequirements: { caseInputRequirementsQuery: resources.caseInputRequirementsQuery },
    readVocabularyTerm: { glossaryQuery: resources.glossaryQuery },
    readConcept: { glossaryQuery: resources.glossaryQuery },
    readConnectorConfiguration: { readConnectorConfiguration: resources.readConnectorConfigurationOrThrow },
  };
}

function listDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'listCapabilities' | 'listCases' | 'listCaseVersions' | 'listHypotheses' | 'listHypothesisRevisions' | 'listVocabularyTerms' | 'listConcepts' | 'listConnectorConfigurations'> {
  const { pagination } = resources;
  return {
    listCapabilities: { capabilityQuery: resources.capabilityQuery, ...pagination },
    listCases: { caseQuery: resources.caseQuery, ...pagination },
    listCaseVersions: { caseQuery: resources.caseQuery, ...pagination },
    listHypotheses: { caseQuery: resources.caseQuery, ...pagination },
    listHypothesisRevisions: { caseQuery: resources.caseQuery, ...pagination },
    listVocabularyTerms: { glossaryQuery: resources.glossaryQuery, ...pagination },
    listConcepts: { glossaryQuery: resources.glossaryQuery, ...pagination },
    listConnectorConfigurations: { listConnectorConfigurations: resources.listConnectorConfigurations, ...pagination },
  };
}

function lifecycleDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'createDraft' | 'updateDraft' | 'release' | 'releaseHypothesisRevision' | 'discard' | 'reviseHypothesis' | 'placeHypothesis' | 'removeHypothesis'> {
  const { caseLifecycle, caseStore, caseQuery } = resources;
  return {
    createDraft: { createDraft: caseLifecycle.createDraft },
    updateDraft: { caseStore, caseQuery },
    release: { release: caseLifecycle.release, caseQuery },
    releaseHypothesisRevision: { releaseHypothesisRevision: caseLifecycle.releaseHypothesisRevision },
    discard: { discard: caseLifecycle.discard },
    reviseHypothesis: { reviseHypothesis: caseLifecycle.reviseHypothesis },
    placeHypothesis: { placeHypothesis: caseLifecycle.placeHypothesis },
    removeHypothesis: { removeHypothesis: caseLifecycle.removeHypothesis },
  };
}

function registrationDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'registerCapability' | 'registerConcept' | 'registerConnector'> {
  return {
    registerCapability: { registerCapability: resources.registerCapability },
    registerConcept: { registerConcept: resources.registerConcept },
    registerConnector: { registerConnector: resources.registerConnector },
  };
}

function testConnectorDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'testConnector'> {
  return {
    testConnector: {
      readCapabilityByIdentity: resources.readCapabilityByIdentity,
      readConnectorConfiguration: resources.readConnectorConfiguration,
      httpClient: fetch,
    },
  };
}

export function buildAppDependencies(inputs: BuildAppDependenciesInputs): BuildAppDependencies {
  const { env, connection, caseQuery, diagnose, simulateCase, simulateHypothesis } = inputs;
  const resources = composeResources(env, connection, caseQuery);
  return {
    diagnose,
    simulateCase,
    simulateHypothesis,
    ...readDependencies(resources),
    ...listDependencies(resources),
    ...lifecycleDependencies(resources),
    ...registrationDependencies(resources),
    ...testConnectorDependencies(resources),
  };
}
