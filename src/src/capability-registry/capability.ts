export const CAPABILITY_NATURES = ['read-only', 'mutating'] as const;

export type CapabilityNature = (typeof CAPABILITY_NATURES)[number];

export const READ_ONLY_NATURE = 'read-only' satisfies CapabilityNature;

export type Capability = {
  readonly name: string;
  readonly version: string;
  readonly nature: CapabilityNature;

  readonly input_schema: string;

  readonly output_schema: string;

  readonly timeout: number;

  readonly connector: string;

  readonly concept: string;
};

export type CapabilityRegistration = {
  readonly name?: string;
  readonly version?: string;
  readonly nature?: string;
  readonly input_schema?: string;
  readonly output_schema?: string;
  readonly timeout?: number;
  readonly connector?: string;
  readonly concept?: string;
};

export const DEFAULT_CAPABILITY_TIMEOUT_MS = 60_000;

export const REQUIRED_REGISTRATION_ATTRIBUTES = [
  'name',
  'version',
  'nature',
  'input_schema',
  'output_schema',
  'connector',
  'concept',
] as const;

export const SCHEMA_ATTRIBUTES = ['input_schema', 'output_schema'] as const;
