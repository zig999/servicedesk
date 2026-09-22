import { expect, it } from 'vitest';
import { ManifestWouldHoldNoHypothesisError } from '../../../errors/manifest-would-hold-no-hypothesis.error.js';

it('states its message in Brazilian Portuguese, naming the case slug and the version number, and stating that removing the entry would leave the manifest holding no hypothesis and that a manifest declares at least one entry', () => {
  const error = new ManifestWouldHoldNoHypothesisError('orion-9', 4);

  expect(error.message).toBe(
    'remover esta entrada deixaria o manifesto do caso "orion-9" versão 4 sem nenhuma hipótese, e o manifesto de uma versão do caso declara ao menos uma entrada',
  );
});

it('names a case as "caso", a case version as "versão", a hypothesis as "hipótese" and its manifest as "manifesto", using no English domain noun', () => {
  const error = new ManifestWouldHoldNoHypothesisError('vega-3', 7);

  expect(error.message).toContain('caso');
  expect(error.message).toContain('versão');
  expect(error.message).toContain('hipótese');
  expect(error.message).toContain('manifesto');
  expect(error.message).not.toMatch(/\bcase\b/i);
  expect(error.message).not.toMatch(/\bversion\b/i);
  expect(error.message).not.toMatch(/\bhypothesis\b/i);
  expect(error.message).not.toMatch(/\bmanifest\b/i);
});

it('keeps its own class-name string unchanged', () => {
  const error = new ManifestWouldHoldNoHypothesisError('orion-9', 4);

  expect(error.name).toBe('ManifestWouldHoldNoHypothesisError');
});

it('carries exactly the slug and version in context, with no value moved into or out of it', () => {
  const error = new ManifestWouldHoldNoHypothesisError('orion-9', 4);

  expect(error.context).toEqual({ slug: 'orion-9', version: 4 });
});
