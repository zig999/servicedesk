import { z } from "zod";

export const CONSOLIDATION_REGISTERS = ["formal", "plain"] as const;

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

export const caseVersionFormSchema = z.object({
  title: z.string().min(1),
  when_to_use: z.string().min(1),
  subject: z.string().min(1),
  fallback: resolutionSchema,
  consolidation_register: z.enum(CONSOLIDATION_REGISTERS).optional(),
});

export type CaseVersionFormValues = z.infer<typeof caseVersionFormSchema>;
