// Proof for task/judgment-reads-the-snapshot/judgment-stops-re-reading-the-registry:
// isCitationValid answers true only where a citation's concept is one the
// judged hypothesis's own collects names AND its field exists among the
// field names its own cited evidence item snapshotted at the moment it was
// collected (rules/investigation/a-citation-stays-within-the-hypothesis-collects,
// rules/investigation/a-cited-field-exists-in-the-capability-output-schema,
// rules/investigation/judgment-reads-the-evidence-snapshot) — never resolved
// through a live capability-registry read: this file constructs no
// capability-registry fake and no output-schema map at all, only Evidence
// values carrying their own already-snapshotted `fields`. Every other
// proposed citation is refused, and a concept with no matching evidence
// refuses the same way, without ever throwing. acceptedCitations filters a
// proposed set of citations the same way, keeping only the accepted ones in
// the order they were proposed. Pure and synchronous throughout, so no fake
// timers or async handling is needed here.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { Citation } from '../../../investigation/citation.js';
import {
  acceptedCitations,
  isCitationValid,
  type HypothesisCitationContext,
  type ValidateCitationsOptions,
} from '../../../investigation/citation-validation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { FieldSemantics } from '../../../investigation/field-semantics.js';

/** One collected concept's whole Evidence record, defaulted so a test states only what it is about — the concept and, where given, its own snapshotted fields. */
function anEvidence(overrides: Partial<Evidence> & { readonly concept: string }): Evidence {
  return {
    inputs: 'an-input',
    observation: 'an-observation',
    observed_at: '2024-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: `capability-for-${overrides.concept}`,
    capability_version: '1.0.0',
    elapsed_ms: 12,
    fields: [],
    concept_description: '',
    ...overrides,
  };
}

/** The field names given, each as a bare FieldSemantics entry (no type or description) — exactly the shape an evidence item's own `fields` snapshot carries. */
function fieldsDeclaring(...names: readonly string[]): readonly FieldSemantics[] {
  return names.map((name) => ({ name }));
}

it("refuses a citation naming a concept outside the judged hypothesis's collects, even though its field matches that concept's own cited evidence item's snapshotted fields", () => {
  const collectedEvidence = anEvidence({ concept: 'a-collected-concept', fields: fieldsDeclaring('a-field') });
  const foreignEvidence = anEvidence({ concept: 'a-foreign-concept', fields: fieldsDeclaring('a-field') });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [collectedEvidence, foreignEvidence],
  };
  const citation: Citation = { concept: 'a-foreign-concept', field: 'a-field' };

  expect(isCitationValid(context, citation)).toBe(false);
});

it("refuses a citation naming a field absent from its own cited evidence item's snapshotted fields, even though its concept is collected", () => {
  const evidence = anEvidence({ concept: 'a-collected-concept', fields: fieldsDeclaring('a-declared-field') });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [evidence],
  };
  const citation: Citation = { concept: 'a-collected-concept', field: 'an-undeclared-field' };

  expect(isCitationValid(context, citation)).toBe(false);
});

it("accepts a citation naming a concept in the hypothesis's collects and a field present among that same evidence item's own snapshotted fields", () => {
  const evidence = anEvidence({ concept: 'a-collected-concept', fields: fieldsDeclaring('a-declared-field') });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [evidence],
  };
  const citation: Citation = { concept: 'a-collected-concept', field: 'a-declared-field' };

  expect(isCitationValid(context, citation)).toBe(true);
});

it('refuses a citation whose concept has no matching entry in the supplied evidence at all, answering false rather than throwing', () => {
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept-with-no-evidence'],
    evidence: [],
  };
  const citation: Citation = { concept: 'a-collected-concept-with-no-evidence', field: 'any-field' };

  expect(() => isCitationValid(context, citation)).not.toThrow();
  expect(isCitationValid(context, citation)).toBe(false);
});

it("refuses a citation naming a field that exists among some OTHER evidence item's own snapshotted fields, but not among its own cited evidence item's — the field check binds strictly to the one evidence item the citation's own concept names, never any other item in context", () => {
  const citedEvidence = anEvidence({ concept: 'a-collected-concept', fields: fieldsDeclaring('field-on-a') });
  const otherEvidence = anEvidence({ concept: 'a-different-collected-concept', fields: fieldsDeclaring('field-on-b') });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept', 'a-different-collected-concept'],
    evidence: [citedEvidence, otherEvidence],
  };
  // field-on-b exists in context.evidence overall, but never on the item this citation's own concept names.
  const citation: Citation = { concept: 'a-collected-concept', field: 'field-on-b' };

  expect(isCitationValid(context, citation)).toBe(false);
});

it('filters a proposed set of citations to only those accepted, keeping the accepted ones in the order they were proposed', () => {
  const evidenceA = anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') });
  const evidenceB = anEvidence({ concept: 'concept-b', fields: fieldsDeclaring('field-b') });
  const options: ValidateCitationsOptions = {
    collects: ['concept-a', 'concept-b'],
    evidence: [evidenceA, evidenceB],
    citations: [
      { concept: 'concept-a', field: 'field-a' }, // accepted: collected concept, snapshotted field
      { concept: 'concept-foreign', field: 'field-a' }, // refused: concept outside collects
      { concept: 'concept-b', field: 'field-missing' }, // refused: field not in that item's own snapshot
      { concept: 'concept-b', field: 'field-b' }, // accepted: collected concept, snapshotted field
    ],
  };

  const result = acceptedCitations(options);

  expect(result).toEqual([options.citations[0], options.citations[3]]);
});

// ---------- task/judgment-reads-the-snapshot/judgment-stops-re-reading-the-registry: no live capability-registry path left in this file at all

/** This module's own raw source, read fresh per test so a citation test reads exactly what ships. */
async function moduleSource(): Promise<string> {
  return readFile(fileURLToPath(new URL('../../../investigation/citation-validation.ts', import.meta.url)), 'utf8');
}

it('declares no outputSchemas field, no capabilityOutputSchemaKey helper and no CapabilityOutputSchemas type — the field-existence check has no live-resolved capability output-schema map left to build or read', async () => {
  const source = await moduleSource();

  expect(source).not.toMatch(/outputSchemas/);
  expect(source).not.toMatch(/capabilityOutputSchemaKey/);
  expect(source).not.toMatch(/CapabilityOutputSchemas/);
});

// ---------- task/fix-post-case-lifecycle-stale-citations/fix-stale-citations: doc-comment citations

/** The JSDoc block immediately preceding the given marker in source — never the whole file. */
function docCommentBefore(source: string, marker: string): string {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`marker ${JSON.stringify(marker)} not found in source`);
  }
  const before = source.slice(0, markerIndex);
  const commentEnd = before.lastIndexOf('*/');
  const commentStart = before.lastIndexOf('/**', commentEnd);
  return before.slice(commentStart, commentEnd + 2);
}

/** A comment block's prose, its comment markers stripped and its wrapped lines joined with single spaces, so a citation the source wraps across lines is still matched as one continuous string. */
function normalizedProse(commentBlock: string): string {
  return commentBlock
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*\/\*\*\s?/, '')
        .replace(/^\s*\*\/\s*$/, '')
        .replace(/^\s*\*\s?/, '')
        .replace(/\s*\*\/\s*$/, '')
        .trim(),
    )
    .filter((line) => line.length > 0)
    .join(' ');
}

it("HypothesisCitationContext's doc comment cites domain/knowledge/hypothesis-revision for collects, not domain/knowledge/hypothesis", async () => {
  const comment = normalizedProse(docCommentBefore(await moduleSource(), 'export type HypothesisCitationContext'));

  expect(comment).toContain('domain/knowledge/hypothesis-revision');
  expect(comment).not.toMatch(/domain\/knowledge\/hypothesis(?!-revision)/);
});
