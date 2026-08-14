// The vocabulary the HTTP declarative observation-source adapter reads its
// own connector configuration as
// (task/http-observation-runtime/http-declarative-observation-source): pure
// values with no behavior, the same role connector-call-descriptor.ts
// already plays for the request-assembly translation's own vocabulary.
//
// No specification node describes a connector's own HTTP method, its
// response-field mapping or its status-to-ending mapping as a structure —
// domain/integration/capability's own "connector" attribute stays a
// deliberately opaque string (decision-log: "an opaque string keeps vendors
// out of the model"), and this shape is this task's own free technical
// design over what that opaque payload
// (connector-registry/connector-configuration.ts's own
// ConnectorConfiguration.configuration) may additionally declare when it is
// meant to drive an HTTP call — on top of, and never in place of,
// connector-call-descriptor.ts's own address/query/headers/body template,
// which the adapter resolves separately through
// connector-request-resolver.ts's own resolveConnectorRequest. Never a
// second, competing persisted schema: the registry still stores and returns
// the whole payload exactly as opaque data, unaware of this shape.

import type { EvidenceResult } from '../investigation/evidence-result.js';
import type { ResponseFieldPaths } from './response-path-extractor.js';

/**
 * The HTTP methods this adapter is willing to issue — closed, since an
 * arbitrary verb is exactly the kind of external-system shape this generic
 * adapter must never grow a special case for.
 */
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

/** One of the methods a connector's own call configuration may declare, by name. */
export type HttpMethod = (typeof HTTP_METHODS)[number];

/**
 * One HTTP response status, by its own string representation (e.g. "200",
 * "404"), mapped to the evidence-result ending it stands for —
 * `response.status` is a number, so this map is looked up by
 * `String(response.status)`, the same "render a lookup key as one string"
 * convention citation-validation.ts's own capabilityOutputSchemaKey already
 * keeps for a composite key.
 */
export type StatusEndingMap = Readonly<Record<string, EvidenceResult>>;

/**
 * What the adapter expects a connector's own opaque call configuration to
 * declare, once narrowed, beyond the address/query/headers/body template
 * connector-call-descriptor.ts already owns: the HTTP method to issue the
 * request with, the mapping from a glossary-vocabulary field name to a path
 * into the parsed response body (response-path-extractor.ts's own
 * ResponseFieldPaths), and the mapping from an HTTP response status to one
 * of the four evidence-result endings.
 */
export type HttpConnectorCallConfiguration = {
  readonly method: HttpMethod;
  readonly responseMap: ResponseFieldPaths;
  readonly statusMap: StatusEndingMap;
};
