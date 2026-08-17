// release (contracts/knowledge/case-lifecycle, domain/knowledge/case-version's
// own declared "release" operation): the one trigger that ever moves a
// version out of draft (rules/knowledge/a-case-version-moves-through-its-declared-lifecycle).
// It assembles the named version whole, refuses one already outside draft
// state before running any validation at all, then runs the same structural
// and coherence validation read-case already runs over an assembled case —
// parse-case-document.ts's own structural parse and
// validate-case-coherence.ts's own caseCoherenceViolations, neither
// reimplemented here (MNT-03) — and refuses once, naming every violated rule
// together, where either half fails (rules/knowledge/validation-runs-at-every-read:
// the gate release itself runs, before any state transition, with nothing
// stored on either refusal). Only once every rule holds does it call the
// store's own release() primitive, which records the transition and the
// release instant and, from there on, refuses any further write against
// that version's own row or its manifest entries
// (rules/knowledge/a-case-version-is-written-once,
// rules/knowledge/a-released-hypothesis-revision-is-never-altered) — the
// schema's own release-conditioned rules enforce that, not this operation.
// Because this operation only ever reads and writes the one named
// slug/version, releasing one version never touches any other version's own
// row or manifest (scenarios/knowledge/a-released-version-keeps-its-original-revision).
//
// The assembled shape case-store.port.ts's own assembleVersion answers
// (AssembledCaseVersion) is not the raw document shape parseCaseDocument
// accepts: a manifest entry there nests its adopted hypothesis-revision's
// content under hypothesis_revision, with hypothesis_name inside it, where
// parseCaseDocument's own ManifestEntryDocument expects hypothesis_name flat
// on the entry itself — the same flattening case-store.port.ts's own header
// comment already notes for this exact fact. assembledAsDocument below is
// the minimal projection that closes that gap; no node names this shape, so
// it is this task's own inference, disclosed in its delivery record. release
// has no file either, so the file-name parameter parseCaseDocument's own
// slug rule reads is built from the assembled version's own already-known
// slug, the same way author-case-version.service.ts's own parsedCase()
// stands one in for a submission that has no file.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseVersionNotDraftAtReleaseError } from '../errors/case-version-not-draft-at-release.error.js';
import { CaseVersionNotReleasableError } from '../errors/case-version-not-releasable.error.js';
import { InvalidCaseDocumentError } from '../errors/invalid-case-document.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { CASE_DOCUMENT_ENDING, type Case } from './case.js';
import type { AssembledCaseVersion, ICaseStore } from './case-store.port.js';
import { parseCaseDocument } from './parse-case-document.js';
import { caseCoherenceViolations } from './validate-case-coherence.js';

/**
 * The published release operation (contracts/knowledge/case-lifecycle). A
 * consumer depends on this interface, never on the case store, the glossary
 * or the capability registry behind it (ARC-01's own reading, extended here
 * the same way create-draft.operation.ts already does, even though this
 * file's own suffix sits outside that rule's declared scope).
 */
export interface IRelease {
  /**
   * release: refused, through CaseVersionNotDraftAtReleaseError, where the
   * named version is not in draft state; refused, through
   * CaseVersionNotReleasableError naming every violated rule together, where
   * its assembled manifest fails any structural or coherence rule at the
   * moment of release; refused, through CaseNotFoundError, where the named
   * slug/version is not stored at all; otherwise marks the version released
   * and records the release instant, and changes nothing stored on any
   * refusal.
   */
  release(slug: string, version: number): Promise<void>;
}

/**
 * The release operation's one implementation: composes the case store with
 * the same two upstream published reads CaseQueryService and
 * AuthorCaseVersionService already compose for validation — the glossary
 * and the capability registry — reached only for revalidating the assembled
 * manifest, never touched directly for anything else.
 */
export class ReleaseOperation implements IRelease {
  public constructor(
    private readonly caseStore: ICaseStore,
    private readonly glossary: IGlossaryQuery,
    private readonly capabilities: ICapabilityQuery,
  ) {}

  public async release(slug: string, version: number): Promise<void> {
    const assembled = await heldAssembledVersion(this.caseStore, slug, version);
    refuseNonDraft(assembled);
    const violations = await releaseViolations(assembled, this.glossary, this.capabilities);
    if (violations.length > 0) {
      throw new CaseVersionNotReleasableError(slug, version, violations);
    }
    await this.caseStore.release(slug, version);
  }
}

/** Answers the assembled version, refusing an unstored one through the same typed not-found error read-case and replay-case already share (MNT-03). */
async function heldAssembledVersion(
  caseStore: ICaseStore,
  slug: string,
  version: number,
): Promise<AssembledCaseVersion> {
  const assembled = await caseStore.assembleVersion(slug, version);
  if (assembled === undefined) {
    throw new CaseNotFoundError(slug, version);
  }
  return assembled;
}

/** Refuses a version that is not in draft state, before any validation runs at all (rules/knowledge/a-case-version-moves-through-its-declared-lifecycle). */
function refuseNonDraft(assembled: AssembledCaseVersion): void {
  if (assembled.state !== 'draft') {
    throw new CaseVersionNotDraftAtReleaseError(assembled.slug, assembled.version, assembled.state);
  }
}

/**
 * Either the case, once every structural rule holds, or the structural
 * problems it failed — a discriminated union so a caller narrows on `kind`
 * rather than reading an optional field that a type assertion would have to
 * stand behind (TYP-02).
 */
type StructuralOutcome =
  | { readonly kind: 'parsed'; readonly theCase: Case }
  | { readonly kind: 'invalid'; readonly problems: readonly string[] };

/**
 * Every violation the assembled version holds against the structural and
 * coherence rules together, collected so release refuses once naming all of
 * them (contracts/knowledge/case-lifecycle) — a structural failure prevents
 * building a valid case at all, so coherence is only ever checked once
 * structure already holds, which is why the two never both contribute at
 * once rather than because either is skipped.
 */
async function releaseViolations(
  assembled: AssembledCaseVersion,
  glossary: IGlossaryQuery,
  capabilities: ICapabilityQuery,
): Promise<readonly string[]> {
  const structural = structuralOutcome(assembled);
  return structural.kind === 'invalid'
    ? structural.problems
    : caseCoherenceViolations(structural.theCase, glossary, capabilities);
}

/**
 * Runs parse-case-document.ts's own structural parse over the assembled
 * version, projected into the raw shape it expects (assembledAsDocument
 * below) — never reimplemented (MNT-03). InvalidCaseDocumentError's own
 * problems are read back rather than let release raise a second,
 * differently-shaped structural error.
 */
function structuralOutcome(assembled: AssembledCaseVersion): StructuralOutcome {
  try {
    const theCase = parseCaseDocument(
      assembledAsDocument(assembled),
      `${assembled.slug}${CASE_DOCUMENT_ENDING}`,
    );
    return { kind: 'parsed', theCase };
  } catch (error) {
    if (error instanceof InvalidCaseDocumentError) {
      return { kind: 'invalid', problems: error.context.problems };
    }
    throw error;
  }
}

/**
 * Projects the assembled version into the flat raw shape parseCaseDocument
 * accepts: each manifest entry's own adopted hypothesis-revision content
 * flattened onto the entry itself (hypothesis_name, revision, criterion,
 * collects, resolution) rather than nested under hypothesis_revision, the
 * document shape parse-case-document.ts's own ManifestEntryDocument
 * declares — this operation's own minimal adapter, since no node names a
 * shape for it (this task's own inference, disclosed in its delivery
 * record). The optional fields travel through exactly where the assembled
 * version declares them, the same present-only-where-declared convention
 * parse-case-document.ts's own heldCase already keeps.
 */
function assembledAsDocument(assembled: AssembledCaseVersion): unknown {
  return {
    slug: assembled.slug,
    title: assembled.title,
    when_to_use: assembled.when_to_use,
    version: assembled.version,
    authored_at: assembled.authored_at,
    subject: assembled.subject,
    fallback: assembled.fallback,
    ...(assembled.consolidation_register !== undefined
      ? { consolidation_register: assembled.consolidation_register }
      : {}),
    state: assembled.state,
    ...(assembled.released_at !== undefined ? { released_at: assembled.released_at } : {}),
    manifest: assembled.manifest.map((entry) => ({
      position: entry.position,
      hypothesis_name: entry.hypothesis_revision.hypothesis_name,
      revision: entry.hypothesis_revision.revision,
      criterion: entry.hypothesis_revision.criterion,
      collects: entry.hypothesis_revision.collects,
      resolution: entry.hypothesis_revision.resolution,
    })),
  };
}
