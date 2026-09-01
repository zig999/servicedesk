import { z } from 'zod';
import { CASE_VERSION_STATES } from '../../case/case.js';
import { CONSOLIDATION_REGISTERS } from '../../investigation/consolidation-register.js';

export const readCaseParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type ReadCaseParamsDto = z.infer<typeof readCaseParamsSchema>;

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

const hypothesisIdentitySchema = z.object({
  name: z.string().min(1),
});

const hypothesisRevisionSchema = z.object({
  hypothesis: hypothesisIdentitySchema,
  revision: z.int(),
  criterion: z.string().min(1),
  collects: z.array(z.string().min(1)).min(1).readonly(),
  resolution: resolutionSchema,
});

const manifestEntrySchema = z.object({
  position: z.int(),
  hypothesis_revision: hypothesisRevisionSchema,
});

export const readCaseResponseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  version: z.int().positive(),
  authored_at: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
  state: z.enum(CASE_VERSION_STATES),
  released_at: z.string().min(1).optional(),
  manifest: z.array(manifestEntrySchema).min(1).readonly(),
});

export type ReadCaseResponseDto = z.infer<typeof readCaseResponseSchema>;
