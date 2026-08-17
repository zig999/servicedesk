/**
 * A business error of the knowledge context: the given case version is not
 * in draft state, and rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
 * restricts a family of operations — discard (rules/knowledge/only-a-draft-case-version-may-be-discarded)
 * and manifest composition, place-hypothesis and remove-hypothesis alike
 * (domain/knowledge/case-version's own "[the manifest] may be freely
 * composed" while in draft) — to a version still in draft state. A released
 * version, and its manifest, is never altered again
 * (rules/knowledge/a-case-version-is-written-once), so each caller refuses
 * here rather than leaving it to a schema rule that would merely no-op the
 * write silently. Shared by discard.operation.ts,
 * manifest-composition.operations.ts and relational-case-store.repository.ts's
 * own updateDraft — the same guard, extended to a version's own declared
 * attributes (title, when_to_use, subject, fallback,
 * consolidation_register) rather than its manifest or its removal;
 * release.operation.ts raises its own, separately-worded
 * CaseVersionNotDraftAtReleaseError instead, since a release refusal states
 * a different reason than either of these.
 */
export class CaseVersionNotDraftError extends Error {
  public readonly context: Readonly<{ slug: string; version: number; state: string }>;

  public constructor(slug: string, version: number, state: string) {
    super(`case "${slug}" version ${version} is in state "${state}", not draft`);
    this.name = 'CaseVersionNotDraftError';
    this.context = { slug, version, state };
  }
}
