import { z } from "zod";

const referralSchema = z.object({
  action: z.string().min(1),
  recipient: z.string().min(1),
});

const resolutionSchema = z.object({
  outcome: z.string().min(1),
  referral: referralSchema,
});

export const hypothesisRevisionFormSchema = z.object({
  hypothesis_name: z.string().min(1),
  criterion: z.string().min(1),
  collects: z.array(z.string().min(1)).min(1),
  resolution: resolutionSchema,
});

export type HypothesisRevisionFormValues = z.infer<typeof hypothesisRevisionFormSchema>;
