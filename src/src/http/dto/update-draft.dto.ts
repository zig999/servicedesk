import { z } from 'zod';
import { CONSOLIDATION_REGISTERS } from '../../investigation/consolidation-register.js';

export const updateDraftParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type UpdateDraftParamsDto = z.infer<typeof updateDraftParamsSchema>;

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

export const updateDraftBodySchema = z.object({
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
});

export type UpdateDraftBodyDto = z.infer<typeof updateDraftBodySchema>;
