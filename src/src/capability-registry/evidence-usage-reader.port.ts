export type CapabilityIdentityForEvidenceUsageCheck = {
  readonly name: string;
  readonly version: string;
};

export interface IEvidenceUsageReader {

  isCapabilityNamedByEvidence(identity: CapabilityIdentityForEvidenceUsageCheck): Promise<boolean>;
}
