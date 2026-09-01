import { HypothesisNotInManifestError } from '../errors/hypothesis-not-in-manifest.error.js';
import type { Case, ManifestEntry, Referral } from './case.js';

export type Verdict = 'confirmed' | 'refuted' | 'inconclusive';

export type Verdicts = Readonly<Record<string, Verdict>>;

const CONFIRMED: Verdict = 'confirmed';

export type ResolvedOutcome = {

  readonly outcome: string;

  readonly referral: Referral;

  readonly determining?: string;
};

function byPrecedence(theCase: Case): readonly ManifestEntry[] {
  return [...theCase.manifest].sort((a, b) => a.position - b.position);
}

export function collectionPlan(theCase: Case): readonly string[] {
  return [...new Set(byPrecedence(theCase).flatMap((entry) => entry.hypothesis_revision.collects))];
}

export function requiresEvaluationOf(theCase: Case): readonly string[] {
  return theCase.manifest.map((entry) => entry.hypothesis_revision.hypothesis.name);
}

export function resolveOutcome(theCase: Case, verdicts: Verdicts): ResolvedOutcome {
  const determining = byPrecedence(theCase).find(
    (entry) => verdicts[entry.hypothesis_revision.hypothesis.name] === CONFIRMED,
  );
  if (determining === undefined) {
    return { outcome: theCase.fallback.outcome, referral: theCase.fallback.referral };
  }
  const revision = determining.hypothesis_revision;
  return {
    outcome: revision.resolution.outcome,
    referral: revision.resolution.referral,
    determining: revision.hypothesis.name,
  };
}

export function manifestEntryNamed(theCase: Case, hypothesisName: string): ManifestEntry {
  const entry = theCase.manifest.find((candidate) => candidate.hypothesis_revision.hypothesis.name === hypothesisName);
  if (entry === undefined) {
    throw new HypothesisNotInManifestError(theCase.slug, theCase.version, hypothesisName);
  }
  return entry;
}
