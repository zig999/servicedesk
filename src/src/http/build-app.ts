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
import type { CreateDraftControllerDependencies } from './create-draft.controller.js';
import { createCreateDraftRoutesPlugin } from './create-draft.routes.js';
import { createDiagnoseRoutesPlugin } from './diagnose.routes.js';
import type { DiagnoseControllerDependencies } from './diagnose.controller.js';
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
import type { ReadCaseControllerDependencies } from './read-case.controller.js';
import { createReadCaseRoutesPlugin } from './read-case.routes.js';
import type { ReadConceptControllerDependencies } from './read-concept.controller.js';
import { createReadConceptRoutesPlugin } from './read-concept.routes.js';
import type { ReadVocabularyTermControllerDependencies } from './read-vocabulary-term.controller.js';
import { createReadVocabularyTermRoutesPlugin } from './read-vocabulary-term.routes.js';
import type { RegisterCapabilityControllerDependencies } from './register-capability.controller.js';
import { createRegisterCapabilityRoutesPlugin } from './register-capability.routes.js';
import type { RegisterConceptControllerDependencies } from './register-concept.controller.js';
import { createRegisterConceptRoutesPlugin } from './register-concept.routes.js';
import type { ReleaseControllerDependencies } from './release.controller.js';
import { createReleaseRoutesPlugin } from './release.routes.js';
import type { RemoveHypothesisControllerDependencies } from './remove-hypothesis.controller.js';
import { createRemoveHypothesisRoutesPlugin } from './remove-hypothesis.routes.js';
import type { ReviseHypothesisControllerDependencies } from './revise-hypothesis.controller.js';
import { createReviseHypothesisRoutesPlugin } from './revise-hypothesis.routes.js';
import type { UpdateDraftControllerDependencies } from './update-draft.controller.js';
import { createUpdateDraftRoutesPlugin } from './update-draft.routes.js';
import { handleUnexpectedError } from './error-handler.middleware.js';

/**
 * Every route plugin this initiative's four HTTP epics deliver, plus the
 * pre-existing diagnose route: one named field per route, each carrying
 * exactly that route's own controller-dependencies type, so a caller must
 * hand this function a fully wired dependency for every one of the
 * twenty-one routes it registers — no route here is optional.
 * registerCapability (task/capability-authoring/register-capability-route)
 * was the twentieth; registerConcept
 * (task/concept-authoring/register-concept-route) is the twenty-first, added
 * on top of it.
 */
export type BuildAppDependencies = {
  readonly diagnose: DiagnoseControllerDependencies;
  readonly readCapability: ReadCapabilityControllerDependencies;
  readonly listCapabilities: ListCapabilitiesControllerDependencies;
  readonly registerCapability: RegisterCapabilityControllerDependencies;
  readonly createDraft: CreateDraftControllerDependencies;
  readonly updateDraft: UpdateDraftControllerDependencies;
  readonly release: ReleaseControllerDependencies;
  readonly discard: DiscardControllerDependencies;
  readonly reviseHypothesis: ReviseHypothesisControllerDependencies;
  readonly placeHypothesis: PlaceHypothesisControllerDependencies;
  readonly removeHypothesis: RemoveHypothesisControllerDependencies;
  readonly readCase: ReadCaseControllerDependencies;
  readonly listCases: ListCasesControllerDependencies;
  readonly listCaseVersions: ListCaseVersionsControllerDependencies;
  readonly listHypotheses: ListHypothesesControllerDependencies;
  readonly listHypothesisRevisions: ListHypothesisRevisionsControllerDependencies;
  readonly readVocabularyTerm: ReadVocabularyTermControllerDependencies;
  readonly listVocabularyTerms: ListVocabularyTermsControllerDependencies;
  readonly readConcept: ReadConceptControllerDependencies;
  readonly listConcepts: ListConceptsControllerDependencies;
  readonly registerConcept: RegisterConceptControllerDependencies;
};

/**
 * The one aggregation convention this file declares (criterion 1): every
 * route plugin, already built from its own slice of the given dependencies,
 * as a flat list buildApp registers in one loop rather than one call site
 * per route.
 */
function routePlugins(dependencies: BuildAppDependencies): FastifyPluginAsync[] {
  return [
    createDiagnoseRoutesPlugin(dependencies.diagnose),
    createReadCapabilityRoutesPlugin(dependencies.readCapability),
    createListCapabilitiesRoutesPlugin(dependencies.listCapabilities),
    createRegisterCapabilityRoutesPlugin(dependencies.registerCapability),
    createCreateDraftRoutesPlugin(dependencies.createDraft),
    createUpdateDraftRoutesPlugin(dependencies.updateDraft),
    createReleaseRoutesPlugin(dependencies.release),
    createDiscardRoutesPlugin(dependencies.discard),
    createReviseHypothesisRoutesPlugin(dependencies.reviseHypothesis),
    createPlaceHypothesisRoutesPlugin(dependencies.placeHypothesis),
    createRemoveHypothesisRoutesPlugin(dependencies.removeHypothesis),
    createReadCaseRoutesPlugin(dependencies.readCase),
    createListCasesRoutesPlugin(dependencies.listCases),
    createListCaseVersionsRoutesPlugin(dependencies.listCaseVersions),
    createListHypothesesRoutesPlugin(dependencies.listHypotheses),
    createListHypothesisRevisionsRoutesPlugin(dependencies.listHypothesisRevisions),
    createReadVocabularyTermRoutesPlugin(dependencies.readVocabularyTerm),
    createListVocabularyTermsRoutesPlugin(dependencies.listVocabularyTerms),
    createReadConceptRoutesPlugin(dependencies.readConcept),
    createListConceptsRoutesPlugin(dependencies.listConcepts),
    createRegisterConceptRoutesPlugin(dependencies.registerConcept),
  ];
}

/**
 * Assembles the whole HTTP surface this initiative exposes: one Fastify
 * instance with every one of the twenty-one route plugins registered and the
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
