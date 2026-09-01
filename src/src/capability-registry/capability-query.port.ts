import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { Capability } from './capability.js';

export type CapabilityResolution =
  | { readonly held: true; readonly capability: Capability }
  | { readonly held: false; readonly concept: string };

export interface ICapabilityQuery {

  readCapability(concept: string): Promise<CapabilityResolution>;

  listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>>;
}
