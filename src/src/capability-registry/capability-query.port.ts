import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { Capability } from './capability.js';

/**
 * What resolving a concept against the registry answers: the capability
 * currently answering it, whole — name, version, nature, both schemas,
 * timeout in milliseconds and connector, exactly as registered — or its
 * absence stated as data, never an invented capability and never an error,
 * because a concept nothing currently answers is an ordinary answer of a
 * resolution, not a failure of the read. The absence names the concept that
 * was asked, so a consumer can report it without keeping its own copy.
 */
export type CapabilityResolution =
  | { readonly held: true; readonly capability: Capability }
  | { readonly held: false; readonly concept: string };

/**
 * The published capability-registry contract
 * (contracts/integration/capability-registry): the synchronous read the
 * registry offers — the capability currently answering a concept, with its
 * declared contract — the upstream the case contract check reads through.
 * A consumer depends on this interface, never on the store or on the
 * service that answers it.
 */
export interface ICapabilityQuery {
  /**
   * read-capability: resolves one concept, by its glossary name, to the one
   * capability currently answering it — one to one, with no fallback chain
   * (rules/integration/one-capability-answers-one-concept) — read through
   * the store on every call, never remembered.
   */
  readCapability(concept: string): Promise<CapabilityResolution>;

  /**
   * list-capabilities: every capability currently registered, whole — name,
   * version, nature, both schemas, timeout and connector, exactly as
   * registered, nothing narrowed — paginated per src/types/pagination.ts.
   * Read through the store on every call, never remembered.
   */
  listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>>;
}
