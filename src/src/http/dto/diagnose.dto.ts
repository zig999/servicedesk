import { z } from 'zod';

const subjectAttributeValueSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
});

const subjectSchema = z.object({
  type: z.string().min(1),
  attributes: z.array(subjectAttributeValueSchema).min(1),
});

const caseRefSchema = z.object({
  slug: z.string().min(1),
  version: z.int().positive(),
});

export const diagnoseRequestSchema = z.object({
  case: caseRefSchema,
  subject: subjectSchema,
  narrative: z.string().min(1),
  requester: z.string().min(1),
  ticket_ref: z.string().min(1).optional(),
});

export type DiagnoseRequestDto = z.infer<typeof diagnoseRequestSchema>;

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

export const diagnoseResponseSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
  determining_hypothesis: z.string().min(1).optional(),
  text: z.string().min(1),
});

export type DiagnoseResponseDto = z.infer<typeof diagnoseResponseSchema>;
