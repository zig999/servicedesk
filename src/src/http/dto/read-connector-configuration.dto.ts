// Wire shapes for GET /v1/connectors/{connector}
// (task/connector-configuration-authoring/read-connector-configuration-route,
// contracts/integration/connector-configuration-registry,
// domain/integration/connector-configuration): the path-parameter and
// response DTOs the route validates and types against (DTO-02/DTO-03), named
// for this use case the same way read-capability.dto.ts's own
// readCapabilityParamsSchema/readCapabilityResponseSchema are.
//
// readConnectorConfigurationParamsSchema carries the connector configuration's
// own one identifying attribute, connector
// (domain/integration/connector-configuration), read from the path the same
// way register-connector.dto.ts's own :connector segment already is.
// readConnectorConfigurationResponseSchema carries both of
// domain/integration/connector-configuration's own attributes, spelled with
// the same names connector-configuration.ts's own ConnectorConfiguration type
// holds them under (connector, configuration) — configuration held as the
// plain object the registry itself holds rather than the JSON text a
// registration submits (register-connector.dto.ts's own
// registerConnectorBodySchema), since this is the already-held shape the
// domain model and the registry answer with, never the wire representation a
// write validates.

import { z } from 'zod';

/**
 * The one path parameter this route reads: the connector identity named in
 * the URL, resolved through ConnectorConfigurationRegistryService's own
 * readConnectorConfiguration exactly as the request spelled it — never
 * trusted empty (EDG-01), though Fastify's own route matching already
 * refuses an empty path segment before this schema is ever reached.
 */
export const readConnectorConfigurationParamsSchema = z.object({
  connector: z.string().min(1),
});

export type ReadConnectorConfigurationParamsDto = z.infer<typeof readConnectorConfigurationParamsSchema>;

/**
 * The connector configuration currently registered under the named
 * connector, whole — domain/integration/connector-configuration's own two
 * attributes, connector and configuration, exactly as
 * ConnectorConfigurationResolution's held branch carries them, with no field
 * of its own.
 */
export const readConnectorConfigurationResponseSchema = z.object({
  connector: z.string().min(1),
  configuration: z.record(z.string(), z.unknown()),
});

export type ReadConnectorConfigurationResponseDto = z.infer<typeof readConnectorConfigurationResponseSchema>;
