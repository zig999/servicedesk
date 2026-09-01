import type { EvidenceResult } from '../investigation/evidence-result.js';
import type { ResponseFieldPaths } from './response-path-extractor.js';

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type StatusEndingMap = Readonly<Record<string, EvidenceResult>>;

export type HttpConnectorCallConfiguration = {
  readonly method: HttpMethod;
  readonly responseMap: ResponseFieldPaths;
  readonly statusMap: StatusEndingMap;
};
