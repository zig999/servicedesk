// Proof for task/diagnose-entry-point/diagnose-payload-and-window-dedup's own
// new run registry: completedMatch answers a cached Assessment bounded by the
// very same window IdempotencyLeaseStore already computes for its own lease,
// rather than a second expiry of its own; inProgressRun answers the exact
// promise a caller is meant to join while a run is still executing, and
// nothing once it has settled; run() registers that promise before it can
// settle, moves a successful result into the completed map, and never caches
// a rejection — the running entry it always clears leaves nothing behind for
// a later request to (incorrectly) treat as completed or join.
//
// The two tests under "the in-progress marker is a lease, not domain state"
// prove this delivery's own UNDERDETERMINED note
// (constraints/in-progress-is-a-lease-not-domain-state): an implementation
// that instead persisted a partial investigation record carrying a status
// field, and let a concurrent request join by reading it back, would fail
// both — it would need either to name a status field or reach a persisted
// store from this module, and its state would then survive across a fresh
// registry instance rather than living only inside this one's own two
// in-process maps.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { Assessment } from '../../../investigation/assessment.js';
import { DiagnosisRunRegistry } from '../../../investigation/diagnosis-run-registry.js';
import type { IdempotencyKey } from '../../../investigation/idempotency-key.js';
import { IdempotencyLeaseStore } from '../../../investigation/idempotency-lease-store.js';

const REGISTRY_MODULE_PATH = fileURLToPath(new URL('../../../investigation/diagnosis-run-registry.ts', import.meta.url));

const WINDOW_MS = 1_000;

/** The key most tests resolve a run for. */
const A_KEY: IdempotencyKey = {
  subject: { type: 'ont', attributes: [{ attribute: 'id', value: 'subject-one' }] },
  caseReference: 'case-one',
  ticketRef: 'ticket-one',
};

/** A minimally valid Assessment, defaulted so a test states only what distinguishes it from another one. */
function anAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    text: 'an assessment text',
    ...overrides,
  };
}

/** Matches static imports, re-exports and dynamic imports, capturing the module specifier — the same pattern observation-source-modules.spec.ts already establishes for this kind of structural sweep. */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

/** Every module specifier one source text imports. */
function importSpecifiersOf(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER_PATTERN)].map((match) => match[1]);
}

// ----------------------------------------------------- completedMatch: nothing recorded yet

it('answers undefined for a key nothing has ever run for', () => {
  const registry = new DiagnosisRunRegistry();
  const leases = new IdempotencyLeaseStore(WINDOW_MS);

  expect(registry.completedMatch(A_KEY, 0, leases)).toBeUndefined();
});

// ------------------------------------------------------ inProgressRun: nothing running yet

it('answers undefined for a key with no run currently in flight', () => {
  const registry = new DiagnosisRunRegistry();

  expect(registry.inProgressRun(A_KEY)).toBeUndefined();
});

// ---------------------------------------------------------------- run(): the completed half

it('answers the completed assessment for a key whose lease is still current, once run() has resolved', async () => {
  const registry = new DiagnosisRunRegistry();
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  leases.acquire(A_KEY, 0);
  const assessment = anAssessment();

  await registry.run(A_KEY, () => Promise.resolve(assessment));

  expect(registry.completedMatch(A_KEY, 10, leases)).toBe(assessment);
});

it('answers undefined for a completed key once its lease has fallen outside the window, even though the completed record itself was never cleared', async () => {
  const registry = new DiagnosisRunRegistry();
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  leases.acquire(A_KEY, 0);
  const assessment = anAssessment();
  await registry.run(A_KEY, () => Promise.resolve(assessment));

  expect(registry.completedMatch(A_KEY, WINDOW_MS + 1, leases)).toBeUndefined();
});

// -------------------------------------------------------------- run(): the in-progress half

it('answers the exact promise a caller is meant to join while its own run has not settled yet', async () => {
  const registry = new DiagnosisRunRegistry();
  let resolveRun: (assessment: Assessment) => void = () => {};
  const pending = new Promise<Assessment>((resolve) => {
    resolveRun = resolve;
  });

  const runPromise = registry.run(A_KEY, () => pending);

  expect(registry.inProgressRun(A_KEY)).toBe(pending);
  resolveRun(anAssessment());
  await runPromise;
});

it('clears the in-progress entry once the run has settled successfully, so a caller arriving afterward finds nothing left to join', async () => {
  const registry = new DiagnosisRunRegistry();
  const assessment = anAssessment();

  await registry.run(A_KEY, () => Promise.resolve(assessment));

  expect(registry.inProgressRun(A_KEY)).toBeUndefined();
});

// --------------------------------------------------------------- run(): edge case, a failed attempt

it('never caches a rejected run as completed, and clears its in-progress entry all the same, so a later run for the same key can start its own fresh attempt', async () => {
  const registry = new DiagnosisRunRegistry();
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  leases.acquire(A_KEY, 0);
  const failure = new Error('the run failed');

  await expect(registry.run(A_KEY, () => Promise.reject(failure))).rejects.toBe(failure);

  expect(registry.completedMatch(A_KEY, 10, leases)).toBeUndefined();
  expect(registry.inProgressRun(A_KEY)).toBeUndefined();
  const retryAssessment = anAssessment({ text: 'the retry' });
  await expect(registry.run(A_KEY, () => Promise.resolve(retryAssessment))).resolves.toBe(retryAssessment);
});

// ----------------------------- the in-progress marker is a lease, not domain state (UNDERDETERMINED)
//
// The candidate implementation this delivery's own UNDERDETERMINED note names would persist a
// partial investigation record carrying a status field and let a concurrent request join by
// reading it back, rather than using the existing key-and-instant lease
// (constraints/in-progress-is-a-lease-not-domain-state). Both tests below fail over that
// candidate: it has nowhere to put its status field or its persisted-store import except this
// module (the one place this task's own in-progress routing lives), and its answer would then
// come from something shared rather than from this one registry instance's own two maps.

it('holds no status field, and imports no persisted investigation store, no Investigation type and no filesystem module', async () => {
  const source = await readFile(REGISTRY_MODULE_PATH, 'utf8');

  expect(source).not.toMatch(/\bstatus\b/i);
  const specifiers = importSpecifiersOf(source);
  const persistedRecordImports = specifiers.filter((specifier) => /investigation-store|\/investigation\.js$|^node:fs/i.test(specifier));
  expect(persistedRecordImports).toEqual([]);
});

it('holds every recorded run only inside the registry instance itself, so a fresh instance sees nothing for a key and lease a different instance already ran', async () => {
  const leases = new IdempotencyLeaseStore(WINDOW_MS);
  leases.acquire(A_KEY, 0);
  const firstRegistry = new DiagnosisRunRegistry();
  await firstRegistry.run(A_KEY, () => Promise.resolve(anAssessment()));

  const secondRegistry = new DiagnosisRunRegistry();

  expect(secondRegistry.completedMatch(A_KEY, 10, leases)).toBeUndefined();
  expect(secondRegistry.inProgressRun(A_KEY)).toBeUndefined();
});
