import { expect, it } from 'vitest';
import { HypothesisRevisionNotDraftAtReleaseError } from '../../../errors/hypothesis-revision-not-draft-at-release.error.js';
import { ReleasedHypothesisRevisionNotAlterableError } from '../../../errors/released-hypothesis-revision-not-alterable.error.js';

it(
  'states in Brazilian Portuguese that the revision is itself in released state and is never altered, ' +
    'naming the hypothesis, the revision number and the case slug',
  () => {
    const error = new ReleasedHypothesisRevisionNotAlterableError('a-slug', 'a-hypothesis', 3);

    expect(error.message).toBe(
      'a revisão 3 da hipótese "a-hypothesis" do caso "a-slug" está ela mesma em estado liberada, e uma revisão liberada nunca é alterada',
    );
  },
);

it('never attributes the immutability to a case version that references the revision, naming no "versão" at all', () => {
  const error = new ReleasedHypothesisRevisionNotAlterableError('a-slug', 'a-hypothesis', 3);

  expect(error.message).not.toMatch(/vers[ãa]o/i);
});

it(
  "names the case, the hypothesis and the revision with their fixed Portuguese words, and the revision's " +
    'state as liberada, using no English domain noun',
  () => {
    const error = new ReleasedHypothesisRevisionNotAlterableError('another-slug', 'outra-hipotese', 5);

    expect(error.message).toMatch(/\bcaso\b/);
    expect(error.message).toMatch(/\bhipótese\b/);
    expect(error.message).toMatch(/\brevisão\b/);
    expect(error.message).toMatch(/\bliberada\b/);
    expect(error.message).not.toMatch(/\bcase\b/i);
    expect(error.message).not.toMatch(/\bhypothesis\b/i);
    expect(error.message).not.toMatch(/\brevision\b/i);
    expect(error.message).not.toMatch(/\breleased\b/i);
  },
);

it('is distinguishable from HypothesisRevisionNotDraftAtReleaseError by text alone', () => {
  const alterable = new ReleasedHypothesisRevisionNotAlterableError('a-slug', 'a-hypothesis', 3);
  const notDraft = new HypothesisRevisionNotDraftAtReleaseError();

  expect(alterable.message).not.toBe(notDraft.message);
});

it('keeps its own class-name string unchanged', () => {
  const error = new ReleasedHypothesisRevisionNotAlterableError('a-slug', 'a-hypothesis', 3);

  expect(error.name).toBe('ReleasedHypothesisRevisionNotAlterableError');
});

it('carries exactly the slug, hypothesis name and revision it was constructed with in context, with no value moved into or out of it', () => {
  const error = new ReleasedHypothesisRevisionNotAlterableError('a-slug', 'a-hypothesis', 3);

  expect(error.context).toEqual({ slug: 'a-slug', hypothesis_name: 'a-hypothesis', revision: 3 });
});
