/**
 * A business error of the investigation context: simulate-hypothesis named a
 * hypothesis the pinned case version's manifest currently holds no entry for
 * (rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused)
 * — a miss that is refused rather than read as an ordinary empty result the
 * caller could mistake for something that answered, the same distinction
 * CaseNotFoundError, ConnectorConfigurationNotFoundError and
 * VocabularyTermNotHeldError already draw for a miss elsewhere in this
 * specification. The same name-message-context shape
 * HypothesisRevisionCollectsNoConceptError and SubjectCarriesNoAttributeError
 * already establish for their own contexts.
 */
export class HypothesisNotInManifestError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; hypothesis: string }>;

  public constructor(slug: string, version: number, hypothesis: string) {
    super(
      `hypothesis "${hypothesis}" is not in the manifest of case "${slug}" version ${version}`,
    );
    this.name = 'HypothesisNotInManifestError';
    this.context = { slug, version, hypothesis };
  }
}
