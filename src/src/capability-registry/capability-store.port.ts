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

  /** Replaces the registry's persisted registrations, whole. */
  writeCapabilities(capabilities: readonly Capability[]): Promise<void>;
}
