// Wire shapes for PUT /v1/connectors/{connector}
// (task/connector-configuration-authoring/register-connector-route,
// contracts/integration/connector-configuration-registry,
// domain/integration/connector-configuration): the path-parameter and
// request-body DTOs the route validates against (DTO-01/02/03), named for
// this use case the same way register-capability.dto.ts's own
// registerCapabilityParamsSchema/registerCapabilityBodySchema are.
//
// registerConnectorParamsSchema carries the connector configuration's own
// one identifying attribute, connector (domain/integration/connector-configuration),
// read from the path the same way register-capability.dto.ts's own :name
// segment is — never duplicated into the body.
// registerConnectorBodySchema carries the configuration attribute the domain
// model declares as a string (domain/integration/connector-configuration),
// required and non-empty (EDG-01 refuses an absent or empty body field here,
// before the service is ever reached), the same wire shape
// register-capability.dto.ts's own input_schema/output_schema already take.
// This schema does not check configuration for JSON-object syntax
// (rules/integration/a-connector-configuration-holds-a-well-formed-object):
// that refusal belongs to the registry service alongside the refusals it
// already enforces (this task's own "What it is"), not to this boundary
// schema — mirroring register-capability.dto.ts's own reasoning for
// input_schema/output_schema — so a syntactically invalid or non-object
// configuration still reaches the controller and is refused there, through
// the registry's own typed error and the shared status map, rather than
// through this file's own VALIDATION_ERROR envelope.
//
// This module declares no response schema (MNT-03, kept in spirit with
// register-capability.dto.ts's own reasoning): the controller answers with
// the domain's own ConnectorConfiguration type directly
// (connector-configuration.ts), so a second Zod-inferred shape is not
// declared here to keep in step with it.

import { z } from 'zod';

/**
 * The connector configuration's own identity, read from the path
 * (domain/integration/connector-configuration) — never duplicated into the
 * body.
 */
export const registerConnectorParamsSchema = z.object({
  connector: z.string().min(1),
});

export type RegisterConnectorParamsDto = z.infer<typeof registerConnectorParamsSchema>;

/**
 * The registration's one other attribute beyond its path-carried identity:
 * configuration, required and non-empty, carried as JSON text exactly as
 * the domain model declares its type — well-formedness (JSON syntax, and
 * that it parses to a plain object) is refused by the registry service,
 * never checked here.
 */
export const registerConnectorBodySchema = z.object({
  configuration: z.string().min(1),
});

export type RegisterConnectorBodyDto = z.infer<typeof registerConnectorBodySchema>;
