import { z } from 'zod';
import { CONSOLIDATION_REGISTERS } from '../../investigation/consolidation-register.js';

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

export const createDraftBodySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  authored_at: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
  source_version: z.number().int().positive().optional(),
});

export type CreateDraftBodyDto = z.infer<typeof createDraftBodySchema>;
