// Proof for task/case-lifecycle-domain-model/aggregate-types-and-structural-validation:
// the case document's own manifest-based structural validator — a hypothesis's
// stable identity (its name) and its revisioned content (revision, criterion,
// collects, resolution) declared as two distinct facts on the document, held
// together only by one manifest entry's own position plus its one nested
// adopted hypothesis-revision (never inlined) — and the three refusals this
// task's own criteria name: a manifest holding no entry at all (whether the
// version is draft or released), an adopted hypothesis-revision collecting no
// concept, and one declaring an empty criterion. The specification's own
// worked example (cliente-sem-internet) parses whole — every manifest entry's
// own hypothesis-revision, resolution and referral read from the one document,
// in the document's declared order — and a document violating any structural
// rule is refused once, with every violation named. The fixture is spelled
// here rather than read from the source, so a drift in what the parser
// accepts fails against what the specification shows.
//
// The position-uniqueness and hypothesis-name-uniqueness checks this module
// kept over the old flat hypotheses array are preserved here over the
// manifest instead (this module's own `preserved` inference,
// sharedHypothesisProblems/sharedPositionProblems in parse-case-document.ts).
import { expect, it } from 'vitest';
import { parseCaseDocument } from '../../../case/parse-case-document.js';
import { InvalidCaseDocumentError } from '../../../errors/invalid-case-document.error.js';

/** One case document as parsed JSON: the shape the parser receives. */
type Document = Record<string, unknown>;

/** The name of the file the worked example sits in, stated with the ending the medium carries. */
const FILE_NAME = 'cliente-sem-internet.json';

/** One resolution as a document declares it: an outcome paired with a referral. */
function resolutionOf(outcome: string, action: string, recipient: string): Document {
  return { outcome, referral: { action, recipient } };
}

/**
 * One worked manifest entry's own fields, less position — pulled out into
 * its own function only so workedManifestEntrySpecs' own body stays inside
 * the standard's max-lines-per-function rule; the fields and behavior are
 * exactly what each of workedManifestEntrySpecs' own four object literals
 * declared before this split (this delivery's own inference — the
 * extraction changes nothing but where the lines are counted).
 */
function manifestEntrySpec(spec: {
  hypothesisName: string;
  criterion: string;
  collects: readonly string[];
  resolutionOutcome: string;
  resolutionAction: string;
  resolutionRecipient: string;
}): Document {
  return {
    hypothesis_name: spec.hypothesisName,
    revision: 1,
    criterion: spec.criterion,
    collects: spec.collects,
    resolution: resolutionOf(spec.resolutionOutcome, spec.resolutionAction, spec.resolutionRecipient),
  };
}

/**
 * The worked example's four manifest entries' own fields, less position —
 * workedManifest() below assigns each one's position from its own index
 * here, matching this declared order.
 */
function workedManifestEntrySpecs(): Document[] {
  return [
    manifestEntrySpec({ hypothesisName: 'incidente-regional', criterion: 'há incidente aberto cobrindo a localidade do cliente', collects: ['incidentes-na-regiao'], resolutionOutcome: 'incidente-regional', resolutionAction: 'informar-prazo', resolutionRecipient: 'atendimento' }),
    manifestEntrySpec({ hypothesisName: 'ordem-em-andamento', criterion: 'existe ordem de serviço em execução no cliente', collects: ['ordens-em-andamento'], resolutionOutcome: 'intervencao-tecnica-em-curso', resolutionAction: 'informar-ordem', resolutionRecipient: 'atendimento' }),
    manifestEntrySpec({ hypothesisName: 'bloqueio-financeiro', criterion: 'o acesso está bloqueado por inadimplência', collects: ['situacao-financeira'], resolutionOutcome: 'bloqueio-financeiro', resolutionAction: 'orientar-pagamento', resolutionRecipient: 'atendimento' }),
    manifestEntrySpec({ hypothesisName: 'onu-offline', criterion: 'o equipamento do cliente não responde', collects: ['estado-do-equipamento'], resolutionOutcome: 'onu-offline', resolutionAction: 'abrir-ordem-corretiva', resolutionRecipient: 'suporte-n2' }),
  ];
}

/** The worked example's four manifest entries, in their declared precedence, each at its own declared position matching that order. */
function workedManifest(): Document[] {
  return workedManifestEntrySpecs().map((spec, index) => ({ ...spec, position: index + 1 }));
}

/** A document declaring every attribute, for tests to depart from one attribute at a time. Declares no hash at all — the case aggregate no longer admits one. */
function completeDocument(overrides: Document = {}): Document {
  return {
    slug: 'cliente-sem-internet',
    title: 'Cliente sem internet',
    when_to_use: 'cliente relata ausência total de conexão',
    version: 1,
    authored_at: '2024-03-01T09:00:00.000Z',
    subject: 'contrato',
    fallback: resolutionOf('inconclusivo', 'escalar', 'suporte-n2'),
    state: 'released',
    manifest: workedManifest(),
    ...overrides,
  };
}

/** A complete manifest entry, for tests to depart from one attribute at a time. */
function completeManifestEntry(overrides: Document = {}): Document {
  return {
    position: 1,
    hypothesis_name: 'incidente-regional',
    revision: 1,
    criterion: 'há incidente aberto cobrindo a localidade do cliente',
    collects: ['incidentes-na-regiao'],
    resolution: resolutionOf('incidente-regional', 'informar-prazo', 'atendimento'),
    ...overrides,
  };
}

/** The complete document with its manifest replaced by one departing entry. */
function documentWithManifestEntry(overrides: Document): Document {
  return completeDocument({ manifest: [completeManifestEntry(overrides)] });
}

/** One manifest entry document spec reshaped into the aggregate's own nested ManifestEntry shape parseCaseDocument produces: position alongside one hypothesis_revision, never the revision's own content inlined. */
function expectedManifestEntry(spec: Document, position: number): Document {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: spec['hypothesis_name'] },
      revision: spec['revision'],
      criterion: spec['criterion'],
      collects: spec['collects'],
      resolution: spec['resolution'],
    },
  };
}

/** The worked example's manifest, reshaped as parseCaseDocument is expected to hold it. */
function expectedWorkedManifest(): Document[] {
  return workedManifestEntrySpecs().map((spec, index) => expectedManifestEntry(spec, index + 1));
}

/** One manifest entry spec flattened into the shape this aggregate's own out-of-scope consumers read off Case.hypotheses. */
function expectedHypothesis(spec: Document): Document {
  return {
    name: spec['hypothesis_name'],
    criterion: spec['criterion'],
    collects: spec['collects'],
    resolution: spec['resolution'],
  };
}

/** The whole parsed aggregate the worked example is expected to produce, for a test to depart from one attribute at a time. */
function expectedCase(overrides: Document = {}): Document {
  return {
    slug: 'cliente-sem-internet',
    title: 'Cliente sem internet',
    when_to_use: 'cliente relata ausência total de conexão',
    version: 1,
    authored_at: '2024-03-01T09:00:00.000Z',
    subject: 'contrato',
    fallback: resolutionOf('inconclusivo', 'escalar', 'suporte-n2'),
    state: 'released',
    manifest: expectedWorkedManifest(),
    hypotheses: workedManifestEntrySpecs().map(expectedHypothesis),
    ...overrides,
  };
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

it('parses a document declaring every attribute into the one case aggregate, splitting each manifest entry into its own position and nested hypothesis-revision', () => {
  const document = completeDocument();

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed).toEqual(expectedCase());
});

it('parses a case declaring exactly one manifest entry', () => {
  const document = completeDocument({ manifest: [completeManifestEntry()] });

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.manifest).toHaveLength(1);
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

it('carries the document\'s declared authored_at unchanged, as the case\'s own datetime', () => {
  const document = completeDocument({ authored_at: '2030-12-25T18:30:00.000Z' });

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.authored_at).toBe('2030-12-25T18:30:00.000Z');
});

// ---------------------------------------------------- domain/knowledge/case-version-state

it('parses a document declaring state draft, carrying no released_at at all', () => {
  const document = completeDocument({ state: 'draft' });

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.state).toBe('draft');
  expect('released_at' in parsed).toBe(false);
});

it('parses a document declaring state released together with released_at, carrying both unchanged', () => {
  const document = completeDocument({ state: 'released', released_at: '2024-03-02T10:00:00.000Z' });

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.state).toBe('released');
  expect(parsed.released_at).toBe('2024-03-02T10:00:00.000Z');
});

it('refuses a document that leaves state undeclared', () => {
  const document = completeDocument({ state: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual(['state is undeclared']);
});

it.each([
  ['an unrecognized word', 'published'],
  ['an empty string', ''],
  ['the wrong case', 'Draft'],
  ['a number', 1],
  ['null', null],
])('refuses a state declared as %s', (_label, value) => {
  const document = completeDocument({ state: value });

  const problems = problemsOf(document);

  expect(problems).toEqual(['state is not one of draft, released']);
});

it('refuses a released_at that is not a string, instead of coercing it', () => {
  const document = completeDocument({ released_at: 42 });

  const problems = problemsOf(document);

  expect(problems).toEqual(['released_at is not a string']);
});

it('refuses an empty released_at', () => {
  const document = completeDocument({ released_at: '' });

  const problems = problemsOf(document);

  expect(problems).toEqual(['released_at is empty']);
});

// ---------------------------------------- criterion: a case declaring no hypothesis is refused

it('refuses a released case whose manifest holds no entry, naming that the case declares no hypothesis', () => {
  const document = completeDocument({ state: 'released', manifest: [] });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('declares no hypothesis')]);
});

it('refuses a draft case whose manifest holds no entry, the same way a released one is refused', () => {
  const document = completeDocument({ state: 'draft', manifest: [] });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('declares no hypothesis')]);
});

it('refuses a case that declares no manifest attribute at all', () => {
  const document = completeDocument({ manifest: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('declares no hypothesis')]);
});

it('refuses a manifest that is not an array of manifest entries', () => {
  const document = completeDocument({ manifest: 'not-an-array' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('manifest is not an array of manifest entries')]);
});

// ------------------------------------------- criterion: a revision collecting no concept is refused

it('refuses a manifest entry whose adopted hypothesis-revision declares no collects at all', () => {
  const document = documentWithManifestEntry({ collects: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('collects no concept')]);
});

it('refuses a manifest entry whose adopted hypothesis-revision collects an empty list', () => {
  const document = documentWithManifestEntry({ collects: [] });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('collects no concept')]);
});

it('refuses a manifest entry whose collects is not an array of concept names', () => {
  const document = documentWithManifestEntry({ collects: 'not-an-array' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("collects is not an array of concept names")]);
});

it('refuses a manifest entry whose collects holds an entry naming no concept', () => {
  const document = documentWithManifestEntry({ collects: [''] });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('names no concept')]);
});

// ---------------------------------------------- criterion: a revision with an empty criterion is refused

it('refuses a manifest entry whose adopted hypothesis-revision carries an empty criterion', () => {
  const document = documentWithManifestEntry({ criterion: '' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("criterion is empty")]);
});

it('refuses a manifest entry that declares no criterion at all', () => {
  const document = documentWithManifestEntry({ criterion: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("criterion is undeclared")]);
});

// ------------------------------------------------------------- the resolution a revision adopts

it('refuses a manifest entry whose resolution misses its outcome', () => {
  const document = documentWithManifestEntry({
    resolution: { referral: { action: 'informar-prazo', recipient: 'atendimento' } },
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('outcome is undeclared')]);
});

it('refuses a manifest entry whose resolution misses its referral', () => {
  const document = documentWithManifestEntry({ resolution: { outcome: 'incidente-regional' } });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('referral is undeclared')]);
});

it('refuses a manifest entry declaring no resolution at all', () => {
  const document = documentWithManifestEntry({ resolution: undefined });

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

// ---------------------------------------------- the two uniqueness rules, preserved over the manifest

it('refuses a case whose two manifest entries share a hypothesis', () => {
  // Distinct positions (2 for the second), isolating this rule's own
  // violation from the position-uniqueness rule proved separately below.
  const document = completeDocument({
    manifest: [
      completeManifestEntry(),
      completeManifestEntry({
        position: 2,
        criterion: 'existe ordem de serviço em execução no cliente',
      }),
    ],
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('share the hypothesis "incidente-regional"')]);
});

it('refuses a case whose two manifest entries share a position, naming both', () => {
  // Distinct hypothesis names, isolating this rule's own violation from the
  // hypothesis-uniqueness rule proved separately above.
  const document = completeDocument({
    manifest: [
      completeManifestEntry(),
      completeManifestEntry({
        hypothesis_name: 'ordem-em-andamento',
        criterion: 'existe ordem de serviço em execução no cliente',
      }),
    ],
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('manifest entries 1, 2 share the position 1')]);
});

it(
  'refuses a case whose manifest entries violate both uniqueness rules at once, naming the shared ' +
    'hypothesis and the shared position together',
  () => {
    const document = completeDocument({
      manifest: [
        completeManifestEntry(),
        completeManifestEntry(), // shares both this fixture's default hypothesis and default position
      ],
    });

    const problems = problemsOf(document);

    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringContaining('share the hypothesis "incidente-regional"'),
        expect.stringContaining('manifest entries 1, 2 share the position 1'),
      ]),
    );
    expect(problems).toHaveLength(2);
  },
);

// ------------------------------------------------- the required attributes beyond the enumeration

it.each(['slug', 'title', 'when_to_use', 'authored_at', 'subject'])(
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

it('refuses a manifest entry that is not one JSON object', () => {
  const document = completeDocument({ manifest: [42] });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('manifest entry 1 is not one JSON object')]);
});

it('refuses a manifest entry that declares no hypothesis at all', () => {
  const document = documentWithManifestEntry({ hypothesis_name: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("manifest entry 1's hypothesis is undeclared")]);
});

it('refuses a manifest entry whose hypothesis name is empty', () => {
  const document = documentWithManifestEntry({ hypothesis_name: '' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("manifest entry 1's hypothesis is empty")]);
});

it('refuses a manifest entry that declares no position', () => {
  const document = documentWithManifestEntry({ position: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("manifest entry 1's position is undeclared")]);
});

it('refuses a manifest entry whose position is not an integer, instead of coercing it', () => {
  const document = documentWithManifestEntry({ position: '1' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("manifest entry 1's position is not an integer")]);
});

it('refuses a manifest entry that declares no revision', () => {
  const document = documentWithManifestEntry({ revision: undefined });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("manifest entry 1's revision is undeclared")]);
});

it('refuses a manifest entry whose revision is not an integer, instead of coercing it', () => {
  const document = documentWithManifestEntry({ revision: '1' });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining("manifest entry 1's revision is not an integer")]);
});

it('refuses a referral missing its action', () => {
  const document = documentWithManifestEntry({
    resolution: { outcome: 'incidente-regional', referral: { recipient: 'atendimento' } },
  });

  const problems = problemsOf(document);

  expect(problems).toEqual([expect.stringContaining('action is undeclared')]);
});

it('refuses a referral missing its recipient', () => {
  const document = documentWithManifestEntry({
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

it('refuses a case whose slug differs from the name of the file that holds it', () => {
  const document = completeDocument();

  const problems = problemsOf(document, 'outro-case.json');

  expect(problems).toEqual([expect.stringContaining('does not equal the name "outro-case"')]);
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

// ---------------------------------------------------------------- the optional consolidation register

it('parses a document declaring consolidation_register formal into a case carrying it', () => {
  const document = completeDocument({ consolidation_register: 'formal' });

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.consolidation_register).toBe('formal');
});

it('parses a document declaring consolidation_register plain into a case carrying it', () => {
  const document = completeDocument({ consolidation_register: 'plain' });

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect(parsed.consolidation_register).toBe('plain');
});

it('parses a document that omits consolidation_register without refusing it, and leaves the key off the returned case', () => {
  const document = completeDocument();

  const parsed = parseCaseDocument(document, FILE_NAME);

  expect('consolidation_register' in parsed).toBe(false);
});

it.each([
  ['an unrecognized word', 'strict'],
  ['an empty string', ''],
  ['the wrong case', 'Formal'],
  ['a number', 42],
  ['null', null],
])('refuses a consolidation_register declared as %s', (_label, value) => {
  const document = completeDocument({ consolidation_register: value });

  const problems = problemsOf(document);

  expect(problems).toEqual(['consolidation_register is not one of formal, plain']);
});

it('collects a consolidation_register violation together with another structural violation in one refusal, never throwing on the first found', () => {
  const document = completeDocument({ title: undefined, consolidation_register: 'strict' });

  const problems = problemsOf(document);

  expect(problems).toHaveLength(2);
  expect(problems).toEqual(
    expect.arrayContaining([
      expect.stringContaining('title is undeclared'),
      'consolidation_register is not one of formal, plain',
    ]),
  );
});

// ---------------------------------------------------------------- several violations, one refusal

it('refuses a document violating several structural rules once, naming every violation', () => {
  // Distinct positions (1 and 2), so the shared-hypothesis violation below is
  // the only manifest-level uniqueness problem this fixture carries.
  const document = completeDocument({
    title: undefined,
    fallback: { referral: { action: 'escalar', recipient: 'suporte-n2' } },
    manifest: [
      completeManifestEntry({ position: 1, criterion: '' }),
      completeManifestEntry({ position: 2, collects: [] }),
    ],
  });

  const problems = problemsOf(document, 'outro-case.json');

  expect(problems).toHaveLength(6);
  expect(problems).toEqual(
    expect.arrayContaining([
      expect.stringContaining('does not equal the name "outro-case"'),
      expect.stringContaining('title is undeclared'),
      expect.stringContaining("manifest entry 1's criterion is empty"),
      expect.stringContaining('manifest entry 2 collects no concept'),
      expect.stringContaining('share the hypothesis "incidente-regional"'),
      expect.stringContaining("the fallback's outcome is undeclared"),
    ]),
  );
});
