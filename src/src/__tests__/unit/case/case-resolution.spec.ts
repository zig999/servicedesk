import { expect, it } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { Verdicts } from '../../../case/case-resolution.js';
import {
  collectionPlan,
  requiresEvaluationOf,
  resolveOutcome,
} from '../../../case/case-resolution.js';

const DECLARED_PRECEDENCE = [
  'incidente-regional',
  'ordem-em-andamento',
  'bloqueio-financeiro',
  'onu-offline',
];

const UNCONSULTED_CRITERION = 'prose the resolution operations never read';

const FALLBACK: Resolution = {
  outcome: 'inconclusivo',
  referral: { action: 'escalar', recipient: 'suporte-n2' },
};

function resolutionOf(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

const DECLARED_POSITIONS: Readonly<Record<string, number>> = {
  'incidente-regional': 1,
  'ordem-em-andamento': 2,
  'bloqueio-financeiro': 3,
  'onu-offline': 4,
};

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

function collectingEntry(name: string, collects: readonly string[]): ManifestEntry {
  return manifestEntryOf(name, collects, resolutionOf(name, 'informar-prazo', 'atendimento'));
}

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

function regionalAndOnuOfflineConfirmedVerdicts(): Verdicts {
  return {
    'incidente-regional': 'confirmed',
    'ordem-em-andamento': 'refuted',
    'bloqueio-financeiro': 'refuted',
    'onu-offline': 'confirmed',
  };
}

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

function workedCase(): Case {
  return caseWith(workedManifest());
}

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

  const overlapping = caseWith([
    collectingEntry('ordem-em-andamento', ['ordens-em-andamento', 'incidentes-na-regiao']),
    collectingEntry('bloqueio-financeiro', ['incidentes-na-regiao', 'situacao-financeira']),
  ]);

  const plan = collectionPlan(overlapping);

  expect(plan).toEqual(['ordens-em-andamento', 'incidentes-na-regiao', 'situacao-financeira']);
});

it("orders and dedupes the collection plan by each manifest entry's own declared position, never by the array's own arrangement", () => {

  const scrambled = caseWith([
    collectingEntry('bloqueio-financeiro', ['situacao-financeira', 'incidentes-na-regiao']),
    collectingEntry('incidente-regional', ['incidentes-na-regiao']),
    collectingEntry('ordem-em-andamento', ['ordens-em-andamento']),
  ]);

  const plan = collectionPlan(scrambled);

  expect(plan).toEqual(['incidentes-na-regiao', 'ordens-em-andamento', 'situacao-financeira']);
});

it('demands one evaluation per declared hypothesis, named and ordered as the case declares them', () => {
  const theCase = workedCase();

  const demanded = requiresEvaluationOf(theCase);

  expect(demanded).toEqual(DECLARED_PRECEDENCE);
});

it('answers the first confirmed hypothesis in declared order with its outcome, its referral and its determining role', () => {

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

  const onlyOneAnswered: Verdicts = { 'bloqueio-financeiro': 'confirmed' };

  const resolved = resolveOutcome(workedCase(), onlyOneAnswered);

  expect(resolved).toEqual({
    outcome: 'bloqueio-financeiro',
    referral: { action: 'orientar-pagamento', recipient: 'atendimento' },
    determining: 'bloqueio-financeiro',
  });
});

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

  const noneConfirmed: Verdicts = {
    'incidente-regional': 'refuted',
    'ordem-em-andamento': 'inconclusive',
    'bloqueio-financeiro': 'refuted',
    'onu-offline': 'inconclusive',
  };

  const resolved = resolveOutcome(workedCase(), noneConfirmed);

  expect(resolved).not.toHaveProperty('determining');
});

