// Wire shapes for GET /v1/connectors/{connector}
// (task/connector-configuration-authoring/read-connector-configuration-route,
// task/registry-reads/connector-configuration-response-wire-type,
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
// JSON string domain/integration/connector-configuration declares its type
// to be, the same wire representation register-connector.dto.ts's own
// registerConnectorBodySchema already carries it as, and the same
// representation connector-configuration.ts's own ConnectorConfiguration
// type now holds it as internally too
// (task/connector-configuration-registration-conformance/configuration-held-as-text)
// — read-connector-configuration.controller.ts's own
// toReadConnectorConfigurationResponse answers this field exactly as the
// registry holds it, with no re-serialization step.

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
  configuration: z.string().min(1),
});

export type ReadConnectorConfigurationResponseDto = z.infer<typeof readConnectorConfigurationResponseSchema>;
