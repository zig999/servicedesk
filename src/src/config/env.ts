// Boundary parsing for this process's own environment (STK-08 — "Boundary
// input — HTTP bodies, tool arguments and environment — is parsed by a Zod
// schema"): every value the diagnose HTTP surface needs at startup is read
// once here, so a missing or malformed value fails loudly before the server
// ever listens rather than surfacing later as an unexplained crash mid-request.
// Declares no data-directory variable for the case, glossary,
// capability-registry or investigation store
// (task/service-on-the-database/store-wiring): each of the four now answers
// from the one DATABASE_URL connection below, built once and threaded
// through every factory that used to receive a directory of its own — no
// data path for any of those four is written in source or read from this
// schema. Carries no credential of any kind — both Anthropic-backed adapters
// already resolve ANTHROPIC_API_KEY from the environment on their own
// (STK-11), and this module introduces no second place that reads it.
// Carries DATABASE_URL, the one URL this process reaches its database
// through (constraints/the-database-is-externally-provisioned — the
// database is provisioned outside the deployment and reached only through a
// connection URL supplied as configuration): this schema is the one place
// that URL is read, so no host, port, endpoint or credential for a database
// is written anywhere else in source. OBSERVATIONS_FIXTURE_FILE stays
// untouched: it backs FakeObservationSource, the stand-in for
// contracts/integration/corporate-records-source — a different capability
// this task's own scope does not reach.

import { z } from 'zod';
import { InvalidEnvironmentError } from '../errors/invalid-environment.error.js';
import { CONSOLIDATION_REGISTERS } from '../investigation/consolidation-register.js';

/** Every value this process's own startup needs, read from the environment exactly once. */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  OBSERVATIONS_FIXTURE_FILE: z.string().min(1),
  EVALUATOR_MODEL: z.string().min(1),
  EVALUATOR_MAX_TOKENS: z.coerce.number().int().positive().optional(),
  CONSOLIDATOR_MODEL: z.string().min(1),
  CONSOLIDATOR_MAX_TOKENS: z.coerce.number().int().positive(),
  POOL_SIZE: z.coerce.number().int().positive(),
  DEFAULT_CONSOLIDATION_REGISTER: z.enum(CONSOLIDATION_REGISTERS),
  PROMPT_VERSION: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parses the given environment (process.env by default) against envSchema
 * once, throwing InvalidEnvironmentError naming every violated field
 * together where any is missing or malformed, so this process fails at
 * startup rather than partway through its first request.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new InvalidEnvironmentError(issues);
  }
  return parsed.data;
}
