// Proof for the case's three operations (task/case-model/case-resolution):
// collection-plan, requires-evaluation-of and resolve-outcome as pure
// behavior over the already-valid aggregate, realized over the
// specification's worked example — this tree's pinned case for the two
// knowledge scenarios: the first confirmed hypothesis in the declared
// order determines the outcome while a later confirmation stays unmarked
// (scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome),
// and no confirmation falls back with no determining hypothesis named
// (scenarios/knowledge/no-confirmation-falls-back). Verdicts arrive as
// plain per-name values; what a non-total verdict set answers when nothing
// confirms is deliberately unpinned here — the successor initiative's seam
// — and the one thing these tests hold about an unanswered name is that it
// never determines. Criterion 8's import audit is the sibling
// case-document-modules.spec.ts, which reads every module under src/case
// from disk and so already sweeps case-resolution.ts; it is reused rather
// than duplicated.
//
// Fix folded in by task/case-and-investigation-model/precedence-from-position
// (this file's own task, task/case-model/case-resolution, is closed and has
// no re-delivery route): the test that used to pin "reversing the
// declaration flips which confirmed hypothesis determines" stated the
// pre-position behavior this task's own criterion 1 explicitly supersedes.
// Its fixture already kept each hypothesis's own declared position fixed by
// name while only varying which array slot it sat in — a meaningful
// invariant survives under position-based precedence, the opposite of the
// one it used to state — so it was adjusted in place, kept at the same test
// name's spot, to assert that instead: reversing the array changes nothing.
// New tests proving this task's other criteria sit beside the existing ones,
// in the same file, per TST-04.
//
// Fixture rework, task/case-lifecycle-domain-model/aggregate-types-and-structural-validation:
// case-resolution.ts now reads theCase.manifest exclusively — never
// theCase.hypotheses, the flat projection this aggregate's own out-of-scope
// consumers read (case.ts's own header comment) — so every fixture below now
// builds ManifestEntry values (position plus one nested hypothesis_revision:
// hypothesis identity, revision, criterion, collects, resolution) rather than
// flat Hypothesis values carrying their own position directly. Every
// existing behavioral assertion this file already proved — precedence order,
// the first-confirmed search, the fallback, the array-arrangement
// independence — is kept exactly as it was; only the fixture shape moved.
import { expect, it } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { Verdicts } from '../../../case/case-resolution.js';
import {
  collectionPlan,
  requiresEvaluationOf,
  resolveOutcome,
} from '../../../case/case-resolution.js';

/**
 * The worked example's declared precedence — deliberately not the
 * alphabetical order of the names, so a resolver that sorts its manifest
 * fails here rather than passing by accident.
 */
const DECLARED_PRECEDENCE = [
  'incidente-regional',
  'ordem-em-andamento',
  'bloqueio-financeiro',
  'onu-offline',
];

/** The prose a hypothesis-revision carries and none of the three operations ever consults. */
const UNCONSULTED_CRITERION = 'prose the resolution operations never read';

/** The worked example's fallback: what answers when no hypothesis confirms. */
const FALLBACK: Resolution = {
  outcome: 'inconclusivo',
  referral: { action: 'escalar', recipient: 'suporte-n2' },
};

/** One resolution as the aggregate holds it: an outcome paired with its referral. */
function resolutionOf(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

/**
 * Every hypothesis this file names keeps one fixed declared position across
 * every test, matching its own index in the worked example's declared
 * precedence — reused rather than derived from whatever array a given test
 * happens to place its manifest entry in, since several tests below (the
 * reversed-order pair, most pointedly) deliberately vary the array position
 * of an already-built manifest entry while its own declared position stays
 * put.
 */
const DECLARED_POSITIONS: Readonly<Record<string, number>> = {
  'incidente-regional': 1,
  'ordem-em-andamento': 2,
  'bloqueio-financeiro': 3,
  'onu-offline': 4,
};

/** One manifest entry carrying exactly what these operations consult: its hypothesis's name, collects, resolution — plus its own declared position, looked up by name. */
function manifestEntryOf(name: string, collects: readonly string[], resolution: Resolution): ManifestEntry {
  const position = DECLARED_POSITIONS[name];
  if (position === undefined) {
    throw new Error(`no declared position fixture for hypothesis name ${JSON.stringify(name)}`);
  }
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name },
      revision: 1,
      criterion: UNCONSULTED_CRITERION,
      collects,
      resolution,
    },
  };
}

/** A manifest entry for the plan tests, whose resolution no plan test consults. */
function collectingEntry(name: string, collects: readonly string[]): ManifestEntry {
  return manifestEntryOf(name, collects, resolutionOf(name, 'informar-prazo', 'atendimento'));
}

/**
 * The worked example's four manifest entries in their declared precedence,
 * each resolving distinctly so a test can tell which one answered.
 */
function workedManifest(): readonly ManifestEntry[] {
  return [
    manifestEntryOf(
      'incidente-regional',
      ['incidentes-na-regiao'],
      resolutionOf('incidente-regional', 'informar-prazo', 'atendimento'),
    ),
    manifestEntryOf(
      'ordem-em-andamento',
      ['ordens-em-andamento'],
      resolutionOf('intervencao-tecnica-em-curso', 'informar-ordem', 'atendimento'),
    ),
    manifestEntryOf(
      'bloqueio-financeiro',
      ['situacao-financeira'],
      resolutionOf('bloqueio-financeiro', 'orientar-pagamento', 'atendimento'),
    ),
    manifestEntryOf(
      'onu-offline',
      ['estado-do-equipamento'],
      resolutionOf('onu-offline', 'abrir-ordem-corretiva', 'suporte-n2'),
    ),
  ];
}

/**
 * The worked example's four manifest entries again, with every array slot
 * deliberately not matching its own declared position — proving
 * task/case-and-investigation-model/precedence-from-position's own claim
 * that resolve-outcome and collection-plan read position and never array
 * arrangement.
 */
function scrambledWorkedManifest(): readonly ManifestEntry[] {
  return [
    manifestEntryOf(
      'onu-offline',
      ['estado-do-equipamento'],
      resolutionOf('onu-offline', 'abrir-ordem-corretiva', 'suporte-n2'),
    ),
    manifestEntryOf(
      'bloqueio-financeiro',
      ['situacao-financeira'],
      resolutionOf('bloqueio-financeiro', 'orientar-pagamento', 'atendimento'),
    ),
    manifestEntryOf(
      'ordem-em-andamento',
      ['ordens-em-andamento'],
      resolutionOf('intervencao-tecnica-em-curso', 'informar-ordem', 'atendimento'),
    ),
    manifestEntryOf(
      'incidente-regional',
      ['incidentes-na-regiao'],
      resolutionOf('incidente-regional', 'informar-prazo', 'atendimento'),
    ),
  ];
}

/** The worked example's own verdicts: regional-incident and onu-offline confirmed, the other two refuted. */
function regionalAndOnuOfflineConfirmedVerdicts(): Verdicts {
  return {
    'incidente-regional': 'confirmed',
    'ordem-em-andamento': 'refuted',
    'bloqueio-financeiro': 'refuted',
    'onu-offline': 'confirmed',
  };
}

/** A valid aggregate around the given manifest — the shape the parser has already admitted, its own flat .hypotheses projection derived the same way parse-case-document.ts's own heldCase derives it, never independently declared. */
function caseWith(manifest: readonly ManifestEntry[]): Case {
  return {
    slug: 'cliente-sem-internet',
    title: 'Cliente sem internet',
    when_to_use: 'cliente relata ausência total de conexão',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'contrato',
    fallback: FALLBACK,
    state: 'released',
    manifest,
    hypotheses: manifest.map((entry) => ({
      name: entry.hypothesis_revision.hypothesis.name,
      criterion: entry.hypothesis_revision.criterion,
      collects: entry.hypothesis_revision.collects,
      resolution: entry.hypothesis_revision.resolution,
    })),
  };
}

/** The worked example whole: the pinned case both scenarios resolve over. */
function workedCase(): Case {
  return caseWith(workedManifest());
}

// ---------------------------------------------------------------- the collection plan

it("answers the deduplicated union of every hypothesis's collects, each concept once", () => {
  const overlapping = caseWith([
    collectingEntry('incidente-regional', ['incidentes-na-regiao']),
    collectingEntry('ordem-em-andamento', ['ordens-em-andamento', 'incidentes-na-regiao']),
    collectingEntry('bloqueio-financeiro', ['situacao-financeira', 'ordens-em-andamento']),
  ]);

  const plan = collectionPlan(overlapping);

  expect(plan).toEqual(['incidentes-na-regiao', 'ordens-em-andamento', 'situacao-financeira']);
});

it('lists each concept where the declared order first names it', () => {
  // The first entry's own collects are deliberately not alphabetical, so a
  // sorted plan and a last-appearance plan both fail here.
  const overlapping = caseWith([
    collectingEntry('ordem-em-andamento', ['ordens-em-andamento', 'incidentes-na-regiao']),
    collectingEntry('bloqueio-financeiro', ['incidentes-na-regiao', 'situacao-financeira']),
  ]);

  const plan = collectionPlan(overlapping);

  expect(plan).toEqual(['ordens-em-andamento', 'incidentes-na-regiao', 'situacao-financeira']);
});

it("orders and dedupes the collection plan by each manifest entry's own declared position, never by the array's own arrangement", () => {
  // Declared positions: incidente-regional 1, ordem-em-andamento 2,
  // bloqueio-financeiro 3 — the array below places them in a different
  // order (3, 1, 2), and bloqueio-financeiro repeats incidente-regional's
  // own concept, so an array-order reader answers a different sequence
  // than a position reader does.
  const scrambled = caseWith([
    collectingEntry('bloqueio-financeiro', ['situacao-financeira', 'incidentes-na-regiao']),
    collectingEntry('incidente-regional', ['incidentes-na-regiao']),
    collectingEntry('ordem-em-andamento', ['ordens-em-andamento']),
  ]);

  const plan = collectionPlan(scrambled);

  expect(plan).toEqual(['incidentes-na-regiao', 'ordens-em-andamento', 'situacao-financeira']);
});

// ---------------------------------------------------------------- requires-evaluation-of

it('demands one evaluation per declared hypothesis, named and ordered as the case declares them', () => {
  const theCase = workedCase();

  const demanded = requiresEvaluationOf(theCase);

  expect(demanded).toEqual(DECLARED_PRECEDENCE);
});

// ------------------------------------- resolve-outcome: the first confirmed hypothesis determines

it('answers the first confirmed hypothesis in declared order with its outcome, its referral and its determining role', () => {
  // The scenario's judgment: the first and the last declared hypotheses
  // confirmed, the two between them refuted.
  const verdicts: Verdicts = {
    'incidente-regional': 'confirmed',
    'ordem-em-andamento': 'refuted',
    'bloqueio-financeiro': 'refuted',
    'onu-offline': 'confirmed',
  };

  const resolved = resolveOutcome(workedCase(), verdicts);

  expect(resolved).toEqual({
    outcome: 'incidente-regional',
    referral: { action: 'informar-prazo', recipient: 'atendimento' },
    determining: 'incidente-regional',
  });
});

it('leaves a hypothesis confirmed after the determining one holding its confirmed verdict, unmarked', () => {
  const verdicts: Verdicts = {
    'incidente-regional': 'confirmed',
    'ordem-em-andamento': 'refuted',
    'bloqueio-financeiro': 'refuted',
    'onu-offline': 'confirmed',
  };

  const resolved = resolveOutcome(workedCase(), verdicts);

  expect(verdicts).toEqual({
    'incidente-regional': 'confirmed',
    'ordem-em-andamento': 'refuted',
    'bloqueio-financeiro': 'refuted',
    'onu-offline': 'confirmed',
  });
  expect(resolved.determining).toBe('incidente-regional');
});

it("follows each hypothesis's own declared position alone, so reversing the array arrangement changes nothing about which confirmed hypothesis determines", () => {
  // Fix, task/case-and-investigation-model/precedence-from-position: this
  // test used to pin the opposite fact — that reversing the array flipped
  // the answer — which that task's own criterion 1 explicitly supersedes.
  // incidente-regional's own declared position (1) precedes onu-offline's
  // (4) regardless of which array slot either entry sits in, so reversing
  // their arrangement must not flip the answer any more.
  const regional = manifestEntryOf(
    'incidente-regional',
    ['incidentes-na-regiao'],
    resolutionOf('incidente-regional', 'informar-prazo', 'atendimento'),
  );
  const onu = manifestEntryOf(
    'onu-offline',
    ['estado-do-equipamento'],
    resolutionOf('onu-offline', 'abrir-ordem-corretiva', 'suporte-n2'),
  );
  const bothConfirmed: Verdicts = { 'onu-offline': 'confirmed', 'incidente-regional': 'confirmed' };

  const regionalDeclaredFirstInArray = resolveOutcome(caseWith([regional, onu]), bothConfirmed);
  const onuDeclaredFirstInArray = resolveOutcome(caseWith([onu, regional]), bothConfirmed);

  expect(regionalDeclaredFirstInArray.determining).toBe('incidente-regional');
  expect(onuDeclaredFirstInArray.determining).toBe('incidente-regional');
});

it('answers with the earlier-position hypothesis of two confirmed ones that are neither the first nor the last declared position', () => {
  // ordem-em-andamento (position 2) and bloqueio-financeiro (position 3)
  // are both confirmed; the outer two are refuted, so this isolates the
  // precedence comparison to a pair that sits in the middle of the range,
  // over the array whose own arrangement matches none of the positions.
  const theCase = caseWith(scrambledWorkedManifest());
  const verdicts: Verdicts = {
    'incidente-regional': 'refuted',
    'ordem-em-andamento': 'confirmed',
    'bloqueio-financeiro': 'confirmed',
    'onu-offline': 'refuted',
  };

  const resolved = resolveOutcome(theCase, verdicts);

  expect(resolved.determining).toBe('ordem-em-andamento');
});

it("answers with regional-incident's own outcome, referral and determining role over the scenario's declared precedence even when the manifest array does not arrange them that way", () => {
  const theCase = caseWith(scrambledWorkedManifest());
  const verdicts = regionalAndOnuOfflineConfirmedVerdicts();

  const resolved = resolveOutcome(theCase, verdicts);

  expect(resolved).toEqual({
    outcome: 'incidente-regional',
    referral: { action: 'informar-prazo', recipient: 'atendimento' },
    determining: 'incidente-regional',
  });
});

it('never lets a confirmed verdict under a name the case does not declare determine anything', () => {
  const verdicts: Verdicts = {
    'hipotese-que-o-caso-nao-declara': 'confirmed',
    'incidente-regional': 'refuted',
    'ordem-em-andamento': 'refuted',
    'bloqueio-financeiro': 'confirmed',
    'onu-offline': 'refuted',
  };

  const resolved = resolveOutcome(workedCase(), verdicts);

  expect(resolved).toEqual({
    outcome: 'bloqueio-financeiro',
    referral: { action: 'orientar-pagamento', recipient: 'atendimento' },
    determining: 'bloqueio-financeiro',
  });
});

it('lets an unanswered hypothesis determine nothing, so a later explicit confirmation answers', () => {
  // Deliberately confirms one hypothesis: what a non-total verdict set
  // answers when nothing confirms is the successor initiative's to define,
  // and no test here pins it.
  const onlyOneAnswered: Verdicts = { 'bloqueio-financeiro': 'confirmed' };

  const resolved = resolveOutcome(workedCase(), onlyOneAnswered);

  expect(resolved).toEqual({
    outcome: 'bloqueio-financeiro',
    referral: { action: 'orientar-pagamento', recipient: 'atendimento' },
    determining: 'bloqueio-financeiro',
  });
});

// ---------------------------------------------- resolve-outcome: no confirmation falls back

it("answers the fallback's outcome and referral when every hypothesis is refuted or inconclusive", () => {
  const noneConfirmed: Verdicts = {
    'incidente-regional': 'refuted',
    'ordem-em-andamento': 'inconclusive',
    'bloqueio-financeiro': 'refuted',
    'onu-offline': 'inconclusive',
  };

  const resolved = resolveOutcome(workedCase(), noneConfirmed);

  expect(resolved).toEqual({
    outcome: 'inconclusivo',
    referral: { action: 'escalar', recipient: 'suporte-n2' },
  });
});

it('names no determining hypothesis when the fallback answers', () => {
  // The property is absent, not null and not a key holding undefined —
  // toHaveProperty sees a key however it is valued, so this pins absence.
  const noneConfirmed: Verdicts = {
    'incidente-regional': 'refuted',
    'ordem-em-andamento': 'inconclusive',
    'bloqueio-financeiro': 'refuted',
    'onu-offline': 'inconclusive',
  };

  const resolved = resolveOutcome(workedCase(), noneConfirmed);

  expect(resolved).not.toHaveProperty('determining');
});

