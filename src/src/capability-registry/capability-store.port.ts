import type { Capability } from './capability.js';

export interface ICapabilityStore {

  readCapabilities(): Promise<readonly Capability[]>;

  writeCapabilities(capabilities: readonly Capability[]): Promise<void>;

  deleteCapability(name: string, version: string): Promise<void>;
}
