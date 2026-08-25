// Wire shapes for GET /v1/connectors
// (task/connector-configuration-authoring/list-connector-configurations-route,
// contracts/integration/connector-configuration-registry): the query-string
// DTO the route validates its raw offset/limit against (DTO-01/02/03), named
// for this use case the same way list-capabilities.dto.ts's own
// listCapabilitiesQuerySchema is.
//
// offset and limit are query-string segments, so they arrive as strings or
// as absent keys entirely; listConnectorConfigurationsQuerySchema coerces
// each the same way listCapabilitiesQuerySchema already coerces its own
// (z.coerce.number()), and leaves both optional — EDG-01 refuses input that
// is present but malformed (a non-numeric or negative value), never input
// that is simply absent, since an absent limit or offset is not a request
// "missing" anything a listing needs: the standard's own API-04 presupposes
// exactly this absence by requiring a configured default for it. Bounding an
// absent or oversized limit against that configured default and maximum is
// left to the controller (list-connector-configurations.controller.ts), not
// to this schema — mirroring list-capabilities.dto.ts's own reasoning, which
// cites src/types/pagination.ts's own header comment stating plainly that
// this bounding "is a controller/route concern".
//
// This module declares no response schema: GET /v1/connectors answers the
// shared PaginatedResponse<T> src/types/pagination.ts already declares
// (API-01 — "never redeclared per module"), so
// list-connector-configurations.controller.ts types its own answer against
// that imported generic directly rather than a second Zod-inferred shape
// this file would have to keep in step with it. The item type it carries is
// ReadConnectorConfigurationResponseDto (read-connector-configuration.dto.ts's
// own wire shape for one connector configuration), not
// connector-configuration.ts's own domain ConnectorConfiguration type —
// corrected by task/registry-reads/connector-configuration-response-wire-type,
// which found this route reusing that domain type directly for its response
// answered configuration as the plain object the registry holds it as
// rather than the JSON string domain/integration/connector-configuration
// declares its type to be.

import { z } from 'zod';

/**
 * The two query-string parameters GET /v1/connectors accepts, each optional
 * and coerced from the raw string (or absence) a query string carries:
 * offset, how many matching connector configurations precede the first one
 * this page returns, and limit, the most connector configurations this page
 * may carry before the controller's own configured default and maximum are
 * applied.
 */
export const listConnectorConfigurationsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListConnectorConfigurationsQueryDto = z.infer<typeof listConnectorConfigurationsQuerySchema>;
