import { InvestigationAlreadyStoredError } from '../errors/investigation-already-stored.error.js';
import { InvestigationWriteDeadlineExceededError } from '../errors/investigation-write-deadline-exceeded.error.js';
import type { Assessment } from './assessment.js';
import { runInvestigationPipeline, type InvestigationPipelineOptions } from './investigation-pipeline.js';
import { buildInvestigation, type BuildInvestigationOptions } from './investigation-factory.js';
import type { IInvestigationStore } from './investigation-store.port.js';
import type { Investigation } from './investigation.js';
import type { Cost } from './cost.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';

const PERSISTENCE_STAGE_BUDGET_MS = 2_000;

const WRITE_TIMED_OUT = Symbol('investigation-write-timeout');

export type RunDiagnosisOptions = InvestigationPipelineOptions & {
  readonly id: string;

  readonly ticket_ref?: string;
  readonly narrative: string;
  readonly prompt_version: string;
  readonly model: string;
  readonly store: IInvestigationStore;
};

export async function runDiagnosis(options: RunDiagnosisOptions): Promise<Assessment> {
  const { evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);
  const investigation = await buildInvestigation(
    buildInvestigationOptions({ options, evidence, evaluations, assessment, cost, durations }),
  );
  await writeWithinDeadline({ store: options.store, investigation, now: options.now, deadline: options.deadline, durations });
  return investigation.assessment;
}

type BuildInvestigationArgs = {
  readonly options: RunDiagnosisOptions;
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
  readonly assessment: Assessment;

  readonly cost: Cost;

  readonly durations: Durations;
};

function buildInvestigationOptions(args: BuildInvestigationArgs): BuildInvestigationOptions {
  const { options, evidence, evaluations, assessment, cost, durations } = args;
  return {
    id: options.id,
    requester: options.requester,
    ticket_ref: options.ticket_ref,
    narrative: options.narrative,
    subjectType: options.subjectType,
    subjectAttributes: options.subjectAttributes,
    case: options.case,
    prompt_version: options.prompt_version,
    model: options.model,
    evidence,
    evaluations,
    assessment,
    cost,
    durations,
    written_at: new Date(options.now).toISOString(),
    glossary: options.glossary,
  };
}

type WriteWithinDeadlineArgs = {
  readonly store: IInvestigationStore;
  readonly investigation: Investigation;
  readonly now: number;
  readonly deadline: number;

  readonly durations: Durations;
};

async function writeWithinDeadline(args: WriteWithinDeadlineArgs): Promise<void> {
  const { store, investigation, now, deadline, durations } = args;
  const stageBoundMs = persistenceStageBoundMs(now, deadline, durations);
  const settled = stageBoundMs > 0 && (await persistWithinBound(store, investigation, stageBoundMs));
  if (!settled) {
    throw new InvestigationWriteDeadlineExceededError(investigation.id, stageBoundMs);
  }
}

function persistenceStageBoundMs(now: number, deadline: number, durations: Durations): number {
  const elapsedBeforePersistenceMs = durations.collection + durations.judgment + durations.writing;
  return Math.min(PERSISTENCE_STAGE_BUDGET_MS, Math.max(0, deadline - now - elapsedBeforePersistenceMs));
}

async function persistWithinBound(store: IInvestigationStore, investigation: Investigation, stageBoundMs: number): Promise<boolean> {
  const timeout = stageTimeout(stageBoundMs);
  try {
    const first = await raceWriteAttempt(store.write(investigation), timeout.promise);
    if (first !== 'failed') {
      return first === 'settled';
    }
    const retry = await raceWriteAttempt(store.write(investigation), timeout.promise);
    return retry === 'settled';
  } finally {
    timeout.cancel();
  }
}

type WriteAttemptOutcome = 'settled' | 'failed' | typeof WRITE_TIMED_OUT;

function raceWriteAttempt(write: Promise<void>, timeout: Promise<typeof WRITE_TIMED_OUT>): Promise<WriteAttemptOutcome> {
  const settlement = write.then(
    (): WriteAttemptOutcome => 'settled',
    (error: unknown): WriteAttemptOutcome => (error instanceof InvestigationAlreadyStoredError ? 'settled' : 'failed'),
  );
  return Promise.race([settlement, timeout]);
}

type StageTimeout = {
  readonly promise: Promise<typeof WRITE_TIMED_OUT>;
  readonly cancel: () => void;
};

function stageTimeout(boundMs: number): StageTimeout {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const promise = new Promise<typeof WRITE_TIMED_OUT>((resolve) => {
    timerId = setTimeout(() => resolve(WRITE_TIMED_OUT), boundMs);
  });
  return { promise, cancel: () => clearTimeout(timerId) };
}
