import { z } from 'zod';
import { CONSOLIDATION_REGISTERS } from '../../investigation/consolidation-register.js';

export const readCaseVersionParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type ReadCaseVersionParamsDto = z.infer<typeof readCaseVersionParamsSchema>;

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

export const readCaseVersionResponseSchema = z.object({
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
});

export type ReadCaseVersionResponseDto = z.infer<typeof readCaseVersionResponseSchema>;
