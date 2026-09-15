export const CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS = [
  'schema-not-reducible-to-a-type',
  'name-claimed-by-another-parameter',
] as const;

export type CapabilitySchemaDraftUnresolvedReason = (typeof CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS)[number];

export type CapabilitySchemaDraftUnresolvedItem = {
  readonly name: string;
  readonly reason: CapabilitySchemaDraftUnresolvedReason;
};

export type CapabilitySchemaDraft = {
  readonly input_schema: string;
  readonly output_schema: string;
  readonly unresolved: readonly CapabilitySchemaDraftUnresolvedItem[];
};
