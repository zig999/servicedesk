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

export type ConnectorConfigurationDraft = {
  readonly connector: string;
  readonly configuration: string;
  readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];
  readonly generated_credentials: readonly ConnectorConfigurationDraftGeneratedCredential[];
  readonly method_mismatch?: ConnectorConfigurationDraftMethodMismatch;
};
