// Builds the Fastify app instance without ever calling .listen() itself
// (task/http-surface/diagnose-http-endpoint): a test injects a request
// against the value this function returns; only src/index.ts's own process
// entry point ever starts a real listener, so importing this module — or
// any module it imports — carries no side effect of its own. HTTP is served
// through Fastify and its official plugins alone; no second HTTP framework
// is imported anywhere in this file or the modules it composes (STK-03).
//
// task/case-lifecycle-http/register-routes-in-build-app: this file used to
// register exactly one route plugin (diagnose) inline, with no aggregation
// convention — the inventory's own risk entry named that as a hazard once
// the initiative's other seventeen routes needed registering too. The one
// stated convention below (this task's own criterion 1) is a list of
// already-built Fastify plugins, assembled by routePlugins() and registered
// in one loop: adding the nineteenth route means adding one line to that
// list, never a new call site. BuildAppDependencies is this file's own
// aggregate — one named field per route, each typed by that route's own
// ...ControllerDependencies — so buildApp still constructs nothing of its
// own (ARC-01, ARC-02): every dependency, including the configured
// pagination bound each listing route's own dependencies type already
// declares, arrives already built from whichever factory composes this
// function's argument (mirroring createDiagnoseHttpServer for diagnose).
// The diagnose route's own registration is unchanged in shape or behavior
// (this task's own criterion 3): dependencies.diagnose is exactly the value
// DiagnoseControllerDependencies always was, handed to the same
// createDiagnoseRoutesPlugin, registered through app.register() exactly as
// before — only now from inside the shared loop rather than a standalone
// call, which changes nothing Fastify or a caller can observe.

import Fastify, { type FastifyInstance, type FastifyPluginAsync } from 'fastify';
import type { CaseInputRequirementsControllerDependencies } from './case-input-requirements.controller.js';
import { createCaseInputRequirementsRoutesPlugin } from './case-input-requirements.routes.js';
import type { CreateDraftControllerDependencies } from './create-draft.controller.js';
import { createCreateDraftRoutesPlugin } from './create-draft.routes.js';
import { createDiagnoseRoutesPlugin } from './diagnose.routes.js';
import type { DiagnoseControllerDependencies } from './diagnose.controller.js';
import { createSimulateCaseRoutesPlugin } from './simulate-case.routes.js';
import type { SimulateCaseControllerDependencies } from './simulate-case.controller.js';
import { createSimulateHypothesisRoutesPlugin } from './simulate-hypothesis.routes.js';
import type { SimulateHypothesisControllerDependencies } from './simulate-hypothesis.controller.js';
import type { DiscardControllerDependencies } from './discard.controller.js';
import { createDiscardRoutesPlugin } from './discard.routes.js';
import type { ListCapabilitiesControllerDependencies } from './list-capabilities.controller.js';
import { createListCapabilitiesRoutesPlugin } from './list-capabilities.routes.js';
import type { ListCaseVersionsControllerDependencies } from './list-case-versions.controller.js';
import { createListCaseVersionsRoutesPlugin } from './list-case-versions.routes.js';
import type { ListCasesControllerDependencies } from './list-cases.controller.js';
import { createListCasesRoutesPlugin } from './list-cases.routes.js';
import type { ListConceptsControllerDependencies } from './list-concepts.controller.js';
import { createListConceptsRoutesPlugin } from './list-concepts.routes.js';
import type { ListConnectorConfigurationsControllerDependencies } from './list-connector-configurations.controller.js';
import { createListConnectorConfigurationsRoutesPlugin } from './list-connector-configurations.routes.js';
import type { ListHypothesesControllerDependencies } from './list-hypotheses.controller.js';
import { createListHypothesesRoutesPlugin } from './list-hypotheses.routes.js';
import type { ListHypothesisRevisionsControllerDependencies } from './list-hypothesis-revisions.controller.js';
import { createListHypothesisRevisionsRoutesPlugin } from './list-hypothesis-revisions.routes.js';
import type { ListVocabularyTermsControllerDependencies } from './list-vocabulary-terms.controller.js';
import { createListVocabularyTermsRoutesPlugin } from './list-vocabulary-terms.routes.js';
import type { PlaceHypothesisControllerDependencies } from './place-hypothesis.controller.js';
import { createPlaceHypothesisRoutesPlugin } from './place-hypothesis.routes.js';
import type { ReadCapabilityControllerDependencies } from './read-capability.controller.js';
import { createReadCapabilityRoutesPlugin } from './read-capability.routes.js';
import type { ReadCapabilityByIdentityControllerDependencies } from './read-capability-by-identity.controller.js';
import { createReadCapabilityByIdentityRoutesPlugin } from './read-capability-by-identity.routes.js';
import type { ReadCaseControllerDependencies } from './read-case.controller.js';
import { createReadCaseRoutesPlugin } from './read-case.routes.js';
import type { ReadConnectorConfigurationControllerDependencies } from './read-connector-configuration.controller.js';
import { createReadConnectorConfigurationRoutesPlugin } from './read-connector-configuration.routes.js';
import type { ReadConceptControllerDependencies } from './read-concept.controller.js';
import { createReadConceptRoutesPlugin } from './read-concept.routes.js';
import type { ReadVocabularyTermControllerDependencies } from './read-vocabulary-term.controller.js';
import { createReadVocabularyTermRoutesPlugin } from './read-vocabulary-term.routes.js';
import type { RegisterCapabilityControllerDependencies } from './register-capability.controller.js';
import { createRegisterCapabilityRoutesPlugin } from './register-capability.routes.js';
import type { RegisterConceptControllerDependencies } from './register-concept.controller.js';
import { createRegisterConceptRoutesPlugin } from './register-concept.routes.js';
import type { RegisterConnectorControllerDependencies } from './register-connector.controller.js';
import { createRegisterConnectorRoutesPlugin } from './register-connector.routes.js';
import type { ReleaseControllerDependencies } from './release.controller.js';
import { createReleaseRoutesPlugin } from './release.routes.js';
import type { RemoveHypothesisControllerDependencies } from './remove-hypothesis.controller.js';
import { createRemoveHypothesisRoutesPlugin } from './remove-hypothesis.routes.js';
import type { ReviseHypothesisControllerDependencies } from './revise-hypothesis.controller.js';
import { createReviseHypothesisRoutesPlugin } from './revise-hypothesis.routes.js';
import type { TestConnectorControllerDependencies } from './test-connector.controller.js';
import { createTestConnectorRoutesPlugin } from './test-connector.routes.js';
import type { UpdateDraftControllerDependencies } from './update-draft.controller.js';
import { createUpdateDraftRoutesPlugin } from './update-draft.routes.js';
import { handleUnexpectedError } from './error-handler.middleware.js';

/**
 * Every route plugin this initiative's four HTTP epics deliver, plus the
 * pre-existing diagnose route: one named field per route, each carrying
 * exactly that route's own controller-dependencies type, so a caller must
 * hand this function a fully wired dependency for every one of the
 * twenty-nine routes it registers — no route here is optional.
 * registerCapability (task/capability-authoring/register-capability-route)
 * was the twentieth; registerConcept
 * (task/concept-authoring/register-concept-route) was the twenty-first;
 * registerConnector
 * (task/connector-configuration-authoring/register-connector-route) was the
 * twenty-second; readConnectorConfiguration
 * (task/connector-configuration-authoring/read-connector-configuration-route)
 * was the twenty-third; listConnectorConfigurations
 * (task/connector-configuration-authoring/list-connector-configurations-route)
 * was the twenty-fourth; testConnector
 * (task/connector-diagnostics/test-connector-route) was the twenty-fifth;
 * readCapabilityByIdentity (task/registry-reads/read-capability-by-identity-route)
 * was the twenty-sixth, additive to
 * contracts/integration/capability-registry's own published surface, and
 * with no dependency on listCapabilities having already run;
 * simulateCase (task/case-simulation-pipeline/simulate-case-operation) is the
 * twenty-seventh, additive to contracts/investigation/case-simulation's own
 * published surface, with no dependency on diagnose having already run;
 * simulateHypothesis (task/case-simulation-pipeline/simulate-hypothesis-operation)
 * is the twenty-eighth, the same published surface's other operation, with no
 * dependency on simulateCase having already run; readCaseInputRequirements
 * (task/case-input-requirements-and-diagnose-gate/derive-case-input-requirements)
 * is the twenty-ninth, additive to
 * contracts/knowledge/case-input-requirements's own published surface, with
 * no dependency on read-case having already run.
 */
export type BuildAppDependencies = {
  readonly diagnose: DiagnoseControllerDependencies;
  readonly simulateCase: SimulateCaseControllerDependencies;
  readonly simulateHypothesis: SimulateHypothesisControllerDependencies;
  readonly testConnector: TestConnectorControllerDependencies;
  readonly readCapability: ReadCapabilityControllerDependencies;
  readonly readCapabilityByIdentity: ReadCapabilityByIdentityControllerDependencies;
  readonly readConnectorConfiguration: ReadConnectorConfigurationControllerDependencies;
  readonly listCapabilities: ListCapabilitiesControllerDependencies;
  readonly listConnectorConfigurations: ListConnectorConfigurationsControllerDependencies;
  readonly registerCapability: RegisterCapabilityControllerDependencies;
  readonly createDraft: CreateDraftControllerDependencies;
  readonly updateDraft: UpdateDraftControllerDependencies;
  readonly release: ReleaseControllerDependencies;
  readonly discard: DiscardControllerDependencies;
  readonly reviseHypothesis: ReviseHypothesisControllerDependencies;
  readonly placeHypothesis: PlaceHypothesisControllerDependencies;
  readonly removeHypothesis: RemoveHypothesisControllerDependencies;
  readonly readCase: ReadCaseControllerDependencies;
  readonly readCaseInputRequirements: CaseInputRequirementsControllerDependencies;
  readonly listCases: ListCasesControllerDependencies;
  readonly listCaseVersions: ListCaseVersionsControllerDependencies;
  readonly listHypotheses: ListHypothesesControllerDependencies;
  readonly listHypothesisRevisions: ListHypothesisRevisionsControllerDependencies;
  readonly readVocabularyTerm: ReadVocabularyTermControllerDependencies;
  readonly listVocabularyTerms: ListVocabularyTermsControllerDependencies;
  readonly readConcept: ReadConceptControllerDependencies;
  readonly listConcepts: ListConceptsControllerDependencies;
  readonly registerConcept: RegisterConceptControllerDependencies;
  readonly registerConnector: RegisterConnectorControllerDependencies;
};

/**
 * The one aggregation convention this file declares (criterion 1): every
 * route plugin, already built from its own slice of the given dependencies,
 * as a flat list buildApp registers in one loop rather than one call site
 * per route. Held at module scope, one factory per route in registration
 * order, so routePlugins() below stays "one list, one loop" (ARC-02) without
 * the list itself counting against that function's own line budget
 * (MNT-01) as the route count grows.
 */
const routePluginFactories: ReadonlyArray<
  (dependencies: BuildAppDependencies) => FastifyPluginAsync
> = [
  (dependencies) => createDiagnoseRoutesPlugin(dependencies.diagnose),
  (dependencies) => createSimulateCaseRoutesPlugin(dependencies.simulateCase),
  (dependencies) => createSimulateHypothesisRoutesPlugin(dependencies.simulateHypothesis),
  (dependencies) => createTestConnectorRoutesPlugin(dependencies.testConnector),
  (dependencies) => createReadCapabilityRoutesPlugin(dependencies.readCapability),
  (dependencies) => createReadCapabilityByIdentityRoutesPlugin(dependencies.readCapabilityByIdentity),
  (dependencies) => createReadConnectorConfigurationRoutesPlugin(dependencies.readConnectorConfiguration),
  (dependencies) => createListCapabilitiesRoutesPlugin(dependencies.listCapabilities),
  (dependencies) => createListConnectorConfigurationsRoutesPlugin(dependencies.listConnectorConfigurations),
  (dependencies) => createRegisterCapabilityRoutesPlugin(dependencies.registerCapability),
  (dependencies) => createCreateDraftRoutesPlugin(dependencies.createDraft),
  (dependencies) => createUpdateDraftRoutesPlugin(dependencies.updateDraft),
  (dependencies) => createReleaseRoutesPlugin(dependencies.release),
  (dependencies) => createDiscardRoutesPlugin(dependencies.discard),
  (dependencies) => createReviseHypothesisRoutesPlugin(dependencies.reviseHypothesis),
  (dependencies) => createPlaceHypothesisRoutesPlugin(dependencies.placeHypothesis),
  (dependencies) => createRemoveHypothesisRoutesPlugin(dependencies.removeHypothesis),
  (dependencies) => createReadCaseRoutesPlugin(dependencies.readCase),
  (dependencies) => createCaseInputRequirementsRoutesPlugin(dependencies.readCaseInputRequirements),
  (dependencies) => createListCasesRoutesPlugin(dependencies.listCases),
  (dependencies) => createListCaseVersionsRoutesPlugin(dependencies.listCaseVersions),
  (dependencies) => createListHypothesesRoutesPlugin(dependencies.listHypotheses),
  (dependencies) => createListHypothesisRevisionsRoutesPlugin(dependencies.listHypothesisRevisions),
  (dependencies) => createReadVocabularyTermRoutesPlugin(dependencies.readVocabularyTerm),
  (dependencies) => createListVocabularyTermsRoutesPlugin(dependencies.listVocabularyTerms),
  (dependencies) => createReadConceptRoutesPlugin(dependencies.readConcept),
  (dependencies) => createListConceptsRoutesPlugin(dependencies.listConcepts),
  (dependencies) => createRegisterConceptRoutesPlugin(dependencies.registerConcept),
  (dependencies) => createRegisterConnectorRoutesPlugin(dependencies.registerConnector),
];

/**
 * routePlugins() itself: builds every plugin listed above from the given
 * dependencies, in the same order the list declares them. buildApp's own
 * loop below registers whatever this returns.
 */
function routePlugins(dependencies: BuildAppDependencies): FastifyPluginAsync[] {
  return routePluginFactories.map((factory) => factory(dependencies));
}

/**
 * Assembles the whole HTTP surface this initiative exposes: one Fastify
 * instance with every one of the twenty-nine route plugins registered and the
 * one generic error handler set (COR-04, SEC-04). Constructs the Fastify
 * instance itself — this is the composition boundary ARC-02 expects, not a
 * service or a controller — but none of any route's own dependencies:
 * those travel in from whichever factory builds BuildAppDependencies,
 * already built (mirroring createDiagnoseHttpServer for diagnose today).
 */
export function buildApp(dependencies: BuildAppDependencies): FastifyInstance {
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  for (const plugin of routePlugins(dependencies)) {
    app.register(plugin);
  }
  return app;
}
