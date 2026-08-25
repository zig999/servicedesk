// Registers GET /v1/capabilities/{name}/{version}
// (task/registry-reads/read-capability-by-identity-route,
// contracts/integration/capability-registry): validates the two path
// parameters against readCapabilityByIdentityParamsSchema before the
// controller is ever reached (DTO-01, EDG-01), then hands the parsed DTO
// straight to handleReadCapabilityByIdentityRequest and answers with
// whatever it resolves. The route sits under the same versioned prefix
// every sibling route already establishes (API-06), additive alongside
// read-capability.routes.ts's own GET /v1/capabilities/{concept} and
// register-capability.routes.ts's own PUT against this same
// {name}/{version} path — a different HTTP method against the same segment
// shape, so Fastify dispatches each independently — and this module
// constructs none of its own dependencies (ARC-02): they arrive as this
// plugin's own closure, built once by build-app.factory.ts's own
// composeResources, reusing the same CapabilityRegistryService instance
// every other capability-registry route already shares — so this route has
// no dependency on list-capabilities having run first. A domain refusal the
// controller raises (CapabilityIdentityNotFoundError) is left to propagate:
// this plugin sets no error handler of its own, so it answers through
// whichever one the app already has registered (COR-04,
// error-handler.middleware.ts), exactly as read-capability.routes.ts leaves
// every propagated error to it today. This route declares no authentication
// guard of its own, consistent with
// constraints/no-route-enforces-authentication — a request carrying no
// credential is dispatched exactly like one that carries one.
//
// task/registry-read-not-found-relocation-and-rate-limit/capability-identity-read-rate-limit
// (constraints/the-capability-identity-read-is-rate-limited): an onRequest
// hook built by read-capability-by-identity-rate-limit.middleware.ts's own
// createReadCapabilityByIdentityRateLimitHook is added on this plugin's own
// FastifyInstance, ahead of the route itself, so Fastify's own encapsulation
// confines it to this one route alone — no other route in build-app.ts's
// routePlugins() list is registered against it. A source IP past 60
// requests within the same one-minute window is answered 429 with a
// Retry-After value from inside that hook, never reaching
// readCapabilityByIdentityHandler below; every request at or under that
// count reaches the handler exactly as before.

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  handleReadCapabilityByIdentityRequest,
  type ReadCapabilityByIdentityControllerDependencies,
} from './read-capability-by-identity.controller.js';
import { readCapabilityByIdentityParamsSchema } from './dto/read-capability-by-identity.dto.js';
import { createReadCapabilityByIdentityRateLimitHook } from './read-capability-by-identity-rate-limit.middleware.js';

/** A versioned prefix (API-06), matching every sibling route's own constant so a later breaking shape lands beside it under v2 rather than in place of it. */
const API_PREFIX = '/v1';

/**
 * Builds the read-capability-by-identity route as a Fastify plugin closed
 * over the given dependencies — the existing readCapabilityByIdentity read
 * — so the plugin body itself constructs nothing (ARC-02).
 */
export function createReadCapabilityByIdentityRoutesPlugin(
  dependencies: ReadCapabilityByIdentityControllerDependencies,
): FastifyPluginAsync {
  return async function readCapabilityByIdentityRoutesPlugin(app: FastifyInstance): Promise<void> {
    app.addHook('onRequest', createReadCapabilityByIdentityRateLimitHook());
    app.get(`${API_PREFIX}/capabilities/:name/:version`, (request, reply) =>
      readCapabilityByIdentityHandler(dependencies, request, reply),
    );
  };
}

/**
 * Validates both path parameters before the controller is reached (DTO-01,
 * EDG-01): a request whose :name or :version segment fails
 * readCapabilityByIdentityParamsSchema answers 400 with the validation
 * envelope, naming every violated field; otherwise the controller's own
 * resolved capability answers 200, unchanged, and a thrown
 * CapabilityIdentityNotFoundError is left to reach the app's shared error
 * handler.
 */
async function readCapabilityByIdentityHandler(
  dependencies: ReadCapabilityByIdentityControllerDependencies,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const parsed = readCapabilityByIdentityParamsSchema.safeParse(request.params);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'the request path failed validation', details: issues } });
  }
  const capability = await handleReadCapabilityByIdentityRequest(dependencies, parsed.data);
  return reply.code(200).send(capability);
}
