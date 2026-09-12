export const CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS = [
  'no-capability-registered',
  'security-scheme-not-reducible-to-a-credential',
  'drafted-key-occupied-by-another-security-scheme',
] as const;

export type ConnectorConfigurationDraftUnresolvedReason =
  (typeof CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS)[number];

export type ConnectorConfigurationDraftUnresolvedItem = {
  readonly name: string;
  readonly reason: ConnectorConfigurationDraftUnresolvedReason;
};

export type ConnectorConfigurationDraftGeneratedCredential = {
  readonly name: string;
  readonly security_scheme: string;
};

export type ConnectorConfigurationDraftMethodMismatch = {
  readonly registered: string;
  readonly operation: string;
};

type ConnectorConfigurationDraftStatusReadingEnding = 'ok' | 'unavailable' | 'denied' | 'timeout';

export type ConnectorConfigurationDraftStatusReading = {
  readonly status: string;
  readonly ending: ConnectorConfigurationDraftStatusReadingEnding;
  readonly declared_as?: string;
};

export type ConnectorConfigurationDraftResponseField = {
  readonly name: string;
  readonly path: string;
  readonly status: string;
  readonly declared_type?: string;
  readonly declared_required?: boolean;
  readonly envelope?: string;
};

export const CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS = [
  'default-response-not-drafted',
  'status-range-not-drafted',
  'non-json-success-content-not-read',
  'envelope-read-through',
  'variants-united',
  'repeated-field-name-path-not-taken',
  'no-responses-declared',
  'no-success-response-schema',
  'success-schema-declares-no-properties',
] as const;

export type ConnectorConfigurationDraftReadingNoteKind =
  (typeof CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS)[number];

export type ConnectorConfigurationDraftReadingNote = {
  readonly kind: ConnectorConfigurationDraftReadingNoteKind;
  readonly subject: string;
  readonly detail?: string;
};

export type ConnectorConfigurationDraft = {
  readonly connector: string;
  readonly configuration: string;
  readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];
  readonly generated_credentials: readonly ConnectorConfigurationDraftGeneratedCredential[];
  readonly method_mismatch?: ConnectorConfigurationDraftMethodMismatch;
  readonly status_readings: readonly ConnectorConfigurationDraftStatusReading[];
  readonly response_fields: readonly ConnectorConfigurationDraftResponseField[];
  readonly reading_notes: readonly ConnectorConfigurationDraftReadingNote[];
};
