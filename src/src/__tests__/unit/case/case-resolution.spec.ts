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
import { expect, it } from 'vitest';
import type { Case, Hypothesis, Resolution } from '../../../case/case.js';
import type { Verdicts } from '../../../case/case-resolution.js';
import {
  collectionPlan,
  requiresEvaluationOf,
  resolveOutcome,
} from '../../../case/case-resolution.js';

/**
 * The worked example's declared precedence — deliberately not the
 * alphabetical order of the names, so a resolver that sorts its hypotheses
 * fails here rather than passing by accident.
 */
const DECLARED_PRECEDENCE = [
  'incidente-regional',
  'ordem-em-andamento',
  'bloqueio-financeiro',
  'onu-offline',
];

/** The prose a hypothesis carries and none of the three operations ever consults. */
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
 * happens to place it in, since several tests below (the reversed-order
 * pair, most pointedly) deliberately vary the array position of an
 * already-built hypothesis while its own declared position stays put. None
 * of the three operations under proof here reads it yet
 * (task/case-and-investigation-model/precedence-from-position moves
 * resolve-outcome onto it later), so its value is otherwise inert.
 */
const DECLARED_POSITIONS: Readonly<Record<string, number>> = {
  'incidente-regional': 1,
  'ordem-em-andamento': 2,
  'bloqueio-financeiro': 3,
  'onu-offline': 4,
};

/** One hypothesis carrying exactly what these operations consult: name, collects, resolution — plus its own declared position, looked up by name. */
function hypothesisOf(
  name: string,
  collects: readonly string[],
  resolution: Resolution,
): Hypothesis {
  const position = DECLARED_POSITIONS[name];
  if (position === undefined) {
    throw new Error(`no declared position fixture for hypothesis name ${JSON.stringify(name)}`);
  }
  return { name, position, criterion: UNCONSULTED_CRITERION, collects, resolution };
}

/** A hypothesis for the plan tests, whose resolution no plan test consults. */
function collectingHypothesis(name: string, collects: readonly string[]): Hypothesis {
  return hypothesisOf(name, collects, resolutionOf(name, 'informar-prazo', 'atendimento'));
}

/**
 * The worked example's four hypotheses in their declared precedence, each
 * resolving distinctly so a test can tell which one answered.
 */
function workedHypotheses(): readonly Hypothesis[] {
  return [
    hypothesisOf(
      'incidente-regional',
      ['incidentes-na-regiao'],
      resolutionOf('incidente-regional', 'informar-prazo', 'atendimento'),
    ),
    hypothesisOf(
      'ordem-em-andamento',
      ['ordens-em-andamento'],
      resolutionOf('intervencao-tecnica-em-curso', 'informar-ordem', 'atendimento'),
    ),
    hypothesisOf(
      'bloqueio-financeiro',
      ['situacao-financeira'],
      resolutionOf('bloqueio-financeiro', 'orientar-pagamento', 'atendimento'),
    ),
    hypothesisOf(
      'onu-offline',
      ['estado-do-equipamento'],
      resolutionOf('onu-offline', 'abrir-ordem-corretiva', 'suporte-n2'),
    ),
  ];
}

/** A valid aggregate around the given hypotheses — the shape the parser has already admitted. */
function caseWith(hypotheses: readonly Hypothesis[]): Case {
  return {
    slug: 'cliente-sem-internet',
    title: 'Cliente sem internet',
    when_to_use: 'cliente relata ausência total de conexão',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'contrato',
    fallback: FALLBACK,
    hypotheses,
  };
}

/** The worked example whole: the pinned case both scenarios resolve over. */
function workedCase(): Case {
  return caseWith(workedHypotheses());
}

// ---------------------------------------------------------------- the collection plan

it("answers the deduplicated union of every hypothesis's collects, each concept once", () => {
  const overlapping = caseWith([
    collectingHypothesis('incidente-regional', ['incidentes-na-regiao']),
    collectingHypothesis('ordem-em-andamento', ['ordens-em-andamento', 'incidentes-na-regiao']),
    collectingHypothesis('bloqueio-financeiro', ['situacao-financeira', 'ordens-em-andamento']),
  ]);

  const plan = collectionPlan(overlapping);

  expect(plan).toEqual(['incidentes-na-regiao', 'ordens-em-andamento', 'situacao-financeira']);
});

it('lists each concept where the declared order first names it', () => {
  // The first hypothesis's own collects are deliberately not alphabetical,
  // so a sorted plan and a last-appearance plan both fail here.
  const overlapping = caseWith([
    collectingHypothesis('ordem-em-andamento', ['ordens-em-andamento', 'incidentes-na-regiao']),
    collectingHypothesis('bloqueio-financeiro', ['incidentes-na-regiao', 'situacao-financeira']),
  ]);

  const plan = collectionPlan(overlapping);

  expect(plan).toEqual(['ordens-em-andamento', 'incidentes-na-regiao', 'situacao-financeira']);
});

it('answers a concept one hypothesis collects twice exactly once', () => {
  const repeating = caseWith([
    collectingHypothesis('incidente-regional', ['incidentes-na-regiao', 'incidentes-na-regiao']),
  ]);

  const plan = collectionPlan(repeating);

  expect(plan).toEqual(['incidentes-na-regiao']);
});

// ---------------------------------------------------------------- requires-evaluation-of

it('demands one evaluation per declared hypothesis, named and ordered as the case declares them', () => {
  const theCase = workedCase();

  const demanded = requiresEvaluationOf(theCase);

  expect(demanded).toEqual(DECLARED_PRECEDENCE);
});

it('demands exactly the one hypothesis of a single-hypothesis case', () => {
  const single = caseWith([collectingHypothesis('onu-offline', ['estado-do-equipamento'])]);

  const demanded = requiresEvaluationOf(single);

  expect(demanded).toEqual(['onu-offline']);
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

it('follows the declared order alone, so reversing the declaration flips which confirmed hypothesis determines', () => {
  // Both confirmed; the verdicts record deliberately lists onu-offline
  // first and the names' alphabetical order puts incidente-regional first,
  // so a resolver following either of those orders fails on one of the two
  // declarations below.
  const regional = hypothesisOf(
    'incidente-regional',
    ['incidentes-na-regiao'],
    resolutionOf('incidente-regional', 'informar-prazo', 'atendimento'),
  );
  const onu = hypothesisOf(
    'onu-offline',
    ['estado-do-equipamento'],
    resolutionOf('onu-offline', 'abrir-ordem-corretiva', 'suporte-n2'),
  );
  const bothConfirmed: Verdicts = { 'onu-offline': 'confirmed', 'incidente-regional': 'confirmed' };

  const declaredRegionalFirst = resolveOutcome(caseWith([regional, onu]), bothConfirmed);
  const declaredOnuFirst = resolveOutcome(caseWith([onu, regional]), bothConfirmed);

  expect(declaredRegionalFirst.determining).toBe('incidente-regional');
  expect(declaredOnuFirst.determining).toBe('onu-offline');
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

it('falls back over a single-hypothesis case whose one claim is refuted', () => {
  const single = caseWith([collectingHypothesis('onu-offline', ['estado-do-equipamento'])]);

  const resolved = resolveOutcome(single, { 'onu-offline': 'refuted' });

  expect(resolved).toEqual({
    outcome: 'inconclusivo',
    referral: { action: 'escalar', recipient: 'suporte-n2' },
  });
});
