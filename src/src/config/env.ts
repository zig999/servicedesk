import { z } from 'zod';
import { InvalidEnvironmentError } from '../errors/invalid-environment.error.js';
import { CONSOLIDATION_REGISTERS } from '../investigation/consolidation-register.js';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  EVALUATOR_MODEL: z.string().min(1),
  EVALUATOR_MAX_TOKENS: z.coerce.number().int().positive().optional(),
  CONSOLIDATOR_MODEL: z.string().min(1),
  CONSOLIDATOR_MAX_TOKENS: z.coerce.number().int().positive(),
  POOL_SIZE: z.coerce.number().int().positive(),
  DEFAULT_CONSOLIDATION_REGISTER: z.enum(CONSOLIDATION_REGISTERS),
  PROMPT_VERSION: z.string().min(1),
  PAGINATION_DEFAULT_LIMIT: z.coerce.number().int().positive(),
  PAGINATION_MAX_LIMIT: z.coerce.number().int().positive(),
  DATABASE_POOL_MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),
  DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  DATABASE_POOL_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new InvalidEnvironmentError(issues);
  }
  return parsed.data;
}
