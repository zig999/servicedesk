// The capability vocabulary as data (domain/integration): pure values with
// no behavior, each attribute spelled as the specification declares it so
// the persisted record and the node read the same.

/**
 * What a capability may do to the world
 * (domain/integration/capability-nature): only read-only registers, and
 * mutating exists as a value so the registry has something to refuse — the
 * system diagnoses and refers, never acts.
 */
export const CAPABILITY_NATURES = ['read-only', 'mutating'] as const;

/** One of the two capability natures, by name. */
export type CapabilityNature = (typeof CAPABILITY_NATURES)[number];

/** The one nature that registers (rules/integration/a-capability-is-read-only). */
export const READ_ONLY_NATURE = 'read-only' satisfies CapabilityNature;

/**
 * One registered read-only observation the system can perform, identified by
 * name and version, as the registry holds it — every attribute declared
 * (domain/integration/capability).
 */
export type Capability = {
  readonly name: string;
  readonly version: string;
  readonly nature: CapabilityNature;
  /** The schema of what the capability takes. */
  readonly input_schema: string;
  /** The schema of what it produces, stated in the glossary's vocabulary — what bounds every citation over its evidence. */
  readonly output_schema: string;
  /** Its own budget inside the collection's global deadline, in milliseconds. */
  readonly timeout: number;
  /** The adapter that executes it. */
  readonly connector: string;
  /** The concept this capability answers, by its glossary name — what the registry looks a capability up by (domain/integration/capability-registry). */
  readonly concept: string;
};

/**
 * A capability as its registration submits it: every attribute may still be
 * absent or empty — the registry, never the type, is what refuses a
 * registration departing from the declared contract, and a registration
 * that states no timeout takes the default below.
 */
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

/**
 * The timeout a registration that states none takes: the rule states the
 * default as sixty seconds and the capability declares its timeout in
 * milliseconds, so the held value is 60000
 * (rules/integration/a-capability-declares-its-contract,
 * domain/integration/capability).
 */
export const DEFAULT_CAPABILITY_TIMEOUT_MS = 60_000;

/**
 * The attributes a registration must declare: every required attribute of
 * the capability element except the defaulted timeout, plus the concept the
 * capability answers — the registry being the one lookup from a concept to
 * the capability that answers it (domain/integration/capability-registry).
 */
export const REQUIRED_REGISTRATION_ATTRIBUTES = [
  'name',
  'version',
  'nature',
  'input_schema',
  'output_schema',
  'connector',
  'concept',
] as const;

/**
 * The two attributes rules/integration/a-capability-declares-well-formed-schemas
 * holds to JSON syntax: a malformed one is silently read as no fields at all
 * wherever a citation is checked against it, so the registry refuses it at
 * the door instead of ever writing it.
 */
export const SCHEMA_ATTRIBUTES = ['input_schema', 'output_schema'] as const;
