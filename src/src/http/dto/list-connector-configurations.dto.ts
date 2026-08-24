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
// shared PaginatedResponse<ConnectorConfiguration>
// src/types/pagination.ts already declares (API-01 — "never redeclared per
// module"), so list-connector-configurations.controller.ts types its own
// answer against that imported type directly rather than a second
// Zod-inferred shape this file would have to keep in step with it.

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
