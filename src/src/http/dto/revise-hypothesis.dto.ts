import { z } from 'zod';

export const reviseHypothesisParamsSchema = z.object({
  slug: z.string().min(1),
});

export type ReviseHypothesisParamsDto = z.infer<typeof reviseHypothesisParamsSchema>;

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

export const reviseHypothesisBodySchema = z.object({
  hypothesis_name: z.string().min(1),
  criterion: z.string().min(1),
  collects: z.array(z.string().min(1)).readonly(),
  resolution: resolutionSchema,
  subject: z.string().min(1),
});

export type ReviseHypothesisBodyDto = z.infer<typeof reviseHypothesisBodySchema>;
