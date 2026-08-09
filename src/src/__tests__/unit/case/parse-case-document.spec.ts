// Proof for the case document model: the specification's worked example
// (cliente-sem-internet) parses whole — hypotheses, resolutions and
// referrals read from the one document, in the document's declared order —
// and a document violating any structural rule is refused once, with every
// violation named. The fixture is spelled here rather than read from the
// source, so a drift in what the parser accepts fails against what the
// specification shows.
import { expect, it } from 'vitest';
import { parseCaseDocument } from '../../../case/parse-case-document.js';
import { InvalidCaseDocumentError } from '../../../errors/invalid-case-document.error.js';

/** One case document as parsed JSON: the shape the parser receives. */
type Document = Record<string, unknown>;

/** The name of the file the worked example sits in, stated with the ending the medium carries. */
const FILE_NAME = 'cliente-sem-internet.json';

/**
 * The worked example's declared precedence — deliberately not the
 * alphabetical order of the names, so a model that sorts its hypotheses or
 * keys them by name fails here rather than passing by accident.
 */
const DECLARED_PRECEDENCE = [
  'incidente-regional',
  'ordem-em-andamento',
  'bloqueio-financeiro',
  'onu-offline',
];

/** One resolution as a document declares it: an outcome paired with a referral. */
function resolutionOf(outcome: string, action: string, recipient: string): Document {
  return { outcome, referral: { action, recipient } };
}

/** The worked example's four hypotheses, in their declared precedence. */
function workedHypotheses(): Document[] {
  return [
    {
      name: 'incidente-regional',
      criterion: 'há incidente aberto cobrindo a localidade do cliente',
      collects: ['incidentes-na-regiao'],
      resolution: resolutionOf('incidente-regional', 'informar-prazo', 'atendimento'),
    },
    {
      name: 'ordem-em-andamento',
      criterion: 'existe ordem de serviço em execução no cliente',
      collects: ['ordens-em-andamento'],
      resolution: resolutionOf('intervencao-tecnica-em-curso', 'informar-ordem', 'atendimento'),
    },
    {
      name: 'bloqueio-financeiro',
      criterion: 'o acesso está bloqueado por inadimplência',
      collects: ['situacao-financeira'],
      resolution: resolutionOf('bloqueio-financeiro', 'orientar-pagamento', 'atendimento'),
    },
    {
      name: 'onu-offline',
      criterion: 'o equipamento do cliente não responde',
      collects: ['estado-do-equipamento'],
      resolution: resolutionOf('onu-offline', 'abrir-ordem-corretiva', 'suporte-n2'),
    },
  ];
}

/** A document declaring every attribute, for tests to depart from one attribute at a time. */
function completeDocument(overrides: Document = {}): Document {
  return {
    slug: 'cliente-sem-internet',
    title: 'Cliente sem internet',
    when_to_use: 'cliente relata ausência total de conexão',
    version: 1,
    hash: '1f2e3d4c5b6a',
    subject: 'contrato',
    fallback: resolutionOf('inconclusivo', 'escalar', 'suporte-n2'),
    hypotheses: workedHypotheses(),
    ...overrides,
  };
}

/** A complete hypothesis, for tests to depart from one attribute at a time. */
function completeHypothesis(overrides: Document = {}): Document {
  return {
    name: 'incidente-regional',
    criterion: 'há incidente aberto cobrindo a localidade do cliente',
    collects: ['incidentes-na-regiao'],
    resolution: resolutionOf('incidente-regional', 'informar-prazo', 'atendimento'),
    ...overrides,
  };
}

/** The complete document with its hypotheses replaced by one departing hypothesis. */
function documentWithHypothesis(overrides: Document): Document {
  return completeDocument({ hypotheses: [completeHypothesis(overrides)] });
}

/** Every violation one document is refused with; fails the test where the document parses instead. */
function problemsOf(document: unknown, fileName: string = FILE_NAME): readonly string[] {
  let refusal: unknown;
  try {
    parseCaseDocument(document, fileName);
  } catch (error) {
    refusal = error;
  }
  if (!(refusal instanceof InvalidCaseDocumentError)) {
    throw new Error('expected the invalid-case-document refusal and the document parsed instead');
  }
  return refusal.context.problems;
}

// ---------------------------------------------------------------- what parses

it('parses a document declaring every attribute into the one case aggregate', () => {
  const document = completeDocument();

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed).toEqual(completeDocument());
});

it('reads hypotheses, resolutions and referrals from the one document alone', () => {
  const document = completeDocument();

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.fallback).toEqual(resolutionOf('inconclusivo', 'escalar', 'suporte-n2'));
  expect(parsed.hypotheses[3]?.resolution).toEqual(
    resolutionOf('onu-offline', 'abrir-ordem-corretiva', 'suporte-n2'),
  );
});

it('holds the hypotheses in the declared order of the document, never sorted and never keyed by name', () => {
  const document = completeDocument();

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.hypotheses.map((hypothesis) => hypothesis.name)).toEqual(DECLARED_PRECEDENCE);
});

it('parses a case declaring exactly one hypothesis', () => {
  const document = completeDocument({ hypotheses: [completeHypothesis()] });

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.hypotheses).toHaveLength(1);
});

it('reads the file name stated without its ending as the same name the slug is held to', () => {
  const document = completeDocument();

  const parsed = parseCaseDocument(document, 'cliente-sem-internet');

  expect(parsed.slug).toBe('cliente-sem-internet');
});

it('carries nothing into the aggregate that the model does not declare', () => {
  const document = completeDocument({ curador: 'prosa que pertence ao corpo, não ao modelo' });

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed).not.toHaveProperty('curador');
});

// ---------------------------------------------------------------- the enumerated refusals

it('refuses a case whose slug differs from the name of the file that holds it', () => {
  const document = completeDocument();

  const problems = problemsOf(document, 'outro-case.json');

  expect(problems).toEqual([expect.stringContaining('does not equal the name "outro-case"')]);
});

it('refuses a case that declares no hypotheses attribute', () => {
  const document = completeDocument({ hypotheses: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('declares no hypothesis')]);
});

it('refuses a case declaring an empty list of hypotheses', () => {
  const document = completeDocument({ hypotheses: [] });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('declares no hypothesis')]);
});

it('refuses a case whose two hypotheses share a name', () => {
  const document = completeDocument({
    hypotheses: [
      completeHypothesis(),
      completeHypothesis({ criterion: 'existe ordem de serviço em execução no cliente' }),
    ],
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('share the name "incidente-regional"')]);
});

it('refuses a hypothesis that declares no collects', () => {
  const document = documentWithHypothesis({ collects: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('collects no concept')]);
});

it('refuses a hypothesis collecting no concept', () => {
  const document = documentWithHypothesis({ collects: [] });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('collects no concept')]);
});

it('refuses a hypothesis whose collects holds an entry naming no concept', () => {
  const document = documentWithHypothesis({ collects: [''] });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('names no concept')]);
});

it('refuses a hypothesis carrying an empty criterion', () => {
  const document = documentWithHypothesis({ criterion: '' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('criterion is empty')]);
});

it('refuses a hypothesis whose resolution misses its outcome', () => {
  const document = documentWithHypothesis({
    resolution: { referral: { action: 'informar-prazo', recipient: 'atendimento' } },
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('outcome is undeclared')]);
});

it('refuses a hypothesis whose resolution misses its referral', () => {
  const document = documentWithHypothesis({ resolution: { outcome: 'incidente-regional' } });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('referral is undeclared')]);
});

it('refuses a hypothesis declaring no resolution at all', () => {
  const document = documentWithHypothesis({ resolution: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('resolution is undeclared')]);
});

it('refuses a fallback missing its outcome', () => {
  const document = completeDocument({
    fallback: { referral: { action: 'escalar', recipient: 'suporte-n2' } },
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("the fallback's outcome is undeclared")]);
});

it('refuses a fallback missing its referral', () => {
  const document = completeDocument({ fallback: { outcome: 'inconclusivo' } });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("the fallback's referral is undeclared")]);
});

// ------------------------------------------------- the required attributes beyond the enumeration

it.each(['slug', 'title', 'when_to_use', 'hash', 'subject'])(
  'refuses a document that leaves %s undeclared',
  (attribute) => {
    const document = completeDocument({ [attribute]: undefined });

    const problems = problemsOf(document);

    expect(problems).toEqual([expect.stringContaining(`${attribute} is undeclared`)]);
  },
);

it('refuses a document that leaves version undeclared', () => {
  const document = completeDocument({ version: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('version is undeclared')]);
});

it('refuses a version that is not an integer instead of coercing it', () => {
  const document = completeDocument({ version: '1' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('version is not an integer')]);
});

it('refuses a document that leaves the fallback undeclared', () => {
  const document = completeDocument({ fallback: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('the fallback is undeclared')]);
});

it('refuses a nameless hypothesis', () => {
  const document = documentWithHypothesis({ name: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('name is undeclared')]);
});

it('refuses a referral missing its action', () => {
  const document = documentWithHypothesis({
    resolution: { outcome: 'incidente-regional', referral: { recipient: 'atendimento' } },
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('action is undeclared')]);
});

it('refuses a referral missing its recipient', () => {
  const document = documentWithHypothesis({
    resolution: { outcome: 'incidente-regional', referral: { action: 'informar-prazo' } },
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('recipient is undeclared')]);
});

it('refuses an empty slug once, not also as a mismatch against the file name', () => {
  const document = completeDocument({ slug: '' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('slug is empty')]);
});

// ---------------------------------------------------------------- documents with no shape at all

it('refuses a document that is not one JSON object', () => {
  const problems = problemsOf(null);

  expect(problems).toEqual([expect.stringContaining('not one JSON object')]);
});

it('refuses a document that is a JSON array', () => {
  const problems = problemsOf([completeDocument()]);

  expect(problems).toEqual([expect.stringContaining('not one JSON object')]);
});

// ---------------------------------------------------------------- several violations, one refusal

it('refuses a document violating several structural rules once, naming every violation', () => {
  const document = completeDocument({
    title: undefined,
    fallback: { referral: { action: 'escalar', recipient: 'suporte-n2' } },
    hypotheses: [completeHypothesis({ criterion: '' }), completeHypothesis({ collects: [] })],
  });

  const problems = problemsOf(document, 'outro-case.json');

  expect(problems).toHaveLength(6);
  expect(problems).toEqual(
    expect.arrayContaining([
      expect.stringContaining('does not equal the name "outro-case"'),
      expect.stringContaining('title is undeclared'),
      expect.stringContaining("hypothesis 1's criterion is empty"),
      expect.stringContaining('hypothesis 2 collects no concept'),
      expect.stringContaining('share the name "incidente-regional"'),
      expect.stringContaining("the fallback's outcome is undeclared"),
    ]),
  );
});
