// Wires buildApp's own BuildAppDependencies whole (ARC-03 — one module, one
// factory function, named for the module it wires): the nineteen routes
// this initiative's four HTTP epics deliver, reusing case-query.factory.ts's,
// case-store.factory.ts's, glossary.factory.ts's, capability-registry.factory.ts's
// and case-lifecycle.factory.ts's own already-existing composition roots
// (task/case-lifecycle-http/register-routes-in-build-app,
// task/capability-authoring/register-capability-route) rather than
// rebuilding any of them — no new store, query or operation construction is
// introduced here, only the fan-out from one shared connection into every
// route's own slice of BuildAppDependencies. Kept out of
// diagnose-server.factory.ts's own body so that file's exported
// createDiagnoseHttpServer stays exactly the size and shape
// store-wiring.spec.ts already asserts (this task's own criterion 3, applied
// to the diagnose route's own registration and, by the same reasoning, to
// the factory that already built it).
//
// task/capability-authoring/register-capability-route: composeResources now
// builds one CapabilityRegistryService instance
// (capability-registry.factory.ts's own createCapabilityRegistry) and reuses
// it for both capabilityQuery (the published read, unchanged in shape) and
// the new registerCapability field, rather than building a second instance
// through createCapabilityQuery — the same shared connection either way, so
// this changes nothing any existing route can observe.

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

/** Everything buildAppDependencies needs, bundled as one object so it stays within MNT-01's parameter bound. */
export type BuildAppDependenciesInputs = {
  readonly env: Env;
  readonly connection: DatabaseConnection;
  readonly caseQuery: ICaseQuery;
  readonly diagnose: DiagnoseControllerDependencies;
  /** simulateCase's own dependencies, built the same way diagnose's are — entirely by createDiagnoseHttpServer, since both wire a production, adapter-fixed run of the shared investigation pipeline (task/case-simulation-pipeline/simulate-case-operation). */
  readonly simulateCase: SimulateCaseControllerDependencies;
  /** simulateHypothesis's own dependencies, built the same way simulateCase's are — entirely by createDiagnoseHttpServer, wiring a production, adapter-fixed run of this operation's own narrower pipeline (task/case-simulation-pipeline/simulate-hypothesis-operation). */
  readonly simulateHypothesis: SimulateHypothesisControllerDependencies;
};

/**
 * Every leaf query, store and operation surface this composition's other
 * nineteen routes read their own dependencies from, plus the configured
 * pagination bound (API-04) every listing route resolves its own request
 * against — read once from env here rather than written as a literal in
 * any route or controller.
 */
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

/**
 * Wires every leaf query, store and operation surface from the one given
 * connection, reusing case-store.factory.ts's, glossary.factory.ts's,
 * capability-registry.factory.ts's, connector-configuration-registry.factory.ts's
 * and case-lifecycle.factory.ts's own composition roots rather than
 * rebuilding any of them; the given caseQuery is the same instance
 * createDiagnoseHttpServer already built for the diagnose route, threaded
 * through rather than rebuilt a second time. Builds one
 * CapabilityRegistryService (capability-registry.factory.ts's own
 * createCapabilityRegistry) and reuses that same instance for both
 * capabilityQuery and registerCapability
 * (task/capability-authoring/register-capability-route), rather than a
 * second instance built through createCapabilityQuery. Builds one
 * GlossaryService (glossary.factory.ts's own createGlossary) the same way,
 * and reuses that same instance for both glossaryQuery and registerConcept
 * (task/concept-authoring/register-concept-route), rather than a second
 * instance built through createGlossaryQuery. Builds one
 * ConnectorConfigurationRegistryService
 * (connector-configuration-registry.factory.ts's own
 * createConnectorConfigurationRegistry) and reuses that same instance for
 * registerConnector
 * (task/connector-configuration-authoring/register-connector-route),
 * readConnectorConfiguration
 * (task/connector-configuration-authoring/read-connector-configuration-route)
 * and listConnectorConfigurations
 * (task/connector-configuration-authoring/list-connector-configurations-route),
 * the same shared-instance convention the capability and glossary registries
 * already hold, rather than a second instance built for the read or the
 * listing. caseInputRequirementsQuery is the one deliberate exception: a
 * second CaseQueryService instance, built from this same connection through
 * case-input-requirements.factory.ts's own createCaseInputRequirementsQuery
 * rather than reusing the given caseQuery — that factory's own header
 * comment discloses why this one divergence is safe.
 *
 * Builds capabilityRegistry and connectorConfigurationRegistry each with
 * the other's own narrow reader
 * (rules/integration/a-connector-placeholder-is-declared-by-its-capability;
 * task/connector-configuration-and-placeholder-contract/build-placeholder-declaration-check):
 * capabilityRegistry's own createConnectorConfigurationsReader (backed by a
 * RelationalConnectorConfigurationStore over this same connection) and
 * connectorConfigurationRegistry's own createCapabilitiesReader (backed by
 * a RelationalCapabilityStore over this same connection) — no new store,
 * query or operation construction beyond what those two factories already
 * expose is introduced here.
 */
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

/**
 * The seven read-one routes' own dependencies: read-capability,
 * read-capability-by-identity, read-case, read-case-input-requirements,
 * read-vocabulary-term, read-concept and read-connector-configuration, each
 * carrying only the published read it resolves against.
 * readCaseInputRequirements
 * (task/case-input-requirements-and-diagnose-gate/derive-case-input-requirements)
 * carries the dedicated caseInputRequirementsQuery instance
 * composeResources builds above, never the given caseQuery. readCapabilityByIdentity
 * (task/registry-reads/read-capability-by-identity-route) carries
 * readCapabilityByIdentityOrThrow — CapabilityRegistryService's own
 * service-level wrapper that raises CapabilityIdentityNotFoundError on a
 * miss
 * (task/registry-read-not-found-relocation-and-rate-limit/capability-not-found-relocation)
 * — rather than the raw readCapabilityByIdentity function
 * testConnectorDependencies below shares: that raw read still answers a miss
 * as ordinary data, which is what test-connector's own resolveTestedCapability
 * needs to raise its own distinct CapabilityNotRegisteredForTestError, so
 * this route alone is wired to the throwing wrapper. readConnectorConfiguration
 * here carries readConnectorConfigurationOrThrow — ConnectorConfigurationRegistryService's
 * own mirroring service-level wrapper that raises
 * ConnectorConfigurationNotFoundError on a miss
 * (task/registry-read-not-found-relocation-and-rate-limit/connector-configuration-not-found-relocation)
 * — rather than the raw readConnectorConfiguration function
 * testConnectorDependencies below shares: that raw read still answers a miss
 * as ordinary data, which is what test-connector's own
 * resolveTestedConnectorConfiguration and
 * http-declarative-observation-source.adapter.ts's own
 * resolveConnectorConfiguration each need to raise their own distinct
 * errors on the same miss, so this route alone is wired to the throwing
 * wrapper.
 */
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

/**
 * The eight listing routes' own dependencies, each carrying the published
 * read it resolves against plus the same configured pagination bound
 * (API-04) rather than a bound of its own. listConnectorConfigurations
 * (task/connector-configuration-authoring/list-connector-configurations-route)
 * carries the same published ConnectorConfigurationRegistryService instance's
 * listConnectorConfigurations method registerConnector and
 * readConnectorConfiguration already share, rather than a second instance.
 */
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

/** The seven case-lifecycle mutation routes' own dependencies, each carrying the one published operation (or, for update-draft and release, the store/query pair) it needs from CaseLifecycleOperations. */
function lifecycleDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'createDraft' | 'updateDraft' | 'release' | 'discard' | 'reviseHypothesis' | 'placeHypothesis' | 'removeHypothesis'> {
  const { caseLifecycle, caseStore, caseQuery } = resources;
  return {
    createDraft: { createDraft: caseLifecycle.createDraft },
    updateDraft: { caseStore, caseQuery },
    release: { release: caseLifecycle.release, caseQuery },
    discard: { discard: caseLifecycle.discard },
    reviseHypothesis: { reviseHypothesis: caseLifecycle.reviseHypothesis },
    placeHypothesis: { placeHypothesis: caseLifecycle.placeHypothesis },
    removeHypothesis: { removeHypothesis: caseLifecycle.removeHypothesis },
  };
}

/**
 * register-capability's, register-concept's and register-connector's own
 * dependencies (task/capability-authoring/register-capability-route,
 * task/concept-authoring/register-concept-route,
 * task/connector-configuration-authoring/register-connector-route): the
 * registerCapability, registerConcept and registerConnector operations, each
 * alone.
 */
function registrationDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'registerCapability' | 'registerConcept' | 'registerConnector'> {
  return {
    registerCapability: { registerCapability: resources.registerCapability },
    registerConcept: { registerConcept: resources.registerConcept },
    registerConnector: { registerConnector: resources.registerConnector },
  };
}

/**
 * test-connector's own dependencies
 * (task/connector-diagnostics/test-connector-route): the same
 * readCapabilityByIdentity and readConnectorConfiguration reads the
 * capability and connector-configuration registries already share above,
 * plus the platform's own global fetch as the HTTP client to issue the real
 * call through — no HTTP client package is authorized for this project and
 * Node's own runtime already exposes one, the same choice
 * http-declarative-observation-source.adapter.ts's own default already
 * makes for a real observation.
 */
function testConnectorDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'testConnector'> {
  return {
    testConnector: {
      readCapabilityByIdentity: resources.readCapabilityByIdentity,
      readConnectorConfiguration: resources.readConnectorConfiguration,
      httpClient: fetch,
    },
  };
}

/**
 * Assembles buildApp's own BuildAppDependencies whole: the diagnose,
 * simulateCase and simulateHypothesis routes' own dependencies exactly as
 * their own caller already built them
 * (task/case-simulation-pipeline/simulate-case-operation,
 * task/case-simulation-pipeline/simulate-hypothesis-operation), plus every
 * other route's own slice of the shared resources composed from the same
 * connection and environment.
 */
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
