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
import type { ICaseQuery } from '../case/case-query.port.js';
import type { ICaseStore } from '../case/case-store.port.js';
import type { Env } from '../config/env.js';
import type { ConnectorConfigurationRegistryService } from '../connector-registry/connector-configuration-registry.service.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { GlossaryService } from '../glossary/glossary.service.js';
import type { BuildAppDependencies } from '../http/build-app.js';
import type { DiagnoseControllerDependencies } from '../http/diagnose.controller.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityRegistry } from './capability-registry.factory.js';
import { createCaseLifecycle, type CaseLifecycleOperations } from './case-lifecycle.factory.js';
import { createCaseStore } from './case-store.factory.js';
import { createConnectorConfigurationRegistry } from './connector-configuration-registry.factory.js';
import { createGlossary } from './glossary.factory.js';

/** Everything buildAppDependencies needs, bundled as one object so it stays within MNT-01's parameter bound. */
export type BuildAppDependenciesInputs = {
  readonly env: Env;
  readonly connection: DatabaseConnection;
  readonly caseQuery: ICaseQuery;
  readonly diagnose: DiagnoseControllerDependencies;
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
  readonly caseStore: ICaseStore;
  readonly capabilityQuery: ICapabilityQuery;
  readonly registerCapability: CapabilityRegistryService['registerCapability'];
  readonly glossaryQuery: IGlossaryQuery;
  readonly registerConcept: GlossaryService['registerConcept'];
  readonly registerConnector: ConnectorConfigurationRegistryService['registerConnector'];
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
 * createConnectorConfigurationRegistry) for registerConnector
 * (task/connector-configuration-authoring/register-connector-route) — this
 * initiative exposes no read or list route over connector configurations
 * yet, so this is that service's only field here, unlike the capability and
 * glossary registries' own shared instance.
 */
function composeResources(env: Env, connection: DatabaseConnection, caseQuery: ICaseQuery): ComposedResources {
  const capabilityRegistry = createCapabilityRegistry(connection);
  const glossary = createGlossary(connection);
  const connectorConfigurationRegistry = createConnectorConfigurationRegistry(connection);
  return {
    caseQuery,
    caseStore: createCaseStore(connection),
    capabilityQuery: capabilityRegistry,
    registerCapability: (registration) => capabilityRegistry.registerCapability(registration),
    glossaryQuery: glossary,
    registerConcept: (registration) => glossary.registerConcept(registration),
    registerConnector: (registration) => connectorConfigurationRegistry.registerConnector(registration),
    caseLifecycle: createCaseLifecycle(connection),
    pagination: { defaultLimit: env.PAGINATION_DEFAULT_LIMIT, maxLimit: env.PAGINATION_MAX_LIMIT },
  };
}

/** The four read-one routes' own dependencies: read-capability, read-case, read-vocabulary-term and read-concept, each carrying only the published read it resolves against. */
function readDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'readCapability' | 'readCase' | 'readVocabularyTerm' | 'readConcept'> {
  return {
    readCapability: { capabilityQuery: resources.capabilityQuery },
    readCase: { caseQuery: resources.caseQuery },
    readVocabularyTerm: { glossaryQuery: resources.glossaryQuery },
    readConcept: { glossaryQuery: resources.glossaryQuery },
  };
}

/** The seven listing routes' own dependencies, each carrying the published read it resolves against plus the same configured pagination bound (API-04) rather than a bound of its own. */
function listDependencies(resources: ComposedResources): Pick<BuildAppDependencies, 'listCapabilities' | 'listCases' | 'listCaseVersions' | 'listHypotheses' | 'listHypothesisRevisions' | 'listVocabularyTerms' | 'listConcepts'> {
  const { pagination } = resources;
  return {
    listCapabilities: { capabilityQuery: resources.capabilityQuery, ...pagination },
    listCases: { caseQuery: resources.caseQuery, ...pagination },
    listCaseVersions: { caseQuery: resources.caseQuery, ...pagination },
    listHypotheses: { caseQuery: resources.caseQuery, ...pagination },
    listHypothesisRevisions: { caseQuery: resources.caseQuery, ...pagination },
    listVocabularyTerms: { glossaryQuery: resources.glossaryQuery, ...pagination },
    listConcepts: { glossaryQuery: resources.glossaryQuery, ...pagination },
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
 * Assembles buildApp's own BuildAppDependencies whole: the diagnose route's
 * dependencies exactly as its own caller already built them, plus every
 * other route's own slice of the shared resources composed from the same
 * connection and environment.
 */
export function buildAppDependencies(inputs: BuildAppDependenciesInputs): BuildAppDependencies {
  const { env, connection, caseQuery, diagnose } = inputs;
  const resources = composeResources(env, connection, caseQuery);
  return {
    diagnose,
    ...readDependencies(resources),
    ...listDependencies(resources),
    ...lifecycleDependencies(resources),
    ...registrationDependencies(resources),
  };
}
