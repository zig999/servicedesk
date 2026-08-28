import type { Capability } from './capability.js';

/**
 * The port through which the registry's registrations reach their
 * persistence. The domain declares it and infrastructure implements it
 * (constraints/the-domain-depends-on-no-infrastructure): no registry module
 * opens a file, and no framework, driver or client is imported here.
 */
export interface ICapabilityStore {
  /** Answers every registration the registry holds, exactly as persisted. */
  readCapabilities(): Promise<readonly Capability[]>;

  /**
   * Upserts each given registration by its own identity (name, version) —
   * creating it fresh where the identity is new, replacing the record
   * already held there where it is not — without deleting any registration
   * this call does not name (task/capability-registry-write-upsert-hotfix):
   * a table-wide replace-and-reinsert previously left a persisted store
   * unable to write any registration once any capability was referenced
   * elsewhere, however unrelated to the identity being written.
   */
  writeCapabilities(capabilities: readonly Capability[]): Promise<void>;
}
