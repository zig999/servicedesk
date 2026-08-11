// Builds the Fastify app instance without ever calling .listen() itself
// (task/http-surface/diagnose-http-endpoint): a test injects a request
// against the value this function returns; only src/index.ts's own process
// entry point ever starts a real listener, so importing this module — or
// any module it imports — carries no side effect of its own. HTTP is served
// through Fastify and its official plugins alone; no second HTTP framework
// is imported anywhere in this file or the modules it composes (STK-03).

import Fastify, { type FastifyInstance } from 'fastify';
import type { DiagnoseControllerDependencies } from './diagnose.controller.js';
import { createDiagnoseRoutesPlugin } from './diagnose.routes.js';
import { handleUnexpectedError } from './error-handler.middleware.js';

/**
 * Assembles the whole HTTP surface this MVP exposes: one Fastify instance
 * with the diagnose route registered and the one generic error handler set
 * (COR-04, SEC-04). Constructs the Fastify instance itself — this is the
 * composition boundary ARC-02 expects, not a service or a controller — but
 * none of the diagnose route's own dependencies: those travel in from
 * createDiagnoseHttpServer, already built.
 */
export function buildApp(dependencies: DiagnoseControllerDependencies): FastifyInstance {
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createDiagnoseRoutesPlugin(dependencies));
  return app;
}
