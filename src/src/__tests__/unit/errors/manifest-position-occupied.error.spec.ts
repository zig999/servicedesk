import { expect, it } from 'vitest';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';

it('states its message in Brazilian Portuguese, naming the case slug, the version number and the occupied position, and stating that a manifest position is unique within its case version', () => {
  const error = new ManifestPositionOccupiedError('orion-9', 4, 2);

  expect(error.message).toBe(
    'o caso "orion-9" versão 4 já tem uma hipótese na posição 2, e uma posição do manifesto é única dentro da sua versão do caso',
  );
});

it('names a case as "caso", a case version as "versão", a hypothesis as "hipótese", a manifest as "manifesto" and a manifest position as "posição", using no English domain noun', () => {
  const error = new ManifestPositionOccupiedError('vega-3', 7, 5);

  expect(error.message).toContain('caso');
  expect(error.message).toContain('versão');
  expect(error.message).toContain('hipótese');
  expect(error.message).toContain('manifesto');
  expect(error.message).toContain('posição');
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bversion\b/i);
  expect(error.message).not.toMatch(/\bhypothesis\b/i);
  expect(error.message).not.toMatch(/\bmanifest\b/i);
  expect(error.message).not.toMatch(/\bposition\b/i);
});

it('keeps its own class-name string unchanged', () => {
  const error = new ManifestPositionOccupiedError('orion-9', 4, 2);

  expect(error.name).toBe('ManifestPositionOccupiedError');
});

it('carries exactly the slug, version and position in context, with no value moved into or out of it', () => {
  const error = new ManifestPositionOccupiedError('orion-9', 4, 2);

  expect(error.context).toEqual({ slug: 'orion-9', version: 4, position: 2 });
});
