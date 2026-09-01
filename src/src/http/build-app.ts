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

function routePlugins(dependencies: BuildAppDependencies): FastifyPluginAsync[] {
  return routePluginFactories.map((factory) => factory(dependencies));
}

export function buildApp(dependencies: BuildAppDependencies): FastifyInstance {
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  for (const plugin of routePlugins(dependencies)) {
    app.register(plugin);
  }
  return app;
}
