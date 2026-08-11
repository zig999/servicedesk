// Proof that the fixture case validates without a coherence violation when read through the
// knowledge context's own case-reading path, composed exactly as production wires it — the real
// file-backed case, glossary and capability-registry stores, never a fake port — over the fixture's
// own glossary and capability data (contracts/knowledge/case-query, contracts/system/case-authoring,
// task/case-fixture/author-diagnose-fixture-case). The three fixture directories are copied into a
// scratch directory before each read, so this proof reads the fixture's own committed bytes without
// ever writing back into them — including through the glossary service's own non-conclusion-outcome
// top-up, which would otherwise write to whichever outcome file it read.
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { createCaseQuery } from '../../../factories/case-query.factory.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';
const VERSION = 1;

let caseDir: string;
let glossaryDir: string;
let capabilityDir: string;

beforeEach(async () => {
  caseDir = await mkdtemp(join(tmpdir(), 'diagnose-fixture-case-'));
  glossaryDir = await mkdtemp(join(tmpdir(), 'diagnose-fixture-glossary-'));
  capabilityDir = await mkdtemp(join(tmpdir(), 'diagnose-fixture-capability-'));
  await cp(join(FIXTURES_ROOT, 'case'), caseDir, { recursive: true });
  await cp(join(FIXTURES_ROOT, 'glossary'), glossaryDir, { recursive: true });
  await cp(join(FIXTURES_ROOT, 'capability'), capabilityDir, { recursive: true });
});

afterEach(async () => {
  await rm(caseDir, { recursive: true, force: true });
  await rm(glossaryDir, { recursive: true, force: true });
  await rm(capabilityDir, { recursive: true, force: true });
});

it(
  "reads the fixture case whole, with no coherence violation, through the real case-query wiring over " +
    "the fixture's own glossary and capability data",
  async () => {
    const query = createCaseQuery(caseDir, glossaryDir, capabilityDir);

    const result = await query.readCase(SLUG, VERSION);

    expect(result.case.slug).toBe(SLUG);
    expect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);
  },
);
