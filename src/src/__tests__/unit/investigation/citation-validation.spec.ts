// Proof for task/hypothesis-judgment/citation-validation: isCitationValid answers
// true only where a citation's concept is one the judged hypothesis's own
// collects names AND its field exists in the output schema of the capability
// that produced the cited evidence for that same concept
// (rules/investigation/a-citation-stays-within-the-hypothesis-collects,
// rules/investigation/a-cited-field-exists-in-the-capability-output-schema);
// every other proposed citation is refused, and a malformed schema, a
// concept with no matching evidence, or a schema declared under a capability
// identity other than the cited evidence's own all refuse the same way,
// without ever throwing. acceptedCitations filters a proposed set of
// citations the same way, keeping only the accepted ones in the order they
// were proposed. Pure and synchronous throughout, so no fake timers or async
// handling is needed here.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { Citation } from '../../../investigation/citation.js';
import {
  acceptedCitations,
  capabilityOutputSchemaKey,
  isCitationValid,
  type HypothesisCitationContext,
  type ValidateCitationsOptions,
} from '../../../investigation/citation-validation.js';
import type { Evidence } from '../../../investigation/evidence.js';

/** One collected concept's whole Evidence record, defaulted so a test states only what it is about — the concept and, where given, the producing capability's own identity. */
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

/** A JSON-Schema-shaped output_schema declaring exactly the given field names as top-level `properties` keys. */
function schemaDeclaring(...fields: readonly string[]): string {
  return JSON.stringify({
    type: 'object',
    properties: Object.fromEntries(fields.map((field) => [field, { type: 'string' }])),
  });
}

it("refuses a citation naming a concept outside the judged hypothesis's collects, even though its field matches that concept's own capability schema", () => {
  const collectedEvidence = anEvidence({ concept: 'a-collected-concept', capability_name: 'cap-collected' });
  const foreignEvidence = anEvidence({ concept: 'a-foreign-concept', capability_name: 'cap-foreign' });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [collectedEvidence, foreignEvidence],
    outputSchemas: {
      [capabilityOutputSchemaKey(collectedEvidence.capability_name, collectedEvidence.capability_version)]:
        schemaDeclaring('a-field'),
      [capabilityOutputSchemaKey(foreignEvidence.capability_name, foreignEvidence.capability_version)]:
        schemaDeclaring('a-field'),
    },
  };
  const citation: Citation = { concept: 'a-foreign-concept', field: 'a-field' };

  expect(isCitationValid(context, citation)).toBe(false);
});

it('refuses a citation naming a field absent from the output schema of the capability that produced the cited evidence, even though its concept is collected', () => {
  const evidence = anEvidence({ concept: 'a-collected-concept', capability_name: 'cap-collected' });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [evidence],
    outputSchemas: {
      [capabilityOutputSchemaKey(evidence.capability_name, evidence.capability_version)]: schemaDeclaring('a-declared-field'),
    },
  };
  const citation: Citation = { concept: 'a-collected-concept', field: 'an-undeclared-field' };

  expect(isCitationValid(context, citation)).toBe(false);
});

it("accepts a citation naming a concept in the hypothesis's collects and a field present in that capability's own output schema", () => {
  const evidence = anEvidence({ concept: 'a-collected-concept', capability_name: 'cap-collected' });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [evidence],
    outputSchemas: {
      [capabilityOutputSchemaKey(evidence.capability_name, evidence.capability_version)]: schemaDeclaring('a-declared-field'),
    },
  };
  const citation: Citation = { concept: 'a-collected-concept', field: 'a-declared-field' };

  expect(isCitationValid(context, citation)).toBe(true);
});

it('refuses a citation against an output_schema that is not valid JSON, answering false rather than throwing', () => {
  const evidence = anEvidence({ concept: 'a-collected-concept', capability_name: 'cap-collected' });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [evidence],
    outputSchemas: {
      [capabilityOutputSchemaKey(evidence.capability_name, evidence.capability_version)]: 'not { valid json',
    },
  };
  const citation: Citation = { concept: 'a-collected-concept', field: 'any-field' };

  expect(() => isCitationValid(context, citation)).not.toThrow();
  expect(isCitationValid(context, citation)).toBe(false);
});

it('refuses a citation against an output_schema that parses as JSON but declares no top-level properties object', () => {
  const evidence = anEvidence({ concept: 'a-collected-concept', capability_name: 'cap-collected' });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [evidence],
    outputSchemas: {
      [capabilityOutputSchemaKey(evidence.capability_name, evidence.capability_version)]: JSON.stringify({ type: 'object' }),
    },
  };
  const citation: Citation = { concept: 'a-collected-concept', field: 'any-field' };

  expect(() => isCitationValid(context, citation)).not.toThrow();
  expect(isCitationValid(context, citation)).toBe(false);
});

it('refuses a citation whose concept has no matching entry in the supplied evidence at all, answering false rather than throwing', () => {
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept-with-no-evidence'],
    evidence: [],
    outputSchemas: {},
  };
  const citation: Citation = { concept: 'a-collected-concept-with-no-evidence', field: 'any-field' };

  expect(() => isCitationValid(context, citation)).not.toThrow();
  expect(isCitationValid(context, citation)).toBe(false);
});

it("refuses a citation whose field is declared only under a different capability_name/capability_version than the cited evidence's own", () => {
  const evidence = anEvidence({
    concept: 'a-collected-concept',
    capability_name: 'cap-collected',
    capability_version: '1.0.0',
  });
  const context: HypothesisCitationContext = {
    collects: ['a-collected-concept'],
    evidence: [evidence],
    outputSchemas: {
      // Declared for a different version of the same capability, never for '1.0.0' — the version the cited evidence actually names.
      [capabilityOutputSchemaKey(evidence.capability_name, '2.0.0')]: schemaDeclaring('a-declared-field'),
    },
  };
  const citation: Citation = { concept: 'a-collected-concept', field: 'a-declared-field' };

  expect(isCitationValid(context, citation)).toBe(false);
});

it('filters a proposed set of citations to only those accepted, keeping the accepted ones in the order they were proposed', () => {
  const evidenceA = anEvidence({ concept: 'concept-a', capability_name: 'cap-a', capability_version: '1.0.0' });
  const evidenceB = anEvidence({ concept: 'concept-b', capability_name: 'cap-b', capability_version: '1.0.0' });
  const options: ValidateCitationsOptions = {
    collects: ['concept-a', 'concept-b'],
    evidence: [evidenceA, evidenceB],
    outputSchemas: {
      [capabilityOutputSchemaKey(evidenceA.capability_name, evidenceA.capability_version)]: schemaDeclaring('field-a'),
      [capabilityOutputSchemaKey(evidenceB.capability_name, evidenceB.capability_version)]: schemaDeclaring('field-b'),
    },
    citations: [
      { concept: 'concept-a', field: 'field-a' }, // accepted: collected concept, declared field
      { concept: 'concept-foreign', field: 'field-a' }, // refused: concept outside collects
      { concept: 'concept-b', field: 'field-missing' }, // refused: field not declared
      { concept: 'concept-b', field: 'field-b' }, // accepted: collected concept, declared field
    ],
  };

  const result = acceptedCitations(options);

  expect(result).toEqual([options.citations[0], options.citations[3]]);
});

// ---------- task/fix-post-case-lifecycle-stale-citations/fix-stale-citations: doc-comment citations

/** This module's own raw source, read fresh per test so a citation test reads exactly what ships. */
async function moduleSource(): Promise<string> {
  return readFile(fileURLToPath(new URL('../../../investigation/citation-validation.ts', import.meta.url)), 'utf8');
}

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
