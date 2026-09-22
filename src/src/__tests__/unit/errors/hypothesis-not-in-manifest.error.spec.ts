import { expect, it } from 'vitest';
import { HypothesisNotInManifestError } from '../../../errors/hypothesis-not-in-manifest.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
import { ManifestWouldHoldNoHypothesisError } from '../../../errors/manifest-would-hold-no-hypothesis.error.js';

it('states its message in Brazilian Portuguese, naming the hypothesis, the case slug and the version number whose manifest does not hold it', () => {
  const error = new HypothesisNotInManifestError('orion-9', 4, 'warm-start-effect');

  expect(error.message).toBe('a hipótese "warm-start-effect" não está no manifesto do caso "orion-9" versão 4');
});

it('names a hypothesis as "hipótese", a case as "caso", a case version as "versão" and its manifest as "manifesto", using no English domain noun', () => {
  const error = new HypothesisNotInManifestError('vega-3', 7, 'cold-loop-theory');

  expect(error.message).toContain('hipótese');
  expect(error.message).toContain('caso');
  expect(error.message).toContain('versão');
  expect(error.message).toContain('manifesto');
  expect(error.message).not.toMatch(/\bhypothesis\b/i);
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bversion\b/i);
  expect(error.message).not.toMatch(/\bmanifest\b/i);
});

it('keeps its own class-name string unchanged', () => {
  const error = new HypothesisNotInManifestError('orion-9', 4, 'warm-start-effect');

  expect(error.name).toBe('HypothesisNotInManifestError');
});

it('carries exactly the hypothesis, slug and version in context, with no value moved into or out of it', () => {
  const error = new HypothesisNotInManifestError('orion-9', 4, 'warm-start-effect');

  expect(error.context).toEqual({ slug: 'orion-9', version: 4, hypothesis: 'warm-start-effect' });
});

it('is distinguishable from ManifestPositionOccupiedError by text alone, for the same case and version', () => {
  const notInManifest = new HypothesisNotInManifestError('orion-9', 4, 'warm-start-effect');
  const positionOccupied = new ManifestPositionOccupiedError('orion-9', 4, 2);

  expect(notInManifest.message).not.toBe(positionOccupied.message);
});

it('is distinguishable from ManifestWouldHoldNoHypothesisError by text alone, for the same case and version', () => {
  const notInManifest = new HypothesisNotInManifestError('orion-9', 4, 'warm-start-effect');
  const wouldHoldNone = new ManifestWouldHoldNoHypothesisError('orion-9', 4);

  expect(notInManifest.message).not.toBe(wouldHoldNone.message);
});

it('keeps ManifestPositionOccupiedError distinguishable from ManifestWouldHoldNoHypothesisError by text alone, for the same case and version', () => {
  const positionOccupied = new ManifestPositionOccupiedError('orion-9', 4, 2);
  const wouldHoldNone = new ManifestWouldHoldNoHypothesisError('orion-9', 4);

  expect(positionOccupied.message).not.toBe(wouldHoldNone.message);
});

it('names the case and the version in the same order and with the same PT-br wording across all three manifest-composition refusals', () => {
  const notInManifest = new HypothesisNotInManifestError('orion-9', 4, 'warm-start-effect');
  const positionOccupied = new ManifestPositionOccupiedError('orion-9', 4, 2);
  const wouldHoldNone = new ManifestWouldHoldNoHypothesisError('orion-9', 4);

  const sharedCaseVersionPhrase = 'caso "orion-9" versão 4';
  expect(notInManifest.message).toContain(sharedCaseVersionPhrase);
  expect(positionOccupied.message).toContain(sharedCaseVersionPhrase);
  expect(wouldHoldNone.message).toContain(sharedCaseVersionPhrase);
});
