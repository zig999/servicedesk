/**
 * One currently registered capability's own bare identity — name and version
 * (domain/integration/capability) — restated locally the same minimal alias
 * case-input-requirements.ts's own CapabilityIdentity already keeps (MNT-03
 * kept in spirit, this module's own header comment reasoning): a two-field
 * identity pair is not the shared shape reader this file has no dependency
 * on to avoid duplicating, so it is declared once per consuming module the
 * same way duplicate-concept-answer.error.ts and
 * concept-already-answered.error.ts already do.
 */
type CapabilityIdentity = Readonly<{ name: string; version: string }>;

/**
 * One attribute the pinned case version's own derived input requirements
 * name required (domain/knowledge/case-input-requirement) that the diagnose
 * request's subject left missing or empty, together with every currently
 * registered capability that requires it.
 */
export type MissingCaseInput = Readonly<{ attribute: string; capabilities: readonly CapabilityIdentity[] }>;

/**
 * A business error of the investigation context:
 * rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
 * — a diagnose's subject holds no attribute-value, or an empty one, for at
 * least one attribute the pinned case version's own derived input
 * requirements (domain/knowledge/case-input-requirement,
 * rules/knowledge/a-case-versions-input-requirements-are-derived) name
 * required. Raised before any collection ever runs
 * (contracts/investigation/diagnosis,
 * scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute),
 * naming every missing attribute together with every capability currently
 * asking for it — the same refuse-once-with-every-violation-named
 * convention SubjectAttributeNotInGlossaryError and
 * InvestigationNotBuildableError already keep for their own refusals,
 * rather than the first one found.
 */
export class SubjectDoesNotCoverCaseInputsError extends Error {
  public readonly context: Readonly<{ missing: readonly MissingCaseInput[] }>;

  public constructor(missing: readonly MissingCaseInput[]) {
    super(`the subject does not cover this case's required inputs: ${missing.map(describeMissing).join('; ')}`);
    this.name = 'SubjectDoesNotCoverCaseInputsError';
    this.context = { missing };
  }
}

/** Renders one missing attribute together with the capabilities that require it, for this error's own message. */
function describeMissing(entry: MissingCaseInput): string {
  const capabilities = entry.capabilities.map((capability) => `${capability.name}@${capability.version}`).join(', ');
  return `"${entry.attribute}" (required by ${capabilities})`;
}
