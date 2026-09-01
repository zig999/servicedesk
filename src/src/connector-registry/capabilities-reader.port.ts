export type RegisteredCapabilityForPlaceholderCheck = {
  readonly connector: string;
  readonly input_schema: string;
};

export interface ICapabilitiesReader {

  readCapabilities(): Promise<readonly RegisteredCapabilityForPlaceholderCheck[]>;
}
